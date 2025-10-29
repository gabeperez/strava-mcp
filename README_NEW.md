# 🌴 Strava MCP OAuth - Cloudflare Workers

> **Production-ready MCP server** for Strava with OAuth authentication and real-time webhook notifications

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com/)
[![MCP Protocol](https://img.shields.io/badge/MCP-2024--11--05-blue)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A complete **Model Context Protocol (MCP) server** for Strava that enables AI assistants (Poke, Claude Desktop, etc.) to access your Strava data through natural language. Plus optional real-time webhook notifications when you complete workouts!

## ✨ Features

- 🔐 **Zero-Config OAuth** - Device-based authentication, no URL management
- 🏃 **9 MCP Tools** - Activities, segments, routes, athlete stats, and more
- 🔔 **Real-time Webhooks** - Push notifications via Poke for new activities
- 🔄 **Auto Token Refresh** - Never worry about expired tokens
- 🎨 **Beautiful Dashboard** - Web UI to view your Strava data
- ⚡ **Edge Performance** - Global Cloudflare network, <50ms response times
- 💰 **Free Tier** - 100k requests/day at zero cost

## 🚀 Quick Start

<details open>
<summary><b>📱 Browser/Dashboard Setup (Easiest)</b></summary>

### Perfect for non-technical users who want a web interface

**Step 1: Deploy the Worker**

Use the one-click deploy button or follow [README_DEPLOY.md](README_DEPLOY.md):

```bash
git clone https://github.com/gabeperez/strava-mcp-oauth.git
cd strava-mcp-oauth
npm install
wrangler login
wrangler kv:namespace create STRAVA_SESSIONS
# Update wrangler.jsonc with KV namespace ID
wrangler secret put STRAVA_CLIENT_ID
wrangler secret put STRAVA_CLIENT_SECRET
npm run deploy
```

**Step 2: Visit Your Dashboard**

1. Go to `https://your-worker-url.workers.dev`
2. Click "Authenticate with Strava"
3. Authorize the app
4. You'll see your personal dashboard with:
   - Recent activities
   - Performance stats
   - Personal MCP token
   - Beautiful activity cards

**Step 3: Use with AI Assistants**

From your dashboard, copy your personal MCP URL and add it to:
- **Poke**: Settings → Integrations → Add MCP Server
- **Claude Desktop**: Add to `claude_desktop_config.json`
- **Any MCP Client**: Use the URL shown on your dashboard

That's it! Ask your AI: *"Show me my recent Strava workouts"* 🎉

</details>

<details>
<summary><b>💻 CLI Setup (For Developers)</b></summary>

### For developers who prefer command-line tools

**Prerequisites:**
- Node.js 18+
- Cloudflare account
- Strava API app ([create one](https://www.strava.com/settings/api))

**Step 1: Clone & Install**

```bash
git clone https://github.com/gabeperez/strava-mcp-oauth.git
cd strava-mcp-oauth
npm install
```

**Step 2: Configure Cloudflare**

```bash
# Login to Cloudflare
wrangler login

# Create KV namespace
wrangler kv:namespace create STRAVA_SESSIONS

# Note the namespace ID and update wrangler.jsonc:
# "id": "YOUR_KV_NAMESPACE_ID"
```

**Step 3: Set Secrets**

```bash
# Required
wrangler secret put STRAVA_CLIENT_ID
wrangler secret put STRAVA_CLIENT_SECRET

# Optional (for webhooks)
wrangler secret put STRAVA_WEBHOOK_VERIFY_TOKEN
wrangler secret put POKE_API_KEY
```

**Step 4: Deploy**

```bash
npm run deploy
```

**Step 5: Authenticate**

```bash
# Visit to authenticate
open https://your-worker-url.workers.dev/auth

# Check status
curl https://your-worker-url.workers.dev/status
```

**Step 6: Test MCP**

```bash
# Test server
curl https://your-worker-url.workers.dev/mcp

# List tools
curl -X POST https://your-worker-url.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":"1","method":"tools/list","params":{}}'
```

</details>

## 🔔 Real-time Webhooks (Optional)

Get instant push notifications via Poke when you finish workouts!

<details>
<summary><b>📱 Click to see webhook notification example</b></summary>

```
🏃 New Strava Workout!

**Morning Run**
Type: Run
Date: Oct 29, 2025 7:30 AM
Distance: 10.5 km
Duration: 52 minutes
Pace: 4:57 min/km
Elevation: 120m
Avg HR: 145 bpm
🏆 2 PRs!
```

Sent instantly to your phone via iMessage/SMS when you complete an activity!

</details>

### Quick Webhook Setup

```bash
# 1. Set Poke API key (get from https://poke.com/settings/advanced)
wrangler secret put POKE_API_KEY

# 2. Set webhook verification token
wrangler secret put STRAVA_WEBHOOK_VERIFY_TOKEN
# Enter: STRAVA_MCP_WEBHOOK

# 3. Test endpoint
node scripts/manage-webhook.js test

# 4. Create subscription
STRAVA_CLIENT_ID=xxx STRAVA_CLIENT_SECRET=xxx \
node scripts/manage-webhook.js create

# 5. Monitor events
wrangler tail
```

**See [WEBHOOK_SETUP.md](WEBHOOK_SETUP.md) for complete instructions**

## 📚 Available MCP Tools

Ask your AI assistant natural language questions, and these tools will be called automatically:

| Tool | Example Query |
|------|---------------|
| `get-recent-activities` | "Show me my last 5 workouts" |
| `get-athlete-profile` | "What's my Strava profile info?" |
| `get-athlete-stats` | "What are my cycling stats this year?" |
| `get-activity-details` | "Get details for activity 123456" |
| `get-activity-streams` | "Show me heart rate data from my last run" |
| `get-starred-segments` | "What segments have I starred?" |
| `explore-segments` | "Find climbing segments near San Francisco" |
| `get-athlete-routes` | "List my saved routes" |
| `authenticate-strava` | "How do I connect my Strava account?" |

## 🌐 Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/` | Landing page & documentation |
| `/auth` | Start OAuth flow |
| `/dashboard?token=xxx` | Personal dashboard with stats |
| `/mcp` | MCP server endpoint (for AI assistants) |
| `/webhook` | Strava webhook receiver (optional) |
| `/test-poke` | Test Poke integration |

## 🎯 Usage Examples

### With Poke

1. Add MCP server in Poke settings
2. Use URL: `https://your-worker-url.workers.dev/mcp`
3. Ask: *"What was my pace on yesterday's run?"*

### With Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "strava": {
      "url": "https://your-worker-url.workers.dev/mcp"
    }
  }
}
```

### Natural Language Queries

- "Show me my recent Strava activities"
- "What was my heart rate during my last run?"
- "Get power data from yesterday's bike ride"
- "Find challenging segments near Boulder"
- "What are my all-time cycling stats?"

## 🔒 Security Features

- **Device Fingerprinting** - Automatic authentication by browser
- **Token Refresh** - Seamless renewal before expiration
- **Per-user Isolation** - Complete data separation
- **Secure Storage** - KV encryption for tokens
- **CSRF Protection** - State validation in OAuth flow
- **Rate Limiting** - Respects Strava API quotas

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────┐
│  AI Assistant   │───▶│  Cloudflare Worker   │───▶│   Strava API    │
│  (Poke/Claude)  │    │                      │    │                 │
│                 │    │ • MCP Server         │    │ • Activities    │
│ Natural Language│    │ • OAuth Handler      │    │ • Segments      │
│ Queries         │    │ • Device Auth        │    │ • Routes        │
│                 │    │ • Token Manager      │    │ • Stats         │
│                 │    │ • Webhook Handler    │    │                 │
└─────────────────┘    └──────────────────────┘    └─────────────────┘
                                 │                           │
                                 ▼                           ▼
                       ┌──────────────────┐       ┌─────────────────┐
                       │   Cloudflare KV  │       │   Poke API      │
                       │  • Sessions      │       │  • Push Notify  │
                       │  • OAuth Tokens  │       │  • iMessage/SMS │
                       │  • Activity Data │       └─────────────────┘
                       └──────────────────┘
```

## 📖 Documentation

- [README_DEPLOY.md](README_DEPLOY.md) - Step-by-step deployment (5 minutes)
- [WEBHOOK_SETUP.md](WEBHOOK_SETUP.md) - Complete webhook guide
- [WEBHOOK_QUICKSTART.md](WEBHOOK_QUICKSTART.md) - Quick webhook reference
- [WARP.md](WARP.md) - Development & architecture details
- [PUBLISHING_CHECKLIST.md](PUBLISHING_CHECKLIST.md) - Template publishing guide

## 🛠️ Tech Stack

- **Runtime**: Cloudflare Workers (V8 isolates)
- **Framework**: [Hono](https://hono.dev/) (lightweight web framework)
- **Storage**: Cloudflare KV (sessions & tokens)
- **Protocol**: [Model Context Protocol](https://modelcontextprotocol.io/) (MCP)
- **Auth**: Strava OAuth 2.0
- **Notifications**: [Poke API](https://poke.com/) (optional)

## 💰 Pricing

**100% Free!** Runs on Cloudflare's generous free tier:

- **Workers**: 100,000 requests/day
- **KV Storage**: 100,000 reads/day, 1,000 writes/day  
- **Bandwidth**: Unlimited on free tier

Perfect for personal use. No credit card required.

## 🔧 Development

### Local Testing

```bash
# Install dependencies
npm install

# Start local server
wrangler dev

# Visit http://localhost:8787
```

### Run Tests

```bash
npm test
```

### Environment Variables

See [.env.example](.env.example) for all configuration options.

## 🐛 Troubleshooting

<details>
<summary><b>Authentication Issues</b></summary>

**"Authentication Required" error**
- Visit `/auth` to re-authenticate
- Make sure you're using the same browser/device
- Check `/status` endpoint to verify session

**"Invalid Callback Domain"**
- Verify Strava app callback domain matches worker URL exactly
- Don't include protocol (http://) or path (/callback)

</details>

<details>
<summary><b>Webhook Issues</b></summary>

**Not receiving webhook events**
- Run `node scripts/manage-webhook.js view` to check subscription
- Monitor logs with `wrangler tail`
- Verify athlete is authenticated (visit `/dashboard`)
- Check Strava app has correct OAuth scopes

**Poke notifications not working**
- Verify `POKE_API_KEY` is set: `wrangler secret list`
- Test manually: `curl -X POST https://your-worker-url.workers.dev/test-poke`
- Check logs for Poke API errors

</details>

<details>
<summary><b>Deployment Issues</b></summary>

**"KV namespace not found"**
- Create namespace: `wrangler kv:namespace create STRAVA_SESSIONS`
- Update ID in `wrangler.jsonc`

**"Deployment failed"**
- Verify logged in: `wrangler whoami`
- Check syntax in `wrangler.jsonc`
- Ensure all secrets are set

</details>

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Credits

- Built with [Hono](https://hono.dev/)
- Powered by [Cloudflare Workers](https://workers.cloudflare.com/)
- MCP by [Anthropic](https://www.anthropic.com/)
- Notifications via [Poke](https://poke.com/)
- Inspired by the Strava community 🏃‍♀️🚴‍♂️

## ⭐ Star History

If this project helped you, consider giving it a star!

---

**Made with ❤️ for athletes who love data**

[Report Bug](https://github.com/gabeperez/strava-mcp-oauth/issues) · [Request Feature](https://github.com/gabeperez/strava-mcp-oauth/issues) · [Discussions](https://github.com/gabeperez/strava-mcp-oauth/discussions)
