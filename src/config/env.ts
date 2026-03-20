import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  SHOPLINE_APP_KEY: z.string().min(1),
  SHOPLINE_APP_SECRET: z.string().min(1),
  SHOPLINE_APP_SCOPES: z.string().min(1).default("read_orders,write_orders"),
  SHOPLINE_REDIRECT_URI: z.string().url(),
  SHOPLINE_API_BASE_URL: z.string().url().default("https://api.myshopline.com"),
  SHOPLINE_ACCOUNTS_BASE_URL: z.string().url().default("https://accounts.myshopline.com"),
  SHOPLINE_WEBHOOK_SECRET: z.string().min(1),
  SPX_API_BASE_URL: z.string().url().default("https://partner.spx.sg"),
  SPX_CLIENT_ID: z.string().min(1),
  SPX_CLIENT_SECRET: z.string().min(1),
  SPX_MERCHANT_CODE: z.string().min(1),
  SPX_WEBHOOK_SHARED_SECRET: z.string().min(1).optional()
});

export const env = envSchema.parse(process.env);
