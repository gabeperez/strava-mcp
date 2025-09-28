# Deployment Guide - Strava MCP OAuth Server

## Prerequisites

- Node.js 18+ installed
- Cloudflare account with Workers enabled
- Strava API application created
- Wrangler CLI installed (`npm install -g wrangler`)

## Quick Deployment

### 1. Clone and Setup

```bash
git clone https://github.com/gabeperez/strava-mcp-oauth.git
cd strava-mcp-oauth
npm install
```

### 2. Configure Strava API

1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Create a new application or use existing one
3. Set Authorization Callback Domain to your worker domain:
   - Example: `your-worker-name.your-subdomain.workers.dev`
4. Note your Client ID and Client Secret

### 3. Configure Cloudflare Workers

```bash
# Login to Cloudflare (if not already)
wrangler login

# Set your Strava credentials as secrets
wrangler secret put STRAVA_CLIENT_ID
# Enter your Strava Client ID when prompted

wrangler secret put STRAVA_CLIENT_SECRET
# Enter your Strava Client Secret when prompted
```

### 4. Update wrangler.jsonc

Update the `STRAVA_REDIRECT_URI` variable in `wrangler.jsonc`:

```json
{
  "vars": {
    "STRAVA_REDIRECT_URI": "https://your-worker-name.your-subdomain.workers.dev/callback"
  }
}
```

### 5. Deploy

```bash
npm run deploy
```

## Post-Deployment

### Verify Deployment

1. Visit your worker URL
2. You should see the beautiful landing page
3. Try the OAuth flow by clicking "Get Started"
4. Complete Strava authentication
5. Verify you see your personal dashboard with MCP URL

### Test MCP Endpoint

```bash
# Test MCP server info
curl https://your-worker-name.your-subdomain.workers.dev/mcp

# Test tool listing
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":"1","method":"tools/list","params":{}}' \
  https://your-worker-name.your-subdomain.workers.dev/mcp
```

## KV Storage

The deployment automatically creates a KV namespace for session storage. No additional setup required.

## Custom Domain (Optional)

To use a custom domain:

1. Add the domain to your Cloudflare account
2. Update `wrangler.jsonc` with route configuration
3. Update Strava callback domain accordingly

## Troubleshooting

### Common Issues

1. **OAuth Redirect Mismatch**: Ensure callback domain in Strava matches your worker URL
2. **Missing Secrets**: Verify secrets are set with `wrangler secret list`
3. **KV Permissions**: Ensure your account has KV storage enabled

### Debug Mode

Enable debug logging by setting the `DEBUG` environment variable:

```bash
wrangler dev --local
```

## Production Considerations

- Monitor KV storage usage
- Set up Cloudflare Analytics
- Consider rate limiting for high traffic
- Regular backup of configuration

## Updates

To update your deployment:

```bash
git pull
npm install
npm run deploy
```

Your sessions and user data will persist across deployments.