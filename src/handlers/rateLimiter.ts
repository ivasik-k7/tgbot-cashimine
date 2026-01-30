import { Middleware } from "grammy";
import { BotContext, RateLimitOptions } from "../types";
import { Logger } from "../utils/logger";
import { config } from "../config";
import { HANDLER_CONSTANTS, isAdmin } from "../config/constants";

const logger = new Logger("RateLimiter");

// In-memory store for rate limiting (use Redis in production)
const requestStore = new Map<number, number[]>();

export function createRateLimiter(options?: RateLimitOptions): Middleware<BotContext> {
  const {
    maxRequests = HANDLER_CONSTANTS.RATE_LIMIT.DEFAULT_MAX_REQUESTS,
    timeWindow = HANDLER_CONSTANTS.RATE_LIMIT.DEFAULT_WINDOW_MS,
    cooldownMessage = HANDLER_CONSTANTS.RATE_LIMIT.COOLDOWN_MESSAGE,
    excludeAdmins = true,
    enabled = config.handlers.enableRateLimiting,
  } = options || {};

  if (!enabled) {
    logger.info("Rate limiter is disabled");
    return async (ctx, next) => await next();
  }

  return async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId) return next();

    // Check if user is admin and should be excluded
    if (excludeAdmins && isAdmin(userId)) {
      return next();
    }

    const now = Date.now();
    let userRequests = requestStore.get(userId) || [];

    // Clean old requests
    userRequests = userRequests.filter(timestamp => now - timestamp < timeWindow);

    if (userRequests.length >= maxRequests) {
      logger.warn(`Rate limit exceeded for user ${userId}`, {
        userId,
        requestCount: userRequests.length,
        maxRequests,
      });

      try {
        if (ctx.chat?.type === 'private') {
          await ctx.reply(cooldownMessage, { parse_mode: "HTML" });
        }
      } catch (error) {
        logger.error("Failed to send rate limit message:", error);
      }
      return;
    }

    // Add current request
    userRequests.push(now);
    requestStore.set(userId, userRequests);

    // Periodic cleanup (every 1000 requests, clean up old entries)
    if (requestStore.size > 1000) {
      cleanupOldEntries(requestStore, timeWindow);
    }

    await next();
  };
}

function cleanupOldEntries(store: Map<number, number[]>, timeWindow: number): void {
  const now = Date.now();
  const cutoffTime = now - timeWindow * 10; // Keep some history

  for (const [userId, timestamps] of store.entries()) {
    const validTimestamps = timestamps.filter(t => t > cutoffTime);
    if (validTimestamps.length === 0) {
      store.delete(userId);
    } else {
      store.set(userId, validTimestamps);
    }
  }
}

export function cleanupRateLimitStore(): void {
  cleanupOldEntries(requestStore, HANDLER_CONSTANTS.RATE_LIMIT.DEFAULT_WINDOW_MS);
  logger.debug("Cleaned up rate limit store");
}