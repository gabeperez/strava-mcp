# 🌴 Strava MCP OAuth - Cloudflare Workers

> **Production-ready MCP server** for Strava with OAuth authentication and real-time webhook notifications

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/gabeperez/strava-mcp-oauth)

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

**Step 1: Deploy to Cloudflare Workers**

**Option A: Automated Setup** ⚡ **Recommended for First-Time Users**

This option runs one script that does everything for you!

1. **Open your Terminal** (Mac: Cmd+Space, type "Terminal". Windows: search "Command Prompt")

2. **Copy and paste these commands** one at a time:

   ```bash
   # Download the project
   git clone https://github.com/gabeperez/strava-mcp-oauth.git
   
   # Go into the folder
   cd strava-mcp-oauth
   
   # Install dependencies
   npm install
   
   # Login to Cloudflare (opens browser)
   wrangler login
   
   # Run the automated setup
   node scripts/setup.js
   ```

3. **Follow the prompts** - the script will ask you for:
   - Your Strava Client ID (from https://www.strava.com/settings/api)
   - Your Strava Client Secret
   - (Optional) Poke API key for notifications

4. **Done!** The script automatically:
   - ✅ Creates your database (KV namespace)
   - ✅ Updates all configuration files
   - ✅ Sets your secrets securely
   - ✅ Deploys your worker to Cloudflare
   - ✅ Gives you your worker URL

**Option B: Step-by-Step Manual Guide**

Prefer to do it yourself? See [README_DEPLOY.md](README_DEPLOY.md) for detailed instructions.

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
<summary><b>💻 Advanced: Manual CLI Setup</b></summary>

### For developers who want full control

If you prefer to configure everything manually instead of using the automated script:

**Prerequisites:**
- Node.js 18+ installed ([download here](https://nodejs.org/))
- Cloudflare account (free) - [sign up](https://dash.cloudflare.com/sign-up)
- Strava API app - [create one](https://www.strava.com/settings/api)

**Commands to run:**

```bash
# 1. Download and install
git clone https://github.com/gabeperez/strava-mcp-oauth.git
cd strava-mcp-oauth
npm install

# 2. Login to Cloudflare (opens browser)
wrangler login

# 3. Create database (KV namespace)
wrangler kv:namespace create STRAVA_SESSIONS
# Copy the "id" from output and paste into wrangler.jsonc

# 4. Set your Strava API credentials
wrangler secret put STRAVA_CLIENT_ID
# Paste your Client ID when prompted

wrangler secret put STRAVA_CLIENT_SECRET
# Paste your Client Secret when prompted

# 5. Deploy to Cloudflare
npm run deploy

# 6. Visit your worker URL to authenticate
open https://your-worker-name.your-subdomain.workers.dev/auth
```

**Optional: Set up webhooks**

```bash
wrangler secret put STRAVA_WEBHOOK_VERIFY_TOKEN
wrangler secret put POKE_API_KEY
```

See [README_DEPLOY.md](README_DEPLOY.md) for detailed manual setup guide.

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
