# Strava Webhook Setup Guide

> ⚠️ **IMPORTANT: Personal Use Only** - The webhook notification system currently sends all activity updates to a single Poke API key. This setup is designed for **personal/single-user deployments only**. Multi-user support with per-user notification routing is planned for future releases.

This guide will help you set up real-time Strava activity notifications using webhooks.

## Prerequisites

1. Deployed Cloudflare Worker (strava-mcp-oauth)
2. Strava API application configured
3. At least one user authenticated via OAuth
4. (Optional) Poke API key for push notifications

## Setup Steps

### 1. Set Webhook Secrets

```bash
# Set the webhook verification token (can be any string you choose)
wrangler secret put STRAVA_WEBHOOK_VERIFY_TOKEN
# When prompted, enter: STRAVA_MCP_WEBHOOK

# Set Poke API key (optional - for notifications)
wrangler secret put POKE_API_KEY
# When prompted, enter your Poke API key
```

### 2. Deploy Updated Worker

```bash
npm run deploy
```

### 3. Test Webhook Endpoint

Before creating the subscription, verify your webhook endpoint is working:

```bash
node scripts/manage-webhook.js test
```

This will:
- Test the verification endpoint (GET /webhook)
- Test the event endpoint (POST /webhook)

### 4. Create Webhook Subscription

Set your Strava credentials and create the subscription:

```bash
STRAVA_CLIENT_ID=your_client_id \
STRAVA_CLIENT_SECRET=your_client_secret \
node scripts/manage-webhook.js create
```

**Important:** Only ONE webhook subscription is allowed per Strava app. If you need to recreate it, delete the existing one first.

### 5. Verify Subscription

Check that your subscription was created successfully:

```bash
STRAVA_CLIENT_ID=your_client_id \
STRAVA_CLIENT_SECRET=your_client_secret \
node scripts/manage-webhook.js view
```

### 6. Monitor Webhook Events

Watch for incoming webhook events in real-time:

```bash
wrangler tail
```

### 7. Test with Real Activity

1. Upload or create a new activity on Strava (mobile app or web)
2. Watch the `wrangler tail` output for webhook events
3. If Poke is configured, you should receive a notification

## Webhook Event Flow

```
1. Activity created on Strava
   ↓
2. Strava POSTs to /webhook endpoint
   ↓
3. Worker responds 200 OK immediately (< 2 seconds)
   ↓
4. Worker processes event asynchronously:
   - Fetches full activity details
   - Formats notification message
   - Sends to Poke API (if configured)
   - Stores summary in KV
```

## Troubleshooting

### Subscription Creation Fails

**Error:** "Subscription already exists"
```bash
# Delete existing subscription first
STRAVA_CLIENT_ID=xxx STRAVA_CLIENT_SECRET=xxx \
node scripts/manage-webhook.js delete

# Then create new one
STRAVA_CLIENT_ID=xxx STRAVA_CLIENT_SECRET=xxx \
node scripts/manage-webhook.js create
```

**Error:** "Callback validation failed"
- Ensure worker is deployed: `npm run deploy`
- Test endpoint manually: `node scripts/manage-webhook.js test`
- Check that `STRAVA_WEBHOOK_VERIFY_TOKEN` secret is set correctly

### Not Receiving Events

1. **Check subscription is active:**
   ```bash
   STRAVA_CLIENT_ID=xxx STRAVA_CLIENT_SECRET=xxx \
   node scripts/manage-webhook.js view
   ```

2. **Monitor logs:**
   ```bash
   wrangler tail
   ```

3. **Verify athlete has authenticated:**
   - User must have completed OAuth flow
   - Session must be stored in KV
   - Check dashboard: `https://your-worker.workers.dev/dashboard?token=xxx`

4. **Check activity privacy:**
   - With `activity:read` scope: Only "Everyone" and "Followers" activities trigger webhooks
   - With `activity:read_all` scope: All activities including "Only You" trigger webhooks

### Poke Notifications Not Working

1. **Verify Poke API key is set:**
   ```bash
   # Re-set the secret
   wrangler secret put POKE_API_KEY
   ```

2. **Check logs for errors:**
   ```bash
   wrangler tail
   ```
   Look for messages like:
   - `✅ Successfully sent activity XXX to Poke`
   - `❌ Poke API error: ...`

3. **Test notification manually:**
   ```bash
   curl -X POST https://your-worker.workers.dev/webhook \
     -H 'Content-Type: application/json' \
     -d '{
       "aspect_type": "create",
       "event_time": '$(date +%s)',
       "object_id": 1234567890,
       "object_type": "activity",
       "owner_id": YOUR_ATHLETE_ID,
       "subscription_id": YOUR_SUBSCRIPTION_ID
     }'
   ```

## Managing Subscriptions

### View Current Subscription
```bash
STRAVA_CLIENT_ID=xxx STRAVA_CLIENT_SECRET=xxx \
node scripts/manage-webhook.js view
```

### Delete Subscription
```bash
STRAVA_CLIENT_ID=xxx STRAVA_CLIENT_SECRET=xxx \
node scripts/manage-webhook.js delete
```

### Update Callback URL

To change the webhook callback URL:

1. Delete existing subscription
2. Update `CALLBACK_URL` in script or set environment variable:
   ```bash
   export STRAVA_WEBHOOK_CALLBACK_URL=https://new-domain.com/webhook
   ```
3. Create new subscription

## Security Notes

- **Verify Token:** Always use a secure, random string for `STRAVA_WEBHOOK_VERIFY_TOKEN`
- **Secrets:** Never commit secrets to version control
- **Response Time:** Webhook endpoint MUST respond within 2 seconds
- **Async Processing:** Heavy processing is done asynchronously via `waitUntil()`
- **Retries:** Strava retries failed webhooks up to 3 times

## Development Tips

### Local Testing

Webhooks can't be tested locally with `wrangler dev` because Strava needs a public HTTPS URL. Options:

1. **Deploy to preview:** `wrangler deploy --env preview`
2. **Use tunneling service:** ngrok, cloudflared, etc.
3. **Test with mock events:** Use the test script

### Mock Event Testing

```bash
# Send mock webhook event
curl -X POST http://localhost:8787/webhook \
  -H 'Content-Type: application/json' \
  -d '{
    "aspect_type": "create",
    "event_time": 1234567890,
    "object_id": 999999,
    "object_type": "activity",
    "owner_id": YOUR_ATHLETE_ID,
    "subscription_id": 1
  }'
```

## Event Types Reference

### Activity Events
- `create` - New activity uploaded
- `update` - Activity title, type, or privacy changed
- `delete` - Activity deleted

### Athlete Events
- `update` with `"authorized": "false"` - App deauthorized

## Further Reading

- [Strava Webhook Events API Documentation](https://developers.strava.com/docs/webhooks/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Poke API Documentation](https://poke.com/docs)
