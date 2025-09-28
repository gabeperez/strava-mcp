# 🏃 **Strava MCP Setup Guide**

## 🚀 **Quick Setup (2 Steps)**

### **Step 1: Get Your API Key**
1. 👉 **[Click here to authenticate](https://strava-mcp-oauth.perez-jg22.workers.dev/auth)**
2. 🔐 Log in with your Strava account  
3. 🔑 **Copy your API Key** from the success page (starts with `strava_`)

### **Step 2: Configure Your MCP Client**
Add these to your AI assistant (Poke, Claude, etc.):

**MCP Server URL:**
```
https://strava-mcp-oauth.perez-jg22.workers.dev/mcp
```

**API Key:** *(paste the key you copied)*
```
strava_[your_key_here]
```

---

## 🎯 **For Poke.com Users**

1. Go to **MCP URL** platform in Poke
2. **Server URL**: `https://strava-mcp-oauth.perez-jg22.workers.dev/mcp`
3. **API Key**: Paste your API key from Step 1
4. Click **Add Integration**

---

## ✅ **Test It Works**

Once set up, try asking:
> *"Welcome me to Strava MCP and show me my recent activities"*

---

## 🔐 **Privacy & Security**

- ✅ **Your data stays private** - each person authenticates separately
- ✅ **API keys are unique** per user and per session
- ✅ **No shared access** - you only see your own Strava data
- ✅ **Secure OAuth** - uses official Strava authentication

---

## 🆘 **Troubleshooting**

**"Authentication Required" error?**
- Make sure you added the API key to your MCP client
- Try getting a fresh API key by re-authenticating

**"Invalid MCP server URL" error?**  
- Use the `/mcp` endpoint: `https://strava-mcp-oauth.perez-jg22.workers.dev/mcp`
- Not the root URL

**Still having issues?**
- Check that your Strava account is properly connected
- Try refreshing your API key

---

**🎉 Ready to analyze your Strava data with AI!**