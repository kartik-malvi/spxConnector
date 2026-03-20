import type { ShoplineOrder } from "../types/shopline.js";
import { orderSyncQueue } from "../lib/queue.js";

type EnqueueOrderSyncInput = {
  shopId: string;
  webhookDeliveryId: string;
  order: ShoplineOrder;
};

export const enqueueOrderSync = async (input: EnqueueOrderSyncInput) => {
  await orderSyncQueue.add(
    "order-created",
    input,
    {
      jobId: `${input.shopId}:${input.order.id}`,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2_000
      },
      removeOnComplete: 100,
      removeOnFail: 100
    }
  );
};
