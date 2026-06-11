#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get staged files
const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
  .split('\n')
  .filter(Boolean);

if (stagedFiles.length === 0) {
  console.log('No staged files found.');
  process.exit(0);
}

// Find related test files
const testFiles = new Set();

stagedFiles.forEach(file => {
  // If it's a test file itself, run it
  if (file.includes('.test.') || file.includes('.spec.')) {
    testFiles.add(file);
    return;
  }

  // Skip non-TS/TSX files
  if (!file.endsWith('.ts') && !file.endsWith('.tsx')) {
    return;
  }

  // Try to find test file in same directory
  const dir = path.dirname(file);
  const basename = path.basename(file, '.ts').replace('.tsx', '');
  
  // Common test patterns
  const testPatterns = [
    `${basename}.test.ts`,
    `${basename}.test.tsx`,
    `${basename}.spec.ts`,
    `${basename}.spec.tsx`,
  ];

  // Look for test files in __tests__ directories
  const testDirPatterns = [
    path.join(dir, '__tests__', `${basename}.test.ts`),
    path.join(dir, '__tests__', `${basename}.test.tsx`),
    path.join(dir, '__tests__', `${basename}.spec.ts`),
    path.join(dir, '__tests__', `${basename}.spec.tsx`),
  ];

  // Check module-specific test directories
  if (file.includes('src/modules/')) {
    const moduleMatch = file.match(/src\/modules\/([^\/]+)/);
    if (moduleMatch) {
      const moduleName = moduleMatch[1];
      const moduleTestPatterns = [
        `src/__tests__/${moduleName}.integration.test.ts`,
        `src/modules/${moduleName}/**/*.test.ts`,
        `src/modules/${moduleName}/**/*.spec.ts`,
      ];
      moduleTestPatterns.forEach(pattern => {
        try {
          const foundFiles = execSync(`git ls-files '${pattern}'`, { encoding: 'utf-8' });
          foundFiles.split('\n').filter(Boolean).forEach(f => testFiles.add(f));
        } catch (e) {
          // Pattern not found
        }
      });
    }
  }

  // Check for specific test files based on file path
  if (file.includes('src/lib/crypto.ts')) {
    testFiles.add('src/__tests__/crypto.test.ts');
  }
  if (file.includes('src/app/api/agents/[agentId]/chat/route.ts')) {
    testFiles.add('src/__tests__/chat.integration.test.ts');
  }

  // Check for test files in same directory
  testPatterns.forEach(pattern => {
    const testPath = path.join(dir, pattern);
    if (fs.existsSync(testPath)) {
      testFiles.add(testPath);
    }
  });

  testDirPatterns.forEach(pattern => {
    if (fs.existsSync(pattern)) {
      testFiles.add(pattern);
    }
  });
});

if (testFiles.size === 0) {
  console.log('No related test files found for staged changes.');
  process.exit(0);
}

console.log(`Running ${testFiles.size} related test file(s):`);
Array.from(testFiles).forEach(f => console.log(`  - ${f}`));

// Run the tests
try {
  const testArgs = Array.from(testFiles).join(' ');
  execSync(`npm run test:unit -- ${testArgs} --run`, { stdio: 'inherit' });
  console.log('\n✓ All related tests passed.');
} catch (error) {
  console.error('\n✗ Tests failed.');
  process.exit(1);
}
