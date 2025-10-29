# 🚀 Quick Deploy Guide

Deploy your own Strava MCP OAuth server in 5 minutes!

## Prerequisites

- Cloudflare account ([sign up free](https://dash.cloudflare.com/sign-up))
- Node.js 18+ installed
- Strava API application ([create one](https://www.strava.com/settings/api))

## Step 1: Clone & Install

```bash
git clone <your-repo-url>
cd strava-mcp-oauth
npm install
```

## Step 2: Configure Cloudflare

```bash
# Login to Cloudflare
wrangler login

# Create KV namespace for sessions
wrangler kv:namespace create STRAVA_SESSIONS

# Copy the namespace ID from output, it looks like:
# id = "abc123def456..."
```

## Step 3: Update Configuration

Edit `wrangler.jsonc`:

```jsonc
{
  "kv_namespaces": [
    {
      "binding": "STRAVA_SESSIONS",
      "id": "YOUR_KV_NAMESPACE_ID"  // ← Paste your KV namespace ID here
    }
  ],
  "vars": {
    "STRAVA_REDIRECT_URI": "https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev/callback"
  }
}
```

**Note:** Your worker URL format:
- If using default: `https://strava-mcp-oauth.YOUR-SUBDOMAIN.workers.dev`
- Find YOUR-SUBDOMAIN in Cloudflare dashboard → Workers & Pages

## Step 4: Deploy Worker

```bash
npm run deploy
```

Copy the deployed URL (e.g., `https://strava-mcp-oauth.YOUR-SUBDOMAIN.workers.dev`)

## Step 5: Configure Strava App

1. Go to https://www.strava.com/settings/api
2. Set **Authorization Callback Domain** to your worker domain:
   ```
   YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev
   ```
3. Copy your **Client ID** and **Client Secret**

## Step 6: Set Secrets

```bash
# Required secrets
wrangler secret put STRAVA_CLIENT_ID
# Paste your Client ID when prompted

wrangler secret put STRAVA_CLIENT_SECRET
# Paste your Client Secret when prompted

# Optional: For webhook notifications
wrangler secret put STRAVA_WEBHOOK_VERIFY_TOKEN
# Enter: STRAVA_MCP_WEBHOOK (or any secure token)

wrangler secret put POKE_API_KEY
# Paste your Poke API key (get from https://poke.com/settings/advanced)
```

## Step 7: Update wrangler.jsonc Again

Now that you know your deployed URL, update `STRAVA_REDIRECT_URI`:

```jsonc
"vars": {
  "STRAVA_REDIRECT_URI": "https://your-actual-worker-url.workers.dev/callback"
}
```

Redeploy:
```bash
npm run deploy
```

## Step 8: Test Your Deployment

```bash
# Test basic functionality
curl https://your-worker-url.workers.dev/

# Test Poke integration (optional)
curl -X POST https://your-worker-url.workers.dev/test-poke
```

## Step 9: Authenticate

Visit your worker URL in a browser:
```
https://your-worker-url.workers.dev
```

Click "Authenticate with Strava" and follow the OAuth flow.

## 🎉 You're Done!

Your Strava MCP server is live! You can now:

- Access the dashboard: `https://your-worker-url.workers.dev/dashboard?token=YOUR_TOKEN`
- Use MCP endpoint: `https://your-worker-url.workers.dev/mcp`
- Set up webhooks (optional): See `WEBHOOK_SETUP.md`

## Optional: Enable Webhooks

For real-time Strava activity notifications:

```bash
# Test webhook endpoint
node scripts/manage-webhook.js test

# Create subscription
STRAVA_CLIENT_ID=xxx STRAVA_CLIENT_SECRET=xxx \
node scripts/manage-webhook.js create
```

See `WEBHOOK_SETUP.md` for detailed instructions.

## Troubleshooting

**"KV namespace not found"**
- Make sure you created the KV namespace and copied the correct ID to `wrangler.jsonc`

**"Callback domain mismatch"**
- Verify your Strava app Authorization Callback Domain matches your worker domain exactly
- No protocol (http/https) or path (/callback) in the domain field

**"Secret not set"**
- Run `wrangler secret list` to verify all secrets are configured
- Re-run `wrangler secret put` for any missing secrets

**"Deployment failed"**
- Make sure you're logged in: `wrangler whoami`
- Check for syntax errors in `wrangler.jsonc`

## Need Help?

- 📚 Full documentation: See `README.md`
- 🔧 Webhook setup: See `WEBHOOK_SETUP.md`
- 📖 Architecture details: See `WARP.md`

## Cost

This template runs on Cloudflare's **free tier**:
- Workers: 100,000 requests/day free
- KV: 100,000 reads/day, 1,000 writes/day free
- Perfect for personal use!

---

Made with ❤️ for the Strava community
