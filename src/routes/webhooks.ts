import { Router } from "express";

import { asyncHandler } from "../lib/async-handler.js";
import { shoplineGdprService } from "../services/shopline-gdpr.service.js";
import { shoplineWebhookService } from "../services/shopline-webhook.service.js";

export const webhookRouter = Router();

webhookRouter.post(
  "/shopline/orders/create",
  asyncHandler(async (req, res) => {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from([]);
    await shoplineWebhookService.handleOrderCreated(rawBody, {
      hmac: String(req.headers["x-shopline-hmac-sha256"] ?? ""),
      shopDomain: String(req.headers["x-shopline-shop-domain"] ?? ""),
      topic: String(req.headers["x-shopline-topic"] ?? "orders/create"),
      deliveryId: String(req.headers["x-shopline-event-id"] ?? "")
    });

    res.status(202).json({ accepted: true });
  })
);

webhookRouter.post(
  "/shopline/app/uninstalled",
  asyncHandler(async (req, res) => {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from([]);
    await shoplineWebhookService.handleAppUninstalled(rawBody, {
      hmac: String(req.headers["x-shopline-hmac-sha256"] ?? ""),
      shopDomain: String(req.headers["x-shopline-shop-domain"] ?? "")
    });

    res.status(200).json({ ok: true });
  })
);

webhookRouter.post(
  "/shopline/gdpr/customers/redact",
  asyncHandler(async (req, res) => {
    const payload = JSON.parse((Buffer.isBuffer(req.body) ? req.body : Buffer.from("{}")).toString("utf8"));
    await shoplineGdprService.handleCustomerRedact(payload);
    res.status(200).json({ ok: true });
  })
);

webhookRouter.post(
  "/shopline/gdpr/shop/redact",
  asyncHandler(async (req, res) => {
    const payload = JSON.parse((Buffer.isBuffer(req.body) ? req.body : Buffer.from("{}")).toString("utf8"));
    await shoplineGdprService.handleShopRedact(payload);
    res.status(200).json({ ok: true });
  })
);
