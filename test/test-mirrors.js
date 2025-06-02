#!/usr/bin/env node

// Debug script to test actual mirror URLs and identify the issue

const https = require('https');
const http = require('http');

async function testMirrorURLs() {
  console.log('🔍 Testing mirror URLs for Zig 0.14.1...');

  // Test different filename formats for Zig 0.14.1
  const testFormats = [
    'zig-linux-x86_64-0.14.1.tar.xz',  // Legacy format
    'zig-x86_64-linux-0.14.1.tar.xz'   // New format
  ];

  // Test mirrors from mirrors.json
  const mirrors = [
    'https://pkg.machengine.org/zig',
    'https://zigmirror.hryx.net/zig',
    'https://ziglang.org/builds'  // Official site as last resort
  ];

  for (const mirror of mirrors) {
    console.log(`\n📡 Testing mirror: ${mirror}`);

    for (const filename of testFormats) {
      const url = `${mirror}/${filename}`;
      console.log(`  🔗 Testing: ${url}`);

      try {
        const response = await testURL(url);
        console.log(`    ✅ Status: ${response.status}`);
        if (response.status === 200) {
          console.log(`    📦 Content-Length: ${response.headers['content-length'] || 'unknown'}`);
        }
      } catch (error) {
        console.log(`    ❌ Error: ${error.message}`);
      }
    }
  }
}

function testURL(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;

    const req = protocol.request(url, { method: 'HEAD' }, (res) => {
      resolve({
        status: res.statusCode,
        headers: res.headers
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

testMirrorURLs().catch(console.error);
