import { Context, Next } from 'hono';
import { Env, AuthenticatedContext } from './types';
import { KVSessionManager, getCookieValue } from './session';

export class AuthMiddleware {
  private sessionManager: KVSessionManager;

  constructor(private env: Env) {
    this.sessionManager = new KVSessionManager(env);
  }

  // Middleware to authenticate requests and attach session
  authenticate = async (c: Context, next: Next) => {
    try {
      const athleteIdStr = getCookieValue(c.req.raw, 'sid');
      if (!athleteIdStr) {
        return c.json({
          error: 'Authentication required',
          message: 'No session cookie found'
        }, 401);
      }

      const athleteId = parseInt(athleteIdStr);
      if (isNaN(athleteId)) {
        return c.json({
          error: 'Authentication required',
          message: 'Invalid session cookie'
        }, 401);
      }

      let session = await this.sessionManager.getSession(athleteId);
      if (!session) {
        return c.json({
          error: 'Authentication required',
          message: 'Session not found'
        }, 401);
      }

      // Check if token is expired and refresh if needed
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at <= now + 300) { // Refresh 5 minutes before expiry
        try {
          session = await this.sessionManager.refreshToken(session);
          console.log(`Token refreshed for athlete ${athleteId}`);
        } catch (error) {
          console.error('Token refresh failed:', error);
          return c.json({
            error: 'Authentication expired',
            message: 'Failed to refresh access token'
          }, 401);
        }
      }

      // Attach session and token to context
      c.set('session', session);
      c.set('token', session.access_token);

      await next();
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return c.json({
        error: 'Authentication error',
        message: 'Failed to authenticate request'
      }, 500);
    }
  }

  // CORS middleware for API routes
  cors = async (c: Context, next: Next) => {
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
  }
}

// Strava API proxy utility
export class StravaApiProxy {
  private static readonly BASE_URL = 'https://www.strava.com/api/v3';

  static async fetch(
    path: string,
    token: string,
    options: {
      method?: string;
      params?: Record<string, string | number>;
      body?: any;
    } = {}
  ): Promise<Response> {
    try {
      let url = `${this.BASE_URL}${path}`;

      // Add query parameters if provided
      if (options.params) {
        const searchParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, value.toString());
          }
        });
        const queryString = searchParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      };

      if (options.body) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      // Log rate limit headers for monitoring
      const rateLimitUsage = response.headers.get('X-RateLimit-Usage');
      const rateLimitLimit = response.headers.get('X-RateLimit-Limit');
      if (rateLimitUsage && rateLimitLimit) {
        console.log(`Strava API rate limit: ${rateLimitUsage}/${rateLimitLimit}`);
      }

      return response;
    } catch (error) {
      console.error('Strava API fetch error:', error);
      throw error;
    }
  }

  static async fetchJson<T = any>(
    path: string,
    token: string,
    options: {
      method?: string;
      params?: Record<string, string | number>;
      body?: any;
    } = {}
  ): Promise<T> {
    const response = await this.fetch(path, token, options);
    
    if (!response.ok) {
      const errorData = await response.text().catch(() => 'Unknown error');
      throw new Error(`Strava API error: ${response.status} ${response.statusText} - ${errorData}`);
    }

    return response.json();
  }

  // Helper to format errors consistently
  static formatError(error: any, context: string): object {
    if (error.message && error.message.includes('Strava API error:')) {
      const match = error.message.match(/Strava API error: (\d+) (.+)/);
      if (match) {
        const [, status, message] = match;
        return {
          error: 'Strava API error',
          status: parseInt(status),
          message: message.split(' - ')[0], // Remove detailed error text
          context
        };
      }
    }

    return {
      error: 'Internal server error',
      message: 'An unexpected error occurred',
      context
    };
  }
}