import { prisma } from "../lib/prisma.js";

export const dashboardService = {
  async getDashboardSnapshot() {
    const [shops, orderSyncs, recentSyncs, recentDeliveries] = await Promise.all([
      prisma.shop.findMany({
        orderBy: { createdAt: "desc" },
        take: 5
      }),
      prisma.orderSync.findMany({
        orderBy: { updatedAt: "desc" }
      }),
      prisma.orderSync.findMany({
        include: { shop: true },
        orderBy: { updatedAt: "desc" },
        take: 8
      }),
      prisma.webhookDelivery.findMany({
        include: { shop: true },
        orderBy: { createdAt: "desc" },
        take: 6
      })
    ]);

    const totalOrders = orderSyncs.length;
    const fulfilledOrders = orderSyncs.filter((item) => item.status === "fulfilled").length;
    const failedOrders = orderSyncs.filter((item) => item.status === "failed").length;
    const pendingOrders = orderSyncs.filter(
      (item) => item.status === "pending" || item.status === "created"
    ).length;

    return {
      shops,
      recentSyncs,
      recentDeliveries,
      stats: {
        totalShops: shops.length,
        totalOrders,
        fulfilledOrders,
        failedOrders,
        pendingOrders
      }
    };
  },

  async getSyncLogSnapshot() {
    return prisma.orderSync.findMany({
      include: { shop: true },
      orderBy: { updatedAt: "desc" },
      take: 30
    });
  }
};
