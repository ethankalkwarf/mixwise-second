/**
 * Generate Apple JWT Secret Key for Supabase (Clean Output)
 */

const jwt = require('jsonwebtoken');

// Your Apple credentials
const TEAM_ID = 'D3G5N6DM4U';
const KEY_ID = 'Q4QKG8ST46';
const CLIENT_ID = 'com.getmixwise.web';

// Private key - make sure this is the COMPLETE key from your .p8 file
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgEBJM7DbeLIBOK57o
VLGvRjI0U9khDvCBOnzyTV6gVwygCgYIKoZIzj0DAQehRANCAATraMjXOAClygHJ
yvHN7hr0Umg4/WdDJNld+hFkaByEsEYDOVW6Q/kIRhxkyzPK0rUFQjnpJKLV6yXA
9kHmdECU
-----END PRIVATE KEY-----`;

try {
  // Generate JWT token
  const token = jwt.sign(
    {},
    PRIVATE_KEY,
    {
      algorithm: 'ES256',
      expiresIn: '180d',
      audience: 'https://appleid.apple.com',
      issuer: TEAM_ID,
      subject: CLIENT_ID,
      keyid: KEY_ID,
    }
  );

  // Output clean token (no extra spaces or newlines)
  console.log(token.trim());

} catch (error) {
  console.error('Error:', error.message);
  console.error('\nPossible issues:');
  console.error('1. The private key might be incomplete');
  console.error('2. Make sure you have the FULL .p8 file content including BEGIN/END lines');
  console.error('3. Check that the private key has no extra spaces or characters');
  process.exit(1);
}

