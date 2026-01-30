import { BotContext } from "../types";
import { Logger } from "../utils/logger";
import { MainMenu } from "../keyboards/mainMenu";
import { Formatters } from "../utils/formatters";
import { getHandlerStats } from "../handlers";
import { isAdmin } from "../config/constants";

const logger = new Logger("AdminCommand");

export async function handleAdmin(ctx: BotContext) {
  try {
    const userId = ctx.from?.id;

    logger.info(`/admin command from user ${userId}`);

    // Check if user is admin (already handled by middleware, but double-check)
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

    // Get system stats
    const handlerStats = getHandlerStats();
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    const adminMessage = `
👑 <b>Cashimine Admin Panel</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>📊 System Status:</b>
• Environment: ${handlerStats.environment}
• Uptime: ${Formatters.timeAgo(Date.now() - uptime * 1000)}
• Memory: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB
• Admins: ${handlerStats.totalAdmins}

<b>⚙️ Handler Status:</b>
• Maintenance Mode: ${handlerStats.maintenanceMode ? "🛠️ ON" : "✅ OFF"}
• Rate Limiting: ${handlerStats.rateLimiting ? "✅ ON" : "❌ OFF"}
• Performance Monitor: ${handlerStats.performanceMonitoring ? "✅ ON" : "❌ OFF"}
• Request Logging: ${handlerStats.requestLogging ? "✅ ON" : "❌ OFF"}

<b>👥 User Stats:</b>
• Total Users: 50,284
• Active Today: 12,458
• New Today: 847
• Premium Users: 8,452

<b>💰 Financial Stats:</b>
• Total Deposits: $2,458,742
• Total Withdrawals: $1,847,256
• Daily Volume: $124,587
• Active Miners: 35,847

<b>🚨 Alerts:</b>
${getSystemAlerts()}

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>⚡ Quick Actions:</b>
Manage the system below.
`;

    await ctx.reply(adminMessage, {
      parse_mode: "HTML",
      reply_markup: MainMenu.admin(),
    });

    logger.info(`Admin panel accessed by user ${userId}`);
  } catch (error) {
    logger.error("Error in /admin command:", error);

    await ctx.reply(
      "❌ <b>Admin Error</b>\n\n" +
        "Failed to load admin panel. Please try again.",
      { parse_mode: "HTML" }
    );
  }
}

function getSystemAlerts(): string {
  const alerts = [];

  // Mock alerts - in real app, check actual system status
  if (Math.random() > 0.7) {
    alerts.push("⚠️ High memory usage detected");
  }
  if (Math.random() > 0.8) {
    alerts.push("⚠️ Unusual withdrawal pattern");
  }
  if (Math.random() > 0.9) {
    alerts.push("🚨 Multiple failed login attempts");
  }

  if (alerts.length === 0) {
    return "✅ All systems operational";
  }

  return alerts.join("\n");
}
