# Holo Vault — SEO & Google (Admin + theme)

## Shipping (client clarification)

| Where | What it does |
|-------|----------------|
| **Shopify Admin → Shipping and delivery** | **Checkout rates** — zones you configured ($7.50 NZ, $14.99 AU, etc.) apply automatically from the customer’s address. |
| **Theme `/pages/shipping`** | Public **policy page** for customers (footer link). |
| **Product pages** | **No shipping block** — rates are not shown on individual products; only at checkout. |

If checkout shows the correct prices per country, **backend shipping is done**.

---

## What the theme already provides

- **Page titles** — `{{ page_title }}` + shop name (`layout/theme.liquid`)
- **Meta description** — from Shopify SEO fields when set; fallback text on homepage
- **Canonical URL** — `{{ canonical_url }}`
- **Open Graph** — basic `og:title`, `og:description`, `og:image` on products (theme)
- **Skip link** — keyboard accessibility
- **Sitemap** — Shopify auto: `https://holo-vault-3.myshopify.com/sitemap.xml` (updates with products/pages)
- **robots.txt** — Shopify auto: `/robots.txt`

---

## Manual work in Shopify Admin (recommended)

### 1. Homepage SEO
**Online Store → Preferences** (or **Settings → General**)

- **Homepage title** — e.g. `Holo Vault | Pokémon TCG Singles NZ`
- **Homepage meta description** — 150–160 chars, mention NZ, singles, languages

### 2. Each product
**Products → [product] → Search engine listing** (pencil icon)

- **Page title** — card name + set + language (e.g. `Quaxwell Shiny CN | Gem Pack | Holo Vault`)
- **Meta description** — unique, 1–2 sentences
- **URL handle** — short, readable (`quaxwell-shiny-cn`)

### 3. Collections
**Products → Collections → [collection] → SEO**

- Title + description for Pokémon, English, Japanese, Chinese, etc.

### 4. Pages
**Online Store → Pages → [page] → SEO**

- Shipping, Returns, About, Contact — each with title + description

### 5. Google Search Console (required for “on Google”)
1. Go to [Google Search Console](https://search.google.com/search-console)
2. **Add property** — your store URL (custom domain when live, or `.myshopify.com` for testing)
3. **Verify** — HTML tag or DNS (Shopify often supports domain verify)
4. **Submit sitemap:** `https://YOUR-DOMAIN/sitemap.xml`

### 6. Remove password before indexing
**Online Store → Preferences** — disable storefront password, or Google cannot crawl the shop.

### 7. Optional but useful
| Tool | Purpose |
|------|---------|
| **Google Analytics 4** | Traffic — add via **Settings → Customer events** / app or theme `content_for_header` |
| **Google Merchant Center** | Product listings in Google Shopping (separate setup, feed from Shopify) |
| **Bing Webmaster Tools** | Same idea as Search Console |
| **Shopify “Search & Discovery”** | On-site search tuning in Admin |

---

## What is NOT fully set up yet (honest checklist)

| Item | Status |
|------|--------|
| Per-product SEO in Admin | **You** fill in per listing |
| Google Search Console | **Manual** — not automatic |
| Custom domain + SSL | **Admin** when domain connected |
| Rich product JSON-LD in theme | **Optional** — can add later for richer Google results |
| Blog/content marketing | **Not required** for basic SEO |
| Social share image (global) | **Theme settings** — upload in Customize if available, or Preferences |

---

## Quick test

1. View source on a product page — look for `<title>`, `<meta name="description">`, `og:image`
2. Open `https://holo-vault-3.myshopify.com/sitemap.xml` — should list products/pages
3. [Google Rich Results Test](https://search.google.com/test/rich-results) — paste a product URL after password is off

---

## Tell the client

- **Shipping on checkout** = configured in **Shipping and delivery** (Admin), not on product pages.
- **SEO** = basics in theme + **you must** set titles/descriptions per product/collection and connect **Google Search Console** + remove storefront password for Google to index the site.
