import { Context } from 'hono';
import { Env, StravaWebhookEvent, StravaActivity } from './types';
import { KVSessionManager } from './session';

/**
 * Strava Webhook Handler
 * Handles webhook verification and event processing for Strava activities
 */
export class StravaWebhookHandler {
  constructor(private env: Env) {}

  /**
   * Handle webhook verification (GET request)
   * Strava sends this to validate the callback URL
   */
  async handleVerification(c: Context): Promise<Response> {
    const mode = c.req.query('hub.mode');
    const token = c.req.query('hub.verify_token');
    const challenge = c.req.query('hub.challenge');

    console.log('Webhook verification request:', { mode, token, challenge });

    // Verify the request is from Strava
    if (mode === 'subscribe' && token === this.env.STRAVA_WEBHOOK_VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully');
      return c.json({ 'hub.challenge': challenge });
    }

    console.error('❌ Webhook verification failed: invalid token');
    return c.json({ error: 'Forbidden' }, 403);
  }

  /**
   * Handle incoming webhook events (POST request)
   * Processes activity creates, updates, and deletes
   */
  async handleEvent(c: Context, ctx: ExecutionContext): Promise<Response> {
    try {
      const event = await c.req.json() as StravaWebhookEvent;
      
      console.log('📥 Webhook event received:', JSON.stringify(event));

      // Process event asynchronously to respond quickly
      ctx.waitUntil(this.processEvent(event));

      // Always respond 200 immediately (within 2 seconds as required)
      return c.json({ success: true });
    } catch (error: any) {
      console.error('❌ Error parsing webhook event:', error);
      // Still return 200 to avoid retries
      return c.json({ success: false, error: error.message });
    }
  }

  /**
   * Process webhook event asynchronously
   */
  private async processEvent(event: StravaWebhookEvent): Promise<void> {
    try {
      // Handle different event types
      if (event.object_type === 'activity') {
        await this.handleActivityEvent(event);
      } else if (event.object_type === 'athlete') {
        await this.handleAthleteEvent(event);
      }
    } catch (error: any) {
      console.error(`❌ Failed to process event:`, error.message);
    }
  }

  /**
   * Handle activity events (create, update, delete)
   */
  private async handleActivityEvent(event: StravaWebhookEvent): Promise<void> {
    const { aspect_type, object_id, owner_id } = event;

    console.log(`🏃 Processing ${aspect_type} event for activity ${object_id} by athlete ${owner_id}`);

    // Only process new activities for now
    if (aspect_type === 'create') {
      await this.processNewActivity(object_id, owner_id);
    } else if (aspect_type === 'update') {
      console.log(`ℹ️ Activity ${object_id} updated:`, event.updates);
      // Could process updates here if needed
    } else if (aspect_type === 'delete') {
      console.log(`ℹ️ Activity ${object_id} deleted`);
      // Could handle deletions here if needed
    }
  }

  /**
   * Handle athlete events (mainly deauthorization)
   */
  private async handleAthleteEvent(event: StravaWebhookEvent): Promise<void> {
    const { aspect_type, owner_id, updates } = event;

    console.log(`👤 Processing athlete event for ${owner_id}:`, aspect_type);

    // Handle app deauthorization
    if (aspect_type === 'update' && updates?.authorized === 'false') {
      console.log(`🔒 Athlete ${owner_id} deauthorized the app - cleaning up session`);
      const sessionManager = new KVSessionManager(this.env);
      await sessionManager.deleteSession(owner_id);
    }
  }

  /**
   * Process a new activity creation
   * Fetches full activity details and sends notification
   */
  private async processNewActivity(activityId: number, ownerId: number): Promise<void> {
    try {
      console.log(`🏃 Processing new activity ${activityId} for athlete ${ownerId}`);

      // Get the athlete's session
      const sessionManager = new KVSessionManager(this.env);
      let session = await sessionManager.getSession(ownerId);

      if (!session) {
        console.error(`❌ No session found for athlete ${ownerId}`);
        return;
      }

      // Proactively refresh the access token if it is expired or expiring soon
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at <= now + 300) { // refresh if within 5 minutes of expiry
        try {
          console.log(`🔄 Access token expired or expiring soon for athlete ${ownerId}, refreshing...`);
          session = await sessionManager.refreshToken(session);
          console.log(`✅ Token refreshed successfully for athlete ${ownerId}`);
        } catch (refreshError: any) {
          console.error(`❌ Proactive token refresh failed for athlete ${ownerId}:`, refreshError.message);
          // Continue with the existing token — fetchActivityDetails will handle a 401 below
        }
      }

      // Fetch full activity details from Strava, refreshing on 401 if needed
      const activity = await this.fetchActivityDetails(activityId, session.access_token, session, sessionManager);

      // Format and send notification
      const message = this.formatActivityMessage(activity);
      
      // Send to Poke if API key is configured
      if (this.env.POKE_API_KEY) {
        await this.sendToPoke(message);
        console.log(`✅ Successfully sent activity ${activityId} to Poke`);
      } else {
        console.log(`ℹ️ Poke API key not configured, skipping notification`);
        console.log(`📝 Activity message:\n${message}`);
      }

      // Store activity summary in KV for potential future use
      await this.storeActivitySummary(ownerId, activityId, activity);

    } catch (error: any) {
      console.error(`❌ Failed to process activity ${activityId}:`, error.message);
    }
  }

  /**
   * Fetch full activity details from Strava API.
   * On a 401 Unauthorized response, refreshes the token once and retries.
   * The refreshed session is persisted to KV via the sessionManager.
   */
  private async fetchActivityDetails(
    activityId: number,
    accessToken: string,
    session: import('./types').StravaSession,
    sessionManager: KVSessionManager
  ): Promise<StravaActivity> {
    const url = `https://www.strava.com/api/v3/activities/${activityId}`;
    let response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    // On 401, attempt one token refresh and retry
    if (response.status === 401) {
      console.log(`🔄 Received 401 for activity ${activityId}, refreshing token and retrying...`);
      try {
        const refreshedSession = await sessionManager.refreshToken(session);
        console.log(`✅ Token refreshed on 401 for athlete ${session.athlete_id}`);
        response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${refreshedSession.access_token}` },
        });
      } catch (refreshError: any) {
        throw new Error(`Token refresh on 401 failed: ${refreshError.message}`);
      }
    }

    if (!response.ok) {
      throw new Error(`Strava API error: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Format activity into a human-readable message
   */
  private formatActivityMessage(activity: StravaActivity): string {
    const distance = activity.distance ? (activity.distance / 1000).toFixed(2) + ' km' : 'N/A';
    const duration = Math.round(activity.moving_time / 60);
    const pace = activity.distance && activity.moving_time 
      ? (activity.moving_time / 60 / (activity.distance / 1000)).toFixed(2)
      : 'N/A';
    const elevation = activity.total_elevation_gain || 0;
    const avgHR = activity.average_heartrate || 'N/A';
    
    // Use start_date_local which already includes the athlete's timezone
    // Format it more naturally (e.g., "Oct 29, 2025, 12:13 PM")
    const localDate = new Date(activity.start_date_local);
    const date = localDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    let message = `🏃 New Strava Workout!\n\n`;
    message += `**${activity.name}**\n`;
    message += `Type: ${activity.sport_type || activity.type}\n`;
    message += `Date: ${date}\n`;
    message += `Distance: ${distance}\n`;
    message += `Duration: ${duration} minutes\n`;
    message += `Pace: ${pace} min/km\n`;
    message += `Elevation: ${elevation}m\n`;
    message += `Avg HR: ${avgHR} bpm`;
    
    if (activity.average_watts) {
      message += `\nAvg Power: ${activity.average_watts}W`;
    }
    
    if (activity.kilojoules) {
      message += `\nEnergy: ${activity.kilojoules}kJ`;
    }

    if (activity.pr_count && activity.pr_count > 0) {
      message += `\n🏆 ${activity.pr_count} PR${activity.pr_count > 1 ? 's' : ''}!`;
    }

    return message;
  }

  /**
   * Send notification to Poke API
   */
  private async sendToPoke(message: string): Promise<void> {
    if (!this.env.POKE_API_KEY) {
      throw new Error('Poke API key not configured');
    }

    const response = await fetch('https://poke.com/api/v1/inbound-sms/webhook', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.env.POKE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Poke API error: ${response.status} - ${errorText}`);
    }
  }

  /**
   * Store activity summary in KV for analytics/history
   */
  private async storeActivitySummary(
    ownerId: number, 
    activityId: number, 
    activity: StravaActivity
  ): Promise<void> {
    const key = `activity_webhook:${ownerId}:${activityId}`;
    const summary = {
      id: activityId,
      name: activity.name,
      type: activity.sport_type || activity.type,
      distance: activity.distance,
      moving_time: activity.moving_time,
      elevation_gain: activity.total_elevation_gain,
      start_date: activity.start_date_local,
      received_at: new Date().toISOString(),
    };

    // Store with 30-day expiration
    await this.env.STRAVA_SESSIONS.put(
      key, 
      JSON.stringify(summary),
      { expirationTtl: 60 * 60 * 24 * 30 } // 30 days
    );
  }

  /**
   * Get recent activity summaries from webhooks
   */
  async getRecentWebhookActivities(ownerId: number, limit: number = 10): Promise<any[]> {
    // This would require listing KV keys which isn't efficient
    // Better to use the regular Strava API for fetching activities
    // This is just for reference/debugging
    const activities: any[] = [];
    
    // For now, just return empty array
    // In production, you might want to maintain a separate index
    return activities;
  }
}
