import { BotContext } from "../types";
import { Logger } from "../utils/logger";
import { MESSAGES } from "../templates/messages";
import { MainMenu } from "../keyboards/mainMenu";

const logger = new Logger("HelpCommand");

export async function handleHelp(ctx: BotContext) {
  try {
    const userId = ctx.from?.id;
    
    logger.info(`/help command from user ${userId}`);

    // Update session
    if (ctx.session) {
      ctx.session.lastInteraction = Date.now();
    }

    await ctx.reply(MESSAGES.HELP, {
      parse_mode: "HTML",
      reply_markup: MainMenu.help(),
    });

    logger.info(`Help info sent to user ${userId}`);

  } catch (error) {
    logger.error("Error in /help command:", error);
    
    await ctx.reply(
      "🆘 <b>Help</b>\n\n" +
      "Need assistance? Here are the main commands:\n" +
      "/start - Begin\n" +
      "/dashboard - Open dashboard\n" +
      "/wallet - View balance\n" +
      "/help - Show this message",
      { parse_mode: "HTML" }
    );
  }
}