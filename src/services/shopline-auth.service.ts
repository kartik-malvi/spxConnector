import crypto from "node:crypto";

import { env } from "../config/env.js";
import { AppError } from "../lib/errors.js";
import { shopService } from "./shop.service.js";

const buildQueryString = (params: Record<string, string>) =>
  Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

export const shoplineAuthService = {
  createState(shop: string) {
    const payload = Buffer.from(
      JSON.stringify({
        nonce: crypto.randomBytes(16).toString("hex"),
        shop,
        timestamp: Date.now()
      })
    ).toString("base64url");

    const signature = crypto
      .createHmac("sha256", env.SHOPLINE_APP_SECRET)
      .update(payload)
      .digest("hex");

    return `${payload}.${signature}`;
  },

  verifyState(state: string, shop: string) {
    const [payload, signature] = state.split(".");
    if (!payload || !signature) {
      return false;
    }

    const expected = crypto
      .createHmac("sha256", env.SHOPLINE_APP_SECRET)
      .update(payload)
      .digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
      return false;
    }

    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      shop?: string;
      timestamp?: number;
    };

    const isExpired =
      typeof decoded.timestamp !== "number" || Date.now() - decoded.timestamp > 10 * 60 * 1000;

    return decoded.shop === shop && !isExpired;
  },

  verifyInstallHmac(params: Record<string, string>) {
    const incomingHmac = params.hmac;
    if (!incomingHmac) {
      return false;
    }

    const { hmac, ...rest } = params;
    const digest = crypto
      .createHmac("sha256", env.SHOPLINE_APP_SECRET)
      .update(buildQueryString(rest))
      .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
  },

  getAuthorizeUrl(shop: string, state: string) {
    const url = new URL("/oauth/authorize", env.SHOPLINE_ACCOUNTS_BASE_URL);
    url.searchParams.set("client_id", env.SHOPLINE_APP_KEY);
    url.searchParams.set("scope", env.SHOPLINE_APP_SCOPES);
    url.searchParams.set("redirect_uri", env.SHOPLINE_REDIRECT_URI);
    url.searchParams.set("state", state);
    url.searchParams.set("shop", shop);
    return url.toString();
  },

  async exchangeCodeForToken(shop: string, code: string) {
    const url = new URL("/oauth/token", env.SHOPLINE_ACCOUNTS_BASE_URL);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        client_id: env.SHOPLINE_APP_KEY,
        client_secret: env.SHOPLINE_APP_SECRET,
        code,
        redirect_uri: env.SHOPLINE_REDIRECT_URI,
        grant_type: "authorization_code",
        shop
      })
    });

    if (!response.ok) {
      throw new AppError("Failed to exchange Shopline auth code", 502);
    }

    const payload = (await response.json()) as {
      access_token?: string;
      scope?: string;
      shop_id?: string;
    };

    if (!payload.access_token || !payload.shop_id) {
      throw new AppError("Shopline token response was incomplete", 502, payload);
    }

    return shopService.upsertShop({
      shoplineShopId: payload.shop_id,
      domain: shop,
      accessToken: payload.access_token,
      scope: payload.scope
    });
  }
};
