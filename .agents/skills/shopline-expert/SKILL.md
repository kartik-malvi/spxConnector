---
name: shopline-expert
description: >
  Expert skill for building SHOPLINE apps, integrations, and storefronts. Use this skill whenever
  the user mentions Shopline, wants to build a Shopline app, integrate with Shopline APIs, handle
  Shopline webhooks, manage products/orders via Shopline, or set up OAuth for a Shopline public app.
  Triggers for "Shopline Admin API", "Shopline webhook", "Shopline partner portal", "Shopline OAuth".
---

# SHOPLINE Expert

## Auth — OAuth 2.0
```js
const authUrl = `https://accounts.shopline.com/oauth/authorize?client_id=${CLIENT_ID}&scope=read_products,write_orders&redirect_uri=${REDIRECT_URI}&state=${randomState}`;

const { access_token } = await fetch(`https://accounts.shopline.com/oauth/token`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code, redirect_uri: REDIRECT_URI })
}).then(r => r.json());
```

## HMAC Verification
```js
import crypto from 'crypto';
function verifyHmac(params, secret) {
  const { hmac, ...rest } = params;
  const message = Object.keys(rest).sort().map(k => `${k}=${rest[k]}`).join('&');
  const digest = crypto.createHmac('sha256', secret).update(message).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
}
```

## Admin API
```js
const headers = { 'X-SHOPLINE-ACCESS-TOKEN': accessToken, 'Content-Type': 'application/json' };
// GET /products.json  POST /products.json  PUT /products/{id}.json
// GET /orders.json?status=open  PUT /orders/{id}.json
// POST /orders/{id}/fulfillments.json  Body: { fulfillment: { tracking_number, tracking_company } }
```

## Webhooks
```js
// Register: POST /webhooks.json  Body: { webhook: { topic: "orders/create", address: "https://app.com/webhooks/orders" } }
// Topics: orders/create, orders/updated, products/create, app/uninstalled

app.post('/webhooks/orders', express.raw({ type: 'application/json' }), (req, res) => {
  const hmac = req.headers['x-shopline-hmac-sha256'];
  const digest = crypto.createHmac('sha256', SECRET).update(req.body).digest('base64');
  if (!crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac))) return res.status(401).send();
  res.status(200).send('OK'); // respond immediately, process async
});
```
