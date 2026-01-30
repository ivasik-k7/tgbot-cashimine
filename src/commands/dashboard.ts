import { BotContext } from "../types";
import { Logger } from "../utils/logger";
import { MainMenu } from "../keyboards/mainMenu";
import { Formatters } from "../utils/formatters";

const logger = new Logger("DashboardCommand");

export async function handleDashboard(ctx: BotContext) {
  try {
    const userId = ctx.from?.id;
    const username = ctx.from?.username || ctx.from?.first_name;

    logger.info(`/dashboard command from user ${userId}`);

    if (ctx.session) {
      ctx.session.lastInteraction = Date.now();
    }

    // Fetch latest market snapshot and basic user overview
    const [market, user] = await Promise.all([
      getMarketSnapshot(),
      getUserOverview(userId),
    ]);

    const dashboardMessage = `
📊 <b>CashyMine Dashboard</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

👋 Welcome back, <b>${username || "Client"}</b>!

<b>📈 Market Snapshot (live):</b>
• ₿ Bitcoin (BTC): <b>${Formatters.formatCurrency(market.btc.pln)} PLN</b> • 24h: <b>${Formatters.formatPercent(market.btc.change24h)}</b>
• Ξ Ethereum (ETH): <b>${Formatters.formatCurrency(market.eth.pln)} PLN</b> • 24h: <b>${Formatters.formatPercent(market.eth.change24h)}</b>
• 💎 Tether (USDT): <b>${Formatters.formatCurrency(market.usdt.pln)} PLN</b> • 24h: <b>${Formatters.formatPercent(market.usdt.change24h)}</b>

<b>🥇 Precious Metals:</b>
• Złoto (1 oz): <b>${Formatters.formatCurrency(market.gold.ozPln)} PLN</b>
• Srebro (1 oz): <b>${Formatters.formatCurrency(market.silver.ozPln)} PLN</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>👤 Your Profile Overview:</b>
• 💱 Last operation: <b>${user.lastOperation || "brak danych"}</b>
• 💼 Client type: <b>${user.clientType}</b>
• 🏦 Nearest branch: <b>${user.nearestBranch}</b>

<b>💰 Example balances:</b>
• PLN: <b>${Formatters.formatCurrency(user.balances.pln)} PLN</b>
• BTC: <b>${user.balances.btc} BTC</b>
• USDT: <b>${user.balances.usdt} USDT</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>⚡ Quick Actions:</b>
• Sprawdź szczegółowe kursy w /rates
• Znajdź najbliższy kantor w /branches
• Rozpocznij nową wymianę w aplikacji web
`;

    await ctx.reply(dashboardMessage, {
      parse_mode: "HTML",
      reply_markup: MainMenu.dashboard(),
    });

    logger.info(`Dashboard sent to user ${userId}`, {
      userId,
      market,
      user,
    });
  } catch (error) {
    logger.error("Error in /dashboard command:", error);

    await ctx.reply(
      "📊 <b>Dashboard</b>\n\n" +
        "Nie udało się załadować aktualnych danych rynkowych. Spróbuj ponownie za chwilę lub sprawdź kursy w /rates.",
      {
        parse_mode: "HTML",
        reply_markup: MainMenu.dashboard(),
      }
    );
  }
}

/**
 * Mock: fetch latest market snapshot.
 * Replace with real HTTP call to your rates API.
 */
async function getMarketSnapshot(): Promise<{
  btc: { pln: number; change24h: number };
  eth: { pln: number; change24h: number };
  usdt: { pln: number; change24h: number };
  gold: { ozPln: number };
  silver: { ozPln: number };
}> {
  return {
    btc: { pln: 250000, change24h: 2.3 },
    eth: { pln: 15000, change24h: -1.1 },
    usdt: { pln: 4.1, change24h: 0.0 },
    gold: { ozPln: 9500 },
    silver: { ozPln: 120 },
  };
}

/**
 * Mock: basic user overview.
 * Replace with DB/API lookups.
 */
async function getUserOverview(userId?: number): Promise<{
  clientType: string;
  nearestBranch: string;
  lastOperation: string;
  balances: { pln: number; btc: number; usdt: number };
}> {
  return {
    clientType: "Indywidualny",
    nearestBranch: "Warszawa – Centrum",
    lastOperation: "BTC → PLN • 0.015 BTC • zrealizowano",
    balances: {
      pln: 10000,
      btc: 0.035,
      usdt: 1200,
    },
  };
}
