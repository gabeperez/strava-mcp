# 🌴 Strava MCP OAuth - Cloudflare Workers Template

> **One-click deployable** Strava MCP server with OAuth + optional webhook notifications via Poke

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/YOUR-USERNAME/strava-mcp-oauth)

## What is this?

A production-ready **Model Context Protocol (MCP) server** for Strava that runs on Cloudflare Workers. It enables AI assistants (Poke.com, Claude Desktop, etc.) to access your Strava data through natural language queries with automatic OAuth authentication.

### Key Features

- ✅ **Zero Configuration OAuth** - Device-based auth, no URL management
- ✅ **Real-time Webhooks** - Optional push notifications via Poke for new activities
- ✅ **9 Strava MCP Tools** - Activities, segments, routes, athlete stats, and more
- ✅ **Auto Token Refresh** - Never worry about expired tokens
- ✅ **Cloudflare Free Tier** - 100k requests/day at no cost
- ✅ **Global Edge Network** - Low latency worldwide

## 🚀 Quick Deploy (5 minutes)

### Option 1: One-Click Deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/YOUR-USERNAME/strava-mcp-oauth)

### Option 2: Manual Deploy

See [README_DEPLOY.md](README_DEPLOY.md) for detailed step-by-step instructions.

```bash
# 1. Clone and install
git clone https://github.com/YOUR-USERNAME/strava-mcp-oauth.git
cd strava-mcp-oauth
npm install

# 2. Login to Cloudflare
wrangler login

# 3. Create KV namespace
wrangler kv:namespace create STRAVA_SESSIONS
# Copy the ID and update wrangler.jsonc

# 4. Set secrets
wrangler secret put STRAVA_CLIENT_ID
wrangler secret put STRAVA_CLIENT_SECRET

# 5. Deploy!
npm run deploy
```

## 📚 What You Get

### MCP Tools

| Tool | Description |
|------|-------------|
| `welcome-strava-mcp` | Welcome message and setup instructions |
| `authenticate-strava` | Get authentication URL if needed |
| `get-recent-activities` | Fetch recent Strava activities |
| `get-athlete-profile` | Get athlete profile information |
| `get-athlete-stats` | Get activity statistics (recent, YTD, all-time) |
| `get-activity-details` | Get detailed information about a specific activity |
| `get-activity-streams` | Get time-series data (HR, power, cadence, etc.) |
| `get-starred-segments` | List segments starred by athlete |
| `explore-segments` | Find popular segments in a geographical area |
| `get-athlete-routes` | List routes created by athlete |

### Endpoints

- `/` - Landing page with setup instructions
- `/auth` - OAuth authentication flow
- `/dashboard` - Personal Strava dashboard
- `/mcp` - MCP server endpoint
- `/webhook` - Strava webhook notifications (optional)
- `/test-poke` - Test Poke integration

## 🔔 Optional: Webhook Notifications

Get instant push notifications via Poke when you complete workouts:

```bash
# 1. Set webhook secrets
wrangler secret put STRAVA_WEBHOOK_VERIFY_TOKEN
wrangler secret put POKE_API_KEY

# 2. Create webhook subscription
STRAVA_CLIENT_ID=xxx STRAVA_CLIENT_SECRET=xxx \
node scripts/manage-webhook.js create

# 3. Monitor events
wrangler tail
```

See [WEBHOOK_SETUP.md](WEBHOOK_SETUP.md) for complete instructions.

## 💬 Example Queries

Once connected, ask your AI assistant:

- "Show me my recent Strava activities"
- "What was my heart rate during my last run?"
- "Get power data from yesterday's bike ride"
- "Find challenging segments near San Francisco"
- "What are my all-time cycling stats?"

## 🎯 Use Cases

- **Training Analysis**: Query your workout data through natural language
- **Route Planning**: Find and explore segments in any location
- **Performance Tracking**: Get stats and trends without opening Strava
- **Activity Notifications**: Instant Poke alerts when you finish workouts
- **AI Coaching**: Let AI assistants analyze your training data

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────┐
│  MCP Client     │───▶│  Cloudflare Worker   │───▶│   Strava API    │
│  (Poke/Claude)  │    │                      │    │                 │
│                 │    │ • MCP Server         │    │ • Activities    │
│ Natural Language│    │ • OAuth Flow         │    │ • Segments      │
│ Queries         │    │ • Device Auth        │    │ • Routes        │
│                 │    │ • Token Refresh      │    │ • Athlete Data  │
└─────────────────┘    └──────────────────────┘    └─────────────────┘
                                 │
                                 ▼
                       ┌──────────────────┐
                       │   Cloudflare KV  │
                       │  • Sessions      │
                       │  • OAuth Tokens  │
                       │  • Activity Data │
                       └──────────────────┘
```

## 📖 Documentation

- [README_DEPLOY.md](README_DEPLOY.md) - Step-by-step deployment guide
- [README.md](README.md) - Full technical documentation
- [WEBHOOK_SETUP.md](WEBHOOK_SETUP.md) - Webhook configuration guide
- [WEBHOOK_QUICKSTART.md](WEBHOOK_QUICKSTART.md) - Quick webhook reference
- [WARP.md](WARP.md) - Development and architecture guide

## 🛠️ Tech Stack

- **Runtime**: Cloudflare Workers (V8 isolates)
- **Framework**: Hono (web framework)
- **Storage**: Cloudflare KV (sessions & tokens)
- **Protocol**: Model Context Protocol (MCP)
- **OAuth**: Strava OAuth 2.0
- **Webhooks**: Strava webhook events → Poke API

## 💰 Cost

**Free!** Runs entirely on Cloudflare's generous free tier:
- Workers: 100,000 requests/day
- KV: 100,000 reads/day, 1,000 writes/day
- Perfect for personal use

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📝 License

MIT License - feel free to use this template for your own projects!

## 🙏 Credits

- Built with [Hono](https://hono.dev/)
- Powered by [Cloudflare Workers](https://workers.cloudflare.com/)
- MCP by [Anthropic](https://www.anthropic.com/mcp)
- Notifications via [Poke](https://poke.com/)

## ⭐ Star History

If this template helped you, consider giving it a star!

---

**Made with ❤️ for the Strava community**

[Report Bug](https://github.com/YOUR-USERNAME/strava-mcp-oauth/issues) · [Request Feature](https://github.com/YOUR-USERNAME/strava-mcp-oauth/issues)
