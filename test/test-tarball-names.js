#!/usr/bin/env node

// Simulate the exact download logic from main.js
const os = require('os');

console.log('🔍 Testing tarball name generation...');

function getTarballName(version) {
  let arch = {
    arm:      'armv7a',
    arm64:    'aarch64',
    loong64:  'loongarch64',
    x64:      'x86_64',
    ia32:     'x86',
  }[os.arch()] || os.arch();

  const platform = {
    linux:   'linux',
    darwin:  'macos',
    win32:   'windows',
  }[os.platform()] || os.platform();

  // Test legacy vs new naming
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

function getTarballExt() {
  return {
    linux:  '.tar.xz',
    darwin: '.tar.xz',
    win32:  '.zip',
  }[os.platform()];
}

console.log(`Platform: ${os.platform()}`);
console.log(`Architecture: ${os.arch()}`);

const testVersions = ['0.13.0', '0.14.0', '0.14.1', '0.15.0', 'master'];

testVersions.forEach(version => {
  const tarballName = getTarballName(version);
  const tarballExt = getTarballExt();
  const fullName = tarballName + tarballExt;

  console.log(`\nVersion ${version}:`);
  console.log(`  Tarball: ${fullName}`);

  // Test URL construction
  const mirrors = [
    'https://ziglang.org/builds',
    'https://pkg.machengine.org/zig',
    'https://zigmirror.hryx.net/zig'
  ];

  mirrors.forEach(mirror => {
    const url = `${mirror}/${fullName}`;
    console.log(`  ${mirror}: ${url}`);
  });
});

console.log('\n🎯 Current system would generate:');
const currentVersion = '0.13.0'; // Latest stable as of the screenshots
const currentTarball = getTarballName(currentVersion) + getTarballExt();
console.log(`  ${currentTarball}`);
console.log(`  URL: https://ziglang.org/builds/${currentTarball}`);
