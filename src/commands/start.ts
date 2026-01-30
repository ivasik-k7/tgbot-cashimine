import { BotContext } from "../types";
import { Logger } from "../utils/logger";
import { MESSAGES } from "../templates/messages";
import { MainMenu } from "../keyboards/mainMenu";
import { config } from "../config";
import { InlineKeyboard } from "grammy";
// import { InlineKeyboard } from "grammy/out/convenience/keyboard";

const logger = new Logger("StartCommand");

export async function handleStart(ctx: BotContext) {
  try {
    const userId = ctx.from?.id;
    const username = ctx.from?.username || ctx.from?.first_name;
    const startPayload = ctx.match; // For referral links: ?start=ref_123456
    
    logger.info(`/start command from user ${userId}${startPayload ? ` with payload: ${startPayload}` : ''}`);

    // Handle referral link
    if (startPayload && typeof startPayload === 'string' && startPayload.startsWith('ref_')) {
      const referrerId = startPayload.replace('ref_', '');
      await handleReferral(referrerId, userId, ctx);
    }

    // Check if user has existing session
    const hasExistingSession = ctx.session?.lastInteraction && 
      (Date.now() - ctx.session.lastInteraction) < (30 * 24 * 60 * 60 * 1000); // 30 days

    // Update session
    if (!ctx.session) {
      ctx.session = {
        lastInteraction: Date.now(),
        step: "active",
        referralCode: undefined,
      };
    } else {
      ctx.session.lastInteraction = Date.now();
      ctx.session.step = "active";
    }

    // Send welcome message
    const message = hasExistingSession 
      ? MESSAGES.WELCOME_EXISTING(username)
      : MESSAGES.WELCOME(username);

    await ctx.reply(message, {
      parse_mode: "HTML",
      reply_markup: MainMenu.welcome(),
    });

    // Log successful start
    logger.info(`Welcome message sent to user ${userId}`, {
      userId,
      username,
      hasExistingSession,
      startPayload,
    });

  } catch (error) {
    logger.error("Error in /start command:", error);
    
    await ctx.reply(
      "🎉 Welcome to Cashimine!\n\n" +
      "Start your crypto mining journey by opening the web app below.",
      {
        reply_markup: new InlineKeyboard()
          .webApp("🚀 Launch Cashimine", config.webAppUrl),
      }
    );
  }
}

/**
 * Handle referral registration
 */
async function handleReferral(referrerId: string, referredUserId: number | undefined, ctx: BotContext) {
  if (!referredUserId) return;

  try {
    logger.info(`Referral detected: ${referrerId} -> ${referredUserId}`);
    
    // In a real app, you would:
    // 1. Validate referrer exists
    // 2. Check if referral is valid (not self-referral, not already referred, etc.)
    // 3. Update database with referral
    // 4. Award bonuses
    
    // For now, just update session
    ctx.session.referralCode = referrerId;
    
    // Notify referrer (in a real app, this would be async)
    logger.info(`User ${referredUserId} joined via referral from ${referrerId}`);
    
  } catch (error) {
    logger.error("Error processing referral:", error);
  }
}