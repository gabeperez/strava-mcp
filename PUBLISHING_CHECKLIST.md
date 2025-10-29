# 📋 Publishing Checklist

Before publishing this template to GitHub, make sure you've completed these steps:

## ✅ Configuration Files

- [x] `wrangler.jsonc` - Replace KV namespace ID with `YOUR_KV_NAMESPACE_ID`
- [x] `wrangler.jsonc` - Replace redirect URI with template placeholder
- [x] `.env.example` - Contains no real credentials
- [x] `.gitignore` - Includes `.env`, `.wrangler/`, `.dev.vars`

## ✅ Remove Private Information

- [x] All worker URLs changed to `your-worker-name.your-subdomain.workers.dev`
- [ ] No API keys, secrets, or credentials in code
- [ ] No personal athlete IDs or activity IDs
- [ ] No CloudFlare account IDs or KV namespace IDs

## ✅ Documentation

- [ ] Update `TEMPLATE_README.md` with your GitHub username
- [ ] Replace `YOUR-USERNAME` in all markdown files
- [ ] Add LICENSE file (MIT recommended)
- [ ] Test all code examples in docs

## ✅ GitHub Repository Setup

1. Create new repository on GitHub
2. Choose repository name (e.g., `strava-mcp-oauth`)
3. Add description: "Cloudflare Workers template for Strava MCP server with OAuth and webhook support"
4. Make it public
5. Add topics: `strava`, `mcp`, `cloudflare-workers`, `oauth`, `webhooks`, `poke`

## ✅ Initial Commit

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Strava MCP OAuth template with webhook support"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR-USERNAME/strava-mcp-oauth.git

# Push
git branch -M main
git push -u origin main
```

## ✅ GitHub Settings

1. **README**: Rename `TEMPLATE_README.md` to `README.md` (or update existing)
2. **Topics**: Add relevant topics in repository settings
3. **About**: Add website URL (can be worker URL or docs site)
4. **Releases**: Consider creating v1.0.0 release

## ✅ Optional Enhancements

- [ ] Add GitHub Actions for automated tests
- [ ] Create issue templates
- [ ] Add pull request template
- [ ] Set up GitHub Discussions
- [ ] Add security policy
- [ ] Create wiki for advanced usage

## ✅ Final Checks

- [ ] Clone repo to new location and test deployment
- [ ] Verify no secrets leak in git history: `git log --all -S "YOUR_SECRET_STRING"`
- [ ] Test README instructions from scratch
- [ ] Check all links work in documentation

## 🚀 Ready to Publish!

Once all checks are complete:
1. Make repository public (if not already)
2. Share on Twitter/X with hashtags: #Strava #MCP #CloudflareWorkers
3. Post in Strava developer community
4. Share with Poke community
5. Consider submitting to awesome lists

## 📝 Post-Publication

- Monitor issues and respond to questions
- Accept pull requests that improve the template
- Keep dependencies updated
- Add examples and use cases from community

---

## Files to Review Before Publishing

**Critical Files (must be clean):**
- `wrangler.jsonc` - No real KV IDs or URLs
- `.env.example` - Template only
- All `*.md` files - No personal URLs
- `src/index.ts` - Check for hardcoded URLs
- `scripts/manage-webhook.js` - Check callback URL

**Auto-ignored (safe):**
- `.env` - Never committed
- `.wrangler/` - Build artifacts
- `node_modules/` - Dependencies

## Commands to Find Potential Issues

```bash
# Find any remaining personal URLs
grep -r "perez-jg22" . --exclude-dir={node_modules,.git,.wrangler}

# Find any real KV namespace IDs (32 char hex strings)
grep -rE "[a-f0-9]{32}" . --exclude-dir={node_modules,.git,.wrangler}

# Check for accidentally committed secrets
git log --all --full-history --source --all -- .env

# List all tracked files
git ls-files
```
