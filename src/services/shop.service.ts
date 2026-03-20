import { prisma } from "../lib/prisma.js";

type UpsertShopInput = {
  shoplineShopId: string;
  domain: string;
  accessToken: string;
  scope?: string;
};

export const shopService = {
  findByDomain(domain: string) {
    return prisma.shop.findUnique({ where: { domain } });
  },

  findById(id: string) {
    return prisma.shop.findUnique({ where: { id } });
  },

  async upsertShop(input: UpsertShopInput) {
    return prisma.shop.upsert({
      where: { domain: input.domain },
      update: {
        accessToken: input.accessToken,
        scope: input.scope,
        shoplineShopId: input.shoplineShopId,
        uninstalledAt: null
      },
      create: input
    });
  },

  async markUninstalled(domain: string) {
    return prisma.shop.updateMany({
      where: { domain },
      data: {
        uninstalledAt: new Date()
      }
    });
  }
};
