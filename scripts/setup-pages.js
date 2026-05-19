#!/usr/bin/env node
/**
 * Creates required Shopify pages for Holo Vault.
 * node store/scripts/setup-pages.js
 */

const path = require('path');
const appRoot = path.join(__dirname, '../../app');
require(path.join(appRoot, 'node_modules/dotenv')).config({ path: path.join(appRoot, '.env') });

const store = process.env.SHOPIFY_STORE;
const token = process.env.SHOPIFY_TOKEN;
const version = process.env.SHOPIFY_API_VERSION || '2024-04';
const apiBase = `https://${store}/admin/api/${version}`;

const PAGES = [
  { title: 'Shipping', handle: 'shipping', template_suffix: 'shipping', body: '<p>Shipping information for HoloVault.</p>' },
  { title: 'Returns', handle: 'returns', template_suffix: 'returns', body: '<p>Returns policy for HoloVault.</p>' },
  { title: 'Card Condition', handle: 'card-condition', template_suffix: 'card-condition', body: '<p>How we grade card condition.</p>' },
  { title: 'Privacy', handle: 'privacy', template_suffix: 'privacy', body: '<p>Privacy policy.</p>' },
  { title: 'Contact', handle: 'contact', template_suffix: 'contact', body: '' },
  { title: 'About HoloVault', handle: 'about', template_suffix: 'about', body: '' },
];

async function shopifyRequest(method, urlPath, body) {
  const res = await fetch(`${apiBase}${urlPath}`, {
    method,
    headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(JSON.stringify(data.errors || data));
  return data;
}

async function main() {
  if (!store || !token) {
    console.error('Set SHOPIFY_STORE and SHOPIFY_TOKEN in app/.env');
    process.exit(1);
  }
  console.log(`\nCreating pages on ${store}\n`);

  for (const p of PAGES) {
    try {
      await shopifyRequest('POST', '/pages.json', {
        page: {
          title: p.title,
          handle: p.handle,
          body_html: p.body,
          published: true,
          template_suffix: p.template_suffix,
        },
      });
      console.log(`  ✓ Created: ${p.title} (/pages/${p.handle})`);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('handle') && msg.includes('taken')) {
        console.log(`  ✓ Exists: ${p.title} (/pages/${p.handle})`);
        continue;
      }
      if (msg.includes('read_content')) {
        console.log(`  ~ Skipped ${p.title} (token needs read_content scope to verify; create in Admin if missing)`);
        continue;
      }
      console.error(`  ✗ ${p.title}:`, msg);
    }
  }
}

main();
