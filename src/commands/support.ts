import { BotContext } from "../types";
import { Logger } from "../utils/logger";
import { MESSAGES } from "../templates/messages";
import { MainMenu } from "../keyboards/mainMenu";

const logger = new Logger("SupportCommand");

export async function handleSupport(ctx: BotContext) {
  try {
    const userId = ctx.from?.id;
    
    logger.info(`/support command from user ${userId}`);

    // Update session
    if (ctx.session) {
      ctx.session.lastInteraction = Date.now();
    }

    await ctx.reply(MESSAGES.SUPPORT, {
      parse_mode: "HTML",
      reply_markup: MainMenu.help(),
    });

    logger.info(`Support info sent to user ${userId}`);

  } catch (error) {
    logger.error("Error in /support command:", error);
    
    await ctx.reply(
      "🛠️ <b>Support</b>\n\n" +
      "Need help? Contact our support team or visit our help center.",
      {
        parse_mode: "HTML",
        reply_markup: MainMenu.help(),
      }
    );
  }
}