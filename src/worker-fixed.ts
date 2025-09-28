import { Hono } from 'hono';
import { Env } from './types';
import { AuthHandler } from './auth';
import { AuthMiddleware } from './middleware';
import { StravaApiHandlers } from './api';

const app = new Hono<{ Bindings: Env }>();

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

// Root endpoint with basic info
app.get('/', (c) => {
  return c.json({
    name: 'Strava MCP OAuth Worker',
    version: '1.0.0',
    description: 'HTTPS endpoints for Strava MCP server with OAuth authentication',
    endpoints: {
      auth: '/auth',
      callback: '/callback',
      status: '/status',
      logout: '/logout',
      api: '/api/*'
    },
    documentation: 'https://github.com/r-huijts/strava-mcp'
  });
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