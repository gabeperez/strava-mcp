# Strava Webhook Quick Start

## 🚀 Setup (3 minutes)

```bash
# 1. Set Poke API key (optional)
wrangler secret put POKE_API_KEY

# 2. Create webhook subscription
STRAVA_CLIENT_ID=xxx STRAVA_CLIENT_SECRET=xxx \
node scripts/manage-webhook.js create

# 3. Monitor events
wrangler tail
```

## ✅ Verify Setup

```bash
# View subscription
STRAVA_CLIENT_ID=xxx STRAVA_CLIENT_SECRET=xxx \
node scripts/manage-webhook.js view
```

## 🧪 Test

1. Upload activity on Strava
2. Watch `wrangler tail` output
3. Check for notification (if Poke configured)

## 🔧 Manage

```bash
# Test endpoints
node scripts/manage-webhook.js test

# Delete subscription
STRAVA_CLIENT_ID=xxx STRAVA_CLIENT_SECRET=xxx \
node scripts/manage-webhook.js delete
```

## 📖 Full Documentation

- **Setup Guide**: `WEBHOOK_SETUP.md`
- **Architecture**: `WARP.md`
- **Summary**: `DEPLOYMENT_SUMMARY.md`

## 🆘 Troubleshooting

**Not receiving events?**
- Check subscription exists: `manage-webhook.js view`
- Monitor logs: `wrangler tail`
- Verify user is authenticated

**Subscription creation fails?**
- Delete existing: `manage-webhook.js delete`
- Test endpoint: `manage-webhook.js test`
- Check secrets are set

## 📝 What Gets Sent

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

## 🔐 Security

- Verification token required
- Secrets stored in Wrangler
- 2-second response requirement
- Async processing via waitUntil()
