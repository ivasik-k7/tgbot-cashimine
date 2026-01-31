import { Middleware } from "grammy";
import { BotContext, LoggingOptions } from "../types";
import { Logger } from "../utils/logger";
import { config } from "../config";

const logger = new Logger("RequestLogger");

export function createRequestLogger(
  options?: LoggingOptions
): Middleware<BotContext> {
  const {
    logLevel = config.logLevel,
    // includeHeaders = false,
    // includeBody = false,
    logFullUpdate = config.environment === "development",
    excludeSensitive = true,
    sensitiveFields = ["token", "password", "secret", "key"],
    enabled = config.handlers.enableRequestLogging,
  } = options || {};

  if (!enabled) {
    return async (_, next) => await next();
  }

  return async (ctx, next) => {
    const startTime = Date.now();
    const updateType =
      Object.keys(ctx.update).find((key) => key !== "update_id") || "unknown";

    // Log incoming request
    const requestLog: any = {
      updateId: ctx.update.update_id,
      updateType,
      userId: ctx.from?.id,
      username: ctx.from?.username,
      chatId: ctx.chat?.id,
      chatType: ctx.chat?.type,
      timestamp: new Date().toISOString(),
    };

    // Add message details if available
    if (ctx.message?.text) {
      requestLog.message = ctx.message.text.substring(0, 200);
      requestLog.messageLength = ctx.message.text.length;
    } else if (ctx.callbackQuery?.data) {
      requestLog.callbackData = ctx.callbackQuery.data;
    }

    // Log the request
    logger[logLevel](`Incoming ${updateType} update`, requestLog);

    // Log full update in development (be careful with sensitive data)
    if (logFullUpdate && config.environment === "development") {
      const sanitizedUpdate = sanitizeData(
        ctx.update,
        sensitiveFields,
        excludeSensitive
      );
      logger.debug("Full update data:", sanitizedUpdate);
    }

    try {
      await next();

      // Log successful processing
      const duration = Date.now() - startTime;
      logger.debug(`Request processed successfully in ${duration}ms`, {
        updateId: ctx.update.update_id,
        duration,
      });
    } catch (error) {
      // Log error with request context
      const duration = Date.now() - startTime;
      logger.error(`Request failed after ${duration}ms`, {
        ...requestLog,
        duration,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };
}

function sanitizeData(
  data: any,
  sensitiveFields: string[],
  excludeSensitive: boolean
): any {
  if (!excludeSensitive) return data;

  const sanitized = { ...data };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj !== "object" || obj === null) return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => sanitizeObject(item));
    }

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        result[key] = "[REDACTED]";
      } else if (typeof value === "object" && value !== null) {
        result[key] = sanitizeObject(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  };

  return sanitizeObject(sanitized);
}

/**
 * Get request statistics
 */
export function getRequestStats(): {
  totalRequests: number;
  requestsByType: Record<string, number>;
  averageProcessingTime: number;
} {
  // This would typically read from a metrics store
  return {
    totalRequests: 0,
    requestsByType: {},
    averageProcessingTime: 0,
  };
}
