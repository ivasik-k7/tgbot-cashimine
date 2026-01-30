import { BotContext } from "../types";
import { Logger } from "../utils/logger";
import { MESSAGES } from "../templates/messages";
import { InlineKeyboard } from "grammy";
// import { MainMenu } from "../keyboards/mainMenu";

const logger = new Logger("AboutCommand");

export async function handleAbout(ctx: BotContext) {
  try {
    const userId = ctx.from?.id;
    
    logger.info(`/about command from user ${userId}`);

    // Update session
    if (ctx.session) {
      ctx.session.lastInteraction = Date.now();
    }

    await ctx.reply(MESSAGES.ABOUT, {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .webApp("🚀 Start Mining", ctx.config.webAppUrl)
        .row()
        .text("📊 Dashboard", "menu_dashboard")
        .text("🔙 Main Menu", "menu_main"),
    });

    logger.info(`About info sent to user ${userId}`);

  } catch (error) {
    logger.error("Error in /about command:", error);
    
    await ctx.reply(
      "🤖 <b>About Cashimine</b>\n\n" +
      "We're revolutionizing crypto mining by making it accessible to everyone!\n\n" +
      "Join thousands of users earning crypto daily.",
      { parse_mode: "HTML" }
    );
  }
}