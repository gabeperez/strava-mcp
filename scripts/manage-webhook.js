#!/usr/bin/env node

/**
 * Strava Webhook Management Script
 * Helps create, view, and delete webhook subscriptions
 * 
 * Usage:
 *   node scripts/manage-webhook.js create
 *   node scripts/manage-webhook.js view
 *   node scripts/manage-webhook.js delete
 *   node scripts/manage-webhook.js test
 */

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

// Get environment variables
const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const CALLBACK_URL = process.env.STRAVA_WEBHOOK_CALLBACK_URL || 'https://your-worker-name.your-subdomain.workers.dev/webhook';
const VERIFY_TOKEN = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || 'STRAVA_MCP_WEBHOOK';

// Command line argument
const command = process.argv[2];

if (!command) {
  console.error('Usage: node manage-webhook.js <command>');
  console.error('Commands: create, view, delete, test');
  process.exit(1);
}

// Main execution
(async () => {
  try {
    switch (command) {
      case 'create':
        await createSubscription();
        break;
      case 'view':
        await viewSubscription();
        break;
      case 'delete':
        await deleteSubscription();
        break;
      case 'test':
        await testWebhook();
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.error('Valid commands: create, view, delete, test');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

/**
 * Create a new webhook subscription
 */
async function createSubscription() {
  console.log('Creating webhook subscription...');
  console.log(`Callback URL: ${CALLBACK_URL}`);
  console.log(`Verify Token: ${VERIFY_TOKEN}`);

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET environment variables are required');
  }

  // Create subscription using form data
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    callback_url: CALLBACK_URL,
    verify_token: VERIFY_TOKEN
  });

  const response = await fetch(`${STRAVA_API_BASE}/push_subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString()
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create subscription: ${response.status} - ${error}`);
  }

  const data = await response.json();
  console.log('✅ Webhook subscription created successfully!');
  console.log(JSON.stringify(data, null, 2));
  console.log('\nSubscription ID:', data.id);
  console.log('\n⚠️  Make sure to set the following secrets in your worker:');
  console.log(`   wrangler secret put STRAVA_WEBHOOK_VERIFY_TOKEN`);
  console.log(`   (Enter: ${VERIFY_TOKEN})`);
}

/**
 * View existing webhook subscription
 */
async function viewSubscription() {
  console.log('Fetching webhook subscription...');

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET environment variables are required');
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  });

  const response = await fetch(`${STRAVA_API_BASE}/push_subscriptions?${params.toString()}`);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch subscription: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  if (!data || data.length === 0) {
    console.log('ℹ️  No webhook subscription found for this app');
    return;
  }

  console.log('✅ Active webhook subscription:');
  console.log(JSON.stringify(data, null, 2));
}

/**
 * Delete webhook subscription
 */
async function deleteSubscription() {
  console.log('Fetching subscription to delete...');

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET environment variables are required');
  }

  // First, get the subscription ID
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  });

  const listResponse = await fetch(`${STRAVA_API_BASE}/push_subscriptions?${params.toString()}`);

  if (!listResponse.ok) {
    throw new Error(`Failed to fetch subscription: ${listResponse.status}`);
  }

  const subscriptions = await listResponse.json();
  
  if (!subscriptions || subscriptions.length === 0) {
    console.log('ℹ️  No webhook subscription found to delete');
    return;
  }

  const subscriptionId = subscriptions[0].id;
  console.log(`Deleting subscription ID: ${subscriptionId}`);

  const deleteResponse = await fetch(
    `${STRAVA_API_BASE}/push_subscriptions/${subscriptionId}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
    { method: 'DELETE' }
  );

  if (deleteResponse.status === 204) {
    console.log('✅ Webhook subscription deleted successfully');
  } else {
    const error = await deleteResponse.text();
    throw new Error(`Failed to delete subscription: ${deleteResponse.status} - ${error}`);
  }
}

/**
 * Test webhook endpoint
 */
async function testWebhook() {
  console.log('Testing webhook endpoint...');
  console.log(`Callback URL: ${CALLBACK_URL}`);

  // Test verification endpoint
  console.log('\n1️⃣ Testing verification endpoint (GET)...');
  const verifyUrl = `${CALLBACK_URL}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=test_challenge_123`;
  
  try {
    const verifyResponse = await fetch(verifyUrl);
    const verifyData = await verifyResponse.json();
    
    if (verifyResponse.ok && verifyData['hub.challenge'] === 'test_challenge_123') {
      console.log('✅ Verification endpoint working correctly');
    } else {
      console.log('❌ Verification endpoint failed:', verifyData);
    }
  } catch (error) {
    console.error('❌ Verification test failed:', error.message);
  }

  // Test event endpoint
  console.log('\n2️⃣ Testing event endpoint (POST)...');
  const testEvent = {
    aspect_type: 'create',
    event_time: Math.floor(Date.now() / 1000),
    object_id: 1234567890,
    object_type: 'activity',
    owner_id: 9999999,
    subscription_id: 999999
  };

  try {
    const eventResponse = await fetch(CALLBACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testEvent)
    });

    const eventData = await eventResponse.json();
    
    if (eventResponse.ok && eventData.success) {
      console.log('✅ Event endpoint working correctly');
    } else {
      console.log('❌ Event endpoint failed:', eventData);
    }
  } catch (error) {
    console.error('❌ Event test failed:', error.message);
  }

  console.log('\n✅ Webhook tests complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. If tests passed, create the subscription with: node scripts/manage-webhook.js create');
  console.log('   2. Monitor logs with: wrangler tail');
  console.log('   3. Upload a test activity on Strava to trigger a real webhook');
}
