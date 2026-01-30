import { BotContext } from "../types";
import { Logger } from "../utils/logger";
import { MESSAGES } from "../templates/messages";
import { MainMenu } from "../keyboards/mainMenu";

const logger = new Logger("WalletCommand");

export async function handleWallet(ctx: BotContext) {
  try {
    const userId = ctx.from?.id;
    
    logger.info(`/wallet command from user ${userId}`);

    // Update session
    if (ctx.session) {
      ctx.session.lastInteraction = Date.now();
    }

    await ctx.reply(MESSAGES.WALLET, {
      parse_mode: "HTML",
      reply_markup: MainMenu.wallet(),
    });

    logger.info(`Wallet info sent to user ${userId}`);

  } catch (error) {
    logger.error("Error in /wallet command:", error);
    
    await ctx.reply(
      "💰 <b>Your Wallet</b>\n\n" +
      "View and manage your crypto balances, make withdrawals, and stake for rewards.",
      {
        parse_mode: "HTML",
        reply_markup: MainMenu.wallet(),
      }
    );
  }
}