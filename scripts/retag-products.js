#!/usr/bin/env node
/**
 * Adds language tags (english, japanese, chinese) to existing products
 * so smart collections filter correctly.
 */
const path = require('path');
const appRoot = path.join(__dirname, '../../app');
require(path.join(appRoot, 'node_modules/dotenv')).config({ path: path.join(appRoot, '.env') });

const store = process.env.SHOPIFY_STORE;
const token = process.env.SHOPIFY_TOKEN;
const version = process.env.SHOPIFY_API_VERSION || '2024-04';
const apiBase = `https://${store}/admin/api/${version}`;

function languageTag(title) {
  const t = (title || '').toLowerCase();
  if (t.includes('(cn)')) return 'chinese';
  if (t.includes('(jp)')) return 'japanese';
  return 'english';
}

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

  let updated = 0;
  let url = `/products.json?limit=50&fields=id,title,tags`;

  while (url) {
    const res = await fetch(`${apiBase}${url}`, {
      headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(JSON.stringify(data.errors || data));

    const products = data.products || [];
    for (const p of products) {
      const lang = languageTag(p.title);
      const tagList = p.tags.split(',').map((t) => t.trim()).filter(Boolean);

      if (tagList.includes(lang) && tagList.includes('pokemon')) continue;

      const withoutLang = tagList.filter((t) => !['english', 'japanese', 'chinese'].includes(t));
      const newTags = [...withoutLang, 'pokemon', lang].filter((t, i, a) => a.indexOf(t) === i);

      await shopifyRequest('PUT', `/products/${p.id}.json`, {
        product: { id: p.id, tags: newTags.join(', ') },
      });
      console.log(`  ✓ ${p.title} → ${lang}`);
      updated++;
    }

    const linkHeader = res.headers.get('link') || '';
    const next = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    if (next) {
      const nextUrl = new URL(next[1]);
      url = nextUrl.pathname.replace(`/admin/api/${version}`, '') + nextUrl.search;
    } else {
      url = null;
    }
  }

  console.log(`\nRetagged ${updated} product(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
