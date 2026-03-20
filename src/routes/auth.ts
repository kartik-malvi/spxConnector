import { Router } from "express";

import { asyncHandler } from "../lib/async-handler.js";
import { AppError } from "../lib/errors.js";
import { shoplineAuthService } from "../services/shopline-auth.service.js";

export const authRouter = Router();

authRouter.get(
  "/install",
  asyncHandler(async (req, res) => {
    const shop = String(req.query.shop ?? "");
    if (!shop) {
      throw new AppError("Missing shop parameter", 400);
    }

    const state = shoplineAuthService.createState(shop);
    const redirectUrl = shoplineAuthService.getAuthorizeUrl(shop, state);
    res.redirect(302, redirectUrl);
  })
);

authRouter.get(
  "/callback",
  asyncHandler(async (req, res) => {
    const params = Object.fromEntries(
      Object.entries(req.query).map(([key, value]) => [key, String(value)])
    );

    if (!shoplineAuthService.verifyInstallHmac(params)) {
      throw new AppError("Invalid Shopline install HMAC", 401);
    }

    if (!params.shop || !params.code || !params.state) {
      throw new AppError("Missing Shopline callback parameters", 400);
    }

    if (!shoplineAuthService.verifyState(params.state, params.shop)) {
      throw new AppError("Invalid Shopline callback state", 401);
    }

    const shop = await shoplineAuthService.exchangeCodeForToken(params.shop, params.code);
    res.status(200).json({
      installed: true,
      shop: {
        id: shop.id,
        domain: shop.domain
      }
    });
  })
);
