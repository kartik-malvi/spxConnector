import { logger } from "../lib/logger.js";

type GdprPayload = Record<string, unknown>;

export const shoplineGdprService = {
  async handleCustomerRedact(payload: GdprPayload) {
    logger.info("Received Shopline customer redact webhook", { payload });
  },

  async handleShopRedact(payload: GdprPayload) {
    logger.info("Received Shopline shop redact webhook", { payload });
  }
};
