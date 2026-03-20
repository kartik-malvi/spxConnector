import { env } from "../config/env.js";
import { AppError } from "../lib/errors.js";
import type { SpxCreateOrderPayload, SpxCreateOrderResponse } from "../types/spx.js";

type SpxAuthContext = {
  clientId?: string | null;
  clientSecret?: string | null;
  merchantCode?: string | null;
  accessToken?: string | null;
  apiBaseUrl?: string | null;
};

const buildAssumedHeaders = (context: SpxAuthContext) => {
  const clientId = context.clientId ?? env.SPX_CLIENT_ID;
  const clientSecret = context.clientSecret ?? env.SPX_CLIENT_SECRET;

  return {
    "content-type": "application/json",
    "x-client-id": clientId,
    "x-client-secret": clientSecret,
    authorization: context.accessToken ? `Bearer ${context.accessToken}` : undefined
  };
};

export const spxClient = {
  async createOrder(
    payload: SpxCreateOrderPayload,
    context: SpxAuthContext = {}
  ): Promise<SpxCreateOrderResponse> {
    const baseUrl = context.apiBaseUrl ?? env.SPX_API_BASE_URL;
    const url = new URL("/api/v1/orders", baseUrl);

    const response = await fetch(url, {
      method: "POST",
      headers: Object.fromEntries(
        Object.entries(buildAssumedHeaders(context)).filter((entry): entry is [string, string] =>
          Boolean(entry[1])
        )
      ),
      body: JSON.stringify(payload)
    });

    const raw = await response.json().catch(() => null);

    if (!response.ok) {
      throw new AppError("SPX order creation failed", 502, {
        status: response.status,
        response: raw
      });
    }

    const trackingNumber =
      raw?.trackingNumber ?? raw?.tracking_no ?? raw?.data?.trackingNumber ?? raw?.data?.tracking_no;
    const orderId = raw?.orderId ?? raw?.order_id ?? raw?.data?.orderId ?? raw?.data?.order_id;

    return {
      orderId,
      trackingNumber,
      raw
    };
  }
};
