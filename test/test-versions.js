#!/usr/bin/env node

const https = require('https');

async function checkZigVersions() {
  console.log('🔍 Checking available Zig versions...');

  try {
    const indexData = await fetchJSON('https://ziglang.org/download/index.json');

    console.log('\n📋 Available versions:');
    const versions = Object.keys(indexData).filter(v => v !== 'master').sort();
    versions.forEach(version => {
      const info = indexData[version];
      console.log(`  • ${version}: ${info.date || 'no date'}`);
    });

    // Check if 0.14.1 exists
    if (indexData['0.14.1']) {
      console.log('\n✅ Zig 0.14.1 is available!');
      const info = indexData['0.14.1'];
      console.log(`   Date: ${info.date}`);

      // Check available targets
      if (info['x86_64-linux']) {
        console.log('   x86_64-linux target available');
        console.log(`   Tarball: ${info['x86_64-linux'].tarball}`);
      }
    } else {
      console.log('\n❌ Zig 0.14.1 is NOT available in index!');
    }

    // Check latest stable
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

    console.log(`\n🎯 Latest stable version: ${latest}`);

  } catch (error) {
    console.error('❌ Failed to fetch Zig versions:', error.message);
  }
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
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

checkZigVersions();
