import { Context } from 'hono';
import { Env } from './types';

export class StravaWebhookHandler {
  constructor(private env: Env) {}

  // GET /webhook - Webhook verification (Strava requirement)
  async verifyWebhook(c: Context) {
    const mode = c.req.query('hub.mode');
    const token = c.req.query('hub.verify_token');
    const challenge = c.req.query('hub.challenge');

    // Verify the webhook subscription
    if (mode === 'subscribe' && token === 'YOUR_VERIFY_TOKEN') {
      console.log('Webhook verified successfully');
      return c.json({ 'hub.challenge': challenge });
    }
    
    return c.json({ error: 'Invalid verification' }, 403);
  }

  // POST /webhook - Handle activity events
  async handleWebhookEvent(c: Context) {
    try {
      const event = await c.req.json();
      
      // Process different event types
      switch (event.aspect_type) {
        case 'create':
          if (event.object_type === 'activity') {
            await this.handleNewActivity(event);
          }
          break;
        case 'update':
          if (event.object_type === 'activity') {
            await this.handleActivityUpdate(event);
          }
          break;
        case 'delete':
          await this.handleActivityDelete(event);
          break;
      }
      
      return c.json({ status: 'ok' });
    } catch (error) {
      console.error('Webhook processing error:', error);
      return c.json({ error: 'Processing failed' }, 500);
    }
  }

  private async handleNewActivity(event: any) {
    const athleteId = event.owner_id;
    const activityId = event.object_id;
    
    console.log(`New activity ${activityId} for athlete ${athleteId}`);
    
    // Get athlete's session to fetch activity details
    const sessionManager = new (await import('./session')).KVSessionManager(this.env);
    const session = await sessionManager.getSession(athleteId);
    
    if (session) {
      // Fetch full activity details
      const response = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      
      if (response.ok) {
        const activity = await response.json();
        
        // Store notification for AI to retrieve
        await this.storeNotification(athleteId, {
          type: 'new_activity',
          activity: {
            id: activity.id,
            name: activity.name,
            type: activity.sport_type,
            distance: Math.round(activity.distance / 1000 * 10) / 10,
            duration: Math.floor(activity.moving_time / 60),
            date: activity.start_date_local
          },
          timestamp: Date.now()
        });
        
        // Optional: Send to external notification service
        // await this.sendToAI(athleteId, activity);
      }
    }
  }

  private async handleActivityUpdate(event: any) {
    // Handle activity updates (title changes, privacy changes, etc.)
    console.log('Activity updated:', event);
  }

  private async handleActivityDelete(event: any) {
    // Handle activity deletions
    console.log('Activity deleted:', event);
  }

  private async storeNotification(athleteId: number, notification: any) {
    // Store in KV with expiration for AI to poll
    const key = `notifications:${athleteId}:${Date.now()}`;
    await this.env.STRAVA_SESSIONS.put(key, JSON.stringify(notification), {
      expirationTtl: 24 * 60 * 60 // 24 hours
    });
  }

  // Optional: Direct AI notification integration
  private async sendToAI(athleteId: number, activity: any) {
    // Example: Send to Claude, OpenAI, or other AI service
    // This would require additional configuration and API keys
    
    const message = `🏃 New activity completed: ${activity.name} - ${Math.round(activity.distance/1000*10)/10}km in ${Math.floor(activity.moving_time/60)}min`;
    
    // Implementation would depend on your AI platform:
    // - Claude: Send via their API
    // - Discord bot: Send to channel
    // - Email: Send summary
    // - Push notification: Via service like Pushover
  }
}

// Add MCP tool to retrieve notifications
export class NotificationMCPTool {
  constructor(private env: Env) {}

  async getRecentNotifications(athleteId: number, limit: number = 10) {
    const notifications = [];
    
    // List recent notification keys
    const keys = await this.env.STRAVA_SESSIONS.list({
      prefix: `notifications:${athleteId}:`
    });
    
    // Fetch notification data
    for (const key of keys.keys.slice(0, limit)) {
      const data = await this.env.STRAVA_SESSIONS.get(key.name);
      if (data) {
        notifications.push(JSON.parse(data));
      }
    }
    
    return notifications.sort((a, b) => b.timestamp - a.timestamp);
  }
}