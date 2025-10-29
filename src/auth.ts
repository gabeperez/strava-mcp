import { Context } from 'hono';
import { Env, StravaTokenResponse, StravaSession } from './types';
import { KVSessionManager, getCookieValue, createCookie, deleteCookie, generateState } from './session';

const REQUIRED_SCOPES = 'profile:read_all,activity:read_all,activity:read,profile:write';

export class AuthHandler {
  private sessionManager: KVSessionManager;

  constructor(private env: Env) {
    this.sessionManager = new KVSessionManager(env);
  }
  
  private generateSecureToken(): string {
    // Generate a secure 32-character token using crypto
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Get current domain for dynamic URL generation
  private getCurrentDomain(c: Context): string {
    const host = c.req.header('host');
    if (host?.includes('stravamcp.com')) {
      return 'https://stravamcp.com';
    }
    return 'https://your-worker-name.your-subdomain.workers.dev';
  }

  // GET /auth - Initiate OAuth flow
  async initiateAuth(c: Context) {
    try {
      const sessionId = c.req.query('session'); // Get session ID if provided
      const state = generateState();
      const currentDomain = this.getCurrentDomain(c);
      
      // Store state in a temporary KV entry for CSRF protection
      const stateData = { 
        pending: true,
        sessionId: sessionId || null,
        created_at: Math.floor(Date.now() / 1000)
      };
      await this.env.STRAVA_SESSIONS.put(`state:${state}`, JSON.stringify(stateData), { expirationTtl: 600 }); // 10 min expiry

      const authUrl = new URL('https://www.strava.com/oauth/authorize');
      authUrl.searchParams.set('client_id', this.env.STRAVA_CLIENT_ID);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('redirect_uri', this.env.STRAVA_REDIRECT_URI);
      authUrl.searchParams.set('approval_prompt', 'auto');
      authUrl.searchParams.set('scope', REQUIRED_SCOPES);
      authUrl.searchParams.set('state', state);

      return c.redirect(authUrl.toString());
    } catch (error) {
      console.error('Error initiating auth:', error);
      return c.json({ error: 'Failed to initiate authentication' }, 500);
    }
  }

  // GET /callback - Handle OAuth callback
  async handleCallback(c: Context) {
    try {
      const code = c.req.query('code');
      const state = c.req.query('state');
      const error = c.req.query('error');
      const sessionId = c.req.query('session'); // For MCP client sessions

      if (error) {
        return c.html(`
          <html>
            <body>
              <h1>Authentication Error</h1>
              <p>Error: ${error}</p>
              <p><a href="/auth">Try again</a></p>
            </body>
          </html>
        `);
      }

      if (!code || !state) {
        return c.html(`
          <html>
            <body>
              <h1>Authentication Error</h1>
              <p>Missing authorization code or state parameter</p>
              <p><a href="/auth">Try again</a></p>
            </body>
          </html>
        `);
      }

      // Verify state parameter for CSRF protection
      const storedStateData = await this.env.STRAVA_SESSIONS.get(`state:${state}`);
      if (!storedStateData) {
        return c.html(`
          <html>
            <body>
              <h1>Authentication Error</h1>
              <p>Invalid or expired state parameter</p>
              <p><a href="/auth">Try again</a></p>
            </body>
          </html>
        `);
      }

      // Parse the state data
      let stateInfo;
      try {
        stateInfo = JSON.parse(storedStateData);
      } catch (e) {
        // Handle legacy string states
        stateInfo = { pending: true, sessionId: null };
      }
      
      // Clean up the state
      await this.env.STRAVA_SESSIONS.delete(`state:${state}`);

      // Exchange code for tokens
      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.env.STRAVA_CLIENT_ID,
          client_secret: this.env.STRAVA_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Token exchange failed:', errorData);
        return c.html(`
          <html>
            <body>
              <h1>Authentication Error</h1>
              <p>Failed to exchange authorization code for tokens</p>
              <p><a href="/auth">Try again</a></p>
            </body>
          </html>
        `);
      }

      const tokenData = await response.json() as StravaTokenResponse;

      // Create session
      const session: StravaSession = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_at,
        created_at: Math.floor(Date.now() / 1000),
        scopes: REQUIRED_SCOPES.split(','),
        athlete_id: tokenData.athlete.id,
        athlete: tokenData.athlete,
      };

      // Store session in KV
      await this.sessionManager.setSession(tokenData.athlete.id, session);

      // Set session cookie (expires in 30 days)
      const cookie = createCookie('sid', tokenData.athlete.id.toString(), 30 * 24 * 60 * 60);

      // If this was initiated by an MCP client, link the session
      if (stateInfo.sessionId) {
        await this.env.STRAVA_SESSIONS.put(`user_session:${stateInfo.sessionId}`, JSON.stringify({
          athlete_id: tokenData.athlete.id,
          authenticated: true,
          created_at: Math.floor(Date.now() / 1000)
        }), { expirationTtl: 30 * 24 * 60 * 60 }); // 30 days
      }
      
      // Store device authentication for browser fingerprinting
      const userAgent = c.req.header('User-Agent') || '';
      const acceptHeader = c.req.header('Accept') || '';
      const combined = `${userAgent}:${acceptHeader}`;
      const encoder = new TextEncoder();
      const bytes = encoder.encode(combined);
      const deviceFingerprint = btoa(String.fromCharCode(...bytes)).slice(0, 32);
      
      await this.env.STRAVA_SESSIONS.put(`device_auth:${deviceFingerprint}`, JSON.stringify({
        athlete_id: tokenData.athlete.id,
        created_at: Math.floor(Date.now() / 1000),
        user_agent: userAgent.substring(0, 100) // Store partial UA for debugging
      }), { expirationTtl: 30 * 24 * 60 * 60 }); // 30 days
      
      // Generate unique personal MCP token
      const personalMcpToken = this.generateSecureToken();
      await this.env.STRAVA_SESSIONS.put(`personal_mcp:${personalMcpToken}`, JSON.stringify({
        athlete_id: tokenData.athlete.id,
        created_at: Math.floor(Date.now() / 1000),
        expires_at: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year
      }), { expirationTtl: 365 * 24 * 60 * 60 }); // 1 year

      // Always redirect to stravamcp.com for better UX, fallback to workers.dev
      const dashboardDomain = 'https://stravamcp.com';
      return c.redirect(`${dashboardDomain}/dashboard?token=${personalMcpToken}`);
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      return c.html(`
        <html>
          <body>
            <h1>Authentication Error</h1>
            <p>An unexpected error occurred during authentication</p>
            <p><a href="/auth">Try again</a></p>
          </body>
        </html>
      `);
    }
  }

  // GET /status - Check authentication status
  async getStatus(c: Context) {
    try {
      const athleteIdStr = getCookieValue(c.req.raw, 'sid');
      if (!athleteIdStr) {
        return c.json({
          authenticated: false,
          message: 'No session cookie found'
        });
      }

      const athleteId = parseInt(athleteIdStr);
      if (isNaN(athleteId)) {
        return c.json({
          authenticated: false,
          message: 'Invalid session cookie'
        });
      }

      const session = await this.sessionManager.getSession(athleteId);
      if (!session) {
        return c.json({
          authenticated: false,
          message: 'Session not found'
        });
      }

      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      const isExpired = session.expires_at <= now;

      return c.json({
        authenticated: true,
        athlete_id: session.athlete_id,
        athlete: {
          id: session.athlete.id,
          firstname: session.athlete.firstname,
          lastname: session.athlete.lastname,
          username: session.athlete.username,
        },
        token_expires_at: session.expires_at,
        token_expired: isExpired,
        scopes: session.scopes,
      });
    } catch (error) {
      console.error('Error checking status:', error);
      return c.json({
        authenticated: false,
        error: 'Failed to check authentication status'
      }, 500);
    }
  }

  // POST /logout - Clear session
  async logout(c: Context) {
    try {
      const athleteIdStr = getCookieValue(c.req.raw, 'sid');
      if (athleteIdStr) {
        const athleteId = parseInt(athleteIdStr);
        if (!isNaN(athleteId)) {
          await this.sessionManager.deleteSession(athleteId);
        }
      }

      const cookie = deleteCookie('sid');
      
      // Redirect to landing page after successful logout
      return c.redirect('/', 302, {
        'Set-Cookie': cookie,
      });
    } catch (error) {
      console.error('Error logging out:', error);
      // Even if there's an error, redirect to landing page
      return c.redirect('/', 302);
    }
  }
}