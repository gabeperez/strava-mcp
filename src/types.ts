// Environment variables
export interface Env {
  STRAVA_SESSIONS: KVNamespace;
  STRAVA_CLIENT_ID: string;
  STRAVA_CLIENT_SECRET: string; 
  STRAVA_REDIRECT_URI: string;
  STRAVA_WEBHOOK_VERIFY_TOKEN?: string;
  POKE_API_KEY?: string;
}

// Strava OAuth session stored in KV
export interface StravaSession {
  access_token: string;
  refresh_token: string;
  expires_at: number; // Unix timestamp
  created_at: number;
  scopes: string[];
  athlete_id: number;
  athlete: StravaAthlete;
}

// Strava API types based on original MCP server
export interface StravaAthlete {
  id: number;
  resource_state: number;
  username: string | null;
  firstname: string;
  lastname: string;
  city: string | null;
  state: string | null;
  country: string | null;
  sex: "M" | "F" | null;
  premium: boolean;
  summit: boolean;
  created_at: string;
  updated_at: string;
  profile_medium: string;
  profile: string;
  weight: number | null;
  measurement_preference: "feet" | "meters" | null;
}

// Strava OAuth token response
export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  athlete: StravaAthlete;
}

// Session helpers
export interface SessionManager {
  getSession(athleteId: number): Promise<StravaSession | null>;
  setSession(athleteId: number, session: StravaSession): Promise<void>;
  deleteSession(athleteId: number): Promise<void>;
  refreshToken(session: StravaSession): Promise<StravaSession>;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Context with authenticated session
export interface AuthenticatedContext {
  session: StravaSession;
  token: string;
}

// Webhook event types
export interface StravaWebhookEvent {
  object_type: 'activity' | 'athlete';
  object_id: number;
  aspect_type: 'create' | 'update' | 'delete';
  updates?: Record<string, any>;
  owner_id: number;
  subscription_id: number;
  event_time: number;
}

export interface StravaWebhookSubscription {
  id: number;
  application_id: number;
  callback_url: string;
  created_at: string;
  updated_at: string;
}

// Strava activity details
export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  start_date: string;
  start_date_local: string;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_watts?: number;
  kilojoules?: number;
  average_cadence?: number;
  elev_high?: number;
  elev_low?: number;
  pr_count?: number;
  achievement_count?: number;
}
