#!/usr/bin/env node

function useLegacyTarballName(version) {
  // We are looking for full versions above
  const parts = version.split('.');
  if (parts.length == 3) {
    // We have a full version like '0.14.0'
    if (parts[0] !== "0") return false; // 1.x.x or greater
    if (parts[1] === "14" && parts[2] !== "0") return false; // 0.14.1 or greater
    const minor = parseInt(parts[1]);
    if (!Number.isFinite(minor)) return false; // malformed minor version
    if (minor >= 15) return false; // 0.15.x or greater
    return true; // 0.14.0 and below
  } else if (parts.length == 4) {
    // We have a dev version like '0.15.0-dev.631+9a3540d61'
    if (parts[0] !== "0") return false; // 1.x.x or greater
    if (parts[1] === "15" && parts[2] == "0-dev") {
      const dev_version = parseInt(parts[3].split('+')[0]); // this is the '631' part in the example above
      if (!Number.isFinite(dev_version)) return false; // malformed dev version
      if (dev_version >= 631) return false; // 0.15.0-dev.631+9a3540d61 or greater
      return true; // 0.15.0-dev before the change
    }
    const minor = parseInt(parts[1]);
    if (!Number.isFinite(minor)) return false; // malformed minor version
    if (minor >= 15) return false; // 0.15.1-dev or greater (in practice this is 0.16.0-dev or greater)
    return true; // We caught 0.15.0-dev above, so this must be 0.14.x-dev or below.
  } else {
    // Malformed version
    return false;
  }
}

function getTarballName(version) {
  const arch = 'x86_64';
  const platform = 'linux';

  if (useLegacyTarballName(version)) {
    return `zig-${platform}-${arch}-${version}`;
  } else {
    return `zig-${arch}-${platform}-${version}`;
  }
}

// Test cases based on actual Zig download page
const testCases = [
  { version: '0.14.1', expected: 'zig-x86_64-linux-0.14.1', expectedFormat: 'NEW' },
  { version: '0.14.0', expected: 'zig-linux-x86_64-0.14.0', expectedFormat: 'LEGACY' },
  { version: '0.13.0', expected: 'zig-linux-x86_64-0.13.0', expectedFormat: 'LEGACY' },
  { version: '0.12.1', expected: 'zig-linux-x86_64-0.12.1', expectedFormat: 'LEGACY' },
  { version: '0.15.0-dev.671+c907866d5', expected: 'zig-x86_64-linux-0.15.0-dev.671+c907866d5', expectedFormat: 'NEW' },
];

console.log('Testing tarball naming logic:\n');

testCases.forEach(testCase => {
  const { version, expected, expectedFormat } = testCase;
  const isLegacy = useLegacyTarballName(version);
  const actual = getTarballName(version);
  const actualFormat = isLegacy ? 'LEGACY' : 'NEW';
  const match = actual === expected;

  console.log(`Version: ${version}`);
  console.log(`  Expected: ${expected} (${expectedFormat})`);
  console.log(`  Actual:   ${actual} (${actualFormat})`);
  console.log(`  ✅ Match: ${match ? 'YES' : 'NO'}`);
  console.log('');
});
