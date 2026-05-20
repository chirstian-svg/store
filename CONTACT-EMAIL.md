# Contact form — how messages reach your email

The contact page uses **Shopify’s built-in contact form** (`{% form 'contact' %}`). You do **not** need a separate email service (SendGrid, etc.) unless you want advanced features.

## Where messages go

1. Customer submits the form on `/pages/contact`
2. Shopify sends a **notification email** to your store
3. You **reply from your inbox** to the customer’s email (the address they entered in the form)

## Set your notification email (one-time)

1. **Shopify Admin** → **Settings** → **Notifications**
2. Under **Sender email** / **Store contact email**, use the address where you want contact form messages (e.g. your Gmail)
3. Find **Customer contact** (or **Contact form**) notification — ensure it is **enabled**
4. Optional: edit the template so replies are easy to spot

## Test

1. Submit a test message on the live contact page
2. Check inbox (and spam) for the Shopify notification
3. Reply to that email — the customer receives your reply at their address

## Privacy page

The public contact page no longer shows your email address. The privacy policy may still list a contact email for legal requests — update `snippets/page-content-privacy.liquid` if you want that hidden too.
