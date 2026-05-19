#!/usr/bin/env node
/**
 * Creates Holo Vault collections for the client project.
 * Run from repo root: node store/scripts/setup-shopify.js
 *
 * Requires ../app/.env with SHOPIFY_STORE and SHOPIFY_TOKEN
 */

const path = require('path');
const appRoot = path.join(__dirname, '../../app');
require(path.join(appRoot, 'node_modules/dotenv')).config({ path: path.join(appRoot, '.env') });

const store = process.env.SHOPIFY_STORE;
const token = process.env.SHOPIFY_TOKEN;
const version = process.env.SHOPIFY_API_VERSION || '2024-04';
const apiBase = `https://${store}/admin/api/${version}`;

if (!store || !token) {
  console.error('Set SHOPIFY_STORE and SHOPIFY_TOKEN in app/.env');
  process.exit(1);
}

async function shopifyRequest(method, path, body) {
  const res = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.errors || res.statusText);
    err.response = { data, status: res.status };
    throw err;
  }
  return data;
}

const COLLECTIONS = [
  {
    title: 'Pokémon',
    handle: 'pokemon',
    body_html: '<p>All Pokémon TCG singles at HoloVault.</p>',
    rules: [{ column: 'tag', relation: 'equals', condition: 'pokemon' }],
  },
  {
    title: 'English',
    handle: 'english',
    body_html: '<p>English-language Pokémon cards.</p>',
    rules: [{ column: 'tag', relation: 'equals', condition: 'english' }],
  },
  {
    title: 'Japanese',
    handle: 'japanese',
    body_html: '<p>Japanese Pokémon cards.</p>',
    rules: [{ column: 'tag', relation: 'equals', condition: 'japanese' }],
  },
  {
    title: 'Chinese',
    handle: 'chinese',
    body_html: '<p>Chinese Pokémon cards.</p>',
    rules: [{ column: 'tag', relation: 'equals', condition: 'chinese' }],
  },
  {
    title: 'Singles',
    handle: 'singles',
    body_html: '<p>Individual Pokémon TCG singles.</p>',
    rules: [{ column: 'type', relation: 'equals', condition: 'Pokemon Card' }],
  },
];

async function getSmartCollectionByHandle(handle) {
  const data = await shopifyRequest('GET', `/smart_collections.json?handle=${encodeURIComponent(handle)}&limit=1`);
  return data.smart_collections?.[0] || null;
}

async function createOrUpdateSmartCollection(def) {
  const existing = await getSmartCollectionByHandle(def.handle);
  const payload = {
    smart_collection: {
      title: def.title,
      handle: def.handle,
      body_html: def.body_html,
      published: true,
      rules: def.rules,
      disjunctive: false,
    },
  };

  if (existing) {
    await shopifyRequest('PUT', `/smart_collections/${existing.id}.json`, payload);
    console.log(`  ✓ Updated: ${def.title} (/collections/${def.handle})`);
    return existing.id;
  }

  const data = await shopifyRequest('POST', '/smart_collections.json', payload);
  console.log(`  ✓ Created: ${def.title} (/collections/${def.handle})`);
  return data.smart_collection.id;
}

async function main() {
  console.log(`\nHolo Vault — Shopify setup`);
  console.log(`Store: ${store}\n`);

  for (const def of COLLECTIONS) {
    try {
      await createOrUpdateSmartCollection(def);
    } catch (err) {
      const msg = err.response?.data || err.message;
      console.error(`  ✗ ${def.title}:`, JSON.stringify(msg));
    }
  }

  console.log(`
Done. Next steps:
1. Upload theme: cd store && shopify theme push --store ${store}
2. Theme editor → Header: assign Pokémon / English / Japanese / Chinese collections
3. Theme editor → Category row: assign the same collections
4. Optional: Admin → Navigation → create "main-menu" with Pokémon parent + children
5. Add cards via app (../app) — tag "pokemon" is applied automatically
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
