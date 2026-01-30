import { BotContext } from "../types";
import { Logger } from "../utils/logger";
import { MainMenu } from "../keyboards/mainMenu";
import { Formatters } from "../utils/formatters";
import { InlineKeyboard } from "grammy";

const logger = new Logger("TransactionsCommand");

export async function handleTransactions(ctx: BotContext) {
  try {
    const userId = ctx.from?.id;
    
    logger.info(`/transactions command from user ${userId}`);

    // Update session
    if (ctx.session) {
      ctx.session.lastInteraction = Date.now();
    }

    // In a real app, fetch user's transactions
    const transactions = await getUserTransactions(userId);

    const transactionsMessage = `
📜 <b>Your Recent Transactions</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

${transactions.map(tx => `
<b>${Formatters.formatDate(tx.date)} • ${Formatters.formatCurrency(tx.amount)}</b>
${tx.icon} ${tx.description}
${tx.status === 'completed' ? '✅' : tx.status === 'pending' ? '⏳' : '❌'} ${tx.status}
`).join('\n')}

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>📊 Summary:</b>
• Total This Month: ${Formatters.formatCurrency(transactions.reduce((sum, tx) => sum + tx.amount, 0))}
• Completed: ${transactions.filter(tx => tx.status === 'completed').length}
• Pending: ${transactions.filter(tx => tx.status === 'pending').length}

<b>🔍 View full history in the Web App for detailed analytics!</b>
`;

    await ctx.reply(transactionsMessage, {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .webApp("📊 View Full History", `${ctx.config.webAppUrl}/transactions`)
        .row()
        .text("💰 Wallet", "menu_wallet")
        .text("🔙 Main Menu", "menu_main"),
    });

    logger.info(`Transactions sent to user ${userId}`, {
      userId,
      transactionCount: transactions.length,
    });

  } catch (error) {
    logger.error("Error in /transactions command:", error);
    
    await ctx.reply(
      "📜 <b>Transaction History</b>\n\n" +
      "View your earnings, withdrawals, and all account activity.",
      {
        parse_mode: "HTML",
        reply_markup: MainMenu.wallet(),
      }
    );
  }
}

async function getUserTransactions(userId?: number): Promise<any[]> {
  // Mock transaction data
  return [
    {
      date: Date.now() - 3600000, // 1 hour ago
      amount: 12.45,
      icon: '⛏️',
      description: 'Mining reward',
      status: 'completed',
    },
    {
      date: Date.now() - 7200000, // 2 hours ago
      amount: 5.00,
      icon: '👥',
      description: 'Referral bonus',
      status: 'completed',
    },
    {
      date: Date.now() - 10800000, // 3 hours ago
      amount: 7.45,
      icon: '🎮',
      description: 'Task completion',
      status: 'completed',
    },
    {
      date: Date.now() - 86400000, // 1 day ago
      amount: 11.25,
      icon: '⛏️',
      description: 'Mining reward',
      status: 'completed',
    },
    {
      date: Date.now() - 172800000, // 2 days ago
      amount: 50.00,
      icon: '💸',
      description: 'Withdrawal',
      status: 'pending',
    },
  ];
}