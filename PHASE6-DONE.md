# Phase 6 — deploy via Git (not ZIP)

Your theme is in **GitHub** (`chirstian-svg/store`) linked to Shopify. **Push to `main`** from the **store repo root**.

## Push theme changes

```bash
cd store
git add assets sections snippets templates layout locales config .shopifyignore
git commit -m "Theme updates"
git push origin main
```

Then in [Shopify Themes](https://admin.shopify.com/store/holo-vault-3/themes): confirm the Git-connected theme updated → **Publish** if needed.

## After sync

1. Theme editor → Header & Category row → assign collections (pokemon, english, japanese, chinese).
2. Hero section → upload real card banner images (optional; SVG defaults work until then).
3. Add products via `../app/` or Admin.
4. Remove storefront password when ready.

## Done locally

- Theme Check: 0 offenses
- Link audit: all paths OK
- Collections on holo-vault-3
- `add.md` items implemented in code (see README table)
