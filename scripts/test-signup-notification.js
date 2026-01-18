/**
 * Test script to send a signup notification email
 * 
 * Usage:
 *   node scripts/test-signup-notification.js
 * 
 * Requires RESEND_API_KEY environment variable to be set
 */

const https = require('https');
const http = require('http');

const TEST_URL = process.env.TEST_URL || 'http://localhost:3000/api/auth/test-signup-notification';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'MixWise-Test-Script',
      },
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function test() {
  console.log('🧪 Testing signup notification email...\n');
  console.log(`📍 Testing URL: ${TEST_URL}\n`);

  try {
    const result = await makeRequest(TEST_URL);
    
    if (result.status === 200 && result.data.ok) {
      console.log('✅ Test email sent successfully!');
      console.log(`📧 Sent to: ${result.data.sentTo}`);
      console.log(`🆔 Resend ID: ${result.data.resendId}`);
      console.log(`\n💡 Check the inbox at ${result.data.sentTo} for the test email.`);
    } else {
      console.log('❌ Test failed:');
      console.log(`Status: ${result.status}`);
      console.log(`Response:`, JSON.stringify(result.data, null, 2));
      
      if (result.data.error === 'RESEND_API_KEY not configured') {
        console.log('\n💡 To fix this:');
        console.log('1. Set RESEND_API_KEY in your .env.local file');
        console.log('2. Restart your dev server (npm run dev)');
        console.log('3. Or test in production where the key is already configured');
      }
    }
  } catch (error) {
    console.error('❌ Error making request:', error.message);
    console.log('\n💡 Make sure:');
    console.log('1. Your dev server is running (npm run dev)');
    console.log('2. Or use production URL: https://www.getmixwise.com/api/auth/test-signup-notification');
  }
}

test();

