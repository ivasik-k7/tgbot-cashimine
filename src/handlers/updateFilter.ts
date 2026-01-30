import { Middleware } from "grammy";
import { BotContext, UpdateFilterOptions } from "../types";
import { Logger } from "../utils/logger";
import { config } from "../config";
import { isAdmin } from "../config/constants";

const logger = new Logger("UpdateFilter");

export function createUpdateFilter(options?: UpdateFilterOptions): Middleware<BotContext> {
  const {
    skipBotUsers = true,
    skipEditedMessages = true,
    skipChannelPosts = false,
    skipOldUpdates = config.isProduction,
    maxUpdateAge = 300, // 5 minutes
    allowedChatTypes = ['private', 'group', 'supergroup'],
    enabled = true,
    skipForAdmins = true,
    skipForTrusted = true,
  } = options || {};

  if (!enabled) {
    return async (_, next) => await next();
  }

  return async (ctx, next) => {
    // Skip if already marked to skip
    if (ctx.skipHandlers?.includes('updateFilter')) {
      return next();
    }

    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;
    const isTrustedChat = config.handlers.trustedChats?.includes(chatId || 0) || false;

    // Check if user/admin should be exempt
    if ((skipForAdmins && isAdmin(userId)) || (skipForTrusted && isTrustedChat)) {
      return next();
    }

    // 1. Filter by chat type
    if (allowedChatTypes.length > 0 && ctx.chat?.type) {
      if (!allowedChatTypes.includes(ctx.chat.type as any)) {
        logger.debug(`Skipping update from disallowed chat type: ${ctx.chat.type}`);
        return;
      }
    }

    // 2. Filter bot users
    if (skipBotUsers && ctx.from?.is_bot) {
      logger.debug(`Skipping update from bot user: ${userId}`);
      return;
    }

    // 3. Filter edited messages
    if (skipEditedMessages && ctx.update.edited_message) {
      logger.debug(`Skipping edited message from user: ${userId}`);
      return;
    }

    // 4. Filter channel posts
    if (skipChannelPosts && ctx.update.channel_post) {
      logger.debug(`Skipping channel post from chat: ${chatId}`);
      return;
    }

    // 5. Filter old updates (check update timestamp if available)
    if (skipOldUpdates && ctx.update.update_id) {
      // This would require storing the last processed update ID
      // For now, we'll log it
      logger.debug(`Processing update ID: ${ctx.update.update_id}`);
    }

    // 6. Check message age (if message has a date)
    if (skipOldUpdates && ctx.msg?.date) {
      const messageDate = ctx.msg.date * 1000; // Convert to milliseconds
      const now = Date.now();
      const messageAge = (now - messageDate) / 1000; // Age in seconds

      if (messageAge > maxUpdateAge) {
        logger.debug(`Skipping old message (${messageAge.toFixed(0)}s old) from user: ${userId}`);
        return;
      }
    }

    // 7. Check for spam patterns (basic example)
    if (isPotentialSpam(ctx)) {
      logger.warn(`Potential spam detected from user: ${userId}`);
      // You could implement a spam counter here
      return;
    }

    // Store metadata
    if (!ctx.handlerMetadata) {
      ctx.handlerMetadata = {};
    }
    ctx.handlerMetadata.updateFilter = {
      passed: true,
      filtersApplied: {
        chatType: true,
        botUsers: skipBotUsers,
        editedMessages: skipEditedMessages,
        channelPosts: skipChannelPosts,
      },
      timestamp: Date.now(),
    };

    await next();
  };
}

/**
 * Basic spam detection (extend based on your needs)
 */
function isPotentialSpam(ctx: BotContext): boolean {
  // Check for excessive similar messages in quick succession
  // This is a simplified example
  
  const message = ctx.message?.text || ctx.channelPost?.text;
  if (!message) return false;

  // Check for excessive capital letters
  const capitalRatio = (message.match(/[A-Z]/g) || []).length / message.length;
  if (capitalRatio > 0.7 && message.length > 10) {
    return true;
  }

  // Check for excessive links
  const linkCount = (message.match(/https?:\/\/[^\s]+/g) || []).length;
  if (linkCount > 3) {
    return true;
  }

  // Check for repetitive characters
  const repetitivePattern = /(.)\1{5,}/; // Same character 6+ times
  if (repetitivePattern.test(message)) {
    return true;
  }

  return false;
}

/**
 * Helper to check if update passed filters
 */
export function didPassFilters(ctx: BotContext): boolean {
  return ctx.handlerMetadata?.updateFilter?.passed || false;
}