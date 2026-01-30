import { InlineKeyboard } from "grammy";
import { config } from "../config";

export const MainMenu = {
  // ==========================================================================
  // Main Navigation Menus
  // ==========================================================================

  welcome() {
    return new InlineKeyboard()
      .webApp("🚀 Launch App", config.webAppUrl)
      .row()
      .text("📊 Dashboard", "menu_dashboard")
      .text("💰 Wallet", "menu_wallet")
      .row()
      .text("⛏️ Mining", "menu_mining")
      .text("👥 Referral", "menu_referral")
      .row()
      .text("🆘 Help", "menu_help")
      .text("⚙️ Settings", "menu_settings");
  },

  dashboard() {
    return new InlineKeyboard()
      .webApp("📊 Full Dashboard", `${config.webAppUrl}/dashboard`)
      .row()
      .text("⛏️ Start Mining", "mining_start")
      .text("💰 Quick Deposit", "action_deposit")
      .row()
      .text("📈 Live Stats", "mining_stats")
      .text("⚡ Boost", "action_boost")
      .row()
      .text("🎯 Missions", "action_missions")
      .text("🔄 Refresh", "dashboard_refresh")
      .row()
      .text("📥 Export Data", "dashboard_export")
      .text("🔙 Main Menu", "menu_main");
  },

  // Complete wallet management menu
  wallet() {
    return new InlineKeyboard()
      .webApp("💰 Full Wallet", `${config.webAppUrl}/wallet`)
      .row()
      .text("💸 Withdraw", "wallet_withdraw")
      .text("💰 Deposit", "wallet_deposit")
      .row()
      .text("🔒 Stake", "wallet_stake")
      .text("💱 Convert", "wallet_convert")
      .row()
      .text("📜 History", "wallet_history")
      .text("📈 Analytics", "wallet_analytics")
      .row()
      .text("🔐 Security", "wallet_security")
      .text("🧮 Calculator", "wallet_calc")
      .row()
      .text("🔙 Main Menu", "menu_main");
  },

  // Mining control menu
  mining() {
    return new InlineKeyboard()
      .webApp("⛏️ Mining Hub", `${config.webAppUrl}/mining`)
      .row()
      .text("▶️ Start", "mining_start")
      .text("⏸️ Stop", "mining_stop")
      .row()
      .text("⚡ Boost", "mining_boost")
      .text("📊 Stats", "mining_stats")
      .row()
      .text("⚙️ Configure", "mining_config")
      .text("🏊 Pool", "mining_pool")
      .row()
      .text("💡 How It Works", "mining_how")
      .text("🔙 Main Menu", "menu_main");
  },

  // Comprehensive referral menu
  referral(userId: number) {
    return new InlineKeyboard()
      .url(
        "📱 Share with Friends",
        `https://t.me/share/url?url=https://t.me/${config.botUsername}?start=ref_${userId}&text=${encodeURIComponent("🤝 Cashimine Invitation\n\nHi! I wanted to share Cashimine with you. I've been using it to learn about crypto earnings and find it to be a genuine platform for beginners.\n\n📊 Highlights:\n• Educational crypto tasks\n• Transparent earning system\n• Simple to get started\n\nIf you're curious about crypto, you might enjoy checking it out:")}`
      )
      .row()
      .text("📊 My Stats", "referral_stats")
      .text("🏆 Tiers", "referral_tiers")
      .row()
      .text("🎁 Rewards", "referral_rewards")
      .text("📈 Leaderboard", "referral_leaderboard")
      .row()
      .text("🔗 Copy Link", "referral_copy")
      .text("📣 Share Options", "referral_share")
      .row()
      .text("📧 Email Friends", "referral_email")
      .text("🌐 Social Media", "referral_social")
      .row()
      .text("🔙 Main Menu", "menu_main");
  },

  // Enhanced help menu
  help() {
    return new InlineKeyboard()
      .webApp("🌐 Help Center", `${config.webAppUrl}/help`)
      .row()
      .text("📖 Tutorial", "help_tutorial")
      .text("🚀 Quick Start", "help_quickstart")
      .row()
      .text("❓ FAQ", "support_faq")
      .text("🔧 Troubleshoot", "help_troubleshoot")
      .row()
      .text("📞 Contact", "support_contact")
      .text("📡 Status", "support_status")
      .row()
      .text("📝 Feedback", "support_feedback")
      .text("📖 Glossary", "help_glossary")
      .row()
      .text("🔙 Main Menu", "menu_main");
  },

  // Settings menu
  settings() {
    return new InlineKeyboard()
      .webApp("⚙️ Full Settings", `${config.webAppUrl}/settings`)
      .row()
      .text("👤 Profile", "settings_profile")
      .text("🔔 Notifications", "settings_notifications")
      .row()
      .text("🔐 Security", "settings_security")
      .text("🛡️ Privacy", "settings_privacy")
      .row()
      .text("🌐 Language", "settings_language")
      .text("🎨 Theme", "settings_theme")
      .row()
      .text("📊 Display", "settings_display")
      .text("🔕 Mute", "settings_mute")
      .row()
      .text("🔙 Main Menu", "menu_main");
  },

  // ==========================================================================
  // Specialized Action Menus
  // ==========================================================================

  // Withdrawal options menu
  withdraw() {
    return new InlineKeyboard()
      .webApp("💸 Withdraw Now", `${config.webAppUrl}/withdraw`)
      .row()
      .text("🏦 Bank Transfer", "withdraw_bank")
      .text("₿ Bitcoin", "withdraw_btc")
      .row()
      .text("Ξ Ethereum", "withdraw_eth")
      .text("💎 USDT", "withdraw_usdt")
      .row()
      .text("📊 Calculator", "wallet_withdraw_calc")
      .text("ℹ️ Fees", "wallet_withdraw_fees")
      .row()
      .text("📈 Limits", "withdraw_limits")
      .text("⏱️ History", "withdraw_history")
      .row()
      .text("🔙 Wallet", "menu_wallet");
  },

  // Deposit options menu
  deposit() {
    return new InlineKeyboard()
      .webApp("💰 Deposit Now", `${config.webAppUrl}/deposit`)
      .row()
      .text("💳 Card", "deposit_card")
      .text("🏦 Bank", "deposit_bank")
      .row()
      .text("₿ Bitcoin", "deposit_btc")
      .text("Ξ Ethereum", "deposit_eth")
      .row()
      .text("💎 USDT", "deposit_usdt")
      .text("📊 Calculator", "wallet_deposit_calc")
      .row()
      .text("📈 Projections", "wallet_deposit_projections")
      .text("🎁 Bonuses", "deposit_bonuses")
      .row()
      .text("🔙 Wallet", "menu_wallet");
  },

  // Staking options menu
  staking() {
    return new InlineKeyboard()
      .webApp("🔒 Stake Now", `${config.webAppUrl}/staking`)
      .row()
      .text("🥉 Bronze", "stake_bronze")
      .text("🥈 Silver", "stake_silver")
      .row()
      .text("🥇 Gold", "stake_gold")
      .text("💎 Diamond", "stake_diamond")
      .row()
      .text("🧮 Calculator", "wallet_stake_calc")
      .text("📊 Compare", "wallet_stake_compare")
      .row()
      .text("📈 Returns", "stake_returns")
      .text("⏳ Unstake", "stake_unstake")
      .row()
      .text("🔙 Wallet", "menu_wallet");
  },

  // Mining boost menu
  boost() {
    return new InlineKeyboard()
      .webApp("⚡ Buy Boost", `${config.webAppUrl}/mining/boost`)
      .row()
      .text("🚀 2x Boost", "boost_2x")
      .text("🚀 3x Boost", "boost_3x")
      .row()
      .text("🚀 5x Boost", "boost_5x")
      .text("🚀 10x Boost", "boost_10x")
      .row()
      .text("📊 Calculator", "mining_boost_calc")
      .text("⏱️ Duration", "boost_duration")
      .row()
      .text("💰 Cost", "boost_cost")
      .text("🎁 Promo", "boost_promo")
      .row()
      .text("🔙 Mining", "menu_mining");
  },

  // Support contact menu
  contact() {
    return new InlineKeyboard()
      .url("📧 Email", "mailto:support@cashimine.com")
      .url("💬 Live Chat", `${config.webAppUrl}/support/chat`)
      .row()
      .url("📱 Telegram", "https://t.me/cashimine_support")
      .url("🐦 Twitter", "https://twitter.com/cashimine_help")
      .row()
      .text("📞 Callback", "support_callback")
      .text("📝 Ticket", "support_ticket")
      .row()
      .text("🏢 Office", "support_office")
      .text("👥 Community", "support_community")
      .row()
      .text("🔙 Help", "menu_help");
  },

  // Tutorial/learning menu
  tutorial() {
    return new InlineKeyboard()
      .webApp("📚 Learn Hub", `${config.webAppUrl}/learn`)
      .row()
      .text("🎬 Video Guide", "tutorial_video")
      .text("📖 Step-by-Step", "tutorial_steps")
      .row()
      .text("❓ Common Questions", "tutorial_faq")
      .text("⚡ Tips & Tricks", "tutorial_tips")
      .row()
      .text("📊 Best Practices", "tutorial_best")
      .text("⚠️ Avoid Mistakes", "tutorial_mistakes")
      .row()
      .text("📈 Advanced", "tutorial_advanced")
      .text("🎓 Certification", "tutorial_cert")
      .row()
      .text("🔙 Help", "menu_help");
  },

  // ==========================================================================
  // Admin Menus (Only for administrators)
  // ==========================================================================

  // Main admin panel
  admin() {
    return new InlineKeyboard()
      .text("📊 Statistics", "admin_stats")
      .text("👥 Users", "admin_users")
      .row()
      .text("💰 Transactions", "admin_tx")
      .text("⛏️ Mining", "admin_mining")
      .row()
      .text("🛠️ Maintenance", "admin_maintenance")
      .text("🔐 Security", "admin_security")
      .row()
      .text("📢 Broadcast", "admin_broadcast")
      .text("💾 Backup", "admin_backup")
      .row()
      .text("📈 Analytics", "admin_analytics")
      .text("⚙️ Settings", "admin_settings")
      .row()
      .text("🚨 Alerts", "admin_alerts")
      .text("📋 Logs", "admin_logs")
      .row()
      .text("🔙 Main Menu", "menu_main");
  },

  // Admin statistics submenu
  adminStats() {
    return new InlineKeyboard()
      .text("📈 User Growth", "admin_stats_users")
      .text("💰 Revenue", "admin_stats_revenue")
      .row()
      .text("⛏️ Mining Stats", "admin_stats_mining")
      .text("👥 Referrals", "admin_stats_referrals")
      .row()
      .text("📊 Performance", "admin_stats_perf")
      .text("🌍 Geographic", "admin_stats_geo")
      .row()
      .text("📅 Daily", "admin_stats_daily")
      .text("📅 Weekly", "admin_stats_weekly")
      .row()
      .text("📅 Monthly", "admin_stats_monthly")
      .text("📤 Export", "admin_stats_export")
      .row()
      .text("🔙 Admin Panel", "menu_admin");
  },

  // User management menu
  adminUsers() {
    return new InlineKeyboard()
      .text("👤 Search User", "admin_user_search")
      .text("📊 User Details", "admin_user_details")
      .row()
      .text("🔧 Edit User", "admin_user_edit")
      .text("🚫 Ban User", "admin_user_ban")
      .row()
      .text("✅ Unban User", "admin_user_unban")
      .text("📧 Message User", "admin_user_message")
      .row()
      .text("👑 Make Admin", "admin_user_makeadmin")
      .text("👤 Remove Admin", "admin_user_removeadmin")
      .row()
      .text("💰 Adjust Balance", "admin_user_balance")
      .text("🎁 Give Bonus", "admin_user_bonus")
      .row()
      .text("🔙 Admin Panel", "menu_admin");
  },

  // Maintenance control menu
  adminMaintenance() {
    return new InlineKeyboard()
      .text("🛠️ Enable", "admin_maintenance_enable")
      .text("✅ Disable", "admin_maintenance_disable")
      .row()
      .text("⏱️ Schedule", "admin_maintenance_schedule")
      .text("📢 Notify", "admin_maintenance_notify")
      .row()
      .text("🔄 Restart", "admin_maintenance_restart")
      .text("📊 Status", "admin_maintenance_status")
      .row()
      .text("🔙 Admin Panel", "menu_admin");
  },

  // ==========================================================================
  // Quick Action Menus (For specific contexts)
  // ==========================================================================

  // Quick actions for fast access
  quickActions() {
    return new InlineKeyboard()
      .text("⛏️ Mine Now", "mining_start")
      .text("💰 Check Balance", "wallet_balance")
      .row()
      .text("💸 Quick Withdraw", "action_withdraw")
      .text("💰 Quick Deposit", "action_deposit")
      .row()
      .text("👥 Invite Friend", "referral_share")
      .text("📊 View Stats", "action_stats")
      .row()
      .text("🆘 Get Help", "menu_help")
      .text("⚙️ Settings", "menu_settings");
  },

  // Transaction history filters
  historyFilters() {
    return new InlineKeyboard()
      .text("📅 Today", "history_today")
      .text("📅 Week", "history_week")
      .row()
      .text("📅 Month", "history_month")
      .text("📅 All", "history_all")
      .row()
      .text("⛏️ Mining", "history_mining")
      .text("👥 Referral", "history_referral")
      .row()
      .text("💸 Withdrawal", "history_withdrawal")
      .text("💰 Deposit", "history_deposit")
      .row()
      .text("📤 Export", "history_export")
      .text("🔙 Wallet", "menu_wallet");
  },

  // Notification settings
  notificationSettings() {
    return new InlineKeyboard()
      .text("🔔 All", "notify_all")
      .text("🔕 None", "notify_none")
      .row()
      .text("💰 Earnings", "notify_earnings")
      .text("💸 Withdrawals", "notify_withdrawals")
      .row()
      .text("👥 Referrals", "notify_referrals")
      .text("🎯 Missions", "notify_missions")
      .row()
      .text("📢 Announcements", "notify_announcements")
      .text("⚠️ System", "notify_system")
      .row()
      .text("📱 Push", "notify_push")
      .text("📧 Email", "notify_email")
      .row()
      .text("💬 Telegram", "notify_telegram")
      .text("🔙 Settings", "menu_settings");
  },

  // Security settings
  securitySettings() {
    return new InlineKeyboard()
      .text("🔐 Enable 2FA", "security_2fa_enable")
      .text("🔓 Disable 2FA", "security_2fa_disable")
      .row()
      .text("🔑 Change Password", "security_password")
      .text("📧 Email Verify", "security_email")
      .row()
      .text("📱 Device Management", "security_devices")
      .text("📋 Session Log", "security_sessions")
      .row()
      .text("🚫 IP Whitelist", "security_ip")
      .text("⚠️ Activity Alerts", "security_alerts")
      .row()
      .text("🔒 Withdrawal Lock", "security_withdrawal")
      .text("🏦 Cold Wallet", "security_coldwallet")
      .row()
      .text("🔙 Settings", "menu_settings");
  },

  // ==========================================================================
  // Utility Functions
  // ==========================================================================

  // Back navigation helper
  backTo(menu: string) {
    return new InlineKeyboard().text("🔙 Back", `menu_${menu}`);
  },

  // Confirmation dialog
  confirm(action: string, id?: string | number) {
    const key = id ? `${action}_${id}` : action;
    return new InlineKeyboard()
      .text("✅ Confirm", `confirm_${key}_yes`)
      .text("❌ Cancel", `confirm_${key}_no`);
  },

  // Pagination controls
  pagination(page: number, totalPages: number, action: string) {
    const keyboard = new InlineKeyboard();

    if (page > 1) {
      keyboard.text("⬅️ Previous", `${action}_page_${page - 1}`);
    }

    keyboard.text(`📄 ${page}/${totalPages}`, `${action}_current`);

    if (page < totalPages) {
      keyboard.text("Next ➡️", `${action}_page_${page + 1}`);
    }

    keyboard.row().text("🔙 Back", `${action}_back`);

    return keyboard;
  },

  // Selection menu (e.g., choose cryptocurrency)
  selection(items: Array<{ label: string; value: string }>, action: string) {
    const keyboard = new InlineKeyboard();

    items.forEach((item, index) => {
      if (index % 2 === 0 && index > 0) {
        keyboard.row();
      }
      keyboard.text(item.label, `${action}_${item.value}`);
    });

    keyboard.row().text("🔙 Cancel", `${action}_cancel`);

    return keyboard;
  },

  // Quick numeric input (e.g., amount selection)
  numericInput(action: string) {
    return new InlineKeyboard()
      .text("1", `${action}_1`)
      .text("2", `${action}_2`)
      .text("3", `${action}_3`)
      .row()
      .text("4", `${action}_4`)
      .text("5", `${action}_5`)
      .text("6", `${action}_6`)
      .row()
      .text("7", `${action}_7`)
      .text("8", `${action}_8`)
      .text("9", `${action}_9`)
      .row()
      .text(".", `${action}_dot`)
      .text("0", `${action}_0`)
      .text("⌫", `${action}_backspace`)
      .row()
      .text("✅ Confirm", `${action}_confirm`)
      .text("❌ Clear", `${action}_clear`)
      .row()
      .text("🔙 Cancel", `${action}_cancel`);
  },

  // Language selection
  languageSelection() {
    return new InlineKeyboard()
      .text("🇺🇸 English", "language_en")
      .text("🇪🇸 Español", "language_es")
      .row()
      .text("🇫🇷 Français", "language_fr")
      .text("🇩🇪 Deutsch", "language_de")
      .row()
      .text("🇷🇺 Русский", "language_ru")
      .text("🇨🇳 中文", "language_zh")
      .row()
      .text("🇯🇵 日本語", "language_ja")
      .text("🇰🇷 한국어", "language_ko")
      .row()
      .text("🔙 Settings", "menu_settings");
  },

  // Theme selection
  themeSelection() {
    return new InlineKeyboard()
      .text("🌞 Light", "theme_light")
      .text("🌙 Dark", "theme_dark")
      .row()
      .text("🌓 Auto", "theme_auto")
      .text("🎨 Custom", "theme_custom")
      .row()
      .text("🔙 Settings", "menu_settings");
  },
};

// ============================================================================
// Type definitions for better TypeScript support
// ============================================================================

export type MenuType = keyof typeof MainMenu;

export interface MenuItem {
  label: string;
  callback: string;
  row?: boolean;
}

export interface MenuConfig {
  title: string;
  items: MenuItem[];
  backTo?: string;
}
