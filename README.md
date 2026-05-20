# Holo Vault — Shopify theme

GitHub: **chirstian-svg/store** → Shopify **holo-vault-3** (theme at repo root).

## Deploy

```bash
cd store   # this repo root
git add assets sections snippets templates layout locales config
git commit -m "Theme updates"
git push origin main
```

Shopify syncs via GitHub integration (**Online Store → Themes**). No theme subdirectory needed.

Non-theme files (`scripts/`, `*.md`, `*.zip`) are excluded via `.shopifyignore`.

## Client checklist (`add.md`)

| add.md item | Status | Notes |
|-------------|--------|--------|
| Images / banners | **Partial** | Hero uses default SVGs until you upload real photos in theme editor |
| Shipping corrected | **Done** | `sections/policy-page.liquid` — NZ + international copy |
| Categories / collections | **Done** | Smart collections on store + nav/category row in theme |
| Shop / Buy now buttons | **Done** | Header, footer, product cards, product page |
| Contact & all pages fixed | **Done** | Templates + policy content; ensure pages exist in Admin |
| Ready to go live | **After push** | Push this repo, publish synced theme, add products |

## Folder structure

```
layout/theme.liquid
templates/*.json
sections/*.liquid
snippets/
assets/holovault.css
locales/
config/
```

## Price sync (separate repo: `../app/`)

Products from the Collectr app use `custom.*` metafields and the `collectr-badge` snippet.

## Local checks (optional)

```bash
npx @shopify/cli theme check
node scripts/link-audit.js
node scripts/setup-store.js   # collections only; needs API token
Category tile images in `assets/`: `single.png`, `new-arrivals.png`, `english.png`, `japanese.png`, `chinese.png`.
