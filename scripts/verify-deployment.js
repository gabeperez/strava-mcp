#!/usr/bin/env node

/**
 * Deployment verification script for Strava MCP OAuth Worker
 */

const WORKER_URL = 'https://strava-mcp-oauth.perez-jg22.workers.dev';

async function testEndpoint(path, expectedStatus = 200, description) {
  try {
    const response = await fetch(`${WORKER_URL}${path}`);
    const status = response.status;
    
    if (status === expectedStatus) {
      console.log(`✅ ${description}: ${status}`);
      return true;
    } else {
      console.log(`❌ ${description}: Expected ${expectedStatus}, got ${status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description}: Error - ${error.message}`);
    return false;
  }
}

async function verifyDeployment() {
  console.log('🚀 Verifying Strava MCP OAuth Worker deployment...\n');
  
  const tests = [
    ['/', 200, 'Root endpoint'],
    ['/status', 200, 'Status endpoint'],
    ['/auth', 302, 'Auth redirect'], // Should redirect to Strava
    ['/api/activities/recent', 401, 'Protected API (should require auth)'],
    ['/nonexistent', 404, 'Not found handling']
  ];
  
  // Test protected endpoint properly
  console.log('Testing protected API endpoint behavior...');
  try {
    const response = await fetch(`${WORKER_URL}/api/activities/recent`);
    const data = await response.json();
    if (response.status === 401 && data.error === 'Authentication required') {
      console.log('✅ Protected API correctly requires authentication');
    } else {
      console.log(`❌ Protected API: Expected 401 auth required, got ${response.status}:`, data);
    }
  } catch (error) {
    console.log(`❌ Protected API test failed: ${error.message}`);
  }
  
  let passed = 0;
  let total = tests.length;
  
  for (const [path, expectedStatus, description] of tests) {
    const success = await testEndpoint(path, expectedStatus, description);
    if (success) passed++;
  }
  
  console.log(`\n📊 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 Deployment verification successful!');
    console.log('\n📝 Next steps:');
    console.log('1. Update your Strava app settings at https://www.strava.com/settings/api');
    console.log(`   - Authorization Callback Domain: strava-mcp-oauth.perez-jg22.workers.dev`);
    console.log(`2. Visit ${WORKER_URL}/auth to link your Strava account`);
    console.log(`3. Configure your AI assistant with: ${WORKER_URL}`);
  } else {
    console.log('\n⚠️  Some tests failed. Check the deployment configuration.');
  }
}

// Run verification
verifyDeployment().catch(console.error);