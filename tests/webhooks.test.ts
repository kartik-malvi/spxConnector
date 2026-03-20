import crypto from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/config/env.js", () => ({
  env: {
    SHOPLINE_WEBHOOK_SECRET: "webhook-secret"
  }
}));

vi.mock("../src/services/shop.service.js", () => ({
  shopService: {
    findByDomain: vi.fn(),
    markUninstalled: vi.fn()
  }
}));

vi.mock("../src/services/webhook.service.js", () => ({
  webhookService: {
    recordIncomingDelivery: vi.fn(),
    markProcessed: vi.fn()
  }
}));

vi.mock("../src/jobs/order-sync.queue.js", () => ({
  enqueueOrderSync: vi.fn()
}));

const { shoplineWebhookService } = await import("../src/services/shopline-webhook.service.js");
const { shopService } = await import("../src/services/shop.service.js");
const { webhookService } = await import("../src/services/webhook.service.js");
const { enqueueOrderSync } = await import("../src/jobs/order-sync.queue.js");

const createWebhookHmac = (body: Buffer) =>
  crypto.createHmac("sha256", "webhook-secret").update(body).digest("base64");

describe("shoplineWebhookService.handleOrderCreated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws for an invalid HMAC", async () => {
    const body = Buffer.from(JSON.stringify({ id: "order-1", line_items: [] }));

    await expect(
      shoplineWebhookService.handleOrderCreated(body, {
        hmac: "invalid",
        shopDomain: "demo.myshopline.com",
        topic: "orders/create",
        deliveryId: "evt-1"
      })
    ).rejects.toThrow("Invalid Shopline webhook HMAC");
  });

  it("records and queues a valid order webhook", async () => {
    const body = Buffer.from(
      JSON.stringify({
        id: "order-1",
        line_items: []
      })
    );

    vi.mocked(shopService.findByDomain).mockResolvedValue({
      id: "shop-1",
      domain: "demo.myshopline.com"
    } as never);

    vi.mocked(webhookService.recordIncomingDelivery).mockResolvedValue({
      id: "delivery-1"
    } as never);

    await shoplineWebhookService.handleOrderCreated(body, {
      hmac: createWebhookHmac(body),
      shopDomain: "demo.myshopline.com",
      topic: "orders/create",
      deliveryId: "evt-1"
    });

    expect(webhookService.recordIncomingDelivery).toHaveBeenCalledTimes(1);
    expect(enqueueOrderSync).toHaveBeenCalledTimes(1);
  });
});
