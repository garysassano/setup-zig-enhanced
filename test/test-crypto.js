#!/usr/bin/env node

const minisign = require('./minisign.js');

async function testCrypto() {
  console.log('🔍 Testing crypto implementation...');

  try {
    // Test key parsing
    const key = minisign.parseKey('RWSGOq2NVecA2UPNdBUZykf1CCb147pkmdtYxgb3Ti+JO/wCYvhbAb/U');
    console.log('✅ Key parsing works');
    console.log(`   Key ID: ${key.id.toString('hex')}`);
    console.log(`   Public key length: ${key.key.length} bytes`);

    // Test signature parsing with a dummy signature
    const dummySig = `untrusted comment: test signature
RUTGqo3V5wLRm8yQNn8tCNMBAFJY9sH9Jy5vKrIhKrv5YjGBBNQCqJA=
trusted comment: timestamp:1234567890	file:test.txt	hashed
RUTGqo3V5wLRm8yQNn8tCNMBAFJY9sH9Jy5vKrIhKrv5YjGBBNQCqJBBBB=
`;

    try {
      const signature = minisign.parseSignature(Buffer.from(dummySig));
      console.log('✅ Signature parsing works');
      console.log(`   Algorithm: ${signature.algorithm.toString()}`);
      console.log(`   Key ID: ${signature.key_id.toString('hex')}`);
      console.log(`   Trusted comment: ${signature.trusted_comment.toString()}`);
    } catch (e) {
      console.log('⚠️  Signature parsing failed (expected with dummy data):', e.message);
    }

    // Test verification with invalid data (should fail gracefully)
    try {
      const result = await minisign.verifySignature(key, {
        key_id: key.id,
        algorithm: Buffer.from('ED'),
        signature: Buffer.alloc(64),
        trusted_comment: Buffer.from('test'),
        global_signature: Buffer.alloc(64)
      }, Buffer.from('test content'));
      console.log('⚠️  Verification result (expected false):', result);
    } catch (e) {
      console.log('⚠️  Verification failed (expected):', e.message);
    }

  } catch (error) {
    console.log('❌ Crypto test failed:', error.message);
    console.log(error.stack);
    process.exit(1);
  }

  console.log('✅ Basic crypto implementation tests completed');
}

testCrypto();
