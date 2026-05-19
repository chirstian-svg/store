#!/usr/bin/env node
/** Runs full Phase 3+6 Admin setup: collections, pages, optional menu note */
const { execSync } = require('child_process');
const path = require('path');

const scripts = ['setup-shopify.js', 'setup-pages.js'];
for (const s of scripts) {
  console.log(`\n--- ${s} ---`);
  execSync(`node ${path.join(__dirname, s)}`, { stdio: 'inherit' });
}
console.log('\nAdmin setup complete. Next: node store/scripts/link-audit.js');
