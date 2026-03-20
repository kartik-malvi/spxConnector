import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { authRouter } from "./routes/auth.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { healthRouter } from "./routes/health.js";
import { webhookRouter } from "./routes/webhooks.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.APP_URL
  })
);

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/webhooks", express.raw({ type: "application/json" }), webhookRouter);
app.use(express.json());
app.use("/", dashboardRouter);

app.use(notFoundHandler);
app.use(errorHandler);
