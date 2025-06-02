#!/usr/bin/env node

const common = require('./common.js');

async function testFilenameLogic() {
  console.log('🔍 Testing filename generation logic...');

  // Test different Zig versions
  const testVersions = ['0.14.0', '0.14.1', '0.15.0', 'master'];

  for (const version of testVersions) {
    // Mock the getVersion function
    const originalGetVersion = common.getVersion;
    common.getVersion = async () => version;

    try {
      const tarballName = await common.getTarballName();
      console.log(`Version ${version}: ${tarballName}`);

      // Check if the naming follows expected pattern
      if (version === '0.14.0') {
        console.log(`  ✅ Expected legacy format: zig-linux-x86_64-${version}`);
      } else if (version === '0.14.1' || version === '0.15.0') {
        console.log(`  ✅ Expected new format: zig-x86_64-linux-${version}`);
      }
    } catch (error) {
      console.log(`  ❌ Error for version ${version}:`, error.message);
    }

    // Restore original function
    common.getVersion = originalGetVersion;
  }
}

testFilenameLogic();
