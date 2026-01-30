import { BotContext } from "../types";
import { Logger } from "../utils/logger";
import { MainMenu } from "../keyboards/mainMenu";
import { MESSAGES } from "../templates/messages";
import { Formatters } from "../utils/formatters";
import { config } from "../config";
import { isAdmin } from "../config/constants";
import { InlineKeyboard } from "grammy";

const logger = new Logger("CallbackHandler");

// Cache to prevent double processing of callbacks
const processedCallbacks = new Set<string>();
const CALLBACK_TIMEOUT = 30000; // 30 seconds

export async function handleCallbackQuery(ctx: BotContext) {
  const callbackQuery = ctx.callbackQuery;
  if (!callbackQuery) return;

  const data = callbackQuery.data;
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;
  const messageId = callbackQuery.message?.message_id;

  if (!data) return;

  // Create a unique key for this callback to prevent double processing
  const callbackKey = `${userId}_${chatId}_${messageId}_${data}`;

  if (processedCallbacks.has(callbackKey)) {
    logger.debug(`Callback already processed: ${callbackKey}`);
    return;
  }

  processedCallbacks.add(callbackKey);

  // Auto-cleanup after timeout
  setTimeout(() => {
    processedCallbacks.delete(callbackKey);
  }, CALLBACK_TIMEOUT);

  logger.info(`Callback query from user ${userId}: ${data}`, {
    userId,
    chatId,
    messageId,
    data,
  });

  try {
    // Always answer callback query immediately
    await ctx.answerCallbackQuery();

    // Update session
    if (ctx.session) {
      ctx.session.lastInteraction = Date.now();
      if (!ctx.session.handlerData) ctx.session.handlerData = {};

      // Track callback history
      //   const handlerData = ctx.session.handlerData as HandlerData;
      //   handlerData.lastCallback = {
      //     data,
      //     timestamp: Date.now(),
      //     messageId,
      //   };

      // Add to history
      //   if (!handlerData.callbackHistory) {
      //     handlerData.callbackHistory = [];
      //   }
      //   handlerData.callbackHistory.push({
      //     data,
      //     timestamp: Date.now(),
      //     messageId,
      //   });

      // Keep only last 50 callbacks in history
      //   if (handlerData.callbackHistory.length > 50) {
      //     handlerData.callbackHistory = handlerData.callbackHistory.slice(-50);
      //   }
    }

    // Handle different callback actions
    await handleCallbackData(ctx, data);
  } catch (error) {
    logger.error("Error handling callback query:", {
      userId,
      data,
      error: error instanceof Error ? error.message : String(error),
    });

    try {
      // Try to answer with error
      await ctx.answerCallbackQuery({
        text: "⚠️ An error occurred. Please try again.",
        show_alert: true,
      });

      // Send error message to user
      if (ctx.chat?.type === "private") {
        await ctx.reply(
          "❌ <b>Action Failed</b>\n\n" +
            "Sorry, there was an error processing your request.\n\n" +
            "Error reference: " +
            `<code>CB_${Date.now().toString(36)}_${data.substring(0, 10)}</code>`,
          { parse_mode: "HTML" }
        );
      }
    } catch (notificationError) {
      logger.error("Failed to send error notification:", notificationError);
    }
  } finally {
    // Cleanup callback key
    setTimeout(() => {
      processedCallbacks.delete(callbackKey);
    }, 1000);
  }
}

/**
 * Main callback router
 */
async function handleCallbackData(
  ctx: BotContext,
  data: string
): Promise<void> {
  // Check maintenance mode
  if (config.handlers.maintenanceMode && !isAdmin) {
    const allowedCallbacks = [
      "menu_main",
      "menu_help",
      "support_contact",
      "support_faq",
    ];
    if (!allowedCallbacks.includes(data)) {
      await ctx.answerCallbackQuery({
        text: "⏳ Bot is under maintenance. Please try again later.",
        show_alert: true,
      });
      return;
    }
  }

  // Route based on callback pattern
  if (data.startsWith("menu_")) {
    await handleMenuNavigation(ctx, data);
  } else if (data.startsWith("action_")) {
    await handleUserAction(ctx, data);
  } else if (data.startsWith("admin_")) {
    await handleAdminAction(ctx, data);
  } else if (data.startsWith("wallet_")) {
    await handleWalletAction(ctx, data);
  } else if (data.startsWith("mining_")) {
    await handleMiningAction(ctx, data);
  } else if (data.startsWith("referral_")) {
    await handleReferralAction(ctx, data);
  } else if (data.startsWith("support_")) {
    await handleSupportAction(ctx, data);
  } else if (data.startsWith("help_")) {
    await handleHelpAction(ctx, data);
  } else if (data.startsWith("settings_")) {
    await handleSettingsAction(ctx, data);
  } else if (data.startsWith("dashboard_")) {
    await handleDashboardAction(ctx, data);
  } else if (data.startsWith("confirm_")) {
    await handleConfirmation(ctx, data);
  } else {
    await handleUnknownCallback(ctx, data);
  }
}

/**
 * Handle menu navigation callbacks
 */
async function handleMenuNavigation(
  ctx: BotContext,
  data: string
): Promise<void> {
  const userId = ctx.from?.id;
  const username = ctx.from?.first_name;

  switch (data) {
    case "menu_main":
      await ctx.editMessageText(MESSAGES.WELCOME(username), {
        parse_mode: "HTML",
        reply_markup: MainMenu.welcome(),
      });
      break;

    case "menu_dashboard":
      await ctx.editMessageText(MESSAGES.DASHBOARD(username), {
        parse_mode: "HTML",
        reply_markup: MainMenu.dashboard(),
      });
      break;

    case "menu_wallet":
      await ctx.editMessageText(MESSAGES.WALLET, {
        parse_mode: "HTML",
        reply_markup: MainMenu.wallet(),
      });
      break;

    case "menu_mining":
      await ctx.editMessageText(
        "⛏️ <b>Mining Control Center</b>\n\n" +
          "Manage your mining operations:\n\n" +
          "• Start/stop mining\n" +
          "• Boost your hash rate\n" +
          "• View live statistics\n" +
          "• Configure mining settings",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.mining(),
        }
      );
      break;

    case "menu_referral":
      await ctx.editMessageText(MESSAGES.REFERRAL(userId || 0), {
        parse_mode: "HTML",
        reply_markup: MainMenu.referral(userId || 0),
      });
      break;

    case "menu_help":
      await ctx.editMessageText(MESSAGES.HELP, {
        parse_mode: "HTML",
        reply_markup: MainMenu.help(),
      });
      break;

    case "menu_settings":
      await ctx.editMessageText(
        "⚙️ <b>Settings</b>\n\n" +
          "Configure your account preferences:\n\n" +
          "• Profile information\n" +
          "• Notification settings\n" +
          "• Security options\n" +
          "• Language & theme",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.settings(),
        }
      );
      break;

    case "menu_admin":
      if (!isAdmin) {
        await ctx.answerCallbackQuery({
          text: "🚫 Admin access required.",
          show_alert: true,
        });
        return;
      }
      await ctx.editMessageText(
        "👑 <b>Admin Panel</b>\n\n" +
          "Manage the Cashimine system:\n\n" +
          "• View statistics\n" +
          "• Manage users\n" +
          "• Monitor transactions\n" +
          "• System maintenance",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.admin(),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Menu option not available.",
        show_alert: false,
      });
  }
}

/**
 * Handle user action callbacks
 */
async function handleUserAction(ctx: BotContext, data: string): Promise<void> {
  switch (data) {
    case "action_boost":
      await ctx.reply(
        "⚡ <b>Mining Boost</b>\n\n" +
          "Temporarily increase your mining power:\n\n" +
          "Available boosts:\n" +
          "• 🚀 2x for 1 hour: $1.99\n" +
          "• 🚀 3x for 1 hour: $3.99\n" +
          "• 🚀 5x for 1 hour: $7.99\n" +
          "• 🚀 10x for 1 hour: $14.99\n\n" +
          "💎 <i>Premium users get 50% off all boosts!</i>",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.boost(),
        }
      );
      break;

    case "action_withdraw":
      await ctx.reply(
        "💸 <b>Quick Withdrawal</b>\n\n" +
          "Withdraw your earnings instantly:\n\n" +
          "• Minimum: $10.00\n" +
          "• Daily Limit: $1,000.00\n" +
          "• Fee: 0.5% (min $1)\n" +
          "• Time: Instant to 24 hours\n\n" +
          "💡 <i>Higher tiers get higher limits!</i>",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.withdraw(),
        }
      );
      break;

    case "action_deposit":
      await ctx.reply(
        "💰 <b>Quick Deposit</b>\n\n" +
          "Add funds to boost your earnings:\n\n" +
          "• No deposit fees\n" +
          "• Instant processing\n" +
          "• Multiple currencies\n" +
          "• Bonuses available\n\n" +
          "✨ <b>Benefits:</b>\n" +
          "• Higher mining power\n" +
          "• Access premium features\n" +
          "• Compound earnings\n" +
          "• Referral bonuses",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.deposit(),
        }
      );
      break;

    case "action_stats":
      const stats = await getUserStats(ctx.from?.id);
      await ctx.reply(
        `📈 <b>Quick Statistics</b>\n\n` +
          `💰 <b>Today's Performance:</b>\n` +
          `• Earnings: ${Formatters.formatCurrency(stats.todayEarnings)}\n` +
          `• Mining: ${Formatters.formatHashRate(stats.hashRate)}\n` +
          `• Efficiency: ${stats.efficiency}%\n` +
          `• Uptime: ${stats.uptime}%\n\n` +
          `📊 <b>This Week:</b>\n` +
          `• Total: ${Formatters.formatCurrency(stats.weekEarnings)}\n` +
          `• Average: ${Formatters.formatCurrency(stats.avgDaily)}\n` +
          `• Best Day: ${Formatters.formatCurrency(stats.bestDay)}\n\n` +
          `💡 <i>Updated every 5 minutes</i>`,
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("📊 Full Analytics", "dashboard_refresh")
            .text("📤 Export", "dashboard_export")
            .row()
            .text("🔙 Dashboard", "menu_dashboard"),
        }
      );
      break;

    case "action_missions":
      await ctx.reply(
        "🎮 <b>Daily Missions</b>\n\n" +
          "Complete missions to earn extra rewards:\n\n" +
          "✅ <b>Today's Missions:</b>\n" +
          "• Mine for 1 hour: $2.50\n" +
          "• Refer 1 friend: $5.00\n" +
          "• Complete 3 transactions: $3.75\n" +
          "• Stake $100: $7.50\n\n" +
          "🏆 <b>Weekly Challenge:</b>\n" +
          "• Complete all daily missions for 7 days: $25.00\n\n" +
          "💡 <i>Reset daily at midnight UTC</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("🎯 View All", "missions_list")
            .text("📅 Calendar", "missions_calendar")
            .row()
            .text("🏆 Leaderboard", "missions_leaderboard")
            .text("🔙 Dashboard", "menu_dashboard"),
        }
      );
      break;

    case "action_compound":
      await ctx.reply(
        "📈 <b>Auto-Compound</b>\n\n" +
          "Automatically reinvest your earnings:\n\n" +
          "✨ <b>Benefits:</b>\n" +
          "• Maximize returns\n" +
          "• Compound interest\n" +
          "• No manual work\n" +
          "• Optimized timing\n\n" +
          "⚙️ <b>Settings:</b>\n" +
          "• Frequency: Daily\n" +
          "• Minimum: $5.00\n" +
          "• Percentage: 50%\n" +
          "• Status: Enabled\n\n" +
          "💡 <i>Earnings grow exponentially!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("⚙️ Configure", "compound_settings")
            .text("📊 Projections", "compound_projections")
            .row()
            .text("📈 History", "compound_history")
            .text("🔙 Dashboard", "menu_dashboard"),
        }
      );
      break;

    default:
      await ctx.reply(
        `⚡ <b>Action: ${data.replace("action_", "").replace("_", " ")}</b>\n\n` +
          "This feature is available in the full web app for the best experience.",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("🚀 Open Web App", config.webAppUrl)
            .row()
            .text("🔙 Back", "menu_main"),
        }
      );
  }
}

/**
 * Handle admin action callbacks
 */
async function handleAdminAction(ctx: BotContext, data: string): Promise<void> {
  const userId = ctx.from?.id;

  if (!isAdmin) {
    await ctx.answerCallbackQuery({
      text: "🚫 Admin access required.",
      show_alert: true,
    });
    return;
  }

  switch (data) {
    case "admin_stats":
      await ctx.reply(
        "📊 <b>Admin Statistics</b>\n\n" +
          "Fetching system statistics...\n\n" +
          "⏳ Please wait while we gather the latest data.",
        { parse_mode: "HTML" }
      );
      // In production, you would fetch real data here
      setTimeout(async () => {
        await ctx.reply(
          "📊 <b>System Statistics</b>\n\n" +
            "👥 <b>Users:</b>\n" +
            "• Total: 12,458\n" +
            "• Active Today: 3,245\n" +
            "• New Today: 187\n" +
            "• Premium: 2,458\n\n" +
            "💰 <b>Financial:</b>\n" +
            "• Total Deposits: $2.45M\n" +
            "• Total Withdrawals: $1.87M\n" +
            "• Daily Volume: $124,587\n" +
            "• Platform Balance: $612,486\n\n" +
            "⛏️ <b>Mining:</b>\n" +
            "• Active Miners: 8,457\n" +
            "• Total Hash Rate: 4.5 PH/s\n" +
            "• Daily Rewards: $125,847\n" +
            "• Uptime: 99.92%\n\n" +
            "📈 <b>Performance:</b>\n" +
            "• Response Time: 145ms\n" +
            "• Error Rate: 0.15%\n" +
            "• User Satisfaction: 4.7/5",
          {
            parse_mode: "HTML",
            reply_markup: MainMenu.adminStats(),
          }
        );
      }, 1000);
      break;

    case "admin_users":
      await ctx.reply(
        "👥 <b>User Management</b>\n\n" +
          "Manage system users:\n\n" +
          "• Search for users\n" +
          "• View user details\n" +
          "• Edit user information\n" +
          "• Manage permissions",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.adminUsers(),
        }
      );
      break;

    case "admin_tx":
      await ctx.reply(
        "💰 <b>Transaction Monitoring</b>\n\n" +
          "Monitor all system transactions:\n\n" +
          "• Real-time tracking\n" +
          "• Fraud detection\n" +
          "• Analytics & reports\n" +
          "• Export capabilities",
        { parse_mode: "HTML" }
      );
      break;

    case "admin_maintenance":
      await ctx.reply(
        "🛠️ <b>Maintenance Controls</b>\n\n" +
          "Manage system maintenance:\n\n" +
          "• Enable/disable maintenance mode\n" +
          "• Schedule maintenance windows\n" +
          "• Send user notifications\n" +
          "• Monitor system status",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.adminMaintenance(),
        }
      );
      break;

    case "admin_security":
      await ctx.reply(
        "🔐 <b>Security Dashboard</b>\n\n" +
          "Monitor system security:\n\n" +
          "• Login attempts\n" +
          "• Suspicious activity\n" +
          "• Audit logs\n" +
          "• Security alerts",
        { parse_mode: "HTML" }
      );
      break;

    case "admin_settings":
      await ctx.reply(
        "⚙️ <b>System Settings</b>\n\n" +
          "Configure system parameters:\n\n" +
          "• Mining parameters\n" +
          "• Fee structure\n" +
          "• Notification settings\n" +
          "• API configuration",
        { parse_mode: "HTML" }
      );
      break;

    case "admin_broadcast":
      await ctx.reply(
        "📢 <b>Broadcast Message</b>\n\n" +
          "Send message to all users:\n\n" +
          "• Custom message content\n" +
          "• Target specific user groups\n" +
          "• Schedule delivery\n" +
          "• Track delivery status",
        { parse_mode: "HTML" }
      );
      break;

    case "admin_backup":
      await ctx.reply(
        "💾 <b>Backup Operations</b>\n\n" +
          "Manage system backups:\n\n" +
          "• Create backups\n" +
          "• Restore from backup\n" +
          "• Schedule automatic backups\n" +
          "• Monitor backup status",
        { parse_mode: "HTML" }
      );
      break;

    default:
      await ctx.reply(
        `🛠️ <b>Admin Action: ${data.replace("admin_", "")}</b>\n\n` +
          "This admin function is being processed.",
        { parse_mode: "HTML" }
      );
  }
}

/**
 * Handle wallet action callbacks
 */
async function handleWalletAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  switch (data) {
    case "wallet_withdraw":
      await ctx.reply(
        "💸 <b>Withdrawal Options</b>\n\n" +
          "Choose how you want to withdraw:\n\n" +
          "• 💳 Bank Transfer (1-3 days)\n" +
          "• ₿ Bitcoin (Instant)\n" +
          "• Ξ Ethereum (Instant)\n" +
          "• 💎 USDT (Instant)\n\n" +
          "💡 <i>Minimum withdrawal: $10.00</i>",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.withdraw(),
        }
      );
      break;

    case "wallet_deposit":
      await ctx.reply(
        "💰 <b>Deposit Options</b>\n\n" +
          "Add funds to boost your earnings:\n\n" +
          "• 💳 Credit/Debit Card\n" +
          "• ₿ Bitcoin\n" +
          "• Ξ Ethereum\n" +
          "• 💎 USDT\n" +
          "• 🏦 Bank Transfer\n\n" +
          "✨ <b>Benefits:</b>\n" +
          "• No deposit fees\n" +
          "• Instant processing\n" +
          "• Higher mining power\n" +
          "• Access premium features",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.deposit(),
        }
      );
      break;

    case "wallet_stake":
      await ctx.reply(
        "🔒 <b>Staking Options</b>\n\n" +
          "Stake your crypto for passive rewards:\n\n" +
          "🏆 <b>Tiers:</b>\n" +
          "• 🥉 Bronze (30 days): 5% APY\n" +
          "• 🥈 Silver (90 days): 8% APY\n" +
          "• 🥇 Gold (180 days): 12% APY\n" +
          "• 💎 Diamond (365 days): 18% APY\n\n" +
          "💡 <i>Current staked: $500.00</i>\n" +
          "📈 <i>Potential annual: $90.00</i>",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.staking(),
        }
      );
      break;

    case "wallet_convert":
      await ctx.reply(
        "💱 <b>Currency Conversion</b>\n\n" +
          "Convert between cryptocurrencies:\n\n" +
          "Available pairs:\n" +
          "• BTC ↔ ETH\n" +
          "• BTC ↔ USDT\n" +
          "• ETH ↔ USDT\n" +
          "• USDT ↔ USDC\n\n" +
          "💡 <i>Real-time exchange rates\nZero fees for premium users!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("💱 Convert Now", `${config.webAppUrl}/convert`)
            .row()
            .text("📈 View Rates", "wallet_rates")
            .text("🧮 Calculator", "wallet_convert_calc")
            .row()
            .text("🔙 Wallet", "menu_wallet"),
        }
      );
      break;

    case "wallet_history":
      await ctx.reply(
        "📜 <b>Transaction History</b>\n\n" +
          "View your complete transaction history:\n\n" +
          "• All deposits & withdrawals\n" +
          "• Mining rewards\n" +
          "• Referral earnings\n" +
          "• Staking rewards\n" +
          "• Currency conversions\n\n" +
          "📊 <i>Export as CSV available!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("📜 View History", `${config.webAppUrl}/transactions`)
            .row()
            .text("📅 Filter", "wallet_history_filter")
            .text("📥 Export", "wallet_export")
            .row()
            .text("🔙 Wallet", "menu_wallet"),
        }
      );
      break;

    case "wallet_analytics":
      await ctx.reply(
        "📈 <b>Wallet Analytics</b>\n\n" +
          "Detailed insights into your wallet:\n\n" +
          "• Spending patterns\n" +
          "• Earnings trends\n" +
          "• Portfolio allocation\n" +
          "• Performance metrics\n\n" +
          "💡 <i>Make data-driven decisions!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("📈 View Analytics", `${config.webAppUrl}/analytics`)
            .row()
            .text("📊 Charts", "wallet_charts")
            .text("📋 Reports", "wallet_reports")
            .row()
            .text("🔙 Wallet", "menu_wallet"),
        }
      );
      break;

    case "wallet_security":
      await ctx.reply(
        "🔐 <b>Wallet Security</b>\n\n" +
          "Secure your wallet and transactions:\n\n" +
          "• Two-factor authentication\n" +
          "• Withdrawal whitelist\n" +
          "• Session management\n" +
          "• Security alerts\n\n" +
          "🛡️ <i>Protect your assets!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("🔐 Security Settings", `${config.webAppUrl}/security`)
            .row()
            .text("🔑 2FA Setup", "security_2fa")
            .text("📋 Whitelist", "security_whitelist")
            .row()
            .text("📊 Activity Log", "security_log")
            .text("🔙 Wallet", "menu_wallet"),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Wallet action not available.",
        show_alert: false,
      });
  }
}

/**
 * Handle mining action callbacks
 */
async function handleMiningAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  switch (data) {
    case "mining_start":
      await ctx.reply(
        "⛏️ <b>Mining Started!</b>\n\n" +
          "Your mining session has begun.\n\n" +
          "📊 <b>Current Stats:</b>\n" +
          "• Hash Rate: 125 GH/s\n" +
          "• Estimated Daily: $12.45\n" +
          "• Power Cost: $0.05/day\n" +
          "• Efficiency: 95%\n\n" +
          "💡 <i>Check back in 1 hour for your first rewards!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("📊 Live Stats", "mining_stats")
            .text("⚡ Boost", "mining_boost")
            .row()
            .text("⏸️ Pause", "mining_stop")
            .text("ℹ️ Help", "mining_help"),
        }
      );
      break;

    case "mining_stop":
      await ctx.reply(
        "⏸️ <b>Mining Stopped</b>\n\n" +
          "Your mining session has been paused.\n\n" +
          "📊 <b>Session Summary:</b>\n" +
          "• Duration: 2 hours\n" +
          "• Earnings: $2.45\n" +
          "• Hash Rate: 125 GH/s\n" +
          "• Efficiency: 95%\n\n" +
          "💡 <i>Your progress is saved! Resume anytime.</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("▶️ Resume", "mining_start")
            .text("📊 Stats", "mining_stats")
            .row()
            .text("⚡ Boost", "mining_boost")
            .text("🔙 Mining", "menu_mining"),
        }
      );
      break;

    case "mining_stats":
      const miningStats = await getMiningStats(ctx.from?.id);
      await ctx.reply(
        `📊 <b>Live Mining Stats</b>\n\n` +
          `⛏️ <b>Current Session:</b>\n` +
          `• Duration: ${Formatters.timeAgo(miningStats.sessionStart)}\n` +
          `• Hash Rate: ${Formatters.formatHashRate(miningStats.hashRate)}\n` +
          `• Shares: ${miningStats.shares.toLocaleString()}\n` +
          `• Efficiency: ${miningStats.efficiency}%\n\n` +
          `💰 <b>Earnings:</b>\n` +
          `• Session: ${Formatters.formatCurrency(miningStats.sessionEarnings)}\n` +
          `• Today: ${Formatters.formatCurrency(miningStats.todayEarnings)}\n` +
          `• This Week: ${Formatters.formatCurrency(miningStats.weekEarnings)}\n\n` +
          `💡 <i>Updated every 5 minutes</i>`,
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("🔄 Refresh", "mining_stats")
            .text("📈 Charts", "mining_charts")
            .row()
            .text("⚡ Boost", "mining_boost")
            .text("🔙 Mining", "menu_mining"),
        }
      );
      break;

    case "mining_boost":
      await ctx.reply(
        "⚡ <b>Mining Boost</b>\n\n" +
          "Temporarily increase your mining power:\n\n" +
          "Available boosts:\n" +
          "• 🚀 2x for 1 hour: $1.99\n" +
          "• 🚀 3x for 1 hour: $3.99\n" +
          "• 🚀 5x for 1 hour: $7.99\n" +
          "• 🚀 10x for 1 hour: $14.99\n\n" +
          "💎 <i>Premium users get 50% off all boosts!</i>",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.boost(),
        }
      );
      break;

    case "mining_config":
      await ctx.reply(
        "⚙️ <b>Mining Configuration</b>\n\n" +
          "Configure your mining settings:\n\n" +
          "• Hash rate allocation\n" +
          "• Power management\n" +
          "• Auto-start settings\n" +
          "• Notification preferences\n\n" +
          "🔧 <i>Optimize for maximum earnings!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("⚙️ Configure", `${config.webAppUrl}/mining/config`)
            .row()
            .text("⚡ Optimization", "mining_optimize")
            .text("💡 Tips", "mining_tips")
            .row()
            .text("🔙 Mining", "menu_mining"),
        }
      );
      break;

    case "mining_pool":
      await ctx.reply(
        "🏊 <b>Mining Pool</b>\n\n" +
          "Join a mining pool for consistent earnings:\n\n" +
          "• Pool 1: Stable returns\n" +
          "• Pool 2: High variance\n" +
          "• Pool 3: Low fees\n" +
          "• Pool 4: Premium features\n\n" +
          "💡 <i>Pools provide more consistent earnings!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("🏊 Join Pool", `${config.webAppUrl}/mining/pool`)
            .row()
            .text("📊 Compare", "mining_pool_compare")
            .text("📈 Stats", "mining_pool_stats")
            .row()
            .text("🔙 Mining", "menu_mining"),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Mining action not available.",
        show_alert: false,
      });
  }
}

/**
 * Handle referral action callbacks
 */
async function handleReferralAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  const userId = ctx.from?.id;

  switch (data) {
    case "referral_stats":
      const refStats = await getReferralStats(userId);
      await ctx.reply(
        `📊 <b>Referral Statistics</b>\n\n` +
          `👥 <b>Overview:</b>\n` +
          `• Total Referrals: ${refStats.total}\n` +
          `• Active Miners: ${refStats.active}\n` +
          `• Total Earnings: ${Formatters.formatCurrency(refStats.earnings)}\n` +
          `• Tier: ${refStats.tier}\n\n` +
          `💰 <b>Recent Rewards:</b>\n` +
          `${refStats.recent
            .map((r) => `• ${r.name}: ${Formatters.formatCurrency(r.amount)}`)
            .join("\n")}\n\n` +
          `🎯 <b>Goals:</b>\n` +
          `• Next Tier (${refStats.nextTier}): ${refStats.remaining} more referrals\n` +
          `• Monthly Target: ${refStats.monthlyTarget} referrals\n\n` +
          `💡 <i>Share your link to earn more!</i>`,
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("🔗 Copy Link", "referral_copy")
            .text("📈 Charts", "referral_charts")
            .row()
            .text("🏆 Tiers", "referral_tiers")
            .text("🔙 Referral", "menu_referral"),
        }
      );
      break;

    case "referral_tiers":
      await ctx.reply(
        "🏆 <b>Referral Tiers</b>\n\n" +
          "Earn more as you refer more friends:\n\n" +
          "• 🥉 <b>Bronze</b> (1-5): 10% commission\n" +
          "• 🥈 <b>Silver</b> (6-15): 12% commission\n" +
          "• 🥇 <b>Gold</b> (16-30): 15% commission\n" +
          "• 💎 <b>Diamond</b> (31+): 20% commission\n\n" +
          "✨ <b>Bonus Rewards:</b>\n" +
          "• Silver: $50 bonus at 10 referrals\n" +
          "• Gold: $200 bonus at 20 referrals\n" +
          "• Diamond: $500 bonus + VIP support\n\n" +
          "💡 <i>Commissions are for the lifetime of referred users!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("📊 My Tier", "referral_stats")
            .text("🎯 Goals", "referral_goals")
            .row()
            .text("🔗 Share", "referral_share")
            .text("🔙 Referral", "menu_referral"),
        }
      );
      break;

    case "referral_share":
      await ctx.reply(
        `📣 <b>Share Cashimine</b>\n\n` +
          `Earn more by sharing with friends!\n\n` +
          `📱 <b>Sharing Options:</b>\n` +
          `• Telegram - Fastest sharing\n` +
          `• WhatsApp - Direct messages\n` +
          `• Email - Professional contacts\n` +
          `• Social Media - Reach more people\n\n` +
          `💡 <i>Each referral earns you 15% forever!</i>`,
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.referral(userId || 0),
        }
      );
      break;

    case "referral_copy":
      await copyReferralLink(ctx, userId || 0);
      break;

    case "referral_rewards":
      await ctx.reply(
        "🎁 <b>Referral Rewards</b>\n\n" +
          "Earn bonuses for referring friends:\n\n" +
          "• $5 instant bonus for each referral\n" +
          "• 15% lifetime commission\n" +
          "• Tier upgrade bonuses\n" +
          "• Exclusive rewards\n\n" +
          "✨ <b>Special Bonuses:</b>\n" +
          "• Refer 5 friends: $25 bonus\n" +
          "• Refer 10 friends: $100 bonus\n" +
          "• Refer 20 friends: $250 bonus\n\n" +
          "💡 <i>Rewards are paid daily!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("📊 My Rewards", "referral_myrewards")
            .text("📅 History", "referral_reward_history")
            .row()
            .text("🔗 Share Now", "referral_share")
            .text("🔙 Referral", "menu_referral"),
        }
      );
      break;

    case "referral_leaderboard":
      await ctx.reply(
        "📊 <b>Referral Leaderboard</b>\n\n" +
          "Top referrers this month:\n\n" +
          "1. @john_doe - 45 referrals\n" +
          "2. @jane_smith - 38 referrals\n" +
          "3. @mike_jones - 32 referrals\n" +
          "4. @sarah_williams - 28 referrals\n" +
          "5. @robert_brown - 25 referrals\n\n" +
          "🏆 <b>Your Rank:</b> #12 (8 referrals)\n\n" +
          "💡 <i>Updated daily. Top 3 get special prizes!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("📈 My Progress", "referral_stats")
            .text("🎯 Beat #10", "referral_beat")
            .row()
            .text("🔗 Share More", "referral_share")
            .text("🔙 Referral", "menu_referral"),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Referral action not available.",
        show_alert: false,
      });
  }
}

/**
 * Handle support action callbacks
 */
async function handleSupportAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  switch (data) {
    case "support_contact":
      await ctx.reply(
        "📞 <b>Contact Support</b>\n\n" +
          "We're here to help! Choose an option:\n\n" +
          "• 📧 <b>Email:</b> support@cashimine.com\n" +
          "• 💬 <b>Live Chat:</b> Available in web app\n" +
          "• 📱 <b>Telegram:</b> @cashimine_support\n" +
          "• 🐦 <b>Twitter:</b> @cashimine_help\n\n" +
          "<b>Response Times:</b>\n" +
          "• Urgent: < 1 hour\n" +
          "• General: < 6 hours\n" +
          "• Feature requests: < 24 hours\n\n" +
          "💡 <i>Include your User ID for faster support</i>",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.contact(),
        }
      );
      break;

    case "support_faq":
      await ctx.reply(
        "❓ <b>Frequently Asked Questions</b>\n\n" +
          "<b>Q: How do I start mining?</b>\n" +
          "A: Use /app to launch the web app and click 'Start Mining'.\n\n" +
          "<b>Q: When can I withdraw?</b>\n" +
          "A: Daily withdrawals up to $1000. Limits increase with tiers.\n\n" +
          "<b>Q: Is my investment safe?</b>\n" +
          "A: We use bank-level security and cold wallet storage.\n\n" +
          "<b>Q: How are rewards calculated?</b>\n" +
          "A: Based on mining power, market conditions, and participation.\n\n" +
          "<b>Q: What are the fees?</b>\n" +
          "A: 1% mining fee. No deposit fees. 0.5% withdrawal fee.\n\n" +
          "🔗 <i>Visit cashimine.com/faq for complete FAQ</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .url("🌐 Full FAQ", "https://cashimine.com/faq")
            .row()
            .text("📧 Contact", "support_contact")
            .text("🔙 Help", "menu_help"),
        }
      );
      break;

    case "support_status":
      await showSystemStatus(ctx);
      break;

    case "support_feedback":
      await ctx.reply(
        "📝 <b>Feedback & Suggestions</b>\n\n" +
          "We value your feedback! Please share:\n\n" +
          "• What you like about Cashimine\n" +
          "• What could be improved\n" +
          "• Feature requests\n" +
          "• Bug reports\n\n" +
          "📧 <b>Send to:</b> feedback@cashimine.com\n\n" +
          "💡 <i>Your feedback helps us improve!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .url("📧 Send Feedback", "mailto:feedback@cashimine.com")
            .row()
            .text("💡 Suggestions", "support_suggestions")
            .text("🐛 Report Bug", "support_bug")
            .row()
            .text("🔙 Help", "menu_help"),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Support option not available.",
        show_alert: false,
      });
  }
}

/**
 * Handle help action callbacks
 */
async function handleHelpAction(ctx: BotContext, data: string): Promise<void> {
  switch (data) {
    case "help_tutorial":
      await ctx.reply(
        "📖 <b>Tutorials & Guides</b>\n\n" +
          "Learn how to use Cashimine effectively:\n\n" +
          "• 🎬 Video tutorials\n" +
          "• 📖 Step-by-step guides\n" +
          "• ❓ Common questions\n" +
          "• ⚡ Tips & tricks\n" +
          "• 📊 Best practices\n" +
          "• ⚠️ Avoid common mistakes\n\n" +
          "💡 <i>Become a mining expert!</i>",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.tutorial(),
        }
      );
      break;

    case "help_quickstart":
      await ctx.reply(
        "🚀 <b>Quick Start Guide</b>\n\n" +
          "Get started in 3 easy steps:\n\n" +
          "1️⃣ <b>Sign Up & Verify</b>\n" +
          "• Create your account\n" +
          "• Verify your email\n" +
          "• Complete your profile\n\n" +
          "2️⃣ <b>Deposit Funds</b>\n" +
          "• Add cryptocurrency\n" +
          "• Start with as little as $10\n" +
          "• Choose your currency\n\n" +
          "3️⃣ <b>Start Mining</b>\n" +
          "• Click 'Start Mining'\n" +
          "• Watch earnings grow\n" +
          "• Refer friends for bonuses\n\n" +
          "💡 <i>Start earning in minutes!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("🎬 Watch Video", "tutorial_video")
            .text("📖 Detailed Guide", "tutorial_steps")
            .row()
            .text("🚀 Start Now", "app_start")
            .text("🔙 Help", "menu_help"),
        }
      );
      break;

    case "help_troubleshoot":
      await ctx.reply(
        "🔧 <b>Troubleshooting</b>\n\n" +
          "Common issues and solutions:\n\n" +
          "❌ <b>Can't start mining?</b>\n" +
          "• Check your balance\n" +
          "• Verify account status\n" +
          "• Clear browser cache\n\n" +
          "❌ <b>Withdrawal pending?</b>\n" +
          "• Verify your identity\n" +
          "• Check withdrawal limits\n" +
          "• Contact support\n\n" +
          "❌ <b>Not earning?</b>\n" +
          "• Check mining status\n" +
          "• Verify hash rate\n" +
          "• Check market conditions\n\n" +
          "💡 <i>Still having issues? Contact support!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("📞 Contact Support", "support_contact")
            .text("❓ More Solutions", "tutorial_faq")
            .row()
            .text("🔙 Help", "menu_help"),
        }
      );
      break;

    case "help_glossary":
      await ctx.reply(
        "📖 <b>Crypto Glossary</b>\n\n" +
          "Key terms explained:\n\n" +
          "• <b>Hash Rate:</b> Mining speed\n" +
          "• <b>APY:</b> Annual percentage yield\n" +
          "• <b>Staking:</b> Locking crypto for rewards\n" +
          "• <b>Wallet:</b> Digital storage for crypto\n" +
          "• <b>Blockchain:</b> Distributed ledger\n" +
          "• <b>Mining Pool:</b> Group mining\n" +
          "• <b>Gas Fee:</b> Transaction cost\n" +
          "• <b>Cold Wallet:</b> Offline storage\n\n" +
          "💡 <i>Learn the language of crypto!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("📚 More Terms", "glossary_more")
            .text("🎓 Learn Crypto", "tutorial_crypto")
            .row()
            .text("🔙 Help", "menu_help"),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Help option not available.",
        show_alert: false,
      });
  }
}

/**
 * Handle settings action callbacks
 */
async function handleSettingsAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  switch (data) {
    case "settings_profile":
      await ctx.reply(
        "👤 <b>Profile Settings</b>\n\n" +
          "Manage your personal information:\n\n" +
          "• Name & contact details\n" +
          "• Profile picture\n" +
          "• Bio & description\n" +
          "• Social links\n\n" +
          "🔒 <i>Your privacy is protected!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("👤 Edit Profile", `${config.webAppUrl}`)
            .row()
            .text("📧 Email", "settings_email")
            .text("📱 Phone", "settings_phone")
            .row()
            .text("🔙 Settings", "menu_settings"),
        }
      );
      break;

    case "settings_notifications":
      await ctx.reply(
        "🔔 <b>Notification Settings</b>\n\n" +
          "Choose what notifications to receive:\n\n" +
          "• Earnings updates\n" +
          "• Withdrawal alerts\n" +
          "• Referral bonuses\n" +
          "• System announcements\n" +
          "• Marketing offers\n\n" +
          "💡 <i>Stay informed without being overwhelmed!</i>",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.notificationSettings(),
        }
      );
      break;

    case "settings_security":
      await ctx.reply(
        "🔐 <b>Security Settings</b>\n\n" +
          "Protect your account and assets:\n\n" +
          "• Two-factor authentication\n" +
          "• Password management\n" +
          "• Session control\n" +
          "• Security alerts\n" +
          "• Withdrawal protection\n\n" +
          "🛡️ <i>Your security is our priority!</i>",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.securitySettings(),
        }
      );
      break;

    case "settings_privacy":
      await ctx.reply(
        "🛡️ <b>Privacy Settings</b>\n\n" +
          "Control your privacy preferences:\n\n" +
          "• Data sharing options\n" +
          "• Visibility settings\n" +
          "• Communication preferences\n" +
          "• Data export/delete\n\n" +
          "🔒 <i>You control your data!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("🛡️ Privacy Center", `${config.webAppUrl}/settings/privacy`)
            .row()
            .text("📊 Data Usage", "settings_data")
            .text("📧 Communications", "settings_communications")
            .row()
            .text("🔙 Settings", "menu_settings"),
        }
      );
      break;

    case "settings_language":
      await ctx.reply(
        "🌐 <b>Language Settings</b>\n\n" +
          "Choose your preferred language:\n\n" +
          "• English (default)\n" +
          "• Spanish\n" +
          "• French\n" +
          "• German\n" +
          "• Russian\n" +
          "• Chinese\n" +
          "• Japanese\n" +
          "• Korean\n\n" +
          "💡 <i>More languages coming soon!</i>",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.languageSelection(),
        }
      );
      break;

    case "settings_theme":
      await ctx.reply(
        "🎨 <b>Theme Settings</b>\n\n" +
          "Customize your interface:\n\n" +
          "• Light theme (default)\n" +
          "• Dark theme\n" +
          "• Auto (system preference)\n" +
          "• Custom colors\n\n" +
          "✨ <i>Make it your own!</i>",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.themeSelection(),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Settings option not available.",
        show_alert: false,
      });
  }
}

/**
 * Handle dashboard action callbacks
 */
async function handleDashboardAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  switch (data) {
    case "dashboard_refresh":
      await ctx.answerCallbackQuery({ text: "🔄 Refreshing dashboard..." });
      // Simulate refresh delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await showDashboard(ctx);
      break;

    case "dashboard_export":
      await ctx.reply(
        "📥 <b>Export Dashboard Data</b>\n\n" +
          "Export your data in various formats:\n\n" +
          "• 📊 CSV - Spreadsheet format\n" +
          "• 📈 Excel - Advanced analysis\n" +
          "• 📋 PDF - Printable reports\n" +
          "• 📅 JSON - Developer format\n\n" +
          "💡 <i>Export your earnings history, mining stats, and more!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("📊 Export CSV", "export_csv")
            .text("📈 Export Excel", "export_excel")
            .row()
            .text("📋 Export PDF", "export_pdf")
            .text("📅 Export JSON", "export_json")
            .row()
            .text("🔙 Dashboard", "menu_dashboard"),
        }
      );
      break;

    case "dashboard_customize":
      await ctx.reply(
        "🎨 <b>Customize Dashboard</b>\n\n" +
          "Arrange your dashboard widgets:\n\n" +
          "• Add/remove widgets\n" +
          "• Change layout\n" +
          "• Set default view\n" +
          "• Save custom layouts\n\n" +
          "✨ <i>Create your perfect dashboard!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("🎨 Customize", `${config.webAppUrl}/dashboard/customize`)
            .row()
            .text("📱 Layouts", "dashboard_layouts")
            .text("⚙️ Widgets", "dashboard_widgets")
            .row()
            .text("🔙 Dashboard", "menu_dashboard"),
        }
      );
      break;

    case "dashboard_compare":
      await ctx.reply(
        "📊 <b>Comparison View</b>\n\n" +
          "Compare your performance:\n\n" +
          "• Yesterday vs Today\n" +
          "• This week vs Last week\n" +
          "• This month vs Last month\n" +
          "• Your performance vs Average\n\n" +
          "📈 <i>Track your progress!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("📅 Daily", "compare_daily")
            .text("📅 Weekly", "compare_weekly")
            .row()
            .text("📅 Monthly", "compare_monthly")
            .text("👥 Vs Average", "compare_average")
            .row()
            .text("🔙 Dashboard", "menu_dashboard"),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Dashboard action not available.",
        show_alert: false,
      });
  }
}

/**
 * Handle confirmation callbacks
 */
async function handleConfirmation(
  ctx: BotContext,
  data: string
): Promise<void> {
  const parts = data.split("_");
  const action = parts[1];
  const id = parts[2];
  const choice = parts[3];

  if (choice === "yes") {
    await ctx.reply(
      `✅ <b>Confirmed: ${action}</b>\n\n` +
        `Action has been completed successfully.`,
      { parse_mode: "HTML" }
    );
  } else {
    await ctx.reply(
      `❌ <b>Cancelled: ${action}</b>\n\n` + `Action has been cancelled.`,
      { parse_mode: "HTML" }
    );
  }
}

/**
 * Handle unknown callbacks
 */
async function handleUnknownCallback(
  ctx: BotContext,
  data: string
): Promise<void> {
  logger.warn(`Unknown callback data: ${data}`, {
    userId: ctx.from?.id,
    username: ctx.from?.username,
    data,
  });

  await ctx.answerCallbackQuery({
    text: "⚠️ Unknown action. Please try a different option.",
    show_alert: true,
  });
}

/**
 * Helper function to copy referral link
 */
async function copyReferralLink(
  ctx: BotContext,
  userId: number
): Promise<void> {
  const referralLink = `https://t.me/${config.botUsername}?start=ref_${userId}`;

  await ctx.answerCallbackQuery({
    text: "🔗 Referral link copied to clipboard!",
    show_alert: true,
  });

  await ctx.reply(
    `📋 <b>Referral Link Copied</b>\n\n` +
      `Your personal link:\n\n` +
      `<code>${referralLink}</code>\n\n` +
      `💡 <i>Share this link to start earning commissions!</i>`,
    { parse_mode: "HTML" }
  );
}

/**
 * Show system status
 */
async function showSystemStatus(ctx: BotContext): Promise<void> {
  await ctx.reply(
    `📡 <b>System Status</b>\n\n` +
      `✅ <b>All Systems Operational</b>\n\n` +
      `🟢 <b>Core Services:</b>\n` +
      `• Mining: Operational\n` +
      `• Transactions: Operational\n` +
      `• Wallet: Operational\n` +
      `• API: Operational\n\n` +
      `📊 <b>Performance:</b>\n` +
      `• Uptime: 99.9%\n` +
      `• Response Time: < 200ms\n` +
      `• Users Online: 2,458\n\n` +
      `🔔 <b>Last Update:</b> Just now\n` +
      `📅 <b>Next Maintenance:</b> Scheduled\n\n` +
      `💡 <i>Check status.cashimine.com for details</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .url("🌐 Status Page", "https://status.cashimine.com")
        .row()
        .text("🔄 Refresh", "support_status_refresh")
        .text("📋 History", "support_status_history")
        .row()
        .text("🔙 Support", "menu_help"),
    }
  );
}

/**
 * Show dashboard with user stats
 */
async function showDashboard(ctx: BotContext): Promise<void> {
  const userStats = await getUserStats(ctx.from?.id);

  const dashboardMessage = `
📊 <b>Cashimine Dashboard</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

👋 Welcome back, <b>${ctx.from?.first_name || "Miner"}</b>!

<b>💰 Quick Overview:</b>
• Balance: <b>${Formatters.formatCurrency(userStats.balance)}</b>
• Today: <b>${Formatters.formatCurrency(userStats.todayEarnings)}</b>
• Mining: <b>${Formatters.formatHashRate(userStats.hashRate)}</b>
• Rank: <b>#${userStats.rank}</b>

<b>⚡ Recent Activity:</b>
${userStats.recentActivity
  .map(
    (activity: { icon: string; description: string }) =>
      `• ${activity.icon} ${activity.description}`
  )
  .join("\n")}

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>🎯 Quick Actions:</b>
`;

  try {
    await ctx.editMessageText(dashboardMessage, {
      parse_mode: "HTML",
      reply_markup: MainMenu.dashboard(),
    });
  } catch (error) {
    // If editing fails (e.g., message too old), send a new message
    await ctx.reply(dashboardMessage, {
      parse_mode: "HTML",
      reply_markup: MainMenu.dashboard(),
    });
  }
}

// ============================================================================
// Data Fetching Functions (Mock implementations)
// ============================================================================

async function getUserStats(userId?: number): Promise<{
  balance: number;
  todayEarnings: number;
  hashRate: number;
  rank: number;
  recentActivity: Array<{ icon: string; description: string }>;
  weekEarnings: number;
  avgDaily: number;
  bestDay: number;
  efficiency: number;
  uptime: number;
}> {
  return {
    balance: 671.17,
    todayEarnings: 12.45,
    hashRate: 125000000000,
    rank: 1245,
    recentActivity: [
      { icon: "⛏️", description: "Mined 0.0001 BTC" },
      { icon: "👥", description: "Referral bonus received" },
      { icon: "💰", description: "Daily reward claimed" },
    ],
    weekEarnings: 87.15,
    avgDaily: 12.45,
    bestDay: 24.9,
    efficiency: 95,
    uptime: 99.9,
  };
}

async function getMiningStats(userId?: number): Promise<{
  sessionStart: number;
  hashRate: number;
  shares: number;
  efficiency: number;
  sessionEarnings: number;
  todayEarnings: number;
  weekEarnings: number;
}> {
  return {
    sessionStart: Date.now() - 1800000, // 30 minutes ago
    hashRate: 125000000000,
    shares: 12458,
    efficiency: 95,
    sessionEarnings: 6.23,
    todayEarnings: 12.45,
    weekEarnings: 87.15,
  };
}

async function getReferralStats(userId?: number): Promise<{
  total: number;
  active: number;
  earnings: number;
  tier: string;
  recent: Array<{ name: string; amount: number }>;
  nextTier: string;
  remaining: number;
  monthlyTarget: number;
}> {
  return {
    total: 8,
    active: 5,
    earnings: 128.4,
    tier: "Gold",
    recent: [
      { name: "John", amount: 2.45 },
      { name: "Sarah", amount: 3.2 },
      { name: "Mike", amount: 1.85 },
    ],
    nextTier: "Diamond",
    remaining: 23,
    monthlyTarget: 10,
  };
}

// ============================================================================
// Export the main handler
// ============================================================================
