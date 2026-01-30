import { BotContext } from "../types";
import { Logger } from "../utils/logger";
import { MESSAGES } from "../templates/messages";
import { MainMenu } from "../keyboards/mainMenu";

const logger = new Logger("ReferralCommand");

export async function handleReferral(ctx: BotContext) {
  try {
    const userId = ctx.from?.id;
    
    logger.info(`/referral command from user ${userId}`);

    // Update session
    if (ctx.session) {
      ctx.session.lastInteraction = Date.now();
    }

    await ctx.reply(MESSAGES.REFERRAL(userId || 0), {
      parse_mode: "HTML",
      reply_markup: MainMenu.referral(userId || 0),
    });

    logger.info(`Referral info sent to user ${userId}`);

  } catch (error) {
    logger.error("Error in /referral command:", error);
    
    await ctx.reply(
      "👥 <b>Referral Program</b>\n\n" +
      "Earn 15% of your friends' mining rewards forever! Share your link and grow your earnings.",
      {
        parse_mode: "HTML",
        reply_markup: MainMenu.referral(ctx.from?.id || 0),
      }
    );
  }
}