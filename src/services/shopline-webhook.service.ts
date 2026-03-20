import { env } from "../config/env.js";
import { AppError } from "../lib/errors.js";
import { createHexHash, verifyBase64Hmac } from "../lib/hmac.js";
import { enqueueOrderSync } from "../jobs/order-sync.queue.js";
import { shopService } from "./shop.service.js";
import { webhookService } from "./webhook.service.js";
import type { ShoplineOrder } from "../types/shopline.js";

type OrderCreatedHeaders = {
  hmac: string;
  shopDomain: string;
  topic: string;
  deliveryId: string;
};

type UninstalledHeaders = {
  hmac: string;
  shopDomain: string;
};

export const shoplineWebhookService = {
  async handleOrderCreated(rawBody: Buffer, headers: OrderCreatedHeaders) {
    if (!verifyBase64Hmac(rawBody, headers.hmac, env.SHOPLINE_WEBHOOK_SECRET)) {
      throw new AppError("Invalid Shopline webhook HMAC", 401);
    }

    if (!headers.shopDomain || !headers.deliveryId) {
      throw new AppError("Missing Shopline webhook headers", 400);
    }

    const shop = await shopService.findByDomain(headers.shopDomain);
    if (!shop) {
      throw new AppError("Shop not installed", 404, { shopDomain: headers.shopDomain });
    }

    const order = JSON.parse(rawBody.toString("utf8")) as ShoplineOrder;
    const delivery = await webhookService.recordIncomingDelivery({
      shop,
      topic: headers.topic,
      deliveryId: headers.deliveryId,
      payloadHash: createHexHash(rawBody),
      payload: order
    });

    await enqueueOrderSync({
      shopId: shop.id,
      webhookDeliveryId: delivery.id,
      order
    });
  },

  async handleAppUninstalled(rawBody: Buffer, headers: UninstalledHeaders) {
    if (!verifyBase64Hmac(rawBody, headers.hmac, env.SHOPLINE_WEBHOOK_SECRET)) {
      throw new AppError("Invalid Shopline webhook HMAC", 401);
    }

    if (headers.shopDomain) {
      await shopService.markUninstalled(headers.shopDomain);
    }
  }
};
