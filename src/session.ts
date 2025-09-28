import { Env, StravaSession, StravaTokenResponse, SessionManager } from './types';

export class KVSessionManager implements SessionManager {
  constructor(private env: Env) {}

  async getSession(athleteId: number): Promise<StravaSession | null> {
    try {
      const key = `user:${athleteId}`;
      const sessionData = await this.env.STRAVA_SESSIONS.get(key);
      if (!sessionData) {
        return null;
      }
      return JSON.parse(sessionData) as StravaSession;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  async setSession(athleteId: number, session: StravaSession): Promise<void> {
    try {
      const key = `user:${athleteId}`;
      await this.env.STRAVA_SESSIONS.put(key, JSON.stringify(session));
    } catch (error) {
      console.error('Error setting session:', error);
      throw error;
    }
  }

  async deleteSession(athleteId: number): Promise<void> {
    try {
      const key = `user:${athleteId}`;
      await this.env.STRAVA_SESSIONS.delete(key);
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  async refreshToken(session: StravaSession): Promise<StravaSession> {
    try {
      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.env.STRAVA_CLIENT_ID,
          client_secret: this.env.STRAVA_CLIENT_SECRET,
          refresh_token: session.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Token refresh failed: ${response.status} ${errorData}`);
      }

      const tokenData = await response.json() as StravaTokenResponse;
      
      const updatedSession: StravaSession = {
        ...session,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_at,
      };

      // Update the session in KV
      await this.setSession(session.athlete_id, updatedSession);
      
      return updatedSession;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }
}

// Helper functions for cookie management
export function getCookieValue(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

export function createCookie(name: string, value: string, maxAge?: number): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  
  if (maxAge) {
    parts.push(`Max-Age=${maxAge}`);
  }
  
  parts.push('HttpOnly');
  parts.push('Secure');
  parts.push('SameSite=Lax');
  parts.push('Path=/');
  
  return parts.join('; ');
}

export function deleteCookie(name: string): string {
  return `${name}=; Max-Age=0; HttpOnly; Secure; SameSite=Lax; Path=/`;
}

// Generate a secure random state parameter for CSRF protection
export function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}