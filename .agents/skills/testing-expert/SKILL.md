---
name: testing-expert
description: >
  Expert skill for writing tests for Node.js and Express apps using Vitest and Supertest. Use
  whenever the user wants to write unit tests, integration tests, test API endpoints, test webhook
  handlers, or mock API calls. Triggers for "test", "Vitest", "Jest", "unit test", "mock",
  "coverage". Always use before writing any test files.
---

# Testing Expert

## Setup
```bash
npm install -D vitest @vitest/coverage-v8 supertest
```

## Unit Test — HMAC
```ts
import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { verifyWebhookHmac } from '../../utils/hmac';

describe('verifyWebhookHmac', () => {
  it('returns true for valid HMAC', () => {
    const body = Buffer.from('{}');
    const secret = 'test-secret';
    const hmac = crypto.createHmac('sha256', secret).update(body).digest('base64');
    expect(verifyWebhookHmac(body, hmac, secret)).toBe(true);
  });
  it('returns false for invalid HMAC', () => {
    expect(verifyWebhookHmac(Buffer.from('{}'), 'bad', 'secret')).toBe(false);
  });
});
```

## Integration Test
```ts
import request from 'supertest';
import app from '../../app';

describe('POST /webhooks/orders', () => {
  it('returns 401 for invalid HMAC', async () => {
    const res = await request(app)
      .post('/webhooks/orders')
      .set('x-shopline-hmac-sha256', 'invalid')
      .send('{}');
    expect(res.status).toBe(401);
  });
});
```

## Test Webhooks Locally
```bash
npx ngrok http 3000
# Use the https URL in Shopline partner portal webhook settings
```
