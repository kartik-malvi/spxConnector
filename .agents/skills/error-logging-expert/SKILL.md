---
name: error-logging-expert
description: >
  Expert skill for error tracking and structured logging using Sentry and Winston. Use whenever
  the user wants to track errors, set up logging, monitor in production, add Sentry, or configure
  alerts. Triggers for "Sentry", "logging", "Winston", "monitor", "crash", "production errors".
  Always use before setting up any logging or monitoring.
---

# Error Logging Expert

## Sentry
```bash
npm install @sentry/node
```
```ts
// lib/sentry.ts — import FIRST in app.ts
import * as Sentry from '@sentry/node';
Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV, tracesSampleRate: 0.1 });

// app.ts
app.use(Sentry.Handlers.requestHandler());
// ... routes ...
app.use(Sentry.Handlers.errorHandler());
app.use(errorHandler);

// Capture manually with context
Sentry.captureException(err, { tags: { shop, feature: 'spx-sync' }, extra: { orderId } });
```

## Winston
```bash
npm install winston
```
```ts
import winston from 'winston';
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()]
});

logger.info('Order synced to SPX', { shoplineOrderId, spxOrderId, trackingNo });
logger.error('SPX API failed', { orderId, error: err.message });
```

## .env
```
SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz
NODE_ENV=production
```
