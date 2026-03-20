import { createWorker } from "../lib/queue.js";
import { logger } from "../lib/logger.js";
import { shopService } from "../services/shop.service.js";
import { orderSyncService } from "../services/order-sync.service.js";
import { webhookService } from "../services/webhook.service.js";
import type { ShoplineOrder } from "../types/shopline.js";

type OrderCreatedJob = {
  shopId: string;
  webhookDeliveryId: string;
  order: ShoplineOrder;
};

const worker = createWorker(async (job) => {
  if (job.name !== "order-created") {
    return;
  }

  const { shopId, webhookDeliveryId, order } = job.data as OrderCreatedJob;
  const shop = await shopService.findById(shopId);

  if (!shop) {
    throw new Error(`Shop not found for job ${job.id}`);
  }

  try {
    await orderSyncService.syncOrder({
      shop,
      order,
      webhookDeliveryId
    });

    await webhookService.markProcessed(webhookDeliveryId);
  } catch (error) {
    const resolved = error instanceof Error ? error : new Error("Unknown order sync error");
    await orderSyncService.failOrderSync(shop.id, order.id, resolved);
    throw resolved;
  }
});

worker.on("completed", (job) => {
  logger.info("Order sync job completed", { jobId: job.id, name: job.name });
});

worker.on("failed", (job, error) => {
  logger.error("Order sync job failed", {
    jobId: job?.id,
    name: job?.name,
    error: error.message
  });
});
