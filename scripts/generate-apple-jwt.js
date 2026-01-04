/**
 * Generate Apple JWT Secret Key for Supabase
 * 
 * Run this script with: node scripts/generate-apple-jwt.js
 * 
 * Make sure you have the private key file (AuthKey_*.p8) in the same directory
 * or provide the path to it.
 */

const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Your Apple credentials
const TEAM_ID = 'D3G5N6DM4U';
const KEY_ID = 'Q4QKG8ST46';
const CLIENT_ID = 'com.getmixwise.web'; // This is your Service ID

// Path to your private key file
// Replace this with the actual path to your .p8 file
const PRIVATE_KEY_PATH = path.join(__dirname, 'AuthKey_Q4QKG8ST46.p8');

// Alternative: If you want to paste the key directly, uncomment this and comment out the file reading
// const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
// MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgEBJM7DbeLIBOK57o
// VLGvRjI0U9khDvCBOnzyTV6gVwygCgYIKoZIzj0DAQehRANCAATraMjXOAClygHJ
// yvHN7hr0Umg4/WdDJNld+hFkaByEsEYDOVW6Q/kIRhxkyzPK0rUFQjnpJKLV6yXA
// 9kHmdECU
// -----END PRIVATE KEY-----`;

try {
  // Read the private key file or use embedded key
  let privateKey;
  if (fs.existsSync(PRIVATE_KEY_PATH)) {
    privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
    console.log('✓ Private key file loaded from:', PRIVATE_KEY_PATH);
  } else {
    // Use the embedded key that was provided
    console.log('ℹ Using provided private key');
    privateKey = `-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgEBJM7DbeLIBOK57o
VLGvRjI0U9khDvCBOnzyTV6gVwygCgYIKoZIzj0DAQehRANCAATraMjXOAClygHJ
yvHN7hr0Umg4/WdDJNld+hFkaByEsEYDOVW6Q/kIRhxkyzPK0rUFQjnpJKLV6yXA
9kHmdECU
-----END PRIVATE KEY-----`;
  }

  // Generate JWT token
  const now = Math.floor(Date.now() / 1000);
  const token = jwt.sign(
    {},
    privateKey,
    {
      algorithm: 'ES256',
      expiresIn: '180d', // Valid for 6 months (max allowed by Apple)
      audience: 'https://appleid.apple.com',
      issuer: TEAM_ID,
      subject: CLIENT_ID,
      keyid: KEY_ID,
      header: {
        alg: 'ES256',
        kid: KEY_ID
      }
    }
  );

  console.log('\n✅ Apple JWT Secret Key Generated!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nCopy this Secret Key and paste it into Supabase:\n');
  console.log(token);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('For Supabase Configuration:');
  console.log(`  Client IDs: ${CLIENT_ID}`);
  console.log(`  Secret Key: [The token above]\n`);
  console.log('⚠️  Keep this token secure! It expires in 6 months.\n');

} catch (error) {
  console.error('❌ Error generating JWT:', error.message);
  console.error('\nMake sure you have the jsonwebtoken package installed:');
  console.error('  npm install jsonwebtoken\n');
  process.exit(1);
}

