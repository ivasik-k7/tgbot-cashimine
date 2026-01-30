import { Bot } from "grammy";
import { BotContext } from "../types";
import { Logger } from "../utils/logger";
import { config } from "../config";

const logger = new Logger("HandlerManager");

/**
 * Pre-configured handler setup for easy integration
 */
export function setupHandlers(bot: Bot<BotContext>) {
  logger.info("Setting up bot handlers...");
  
  // Import handlers
  const { createMaintenanceMode } = require('./maintenanceMode');
  const { createRequestLogger } = require('./requestLogger');
  const { createPerformanceMonitor } = require('./performanceMonitor');
  const { createUpdateFilter } = require('./updateFilter');
  const { createSessionValidator } = require('./sessionValidator');
  const { createRateLimiter } = require('./rateLimiter');
  const { createRetryHandler } = require('./retryHandler');
  const { createAdminOnly } = require('./adminOnly');
  
  // 1. Maintenance Mode (should be first)
  if (config.handlers.maintenanceMode) {
    bot.use(createMaintenanceMode());
    logger.warn("⚠️ Bot is in maintenance mode!");
  }
  
  // 2. Request Logger (early logging)
  if (config.handlers.enableRequestLogging) {
    bot.use(createRequestLogger({
      logLevel: config.logLevel,
      excludeSensitive: config.isProduction,
    }));
  }
  
  // 3. Performance Monitor
  if (config.handlers.enablePerformanceMonitoring) {
    bot.use(createPerformanceMonitor({
      thresholdMs: config.isProduction ? 1000 : 2000,
      logSlowRequests: true,
    }));
  }
  
  // 4. Update Filter
  bot.use(createUpdateFilter({
    skipBotUsers: true,
    skipEditedMessages: !config.isProduction,
    allowedChatTypes: ['private', 'group', 'supergroup'],
  }));
  
  // 5. Session Validator
  bot.use(createSessionValidator({
    autoInitialize: true,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
  }));
  
  // 6. Rate Limiter
  if (config.handlers.enableRateLimiting) {
    bot.use(createRateLimiter({
      maxRequests: config.isProduction ? 10 : 100,
      timeWindow: 60000, // 1 minute
      excludeAdmins: true,
    }));
  }
  
  // 7. Retry Handler (for API calls)
  bot.use(createRetryHandler({
    maxRetries: 3,
    exponentialBackoff: true,
  }));
  
  logger.info(`✅ Handlers setup complete. Environment: ${config.environment}`);
  
  // Return bot for chaining
  return bot;
}

/**
 * Get handler statistics
 */
export function getHandlerStats() {
  const stats = {
    maintenanceMode: config.handlers.maintenanceMode,
    rateLimiting: config.handlers.enableRateLimiting,
    performanceMonitoring: config.handlers.enablePerformanceMonitoring,
    requestLogging: config.handlers.enableRequestLogging,
    totalAdmins: config.handlers.adminIds.length,
    environment: config.environment,
  };
  
  return stats;
}

/**
 * Enable/disable maintenance mode
 */
export function setMaintenanceMode(enabled: boolean) {
  logger[enabled ? 'warn' : 'info'](
    `Maintenance mode ${enabled ? 'ENABLED' : 'DISABLED'}`
  );
  
  config.handlers.maintenanceMode = enabled;
  return enabled;
}

/**
 * Get all handler configurations
 */
export function getHandlerConfig() {
  return {
    ...config.handlers,
    environment: config.environment,
    isProduction: config.isProduction,
  };
}