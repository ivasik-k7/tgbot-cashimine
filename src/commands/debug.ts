import { BotContext } from "../types";
import { Logger } from "../utils/logger";
import { MESSAGES } from "../templates/messages";
import { config } from "../config";
import { isAdmin } from "../config/constants";

const logger = new Logger("DebugCommand");

export async function handleDebug(ctx: BotContext) {
  try {
    const userId = ctx.from?.id;
    
    if (config.isProduction && !isAdmin(userId)) {
      await ctx.reply(
        "🚫 Debug mode is only available in development or for administrators.",
        { parse_mode: "HTML" }
      );
      return;
    }

    logger.info(`/debug command from user ${userId}`);

    if (ctx.session) {
      ctx.session.lastInteraction = Date.now();
    }

    const debugData = {
      userId: ctx.from?.id,
      username: ctx.from?.username,
      language: ctx.from?.language_code,
      isPremium: ctx.from?.is_premium,
      chatType: ctx.chat?.type,
      chatId: ctx.chat?.id,
      environment: config.environment,
      isProduction: config.isProduction,
      maintenanceMode: config.handlers.maintenanceMode,
      rateLimiting: config.handlers.enableRateLimiting,
      performanceMonitoring: config.handlers.enablePerformanceMonitoring,
      requestLogging: config.handlers.enableRequestLogging,
      isAdmin: isAdmin(userId),
      adminCount: config.handlers.adminIds.length,
      updateId: ctx.update.update_id,
      session: ctx.session ? {
        step: ctx.session.step,
        lastInteraction: new Date(ctx.session.lastInteraction).toISOString(),
        referralCode: ctx.session.referralCode,
        handlerData: ctx.session.handlerData,
      } : null,
    };

    await ctx.reply(MESSAGES.DEBUG_TEMPLATE(debugData), {
      parse_mode: "HTML",
    });

    logger.debug(`Debug info sent to user ${userId}`, debugData);

  } catch (error) {
    logger.error("Error in /debug command:", error);
    
    await ctx.reply(
      "❌ <b>Debug Error</b>\n\n" +
      "Failed to gather debug information.",
      { parse_mode: "HTML" }
    );
  }
}