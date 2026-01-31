import { InlineKeyboard } from "grammy";
import { config } from "../config";

export const MainMenu = {
  // ==========================================================================
  // Main Navigation Menus
  // ==========================================================================

  welcome() {
    return new InlineKeyboard()
      .webApp("🚀 Otwórz aplikację", config.webAppUrl)
      .row()
      .text("📊 Panel", "menu_dashboard")
      .text("💰 Portfel", "menu_wallet")
      .row()
      .text("💱 Wymiana", "menu_exchange")
      .text("🥇 Inwestycje", "menu_investments")
      .row()
      .text("📍 Kantory", "menu_branches")
      .text("👥 Polecenia", "menu_referral")
      .row()
      .text("🆘 Pomoc", "menu_help")
      .text("⚙️ Ustawienia", "menu_settings");
  },

  dashboard() {
    return new InlineKeyboard()
      .webApp("📊 Pełny panel", `${config.webAppUrl}/dashboard`)
      .row()
      .text("💱 Wymień teraz", "exchange_quick")
      .text("📈 Kursy", "rates_current")
      .row()
      .text("📜 Historia", "transactions_recent")
      .text("🏆 Poziom konta", "account_tier")
      .row()
      .text("💼 Oferta B2B", "b2b_info")
      .text("🔄 Odśwież", "dashboard_refresh")
      .row()
      .text("📥 Eksport danych", "dashboard_export")
      .text("🔙 Menu główne", "menu_main");
  },

  // Wallet management menu
  wallet() {
    return new InlineKeyboard()
      .webApp("💰 Pełny portfel", `${config.webAppUrl}/wallet`)
      .row()
      .text("💸 Wypłać", "wallet_withdraw")
      .text("💰 Wpłać", "wallet_deposit")
      .row()
      .text("📊 Salda", "wallet_balances")
      .text("📜 Historia", "wallet_history")
      .row()
      .text("🔄 Transfer", "wallet_transfer")
      .text("🧮 Kalkulator", "wallet_calculator")
      .row()
      .text("🔐 Zabezpieczenia", "wallet_security")
      .text("🔙 Menu główne", "menu_main");
  },

  // Exchange menu
  exchange() {
    return new InlineKeyboard()
      .webApp("💱 Pełna wymiana", `${config.webAppUrl}/exchange`)
      .row()
      .text("₿ Krypto → PLN", "exchange_crypto_to_pln")
      .text("💵 PLN → Krypto", "exchange_pln_to_crypto")
      .row()
      .text("🔄 Krypto ↔ Krypto", "exchange_crypto_to_crypto")
      .text("💶 PLN ↔ EUR", "exchange_fiat")
      .row()
      .text("📈 Kursy na żywo", "rates_live")
      .text("🧮 Kalkulator", "exchange_calculator")
      .row()
      .text("📍 Rezerwuj w kantorze", "exchange_reserve")
      .text("💡 Jak wymienić", "exchange_how")
      .row()
      .text("🔙 Menu główne", "menu_main");
  },

  // Investments menu (precious metals + staking)
  investments() {
    return new InlineKeyboard()
      .webApp("🥇 Hub inwestycji", `${config.webAppUrl}/investments`)
      .row()
      .text("🥇 Złoto", "invest_gold")
      .text("🥈 Srebro", "invest_silver")
      .row()
      .text("🔒 Staking", "invest_staking")
      .text("📊 Portfel", "invest_portfolio")
      .row()
      .text("📈 Analiza rynku", "invest_analysis")
      .text("💡 Porady", "invest_tips")
      .row()
      .text("🔙 Menu główne", "menu_main");
  },

  // Branches/locations menu
  branches() {
    return new InlineKeyboard()
      .webApp("🗺️ Mapa kantorów", `${config.webAppUrl}/branches`)
      .row()
      .text("📍 Warszawa", "branches_warsaw")
      .text("📍 Kraków", "branches_krakow")
      .row()
      .text("📍 Wrocław", "branches_wroclaw")
      .text("📍 Poznań", "branches_poznan")
      .row()
      .text("📍 Gdańsk", "branches_gdansk")
      .text("📍 Inne miasta", "branches_other")
      .row()
      .text("📅 Rezerwacja", "branches_reserve")
      .text("⏰ Godziny otwarcia", "branches_hours")
      .row()
      .text("🔙 Menu główne", "menu_main");
  },

  // Referral menu
  referral(userId: number) {
    return new InlineKeyboard()
      .url(
        "📱 Udostępnij znajomym",
        `https://t.me/share/url?url=https://t.me/${config.botUsername}?start=ref_${userId}&text=${encodeURIComponent(
          "🎉 Zaproszenie do CashyMine\n\n" +
            "Cześć! Chciałem podzielić się z Tobą CashyMine - bezpieczną siecią kantorów kryptowalut i metali szlachetnych w Polsce.\n\n" +
            "📊 Najważniejsze:\n" +
            "• Licencjonowany podmiot\n" +
            "• 12+ kantorów w Polsce\n" +
            "• Najlepsze kursy wymiany\n" +
            "• Inwestycje w złoto i srebro\n\n" +
            "Jeśli interesujesz się kryptowalutami, sprawdź:"
        )}`
      )
      .row()
      .text("📊 Moje statystyki", "referral_stats")
      .text("🏆 Poziomy", "referral_tiers")
      .row()
      .text("🎁 Nagrody", "referral_rewards")
      .text("📈 Ranking", "referral_leaderboard")
      .row()
      .text("🔗 Kopiuj link", "referral_copy")
      .text("📣 Opcje udostępniania", "referral_share")
      .row()
      .text("🔙 Menu główne", "menu_main");
  },

  // Help menu
  help() {
    return new InlineKeyboard()
      .webApp("🌐 Centrum pomocy", `${config.webAppUrl}/help`)
      .row()
      .text("📖 Samouczek", "help_tutorial")
      .text("🚀 Szybki start", "help_quickstart")
      .row()
      .text("❓ FAQ", "help_faq")
      .text("🔧 Rozwiązywanie problemów", "help_troubleshoot")
      .row()
      .text("📞 Kontakt", "support_contact")
      .text("📡 Status systemu", "support_status")
      .row()
      .text("📝 Opinia", "support_feedback")
      .text("📖 Słownik", "help_glossary")
      .row()
      .text("🔙 Menu główne", "menu_main");
  },

  // Settings menu
  settings() {
    return new InlineKeyboard()
      .webApp("⚙️ Pełne ustawienia", `${config.webAppUrl}/settings`)
      .row()
      .text("👤 Profil", "settings_profile")
      .text("🔔 Powiadomienia", "settings_notifications")
      .row()
      .text("🔐 Bezpieczeństwo", "settings_security")
      .text("🛡️ Prywatność", "settings_privacy")
      .row()
      .text("🌐 Język", "settings_language")
      .text("🎨 Motyw", "settings_theme")
      .row()
      .text("📊 Wyświetlanie", "settings_display")
      .text("🔕 Wycisz", "settings_mute")
      .row()
      .text("🔙 Menu główne", "menu_main");
  },

  // ==========================================================================
  // Specialized Action Menus
  // ==========================================================================

  // Withdrawal options menu
  withdraw() {
    return new InlineKeyboard()
      .webApp("💸 Wypłać teraz", `${config.webAppUrl}/withdraw`)
      .row()
      .text("🏦 Przelew bankowy", "withdraw_bank")
      .text("₿ Bitcoin", "withdraw_btc")
      .row()
      .text("Ξ Ethereum", "withdraw_eth")
      .text("💎 USDT", "withdraw_usdt")
      .row()
      .text("🧮 Kalkulator", "withdraw_calculator")
      .text("ℹ️ Opłaty", "withdraw_fees")
      .row()
      .text("📈 Limity", "withdraw_limits")
      .text("⏱️ Historia", "withdraw_history")
      .row()
      .text("🔙 Portfel", "menu_wallet");
  },

  // Deposit options menu
  deposit() {
    return new InlineKeyboard()
      .webApp("💰 Wpłać teraz", `${config.webAppUrl}/deposit`)
      .row()
      .text("💳 Karta", "deposit_card")
      .text("🏦 Przelew", "deposit_bank")
      .row()
      .text("₿ Bitcoin", "deposit_btc")
      .text("Ξ Ethereum", "deposit_eth")
      .row()
      .text("💎 USDT", "deposit_usdt")
      .text("🧮 Kalkulator", "deposit_calculator")
      .row()
      .text("📈 Projekcje", "deposit_projections")
      .text("🎁 Bonusy", "deposit_bonuses")
      .row()
      .text("🔙 Portfel", "menu_wallet");
  },

  // Staking options menu
  staking() {
    return new InlineKeyboard()
      .webApp("🔒 Program oszczędnościowy", `${config.webAppUrl}/staking`)
      .row()
      .text("🥉 Brązowy (30 dni)", "stake_bronze")
      .text("🥈 Srebrny (90 dni)", "stake_silver")
      .row()
      .text("🥇 Złoty (180 dni)", "stake_gold")
      .text("💎 Diamentowy (365 dni)", "stake_diamond")
      .row()
      .text("🧮 Kalkulator", "stake_calculator")
      .text("📊 Porównaj", "stake_compare")
      .row()
      .text("📈 Zwroty", "stake_returns")
      .text("⏳ Wypłać", "stake_unstake")
      .row()
      .text("🔙 Inwestycje", "menu_investments");
  },

  // Gold investment menu
  goldInvestment() {
    return new InlineKeyboard()
      .webApp("🥇 Kup złoto", `${config.webAppUrl}/gold`)
      .row()
      .text("📊 Sztabki", "gold_bars")
      .text("🪙 Monety", "gold_coins")
      .row()
      .text("📈 Aktualne ceny", "gold_prices")
      .text("🧮 Kalkulator", "gold_calculator")
      .row()
      .text("📦 Odbiór/Dostawa", "gold_delivery")
      .text("🔒 Przechowanie", "gold_storage")
      .row()
      .text("💡 Dlaczego złoto?", "gold_why")
      .text("🔙 Inwestycje", "menu_investments");
  },

  // Silver investment menu
  silverInvestment() {
    return new InlineKeyboard()
      .webApp("🥈 Kup srebro", `${config.webAppUrl}/silver`)
      .row()
      .text("📊 Sztabki", "silver_bars")
      .text("🪙 Monety", "silver_coins")
      .row()
      .text("📈 Aktualne ceny", "silver_prices")
      .text("🧮 Kalkulator", "silver_calculator")
      .row()
      .text("📦 Odbiór/Dostawa", "silver_delivery")
      .text("🔒 Przechowanie", "silver_storage")
      .row()
      .text("💡 Dlaczego srebro?", "silver_why")
      .text("🔙 Inwestycje", "menu_investments");
  },

  // Exchange rates menu
  rates() {
    return new InlineKeyboard()
      .webApp("📊 Pełna tabela kursów", `${config.webAppUrl}/rates`)
      .row()
      .text("₿ Bitcoin", "rate_btc")
      .text("Ξ Ethereum", "rate_eth")
      .row()
      .text("💎 USDT", "rate_usdt")
      .text("💰 Inne krypto", "rate_others")
      .row()
      .text("🥇 Złoto", "rate_gold")
      .text("🥈 Srebro", "rate_silver")
      .row()
      .text("📈 Wykresy", "rates_charts")
      .text("🔔 Alerty cenowe", "rates_alerts")
      .row()
      .text("🔄 Odśwież", "rates_refresh")
      .text("🔙 Menu główne", "menu_main");
  },

  // Support contact menu
  contact() {
    return new InlineKeyboard()
      .url("📧 Email", "mailto:kontakt@cashymine.pl")
      .url("💬 Czat na żywo", `${config.webAppUrl}/support/chat`)
      .row()
      .url("📱 Telegram", "https://t.me/cashymine_support")
      .url("🐦 Twitter", "https://twitter.com/cashymine")
      .row()
      .text("📞 Oddzwonienie", "support_callback")
      .text("📝 Zgłoszenie", "support_ticket")
      .row()
      .text("🏢 Biuro", "support_office")
      .text("👥 Społeczność", "support_community")
      .row()
      .text("🔙 Pomoc", "menu_help");
  },

  // Tutorial/learning menu
  tutorial() {
    return new InlineKeyboard()
      .webApp("📚 Centrum edukacji", `${config.webAppUrl}/learn`)
      .row()
      .text("🎬 Poradnik wideo", "tutorial_video")
      .text("📖 Krok po kroku", "tutorial_steps")
      .row()
      .text("❓ Częste pytania", "tutorial_faq")
      .text("⚡ Wskazówki", "tutorial_tips")
      .row()
      .text("📊 Najlepsze praktyki", "tutorial_best")
      .text("⚠️ Unikaj błędów", "tutorial_mistakes")
      .row()
      .text("📈 Zaawansowane", "tutorial_advanced")
      .text("🎓 Certyfikat", "tutorial_cert")
      .row()
      .text("🔙 Pomoc", "menu_help");
  },

  // ==========================================================================
  // Admin Menus (Only for administrators)
  // ==========================================================================

  // Main admin panel
  admin() {
    return new InlineKeyboard()
      .text("📊 Statystyki", "admin_stats")
      .text("👥 Użytkownicy", "admin_users")
      .row()
      .text("💰 Transakcje", "admin_transactions")
      .text("💱 Wymiany", "admin_exchanges")
      .row()
      .text("🛠️ Konserwacja", "admin_maintenance")
      .text("🔐 Bezpieczeństwo", "admin_security")
      .row()
      .text("📢 Ogłoszenie", "admin_broadcast")
      .text("💾 Kopia zapasowa", "admin_backup")
      .row()
      .text("📈 Analityka", "admin_analytics")
      .text("⚙️ Ustawienia", "admin_settings")
      .row()
      .text("🚨 Alerty", "admin_alerts")
      .text("📋 Logi", "admin_logs")
      .row()
      .text("🔙 Menu główne", "menu_main");
  },

  // Admin statistics submenu
  adminStats() {
    return new InlineKeyboard()
      .text("📈 Wzrost użytkowników", "admin_stats_users")
      .text("💰 Przychody", "admin_stats_revenue")
      .row()
      .text("💱 Statystyki wymian", "admin_stats_exchanges")
      .text("👥 Polecenia", "admin_stats_referrals")
      .row()
      .text("📊 Wydajność", "admin_stats_performance")
      .text("🌍 Geografia", "admin_stats_geo")
      .row()
      .text("📅 Dziennie", "admin_stats_daily")
      .text("📅 Tygodniowo", "admin_stats_weekly")
      .row()
      .text("📅 Miesięcznie", "admin_stats_monthly")
      .text("📤 Eksport", "admin_stats_export")
      .row()
      .text("🔙 Panel admina", "menu_admin");
  },

  // User management menu
  adminUsers() {
    return new InlineKeyboard()
      .text("👤 Szukaj użytkownika", "admin_user_search")
      .text("📊 Szczegóły", "admin_user_details")
      .row()
      .text("🔧 Edytuj", "admin_user_edit")
      .text("🚫 Zablokuj", "admin_user_ban")
      .row()
      .text("✅ Odblokuj", "admin_user_unban")
      .text("📧 Wiadomość", "admin_user_message")
      .row()
      .text("👑 Nadaj admina", "admin_user_makeadmin")
      .text("👤 Odbierz admina", "admin_user_removeadmin")
      .row()
      .text("💰 Dostosuj saldo", "admin_user_balance")
      .text("🎁 Daj bonus", "admin_user_bonus")
      .row()
      .text("🔙 Panel admina", "menu_admin");
  },

  // Maintenance control menu
  adminMaintenance() {
    return new InlineKeyboard()
      .text("🛠️ Włącz", "admin_maintenance_enable")
      .text("✅ Wyłącz", "admin_maintenance_disable")
      .row()
      .text("⏱️ Zaplanuj", "admin_maintenance_schedule")
      .text("📢 Powiadom", "admin_maintenance_notify")
      .row()
      .text("🔄 Restart", "admin_maintenance_restart")
      .text("📊 Status", "admin_maintenance_status")
      .row()
      .text("🔙 Panel admina", "menu_admin");
  },

  // ==========================================================================
  // Quick Action Menus (For specific contexts)
  // ==========================================================================

  // Quick actions for fast access
  quickActions() {
    return new InlineKeyboard()
      .text("💱 Wymień teraz", "exchange_quick")
      .text("💰 Sprawdź saldo", "wallet_balance")
      .row()
      .text("💸 Szybka wypłata", "action_withdraw")
      .text("💰 Szybka wpłata", "action_deposit")
      .row()
      .text("👥 Zaproś znajomego", "referral_share")
      .text("📊 Zobacz statystyki", "action_stats")
      .row()
      .text("🆘 Pomoc", "menu_help")
      .text("⚙️ Ustawienia", "menu_settings");
  },

  // Transaction history filters
  historyFilters() {
    return new InlineKeyboard()
      .text("📅 Dzisiaj", "history_today")
      .text("📅 Tydzień", "history_week")
      .row()
      .text("📅 Miesiąc", "history_month")
      .text("📅 Wszystko", "history_all")
      .row()
      .text("💱 Wymiany", "history_exchanges")
      .text("👥 Polecenia", "history_referrals")
      .row()
      .text("💸 Wypłaty", "history_withdrawals")
      .text("💰 Wpłaty", "history_deposits")
      .row()
      .text("📤 Eksport", "history_export")
      .text("🔙 Portfel", "menu_wallet");
  },

  // Notification settings
  notificationSettings() {
    return new InlineKeyboard()
      .text("🔔 Wszystkie", "notify_all")
      .text("🔕 Żadne", "notify_none")
      .row()
      .text("💰 Zarobki", "notify_earnings")
      .text("💸 Wypłaty", "notify_withdrawals")
      .row()
      .text("👥 Polecenia", "notify_referrals")
      .text("💱 Wymiany", "notify_exchanges")
      .row()
      .text("📢 Ogłoszenia", "notify_announcements")
      .text("⚠️ System", "notify_system")
      .row()
      .text("📱 Push", "notify_push")
      .text("📧 Email", "notify_email")
      .row()
      .text("💬 Telegram", "notify_telegram")
      .text("🔙 Ustawienia", "menu_settings");
  },

  // Security settings
  securitySettings() {
    return new InlineKeyboard()
      .text("🔐 Włącz 2FA", "security_2fa_enable")
      .text("🔓 Wyłącz 2FA", "security_2fa_disable")
      .row()
      .text("🔑 Zmień hasło", "security_password")
      .text("📧 Weryfikacja email", "security_email")
      .row()
      .text("📱 Zarządzanie urządzeniami", "security_devices")
      .text("📋 Log sesji", "security_sessions")
      .row()
      .text("🚫 Whitelist IP", "security_ip")
      .text("⚠️ Alerty aktywności", "security_alerts")
      .row()
      .text("🔒 Blokada wypłat", "security_withdrawal_lock")
      .text("📋 Whitelist adresów", "security_address_whitelist")
      .row()
      .text("🔙 Ustawienia", "menu_settings");
  },

  // ==========================================================================
  // Utility Functions
  // ==========================================================================

  // Back navigation helper
  backTo(menu: string) {
    return new InlineKeyboard().text("🔙 Powrót", `menu_${menu}`);
  },

  // Confirmation dialog
  confirm(action: string, id?: string | number) {
    const key = id ? `${action}_${id}` : action;
    return new InlineKeyboard()
      .text("✅ Potwierdź", `confirm_${key}_yes`)
      .text("❌ Anuluj", `confirm_${key}_no`);
  },

  // Pagination controls
  pagination(page: number, totalPages: number, action: string) {
    const keyboard = new InlineKeyboard();

    if (page > 1) {
      keyboard.text("⬅️ Poprzednia", `${action}_page_${page - 1}`);
    }

    keyboard.text(`📄 ${page}/${totalPages}`, `${action}_current`);

    if (page < totalPages) {
      keyboard.text("Następna ➡️", `${action}_page_${page + 1}`);
    }

    keyboard.row().text("🔙 Powrót", `${action}_back`);

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

    keyboard.row().text("🔙 Anuluj", `${action}_cancel`);

    return keyboard;
  },

  // Language selection
  languageSelection() {
    return new InlineKeyboard()
      .text("🇵🇱 Polski", "language_pl")
      .text("🇺🇸 English", "language_en")
      .row()
      .text("🇩🇪 Deutsch", "language_de")
      .text("🇪🇸 Español", "language_es")
      .row()
      .text("🇫🇷 Français", "language_fr")
      .text("🇷🇺 Русский", "language_ru")
      .row()
      .text("🔙 Ustawienia", "menu_settings");
  },

  // Theme selection
  themeSelection() {
    return new InlineKeyboard()
      .text("🌞 Jasny", "theme_light")
      .text("🌙 Ciemny", "theme_dark")
      .row()
      .text("🌓 Auto", "theme_auto")
      .text("🎨 Własny", "theme_custom")
      .row()
      .text("🔙 Ustawienia", "menu_settings");
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
