#!/usr/bin/env node

const https = require('https');
const http = require('http');

async function testDownloads() {
  console.log('🔍 Testing Zig download URLs...');

  // Test the Zig index first
  console.log('\n1. Testing Zig index...');
  try {
    const indexData = await fetchJSON('https://ziglang.org/download/index.json');
    console.log('✅ Zig index accessible');

    // Get latest version
    const latest = Object.keys(indexData)
      .filter(v => v !== 'master' && !v.includes('-dev'))
      .sort((a, b) => {
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);
        for (let i = 0; i < 3; i++) {
          if (aParts[i] !== bParts[i]) return bParts[i] - aParts[i];
        }
        return 0;
      })[0];

    console.log(`   Latest version: ${latest}`);

    // Check if x86_64-linux target exists
    if (indexData[latest] && indexData[latest]['x86_64-linux']) {
      const linuxTarget = indexData[latest]['x86_64-linux'];
      console.log(`   Linux x64 tarball: ${linuxTarget.tarball}`);

      // Test direct download from official site
      console.log('\n2. Testing official download...');
      try {
        const response = await testURL(linuxTarget.tarball);
        console.log(`✅ Official download accessible (${response.statusCode})`);
      } catch (error) {
        console.log(`❌ Official download failed: ${error.message}`);
      }

      // Test minisig file
      console.log('\n3. Testing signature file...');
      try {
        const sigResponse = await testURL(linuxTarget.tarball + '.minisig');
        console.log(`✅ Signature file accessible (${sigResponse.statusCode})`);
      } catch (error) {
        console.log(`❌ Signature file failed: ${error.message}`);
      }
    } else {
      console.log('❌ No x86_64-linux target found');
    }

  } catch (error) {
    console.log(`❌ Failed to fetch Zig index: ${error.message}`);
  }

  // Test mirrors
  console.log('\n4. Testing mirrors...');
  const mirrors = [
    'https://pkg.machengine.org/zig',
    'https://zigmirror.hryx.net/zig',
    'https://zig.linus.dev/zig'
  ];

  for (const mirror of mirrors) {
    try {
      const response = await testURL(mirror);
      console.log(`✅ Mirror accessible: ${mirror} (${response.statusCode})`);
    } catch (error) {
      console.log(`❌ Mirror failed: ${mirror} - ${error.message}`);
    }
  }
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

function testURL(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    client.get(url, (res) => {
      resolve({ statusCode: res.statusCode, headers: res.headers });
      res.resume(); // Consume the response
    }).on('error', reject);
  });
}

testDownloads().catch(console.error);
