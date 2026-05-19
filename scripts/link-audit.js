#!/usr/bin/env node
/**
 * Audits internal links against live Shopify store.
 * node store/scripts/link-audit.js
 */

const path = require('path');
const appRoot = path.join(__dirname, '../../app');
require(path.join(appRoot, 'node_modules/dotenv')).config({ path: path.join(appRoot, '.env') });

const store = process.env.SHOPIFY_STORE;
const token = process.env.SHOPIFY_TOKEN;
const version = process.env.SHOPIFY_API_VERSION || '2024-04';
const base = `https://${store}`;
const apiBase = `${base}/admin/api/${version}`;

const PATHS = [
  '/',
  '/collections/all',
  '/collections/pokemon',
  '/collections/english',
  '/collections/japanese',
  '/collections/chinese',
  '/collections/singles',
  '/pages/shipping',
  '/pages/returns',
  '/pages/card-condition',
  '/pages/privacy',
  '/pages/contact',
  '/pages/about',
  '/search',
  '/cart',
];

async function shopifyGet(urlPath) {
  const res = await fetch(`${apiBase}${urlPath}`, {
    headers: { 'X-Shopify-Access-Token': token },
  });
  return res.ok ? res.json() : null;
}

async function checkPath(pathname) {
  const url = `${base}${pathname}`;
  const res = await fetch(url, { redirect: 'manual' });
  const ok = res.status === 200 || res.status === 302;
  return { path: pathname, status: res.status, ok };
}

async function main() {
  console.log(`\nLink audit: ${base}\n`);
  let failed = 0;

  for (const p of PATHS) {
    const r = await checkPath(p);
    const icon = r.ok ? '✓' : '✗';
    if (!r.ok) failed++;
    console.log(`  ${icon} ${p} → HTTP ${r.status}`);
  }

  console.log(failed ? `\n${failed} path(s) need attention.` : '\nAll checked paths OK (store may be password-protected — 302 is OK).');
}

main();
