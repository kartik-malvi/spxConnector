import { Queue, Worker } from "bullmq";

import { env } from "../config/env.js";

export const redisConnection = {
  url: env.REDIS_URL,
  maxRetriesPerRequest: null
} as const;

export const orderSyncQueue = new Queue("order-sync", {
  connection: redisConnection
});

export const createWorker = (
  processor: ConstructorParameters<typeof Worker>[1]
) =>
  new Worker("order-sync", processor, {
    connection: redisConnection,
    concurrency: 5
  });
