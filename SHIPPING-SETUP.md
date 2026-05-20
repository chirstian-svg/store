# Holo Vault — Shipping setup (Shopify Admin)

Configure checkout rates to match the client plan. The theme **shipping page** and **product page** copy describe policy; **actual prices** come from **Settings → Shipping and delivery**.

**Admin:** [Shipping and delivery](https://admin.shopify.com/store/holo-vault-3/settings/shipping)

---

## Recommended zones and rates

### Zone 1 — New Zealand

**Countries:** New Zealand only.

| Rate name | Price | How to set in Shopify |
|-----------|-------|------------------------|
| Standard Shipping | **$7.50** | Add rate → **Flat rate** → $7.50 |
| Rural Shipping | **$9.50** | Add rate → **Flat rate** → $9.50 |
| Free Shipping | **$0** on orders **$100+** | Add rate → **Free** (or $0 flat) → **Add conditions** → Based on order price → Minimum **$100.00** |

**Rural note:** Shopify does not auto-detect NZ rural addresses. Common options:

1. **Two flat rates** (above) — customer chooses **Rural Shipping** at checkout if their address is rural (mention this on the [Shipping](/pages/shipping) page).
2. **NZ Post / Starshipit / similar app** — auto rural vs urban (best long-term for NZ).

Put **Free Shipping** after or with a condition so it overrides paid rates when the cart is ≥ $100.

---

### Zone 2 — Australia

**Countries:** Australia.

| Rate name | Price |
|-----------|-------|
| Standard (or “Australia”) | **$14.99** flat |

---

### Zone 3 — USA & Canada

**Countries:** United States, Canada.

| Rate name | Price |
|-----------|-------|
| Standard | **$24.99** flat |

---

### Zone 4 — UK & Europe

**Countries:** Add all countries you ship to in this band, for example:

United Kingdom, Ireland, France, Germany, Italy, Spain, Netherlands, Belgium, Austria, Switzerland, Sweden, Norway, Denmark, Finland, Poland, Portugal, Czech Republic, Greece, and other EU/EEA markets you support.

| Rate name | Price |
|-----------|-------|
| Standard | **$27.99** flat |

Start with your main markets; add more countries to the same zone as you expand.

---

### Zone 5 — Asia

**Countries:** e.g. Japan, Singapore, Hong Kong, South Korea, China, Taiwan, Malaysia, Thailand, Philippines, Indonesia, Vietnam, India (adjust to what you actually ship to).

| Rate name | Price |
|-----------|-------|
| Standard | **$22.99** flat |

---

## Step-by-step in Shopify Admin

1. Open **[Settings → Shipping and delivery](https://admin.shopify.com/store/holo-vault-3/settings/shipping)**.
2. Under **General shipping rates** (or your default profile), click **Manage** / **Add shipping zone**.
3. For each zone above:
   - **Create zone** → name it (e.g. “New Zealand”).
   - **Add countries** to that zone only.
   - **Add rate** for each row in the table (flat rate or free with minimum order).
4. **Save** after each zone.
5. **Test checkout** with a product in cart:
   - NZ address → see $7.50 / $9.50 / free over $100.
   - AU, US, UK, JP test addresses → see the correct flat rate.

---

## Other backend setup (checklist)

| Area | What to do | Admin link |
|------|------------|------------|
| **Shipping** | Zones above | [Shipping](https://admin.shopify.com/store/holo-vault-3/settings/shipping) |
| **Payments** | Shopify Payments and/or PayPal enabled | [Payments](https://admin.shopify.com/store/holo-vault-3/settings/payments) |
| **Taxes** | NZ GST if registered; international often “collect at checkout” or not registered abroad | [Taxes](https://admin.shopify.com/store/holo-vault-3/settings/taxes) |
| **Markets** | Optional: separate pricing/currency per region | [Markets](https://admin.shopify.com/store/holo-vault-3/settings/markets) |
| **Checkout** | Contact email, policies, order confirmation | [Checkout](https://admin.shopify.com/store/holo-vault-3/settings/checkout) |
| **Legal policies** | Refund, privacy, terms (Shopify can generate drafts) | [Policies](https://admin.shopify.com/store/holo-vault-3/settings/legal) |
| **Notifications** | Order + contact form email | [Notifications](https://admin.shopify.com/store/holo-vault-3/settings/notifications) |
| **Location** | NZ fulfillment location for inventory/shipping origin | [Locations](https://admin.shopify.com/store/holo-vault-3/settings/locations) |
| **Domain** | Custom domain + SSL | [Domains](https://admin.shopify.com/store/holo-vault-3/settings/domains) |
| **Products** | Weight optional for future carrier-calculated rates | Products → each SKU |

Theme-side **already done:** Shipping page (`/pages/shipping`), footer link, product page **Shipping** blurb, cart note (“calculated at checkout”).

---

## After rates are live

1. Update [Shipping policy copy](snippets/page-content-shipping.liquid) if any rate changes (theme repo).
2. Run one **test order** per zone (or use Shopify’s **test mode** / Bogus Gateway).
3. Tell rural NZ buyers to pick **Rural Shipping** if not using an NZ postcode app.

---

## API / automation note

Shipping zones need Admin scopes such as `write_shipping`. The Collectr app token in `app/.env` may not include that — **configure shipping in Admin** (above), not via the price-sync app.
