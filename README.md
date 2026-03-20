# SPX Connector

Production-oriented Shopline public app scaffold for synchronizing new Shopline orders into Shopee Express (SPX), then writing the returned tracking number back into Shopline fulfillment data.

## Current State

This repository now includes:

- Express + TypeScript app scaffold
- Shopline OAuth install/callback flow
- Raw-body Shopline webhook handling with HMAC verification
- BullMQ queue for async order sync jobs
- Prisma schema for shops, webhook deliveries, and order sync state
- Shopline order to SPX payload mapping
- SPX client isolated behind a single service
- Shopline fulfillment tracking update service
- Basic tests for HMAC verification and webhook intake

## Important SPX Assumptions

The public SPX guide URL provided resolves through a client-rendered knowledge-base shell, but the underlying guide payload was not directly retrievable from the public endpoint. Because of that, the following SPX details are currently isolated assumptions that should be confirmed against the actual guide before production use:

- `POST /api/v1/orders` as the create-order endpoint
- `x-client-id` and `x-client-secret` headers for SPX auth
- tracking number returned inline in the create-order response
- `merchantCode` included in the create-order request body

All SPX-specific assumptions live in `src/services/spx-client.ts`, which is the main file to update once the exact guide payload is confirmed.

## Local Setup

1. Copy `.env.example` to `.env` and fill in real Shopline and SPX credentials.
2. Install dependencies with `npm install`.
3. Generate Prisma client with `npm run prisma:generate`.
4. Create the database schema with `npm run prisma:migrate -- --name init`.
5. Start Redis.
6. Run the API with `npm run dev`.
7. Run the worker with `npm run worker`.

## Docker Setup

1. Copy `.env.example` to `.env`.
2. For local Docker use, keep these host-facing values in `.env`:

```env
APP_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/spx_connector
REDIS_URL=redis://localhost:6379
SHOPLINE_REDIRECT_URI=http://localhost:3000/auth/callback
```

3. Start the stack:

```bash
docker compose up --build
```

4. The services started are:
- `postgres`
- `redis`
- `migrate`
- `app`
- `worker`

## Render Deployment

This repo includes a Render Blueprint file at [render.yaml](./render.yaml). Render can replace ngrok for Shopline testing by giving you a stable public `.onrender.com` URL.

### Deploy from GitHub

1. Push this repository to GitHub:
   `https://github.com/kartik-malvi/spxConnector.git`
2. In Render, create a new Blueprint and point it at this repo.
3. Render will create:
- `spxconnector-app` web service
- `spxconnector-worker` background worker
- `spxconnector-db` Postgres
- `spxconnector-redis` Key Value

Render is now the recommended public deployment path for this repo. You do not need ngrok if you deploy the app and worker on Render.

### Required Render env vars

Set these secret values in Render for both the web service and the worker:

- `APP_URL`
- `SHOPLINE_REDIRECT_URI`
- `SHOPLINE_APP_KEY`
- `SHOPLINE_APP_SECRET`
- `SHOPLINE_WEBHOOK_SECRET`
- `SPX_CLIENT_ID`
- `SPX_CLIENT_SECRET`
- `SPX_MERCHANT_CODE`

You can also set these optional values if needed:

- `SPX_API_BASE_URL`
- `SHOPLINE_APP_SCOPES`
- `SHOPLINE_API_BASE_URL`
- `SHOPLINE_ACCOUNTS_BASE_URL`

After the web service is created, set:

```env
APP_URL=https://your-render-app.onrender.com
SHOPLINE_REDIRECT_URI=https://your-render-app.onrender.com/auth/callback
```

### Shopline app values on Render

Use your Render web URL for:

- `App URL`:
  `https://your-render-app.onrender.com`
- `App callback URL`:
  `https://your-render-app.onrender.com/auth/callback`

Webhook URLs become:

- `https://your-render-app.onrender.com/webhooks/shopline/orders/create`
- `https://your-render-app.onrender.com/webhooks/shopline/app/uninstalled`
- `https://your-render-app.onrender.com/webhooks/shopline/gdpr/customers/redact`
- `https://your-render-app.onrender.com/webhooks/shopline/gdpr/shop/redact`

## Webhook Flow

1. Shopline sends `orders/create` webhook.
2. The app verifies the HMAC against the raw request body.
3. The webhook payload is stored for idempotency and auditability.
4. A background job is queued with a deterministic job id.
5. The worker maps the Shopline order into the SPX payload.
6. The worker creates the SPX order.
7. If a tracking number is available, the worker writes it back to Shopline fulfillment.
8. Sync status is persisted in the database.

## Tests

Run:

```bash
npm test
```
