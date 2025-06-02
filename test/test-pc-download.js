#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Mirror the exact logic from your action
function getTarballName(version) {
  const arch = 'x86_64'; // Linux x64
  const platform = 'linux';

  function useLegacyTarballName(version) {
    const parts = version.split('.');
    if (parts.length == 3) {
      if (parts[0] !== "0") return false;
      if (parts[1] === "14" && parts[2] !== "0") return false;
      const minor = parseInt(parts[1]);
      if (!Number.isFinite(minor)) return false;
      if (minor >= 15) return false;
      return true;
    }
    return false;
  }

  if (useLegacyTarballName(version)) {
    return `zig-${platform}-${arch}-${version}`;
  } else {
    return `zig-${arch}-${platform}-${version}`;
  }
}

async function testDownload(version) {
  console.log(`\n🔍 Testing Zig ${version}...`);

  const tarballName = getTarballName(version);
  const tarballFile = `${tarballName}.tar.xz`;
  const signatureFile = `${tarballFile}.minisig`;

  console.log(`   Tarball: ${tarballFile}`);

  const mirrors = [
    'https://ziglang.org/builds',
    'https://pkg.machengine.org/zig',
    'https://zigmirror.hryx.net/zig',
    'https://zig.linus.dev/zig'
  ];

  for (const mirror of mirrors) {
    const tarballUrl = `${mirror}/${tarballFile}`;
    const signatureUrl = `${mirror}/${signatureFile}`;

    console.log(`\n   Testing ${mirror}:`);
    console.log(`     ${tarballUrl}`);

    try {
      // Test tarball
      const tarballResponse = await testUrl(tarballUrl);
      if (tarballResponse.statusCode === 200) {
        console.log(`     ✅ Tarball: ${tarballResponse.statusCode} (${tarballResponse.contentLength} bytes)`);

        // Test signature
        const sigResponse = await testUrl(signatureUrl);
        if (sigResponse.statusCode === 200) {
          console.log(`     ✅ Signature: ${sigResponse.statusCode} (${sigResponse.contentLength} bytes)`);
        } else {
          console.log(`     ❌ Signature: ${sigResponse.statusCode}`);
        }
      } else {
        console.log(`     ❌ Tarball: ${tarballResponse.statusCode}`);
      }
    } catch (error) {
      console.log(`     ❌ Error: ${error.message}`);
    }
  }
}

function testUrl(url) {
  return new Promise((resolve, reject) => {
    const request = https.request(url, { method: 'HEAD' }, (response) => {
      resolve({
        statusCode: response.statusCode,
        contentLength: response.headers['content-length'] || 'unknown'
      });
    });

    request.on('error', reject);
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });

    request.end();
  });
}

async function main() {
  console.log('🚀 Testing Zig tarball downloads...');
  console.log('This will test the exact URLs that your GitHub Action would use.\n');

  const versions = ['0.13.0', '0.14.0', 'latest'];

  // First get the actual latest version
  try {
    console.log('📋 Fetching Zig version index...');
    const indexData = await fetchJson('https://ziglang.org/download/index.json');

    const latestVersion = Object.keys(indexData)
      .filter(v => v !== 'master' && !v.includes('-dev'))
      .sort((a, b) => {
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);
        for (let i = 0; i < 3; i++) {
          if (aParts[i] !== bParts[i]) return bParts[i] - aParts[i];
        }
        return 0;
      })[0];

    console.log(`✅ Latest version: ${latestVersion}`);

    // Replace 'latest' with actual version
    const testVersions = versions.map(v => v === 'latest' ? latestVersion : v);

    for (const version of testVersions) {
      await testDownload(version);
    }

  } catch (error) {
    console.error(`❌ Failed to fetch version index: ${error.message}`);
  }
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

main().catch(console.error);
