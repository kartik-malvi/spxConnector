import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";
import { app } from "./app.js";

const server = app.listen(env.PORT, () => {
  logger.info("HTTP server listening", { port: env.PORT });
});

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
