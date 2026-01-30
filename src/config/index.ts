import { config as dotenvConfig } from "dotenv";
import { Config } from "../types";
import { getAdminIds } from "./constants";

dotenvConfig();

export const config: Config = {
  botToken: process.env.BOT_TOKEN || "",
  botUsername: process.env.BOT_USERNAME || "CashimineBot",
  
  environment: (process.env.NODE_ENV || "development") as "development" | "production" | "test",
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  
  webAppUrl: process.env.WEB_APP_URL || "https://cashimine.netlify.app/",
  
  webhookUrl: process.env.WEBHOOK_URL,
  webhookSecret: process.env.WEBHOOK_SECRET || "default_secret_change_me",

  logLevel: (process.env.LOG_LEVEL || "debug") as any,
  
  isProduction: process.env.NODE_ENV === "production",
  
  // Add handler-specific configurations
  handlers: {
    enableRateLimiting: process.env.ENABLE_RATE_LIMITING !== "false",
    enablePerformanceMonitoring: process.env.ENABLE_PERFORMANCE_MONITOR !== "false",
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === "true",
    maintenanceMode: process.env.MAINTENANCE_MODE === "true",
    adminIds: getAdminIds(),
  },
};

export function validateConfig(): void {
  if (!config.botToken || config.botToken.trim() === "") {
    throw new Error("CRITICAL CONFIG ERROR: BOT_TOKEN is missing!");
  }

  if (config.isProduction) {
    if (!config.webhookUrl) throw new Error("CRITICAL: WEBHOOK_URL is required in production!");
    if (config.webhookSecret === "default_secret_change_me") {
       console.warn("SECURITY WARNING: Using default webhookSecret in production!");
    }
  }

  try {
    new URL(config.webAppUrl);
    if (config.webhookUrl) new URL(config.webhookUrl);
  } catch (e) {
    throw new Error("CRITICAL CONFIG ERROR: WebApp or Webhook URL is malformed.");
  }
  
  // Validate admin IDs
  if (config.handlers.adminIds.length === 0 && config.isProduction) {
    console.warn("⚠️  No admin IDs configured. Admin-only features will not work.");
  }
}