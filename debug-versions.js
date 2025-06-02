#!/usr/bin/env node

async function investigateZigVersions() {
  console.log('🔍 Investigating Zig version availability...');

  try {
    // Test if we can access the Zig index
    const response = await fetch('https://ziglang.org/download/index.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log('\n📋 Available official versions:');
    const versions = Object.keys(data)
      .filter(v => v !== 'master')
      .sort((a, b) => {
        // Sort versions properly
        const aParts = a.split('.').map(s => parseInt(s.split('-')[0]) || 0);
        const bParts = b.split('.').map(s => parseInt(s.split('-')[0]) || 0);
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aVal = aParts[i] || 0;
          const bVal = bParts[i] || 0;
          if (aVal !== bVal) return bVal - aVal; // Descending order
        }
        return 0;
      });

    // Show recent versions
    console.log('Recent stable versions:');
    versions.slice(0, 10).forEach(version => {
      console.log(`  • ${version}: ${data[version].date || 'no date'}`);
    });

    // Check specifically for 0.14.x versions
    console.log('\n🎯 0.14.x versions specifically:');
    const v014versions = versions.filter(v => v.startsWith('0.14.'));
    if (v014versions.length > 0) {
      v014versions.forEach(version => {
        console.log(`  • ${version}: ${data[version].date || 'no date'}`);
      });
    } else {
      console.log('  ❌ No 0.14.x versions found!');
    }

    // Check what the latest stable is
    const latestStable = versions.find(v => !v.includes('-dev'));
    console.log(`\n🚀 Latest stable version: ${latestStable}`);

    // Check master version
    if (data.master) {
      console.log(`🧪 Master version: ${data.master.version}`);
      console.log(`   Master date: ${data.master.date || 'no date'}`);
    }

  } catch (error) {
    console.error('❌ Failed to fetch Zig versions:', error.message);

    // If fetch failed, try a different approach
    console.log('\n🔄 Trying alternative approach...');
    console.log('The issue might be that Zig 0.14.1 simply does not exist.');
    console.log('Zig versioning might have jumped from 0.14.0 directly to 0.15.0 or master builds.');
  }
}

investigateZigVersions();
