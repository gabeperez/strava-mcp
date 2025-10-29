#!/usr/bin/env node

/**
 * Test Poke Notification
 * Sends a test Strava workout notification to Poke
 */

const POKE_API_KEY = process.env.POKE_API_KEY;

if (!POKE_API_KEY) {
  console.error('❌ POKE_API_KEY environment variable is required');
  console.error('Usage: POKE_API_KEY=xxx node scripts/test-poke.js');
  process.exit(1);
}

// Sample Strava workout notification
const testMessage = `🏃 New Strava Workout!

**Morning Run - Test from Webhook Integration**
Type: Run
Date: ${new Date().toLocaleString()}
Distance: 10.5 km
Duration: 52 minutes
Pace: 4:57 min/km
Elevation: 120m
Avg HR: 145 bpm
🏆 2 PRs!

✨ This is a test notification from your Strava MCP webhook integration!`;

async function sendToPoke() {
  console.log('🚀 Sending test notification to Poke...\n');
  
  try {
    const response = await fetch('https://poke.com/api/v1/inbound-sms/webhook', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${POKE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: testMessage }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Poke API error: ${response.status}`);
      console.error(`Response: ${errorText}`);
      process.exit(1);
    }

    const data = await response.json();
    console.log('✅ Successfully sent notification to Poke!');
    console.log('\nResponse:', JSON.stringify(data, null, 2));
    console.log('\n📱 Check your Poke app for the notification!');
    
  } catch (error) {
    console.error('❌ Error sending to Poke:', error.message);
    process.exit(1);
  }
}

sendToPoke();
