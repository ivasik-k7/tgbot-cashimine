import { BotContext } from "../types";
import { Logger } from "../utils/logger";
import { Formatters } from "../utils/formatters";
import { InlineKeyboard } from "grammy";
import { config } from "../config";

const logger = new Logger("MessageHandler");

export async function handleTextMessage(ctx: BotContext) {
  const message = ctx.message?.text;
  const userId = ctx.from?.id;

  if (!message) return;

  logger.info(
    `Text message from user ${userId}: ${message.substring(0, 100)}`,
    {
      userId,
      messageLength: message.length,
    }
  );

  // Update session
  if (ctx.session) {
    ctx.session.lastInteraction = Date.now();
  }

  try {
    // Check for specific patterns in the message
    if (await handleQuickCommands(ctx, message)) return;
    if (await handleQuestions(ctx, message)) return;
    if (await handleNumbers(ctx, message)) return;
    if (await handleKeywords(ctx, message)) return;

    // Default response for general messages
    await handleGeneralMessage(ctx, message);
  } catch (error) {
    logger.error("Error handling text message:", {
      userId,
      message: message.substring(0, 200),
      error: error instanceof Error ? error.message : String(error),
    });

    await ctx.reply(
      "❌ <b>Oops!</b>\n\n" +
        "I encountered an error processing your message.\n\n" +
        "Please try again or use one of the commands:\n" +
        "/help - Get assistance\n" +
        "/app - Open the application",
      { parse_mode: "HTML" }
    );
  }
}

/**
 * Handle quick command-like messages
 */
async function handleQuickCommands(
  ctx: BotContext,
  message: string
): Promise<boolean> {
  const lowerMessage = message.toLowerCase().trim();

  const quickCommands: Record<string, (ctx: BotContext) => Promise<void>> = {
    // Balance inquiries
    balance: handleBalanceInquiry,
    "my balance": handleBalanceInquiry,
    "how much": handleBalanceInquiry,
    earnings: handleEarningsInquiry,

    // Mining related
    mining: handleMiningInquiry,
    "start mining": handleStartMining,
    "stop mining": handleMiningStop,
    "mining stats": handleMiningStatus,

    // Referral related
    referral: handleReferralInquiry,
    refer: handleReferralInquiry,
    invite: handleReferralInquiry,
    share: handleShareReferral,

    // Support
    help: handleHelpInquiry,
    support: handleSupportRequest,
    contact: handleContactRequest,
    problem: handleProblemReport,

    // App access
    app: handleAppAccess,
    "open app": handleAppAccess,
    launch: handleAppAccess,
    dashboard: handleDashboardRequest,

    // Withdrawal
    withdraw: handleWithdrawInquiry,
    "cash out": handleWithdrawInquiry,
    withdrawal: handleWithdrawInquiry,

    // Deposit
    deposit: handleDepositRequest,
    "add funds": handleDepositRequest,
    "top up": handleDepositRequest,
  };

  for (const [keyword, handler] of Object.entries(quickCommands)) {
    if (
      lowerMessage.includes(keyword) &&
      (lowerMessage === keyword ||
        lowerMessage.startsWith(keyword + " ") ||
        lowerMessage.endsWith(" " + keyword) ||
        lowerMessage.includes(" " + keyword + " "))
    ) {
      logger.debug(
        `Quick command detected: "${keyword}" in message from user ${ctx.from?.id}`
      );
      await handler(ctx);
      return true;
    }
  }

  return false;
}

/**
 * Handle common questions
 */
async function handleQuestions(
  ctx: BotContext,
  message: string
): Promise<boolean> {
  // Question patterns
  const questionPatterns = [
    {
      pattern: /how (much|many) (do i have|balance|earning)/i,
      handler: handleBalanceInquiry,
    },
    {
      pattern: /how (to|do i) (start|begin)/i,
      handler: handleHowToStart,
    },
    {
      pattern: /what is (cashimine|this)/i,
      handler: handleWhatIsCashimine,
    },
    {
      pattern: /how (does|do) (mining|earn|work)/i,
      handler: handleHowMiningWorks,
    },
    {
      pattern: /when (can i|do i) (withdraw|cash out)/i,
      handler: handleWithdrawInquiry,
    },
    {
      pattern: /is (it|this) (safe|secure)/i,
      handler: handleSafetyQuestion,
    },
    {
      pattern: /how (much|many) (can i earn|earning potential)/i,
      handler: handleEarningPotentialQuestion,
    },
    {
      pattern: /what are (the|your) (fees|charges)/i,
      handler: handleFeesQuestion,
    },
    {
      pattern: /how (to|do i) (refer|invite)/i,
      handler: handleHowToReferFriends,
    },
  ];

  for (const { pattern, handler } of questionPatterns) {
    if (pattern.test(message)) {
      logger.debug(
        `Question detected: "${pattern.toString()}" in message from user ${ctx.from?.id}`
      );
      await handler(ctx);
      return true;
    }
  }

  // Handle general questions ending with ?
  if (message.includes("?")) {
    await handleGeneralQuestion(ctx, message);
    return true;
  }

  return false;
}

/**
 * Handle messages containing numbers (potential amounts)
 */
async function handleNumbers(
  ctx: BotContext,
  message: string
): Promise<boolean> {
  // Check if message contains numbers that look like amounts
  const amountMatch = message.match(
    /(\d+([.,]\d+)?)\s*(usd|btc|eth|dollars?|bitcoin|ethereum)/i
  );

  if (amountMatch) {
    const amount = parseFloat(amountMatch[1].replace(",", "."));
    const currency = amountMatch[3].toLowerCase();

    logger.debug(
      `Amount detected: ${amount} ${currency} from user ${ctx.from?.id}`
    );

    if (currency.includes("usd") || currency.includes("dollar")) {
      await handleAmountInquiry(ctx, amount, "USD");
    } else if (currency.includes("btc") || currency.includes("bitcoin")) {
      await handleAmountInquiry(ctx, amount, "BTC");
    } else if (currency.includes("eth") || currency.includes("ethereum")) {
      await handleAmountInquiry(ctx, amount, "ETH");
    }

    return true;
  }

  // Check for percentage
  const percentMatch = message.match(/(\d+)%/);
  if (percentMatch) {
    const percent = parseInt(percentMatch[1]);
    await handlePercentageQuestion(ctx, percent);
    return true;
  }

  return false;
}

/**
 * Handle specific keywords
 */
async function handleKeywords(
  ctx: BotContext,
  message: string
): Promise<boolean> {
  const lowerMessage = message.toLowerCase();

  const keywordHandlers: Record<string, (ctx: BotContext) => Promise<void>> = {
    // Emotions and greetings
    hello: handleGreeting,
    hi: handleGreeting,
    hey: handleGreeting,
    "good morning": handleGreeting,
    "good evening": handleGreeting,
    thanks: handleThanks,
    "thank you": handleThanks,
    thank: handleThanks,
    cool: handlePositiveResponse,
    awesome: handlePositiveResponse,
    great: handlePositiveResponse,
    amazing: handlePositiveResponse,

    // Problems
    error: handleErrorReported,
    bug: handleErrorReported,
    "not working": handleErrorReported,
    problem: handleErrorReported,
    issue: handleErrorReported,

    // Features
    feature: handleFeatureSuggestion,
    suggestion: handleFeatureSuggestion,
    idea: handleFeatureSuggestion,
    request: handleFeatureSuggestion,

    // Status
    status: handleStatusRequest,
    update: handleStatusRequest,
    news: handleNewsRequest,
    announcement: handleNewsRequest,
  };

  for (const [keyword, handler] of Object.entries(keywordHandlers)) {
    if (lowerMessage.includes(keyword)) {
      logger.debug(
        `Keyword detected: "${keyword}" in message from user ${ctx.from?.id}`
      );
      await handler(ctx);
      return true;
    }
  }

  return false;
}

/**
 * Handle general messages that don't match any pattern
 */
async function handleGeneralMessage(ctx: BotContext, message: string) {
  logger.info(
    `General message from user ${ctx.from?.id}: "${message.substring(0, 50)}..."`
  );

  // Check message length
  if (message.length > 500) {
    await ctx.reply(
      "📝 <b>Long Message Received</b>\n\n" +
        "I see you've sent a detailed message. For complex inquiries, please:\n\n" +
        "1. Use specific commands like /help\n" +
        "2. Contact support via /support\n" +
        "3. Or send a shorter, more specific question\n\n" +
        "💡 <i>I'm better at handling specific questions and commands!</i>",
      { parse_mode: "HTML" }
    );
    return;
  }

  // Try to understand intent
  const response = await generateContextualResponse(ctx);

  await ctx.reply(response, {
    parse_mode: "HTML",
    reply_markup: new InlineKeyboard()
      .text("🤔 Not what you meant?", "help_clarify")
      .row()
      .text("📖 Tutorial", "help_tutorial")
      .text("📧 Support", "support_contact"),
  });
}

/**
 * Generate contextual response based on message content
 */
async function generateContextualResponse(ctx: BotContext): Promise<string> {
  const username = ctx.from?.first_name;

  const responses = [
    `🤔 <b>I'm not sure I understand</b>\n\n` +
      `Hi ${username || "there"}! I'm Cashimine Bot, here to help you with crypto mining.\n\n` +
      `Try asking me about:\n` +
      `• Your balance or earnings\n` +
      `• How to start mining\n` +
      `• Referral program details\n` +
      `• Or use /help for all commands`,

    `💡 <b>Need some guidance?</b>\n\n` +
      `I can help you with Cashimine! Try these:\n` +
      `• Say "balance" to check your earnings\n` +
      `• Say "mining" to learn about mining\n` +
      `• Say "referral" for sharing tips\n` +
      `• Or use /app to open everything!`,

    `🚀 <b>Ready to earn?</b>\n\n` +
      `I see you're chatting! Let's get you earning:\n` +
      `• Use /start if you're new\n` +
      `• Use /dashboard for your stats\n` +
      `• Use /app to launch mining\n` +
      `• What would you like to do today?`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

// ============================================================================
// Specific Handler Implementations
// ============================================================================

async function handleBalanceInquiry(ctx: BotContext) {
  // Mock balance - in production, fetch from API
  const balance = 671.17;
  const today = 12.45;

  await ctx.reply(
    `💰 <b>Your Balance</b>\n\n` +
      `• 💵 Total Balance: <b>${Formatters.formatCurrency(balance)}</b>\n` +
      `• 📈 Today's Earnings: <b>${Formatters.formatCurrency(today)}</b>\n` +
      `• 👥 Referral Earnings: <b>${Formatters.formatCurrency(128.4)}</b>\n\n` +
      `💡 <i>Use /wallet for detailed breakdown</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .webApp("📊 View Details", `${config.webAppUrl}/wallet`)
        .row()
        .text("📈 Earnings Chart", "wallet_chart")
        .text("💸 Withdraw", "wallet_withdraw"),
    }
  );
}

async function handleEarningsInquiry(ctx: BotContext) {
  await ctx.reply(
    `📈 <b>Earnings Overview</b>\n\n` +
      `• Today: <b>${Formatters.formatCurrency(12.45)}</b>\n` +
      `• This Week: <b>${Formatters.formatCurrency(87.15)}</b>\n` +
      `• This Month: <b>${Formatters.formatCurrency(312.8)}</b>\n` +
      `• All Time: <b>${Formatters.formatCurrency(1284.5)}</b>\n\n` +
      `📊 <b>Sources:</b>\n` +
      `• Mining: 65%\n` +
      `• Referrals: 20%\n` +
      `• Tasks: 10%\n` +
      `• Bonuses: 5%\n\n` +
      `💡 <i>Earnings update in real-time!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .webApp("📊 Analytics", `${config.webAppUrl}/analytics`)
        .row()
        .text("⛏️ Boost Mining", "mining_boost")
        .text("👥 Refer More", "referral_stats"),
    }
  );
}

async function handleMiningInquiry(ctx: BotContext) {
  await ctx.reply(
    `⛏️ <b>Mining Information</b>\n\n` +
      `Cashimine mining is cloud-based and accessible to everyone!\n\n` +
      `✨ <b>Benefits:</b>\n` +
      `• No hardware needed\n` +
      `• Low energy costs\n` +
      `• 24/7 operation\n` +
      `• Real-time rewards\n\n` +
      `📊 <b>Current Stats:</b>\n` +
      `• Your Hash Rate: 125 GH/s\n` +
      `• Daily Earnings: ~$12.45\n` +
      `• Efficiency: 95%\n` +
      `• Uptime: 99.9%\n\n` +
      `🚀 <b>Ready to start?</b>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .webApp("🚀 Start Mining", `${config.webAppUrl}/mining`)
        .row()
        .text("📊 Live Stats", "mining_stats")
        .text("⚡ Boost", "mining_boost")
        .row()
        .text("❓ How It Works", "mining_how"),
    }
  );
}

async function handleStartMining(ctx: BotContext) {
  await ctx.reply(
    `⛏️ <b>Starting Mining Session</b>\n\n` +
      `I've initiated your mining session!\n\n` +
      `📊 <b>Session Details:</b>\n` +
      `• Start Time: Now\n` +
      `• Hash Rate: 125 GH/s\n` +
      `• Estimated Daily: $12.45\n` +
      `• Power Cost: $0.05/day\n\n` +
      `💡 <i>Check back in 1 hour for your first rewards!</i>\n` +
      `🔄 <i>Mining continues automatically</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text("📊 Check Status", "mining_stats")
        .text("⚡ Boost Now", "mining_boost")
        .row()
        .text("⏸️ Pause", "mining_pause")
        .text("ℹ️ Help", "mining_help"),
    }
  );
}

async function handleMiningStop(ctx: BotContext) {
  await ctx.reply(
    `⏸️ <b>Mining Stopped</b>\n\n` +
      `Your mining session has been paused.\n\n` +
      `📊 <b>Session Summary:</b>\n` +
      `• Duration: 2 hours\n` +
      `• Earnings: $2.45\n` +
      `• Hash Rate: 125 GH/s\n` +
      `• Efficiency: 95%\n\n` +
      `💡 <i>Your progress is saved! Resume anytime.</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text("▶️ Resume", "mining_start")
        .text("📊 Stats", "mining_stats")
        .row()
        .text("⚡ Boost", "mining_boost")
        .text("🔙 Dashboard", "menu_dashboard"),
    }
  );
}

async function handleMiningStatus(ctx: BotContext) {
  await ctx.reply(
    `📊 <b>Mining Status</b>\n\n` +
      `• Status: 🟢 Active\n` +
      `• Hash Rate: 125 GH/s\n` +
      `• Today's Earnings: $12.45\n` +
      `• Efficiency: 95%\n` +
      `• Uptime: 99.9%\n\n` +
      `💡 <i>Mining continues automatically 24/7</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text("📈 Live View", "mining_stats")
        .text("⚡ Boost", "mining_boost")
        .row()
        .text("⏸️ Pause", "mining_pause")
        .text("ℹ️ Help", "mining_help"),
    }
  );
}

async function handleReferralInquiry(ctx: BotContext) {
  const userId = ctx.from?.id;

  await ctx.reply(
    `👥 <b>Referral Program</b>\n\n` +
      `Earn 15% of your friends' mining rewards FOREVER!\n\n` +
      `✨ <b>Benefits:</b>\n` +
      `• 🎁 $5 bonus for you & friend\n` +
      `• 💰 15% lifetime commission\n` +
      `• 🏆 Exclusive rewards\n` +
      `• 📈 Higher tiers = higher %\n\n` +
      `🔗 <b>Your Link:</b>\n` +
      `<code>https://t.me/${config.botUsername}?start=ref_${userId}</code>\n\n` +
      `💡 <i>Share this link to start earning!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text("📊 My Stats", "referral_stats")
        .text("🏆 Tiers", "referral_tiers")
        .row()
        .text("🔗 Copy Link", "referral_copy")
        .text("📣 Share", "referral_share"),
    }
  );
}

async function handleShareReferral(ctx: BotContext) {
  const userId = ctx.from?.id;

  await ctx.reply(
    `📣 <b>Share Cashimine</b>\n\n` +
      `Share with friends and earn rewards!\n\n` +
      `📱 <b>Sharing Options:</b>\n` +
      `• Telegram: Forward the message below\n` +
      `• WhatsApp: Copy and share the link\n` +
      `• Email: Send to your contacts\n` +
      `• Social Media: Post on your profiles\n\n` +
      `📝 <b>Sample Message:</b>\n` +
      `<blockquote>` +
      `🎉 Join Cashimine & start earning crypto!\n\n` +
      `🚀 Mine Bitcoin & Ethereum\n` +
      `💰 Earn daily rewards\n` +
      `🎁 Get $5 free bonus\n` +
      `👥 15% referral commission\n\n` +
      `👉 Start here: https://t.me/${config.botUsername}?start=ref_${userId}` +
      `</blockquote>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .url(
          "📱 Share on Telegram",
          `https://t.me/share/url?url=https://t.me/${config.botUsername}?start=ref_${userId}&text=Join%20Cashimine%20for%20free%20crypto%20mining!`
        )
        .row()
        .text("📊 My Stats", "referral_stats")
        .text("🔙 Referral", "menu_referral"),
    }
  );
}

async function handleHelpInquiry(ctx: BotContext) {
  await ctx.reply(
    `🆘 <b>How Can I Help?</b>\n\n` +
      `I can assist you with:\n\n` +
      `📚 <b>Getting Started:</b>\n` +
      `• Account setup\n` +
      `• First deposit\n` +
      `• Starting mining\n\n` +
      `💰 <b>Earnings & Money:</b>\n` +
      `• Balance inquiries\n` +
      `• Withdrawal help\n` +
      `• Referral questions\n\n` +
      `⚙️ <b>Technical:</b>\n` +
      `• App access\n` +
      `• Mining issues\n` +
      `• Account security\n\n` +
      `💡 <i>Be specific about what you need help with!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text("📖 Tutorial", "help_tutorial")
        .text("❓ FAQ", "support_faq")
        .row()
        .text("📧 Contact", "support_contact")
        .text("🔙 Menu", "menu_main"),
    }
  );
}

async function handleSupportRequest(ctx: BotContext) {
  await ctx.reply(
    `🛠️ <b>Support Request</b>\n\n` +
      `For the fastest support:\n\n` +
      `📧 <b>Email:</b> support@cashimine.com\n` +
      `💬 <b>Live Chat:</b> Available in web app\n` +
      `📱 <b>Telegram:</b> @cashimine_support\n\n` +
      `💡 <i>Include your User ID: ${ctx.from?.id || "N/A"}</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .url("📧 Send Email", "mailto:support@cashimine.com")
        .url("💬 Live Chat", `${config.webAppUrl}/support`)
        .row()
        .text("❓ FAQ", "support_faq")
        .text("🔙 Help", "menu_help"),
    }
  );
}

async function handleContactRequest(ctx: BotContext) {
  await handleSupportRequest(ctx);
}

async function handleProblemReport(ctx: BotContext) {
  await ctx.reply(
    `🚨 <b>Problem Reported</b>\n\n` +
      `I've logged your issue. For immediate assistance:\n\n` +
      `1. Use /support for contact options\n` +
      `2. Describe the issue in detail\n` +
      `3. Include screenshots if possible\n\n` +
      `⏰ <b>Response Time:</b> < 6 hours\n` +
      `🔧 <b>Status:</b> Issue logged`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text("📧 Contact Now", "support_contact")
        .text("❓ FAQ", "support_faq")
        .row()
        .text("🔙 Help", "menu_help"),
    }
  );
}

async function handleAppAccess(ctx: BotContext) {
  await ctx.reply(
    `🚀 <b>Access Cashimine</b>\n\n` +
      `Open the full web application to access all features:\n\n` +
      `✨ <b>Available in App:</b>\n` +
      `• Full mining dashboard\n` +
      `• Advanced wallet management\n` +
      `• Detailed analytics\n` +
      `• Referral tracking\n` +
      `• Settings & security\n\n` +
      `📱 <b>Platforms:</b>\n` +
      `• Desktop: Full features\n` +
      `• Mobile: Optimized\n` +
      `• Tablet: Responsive\n\n` +
      `💡 <i>Bookmark for quick access!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .webApp("🚀 Launch App", config.webAppUrl)
        .row()
        .webApp("📊 Dashboard", `${config.webAppUrl}/dashboard`)
        .webApp("💰 Wallet", `${config.webAppUrl}/wallet`)
        .row()
        .webApp("⛏️ Mining", `${config.webAppUrl}/mining`)
        .webApp("👥 Referral", `${config.webAppUrl}/referral`),
    }
  );
}

async function handleDashboardRequest(ctx: BotContext) {
  await ctx.reply(
    `📊 <b>Dashboard Access</b>\n\n` +
      `Your personal dashboard shows:\n\n` +
      `• Real-time earnings\n` +
      `• Mining performance\n` +
      `• Referral statistics\n` +
      `• Portfolio growth\n` +
      `• Task completion\n\n` +
      `💡 <i>Updated every 5 minutes!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .webApp("📊 Open Dashboard", `${config.webAppUrl}/dashboard`)
        .row()
        .text("📈 Analytics", "dashboard_analytics")
        .text("🎯 Goals", "dashboard_goals")
        .row()
        .text("🔙 Menu", "menu_main"),
    }
  );
}

async function handleWithdrawInquiry(ctx: BotContext) {
  await ctx.reply(
    `💸 <b>Withdrawal Information</b>\n\n` +
      `Withdraw your earnings easily:\n\n` +
      `✨ <b>Requirements:</b>\n` +
      `• Minimum: $10.00\n` +
      `• Daily Limit: $1,000.00\n` +
      `• Verification: Required\n` +
      `• Time: Instant to 24 hours\n\n` +
      `💰 <b>Your Status:</b>\n` +
      `• Available: $145.67\n` +
      `• Can withdraw: ✅ Yes\n` +
      `• Today's used: $0.00\n` +
      `• Limit left: $1,000.00\n\n` +
      `💡 <i>Higher tiers get higher limits!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .webApp("💸 Withdraw Now", `${config.webAppUrl}/withdraw`)
        .row()
        .text("🔒 Verify Account", "wallet_verify")
        .text("📈 Increase Limit", "wallet_limit")
        .row()
        .text("📊 Calculator", "wallet_calc")
        .text("ℹ️ Fees", "wallet_fees"),
    }
  );
}

async function handleDepositRequest(ctx: BotContext) {
  await ctx.reply(
    `💰 <b>Deposit Funds</b>\n\n` +
      `Add funds to start earning:\n\n` +
      `✨ <b>Methods:</b>\n` +
      `• Cryptocurrency (BTC, ETH, USDT)\n` +
      `• Bank Transfer\n` +
      `• Credit/Debit Card\n` +
      `• E-wallets\n\n` +
      `📊 <b>Benefits:</b>\n` +
      `• Start mining immediately\n` +
      `• Higher mining power\n` +
      `• Access premium features\n` +
      `• Compound earnings\n\n` +
      `💡 <i>No deposit fees!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .webApp("💰 Deposit Now", `${config.webAppUrl}/deposit`)
        .row()
        .text("📊 Calculator", "deposit_calc")
        .text("ℹ️ Methods", "deposit_methods")
        .row()
        .text("🔙 Wallet", "menu_wallet"),
    }
  );
}

async function handleHowToStart(ctx: BotContext) {
  await ctx.reply(
    `📖 <b>How to Start</b>\n\n` +
      `Getting started is easy:\n\n` +
      `1️⃣ <b>Sign Up</b>\n` +
      `• Use /start command\n` +
      `• Create your account\n` +
      `• Verify your email\n\n` +
      `2️⃣ <b>Deposit</b>\n` +
      `• Add funds (minimum $10)\n` +
      `• Choose cryptocurrency\n` +
      `• Confirm transaction\n\n` +
      `3️⃣ <b>Start Mining</b>\n` +
      `• Open /app or /dashboard\n` +
      `• Click "Start Mining"\n` +
      `• Watch earnings grow!\n\n` +
      `4️⃣ <b>Earn More</b>\n` +
      `• Complete daily tasks\n` +
      `• Refer friends\n` +
      `• Upgrade your plan\n\n` +
      `💡 <i>Start with just $10!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text("🚀 Start Now", "app_start")
        .text("💰 Deposit", "deposit_start")
        .row()
        .text("📖 Tutorial", "help_tutorial")
        .text("🔙 Help", "menu_help"),
    }
  );
}

async function handleWhatIsCashimine(ctx: BotContext) {
  await ctx.reply(
    `🤖 <b>What is Cashimine?</b>\n\n` +
      `Cashimine is a cloud-based cryptocurrency mining platform that makes earning crypto accessible to everyone!\n\n` +
      `✨ <b>Key Features:</b>\n` +
      `• ⛏️ Cloud Mining: No hardware required\n` +
      `• 💰 Daily Rewards: Earn crypto every day\n` +
      `• 👥 Referral Program: Earn from friends\n` +
      `• 📈 Portfolio Growth: Watch your wealth grow\n` +
      `• 🔒 Security: Bank-level protection\n\n` +
      `🎯 <b>Our Mission:</b>\n` +
      `Democratize cryptocurrency mining by making it simple, accessible, and profitable for everyone.\n\n` +
      `💡 <i>Join thousands of happy miners today!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text("🚀 Start Earning", "app_start")
        .text("📊 See Stats", "dashboard_open")
        .row()
        .text("📖 Learn More", "about_more")
        .text("🔙 Menu", "menu_main"),
    }
  );
}

async function handleHowMiningWorks(ctx: BotContext) {
  await ctx.reply(
    `⚙️ <b>How Mining Works</b>\n\n` +
      `Cashimine uses cloud mining to make it simple:\n\n` +
      `1️⃣ <b>Cloud Infrastructure</b>\n` +
      `• We maintain mining hardware\n` +
      `• You access it remotely\n` +
      `• No setup or maintenance\n\n` +
      `2️⃣ <b>Hash Power Allocation</b>\n` +
      `• You purchase mining power\n` +
      `• We allocate hash rate to you\n` +
      `• Mining runs 24/7\n\n` +
      `3️⃣ <b>Reward Calculation</b>\n` +
      `• Based on your hash power\n` +
      `• Current market conditions\n` +
      `• Mining difficulty\n\n` +
      `4️⃣ <b>Daily Payouts</b>\n` +
      `• Earnings calculated daily\n` +
      `• Auto-added to your wallet\n` +
      `• Available for withdrawal\n\n` +
      `💡 <i>Start with as little as $10!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text("🚀 Start Mining", "mining_start")
        .text("📊 Calculator", "mining_calc")
        .row()
        .text("❓ FAQ", "mining_faq")
        .text("🔙 Learn", "help_tutorial"),
    }
  );
}

async function handleSafetyQuestion(ctx: BotContext) {
  await ctx.reply(
    `🔒 <b>Safety & Security</b>\n\n` +
      `Your security is our top priority:\n\n` +
      `🛡️ <b>Protection Measures:</b>\n` +
      `• Bank-level encryption\n` +
      `• Cold wallet storage\n` +
      `• 2FA authentication\n` +
      `• Regular security audits\n` +
      `• DDoS protection\n\n` +
      `💰 <b>Fund Security:</b>\n` +
      `• 95% funds in cold storage\n` +
      `• Multi-signature wallets\n` +
      `• Insurance coverage\n` +
      `• Transparent operations\n\n` +
      `👮 <b>Your Responsibility:</b>\n` +
      `• Use strong password\n` +
      `• Enable 2FA\n` +
      `• Never share credentials\n` +
      `• Beware of phishing\n\n` +
      `💡 <i>We've never had a security breach!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text("🔐 Enable 2FA", "security_2fa")
        .text("📖 Security Guide", "security_guide")
        .row()
        .text("📧 Report Issue", "security_report")
        .text("🔙 Help", "menu_help"),
    }
  );
}

async function handleEarningPotentialQuestion(ctx: BotContext) {
  await ctx.reply(
    `📈 <b>Earning Potential</b>\n\n` +
      `Earnings depend on several factors:\n\n` +
      `💰 <b>Key Factors:</b>\n` +
      `• Investment amount\n` +
      `• Mining plan selected\n` +
      `• Cryptocurrency prices\n` +
      `• Mining difficulty\n` +
      `• Referral activity\n\n` +
      `📊 <b>Example Scenarios:</b>\n` +
      `• $100 investment: ~$5-10/month\n` +
      `• $500 investment: ~$30-50/month\n` +
      `• $1,000 investment: ~$70-100/month\n` +
      `• + referrals: Additional 15%\n\n` +
      `🎯 <b>Maximize Earnings:</b>\n` +
      `• Upgrade mining plan\n` +
      `• Refer more friends\n` +
      `• Complete daily tasks\n` +
      `• Compound rewards\n\n` +
      `💡 <i>Use our calculator for accurate estimates!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text("🧮 Calculator", "earnings_calc")
        .text("📊 Projections", "earnings_projections")
        .row()
        .text("🚀 Upgrade", "mining_upgrade")
        .text("🔙 Learn", "help_tutorial"),
    }
  );
}

async function handleFeesQuestion(ctx: BotContext) {
  await ctx.reply(
    `💰 <b>Fees & Charges</b>\n\n` +
      `Transparent pricing with no hidden fees:\n\n` +
      `📊 <b>Our Fees:</b>\n` +
      `• Mining Fee: 1% of earnings\n` +
      `• Withdrawal Fee: 0.5% (min $1)\n` +
      `• Deposit Fee: FREE\n` +
      `• Account Fee: FREE\n\n` +
      `✨ <b>No Extra Charges:</b>\n` +
      `• No maintenance fees\n` +
      `• No electricity costs\n` +
      `• No hardware costs\n` +
      `• No setup fees\n\n` +
      `🏆 <b>Premium Benefits:</b>\n` +
      `• Lower mining fees\n` +
      `• Zero withdrawal fees\n` +
      `• Priority support\n` +
      `• Higher limits\n\n` +
      `💡 <i>Compare with traditional mining costs!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text("📊 Calculator", "fees_calc")
        .text("🏆 Upgrade", "premium_upgrade")
        .row()
        .text("📖 Comparison", "fees_comparison")
        .text("🔙 Help", "menu_help"),
    }
  );
}

async function handleHowToReferFriends(ctx: BotContext) {
  const userId = ctx.from?.id;

  await ctx.reply(
    `👥 <b>How to Refer Friends</b>\n\n` +
      `Earn 15% commission from friends' earnings!\n\n` +
      `📝 <b>Simple Steps:</b>\n` +
      `1. Share your referral link:\n` +
      `<code>https://t.me/${config.botUsername}?start=ref_${userId}</code>\n\n` +
      `2. Friends sign up using your link\n` +
      `3. They get $5 bonus\n` +
      `4. You earn 15% of their mining rewards\n\n` +
      `🎯 <b>Pro Tips:</b>\n` +
      `• Share on social media\n` +
      `• Send to crypto groups\n` +
      `• Email your contacts\n` +
      `• Create content about us\n\n` +
      `💡 <i>Earnings are for the lifetime of their account!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text("🔗 Copy Link", "referral_copy")
        .text("📣 Share Now", "referral_share")
        .row()
        .text("📊 My Stats", "referral_stats")
        .text("🔙 Referral", "menu_referral"),
    }
  );
}

async function handleGeneralQuestion(ctx: BotContext, question: string) {
  await ctx.reply(
    `🤔 <b>Question Received</b>\n\n` +
      `I see you asked: "${question.substring(0, 100)}"\n\n` +
      `For specific questions, try:\n` +
      `• "How do I start?" - Getting started guide\n` +
      `• "How much can I earn?" - Earnings calculator\n` +
      `• "Is it safe?" - Security information\n` +
      `• "How to withdraw?" - Withdrawal guide\n\n` +
      `💡 <i>Or use /help for all topics!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text("📖 Tutorial", "help_tutorial")
        .text("❓ FAQ", "support_faq")
        .row()
        .text("📧 Support", "support_contact")
        .text("🔙 Menu", "menu_main"),
    }
  );
}

async function handleAmountInquiry(
  ctx: BotContext,
  amount: number,
  currency: string
) {
  let equivalent = amount;
  let message = "";

  if (currency === "USD") {
    equivalent = amount * 0.000022; // Approx BTC value
    message = `$${amount} ≈ ${Formatters.formatCrypto(equivalent, "BTC")}`;
  } else if (currency === "BTC") {
    equivalent = amount * 45000; // Approx USD value
    message = `${Formatters.formatCrypto(amount, "BTC")} ≈ $${equivalent.toFixed(2)}`;
  } else if (currency === "ETH") {
    equivalent = amount * 2500; // Approx USD value
    message = `${Formatters.formatCrypto(amount, "ETH")} ≈ $${equivalent.toFixed(2)}`;
  }

  await ctx.reply(
    `💰 <b>Amount Conversion</b>\n\n` +
      `${message}\n\n` +
      `💡 <b>With this amount you could:</b>\n` +
      `• Start mining immediately\n` +
      `• Earn ~$${(equivalent * 0.05).toFixed(2)}/month\n` +
      `• Refer 5 friends for bonus\n` +
      `• Upgrade to premium features\n\n` +
      `🎯 <i>Ready to invest?</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .webApp("💰 Deposit Now", `${config.webAppUrl}/deposit`)
        .row()
        .text("🧮 Calculator", "investment_calc")
        .text("📊 Projections", "earnings_projections")
        .row()
        .text("🔙 Learn", "help_tutorial"),
    }
  );
}

async function handlePercentageQuestion(ctx: BotContext, percent: number) {
  await ctx.reply(
    `📊 <b>Percentage: ${percent}%</b>\n\n` +
      `That's a significant amount! Here's what ${percent}% could mean:\n\n` +
      `💡 <b>Possible Contexts:</b>\n` +
      `• Referral commission: ${percent}% of friends' earnings\n` +
      `• Daily return: ${percent}% on your investment\n` +
      `• Platform fee: ${percent}% of mining rewards\n` +
      `• Bonus rate: ${percent}% extra earnings\n\n` +
      `🎯 <b>Comparison:</b>\n` +
      `• Traditional savings: 0.5-2%\n` +
      `• Stock market: 7-10%\n` +
      `• Crypto mining: 5-15%\n\n` +
      `💡 <i>Need more context about what percentage you're asking about?</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text("📈 Earnings %", "earnings_percentage")
        .text("👥 Referral %", "referral_percentage")
        .row()
        .text("💰 Fees %", "fees_percentage")
        .text("🔙 Help", "menu_help"),
    }
  );
}

async function handleGreeting(ctx: BotContext) {
  const username = ctx.from?.first_name;
  const hour = new Date().getHours();
  let greeting = "Hello";

  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";
  else greeting = "Good evening";

  await ctx.reply(
    `${greeting}, ${username || "there"}! 👋\n\n` +
      `Welcome to Cashimine! I'm here to help you with:\n` +
      `• ⛏️ Crypto mining\n` +
      `• 💰 Earning rewards\n` +
      `• 👥 Referral program\n` +
      `• 📈 Growing your portfolio\n\n` +
      `How can I assist you today?`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text("🚀 Start Mining", "mining_start")
        .text("💰 Check Balance", "wallet_balance")
        .row()
        .text("📖 How It Works", "help_tutorial")
        .text("🎯 Quick Start", "help_quick"),
    }
  );
}

async function handleThanks(ctx: BotContext) {
  const responses = [
    "You're welcome! 😊 Happy to help!",
    "My pleasure! Let me know if you need anything else!",
    "Glad I could help! 🎉 Keep earning!",
    "Anytime! That's what I'm here for! ✨",
  ];

  await ctx.reply(
    responses[Math.floor(Math.random() * responses.length)] +
      "\n\n" +
      "💡 <i>Need more help? Just ask!</i>",
    { parse_mode: "HTML" }
  );
}

async function handlePositiveResponse(ctx: BotContext) {
  await ctx.reply(
    `🎉 <b>Awesome!</b>\n\n` +
      `I'm glad you're excited about Cashimine!\n\n` +
      `Ready to take the next step?\n` +
      `• Start mining now\n` +
      `• Check your earnings\n` +
      `• Refer some friends\n` +
      `• Explore premium features\n\n` +
      `💡 <i>Your success is our success!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text("🚀 Let's Go!", "app_start")
        .text("💰 Earnings", "wallet_balance")
        .row()
        .text("👥 Refer", "referral_start")
        .text("🔙 Menu", "menu_main"),
    }
  );
}

async function handleErrorReported(ctx: BotContext) {
  await ctx.reply(
    `🚨 <b>Issue Reported</b>\n\n` +
      `Sorry to hear you're experiencing issues!\n\n` +
      `For the fastest resolution:\n` +
      `1. Use /support for immediate help\n` +
      `2. Describe the issue in detail\n` +
      `3. Include screenshots if possible\n` +
      `4. Mention your User ID: ${ctx.from?.id || "N/A"}\n\n` +
      `⏰ <b>Response Time:</b> < 6 hours\n` +
      `🔧 <b>Status Page:</b> status.cashimine.com\n\n` +
      `💡 <i>We're here to help!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text("📧 Contact Support", "support_contact")
        .text("🔧 Status Page", "status_page")
        .row()
        .text("❓ Common Fixes", "error_fixes")
        .text("🔙 Help", "menu_help"),
    }
  );
}

async function handleFeatureSuggestion(ctx: BotContext) {
  await ctx.reply(
    `💡 <b>Feature Suggestion</b>\n\n` +
      `We love hearing your ideas!\n\n` +
      `📝 <b>How to Submit:</b>\n` +
      `1. Email: suggestions@cashimine.com\n` +
      `2. Subject: "Feature Suggestion"\n` +
      `3. Describe your idea in detail\n` +
      `4. Include benefits & use cases\n\n` +
      `🏆 <b>Community Voting:</b>\n` +
      `• Top suggestions get implemented\n` +
      `• Contributors get recognition\n` +
      `• Early access to new features\n\n` +
      `💡 <i>We review all suggestions monthly!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .url("📧 Submit Suggestion", "mailto:suggestions@cashimine.com")
        .row()
        .text("🗳️ Vote on Ideas", "feature_voting")
        .text("📋 Roadmap", "feature_roadmap")
        .row()
        .text("🔙 Help", "menu_help"),
    }
  );
}

async function handleStatusRequest(ctx: BotContext) {
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
        .text("🔄 Refresh", "status_refresh")
        .text("📋 History", "status_history")
        .row()
        .text("🔙 Menu", "menu_main"),
    }
  );
}

async function handleNewsRequest(ctx: BotContext) {
  await ctx.reply(
    `📰 <b>Latest News & Updates</b>\n\n` +
      `🚀 <b>Recent Updates:</b>\n` +
      `• Turbo Mining launched\n` +
      `• Mobile app beta released\n` +
      `• New referral tiers added\n` +
      `• Security enhancements\n\n` +
      `📅 <b>Upcoming Features:</b>\n` +
      `• AI Mining Optimization\n` +
      `• Multi-language support\n` +
      `• Advanced analytics\n` +
      `• Team mining pools\n\n` +
      `💡 <b>Stay Updated:</b>\n` +
      `• Telegram: @cashimine_news\n` +
      `• Twitter: @cashimine_app\n` +
      `• Blog: cashimine.com/blog\n\n` +
      `🎯 <i>Never miss an update!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .url("📰 Blog", "https://cashimine.com/blog")
        .url("🐦 Twitter", "https://twitter.com/cashimine_app")
        .row()
        .text("📅 Events", "news_events")
        .text("🔙 Menu", "menu_main"),
    }
  );
}

/**
 * Export the main handler
 */
