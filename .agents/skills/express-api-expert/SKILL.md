---
name: express-api-expert
description: >
  Expert skill for building REST APIs with Express.js. Use whenever the user wants to build a
  backend server, create API routes, add middleware, handle errors, validate requests, or build
  the backend for a Shopline app. Triggers for "Express", "REST API", "routes", "middleware",
  "backend server", "API endpoint". Always use before writing any Express code.
---

# Express API Expert

## App Setup
```js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.APP_URL }));
app.use('/webhooks', express.raw({ type: 'application/json' })); // BEFORE express.json()
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/webhooks', webhookRoutes);
app.use('/api', requireAuth, apiRoutes);
app.use(errorHandler);
```

## Async Handler
```js
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

## Error Handler
```js
export const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
};
```

## Validation (Zod)
```js
import { z } from 'zod';
const schema = z.object({ title: z.string().min(1), price: z.number().positive() });
router.post('/', asyncHandler(async (req, res) => {
  const data = schema.parse(req.body);
  res.status(201).json({ data });
}));
```
