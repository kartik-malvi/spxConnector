import { env } from "../config/env.js";
import { AppError } from "../lib/errors.js";

type FulfillmentTrackingInput = {
  shopDomain: string;
  accessToken: string;
  orderId: string;
  trackingNumber: string;
  trackingCompany: string;
};

export const shoplineApiService = {
  async createFulfillmentTracking(input: FulfillmentTrackingInput) {
    const baseUrl = new URL(env.SHOPLINE_API_BASE_URL);
    const url = new URL(`/admin/openapi/v20251201/orders/${input.orderId}/fulfillments`, baseUrl);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-shopline-access-token": input.accessToken
      },
      body: JSON.stringify({
        fulfillment: {
          tracking_number: input.trackingNumber,
          tracking_company: input.trackingCompany
        }
      })
    });

    if (!response.ok) {
      throw new AppError("Failed to update Shopline fulfillment tracking", 502, {
        orderId: input.orderId,
        status: response.status
      });
    }

    return response.json();
  }
};
