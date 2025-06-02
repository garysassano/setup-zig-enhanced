#!/usr/bin/env node

// Test script to verify the URL fix
const fetch = require('node-fetch');

// Function to get the correct base URL for downloading Zig based on version
function getCanonicalBaseUrl(version) {
  // Master builds and dev versions use the builds endpoint
  if (version.includes('-dev')) {
    return 'https://ziglang.org/builds';
  }

  // Stable releases use the download endpoint with version path
  return `https://ziglang.org/download/${version}`;
}

async function testUrlConstruction() {
  const testCases = [
    { version: '0.13.0', expectedUrl: 'https://ziglang.org/download/0.13.0', expectedFilename: 'zig-linux-x86_64-0.13.0.tar.xz' },
    { version: '0.14.1', expectedUrl: 'https://ziglang.org/download/0.14.1', expectedFilename: 'zig-x86_64-linux-0.14.1.tar.xz' },
    { version: '0.15.0-dev.671+c907866d5', expectedUrl: 'https://ziglang.org/builds', expectedFilename: 'zig-x86_64-linux-0.15.0-dev.671+c907866d5.tar.xz' }
  ];

  console.log('🧪 Testing URL construction logic...\n');

  for (const testCase of testCases) {
    const baseUrl = getCanonicalBaseUrl(testCase.version);
    const fullUrl = `${baseUrl}/${testCase.expectedFilename}`;

    console.log(`📋 Version: ${testCase.version}`);
    console.log(`🔗 Expected base URL: ${testCase.expectedUrl}`);
    console.log(`🔗 Actual base URL: ${baseUrl}`);
    console.log(`✅ Base URL match: ${baseUrl === testCase.expectedUrl ? 'PASS' : 'FAIL'}`);
    console.log(`🌐 Full URL: ${fullUrl}`);

    // Test if the URL exists (HEAD request)
    try {
      const response = await fetch(fullUrl, { method: 'HEAD' });
      console.log(`🌍 URL exists: ${response.ok ? 'YES' : 'NO'} (${response.status})`);
    } catch (error) {
      console.log(`🌍 URL exists: ERROR (${error.message})`);
    }

    console.log('');
  }
}

testUrlConstruction().catch(console.error);
