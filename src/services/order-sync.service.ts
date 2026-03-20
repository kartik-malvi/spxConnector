import type { Shop } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import type { ShoplineOrder } from "../types/shopline.js";
import { mapShoplineOrderToSpx } from "./order-mapper.js";
import { shoplineApiService } from "./shopline-api.service.js";
import { spxClient } from "./spx-client.js";

type SyncOrderInput = {
  shop: Shop;
  order: ShoplineOrder;
  webhookDeliveryId?: string;
};

export const orderSyncService = {
  async syncOrder(input: SyncOrderInput) {
    const existing = await prisma.orderSync.findUnique({
      where: {
        shopId_shoplineOrderId: {
          shopId: input.shop.id,
          shoplineOrderId: input.order.id
        }
      }
    });

    if (existing?.status === "fulfilled" && existing.spxTrackingNumber) {
      logger.info("Skipping already-synced order", {
        orderId: input.order.id,
        shopId: input.shop.id
      });
      return existing;
    }

    if (!input.shop.spxMerchantCode) {
      throw new AppError("SPX merchant code is not configured for this shop", 422, {
        shopId: input.shop.id
      });
    }

    const requestPayload = mapShoplineOrderToSpx(input.order, {
      merchantCode: input.shop.spxMerchantCode
    });

    const created = await spxClient.createOrder(requestPayload, {
      apiBaseUrl: input.shop.spxApiBaseUrl,
      clientId: input.shop.spxClientId,
      clientSecret: input.shop.spxClientSecret,
      accessToken: input.shop.spxAccessToken,
      merchantCode: input.shop.spxMerchantCode
    });

    if (created.trackingNumber) {
      await shoplineApiService.createFulfillmentTracking({
        shopDomain: input.shop.domain,
        accessToken: input.shop.accessToken,
        orderId: input.order.id,
        trackingNumber: created.trackingNumber,
        trackingCompany: "Shopee Express (SPX)"
      });
    }

    return prisma.orderSync.upsert({
      where: {
        shopId_shoplineOrderId: {
          shopId: input.shop.id,
          shoplineOrderId: input.order.id
        }
      },
      update: {
        shoplineOrderNumber: input.order.order_number,
        webhookDeliveryId: input.webhookDeliveryId,
        status: created.trackingNumber ? "fulfilled" : "created",
        spxOrderReference: created.orderId,
        spxTrackingNumber: created.trackingNumber,
        requestPayload,
        responsePayload: created.raw as object,
        lastError: null
      },
      create: {
        shopId: input.shop.id,
        shoplineOrderId: input.order.id,
        shoplineOrderNumber: input.order.order_number,
        webhookDeliveryId: input.webhookDeliveryId,
        status: created.trackingNumber ? "fulfilled" : "created",
        spxOrderReference: created.orderId,
        spxTrackingNumber: created.trackingNumber,
        requestPayload,
        responsePayload: created.raw as object
      }
    });
  },

  async failOrderSync(shopId: string, shoplineOrderId: string, error: Error) {
    return prisma.orderSync.upsert({
      where: {
        shopId_shoplineOrderId: {
          shopId,
          shoplineOrderId
        }
      },
      update: {
        status: "failed",
        lastError: error.message
      },
      create: {
        shopId,
        shoplineOrderId,
        status: "failed",
        lastError: error.message
      }
    });
  }
};
