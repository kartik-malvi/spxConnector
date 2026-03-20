---
name: auth-security-expert
description: >
  Expert skill for JWT, HMAC verification, and securing Node.js apps. Use whenever the user
  wants to add authentication, secure API endpoints, implement JWT, verify Shopline HMAC, or
  protect routes. Triggers for "auth", "JWT", "security", "HMAC", "protect routes", "token".
  Always use before writing any auth code.
---

# Auth & Security Expert

## JWT
```js
import jwt from 'jsonwebtoken';
export const signToken = (shop) => jwt.sign({ shop: shop.domain, id: shop.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
};
```

## HMAC Verification
```js
import crypto from 'crypto';
export const verifyWebhookHmac = (rawBody, hmacHeader, secret) => {
  const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
};
```

## Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Checklist
- [ ] HMAC verified on every webhook
- [ ] timingSafeEqual for all comparisons
- [ ] Secrets in .env only, never hardcoded
- [ ] helmet() on all routes
- [ ] Delete shop token on app/uninstalled
