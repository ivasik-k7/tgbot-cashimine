import { Middleware } from "grammy";
import { BotContext, SessionValidationOptions } from "../types";
import { Logger } from "../utils/logger";

const logger = new Logger("SessionValidator");

export function createSessionValidator(
  options?: SessionValidationOptions
): Middleware<BotContext> {
  const {
    autoInitialize = true,
    validateOnStart = true,
    sessionTimeout = 30 * 60 * 1000, // 30 minutes
    cleanupOldSessions = true,
    enabled = true,
  } = options || {};

  if (!enabled) {
    return async (_, next) => await next();
  }

  return async (ctx, next) => {
    // Skip if already marked to skip
    if (ctx.skipHandlers?.includes("sessionValidator")) {
      return next();
    }

    // Initialize handler metadata if not exists
    if (!ctx.handlerMetadata) {
      ctx.handlerMetadata = {};
    }

    // 1. Ensure session exists
    if (!ctx.session && autoInitialize) {
      ctx.session = {
        lastInteraction: Date.now(),
        step: "idle",
        handlerData: {},
      };
      logger.debug(`Initialized new session for user ${ctx.from?.id}`);
    }

    // 2. Validate session data
    if (ctx.session && validateOnStart) {
      // Ensure required fields exist
      if (!ctx.session.lastInteraction) {
        ctx.session.lastInteraction = Date.now();
      }

      if (!ctx.session.step) {
        ctx.session.step = "idle";
      }

      if (!ctx.session.handlerData) {
        ctx.session.handlerData = {};
      }

      // Check for session timeout
      const now = Date.now();
      const timeSinceLastInteraction = now - ctx.session.lastInteraction;

      if (timeSinceLastInteraction > sessionTimeout) {
        logger.debug(`Session expired for user ${ctx.from?.id}, resetting`);
        ctx.session.step = "idle";
      }

      // Update last interaction time
      ctx.session.lastInteraction = now;

      // Initialize handler data if needed
      if (!ctx.session.handlerData.requestCount) {
        ctx.session.handlerData.requestCount = 0;
      }
      if (!ctx.session.handlerData.errorCount) {
        ctx.session.handlerData.errorCount = 0;
      }

      ctx.session.handlerData.requestCount++;
    }

    // 3. Store metadata
    ctx.handlerMetadata.sessionValidator = {
      initialized: !!ctx.session,
      userId: ctx.from?.id,
      timestamp: Date.now(),
    };

    try {
      await next();
    } catch (error) {
      // Increment error count in session
      if (ctx.session?.handlerData) {
        ctx.session.handlerData.errorCount =
          (ctx.session.handlerData.errorCount || 0) + 1;
      }
      throw error;
    }

    // 4. Optional: Cleanup logic (could be moved to a scheduled task)
    if (cleanupOldSessions && Math.random() < 0.01) {
      // 1% chance to run cleanup (production would use a scheduled job)
      // This would typically interact with your session store
    }
  };
}

/**
 * Helper to reset user session
 */
export function resetUserSession(ctx: BotContext): void {
  ctx.session = {
    lastInteraction: Date.now(),
    step: "idle",
    handlerData: {},
  };
  logger.info(`Session reset for user ${ctx.from?.id}`);
}

/**
 * Helper to check if session is active
 */
export function isSessionActive(
  ctx: BotContext,
  maxInactiveTime: number = 30 * 60 * 1000
): boolean {
  if (!ctx.session?.lastInteraction) return false;

  const now = Date.now();
  return now - ctx.session.lastInteraction < maxInactiveTime;
}
