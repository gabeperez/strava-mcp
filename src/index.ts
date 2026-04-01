import { Hono } from 'hono';
import { Env } from './types';
import { AuthHandler } from './auth';
import { AuthMiddleware } from './middleware';
import { getCookieValue, createCookie, generateState } from './session';
import { StravaApiHandlers } from './api';
import { SportsMCPServer, handleMCPOverSSE } from './mcp-server';
import { TemplateEngine, LANDING_TEMPLATE, DASHBOARD_TEMPLATE } from './templates';
import { ABOUT_TEMPLATE, SUPPORT_TEMPLATE, PRIVACY_TEMPLATE, TERMS_TEMPLATE } from './legal-templates';
import { StravaWebhookHandler } from './webhook';
import { sendNotification, sendNotificationToAll, NotificationConfig, NotificationProvider, PROVIDER_INFO, maskKey } from './notifications';

/** Map of agent slug → { regex to match User-Agent, display name } */
const AGENT_DEFS: { slug: string; re: RegExp; name: string }[] = [
  { slug: 'claude',   re: /claude|mcp-remote/i, name: 'Claude Desktop' },
  { slug: 'cursor',   re: /cursor/i,            name: 'Cursor' },
  { slug: 'windsurf', re: /windsurf/i,          name: 'Windsurf' },
  { slug: 'cline',    re: /cline/i,             name: 'Cline' },
  { slug: 'continue', re: /continue/i,          name: 'Continue.dev' },
  { slug: 'manus',    re: /manus/i,             name: 'Manus' },
  { slug: 'openclaw', re: /openclaw/i,          name: 'OpenClaw' },
];

function detectAgentFromUA(ua: string): string | null {
  for (const def of AGENT_DEFS) {
    if (def.re.test(ua)) return def.slug;
  }
  return null;
}

function agentDisplayName(slug: string): string {
  return AGENT_DEFS.find(d => d.slug === slug)?.name || slug;
}

function formatTimeAgo(ts: number): string {
  const diffMs = Date.now() - ts;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 2) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDay}d ago`;
}

const app = new Hono<{ Bindings: Env }>();

// Initialize template engine
const templates = new TemplateEngine();
templates.loadTemplate('landing', LANDING_TEMPLATE);
templates.loadTemplate('dashboard', DASHBOARD_TEMPLATE);
templates.loadTemplate('about', ABOUT_TEMPLATE);
templates.loadTemplate('support', SUPPORT_TEMPLATE);
templates.loadTemplate('privacy', PRIVACY_TEMPLATE);
templates.loadTemplate('terms', TERMS_TEMPLATE);

// CORS middleware for all routes
app.use('*', async (c, next) => {
  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return c.json({}, 200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    });
  }

  await next();

  // Add CORS headers to response
  c.res.headers.set('Access-Control-Allow-Origin', '*');
  c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  c.res.headers.set('Access-Control-Allow-Credentials', 'true');
});

// Helper function to get current origin
function getCurrentDomain(c: any): string {
  try {
    return new URL(c.req.url).origin;
  } catch {
    // Fallback: derive from the registered redirect URI env var
    const redirectUri: string = (c.env as any)?.STRAVA_REDIRECT_URI || '';
    if (redirectUri) {
      return redirectUri.replace(/\/callback$/, '');
    }
    return 'https://your-worker.workers.dev';
  }
}


// Root endpoint - Serve landing page
app.get('/', (c) => {
  const acceptHeader = c.req.header('Accept');
  const currentDomain = getCurrentDomain(c);
  
  // If requesting JSON (for API or MCP clients), return server info
  if (acceptHeader?.includes('application/json')) {
    return c.json({
      name: 'SportsMCP',
      version: '1.0.0',
      description: 'Model Context Protocol server for Strava API with OAuth authentication',
      protocol: 'mcp',
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {
          listChanged: false
        }
      },
      serverInfo: {
        name: 'SportsMCP',
        version: '1.0.0'
      },
      endpoints: {
        auth: '/auth',
        callback: '/callback', 
        status: '/status',
        logout: '/logout',
        mcp: '/mcp'
      },
      authentication: {
        type: 'oauth2',
        url: `${currentDomain}/auth`,
        required: true
      },
      transport: 'https',
      mcpEndpoint: `${currentDomain}/mcp`
    });
  }
  
  // Otherwise, serve the beautiful landing page
  const html = templates.render('landing', { base_url: currentDomain });
  return c.html(html);
});

// Authentication endpoints
app.get('/auth', async (c) => {
  const authHandler = new AuthHandler(c.env);
  return authHandler.initiateAuth(c);
});

app.get('/callback', async (c) => {
  const authHandler = new AuthHandler(c.env);
  return authHandler.handleCallback(c);
});

app.get('/status', async (c) => {
  const authHandler = new AuthHandler(c.env);
  return authHandler.getStatus(c);
});

app.post('/logout', async (c) => {
  const authHandler = new AuthHandler(c.env);
  return authHandler.logout(c);
});

// ---------------------------------------------------------------------------
// MCP OAuth 2.1 Discovery endpoints
// Allows MCP clients to authenticate via Strava without manual token copying
// ---------------------------------------------------------------------------

// PKCE verification helper
async function verifyPKCE(codeVerifier: string, codeChallenge: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const base64url = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return base64url === codeChallenge;
}

// OAuth Authorization Server Metadata (RFC 8414 / MCP spec)
app.get('/.well-known/oauth-authorization-server', (c) => {
  const issuer = getCurrentDomain(c);
  return c.json({
    issuer,
    authorization_endpoint: `${issuer}/oauth/authorize`,
    token_endpoint: `${issuer}/oauth/token`,
    registration_endpoint: `${issuer}/oauth/register`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    scopes_supported: ['strava'],
  });
});

// Dynamic Client Registration (MCP spec requires this for public clients)
app.post('/oauth/register', async (c) => {
  try {
    const body = await c.req.json();
    // MCP clients register dynamically — we accept any client and return an ID
    const clientId = crypto.randomUUID();
    const env = c.env as Env;

    await env.STRAVA_SESSIONS.put(`oauth_client:${clientId}`, JSON.stringify({
      client_name: body.client_name || 'MCP Client',
      redirect_uris: body.redirect_uris || [],
      created_at: Math.floor(Date.now() / 1000),
    }), { expirationTtl: 365 * 24 * 60 * 60 }); // 1 year

    return c.json({
      client_id: clientId,
      client_name: body.client_name || 'MCP Client',
      redirect_uris: body.redirect_uris || [],
      grant_types: ['authorization_code'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
    }, 201);
  } catch (error: any) {
    return c.json({ error: 'invalid_request', error_description: error.message }, 400);
  }
});

// OAuth Authorization Endpoint — wraps existing Strava OAuth flow
app.get('/oauth/authorize', async (c) => {
  const env = c.env as Env;
  const responseType = c.req.query('response_type');
  const clientId = c.req.query('client_id');
  const redirectUri = c.req.query('redirect_uri');
  const clientState = c.req.query('state') || '';
  const codeChallenge = c.req.query('code_challenge');
  const codeChallengeMethod = c.req.query('code_challenge_method');
  const scope = c.req.query('scope');

  // Validate required params
  if (responseType !== 'code') {
    return c.json({ error: 'unsupported_response_type' }, 400);
  }
  if (!redirectUri) {
    return c.json({ error: 'invalid_request', error_description: 'redirect_uri is required' }, 400);
  }
  if (!codeChallenge || codeChallengeMethod !== 'S256') {
    return c.json({ error: 'invalid_request', error_description: 'PKCE with S256 is required' }, 400);
  }

  // Generate internal state for the Strava OAuth flow
  const state = generateState();
  const currentDomain = getCurrentDomain(c);

  // Store MCP OAuth pending data
  await env.STRAVA_SESSIONS.put(`oauth_pending:${state}`, JSON.stringify({
    client_redirect_uri: redirectUri,
    client_state: clientState,
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod,
    client_id: clientId,
    created_at: Math.floor(Date.now() / 1000),
  }), { expirationTtl: 600 }); // 10 min

  // Store state for the existing callback handler, with mcp_oauth_state marker
  await env.STRAVA_SESSIONS.put(`state:${state}`, JSON.stringify({
    pending: true,
    sessionId: null,
    origin: currentDomain,
    created_at: Math.floor(Date.now() / 1000),
    mcp_oauth_state: state,
  }), { expirationTtl: 600 });

  // Redirect to Strava OAuth (same as /auth but with our state)
  const registeredRedirectUri = env.STRAVA_REDIRECT_URI || `${currentDomain}/callback`;
  const authUrl = new URL('https://www.strava.com/oauth/authorize');
  authUrl.searchParams.set('client_id', env.STRAVA_CLIENT_ID);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', registeredRedirectUri);
  authUrl.searchParams.set('approval_prompt', 'auto');
  authUrl.searchParams.set('scope', 'profile:read_all,activity:read_all,activity:read');
  authUrl.searchParams.set('state', state);

  return c.redirect(authUrl.toString());
});

// OAuth Token Endpoint — exchanges auth code for Bearer token
app.post('/oauth/token', async (c) => {
  const env = c.env as Env;

  // Support both form-urlencoded and JSON bodies
  let grantType: string | undefined;
  let code: string | undefined;
  let codeVerifier: string | undefined;
  let redirectUri: string | undefined;

  const contentType = c.req.header('Content-Type') || '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const body = await c.req.parseBody();
    grantType = body['grant_type'] as string;
    code = body['code'] as string;
    codeVerifier = body['code_verifier'] as string;
    redirectUri = body['redirect_uri'] as string;
  } else {
    const body = await c.req.json();
    grantType = body.grant_type;
    code = body.code;
    codeVerifier = body.code_verifier;
    redirectUri = body.redirect_uri;
  }

  if (grantType !== 'authorization_code') {
    return c.json({ error: 'unsupported_grant_type' }, 400);
  }
  if (!code || !codeVerifier) {
    return c.json({ error: 'invalid_request', error_description: 'code and code_verifier are required' }, 400);
  }

  // Look up the auth code
  const codeData = await env.STRAVA_SESSIONS.get(`oauth_code:${code}`);
  if (!codeData) {
    return c.json({ error: 'invalid_grant', error_description: 'Invalid or expired authorization code' }, 400);
  }

  const codeInfo = JSON.parse(codeData) as {
    athlete_id: number;
    code_challenge: string;
    code_challenge_method: string;
    client_redirect_uri: string;
    created_at: number;
  };

  // Verify PKCE
  const pkceValid = await verifyPKCE(codeVerifier, codeInfo.code_challenge);
  if (!pkceValid) {
    return c.json({ error: 'invalid_grant', error_description: 'PKCE verification failed' }, 400);
  }

  // Verify redirect_uri matches
  if (redirectUri && redirectUri !== codeInfo.client_redirect_uri) {
    return c.json({ error: 'invalid_grant', error_description: 'redirect_uri mismatch' }, 400);
  }

  // Delete the code (one-time use)
  await env.STRAVA_SESSIONS.delete(`oauth_code:${code}`);

  // Get the athlete's existing personal MCP token
  const mcpTokenData = await env.STRAVA_SESSIONS.get(`athlete_mcp_token:${codeInfo.athlete_id}`);
  let accessToken: string;

  if (mcpTokenData) {
    accessToken = JSON.parse(mcpTokenData).token;
  } else {
    // Edge case: generate a new token if none exists
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    accessToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    const mcpTokenTtl = 365 * 24 * 60 * 60;
    await env.STRAVA_SESSIONS.put(`personal_mcp:${accessToken}`, JSON.stringify({
      athlete_id: codeInfo.athlete_id,
      created_at: Math.floor(Date.now() / 1000),
      expires_at: Math.floor(Date.now() / 1000) + mcpTokenTtl,
    }), { expirationTtl: mcpTokenTtl });
    await env.STRAVA_SESSIONS.put(`athlete_mcp_token:${codeInfo.athlete_id}`, JSON.stringify({
      token: accessToken,
      created_at: Math.floor(Date.now() / 1000),
    }), { expirationTtl: mcpTokenTtl });
  }

  return c.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 31536000, // 1 year
    scope: 'strava',
  });
});

// ---------------------------------------------------------------------------
// SSE transport endpoint (legacy HTTP+SSE transport for Claude Desktop etc.)
// Clients GET /sse?token=xxx  → receive SSE stream + endpoint event
// Clients POST /messages?token=xxx → send JSON-RPC (handled below)
// ---------------------------------------------------------------------------
app.get('/sse', async (c) => {
  return handleMCPOverSSE(c);
});

// /messages — receives JSON-RPC from SSE-transport clients and responds directly.
// The SSE stream from /sse is used for server→client pushes; for simplicity in
// Cloudflare Workers (no persistent memory across requests) we respond inline here.
app.post('/messages', async (c) => {
  const env = c.env as Env;
  const mcpServer = new SportsMCPServer(env);

  try {
    const request = await c.req.json();
    let context: any = { baseUrl: getCurrentDomain(c) };

    const personalToken = c.req.query('token');
    if (personalToken) {
      const personalData = await env.STRAVA_SESSIONS.get(`personal_mcp:${personalToken}`);
      if (personalData) {
        const { athlete_id } = JSON.parse(personalData);
        const sessionManager = new (await import('./session')).KVSessionManager(env);
        const session = await sessionManager.getSession(athlete_id);
        if (session) {
          const now = Math.floor(Date.now() / 1000);
          if (session.expires_at <= now + 300) {
            const refreshed = await sessionManager.refreshToken(session);
            context.session = refreshed;
            context.token = refreshed.access_token;
          } else {
            context.session = session;
            context.token = session.access_token;
          }
        }
      }
    }

    const response = await mcpServer.handleMCPRequest(request, context);
    return c.json(response);
  } catch (error: any) {
    return c.json({
      jsonrpc: '2.0',
      error: { code: -32700, message: 'Parse error', data: { message: error.message } }
    }, 400);
  }
});

// Webhook endpoints
app.get('/webhook', async (c) => {
  const webhookHandler = new StravaWebhookHandler(c.env);
  return webhookHandler.handleVerification(c);
});

app.post('/webhook', async (c) => {
  const webhookHandler = new StravaWebhookHandler(c.env);
  return webhookHandler.handleEvent(c, c.executionCtx);
});

// Test endpoint for notifications (supports all providers)
// Kept as /test-poke for backward compat, also available at /test-notification
// ---- Helpers to load / persist the notification configs array ----
async function loadNotificationConfigs(env: Env, athleteId: number): Promise<NotificationConfig[]> {
  // 1. New multi-provider array
  const multiJson = await env.STRAVA_SESSIONS.get(`notification_configs:${athleteId}`);
  if (multiJson) {
    const parsed = JSON.parse(multiJson);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  }
  // 2. Single-config fallback
  const singleJson = await env.STRAVA_SESSIONS.get(`notification_config:${athleteId}`);
  if (singleJson) {
    const cfg = JSON.parse(singleJson) as NotificationConfig;
    return [cfg];
  }
  // 3. Legacy poke_key
  const pokeKey = await env.STRAVA_SESSIONS.get(`poke_key:${athleteId}`);
  if (pokeKey) return [{ provider: 'poke' as NotificationProvider, api_key: pokeKey }];
  return [];
}

async function saveNotificationConfigs(env: Env, athleteId: number, configs: NotificationConfig[]): Promise<void> {
  await env.STRAVA_SESSIONS.put(`notification_configs:${athleteId}`, JSON.stringify(configs));
  // Keep legacy keys in sync for backward compat
  const pokeConfig = configs.find(c => c.provider === 'poke');
  if (pokeConfig) {
    await env.STRAVA_SESSIONS.put(`poke_key:${athleteId}`, pokeConfig.api_key);
  } else {
    await env.STRAVA_SESSIONS.delete(`poke_key:${athleteId}`);
  }
  // Keep single-config in sync (first entry) for backward compat
  if (configs.length > 0) {
    await env.STRAVA_SESSIONS.put(`notification_config:${athleteId}`, JSON.stringify(configs[0]));
  } else {
    await env.STRAVA_SESSIONS.delete(`notification_config:${athleteId}`);
  }
}

// ---- Test notification endpoint ----
async function handleTestNotification(c: any) {
  try {
    const notificationConfigs: NotificationConfig[] = [];
    let accessToken: string | null = null;
    let athleteFirstName = 'athlete';

    const token = c.req.query('token');
    if (token) {
      const personalData = await c.env.STRAVA_SESSIONS.get(`personal_mcp:${token}`);
      if (personalData) {
        const { athlete_id } = JSON.parse(personalData);
        notificationConfigs.push(...await loadNotificationConfigs(c.env, athlete_id));

        const sessionData = await c.env.STRAVA_SESSIONS.get(`user:${athlete_id}`);
        if (sessionData) {
          const session = JSON.parse(sessionData);
          accessToken = session.access_token || null;
          athleteFirstName = session.athlete?.firstname || 'athlete';
        }
      }
    }
    if (notificationConfigs.length === 0 && c.env.POKE_API_KEY) {
      notificationConfigs.push({ provider: 'poke', api_key: c.env.POKE_API_KEY });
    }

    if (notificationConfigs.length === 0) {
      return c.json({ error: 'No notification provider configured. Add your key first.' }, 400);
    }

    const now = new Date().toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });

    // Fetch the athlete's actual most recent Strava activity
    let recentActivityBlock = '';
    if (accessToken) {
      try {
        const actRes = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=1', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (actRes.ok) {
          const activities = await actRes.json() as any[];
          if (activities && activities.length > 0) {
            const act = activities[0];
            const lines: string[] = [];
            lines.push(`**${act.name}**`);
            lines.push(`Type: ${act.sport_type || act.type}`);
            if (act.start_date_local) {
              lines.push(`Date: ${new Date(act.start_date_local).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`);
            }
            if (act.distance) {
              const km = (act.distance / 1000).toFixed(2);
              const mi = (act.distance / 1609.344).toFixed(2);
              lines.push(`Distance: ${km} km (${mi} mi)`);
            }
            if (act.moving_time) {
              const h = Math.floor(act.moving_time / 3600);
              const m = Math.floor((act.moving_time % 3600) / 60);
              const s = act.moving_time % 60;
              lines.push(`Duration: ${h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`}`);
            }
            if (act.distance && act.moving_time) {
              const paceSecPerKm = act.moving_time / (act.distance / 1000);
              const pm = Math.floor(paceSecPerKm / 60);
              const ps = Math.round(paceSecPerKm % 60);
              lines.push(`Pace: ${pm}:${ps.toString().padStart(2, '0')} /km`);
            }
            if (act.total_elevation_gain) {
              lines.push(`Elevation: ${Math.round(act.total_elevation_gain)}m`);
            }
            if (act.average_heartrate) {
              lines.push(`Avg HR: ${Math.round(act.average_heartrate)} bpm`);
            }
            if (act.average_watts) {
              lines.push(`Avg Power: ${Math.round(act.average_watts)}W`);
            }
            if (act.pr_count && act.pr_count > 0) {
              lines.push(`🏆 ${act.pr_count} PR${act.pr_count > 1 ? 's' : ''}!`);
            }
            recentActivityBlock = `\n\nHere is ${athleteFirstName}'s most recent Strava workout:\n\n${lines.join('\n')}\n\nPlease reply acknowledging this test ping from SportsMCP and confirm you can see the workout data above.`;
          }
        }
      } catch (_) {
        // Silently skip if activity fetch fails
      }
    }

    const providerNames = notificationConfigs.map(c => PROVIDER_INFO[c.provider]?.name || c.provider);
    const fallback = `\n\nSportsMCP gives your AI access to your full Strava history: recent activities, lap splits, heart rate zones, segment efforts, gear mileage, clubs, and more.\n\nPlease reply to confirm you received this and that the SportsMCP + Strava connection is active on your end.`;
    const testMessage = `👋 Test ping from SportsMCP — your Strava data is now connected to your AI assistant.${recentActivityBlock || fallback}

— Sent ${now}`;

    const results = await sendNotificationToAll(testMessage, notificationConfigs);
    const successes = results.filter(r => r.result.success);
    const failures = results.filter(r => !r.result.success);

    if (successes.length === 0) {
      return c.json({
        success: false,
        error: failures.map(f => `${f.provider}: ${f.result.error}`).join('; '),
      }, 502);
    }

    const successNames = successes.map(s => PROVIDER_INFO[s.provider]?.name || s.provider).join(', ');
    const msg = failures.length > 0
      ? `Test ping sent via ${successNames}! (${failures.length} failed) 📱`
      : `Test ping sent via ${successNames}! Check your messages 📱`;

    return c.json({
      success: true,
      message: msg,
      providers: results.map(r => ({ provider: r.provider, success: r.result.success, error: r.result.error })),
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
}

app.post('/test-poke', handleTestNotification);
app.post('/test-notification', handleTestNotification);

// ---- GET notification config ----
async function handleGetNotificationConfig(c: any) {
  try {
    const token = c.req.query('token');
    if (!token) return c.json({ error: 'token required' }, 400);

    const personalData = await c.env.STRAVA_SESSIONS.get(`personal_mcp:${token}`);
    if (!personalData) return c.json({ error: 'Invalid token' }, 401);

    const { athlete_id } = JSON.parse(personalData);
    const configs = await loadNotificationConfigs(c.env, athlete_id);

    if (configs.length === 0) return c.json({ hasKey: false, providers: [] });

    return c.json({
      hasKey: true,
      providers: configs.map(cfg => ({
        provider: cfg.provider,
        maskedKey: maskKey(cfg.api_key),
        hasEndpoint: !!cfg.endpoint,
        providerName: PROVIDER_INFO[cfg.provider]?.name || cfg.provider,
      })),
      // Backward compat: first provider
      provider: configs[0].provider,
      maskedKey: maskKey(configs[0].api_key),
      providerName: PROVIDER_INFO[configs[0].provider]?.name || configs[0].provider,
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
}

app.get('/settings/poke-key', handleGetNotificationConfig);
app.get('/settings/notification-config', handleGetNotificationConfig);

// ---- DELETE notification config ----
// Body: { token, provider? } — if provider given, remove just that one; otherwise remove all
async function handleDeleteNotificationConfig(c: any) {
  try {
    const body = await c.req.json() as { token: string; provider?: NotificationProvider };
    if (!body.token) return c.json({ error: 'token required' }, 400);

    const personalData = await c.env.STRAVA_SESSIONS.get(`personal_mcp:${body.token}`);
    if (!personalData) return c.json({ error: 'Invalid token' }, 401);

    const { athlete_id } = JSON.parse(personalData);

    if (body.provider) {
      // Remove just this provider from the array
      const configs = await loadNotificationConfigs(c.env, athlete_id);
      const filtered = configs.filter(cfg => cfg.provider !== body.provider);
      await saveNotificationConfigs(c.env, athlete_id, filtered);
      return c.json({ success: true, remaining: filtered.length });
    } else {
      // Remove everything
      await c.env.STRAVA_SESSIONS.delete(`notification_configs:${athlete_id}`);
      await c.env.STRAVA_SESSIONS.delete(`notification_config:${athlete_id}`);
      await c.env.STRAVA_SESSIONS.delete(`poke_key:${athlete_id}`);
      return c.json({ success: true, remaining: 0 });
    }
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
}

app.delete('/settings/poke-key', handleDeleteNotificationConfig);
app.delete('/settings/notification-config', handleDeleteNotificationConfig);

// Legal and informational pages  
app.get('/about', (c) => {
  const html = templates.render('about', { base_url: getCurrentDomain(c) });
  return c.html(html);
});

app.get('/support', (c) => {
  const html = templates.render('support', { base_url: getCurrentDomain(c) });
  return c.html(html);
});

app.get('/privacy', (c) => {
  const html = templates.render('privacy', { base_url: getCurrentDomain(c) });
  return c.html(html);
});

app.get('/terms', (c) => {
  const html = templates.render('terms', { base_url: getCurrentDomain(c) });
  return c.html(html);
});

// ---- POST: Add / update a provider in the configs array ----
// POST body: { token, provider?, poke_api_key OR api_key, endpoint? }
// Adds to the array; if the same provider already exists, it's updated.
async function handleSaveNotificationConfig(c: any) {
  try {
    const body = await c.req.json() as {
      token: string;
      provider?: NotificationProvider;
      api_key?: string;
      poke_api_key?: string;
      endpoint?: string;
    };
    const token = body.token;
    const provider: NotificationProvider = body.provider || 'poke';
    const apiKey = (body.api_key || body.poke_api_key || '').trim();
    const endpoint = body.endpoint?.trim();

    if (!token || !apiKey) {
      return c.json({ error: 'token and api_key are required' }, 400);
    }
    if (!PROVIDER_INFO[provider]) {
      return c.json({ error: `Unknown provider: ${provider}. Supported: ${Object.keys(PROVIDER_INFO).join(', ')}` }, 400);
    }
    if (provider === 'openclaw' && !endpoint) {
      return c.json({ error: 'OpenClaw requires a gateway endpoint URL' }, 400);
    }

    const personalData = await c.env.STRAVA_SESSIONS.get(`personal_mcp:${token}`);
    if (!personalData) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }
    const { athlete_id } = JSON.parse(personalData);

    // Load existing configs, upsert this provider
    const configs = await loadNotificationConfigs(c.env, athlete_id);
    const newConfig: NotificationConfig = { provider, api_key: apiKey };
    if (endpoint) newConfig.endpoint = endpoint;

    const idx = configs.findIndex(cfg => cfg.provider === provider);
    if (idx >= 0) {
      configs[idx] = newConfig; // update existing
    } else {
      configs.push(newConfig); // add new
    }

    await saveNotificationConfigs(c.env, athlete_id, configs);

    return c.json({
      success: true,
      provider,
      totalProviders: configs.length,
      providers: configs.map(cfg => cfg.provider),
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
}

app.post('/settings/poke-key', handleSaveNotificationConfig);
app.post('/settings/notification-config', handleSaveNotificationConfig);

// Dashboard backward-compat: /dashboard?token=xxx → redirect to /dashboard/{athleteId}
app.get('/dashboard', async (c) => {
  const token = c.req.query('token');
  if (!token) {
    // No token — check cookie
    const cookieAthleteId = getCookieValue(c.req.raw, 'sid');
    if (cookieAthleteId) {
      return c.redirect(`/dashboard/${cookieAthleteId}`);
    }
    return c.redirect('/auth');
  }

  try {
    const personalData = await c.env.STRAVA_SESSIONS.get(`personal_mcp:${token}`);
    if (!personalData) {
      return c.redirect('/auth');
    }
    const { athlete_id } = JSON.parse(personalData);

    // Set cookie if not already present, then redirect
    const existingCookie = getCookieValue(c.req.raw, 'sid');
    if (!existingCookie || existingCookie !== String(athlete_id)) {
      const cookie = createCookie('sid', String(athlete_id), 30 * 24 * 60 * 60);
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `/dashboard/${athlete_id}`,
          'Set-Cookie': cookie,
        },
      });
    }
    return c.redirect(`/dashboard/${athlete_id}`);
  } catch (error) {
    console.error('Dashboard redirect error:', error);
    return c.redirect('/auth');
  }
});

// Dashboard endpoint (cookie-based auth, no token in URL)
app.get('/dashboard/:athleteId', async (c) => {
  const urlAthleteId = c.req.param('athleteId');

  // Authenticate via cookie
  const cookieAthleteId = getCookieValue(c.req.raw, 'sid');
  if (!cookieAthleteId) {
    return c.redirect('/auth');
  }

  // Verify the cookie matches the URL (prevent viewing other users' dashboards)
  if (cookieAthleteId !== urlAthleteId) {
    return c.redirect(`/dashboard/${cookieAthleteId}`);
  }

  const athlete_id = parseInt(urlAthleteId);
  if (isNaN(athlete_id)) {
    return c.redirect('/auth');
  }

  try {
    const sessionManager = new (await import('./session')).KVSessionManager(c.env);
    const session = await sessionManager.getSession(athlete_id);

    if (!session) {
      return c.redirect('/auth');
    }

    // Retrieve the personal MCP token via reverse lookup
    const mcpTokenData = await c.env.STRAVA_SESSIONS.get(`athlete_mcp_token:${athlete_id}`);
    const token = mcpTokenData ? JSON.parse(mcpTokenData).token : null;

    // Fetch user's Strava data + agent connection info in parallel
    const agentSlugs = AGENT_DEFS.map(d => d.slug);
    const [profileResponse, statsResponse, activitiesResponse, lastConnRaw, ...perAgentRaws] = await Promise.all([
      fetch('https://www.strava.com/api/v3/athlete', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      }),
      fetch('https://www.strava.com/api/v3/athletes/' + athlete_id + '/stats', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      }),
      fetch('https://www.strava.com/api/v3/athlete/activities?per_page=7', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      }),
      c.env.STRAVA_SESSIONS.get(`agent_lastconn:${athlete_id}`),
      ...agentSlugs.map(slug => c.env.STRAVA_SESSIONS.get(`agent_perconn:${athlete_id}:${slug}`))
    ]);

    // Load all configured notification providers
    const activeConfigs = await loadNotificationConfigs(c.env, athlete_id);

    // Parse global last-connection info
    let lastConnDisplay = '';
    let lastConnAgent = '';
    let lastConnCount = 0;
    if (lastConnRaw) {
      try {
        const lc = JSON.parse(lastConnRaw as string);
        lastConnCount = lc.count || 0;
        const ua: string = lc.ua || '';
        const slug = detectAgentFromUA(ua);
        lastConnAgent = slug ? agentDisplayName(slug) : (ua.split('/')[0] || 'Unknown client');
        lastConnDisplay = formatTimeAgo(lc.ts || 0);
      } catch (_) {}
    }

    // Parse per-agent connection data
    const perAgentData: Record<string, { ts: number; count: number; lastTool: string | null }> = {};
    agentSlugs.forEach((slug, i) => {
      const raw = perAgentRaws[i];
      if (raw) {
        try { perAgentData[slug] = JSON.parse(raw as string); } catch (_) {}
      }
    });

    const profile = await profileResponse.json();
    const stats = await statsResponse.json();
    const activities = await activitiesResponse.json();

    // Format activity data for template
    const activitiesArray = Array.isArray(activities) ? activities : [];
    const formattedActivities = activitiesArray.slice(0, 7).map((activity: any) => ({
      ...activity,
      distance: Math.round(activity.distance / 1000 * 10) / 10, // Convert to km with 1 decimal
      moving_time: Math.floor(activity.moving_time / 60) + 'min', // Convert to minutes
      start_date_local: new Date(activity.start_date_local).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      pace: activity.sport_type === 'Run' && activity.distance > 0 ?
        Math.floor(activity.moving_time / (activity.distance / 1000) / 60) + ':' +
        String(Math.floor(activity.moving_time / (activity.distance / 1000) % 60)).padStart(2, '0') + '/km' : null,
      speed: activity.sport_type === 'Ride' && activity.distance > 0 ?
        Math.round(activity.distance / 1000 / (activity.moving_time / 3600) * 10) / 10 + ' km/h' : null
    }));

    // Calculate insights
    const totalActivities = stats.recent_run_totals.count + stats.recent_ride_totals.count + (stats.recent_swim_totals?.count || 0);
    const avgDistance = totalActivities > 0 ?
      Math.round((stats.recent_run_totals.distance + stats.recent_ride_totals.distance) / totalActivities / 100) / 10 : 0;
    const totalElevation = stats.recent_run_totals.elevation_gain + stats.recent_ride_totals.elevation_gain;

    // Format profile data
    const formattedProfile = {
      ...profile,
      username: profile.username || 'Not set',
      location: profile.city && profile.state ? `${profile.city}, ${profile.state}` :
                profile.city ? profile.city :
                profile.country ? profile.country : 'Not set',
      created_date: profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      }) : 'Unknown'
    };

    // Calculate date range for "recent" stats (last 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const statsDateRange = fourWeeksAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' - ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const currentDomain = getCurrentDomain(c);

    // Prepare dashboard data
    const dashboardData = {
      profile: formattedProfile,
      stats,
      recent_activities: formattedActivities,
      mcp_url: token ? `${currentDomain}/mcp?token=${token}` : '',
      mcp_sse_url: token ? `${currentDomain}/sse?token=${token}` : '',
      mcp_base_url: `${currentDomain}/mcp`,
      mcp_sse_base_url: `${currentDomain}/sse`,
      mcp_bearer_token: token || '',
      created_at: new Date(session.created_at * 1000).toLocaleDateString(),
      last_refresh: new Date().toLocaleString(),
      total_time: Math.round((stats.recent_run_totals.moving_time + stats.recent_ride_totals.moving_time) / 3600) + 'h',
      total_distance: Math.round((stats.recent_run_totals.distance + stats.recent_ride_totals.distance) / 1000) + 'km',
      stats_date_range: statsDateRange,
      total_activities: totalActivities,
      avg_distance: avgDistance,
      total_elevation: Math.round(totalElevation),
      insights: {
        most_active_sport: stats.recent_run_totals.count > stats.recent_ride_totals.count ? 'Running' : 'Cycling',
        weekly_average: Math.round(totalActivities / 4 * 10) / 10,
        longest_activity: activitiesArray.length > 0 ? Math.round(Math.max(...activitiesArray.map((a: any) => a.distance)) / 1000 * 10) / 10 : 0
      },
      poke_key_saved: activeConfigs.length > 0,
      poke_masked_key: activeConfigs.length > 0 ? maskKey(activeConfigs[0].api_key) : '',
      poke_saved_class: activeConfigs.length > 0 ? '' : 'hidden',
      poke_form_class: activeConfigs.length > 0 ? 'hidden' : '',
      notification_provider: activeConfigs.length > 0 ? activeConfigs[0].provider : '',
      notification_provider_name: activeConfigs.length > 0
        ? activeConfigs.map(c => PROVIDER_INFO[c.provider]?.name || c.provider).join(', ')
        : '',
      active_providers_json: JSON.stringify(activeConfigs.map(c => c.provider)),
      providers_json: JSON.stringify(PROVIDER_INFO),
      agent_poke: activeConfigs.some(c => c.provider === 'poke'),
      mcp_token: token || '',
      last_conn_display: lastConnDisplay,
      last_conn_agent: lastConnAgent,
      last_conn_count: lastConnCount,
      last_conn_has_data: lastConnDisplay ? '' : 'hidden',
      last_conn_no_data: lastConnDisplay ? 'hidden' : '',
      // Per-agent connection data (auto-detected from actual MCP tool calls)
      ...Object.fromEntries(agentSlugs.flatMap(slug => {
        const data = perAgentData[slug];
        return [
          [`agent_${slug}_on`, data ? '' : 'hidden'],
          [`agent_${slug}_off`, data ? 'hidden' : ''],
          [`agent_${slug}_lastconn`, data ? formatTimeAgo(data.ts) : ''],
          [`agent_${slug}_count`, data ? String(data.count) : '0'],
          [`agent_${slug}_lasttool`, data?.lastTool || ''],
          [`agent_${slug}_lasttool_visible`, data?.lastTool ? '' : 'hidden'],
        ];
      })),
      agent_poke_on:      activeConfigs.some(c => c.provider === 'poke') ? '' : 'hidden',
      agent_poke_off:     activeConfigs.some(c => c.provider === 'poke') ? 'hidden' : ''
    };

    // Render the beautiful dashboard HTML
    const html = templates.render('dashboard', dashboardData);
    return c.html(html);

  } catch (error) {
    console.error('Dashboard error:', error);
    return c.redirect('/auth');
  }
});

// Helper: extract personal MCP token from Authorization header or query param
function getPersonalToken(c: any): string | null {
  // Prefer Authorization: Bearer header
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  // Fall back to query param
  return c.req.query('token') || null;
}

// MCP endpoint - handle both GET (info) and POST (JSON-RPC)
app.get('/mcp', async (c) => {
  // Check if there's a valid personal MCP token
  const personalToken = getPersonalToken(c);
  let isAuthenticated = false;

  if (personalToken) {
    try {
      const personalData = await c.env.STRAVA_SESSIONS.get(`personal_mcp:${personalToken}`);
      isAuthenticated = !!personalData;
    } catch (error) {
      console.error('Personal token validation error:', error);
    }
  }

  // If no valid auth, return 401 with OAuth discovery header (triggers MCP OAuth flow)
  if (!isAuthenticated) {
    const resourceMetadata = `${getCurrentDomain(c)}/.well-known/oauth-authorization-server`;
    return c.json({
      jsonrpc: '2.0',
      error: {
        code: -32001,
        message: 'Authentication required. Use OAuth to connect your Strava account.',
      }
    }, 401, {
      'WWW-Authenticate': `Bearer resource_metadata="${resourceMetadata}"`,
    });
  }

  // Return MCP server capabilities for GET requests
  return c.json({
    jsonrpc: '2.0',
    method: 'server/initialize',
    result: {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {
          listChanged: false
        }
      },
      serverInfo: {
        name: 'SportsMCP',
        version: '1.0.0'
      },
      authenticated: true,
    }
  });
});

// MCP JSON-RPC endpoint for direct calls
app.post('/mcp', async (c) => {
  const env = c.env as Env;
  const mcpServer = new SportsMCPServer(env);

  try {
    // Check for personal MCP token (header or query param)
    const personalToken = getPersonalToken(c);

    // If no auth credentials at all, return 401 to trigger OAuth discovery
    if (!personalToken) {
      const resourceMetadata = `${getCurrentDomain(c)}/.well-known/oauth-authorization-server`;
      return c.json({
        jsonrpc: '2.0',
        error: {
          code: -32001,
          message: 'Authentication required. Use OAuth to connect your Strava account.',
        }
      }, 401, {
        'WWW-Authenticate': `Bearer resource_metadata="${resourceMetadata}"`,
      });
    }

    const request = await c.req.json();

    // Try to get authentication context
    let context: any = {
      baseUrl: getCurrentDomain(c)
    };

    let authenticatedAthleteId = null;

    // Method 1: Personal MCP token (primary method)
    if (personalToken) {
      try {
        const personalData = await env.STRAVA_SESSIONS.get(`personal_mcp:${personalToken}`);
        if (personalData) {
          const tokenInfo = JSON.parse(personalData);
          authenticatedAthleteId = tokenInfo.athlete_id;

          // Log connection for "last seen" dashboard display (global + per-agent)
          try {
            const ua = c.req.header('User-Agent') || 'Unknown';
            const agentSlug = detectAgentFromUA(ua);
            const toolName = (request?.method === 'tools/call' && request?.params?.name) || null;

            // Global last-connection
            const connKey = `agent_lastconn:${authenticatedAthleteId}`;
            const existing = await env.STRAVA_SESSIONS.get(connKey);
            const prev = existing ? JSON.parse(existing) : { count: 0 };
            await env.STRAVA_SESSIONS.put(connKey, JSON.stringify({
              ts: Date.now(),
              ua,
              count: (prev.count || 0) + 1
            }), { expirationTtl: 60 * 60 * 24 * 30 });

            // Per-agent connection tracking
            if (agentSlug) {
              const perAgentKey = `agent_perconn:${authenticatedAthleteId}:${agentSlug}`;
              const perExisting = await env.STRAVA_SESSIONS.get(perAgentKey);
              const perPrev = perExisting ? JSON.parse(perExisting) : { count: 0 };
              await env.STRAVA_SESSIONS.put(perAgentKey, JSON.stringify({
                ts: Date.now(),
                count: (perPrev.count || 0) + 1,
                lastTool: toolName || perPrev.lastTool || null,
              }), { expirationTtl: 60 * 60 * 24 * 30 });
            }
          } catch (_) { /* non-blocking — ignore errors */ }
        }
      } catch (error) {
        console.error('Personal token validation error:', error);
      }
    }
    
    // Method 2: Fallback to device fingerprint (for compatibility)
    if (!authenticatedAthleteId) {
      const userAgent = c.req.header('User-Agent') || '';
      const acceptHeader = c.req.header('Accept') || '';
      
      const combined = `${userAgent}:${acceptHeader}`;
      const encoder = new TextEncoder();
      const bytes = encoder.encode(combined);
      const deviceFingerprint = btoa(String.fromCharCode(...bytes)).slice(0, 32);
      
      try {
        const deviceAuth = await env.STRAVA_SESSIONS.get(`device_auth:${deviceFingerprint}`);
        if (deviceAuth) {
          const deviceInfo = JSON.parse(deviceAuth);
          authenticatedAthleteId = deviceInfo.athlete_id;
        }
      } catch (error) {
        console.error('Device auth validation error:', error);
      }
    }
    
    // If we found an authenticated user, get their session
    if (authenticatedAthleteId) {
      try {
        const sessionManager = new (await import('./session')).KVSessionManager(env);
        const session = await sessionManager.getSession(authenticatedAthleteId);
        
        if (session) {
          // Check if token needs refresh
          const now = Math.floor(Date.now() / 1000);
          if (session.expires_at <= now + 300) { // Refresh 5 minutes before expiry
            try {
              const refreshedSession = await sessionManager.refreshToken(session);
              context.session = refreshedSession;
              context.token = refreshedSession.access_token;
            } catch (error) {
              console.error('Token refresh failed:', error);
            }
          } else {
            context.session = session;
            context.token = session.access_token;
          }
        }
      } catch (error) {
        console.error('Session retrieval error:', error);
      }
    }
    
    // Fall back to cookie-based authentication if no token
    if (!context.session) {
      const authMiddleware = new AuthMiddleware(env);
      
      try {
        const mockContext = {
          req: c.req,
          env: c.env,
          get: () => null,
          set: (key: string, value: any) => {
            if (key === 'session') context.session = value;
            if (key === 'token') context.token = value;
          },
          json: () => Promise.resolve({ error: 'Mock context' })
        };
        
        await authMiddleware.authenticate(mockContext as any, async () => {});
      } catch (error) {
        // Authentication failed - will be handled in tool calls
      }
    }
    
    const response = await mcpServer.handleMCPRequest(request, context);
    return c.json(response);
  } catch (error: any) {
    return c.json({
      jsonrpc: '2.0',
      error: {
        code: -32700,
        message: 'Parse error',
        data: { message: error.message }
      }
    }, 400);
  }
});

// Authentication middleware function
const authenticate = async (c: any, next: any) => {
  const authMiddleware = new AuthMiddleware(c.env);
  return await authMiddleware.authenticate(c, next);
};

// Protected API routes - require authentication
app.use('/api/*', authenticate);

// Athlete endpoints
app.get('/api/athlete/profile', StravaApiHandlers.getAthleteProfile);
app.get('/api/athlete/stats', StravaApiHandlers.getAthleteStats);
app.get('/api/athlete/zones', StravaApiHandlers.getAthleteZones);

// Activities endpoints
app.get('/api/activities/recent', StravaApiHandlers.getRecentActivities);
app.get('/api/activities/all', StravaApiHandlers.getAllActivities);
app.get('/api/activities/:id', StravaApiHandlers.getActivityDetails);
app.get('/api/activities/:id/streams', StravaApiHandlers.getActivityStreams);
app.get('/api/activities/:id/laps', StravaApiHandlers.getActivityLaps);

// Segments endpoints
app.get('/api/segments/starred', StravaApiHandlers.getStarredSegments);
app.get('/api/segments/explore', StravaApiHandlers.exploreSegments);
app.get('/api/segments/:id', StravaApiHandlers.getSegment);
app.post('/api/segments/:id/star', StravaApiHandlers.starSegment);
app.get('/api/segments/efforts/:id', StravaApiHandlers.getSegmentEffort);
app.get('/api/segments/:id/efforts', StravaApiHandlers.getSegmentEfforts);

// Routes endpoints
app.get('/api/routes', StravaApiHandlers.getAthleteRoutes);
app.get('/api/routes/:id', StravaApiHandlers.getRoute);
app.get('/api/routes/:id/export/gpx', StravaApiHandlers.exportRouteGpx);
app.get('/api/routes/:id/export/tcx', StravaApiHandlers.exportRouteTcx);

// Clubs endpoints
app.get('/api/clubs', StravaApiHandlers.getAthleteClubs);

// Agent connections are now auto-tracked via User-Agent detection on MCP tool calls

// Error handling
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

app.onError((err, c) => {
  console.error('Worker error:', err);
  return c.json({ 
    error: 'Internal server error',
    message: err.message 
  }, 500);
});

export default app;