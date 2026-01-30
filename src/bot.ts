import { Bot, InlineKeyboard, session } from "grammy";
import { BotContext, SessionData } from "./types";
import { config, validateConfig } from "./config";
import { Logger } from "./utils/logger";
import { errorHandler } from "./handlers/errorHandler";
import {
  handleStart,
  handleAbout,
  handleHelp,
  handleSupport,
  handleDashboard,
  handleWallet,
  handleTransactions,
  handleReferral,
  handleAdmin,
  handleStats,
  handleDebug,
} from "./commands";

import { setupHandlers } from "./handlers";
import { handleCallbackQuery } from "./handlers/callbacks";
import { handleTextMessage } from "./handlers/messages";

const logger = new Logger("Bot");

class TelegramBot {
  public bot: Bot<BotContext>;

  constructor() {
    validateConfig();

    this.bot = new Bot<BotContext>(config.botToken);

    this.setupMiddleware();
    this.setupHandlers();

    this.bot.catch(errorHandler);
  }

  /**
   * Sets up the processing pipeline (Middleware)
   * Order matters here!
   */
  private setupMiddleware(): void {
    logger.info("Setting up middleware...");

    this.bot.use(async (ctx, next) => {
      ctx.config = config;
      await next();
    });

    setupHandlers(this.bot);

    // this.bot.use(loggingMiddleware);

    // D. Session Management (Memory storage for now)
    // Persists data like "Did this user click the start link?"
    // Note: sessionValidator handler will already initialize sessions,
    // but we keep this for backward compatibility
    this.bot.use(
      session({
        initial: (): SessionData => ({
          lastInteraction: Date.now(),
          step: "idle",
          referralCode: undefined,
        }),
        getSessionKey: (ctx) => {
          if (ctx.from?.id && ctx.chat?.type === "private") {
            return `user_${ctx.from.id}`;
          }
          if (ctx.chat?.id) {
            return `chat_${ctx.chat.id}_${ctx.from?.id || "unknown"}`;
          }
          return ctx.from?.id?.toString();
        },
      })
    );

    this.bot.use(async (ctx, next) => {
      if (ctx.session && !ctx.session.handlerData) {
        ctx.session.handlerData = {};
      }
      await next();
    });
  }

  /**
   * Sets up command and event handlers
   */
  private setupHandlers(): void {
    logger.info("Setting up command handlers...");

    // 1. Core Commands
    this.bot.command("start", handleStart);
    this.bot.command("about", handleAbout);
    this.bot.command("help", handleHelp);
    this.bot.command("support", handleSupport);

    // 2. User Commands
    this.bot.command("dashboard", handleDashboard);
    this.bot.command("wallet", handleWallet);
    this.bot.command("transactions", handleTransactions);
    this.bot.command("referral", handleReferral);

    // 3. Admin Commands (protected by middleware)
    this.bot.command("admin", handleAdmin);
    this.bot.command("stats", handleStats);

    // 4. Debug Command
    this.bot.command("debug", handleDebug);

    // 5. Deep Integration Command (Dashboard)
    this.bot.command("app", async (ctx) => {
      await ctx.reply("⚡ Access Cashimine:", {
        reply_markup: new InlineKeyboard().webApp(
          "Launch App",
          config.webAppUrl
        ),
      });
    });

    // 6. Handle callback queries
    this.bot.on("callback_query:data", async (ctx) => {
      await handleCallbackQuery(ctx);
    });

    // 7. Fallback for unknown commands
    this.bot.on("message:text", async (ctx) => {
      await handleTextMessage(ctx);
    });
  }

  /**
   * Configures the Telegram UI (Menu Button & Commands)
   * This runs once on startup to sync the UI with your code.
   */
  private async configureBotUI(): Promise<void> {
    logger.info("Syncing Bot UI and Menu Buttons...");

    try {
      await this.bot.api.setChatMenuButton({
        menu_button: {
          type: "web_app",
          text: "Launch App",
          web_app: { url: config.webAppUrl },
        },
      });

      await this.bot.api.setMyDescription(
        "💰 Earn rewards with Cashimine! Join our referral program and start earning today.",
        { language_code: "en" }
      );

      await this.bot.api.setMyShortDescription(
        "Earn crypto rewards | Referral program | Secure wallet",
        { language_code: "en" }
      );

      // 2. Set the Command Menu (Autocomplete)
      const commands = [
        { command: "start", description: "🏠 Start the bot & get app link" },
        { command: "dashboard", description: "📊 Open personal dashboard" },
        { command: "help", description: "🆘 Get support" },
        { command: "about", description: "ℹ️ Application info" },
      ];

      // Add admin commands if user is likely admin (in private chat)
      if (config.handlers.adminIds.length > 0) {
        commands.push(
          { command: "admin", description: "🛠️ Admin panel (admin only)" },
          { command: "stats", description: "📈 Bot statistics (admin only)" },
          { command: "handlers", description: "⚙️ Handler status (admin only)" }
        );
      }

      // Add debug command in development
      if (config.environment === "development") {
        commands.push({
          command: "debug",
          description: "🐛 Debug information",
        });
      }

      await this.bot.api.setMyCommands(commands);

      logger.info("Bot UI successfully configured.");
    } catch (error) {
      logger.error("Failed to configure Bot UI (Check your Token):", error);
      // Non-fatal error, we don't crash app for this
    }
  }

  /**
   * Main entry point to launch the bot
   */
  async start(): Promise<void> {
    try {
      // 1. Sync UI
      await this.configureBotUI();

      const botInfo = await this.bot.api.getMe();
      logger.info(
        `✅ Bot @${botInfo.username} initialized in ${config.environment} mode`
      );

      // Log handler configuration
      logger.info("Handler configuration:", {
        maintenanceMode: config.handlers.maintenanceMode,
        rateLimiting: config.handlers.enableRateLimiting,
        performanceMonitoring: config.handlers.enablePerformanceMonitoring,
        requestLogging: config.handlers.enableRequestLogging,
        adminCount: config.handlers.adminIds.length,
      });

      if (config.handlers.maintenanceMode) {
        logger.warn(
          "⚠️ BOT IS IN MAINTENANCE MODE - Normal users will be blocked"
        );
      }

      // 2. Start Polling
      await this.bot.start({
        allowed_updates: [
          "message",
          "callback_query",
          "inline_query",
          "chat_member",
          "my_chat_member",
        ],
        drop_pending_updates: config.isProduction ? false : true,
        onStart: () => {
          logger.info(`🚀 Bot is now listening for updates!`);
          logger.info(`🔗 Web App URL: ${config.webAppUrl}`);

          // Log startup in development
          if (config.environment === "development") {
            logger.debug("Development mode active - verbose logging enabled");
            logger.debug(`Admin IDs: ${config.handlers.adminIds.join(", ")}`);
          }
        },
      });
    } catch (error) {
      logger.error("❌ Fatal: Failed to start bot:", error);
      process.exit(1);
    }
  }

  /**
   * Graceful Shutdown
   */
  async stop(): Promise<void> {
    logger.info("🛑 Stopping bot...");
    await this.bot.stop();
    logger.info("Bot stopped successfully.");
  }

  /**
   * Get bot instance for external use
   */
  public getBot(): Bot<BotContext> {
    return this.bot;
  }

  /**
   * Toggle maintenance mode (useful for admin commands)
   */
  public toggleMaintenanceMode(enabled: boolean): void {
    const { toggleMaintenanceMode } = require("./handlers/maintenanceMode");
    toggleMaintenanceMode(enabled);
    logger[enabled ? "warn" : "info"](
      `Maintenance mode ${enabled ? "enabled" : "disabled"} by API`
    );
  }
}

/**
 * Execution Logic
 */
async function main() {
  const telegramBot = new TelegramBot();

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down...`);
    await telegramBot.stop();
    process.exit(0);
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));

  // Start!
  await telegramBot.start();
}

// Export for programmatic use
export { TelegramBot };

if (require.main === module) {
  main().catch((error) => {
    logger.error("Unhandled error in main execution:", error);
    process.exit(1);
  });
}
