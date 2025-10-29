# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Quick Commands

### Development
```bash
# Install dependencies
npm install

# Start local development server 
wrangler dev

# Run tests with Vitest
npm test

# Generate TypeScript types for Cloudflare Workers
npm run cf-typegen
```

### Deployment
```bash
# Login to Cloudflare (first time only)
wrangler login

# Set Strava API secrets
wrangler secret put STRAVA_CLIENT_ID
wrangler secret put STRAVA_CLIENT_SECRET

# Set webhook secrets (optional - for real-time notifications)
wrangler secret put STRAVA_WEBHOOK_VERIFY_TOKEN
wrangler secret put POKE_API_KEY

# Deploy to production
npm run deploy
# or: wrangler deploy

# Verify deployment
node scripts/verify-deployment.js
```

### Testing MCP Server
```bash
# Test server capabilities
curl https://your-worker.workers.dev/mcp

# Test tool listing  
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":"1","method":"tools/list","params":{}}' \
  https://your-worker.workers.dev/mcp
```

### Webhook Management
```bash
# Test webhook endpoint
node scripts/manage-webhook.js test

# Create webhook subscription
STRAVA_CLIENT_ID=xxx STRAVA_CLIENT_SECRET=xxx node scripts/manage-webhook.js create

# View active subscription
STRAVA_CLIENT_ID=xxx STRAVA_CLIENT_SECRET=xxx node scripts/manage-webhook.js view

# Delete subscription
STRAVA_CLIENT_ID=xxx STRAVA_CLIENT_SECRET=xxx node scripts/manage-webhook.js delete

# Monitor webhook events in real-time
wrangler tail
```

## Architecture Overview

This is a **Cloudflare Workers** application that implements a **Model Context Protocol (MCP) server** for Strava API integration with OAuth authentication.

### Core Components

- **Entry Point**: `src/index.ts` - Hono-based web server with routing and middleware
- **MCP Server**: `src/mcp-server.ts` - Implements full MCP protocol with 9 Strava tools
- **OAuth Flow**: `src/auth.ts` + `src/session.ts` - Device-based authentication with KV storage
- **API Proxy**: `src/api.ts` + `src/middleware.ts` - Authenticated Strava API wrapper
- **Templates**: `src/templates.ts` - Landing page and dashboard HTML generation
- **Webhooks**: `src/webhook.ts` - Real-time Strava activity notifications with Poke integration

### Key Features

1. **Device Authentication**: Browser fingerprinting for seamless MCP client auth
2. **KV Session Storage**: Persistent authentication with automatic token refresh  
3. **Complete MCP Implementation**: 9 Strava tools (activities, segments, routes, stats)
4. **Protected API Routes**: `/api/*` endpoints with authentication middleware
5. **Beautiful Web Interface**: Landing page + personal dashboard at `/dashboard`
6. **Real-time Webhooks**: Strava webhook integration for instant activity notifications via Poke

### MCP Tools Available

- `welcome-strava-mcp` - Setup instructions
- `authenticate-strava` - Get OAuth URL
- `get-recent-activities` - Fetch activities  
- `get-athlete-profile` - Profile info
- `get-athlete-stats` - Statistics (recent, YTD, all-time)
- `get-activity-details` - Specific activity data
- `get-activity-streams` - Time-series data (HR, power, etc.)
- `get-starred-segments` - Starred segments
- `explore-segments` - Find segments by location
- `get-athlete-routes` - Created routes

## Development Workflow

### Initial Setup
1. Clone repository: `git clone <repo-url>`
2. Install dependencies: `npm install`
3. Login to Cloudflare: `wrangler login` (uses CloudFlare CLI per user preference)
4. Copy environment template: `cp .env.example .env` (if exists)

### Local Development
```bash
# Start local dev server with KV bindings
wrangler dev

# Visit http://localhost:8787 to test OAuth flow
# MCP endpoint available at http://localhost:8787/mcp
```

### Environment Configuration
**Required Secrets** (set with `wrangler secret put`):
- `STRAVA_CLIENT_ID` - From Strava API app settings
- `STRAVA_CLIENT_SECRET` - From Strava API app settings  

**Optional Secrets** (for webhook functionality):
- `STRAVA_WEBHOOK_VERIFY_TOKEN` - Token to verify webhook callbacks (e.g., "STRAVA_MCP_WEBHOOK")
- `POKE_API_KEY` - API key for Poke notification service

**Environment Variables** (in `wrangler.jsonc`):
- `STRAVA_REDIRECT_URI` - OAuth callback URL (worker domain + `/callback`)

**KV Namespace**:
- `STRAVA_SESSIONS` - Stores user sessions, OAuth tokens, and webhook activity summaries

### Testing  
- **Unit Tests**: `npm test` (Vitest with Cloudflare Workers integration)
- **Integration Tests**: Run `scripts/verify-deployment.js` after deployment
- **Manual Testing**: Use `/dashboard` to verify OAuth flow and data access

### Deployment Process
1. Update `STRAVA_REDIRECT_URI` in `wrangler.jsonc` to match worker domain
2. Set Strava app Authorization Callback Domain to match worker URL  
3. Deploy with `npm run deploy`
4. Run verification script to test all endpoints
5. Update Strava app settings if domain changed

### Project Structure
```
src/
├── index.ts          # Main Hono app with routing
├── mcp-server.ts     # MCP protocol implementation  
├── auth.ts           # OAuth handlers
├── session.ts        # KV session management
├── middleware.ts     # Auth middleware + API proxy
├── api.ts           # Strava API handlers
├── webhook.ts        # Webhook verification and event handling
├── templates.ts     # HTML template engine
├── types.ts         # TypeScript interfaces
└── worker-fixed.ts  # Worker type fixes

test/
├── index.spec.ts    # Basic integration tests
├── env.d.ts        # Test environment types
└── tsconfig.json   # Test-specific TS config

scripts/
├── verify-deployment.js  # Post-deploy verification
└── manage-webhook.js     # Webhook subscription management

wrangler.jsonc       # Cloudflare Workers config
vitest.config.mts    # Vitest configuration
```

### Authentication Flow
1. User visits `/auth` → redirects to Strava OAuth
2. Strava redirects to `/callback` → exchanges code for tokens  
3. Creates device fingerprint from browser headers
4. Stores session in KV with 30-day expiration
5. MCP clients authenticate via device fingerprint or personal token
6. Tokens auto-refresh 5 minutes before expiry

### Webhook Flow (Optional)
1. Create webhook subscription via `manage-webhook.js` script
2. Strava verifies callback URL with GET request to `/webhook`
3. When activities are created/updated/deleted, Strava POSTs to `/webhook`
4. Worker fetches full activity details using athlete's stored token
5. Formats activity message and sends to Poke API (if configured)
6. Stores activity summary in KV for 30 days
7. Handles athlete deauthorization events automatically

**Supported Webhook Events:**
- Activity created (new workouts)
- Activity updated (title, type, privacy changes)
- Activity deleted
- Athlete deauthorized (auto-cleanup)

This architecture enables AI assistants to access personal Strava data through natural language queries while maintaining secure, per-user authentication, with optional real-time push notifications for new activities.
