# Strava MCP OAuth Worker

A Cloudflare Worker that implements a complete Model Context Protocol (MCP) server for Strava with seamless OAuth authentication. This enables AI assistants like Poke.com, Claude Desktop, and others to access your Strava data through natural language queries.

## ✨ Features

- 🔐 **Seamless Authentication**: Device-based OAuth with no URL management required
- 🏃 **Complete MCP Server**: Full MCP protocol implementation with all Strava tools
- 🔄 **Automatic Token Refresh**: Transparent token renewal for uninterrupted access
- 🌐 **Universal Compatibility**: Works with any MCP client (Poke.com, Claude Desktop, etc.)
- ⚡ **Edge Performance**: Cloudflare Workers for global low-latency access
- 🛡️ **Advanced Security**: Device fingerprinting, session management, secure token storage
- 🔔 **Real-time Webhooks**: Optional push notifications for new Strava activities via Poke

## 🚀 Quick Start

**New to deployment?** See [README_DEPLOY.md](README_DEPLOY.md) for step-by-step instructions!

### 1. Strava API Setup

1. Go to [https://www.strava.com/settings/api](https://www.strava.com/settings/api)
2. Create a new application:
   - Application Name: `Strava MCP OAuth`
   - Website: `https://your-domain.com` (can be any URL)
   - Authorization Callback Domain: `your-worker-name.your-subdomain.workers.dev`
3. Note your **Client ID** and **Client Secret**

### 2. Deploy to Cloudflare Workers

```bash
# Clone and install
git clone <your-repo-url>
cd strava-mcp-oauth
npm install

# Login to Cloudflare
wrangler login

# Create KV namespace
wrangler kv:namespace create STRAVA_SESSIONS
# Copy the namespace ID and update wrangler.jsonc

# Set up environment secrets
wrangler secret put STRAVA_CLIENT_ID
wrangler secret put STRAVA_CLIENT_SECRET

# Deploy the worker
npm run deploy
```

### 3. Link Your Strava Account

1. Visit `https://your-worker-url.workers.dev/auth`
2. Authorize the application with Strava
3. You'll see a success page - the worker is now ready!

### 4. Configure Your MCP Client

**For Poke.com, Claude Desktop, or any MCP client:**

1. Use this MCP server URL:
   ```
   https://your-worker-url.workers.dev/mcp
   ```

2. The first time you use any Strava tool, you'll get an authentication link
3. Click the link, authorize with Strava, and you're done!
4. From then on, the same device/browser will stay authenticated automatically

**No URL management, no API keys, just set it and forget it!**

## MCP Server Details

### Available MCP Tools

| Tool Name | Description |
|-----------|-------------|
| `welcome-strava-mcp` | Welcome message and setup instructions |
| `authenticate-strava` | Get authentication URL (if needed) |
| `get-recent-activities` | Fetch recent Strava activities |
| `get-athlete-profile` | Get athlete profile information |
| `get-athlete-stats` | Get activity statistics (recent, YTD, all-time) |
| `get-activity-details` | Get detailed information about a specific activity |
| `get-activity-streams` | Get time-series data from activities |
| `get-starred-segments` | List segments starred by athlete |
| `explore-segments` | Find popular segments in a geographical area |
| `get-athlete-routes` | List routes created by athlete |

### MCP Endpoints

| Endpoint | Method | Description |
|----------|--------|--------------|
| `/` | GET | Server info and capabilities |
| `/mcp` | GET | MCP server initialization (SSE) |
| `/mcp` | POST | MCP JSON-RPC requests |
| `/auth` | GET | OAuth authentication flow |
| `/callback` | GET | OAuth callback (automatic) |
| `/status` | GET | Check authentication status |

## Usage Examples

### Test MCP Server
```bash
# Check server info
curl https://your-worker-name.your-subdomain.workers.dev/

# Test MCP initialization
curl https://your-worker-name.your-subdomain.workers.dev/mcp

# Test tool listing
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":"1","method":"tools/list","params":{}}' \
  https://your-worker-name.your-subdomain.workers.dev/mcp
```

## MCP Client Setup

### Poke.com
1. Add a new MCP server
2. Enter URL: `https://your-worker-name.your-subdomain.workers.dev/mcp`
3. Save the configuration
4. First query will prompt for authentication

### Claude Desktop
Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "strava": {
      "command": "node",
      "args": ["-e", "console.log('Use the web version at: https://your-worker-name.your-subdomain.workers.dev/mcp')"]
    }
  }
}
```

### Any MCP Client
**Server URL:** `https://your-worker-name.your-subdomain.workers.dev/mcp`

**Natural language queries you can make:**
- "Show me my recent Strava activities"
- "What was my heart rate data from my last run?"
- "Get the power profile for my weekend ride"
- "Find challenging climbs near Boulder, Colorado"
- "What are my all-time cycling stats?"

## Security Features

- **Device Fingerprinting**: Automatic authentication based on browser/device characteristics
- **CSRF Protection**: State parameter validation in OAuth flow
- **Automatic Token Refresh**: Seamless token renewal for uninterrupted access
- **Per-user Isolation**: Each athlete's data is completely separate
- **Secure Token Storage**: Encrypted session storage in Cloudflare KV
- **Rate Limit Awareness**: Respects Strava API limits and quotas
- **Session Management**: 30-day session persistence with automatic cleanup

## How Device Authentication Works

1. **First Time**: When you authenticate via OAuth, the system creates a device fingerprint from your browser's User-Agent and Accept headers
2. **Subsequent Requests**: The same device/browser automatically gets authenticated without requiring new tokens or URL changes
3. **Multiple Devices**: Each device maintains its own authentication state
4. **Privacy**: Only basic browser characteristics are used - no tracking or personal data

## Troubleshooting

### MCP Client Issues
- **"Authentication Required"**: Click the provided auth link in the tool response
- **"Server Not Found"**: Verify the MCP URL includes `/mcp` at the end
- **Connection Timeouts**: Check if your client supports HTTPS MCP servers

### Authentication Issues
1. Visit the authentication URL provided by the `authenticate-strava` tool
2. Ensure you're using the same browser/device for subsequent requests
3. Check `/status` endpoint to verify authentication state

### API Errors
- **401 Unauthorized**: Re-authenticate via the provided OAuth link
- **403 Forbidden**: Check if your Strava app has required scopes
- **429 Rate Limited**: Wait 15 minutes for rate limit reset

## Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server
wrangler dev --local

# Test OAuth flow at http://localhost:8787
```

### Environment Variables
- `STRAVA_CLIENT_ID`: Your Strava app's Client ID
- `STRAVA_CLIENT_SECRET`: Your Strava app's Client Secret (stored as secret)
- `STRAVA_REDIRECT_URI`: Set to worker URL + `/callback`

### KV Namespace
- `STRAVA_SESSIONS`: Stores user sessions and tokens

## Architecture

```
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────┐
│  MCP Client     │───▶│  Cloudflare Worker   │───▶│   Strava API    │
│                 │    │                      │    │                 │
│ • Poke.com      │    │ • MCP Server         │    │ • Activities    │
│ • Claude        │    │ • OAuth Flow         │    │ • Segments      │
│ • Any MCP Client│    │ • Device Auth        │    │ • Routes        │
│                 │    │ • Token Refresh      │    │ • Athlete Data  │
│ Natural Language│    │ • JSON-RPC Handler   │    │ • Streams       │
│ Strava Queries  │    │ • Session Management │    │ • Statistics    │
└─────────────────┘    └──────────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │ Cloudflare KV   │
                       │                 │
                       │ • User Sessions │
                       │ • Device Auth   │
                       │ • OAuth Tokens  │
                       └─────────────────┘
```

### Key Components

1. **MCP Server**: Implements full Model Context Protocol specification
2. **Device Authentication**: Browser fingerprinting for seamless auth
3. **OAuth Integration**: Secure Strava API authentication flow
4. **Session Management**: Persistent authentication with 30-day expiration
5. **Token Refresh**: Automatic renewal of expired access tokens
6. **KV Storage**: Encrypted storage of session data and authentication state

## Contributing

Based on the original [Strava MCP server](https://github.com/r-huijts/strava-mcp) by r-huijts.

## License

MIT License - see original project for details.