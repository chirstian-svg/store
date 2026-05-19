#!/usr/bin/env node
/**
 * One-command store update: collections, pages, product tags, link audit.
 * Run: node store/scripts/update-store.js
 */
const { execSync } = require('child_process');
const path = require('path');

const dir = __dirname;
const steps = [
  ['setup-shopify.js', 'Smart collections'],
  ['setup-pages.js', 'Policy pages'],
  ['retag-products.js', 'Product language tags'],
];

console.log('\n=== Holo Vault — update store ===\n');

for (const [script, label] of steps) {
  console.log(`--- ${label} ---`);
  try {
    execSync(`node ${path.join(dir, script)}`, { stdio: 'inherit' });
  } catch {
    console.warn(`  (step had errors — continuing)\n`);
  }
}

console.log('--- Link audit ---');
try {
  execSync(`node ${path.join(dir, 'link-audit.js')}`, { stdio: 'inherit' });
} catch {
  console.warn('  Link audit reported issues.\n');
}

console.log(`
Done. Push theme to sync GitHub → Shopify:

  cd store
  git add config templates
  git commit -m "Wire collections in theme settings"
  git push origin main

Then in Shopify Admin → Themes, confirm the Git-connected theme updated and Publish.
`);
