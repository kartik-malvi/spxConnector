---
name: background-jobs-expert
description: >
  Expert skill for background job queues and async processing using BullMQ. Use whenever the
  user wants to process webhooks async, set up a job queue, run background workers, schedule
  cron jobs, or handle retries. Triggers for "background job", "queue", "BullMQ", "worker",
  "async processing", "cron". Always use before writing any queue or worker code.
---

# Background Jobs Expert

## Setup
```bash
npm install bullmq ioredis
```

## Queue + Add Job (from webhook route)
```ts
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

export const redis = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
export const webhookQueue = new Queue('webhooks', { connection: redis });

// In webhook route — respond 200 immediately, process async
await webhookQueue.add('order-created', { shop, payload }, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 }
});
res.status(200).send('OK');
```

## Worker
```ts
import { Worker } from 'bullmq';

const worker = new Worker('webhooks', async (job) => {
  const { shop, payload } = job.data;
  if (job.name === 'order-created') {
    // 1. Call SPX API → create shipment
    // 2. Get tracking number
    // 3. Update Shopline fulfillment
    // 4. Save to DB
  }
}, { connection: redis, concurrency: 5 });

worker.on('completed', job => console.log(`Done: ${job.id}`));
worker.on('failed', (job, err) => console.error(`Failed: ${job?.id}`, err));
```

## When to use queues
- Shopline webhook → SPX API calls (always queue)
- Any task over 2 seconds (always queue)
- Simple DB reads (no queue needed)
