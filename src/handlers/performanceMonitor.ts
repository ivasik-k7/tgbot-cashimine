import { Middleware } from "grammy";
import { BotContext, PerformanceOptions } from "../types";
import { Logger } from "../utils/logger";
import { config } from "../config";
import { HANDLER_CONSTANTS } from "../config/constants";

const logger = new Logger("PerformanceMonitor");

export function createPerformanceMonitor(options?: PerformanceOptions): Middleware<BotContext> {
  const {
    thresholdMs = HANDLER_CONSTANTS.PERFORMANCE.SLOW_THRESHOLD_MS,
    logSlowRequests = true,
    logAllRequests = config.environment === 'development',
    enabled = config.handlers.enablePerformanceMonitoring,
  } = options || {};

  if (!enabled) {
    return async (_, next) => await next();
  }

  return async (ctx, next) => {
    const startTime = Date.now();
    ctx.requestStartTime = startTime;

    try {
      await next();
    } finally {
      const duration = Date.now() - startTime;
      const updateType = Object.keys(ctx.update).find(key => key !== 'update_id') || 'unknown';

      // Log all requests in development
      if (logAllRequests) {
        logger.debug(`Request processed in ${duration}ms`, {
          updateId: ctx.update.update_id,
          updateType,
          userId: ctx.from?.id,
          duration,
        });
      }

      // Log slow requests
      if (logSlowRequests && duration > thresholdMs) {
        logger.warn(`Slow request detected: ${duration}ms`, {
          updateId: ctx.update.update_id,
          updateType,
          userId: ctx.from?.id,
          duration,
          thresholdMs,
          chatType: ctx.chat?.type,
          message: ctx.message?.text?.substring(0, 100),
        });
      }

      // Track memory usage in development
      if (config.environment === 'development' && duration > HANDLER_CONSTANTS.PERFORMANCE.CRITICAL_THRESHOLD_MS) {
        const memoryUsage = process.memoryUsage();
        logger.error(`Critical performance issue: ${duration}ms`, {
          duration,
          memoryUsage: {
            rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
            external: Math.round(memoryUsage.external / 1024 / 1024) + 'MB',
          },
        });
      }
    }
  };
}

/**
 * Get performance statistics
 */
export function getPerformanceStats(): {
  averageResponseTime: number;
  maxResponseTime: number;
  totalRequests: number;
} {
  // This would typically read from a metrics store
  // For now, return placeholder data
  return {
    averageResponseTime: 150,
    maxResponseTime: 2000,
    totalRequests: 0,
  };
}