#!/usr/bin/env node

/**
 * Automated Setup Script for Strava MCP OAuth
 * Handles KV namespace creation and configuration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

function exec(command, silent = false) {
  try {
    const output = execSync(command, { encoding: 'utf8' });
    if (!silent) console.log(output);
    return output;
  } catch (error) {
    console.error(`Error executing: ${command}`);
    console.error(error.message);
    throw error;
  }
}

async function main() {
  console.log('🌴 Strava MCP OAuth - Automated Setup\n');
  console.log('This script will:\n');
  console.log('  1. Create a KV namespace');
  console.log('  2. Update wrangler.jsonc');
  console.log('  3. Set your secrets');
  console.log('  4. Deploy your worker\n');

  // Check if wrangler is installed
  try {
    exec('wrangler --version', true);
  } catch {
    console.error('❌ Wrangler not found. Please install it first:');
    console.error('   npm install -g wrangler');
    process.exit(1);
  }

  // Check if logged in
  try {
    exec('wrangler whoami', true);
  } catch {
    console.error('❌ Not logged in to Cloudflare. Please run:');
    console.error('   wrangler login');
    process.exit(1);
  }

  console.log('✅ Wrangler is installed and you\'re logged in\n');

  // Step 1: Create KV namespace
  console.log('📦 Step 1: Creating KV namespace...');
  const kvOutput = exec('wrangler kv:namespace create STRAVA_SESSIONS');
  
  // Extract namespace ID from output
  const match = kvOutput.match(/id = "([a-f0-9]+)"/);
  if (!match) {
    console.error('❌ Could not extract KV namespace ID');
    process.exit(1);
  }
  
  const kvNamespaceId = match[1];
  console.log(`✅ KV namespace created: ${kvNamespaceId}\n`);

  // Step 2: Update wrangler.jsonc
  console.log('📝 Step 2: Updating wrangler.jsonc...');
  const wranglerPath = path.join(__dirname, '..', 'wrangler.jsonc');
  let wranglerConfig = fs.readFileSync(wranglerPath, 'utf8');
  
  // Replace placeholder with actual ID
  wranglerConfig = wranglerConfig.replace(
    /"id": "YOUR_KV_NAMESPACE_ID"/,
    `"id": "${kvNamespaceId}"`
  );
  
  fs.writeFileSync(wranglerPath, wranglerConfig);
  console.log('✅ wrangler.jsonc updated\n');

  // Step 3: Get worker URL and update redirect URI
  const workerName = 'strava-mcp-oauth';
  const whoami = exec('wrangler whoami', true);
  const accountMatch = whoami.match(/Account ID:\s+([a-f0-9]+)/i);
  
  let workerUrl;
  if (accountMatch) {
    // Try to get subdomain from account
    workerUrl = `https://${workerName}.YOUR-SUBDOMAIN.workers.dev`;
    console.log('⚠️  Please update STRAVA_REDIRECT_URI in wrangler.jsonc manually');
    console.log(`   Replace YOUR-SUBDOMAIN with your actual Cloudflare subdomain\n`);
  } else {
    workerUrl = await question('Enter your worker URL (e.g., https://strava-mcp-oauth.myname.workers.dev): ');
  }

  // Update redirect URI if user provided URL
  if (workerUrl && !workerUrl.includes('YOUR-SUBDOMAIN')) {
    wranglerConfig = fs.readFileSync(wranglerPath, 'utf8');
    wranglerConfig = wranglerConfig.replace(
      /"STRAVA_REDIRECT_URI": "[^"]+"/,
      `"STRAVA_REDIRECT_URI": "${workerUrl}/callback"`
    );
    fs.writeFileSync(wranglerPath, wranglerConfig);
    console.log('✅ Redirect URI updated\n');
  }

  // Step 4: Set secrets
  console.log('🔐 Step 3: Setting secrets...\n');
  
  const stravaClientId = await question('Enter your Strava Client ID: ');
  exec(`echo "${stravaClientId}" | wrangler secret put STRAVA_CLIENT_ID`, true);
  console.log('✅ STRAVA_CLIENT_ID set');
  
  const stravaClientSecret = await question('Enter your Strava Client Secret: ');
  exec(`echo "${stravaClientSecret}" | wrangler secret put STRAVA_CLIENT_SECRET`, true);
  console.log('✅ STRAVA_CLIENT_SECRET set\n');

  // Optional: Webhook secrets
  const setupWebhooks = await question('Set up webhooks? (y/N): ');
  if (setupWebhooks.toLowerCase() === 'y') {
    const webhookToken = await question('Enter webhook verify token (or press Enter for default): ') || 'STRAVA_MCP_WEBHOOK';
    exec(`echo "${webhookToken}" | wrangler secret put STRAVA_WEBHOOK_VERIFY_TOKEN`, true);
    console.log('✅ STRAVA_WEBHOOK_VERIFY_TOKEN set');
    
    const pokeApiKey = await question('Enter Poke API key (from https://poke.com/settings/advanced): ');
    if (pokeApiKey) {
      exec(`echo "${pokeApiKey}" | wrangler secret put POKE_API_KEY`, true);
      console.log('✅ POKE_API_KEY set');
    }
  }

  // Step 5: Deploy
  console.log('\n🚀 Step 4: Deploying worker...');
  exec('npm run deploy');
  
  console.log('\n✨ Setup complete! Your Strava MCP server is live!\n');
  console.log('Next steps:');
  console.log(`  1. Visit ${workerUrl || 'your-worker-url'}/auth to authenticate`);
  console.log(`  2. Add your MCP URL to Poke or Claude Desktop`);
  console.log(`  3. Start asking questions about your Strava data!\n`);
  
  if (setupWebhooks === 'y') {
    console.log('To activate webhooks:');
    console.log(`  STRAVA_CLIENT_ID=${stravaClientId} STRAVA_CLIENT_SECRET=${stravaClientSecret} node scripts/manage-webhook.js create\n`);
  }

  rl.close();
}

main().catch(error => {
  console.error('\n❌ Setup failed:', error.message);
  rl.close();
  process.exit(1);
});
