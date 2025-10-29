#!/usr/bin/env node

/**
 * Check webhook subscription status by calling the worker's internal API
 */

const WORKER_URL = 'https://stravamcp.com';

async function checkWebhookStatus() {
  try {
    console.log('Checking webhook subscription status...\n');
    
    // The worker should have an endpoint that checks webhook status
    // For now, let's check if webhook endpoint is accessible
    const testResponse = await fetch(`${WORKER_URL}/webhook?hub.mode=subscribe&hub.verify_token=test&hub.challenge=test123`);
    const testData = await testResponse.json();
    
    if (testResponse.ok && testData['hub.challenge']) {
      console.log('✅ Webhook endpoint is live and responding');
      console.log(`   URL: ${WORKER_URL}/webhook`);
    } else {
      console.log('❌ Webhook endpoint not responding correctly');
    }
    
    console.log('\n📝 To check if Strava has an active subscription:');
    console.log('   You need to provide STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET');
    console.log('   Run: STRAVA_CLIENT_ID=xxx STRAVA_CLIENT_SECRET=xxx node scripts/manage-webhook.js view');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkWebhookStatus();
