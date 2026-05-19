# Create store pages in Shopify Admin

Footer and header links point to `/pages/...`. Each page must exist in Admin with the **matching theme template**.

## Quick setup

1. **Shopify Admin** → **Online Store** → **Pages** → **Add page**
2. Create each row below (exact **handle** matters for URLs).

| Title | Handle | Theme template |
|-------|--------|----------------|
| Shipping | `shipping` | page.shipping |
| Returns | `returns` | page.returns |
| Card Condition | `card-condition` | page.card-condition |
| Privacy | `privacy` | page.privacy |
| Contact | `contact` | page.contact |
| About HoloVault | `about` | page.about |

3. Leave body empty for **About** and **Contact** (theme provides content).
4. Set visibility to **Visible** and save.

## Or use the API script

If your app token has `write_content`:

```bash
node store/scripts/setup-pages.js
```
