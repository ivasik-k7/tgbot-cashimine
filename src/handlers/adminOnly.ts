import { Middleware } from "grammy";
import { BotContext, AdminOnlyOptions } from "../types";
import { Logger } from "../utils/logger";
import { config } from "../config";
// import { isAdmin } from "../config/constants";

const logger = new Logger("AdminOnly");

export function createAdminOnly(
  options?: AdminOnlyOptions
): Middleware<BotContext> {
  const {
    errorMessage = "🚫 This command is only available for administrators.",
    allowInPrivateChats = true,
    requireSuperAdmin = false,
    superAdminIds = [],
    enabled = true,
    // skipForAdmins = false, // This doesn't make sense for adminOnly, so ignore
  } = options || {};

  if (!enabled) {
    return async (_, next) => await next();
  }

  return async (ctx, next) => {
    // Skip if already marked to skip
    if (ctx.skipHandlers?.includes("adminOnly")) {
      return next();
    }

    const userId = ctx.from?.id;

    // Allow all users in private chats if configured
    if (allowInPrivateChats && ctx.chat?.type === "private") {
      ctx.isAdmin = true; // Mark as admin for private chats
      return next();
    }

    if (!userId) {
      logger.warn("Admin check failed: No user ID");
      await ctx.reply("❌ Unable to verify user identity.", {
        parse_mode: "HTML",
      });
      return;
    }

    // Check if user is admin
    const adminIds = config.handlers.adminIds;
    const isUserAdmin = adminIds.includes(userId);

    // Check if super admin is required
    const isSuperAdmin =
      superAdminIds.length > 0 ? superAdminIds.includes(userId) : isUserAdmin; // If no superAdminIds specified, all admins are super admins

    if (requireSuperAdmin && !isSuperAdmin) {
      logger.warn(
        `Super admin required, but user ${userId} is not a super admin`
      );
      await ctx.reply(
        "🚫 This command requires super administrator privileges.",
        {
          parse_mode: "HTML",
        }
      );
      return;
    }

    if (!isUserAdmin) {
      logger.warn(`Non-admin user ${userId} attempted admin command`);

      // Log the attempt
      logger.info(
        `Admin access denied for user ${userId} in chat ${ctx.chat?.id}`,
        {
          userId,
          chatId: ctx.chat?.id,
          chatType: ctx.chat?.type,
          message: ctx.message?.text,
          timestamp: new Date().toISOString(),
        }
      );

      await ctx.reply(errorMessage, { parse_mode: "HTML" });
      return;
    }

    // User is admin, mark context and proceed
    ctx.isAdmin = true;

    // Store metadata
    if (!ctx.handlerMetadata) {
      ctx.handlerMetadata = {};
    }
    ctx.handlerMetadata.adminOnly = {
      isAdmin: true,
      isSuperAdmin,
      userId,
      timestamp: Date.now(),
    };

    logger.debug(`Admin access granted for user ${userId}`);
    await next();
  };
}

/**
 * Check if user is admin from context
 */
export function checkIsAdmin(ctx: BotContext): boolean {
  return ctx.isAdmin || false;
}

/**
 * Check if user is super admin
 */
export function checkIsSuperAdmin(
  ctx: BotContext,
  superAdminIds: number[] = []
): boolean {
  const userId = ctx.from?.id;
  if (!userId) return false;

  return superAdminIds.length > 0
    ? superAdminIds.includes(userId)
    : checkIsAdmin(ctx);
}

/**
 * Get admin statistics
 */
export function getAdminStats(): {
  totalAdmins: number;
  superAdmins: number;
} {
  const adminIds = config.handlers.adminIds;
  // Assuming first few are super admins for this example
  // In reality, you'd have a separate list
  const superAdmins = adminIds.slice(0, Math.min(3, adminIds.length));

  return {
    totalAdmins: adminIds.length,
    superAdmins: superAdmins.length,
  };
}
