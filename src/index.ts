import { Hono } from 'hono';
import { Env } from './types';
import { AuthHandler } from './auth';
import { AuthMiddleware } from './middleware';
import { StravaApiHandlers } from './api';
import { StravaMCPServer, handleMCPOverSSE } from './mcp-server';
import { TemplateEngine, LANDING_TEMPLATE, DASHBOARD_TEMPLATE } from './templates';
import { ABOUT_TEMPLATE, SUPPORT_TEMPLATE, PRIVACY_TEMPLATE, TERMS_TEMPLATE } from './legal-templates';
import { StravaWebhookHandler } from './webhook';

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

// Helper function to get current domain
function getCurrentDomain(c: any): string {
  const host = c.req.header('host');
  if (host?.includes('stravamcp.com')) {
    return 'https://stravamcp.com';
  }
  return 'https://your-worker-name.your-subdomain.workers.dev';
}


// Root endpoint - Serve landing page
app.get('/', (c) => {
  const acceptHeader = c.req.header('Accept');
  const currentDomain = getCurrentDomain(c);
  
  // If requesting JSON (for API or MCP clients), return server info
  if (acceptHeader?.includes('application/json')) {
    return c.json({
      name: 'Strava MCP Server',
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
        name: 'Strava MCP Server',
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

// Webhook endpoints
app.get('/webhook', async (c) => {
  const webhookHandler = new StravaWebhookHandler(c.env);
  return webhookHandler.handleVerification(c);
});

app.post('/webhook', async (c) => {
  const webhookHandler = new StravaWebhookHandler(c.env);
  return webhookHandler.handleEvent(c, c.executionCtx);
});

// Test endpoint for Poke notifications
app.post('/test-poke', async (c) => {
  try {
    if (!c.env.POKE_API_KEY) {
      return c.json({ error: 'POKE_API_KEY not configured' }, 400);
    }

    const testMessage = `🏃 Test Strava Webhook!

**Morning Run - Webhook Integration Test**
Type: Run
Date: ${new Date().toLocaleString()}
Distance: 10.5 km
Duration: 52 minutes
Pace: 4:57 min/km
Elevation: 120m
Avg HR: 145 bpm
🏆 2 PRs!

✨ This is a test notification from your Strava MCP webhook integration!`;

    const response = await fetch('https://poke.com/api/v1/inbound-sms/webhook', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${c.env.POKE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: testMessage }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return c.json({
        success: false,
        error: `Poke API error: ${response.status}`,
        details: errorText
      }, response.status);
    }

    const data = await response.json();
    return c.json({
      success: true,
      message: 'Test notification sent to Poke!',
      poke_response: data
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// Legal and informational pages  
app.get('/about', (c) => {
  const html = templates.render('about');
  return c.html(html);
});

app.get('/support', (c) => {
  const html = templates.render('support');
  return c.html(html);
});

app.get('/privacy', (c) => {
  const html = templates.render('privacy');
  return c.html(html);
});

app.get('/terms', (c) => {
  const html = templates.render('terms');
  return c.html(html);
});

// Dashboard endpoint
app.get('/dashboard', async (c) => {
  const token = c.req.query('token');
  if (!token) {
    return c.redirect('/auth');
  }
  
  try {
    // Get user data using the personal MCP token
    const personalData = await c.env.STRAVA_SESSIONS.get(`personal_mcp:${token}`);
    if (!personalData) {
      return c.redirect('/auth');
    }
    
    const { athlete_id } = JSON.parse(personalData);
    const sessionManager = new (await import('./session')).KVSessionManager(c.env);
    const session = await sessionManager.getSession(athlete_id);
    
    if (!session) {
      return c.redirect('/auth');
    }
    
    // Fetch user's Strava data for dashboard
    const [profileResponse, statsResponse, activitiesResponse] = await Promise.all([
      fetch('https://www.strava.com/api/v3/athlete', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      }),
      fetch('https://www.strava.com/api/v3/athletes/' + athlete_id + '/stats', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      }),
      fetch('https://www.strava.com/api/v3/athlete/activities?per_page=5', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
    ]);
    
    const profile = await profileResponse.json();
    const stats = await statsResponse.json();
    const activities = await activitiesResponse.json();
    
    // Format activity data for template
    const formattedActivities = activities.slice(0, 5).map((activity: any) => ({
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
      mcp_url: `${currentDomain}/mcp?token=${token}`,
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
        longest_activity: activities.length > 0 ? Math.round(Math.max(...activities.map((a: any) => a.distance)) / 1000 * 10) / 10 : 0
      }
    };
    
    // Render the beautiful dashboard HTML
    const html = templates.render('dashboard', dashboardData);
    return c.html(html);
    
  } catch (error) {
    console.error('Dashboard error:', error);
    return c.redirect('/auth');
  }
});

// MCP endpoint - handle both GET (info) and POST (JSON-RPC)
app.get('/mcp', async (c) => {
  // Check if there's a valid personal MCP token
  const personalToken = c.req.query('token');
  let isAuthenticated = false;
  
  if (personalToken) {
    try {
      const personalData = await c.env.STRAVA_SESSIONS.get(`personal_mcp:${personalToken}`);
      isAuthenticated = !!personalData;
    } catch (error) {
      console.error('Personal token validation error:', error);
    }
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
        name: 'Strava MCP Server',
        version: '1.0.0'
      },
      authenticated: isAuthenticated,
      ...(isAuthenticated ? {} : {
        authenticationRequired: {
          message: 'Please authenticate with Strava to access your data',
          authUrl: `${getCurrentDomain(c)}/auth`
        }
      })
    }
  });
});

// MCP JSON-RPC endpoint for direct calls  
app.post('/mcp', async (c) => {
  const env = c.env as Env;
  const mcpServer = new StravaMCPServer(env);
  
  try {
    const request = await c.req.json();
    
    // Try to get authentication context
    let context: any = {
      baseUrl: getCurrentDomain(c)
    };
    
    // Check for personal MCP token in URL parameter
    const personalToken = c.req.query('token');
    let authenticatedAthleteId = null;
    
    // Method 1: Personal MCP token (primary method)
    if (personalToken) {
      try {
        const personalData = await env.STRAVA_SESSIONS.get(`personal_mcp:${personalToken}`);
        if (personalData) {
          const tokenInfo = JSON.parse(personalData);
          authenticatedAthleteId = tokenInfo.athlete_id;
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