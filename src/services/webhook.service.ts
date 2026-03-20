import type { Shop, WebhookDelivery } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

type CreateDeliveryInput = {
  shop: Shop;
  topic: string;
  deliveryId: string;
  payloadHash: string;
  payload: unknown;
};

export const webhookService = {
  async recordIncomingDelivery(input: CreateDeliveryInput): Promise<WebhookDelivery> {
    return prisma.webhookDelivery.upsert({
      where: {
        shopId_deliveryId: {
          shopId: input.shop.id,
          deliveryId: input.deliveryId
        }
      },
      update: {
        topic: input.topic,
        payloadHash: input.payloadHash,
        payload: input.payload as object
      },
      create: {
        shopId: input.shop.id,
        topic: input.topic,
        deliveryId: input.deliveryId,
        payloadHash: input.payloadHash,
        payload: input.payload as object
      }
    });
  },

  async markProcessed(id: string) {
    return prisma.webhookDelivery.update({
      where: { id },
      data: { processedAt: new Date() }
    });
  }
};
