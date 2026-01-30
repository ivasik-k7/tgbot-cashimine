import { BotContext } from "../types";
import { Logger } from "../utils/logger";
import { Formatters } from "../utils/formatters";
import { isAdmin } from "../config/constants";

const logger = new Logger("StatsCommand");

export async function handleStats(ctx: BotContext) {
  try {
    const userId = ctx.from?.id;

    logger.info(`/stats command from user ${userId}`);

    if (!isAdmin) {
      await ctx.reply(
        "🚫 <b>Access Denied</b>\n\n" +
          "This command is only available for administrators.",
        { parse_mode: "HTML" }
      );
      return;
    }

    // Update session
    if (ctx.session) {
      ctx.session.lastInteraction = Date.now();
    }

    // Get detailed statistics
    const stats = await getSystemStats();

    const statsMessage = `
📈 <b>Cashimine Statistics</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>👥 User Statistics:</b>
• Total Users: <b>${stats.totalUsers.toLocaleString()}</b>
• Active (24h): <b>${stats.active24h.toLocaleString()}</b>
• Active (7d): <b>${stats.active7d.toLocaleString()}</b>
• New Today: <b>${stats.newToday.toLocaleString()}</b>
• Premium Users: <b>${stats.premiumUsers.toLocaleString()}</b>
• Retention Rate: <b>${stats.retentionRate}%</b>

<b>💰 Financial Statistics:</b>
• Total Deposits: <b>${Formatters.formatCurrency(stats.totalDeposits)}</b>
• Total Withdrawals: <b>${Formatters.formatCurrency(stats.totalWithdrawals)}</b>
• Daily Volume: <b>${Formatters.formatCurrency(stats.dailyVolume)}</b>
• Platform Balance: <b>${Formatters.formatCurrency(stats.platformBalance)}</b>
• Average Deposit: <b>${Formatters.formatCurrency(stats.avgDeposit)}</b>
• Average Withdrawal: <b>${Formatters.formatCurrency(stats.avgWithdrawal)}</b>

<b>⛏️ Mining Statistics:</b>
• Active Miners: <b>${stats.activeMiners.toLocaleString()}</b>
• Total Hash Rate: <b>${Formatters.formatHashRate(stats.totalHashRate)}</b>
• Daily Rewards: <b>${Formatters.formatCurrency(stats.dailyRewards)}</b>
• Total Rewards: <b>${Formatters.formatCurrency(stats.totalRewards)}</b>
• Average Mining: <b>${Formatters.formatCurrency(stats.avgMining)}</b>

<b>👥 Referral Statistics:</b>
• Total Referrals: <b>${stats.totalReferrals.toLocaleString()}</b>
• Active Referrals: <b>${stats.activeReferrals.toLocaleString()}</b>
• Referral Earnings: <b>${Formatters.formatCurrency(stats.referralEarnings)}</b>
• Top Referrer: <b>${stats.topReferrer} users</b>

<b>📊 Performance Metrics:</b>
• Uptime: <b>${(stats.uptime * 100).toFixed(2)}%</b>
• Response Time: <b>${stats.avgResponseTime}ms</b>
• Error Rate: <b>${stats.errorRate}%</b>
• User Satisfaction: <b>${stats.userSatisfaction}/5</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>📅 Last Updated:</b> ${Formatters.formatDate(stats.lastUpdated)}
<b>📡 Data Period:</b> Last 30 days
`;

    await ctx.reply(statsMessage, {
      parse_mode: "HTML",
    });

    logger.info(`Statistics sent to admin ${userId}`, {
      userId,
      statsSummary: {
        totalUsers: stats.totalUsers,
        dailyVolume: stats.dailyVolume,
        activeMiners: stats.activeMiners,
      },
    });
  } catch (error) {
    logger.error("Error in /stats command:", error);

    await ctx.reply(
      "❌ <b>Stats Error</b>\n\n" +
        "Failed to load statistics. Please try again.",
      { parse_mode: "HTML" }
    );
  }
}

/**
 * Mock function to get system stats
 * In a real app, this would query your database/analytics
 */
async function getSystemStats(): Promise<any> {
  return {
    totalUsers: 50284,
    active24h: 12458,
    active7d: 32584,
    newToday: 847,
    premiumUsers: 8452,
    retentionRate: 68.5,

    totalDeposits: 2458742,
    totalWithdrawals: 1847256,
    dailyVolume: 124587,
    platformBalance: 612486,
    avgDeposit: 245.5,
    avgWithdrawal: 187.25,

    activeMiners: 35847,
    totalHashRate: 4.5 * 10 ** 15, // 4.5 PH/s
    dailyRewards: 125847,
    totalRewards: 2158742,
    avgMining: 12.45,

    totalReferrals: 125847,
    activeReferrals: 84572,
    referralEarnings: 284756,
    topReferrer: 245,

    uptime: 0.9995,
    avgResponseTime: 145,
    errorRate: 0.15,
    userSatisfaction: 4.7,

    lastUpdated: Date.now() - 3600000, // 1 hour ago
  };
}
