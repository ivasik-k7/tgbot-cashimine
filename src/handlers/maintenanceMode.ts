import { Middleware } from "grammy";
import { BotContext, MaintenanceOptions } from "../types";
import { Logger } from "../utils/logger";
import { config } from "../config";
import { isAdmin } from "../config/constants";

const logger = new Logger("MaintenanceMode");

export function createMaintenanceMode(options?: MaintenanceOptions): Middleware<BotContext> {
  const {
    message = "🔧 The bot is currently under maintenance. Please try again later.",
    allowedEndpoints = ['/start', '/help'],
    enabled = config.handlers.maintenanceMode,
  } = options || {};

  if (!enabled) {
    return async (_, next) => await next();
  }

  return async (ctx, next) => {
    const userId = ctx.from?.id;
    const command = ctx.message?.text?.split(' ')[0] || '';
    
    // Allow admins to bypass maintenance mode
    if (userId && isAdmin(userId)) {
      logger.debug(`Admin ${userId} bypassed maintenance mode`);
      return next();
    }
    
    // Check if command is in allowed endpoints during maintenance
    const isAllowedCommand = allowedEndpoints.some(endpoint => 
      command.toLowerCase().includes(endpoint.toLowerCase())
    );
    
    if (isAllowedCommand) {
      return next();
    }
    
    // Block the request and send maintenance message
    logger.info(`Blocked request during maintenance: user ${userId}, command: ${command}`);
    
    try {
      if (ctx.callbackQuery) {
        await ctx.answerCallbackQuery({
          text: "⏳ Bot is under maintenance. Please try again later.",
          show_alert: true,
        });
      } else if (ctx.message) {
        await ctx.reply(
          `${message}\n\n` +
          `📅 Estimated completion: Soon\n` +
          `ℹ️ Follow @${config.botUsername} for updates`,
          { parse_mode: "HTML" }
        );
      }
    } catch (error) {
      logger.warn("Failed to send maintenance message:", error);
    }
  };
}

/**
 * Check if maintenance mode is active
 */
export function isMaintenanceMode(): boolean {
  return config.handlers.maintenanceMode;
}

/**
 * Toggle maintenance mode
 */
export function toggleMaintenanceMode(enabled: boolean): void {
  // In a real implementation, this would update a database or config service
  logger[enabled ? 'warn' : 'info'](
    `Maintenance mode ${enabled ? 'ENABLED' : 'DISABLED'}`
  );
  
  // For now, we'll just update the config
  // Note: This won't persist between restarts
  config.handlers.maintenanceMode = enabled;
}

/**
 * Get maintenance schedule
 */
export function getMaintenanceInfo(): {
  isActive: boolean;
  message: string;
  startedAt?: Date;
  estimatedEnd?: Date;
} {
  return {
    isActive: config.handlers.maintenanceMode,
    message: "Scheduled maintenance",
    startedAt: new Date(),
    estimatedEnd: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
  };
}