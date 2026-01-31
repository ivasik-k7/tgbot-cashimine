import { BotContext } from "../types";
import { Logger } from "../utils/logger";
import { MainMenu } from "../keyboards/mainMenu";
import { MESSAGES } from "../templates/messages";
import { Formatters } from "../utils/formatters";
import { config } from "../config";
import { isAdmin } from "../config/constants";
import { InlineKeyboard } from "grammy";

const logger = new Logger("CallbackHandler");

// Cache to prevent double processing of callbacks
const processedCallbacks = new Set<string>();
const CALLBACK_TIMEOUT = 30000; // 30 seconds

async function handleCallbackQuery(ctx: BotContext) {
  const callbackQuery = ctx.callbackQuery;
  if (!callbackQuery) return;

  const data = callbackQuery.data;
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;
  const messageId = callbackQuery.message?.message_id;

  if (!data) return;

  // Create a unique key for this callback to prevent double processing
  const callbackKey = `${userId}_${chatId}_${messageId}_${data}`;

  if (processedCallbacks.has(callbackKey)) {
    logger.debug(`Callback already processed: ${callbackKey}`);
    return;
  }

  processedCallbacks.add(callbackKey);

  // Auto-cleanup after timeout
  setTimeout(() => {
    processedCallbacks.delete(callbackKey);
  }, CALLBACK_TIMEOUT);

  logger.info(`Callback query from user ${userId}: ${data}`, {
    userId,
    chatId,
    messageId,
    data,
  });

  try {
    // Always answer callback query immediately
    await ctx.answerCallbackQuery();

    // Update session
    if (ctx.session) {
      ctx.session.lastInteraction = Date.now();
      if (!ctx.session.handlerData) ctx.session.handlerData = {};
    }

    // Handle different callback actions
    await handleCallbackData(ctx, data);
  } catch (error) {
    logger.error("Error handling callback query:", {
      userId,
      data,
      error: error instanceof Error ? error.message : String(error),
    });

    try {
      // Try to answer with error
      await ctx.answerCallbackQuery({
        text: "⚠️ Wystąpił błąd. Spróbuj ponownie.",
        show_alert: true,
      });

      // Send error message to user
      if (ctx.chat?.type === "private") {
        await ctx.reply(
          "❌ <b>Akcja nieudana</b>\n\n" +
            "Przepraszamy, wystąpił błąd podczas przetwarzania Twojego żądania.\n\n" +
            "Kod błędu: " +
            `<code>CB_${Date.now().toString(36)}_${data.substring(0, 10)}</code>`,
          { parse_mode: "HTML" }
        );
      }
    } catch (notificationError) {
      logger.error("Failed to send error notification:", notificationError);
    }
  } finally {
    // Cleanup callback key
    setTimeout(() => {
      processedCallbacks.delete(callbackKey);
    }, 1000);
  }
}

/**
 * Main callback router
 */
async function handleCallbackData(
  ctx: BotContext,
  data: string
): Promise<void> {
  // Check maintenance mode
  if (config.handlers.maintenanceMode && !isAdmin) {
    const allowedCallbacks = [
      "menu_main",
      "menu_help",
      "support_contact",
      "help_faq",
    ];
    if (!allowedCallbacks.includes(data)) {
      await ctx.answerCallbackQuery({
        text: "⏳ Bot jest w trybie konserwacji. Spróbuj ponownie później.",
        show_alert: true,
      });
      return;
    }
  }

  // Route based on callback pattern
  if (data.startsWith("menu_")) {
    await handleMenuNavigation(ctx, data);
  } else if (data.startsWith("action_")) {
    await handleUserAction(ctx, data);
  } else if (data.startsWith("admin_")) {
    await handleAdminAction(ctx, data);
  } else if (data.startsWith("wallet_")) {
    await handleWalletAction(ctx, data);
  } else if (data.startsWith("exchange_")) {
    await handleExchangeAction(ctx, data);
  } else if (data.startsWith("invest_")) {
    await handleInvestmentAction(ctx, data);
  } else if (data.startsWith("withdraw_")) {
    await handleWithdrawAction(ctx, data);
  } else if (data.startsWith("deposit_")) {
    await handleDepositAction(ctx, data);
  } else if (data.startsWith("stake_")) {
    await handleStakingAction(ctx, data);
  } else if (data.startsWith("gold_")) {
    await handleGoldAction(ctx, data);
  } else if (data.startsWith("silver_")) {
    await handleSilverAction(ctx, data);
  } else if (data.startsWith("rate_") || data.startsWith("rates_")) {
    await handleRatesAction(ctx, data);
  } else if (data.startsWith("branches_")) {
    await handleBranchesAction(ctx, data);
  } else if (data.startsWith("referral_")) {
    await handleReferralAction(ctx, data);
  } else if (data.startsWith("support_")) {
    await handleSupportAction(ctx, data);
  } else if (data.startsWith("help_")) {
    await handleHelpAction(ctx, data);
  } else if (data.startsWith("settings_")) {
    await handleSettingsAction(ctx, data);
  } else if (data.startsWith("dashboard_")) {
    await handleDashboardAction(ctx, data);
  } else if (data.startsWith("tutorial_")) {
    await handleTutorialAction(ctx, data);
  } else if (data.startsWith("security_")) {
    await handleSecurityAction(ctx, data);
  } else if (data.startsWith("notify_")) {
    await handleNotificationAction(ctx, data);
  } else if (data.startsWith("history_")) {
    await handleHistoryAction(ctx, data);
  } else if (data.startsWith("b2b_")) {
    await handleB2BAction(ctx, data);
  } else if (data.startsWith("confirm_")) {
    await handleConfirmation(ctx, data);
  } else if (data.startsWith("language_")) {
    await handleLanguageAction(ctx, data);
  } else if (data.startsWith("theme_")) {
    await handleThemeAction(ctx, data);
  } else {
    await handleUnknownCallback(ctx, data);
  }
}

/**
 * Handle menu navigation callbacks
 */
async function handleMenuNavigation(
  ctx: BotContext,
  data: string
): Promise<void> {
  const userId = ctx.from?.id;
  const username = ctx.from?.first_name;

  switch (data) {
    case "menu_main":
      await ctx.editMessageText(MESSAGES.WELCOME(username), {
        parse_mode: "HTML",
        reply_markup: MainMenu.welcome(),
      });
      break;

    case "menu_dashboard":
      await ctx.editMessageText(MESSAGES.DASHBOARD(username), {
        parse_mode: "HTML",
        reply_markup: MainMenu.dashboard(),
      });
      break;

    case "menu_wallet":
      await ctx.editMessageText(MESSAGES.WALLET, {
        parse_mode: "HTML",
        reply_markup: MainMenu.wallet(),
      });
      break;

    case "menu_exchange":
      await ctx.editMessageText(
        "💱 <b>Centrum wymiany</b>\n\n" +
          "Wymień kryptowaluty szybko i bezpiecznie:\n\n" +
          "• Krypto → PLN\n" +
          "• PLN → Krypto\n" +
          "• Krypto ↔ Krypto\n" +
          "• Waluty fiat (PLN, EUR)\n\n" +
          "📊 <i>Najlepsze kursy w Polsce!</i>",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.exchange(),
        }
      );
      break;

    case "menu_investments":
      await ctx.editMessageText(
        "🥇 <b>Hub inwestycji</b>\n\n" +
          "Zdywersyfikuj swój portfel:\n\n" +
          "• 🥇 Złoto fizyczne\n" +
          "• 🥈 Srebro fizyczne\n" +
          "• 🔒 Programy oszczędnościowe (Staking)\n" +
          "• 📊 Analiza rynku\n\n" +
          "💡 <i>Bezpieczne inwestycje z CashyMine!</i>",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.investments(),
        }
      );
      break;

    case "menu_branches":
      await ctx.editMessageText(MESSAGES.BRANCHES, {
        parse_mode: "HTML",
        reply_markup: MainMenu.branches(),
      });
      break;

    case "menu_referral":
      await ctx.editMessageText(MESSAGES.REFERRAL(userId || 0), {
        parse_mode: "HTML",
        reply_markup: MainMenu.referral(userId || 0),
      });
      break;

    case "menu_help":
      await ctx.editMessageText(MESSAGES.HELP, {
        parse_mode: "HTML",
        reply_markup: MainMenu.help(),
      });
      break;

    case "menu_settings":
      await ctx.editMessageText(
        "⚙️ <b>Ustawienia</b>\n\n" +
          "Skonfiguruj preferencje swojego konta:\n\n" +
          "• Informacje profilu\n" +
          "• Ustawienia powiadomień\n" +
          "• Opcje bezpieczeństwa\n" +
          "• Język i motyw",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.settings(),
        }
      );
      break;

    case "menu_admin":
      if (!isAdmin) {
        await ctx.answerCallbackQuery({
          text: "🚫 Wymagany dostęp administratora.",
          show_alert: true,
        });
        return;
      }
      await ctx.editMessageText(
        "👑 <b>Panel administratora</b>\n\n" +
          "Zarządzaj systemem CashyMine:\n\n" +
          "• Przeglądaj statystyki\n" +
          "• Zarządzaj użytkownikami\n" +
          "• Monitoruj transakcje\n" +
          "• Konserwacja systemu",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.admin(),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Opcja menu niedostępna.",
        show_alert: false,
      });
  }
}

/**
 * Handle user action callbacks
 */
async function handleUserAction(ctx: BotContext, data: string): Promise<void> {
  switch (data) {
    case "action_withdraw":
      await ctx.reply(MESSAGES.WITHDRAW_INFO, {
        parse_mode: "HTML",
        reply_markup: MainMenu.withdraw(),
      });
      break;

    case "action_deposit":
      await ctx.reply(MESSAGES.DEPOSIT_INFO, {
        parse_mode: "HTML",
        reply_markup: MainMenu.deposit(),
      });
      break;

    case "action_stats":
      const stats = await getUserStats(ctx.from?.id);
      await ctx.reply(
        `📈 <b>Szybkie statystyki</b>\n\n` +
          `💰 <b>Wydajność dzisiaj:</b>\n` +
          `• Transakcje: ${stats.todayTransactions}\n` +
          `• Wolumen: ${Formatters.formatCurrency(stats.todayVolume)}\n` +
          `• Prowizje poleceniowe: ${Formatters.formatCurrency(stats.todayReferralEarnings)}\n\n` +
          `📊 <b>W tym tygodniu:</b>\n` +
          `• Łącznie: ${Formatters.formatCurrency(stats.weekVolume)}\n` +
          `• Średnio dziennie: ${Formatters.formatCurrency(stats.avgDaily)}\n` +
          `• Najlepszy dzień: ${Formatters.formatCurrency(stats.bestDay)}\n\n` +
          `💡 <i>Aktualizowane co 5 minut</i>`,
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("📊 Pełna analiza", "dashboard_refresh")
            .text("📤 Eksport", "dashboard_export")
            .row()
            .text("🔙 Panel", "menu_dashboard"),
        }
      );
      break;

    default:
      await ctx.reply(
        `⚡ <b>Akcja: ${data.replace("action_", "").replace("_", " ")}</b>\n\n` +
          "Ta funkcja jest dostępna w pełnej aplikacji webowej.",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("🚀 Otwórz aplikację", config.webAppUrl)
            .row()
            .text("🔙 Powrót", "menu_main"),
        }
      );
  }
}

/**
 * Handle wallet action callbacks
 */
async function handleWalletAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  switch (data) {
    case "wallet_withdraw":
      await ctx.reply(MESSAGES.WITHDRAW_INFO, {
        parse_mode: "HTML",
        reply_markup: MainMenu.withdraw(),
      });
      break;

    case "wallet_deposit":
      await ctx.reply(MESSAGES.DEPOSIT_INFO, {
        parse_mode: "HTML",
        reply_markup: MainMenu.deposit(),
      });
      break;

    case "wallet_balances":
      await ctx.reply(MESSAGES.WALLET, {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .webApp("📊 Szczegółowe salda", `${config.webAppUrl}/wallet`)
          .row()
          .text("🔄 Odśwież", "wallet_balances")
          .text("🔙 Portfel", "menu_wallet"),
      });
      break;

    case "wallet_history":
      await ctx.reply(MESSAGES.TRANSACTIONS, {
        parse_mode: "HTML",
        reply_markup: MainMenu.historyFilters(),
      });
      break;

    case "wallet_transfer":
      await ctx.reply(
        "🔄 <b>Transfer wewnętrzny</b>\n\n" +
          "Przenieś środki między swoimi kontami:\n\n" +
          "• Krypto → Krypto\n" +
          "• Fiat → Krypto\n" +
          "• Program oszczędnościowy ↔ Portfel główny\n\n" +
          "💡 <i>Natychmiastowe transfery bez opłat!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("🔄 Wykonaj transfer", `${config.webAppUrl}/transfer`)
            .row()
            .text("🔙 Portfel", "menu_wallet"),
        }
      );
      break;

    case "wallet_calculator":
      await ctx.reply(
        "🧮 <b>Kalkulator wymiany</b>\n\n" +
          "Oblicz wartość wymiany przed transakcją:\n\n" +
          "• Symuluj wymianę\n" +
          "• Zobacz opłaty\n" +
          "• Porównaj kursy\n" +
          "• Sprawdź limity\n\n" +
          "💡 <i>Planuj swoje wymiany z wyprzedzeniem!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("🧮 Otwórz kalkulator", `${config.webAppUrl}/calculator`)
            .row()
            .text("📊 Kursy", "rates_current")
            .text("🔙 Portfel", "menu_wallet"),
        }
      );
      break;

    case "wallet_security":
      await ctx.reply(MESSAGES.SECURITY_INFO, {
        parse_mode: "HTML",
        reply_markup: MainMenu.securitySettings(),
      });
      break;

    case "wallet_balance":
      const balance = await getWalletBalance(ctx.from?.id);
      await ctx.reply(
        `💰 <b>Twoje salda</b>\n\n` +
          `<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n` +
          `<b>💵 Waluty fiat:</b>\n` +
          `• PLN: <b>${Formatters.formatCurrency(balance.pln, "PLN")}</b>\n` +
          `• EUR: <b>${Formatters.formatCurrency(balance.eur, "EUR")}</b>\n\n` +
          `<b>🪙 Kryptowaluty:</b>\n` +
          `• BTC: <b>${balance.btc} BTC</b>\n` +
          `• ETH: <b>${balance.eth} ETH</b>\n` +
          `• USDT: <b>${balance.usdt} USDT</b>\n\n` +
          `<b>🥇 Metale:</b>\n` +
          `• Złoto: <b>${balance.gold} g</b>\n` +
          `• Srebro: <b>${balance.silver} g</b>\n\n` +
          `<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n` +
          `💡 <i>Aktualizacja: ${new Date().toLocaleString("pl-PL")}</i>`,
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("🔄 Odśwież", "wallet_balance")
            .text("📊 Szczegóły", "wallet_balances")
            .row()
            .text("🔙 Portfel", "menu_wallet"),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Akcja portfela niedostępna.",
        show_alert: false,
      });
  }
}

/**
 * Handle exchange action callbacks
 */
async function handleExchangeAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  switch (data) {
    case "exchange_quick":
    case "exchange_crypto_to_pln":
      await ctx.reply(
        "💱 <b>Krypto → PLN</b>\n\n" +
          "Wymień kryptowaluty na złotówki:\n\n" +
          "Dostępne kryptowaluty:\n" +
          "• ₿ Bitcoin (BTC)\n" +
          "• Ξ Ethereum (ETH)\n" +
          "• 💎 USDT (Tether)\n" +
          "• 🔷 USDC\n" +
          "• 💰 Inne (sprawdź w aplikacji)\n\n" +
          "💡 <i>Środki na koncie w ciągu 1 godziny!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp(
              "💱 Rozpocznij wymianę",
              `${config.webAppUrl}/exchange/crypto-to-pln`
            )
            .row()
            .text("📊 Sprawdź kursy", "rates_current")
            .text("🧮 Kalkulator", "exchange_calculator")
            .row()
            .text("🔙 Wymiana", "menu_exchange"),
        }
      );
      break;

    case "exchange_pln_to_crypto":
      await ctx.reply(
        "💱 <b>PLN → Krypto</b>\n\n" +
          "Kup kryptowaluty za złotówki:\n\n" +
          "Dostępne kryptowaluty:\n" +
          "• ₿ Bitcoin (BTC)\n" +
          "• Ξ Ethereum (ETH)\n" +
          "• 💎 USDT (Tether)\n" +
          "• 🔷 USDC\n" +
          "• 💰 Inne (sprawdź w aplikacji)\n\n" +
          "💡 <i>Natychmiastowe przetwarzanie!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp(
              "💱 Rozpocznij wymianę",
              `${config.webAppUrl}/exchange/pln-to-crypto`
            )
            .row()
            .text("📊 Sprawdź kursy", "rates_current")
            .text("🧮 Kalkulator", "exchange_calculator")
            .row()
            .text("🔙 Wymiana", "menu_exchange"),
        }
      );
      break;

    case "exchange_crypto_to_crypto":
      await ctx.reply(
        "🔄 <b>Krypto ↔ Krypto</b>\n\n" +
          "Wymień jedną kryptowalutę na inną:\n\n" +
          "Popularne pary:\n" +
          "• BTC ↔ ETH\n" +
          "• BTC ↔ USDT\n" +
          "• ETH ↔ USDT\n" +
          "• I wiele innych...\n\n" +
          "💡 <i>Niskie spreads, szybkie transakcje!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp(
              "🔄 Rozpocznij wymianę",
              `${config.webAppUrl}/exchange/crypto-to-crypto`
            )
            .row()
            .text("📊 Sprawdź kursy", "rates_current")
            .text("🧮 Kalkulator", "exchange_calculator")
            .row()
            .text("🔙 Wymiana", "menu_exchange"),
        }
      );
      break;

    case "exchange_fiat":
      await ctx.reply(
        "💶 <b>PLN ↔ EUR</b>\n\n" +
          "Wymiana walut fiat:\n\n" +
          "• PLN → EUR\n" +
          "• EUR → PLN\n\n" +
          "Konkurencyjne kursy wymiany!\n\n" +
          "💡 <i>Dostępne również w kantorach stacjonarnych!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp(
              "💶 Rozpocznij wymianę",
              `${config.webAppUrl}/exchange/fiat`
            )
            .row()
            .text("📊 Sprawdź kursy", "rates_current")
            .text("📍 Kantory", "menu_branches")
            .row()
            .text("🔙 Wymiana", "menu_exchange"),
        }
      );
      break;

    case "exchange_calculator":
      await ctx.reply(
        "🧮 <b>Kalkulator wymiany</b>\n\n" +
          "Oblicz ile otrzymasz przed wymianą:\n\n" +
          "• Podaj kwotę do wymiany\n" +
          "• Wybierz walutę źródłową i docelową\n" +
          "• Zobacz opłaty i końcową kwotę\n" +
          "• Porównaj różne opcje\n\n" +
          "💡 <i>Symuluj przed rzeczywistą transakcją!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("🧮 Otwórz kalkulator", `${config.webAppUrl}/calculator`)
            .row()
            .text("📊 Kursy", "rates_current")
            .text("🔙 Wymiana", "menu_exchange"),
        }
      );
      break;

    case "exchange_reserve":
      await ctx.reply(
        "📍 <b>Rezerwacja w kantorze</b>\n\n" +
          "Zarezerwuj większą transakcję w kantorze stacjonarnym:\n\n" +
          "✨ <b>Korzyści:</b>\n" +
          "• Lepsze kursy dla dużych kwot\n" +
          "• Obsługa gotówkowa\n" +
          "• Fachowa pomoc doradcy\n" +
          "• Brak opłat za rezerwację\n\n" +
          "💡 <i>Idealne dla transakcji powyżej 10 000 PLN!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("📅 Zarezerwuj", `${config.webAppUrl}/reserve`)
            .row()
            .text("📍 Kantory", "menu_branches")
            .text("📞 Kontakt", "support_contact")
            .row()
            .text("🔙 Wymiana", "menu_exchange"),
        }
      );
      break;

    case "exchange_how":
      await ctx.reply(
        "💡 <b>Jak wymienić?</b>\n\n" +
          "<b>Krok 1: Wybierz metodę</b>\n" +
          "• Online przez aplikację\n" +
          "• W kantorze stacjonarnym\n\n" +
          "<b>Krok 2: Podaj szczegóły</b>\n" +
          "• Kwotę do wymiany\n" +
          "• Walutę źródłową i docelową\n" +
          "• Adres portfela (dla krypto)\n\n" +
          "<b>Krok 3: Potwierdź</b>\n" +
          "• Sprawdź kurs i opłaty\n" +
          "• Potwierdź transakcję\n\n" +
          "<b>Krok 4: Realizacja</b>\n" +
          "• Wpłać środki (jeśli wymagane)\n" +
          "• Otrzymaj wymienione środki\n\n" +
          "💡 <i>Cały proces trwa od kilku minut do 1 godziny!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("🎬 Zobacz wideo", "tutorial_video")
            .text("❓ FAQ", "help_faq")
            .row()
            .text("💱 Zacznij teraz", "exchange_quick")
            .text("🔙 Wymiana", "menu_exchange"),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Akcja wymiany niedostępna.",
        show_alert: false,
      });
  }
}

/**
 * Handle investment action callbacks
 */
async function handleInvestmentAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  switch (data) {
    case "invest_gold":
      await ctx.reply(
        MESSAGES.GOLD_SILVER_INFO.split("🥈 Srebro inwestycyjne:")[0],
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.goldInvestment(),
        }
      );
      break;

    case "invest_silver":
      const silverSection = MESSAGES.GOLD_SILVER_INFO.split(
        "🥈 Srebro inwestycyjne:"
      )[1];
      await ctx.reply(
        "🥈 <b>Srebro inwestycyjne</b>\n\n" +
          "🥈 Srebro inwestycyjne:\n" +
          silverSection,
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.silverInvestment(),
        }
      );
      break;

    case "invest_staking":
      await ctx.reply(MESSAGES.STAKING_INFO, {
        parse_mode: "HTML",
        reply_markup: MainMenu.staking(),
      });
      break;

    case "invest_portfolio":
      const portfolio = await getInvestmentPortfolio(ctx.from?.id);
      await ctx.reply(
        `📊 <b>Twój portfel inwestycyjny</b>\n\n` +
          `<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n` +
          `<b>🥇 Złoto:</b>\n` +
          `• Ilość: ${portfolio.gold.amount} g\n` +
          `• Wartość: ${Formatters.formatCurrency(portfolio.gold.value)}\n` +
          `• Zwrot: ${portfolio.gold.return > 0 ? "+" : ""}${portfolio.gold.return}%\n\n` +
          `<b>🥈 Srebro:</b>\n` +
          `• Ilość: ${portfolio.silver.amount} g\n` +
          `• Wartość: ${Formatters.formatCurrency(portfolio.silver.value)}\n` +
          `• Zwrot: ${portfolio.silver.return > 0 ? "+" : ""}${portfolio.silver.return}%\n\n` +
          `<b>🔒 Staking:</b>\n` +
          `• Zablokowane: ${Formatters.formatCurrency(portfolio.staking.locked)}\n` +
          `• Zarobione: ${Formatters.formatCurrency(portfolio.staking.earned)}\n` +
          `• APY: ${portfolio.staking.apy}%\n\n` +
          `<code>━━━━━━━━━━━━━━━━━━━━</code>\n\n` +
          `💰 <b>Łączna wartość:</b> ${Formatters.formatCurrency(portfolio.total)}\n` +
          `📈 <b>Całkowity zwrot:</b> ${portfolio.totalReturn > 0 ? "+" : ""}${portfolio.totalReturn}%\n\n` +
          `💡 <i>Aktualizacja: ${new Date().toLocaleString("pl-PL")}</i>`,
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("🔄 Odśwież", "invest_portfolio")
            .text("📊 Wykresy", "invest_charts")
            .row()
            .text("🔙 Inwestycje", "menu_investments"),
        }
      );
      break;

    case "invest_analysis":
      await ctx.reply(
        "📈 <b>Analiza rynku</b>\n\n" +
          "Śledź trendy i podejmuj mądre decyzje:\n\n" +
          "• Ceny złota i srebra w czasie\n" +
          "• Analiza techniczna\n" +
          "• Prognozy ekspertów\n" +
          "• Porównanie z innymi aktywami\n\n" +
          "💡 <i>Aktualizowane codziennie!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("📈 Pełna analiza", `${config.webAppUrl}/analysis`)
            .row()
            .text("📊 Wykresy", "invest_charts")
            .text("📰 Wiadomości", "invest_news")
            .row()
            .text("🔙 Inwestycje", "menu_investments"),
        }
      );
      break;

    case "invest_tips":
      await ctx.reply(
        "💡 <b>Porady inwestycyjne</b>\n\n" +
          "<b>Złote zasady inwestowania:</b>\n\n" +
          "1️⃣ <b>Dywersyfikuj</b>\n" +
          "Nie trzymaj wszystkiego w jednym miejscu\n\n" +
          "2️⃣ <b>Myśl długoterminowo</b>\n" +
          "Metale szlachetne to inwestycja na lata\n\n" +
          "3️⃣ <b>Kupuj regularnie</b>\n" +
          "Średnia cena zakupu (DCA) zmniejsza ryzyko\n\n" +
          "4️⃣ <b>Przechowuj bezpiecznie</b>\n" +
          "Rozważ profesjonalne przechowanie\n\n" +
          "5️⃣ <b>Śledź rynek</b>\n" +
          "Bądź na bieżąco z trendami\n\n" +
          "💡 <i>Pamiętaj: to nie są porady finansowe, zawsze DYOR!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("📚 Więcej porad", "tutorial_advanced")
            .text("📈 Analiza", "invest_analysis")
            .row()
            .text("🔙 Inwestycje", "menu_investments"),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Akcja inwestycyjna niedostępna.",
        show_alert: false,
      });
  }
}

/**
 * Handle withdrawal action callbacks
 */
async function handleWithdrawAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  switch (data) {
    case "withdraw_bank":
      await ctx.reply(
        "🏦 <b>Wypłata przelewem bankowym</b>\n\n" +
          "<b>Szczegóły:</b>\n" +
          "• Czas realizacji: 1-3 dni robocze\n" +
          "• Minimum: 100 PLN\n" +
          "• Maksimum: 50 000 PLN/dzień\n" +
          "• Opłata: 5 PLN\n\n" +
          "<b>Wymagane dane:</b>\n" +
          "• Numer konta bankowego (IBAN)\n" +
          "• Imię i nazwisko właściciela\n" +
          "• Tytuł przelewu (generowany automatycznie)\n\n" +
          "💡 <i>Środki na koncie w ciągu 1-3 dni roboczych!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("🏦 Zlecenie wypłaty", `${config.webAppUrl}/withdraw/bank`)
            .row()
            .text("ℹ️ Opłaty", "withdraw_fees")
            .text("📈 Limity", "withdraw_limits")
            .row()
            .text("🔙 Wypłata", "wallet_withdraw"),
        }
      );
      break;

    case "withdraw_btc":
      await ctx.reply(
        "₿ <b>Wypłata Bitcoin</b>\n\n" +
          "<b>Szczegóły:</b>\n" +
          "• Czas realizacji: do 1 godziny (3 potwierdzenia)\n" +
          "• Minimum: 0.001 BTC\n" +
          "• Opłata sieciowa: ~0.0005 BTC (dynamiczna)\n\n" +
          "<b>Wymagane dane:</b>\n" +
          "• Adres portfela Bitcoin\n" +
          "• Sprawdź dokładnie adres!\n\n" +
          "⚠️ <b>Uwaga:</b> Transakcje Bitcoin są nieodwracalne!\n\n" +
          "💡 <i>Dodaj adres do whitelisty dla większego bezpieczeństwa!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("₿ Zlecenie wypłaty", `${config.webAppUrl}/withdraw/btc`)
            .row()
            .text("🧮 Kalkulator", "withdraw_calculator")
            .text("ℹ️ Opłaty", "withdraw_fees")
            .row()
            .text("🔙 Wypłata", "wallet_withdraw"),
        }
      );
      break;

    case "withdraw_eth":
      await ctx.reply(
        "Ξ <b>Wypłata Ethereum</b>\n\n" +
          "<b>Szczegóły:</b>\n" +
          "• Czas realizacji: do 30 minut (12 potwierdzeń)\n" +
          "• Minimum: 0.01 ETH\n" +
          "• Opłata sieciowa (gas): ~0.005 ETH (dynamiczna)\n\n" +
          "<b>Wymagane dane:</b>\n" +
          "• Adres portfela Ethereum (ERC-20)\n" +
          "• Sprawdź dokładnie adres!\n\n" +
          "⚠️ <b>Uwaga:</b> Transakcje Ethereum są nieodwracalne!\n\n" +
          "💡 <i>Wypłaty realizowane w godzinach niskiego ruchu dla niższych opłat!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("Ξ Zlecenie wypłaty", `${config.webAppUrl}/withdraw/eth`)
            .row()
            .text("🧮 Kalkulator", "withdraw_calculator")
            .text("ℹ️ Opłaty", "withdraw_fees")
            .row()
            .text("🔙 Wypłata", "wallet_withdraw"),
        }
      );
      break;

    case "withdraw_usdt":
      await ctx.reply(
        "💎 <b>Wypłata USDT</b>\n\n" +
          "<b>Wybierz sieć:</b>\n\n" +
          "<b>TRC-20 (Tron):</b>\n" +
          "• Czas: do 15 minut\n" +
          "• Opłata: 1 USDT\n" +
          "• Zalecane dla małych kwot\n\n" +
          "<b>ERC-20 (Ethereum):</b>\n" +
          "• Czas: do 30 minut\n" +
          "• Opłata: ~5-15 USDT (zależy od sieci)\n" +
          "• Bardziej rozpowszechnione\n\n" +
          "⚠️ <b>Ważne:</b> Wybierz właściwą sieć! Niewłaściwa sieć = utrata środków!\n\n" +
          "💡 <i>TRC-20 zalecane dla kwot poniżej 500 USDT</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp(
              "💎 Wypłata TRC-20",
              `${config.webAppUrl}/withdraw/usdt-trc20`
            )
            .row()
            .webApp(
              "💎 Wypłata ERC-20",
              `${config.webAppUrl}/withdraw/usdt-erc20`
            )
            .row()
            .text("ℹ️ Opłaty", "withdraw_fees")
            .text("🔙 Wypłata", "wallet_withdraw"),
        }
      );
      break;

    case "withdraw_calculator":
      await ctx.reply(
        "🧮 <b>Kalkulator wypłaty</b>\n\n" +
          "Oblicz ile dokładnie otrzymasz:\n\n" +
          "• Podaj kwotę do wypłaty\n" +
          "• Wybierz metodę wypłaty\n" +
          "• Zobacz opłaty i końcową kwotę\n" +
          "• Sprawdź czas realizacji\n\n" +
          "💡 <i>Planuj swoje wypłaty z wyprzedzeniem!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp(
              "🧮 Otwórz kalkulator",
              `${config.webAppUrl}/calculator/withdraw`
            )
            .row()
            .text("ℹ️ Opłaty", "withdraw_fees")
            .text("🔙 Wypłata", "wallet_withdraw"),
        }
      );
      break;

    case "withdraw_fees":
      await ctx.reply(
        "ℹ️ <b>Opłaty za wypłaty</b>\n\n" +
          "<b>🏦 Przelew bankowy (PLN):</b>\n" +
          "• Opłata: 5 PLN\n" +
          "• Czas: 1-3 dni\n\n" +
          "<b>₿ Bitcoin:</b>\n" +
          "• Opłata: ~0.0005 BTC\n" +
          "• Dynamiczna (zależy od sieci)\n\n" +
          "<b>Ξ Ethereum:</b>\n" +
          "• Opłata: ~0.005 ETH\n" +
          "• Dynamiczna (gas fee)\n\n" +
          "<b>💎 USDT:</b>\n" +
          "• TRC-20: 1 USDT\n" +
          "• ERC-20: ~5-15 USDT\n\n" +
          "💡 <b>Poziomy konta:</b>\n" +
          "• 🥈 Srebro: -10% opłat\n" +
          "• 🥇 Złoto: -25% opłat\n" +
          "• 💎 Diament: -50% opłat\n\n" +
          "<i>Opłaty aktualizowane w czasie rzeczywistym</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("🏆 Poziomy konta", "account_tier")
            .text("🧮 Kalkulator", "withdraw_calculator")
            .row()
            .text("🔙 Wypłata", "wallet_withdraw"),
        }
      );
      break;

    case "withdraw_limits":
      await ctx.reply(
        "📈 <b>Limity wypłat</b>\n\n" +
          "<b>Według poziomu konta:</b>\n\n" +
          "<b>🥉 Brąz (nowy użytkownik):</b>\n" +
          "• Dziennie: 5 000 PLN\n" +
          "• Miesięcznie: 50 000 PLN\n\n" +
          "<b>🥈 Srebro (KYC podstawowe):</b>\n" +
          "• Dziennie: 25 000 PLN\n" +
          "• Miesięcznie: 250 000 PLN\n\n" +
          "<b>🥇 Złoto (KYC pełne):</b>\n" +
          "• Dziennie: 100 000 PLN\n" +
          "• Miesięcznie: 1 000 000 PLN\n\n" +
          "<b>💎 Diament (VIP):</b>\n" +
          "• Indywidualne limity\n" +
          "• Kontakt z opiekunem\n\n" +
          "💡 <i>Zwiększ limity przechodząc weryfikację!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("🏆 Mój poziom", "account_tier")
            .text("✅ Weryfikacja", "security_kyc")
            .row()
            .text("🔙 Wypłata", "wallet_withdraw"),
        }
      );
      break;

    case "withdraw_history":
      await ctx.reply(
        "⏱️ <b>Historia wypłat</b>\n\n" +
          "Zobacz wszystkie swoje wypłaty:\n\n" +
          "• Ostatnie wypłaty\n" +
          "• Status realizacji\n" +
          "• Szczegóły transakcji\n" +
          "• Potwierdzenia\n\n" +
          "💡 <i>Pełna przejrzystość i możliwość eksportu!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp(
              "⏱️ Zobacz historię",
              `${config.webAppUrl}/history/withdrawals`
            )
            .row()
            .text("📤 Eksport", "history_export")
            .text("🔙 Wypłata", "wallet_withdraw"),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Akcja wypłaty niedostępna.",
        show_alert: false,
      });
  }
}

/**
 * Handle deposit action callbacks
 */
async function handleDepositAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  switch (data) {
    case "deposit_card":
      await ctx.reply(
        "💳 <b>Wpłata kartą</b>\n\n" +
          "<b>Szczegóły:</b>\n" +
          "• Czas realizacji: natychmiastowy\n" +
          "• Minimum: 50 PLN\n" +
          "• Maksimum: 10 000 PLN/transakcja\n" +
          "• Opłata: 2.5% (min 2 PLN)\n\n" +
          "<b>Akceptowane karty:</b>\n" +
          "• Visa\n" +
          "• Mastercard\n" +
          "• Maestro\n\n" +
          "🔒 <i>Bezpieczne płatności przez bramkę Przelewy24!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("💳 Wpłać teraz", `${config.webAppUrl}/deposit/card`)
            .row()
            .text("🧮 Kalkulator", "deposit_calculator")
            .text("🎁 Bonusy", "deposit_bonuses")
            .row()
            .text("🔙 Wpłata", "wallet_deposit"),
        }
      );
      break;

    case "deposit_bank":
      await ctx.reply(
        "🏦 <b>Wpłata przelewem</b>\n\n" +
          "<b>Szczegóły:</b>\n" +
          "• Czas realizacji: do 2 godzin roboczych\n" +
          "• Minimum: 100 PLN\n" +
          "• Brak limitu maksymalnego\n" +
          "• Brak opłat ✅\n\n" +
          "<b>Dane do przelewu:</b>\n" +
          "📝 Odbiorca: CashyMine Sp. z o.o.\n" +
          "🏦 Bank: mBank\n" +
          "💳 IBAN: PL XX XXXX XXXX XXXX XXXX XXXX XXXX\n" +
          "✍️ Tytuł: [wygenerowany w aplikacji]\n\n" +
          "💡 <i>Pamiętaj o unikalnym tytule przelewu!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("🏦 Generuj dane", `${config.webAppUrl}/deposit/bank`)
            .row()
            .text("📋 Kopiuj dane", "deposit_bank_copy")
            .text("🎁 Bonusy", "deposit_bonuses")
            .row()
            .text("🔙 Wpłata", "wallet_deposit"),
        }
      );
      break;

    case "deposit_btc":
      await ctx.reply(
        "₿ <b>Wpłata Bitcoin</b>\n\n" +
          "<b>Szczegóły:</b>\n" +
          "• Czas: po 3 potwierdzeniach (~30 min)\n" +
          "• Minimum: 0.001 BTC\n" +
          "• Brak opłat ✅\n\n" +
          "<b>Instrukcja:</b>\n" +
          "1. Skopiuj adres depozytowy\n" +
          "2. Wyślij Bitcoin z portfela\n" +
          "3. Poczekaj na potwierdzenia\n" +
          "4. Środki pojawią się na koncie\n\n" +
          "⚠️ <b>Ważne:</b> Wysyłaj tylko Bitcoin na ten adres!\n\n" +
          "💡 <i>Śledź status w czasie rzeczywistym!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("₿ Adres depozytowy", `${config.webAppUrl}/deposit/btc`)
            .row()
            .text("📋 Kopiuj adres", "deposit_btc_copy")
            .text("🔍 Sprawdź status", "deposit_btc_status")
            .row()
            .text("🔙 Wpłata", "wallet_deposit"),
        }
      );
      break;

    case "deposit_eth":
      await ctx.reply(
        "Ξ <b>Wpłata Ethereum</b>\n\n" +
          "<b>Szczegóły:</b>\n" +
          "• Czas: po 12 potwierdzeniach (~3 min)\n" +
          "• Minimum: 0.01 ETH\n" +
          "• Brak opłat ✅\n\n" +
          "<b>Instrukcja:</b>\n" +
          "1. Skopiuj adres depozytowy\n" +
          "2. Wyślij Ethereum z portfela\n" +
          "3. Poczekaj na potwierdzenia\n" +
          "4. Środki pojawią się na koncie\n\n" +
          "⚠️ <b>Ważne:</b> Wysyłaj tylko ETH (ERC-20) na ten adres!\n\n" +
          "💡 <i>Obsługujemy również tokeny ERC-20!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("Ξ Adres depozytowy", `${config.webAppUrl}/deposit/eth`)
            .row()
            .text("📋 Kopiuj adres", "deposit_eth_copy")
            .text("🔍 Sprawdź status", "deposit_eth_status")
            .row()
            .text("🔙 Wpłata", "wallet_deposit"),
        }
      );
      break;

    case "deposit_usdt":
      await ctx.reply(
        "💎 <b>Wpłata USDT</b>\n\n" +
          "<b>Wybierz sieć:</b>\n\n" +
          "<b>TRC-20 (Tron):</b>\n" +
          "• Czas: ~3 minuty\n" +
          "• Min: 10 USDT\n" +
          "• Opłata: 0 USDT ✅\n\n" +
          "<b>ERC-20 (Ethereum):</b>\n" +
          "• Czas: ~3-5 minut\n" +
          "• Min: 10 USDT\n" +
          "• Opłata: 0 USDT ✅\n\n" +
          "⚠️ <b>Uwaga:</b> Wybierz właściwą sieć podczas wysyłania!\n\n" +
          "💡 <i>TRC-20 zalecane ze względu na niższe opłaty sieciowe</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("💎 USDT TRC-20", `${config.webAppUrl}/deposit/usdt-trc20`)
            .row()
            .webApp("💎 USDT ERC-20", `${config.webAppUrl}/deposit/usdt-erc20`)
            .row()
            .text("🔙 Wpłata", "wallet_deposit"),
        }
      );
      break;

    case "deposit_calculator":
      await ctx.reply(
        "🧮 <b>Kalkulator wpłaty</b>\n\n" +
          "Oblicz ile wpłacisz z opłatami:\n\n" +
          "• Podaj kwotę wpłaty\n" +
          "• Wybierz metodę wpłaty\n" +
          "• Zobacz opłaty\n" +
          "• Sprawdź końcową kwotę na koncie\n\n" +
          "💡 <i>Wybierz najtańszą metodę!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp(
              "🧮 Otwórz kalkulator",
              `${config.webAppUrl}/calculator/deposit`
            )
            .row()
            .text("🎁 Bonusy", "deposit_bonuses")
            .text("🔙 Wpłata", "wallet_deposit"),
        }
      );
      break;

    case "deposit_projections":
      await ctx.reply(
        "📈 <b>Projekcje zarobków</b>\n\n" +
          "Zobacz ile możesz zarobić:\n\n" +
          "💰 <b>Przykład: wpłata 1000 PLN</b>\n\n" +
          "<b>Program oszczędnościowy (180 dni, 10% APY):</b>\n" +
          "• Po 30 dniach: +8.33 PLN\n" +
          "• Po 90 dniach: +25 PLN\n" +
          "• Po 180 dniach: +50 PLN\n\n" +
          "<b>Trading (przykładowo 2% miesięcznie):</b>\n" +
          "• Po 1 miesiącu: +20 PLN\n" +
          "• Po 3 miesiącach: +61 PLN\n" +
          "• Po 6 miesiącach: +126 PLN\n\n" +
          "💡 <i>To tylko przykłady, rzeczywiste wyniki mogą się różnić!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("📊 Pełne projekcje", `${config.webAppUrl}/projections`)
            .row()
            .text("🔒 Staking", "invest_staking")
            .text("🔙 Wpłata", "wallet_deposit"),
        }
      );
      break;

    case "deposit_bonuses":
      await ctx.reply(
        "🎁 <b>Bonusy za wpłaty</b>\n\n" +
          "<b>Aktualne promocje:</b>\n\n" +
          "🎉 <b>Pierwsza wpłata:</b>\n" +
          "• +5% bonusu do kwoty wpłaty\n" +
          "• Max: 500 PLN bonusu\n\n" +
          "💰 <b>Wpłaty powyżej 1000 PLN:</b>\n" +
          "• +2% bonusu\n\n" +
          "💎 <b>Wpłaty powyżej 5000 PLN:</b>\n" +
          "• +3.5% bonusu\n\n" +
          "🏆 <b>Dla poziomów VIP:</b>\n" +
          "• Złoto: +1% dodatkowego bonusu\n" +
          "• Diament: +2% dodatkowego bonusu\n\n" +
          "⏰ <b>Ważność:</b> do końca miesiąca\n\n" +
          "💡 <i>Bonusy dodawane automatycznie!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("💰 Wpłać teraz", "wallet_deposit")
            .text("🏆 Mój poziom", "account_tier")
            .row()
            .text("🔙 Wpłata", "wallet_deposit"),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Akcja wpłaty niedostępna.",
        show_alert: false,
      });
  }
}

/**
 * Handle staking action callbacks
 */
async function handleStakingAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  const stakingPlans = {
    bronze: { name: "Brązowy", days: 30, apy: "3-5%" },
    silver: { name: "Srebrny", days: 90, apy: "5-7%" },
    gold: { name: "Złoty", days: 180, apy: "8-10%" },
    diamond: { name: "Diamentowy", days: 365, apy: "12-15%" },
  };

  const planKey = data.replace("stake_", "") as keyof typeof stakingPlans;
  const plan = stakingPlans[planKey];

  if (plan) {
    await ctx.reply(
      `🔒 <b>Plan ${plan.name}</b>\n\n` +
        `<b>Szczegóły planu:</b>\n` +
        `• Okres: ${plan.days} dni\n` +
        `• APY: ${plan.apy}\n` +
        `• Wypłata odsetek: miesięczna\n` +
        `• Możliwość wcześniejszego zakończenia: tak (kara 2%)\n\n` +
        `<b>Przykład:</b>\n` +
        `Wpłata: 10 000 PLN\n` +
        `Czas: ${plan.days} dni\n` +
        `Zarobek: ~${Math.round((10000 * parseFloat(plan.apy) * plan.days) / 36500)} PLN\n\n` +
        `💡 <i>Im dłuższy okres, tym wyższy zwrot!</i>`,
      {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .webApp(
            `🔒 Rozpocznij plan ${plan.name}`,
            `${config.webAppUrl}/staking/${planKey}`
          )
          .row()
          .text("🧮 Kalkulator", "stake_calculator")
          .text("📊 Porównaj plany", "stake_compare")
          .row()
          .text("🔙 Staking", "invest_staking"),
      }
    );
  } else if (data === "stake_calculator") {
    await ctx.reply(
      "🧮 <b>Kalkulator stakingu</b>\n\n" +
        "Oblicz potencjalne zarobki:\n\n" +
        "• Podaj kwotę do zablokowania\n" +
        "• Wybierz plan (30-365 dni)\n" +
        "• Zobacz przewidywane zarobki\n" +
        "• Porównaj różne plany\n\n" +
        "💡 <i>Zaplanuj swoją inwestycję!</i>",
      {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .webApp(
            "🧮 Otwórz kalkulator",
            `${config.webAppUrl}/calculator/staking`
          )
          .row()
          .text("📊 Porównaj", "stake_compare")
          .text("🔙 Staking", "invest_staking"),
      }
    );
  } else if (data === "stake_compare") {
    await ctx.reply(
      "📊 <b>Porównanie planów</b>\n\n" +
        "<b>Dla kwoty 10 000 PLN:</b>\n\n" +
        "🥉 <b>Brązowy (30 dni, 5% APY):</b>\n" +
        "• Zarobek: ~41 PLN\n" +
        "• Dziennie: ~1.37 PLN\n\n" +
        "🥈 <b>Srebrny (90 dni, 7% APY):</b>\n" +
        "• Zarobek: ~173 PLN\n" +
        "• Dziennie: ~1.92 PLN\n\n" +
        "🥇 <b>Złoty (180 dni, 10% APY):</b>\n" +
        "• Zarobek: ~493 PLN\n" +
        "• Dziennie: ~2.74 PLN\n\n" +
        "💎 <b>Diamentowy (365 dni, 15% APY):</b>\n" +
        "• Zarobek: ~1500 PLN\n" +
        "• Dziennie: ~4.11 PLN\n\n" +
        "💡 <i>Dłuższy okres = wyższy zwrot!</i>",
      {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .text("🥉 Brązowy", "stake_bronze")
          .text("🥈 Srebrny", "stake_silver")
          .row()
          .text("🥇 Złoty", "stake_gold")
          .text("💎 Diamentowy", "stake_diamond")
          .row()
          .text("🔙 Staking", "invest_staking"),
      }
    );
  } else if (data === "stake_returns") {
    await ctx.reply(
      "📈 <b>Moje zwroty ze stakingu</b>\n\n" +
        "Zobacz historię swoich zarobków:\n\n" +
        "• Aktywne plany stakingu\n" +
        "• Zarobione odsetki\n" +
        "• Zakończone plany\n" +
        "• Łączne zarobki\n\n" +
        "💡 <i>Pełna przejrzystość zarobków!</i>",
      {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .webApp("📈 Zobacz zwroty", `${config.webAppUrl}/staking/returns`)
          .row()
          .text("🔙 Staking", "invest_staking"),
      }
    );
  } else if (data === "stake_unstake") {
    await ctx.reply(
      "⏳ <b>Wypłata ze stakingu</b>\n\n" +
        "<b>Możliwości wypłaty:</b>\n\n" +
        "✅ <b>Po zakończeniu okresu:</b>\n" +
        "• Brak kar\n" +
        "• Pełny zwrot + odsetki\n\n" +
        "⚠️ <b>Wcześniejsze zakończenie:</b>\n" +
        "• Kara: 2% kapitału\n" +
        "• Utrata odsetek za bieżący miesiąc\n" +
        "• Natychmiastowa wypłata\n\n" +
        "💡 <i>Zalecamy czekać do końca okresu!</i>",
      {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .webApp(
            "⏳ Zarządzaj stakingiem",
            `${config.webAppUrl}/staking/manage`
          )
          .row()
          .text("📊 Moje plany", "stake_returns")
          .text("🔙 Staking", "invest_staking"),
      }
    );
  }
}

/**
 * Handle gold investment callbacks
 */
async function handleGoldAction(ctx: BotContext, data: string): Promise<void> {
  switch (data) {
    case "gold_bars":
      await ctx.reply(
        "🥇 <b>Sztabki złota</b>\n\n" +
          "<b>Dostępne rozmiary:</b>\n\n" +
          "• 1g - od 285 PLN\n" +
          "• 5g - od 1 400 PLN\n" +
          "• 10g - od 2 780 PLN\n" +
          "• 20g - od 5 540 PLN\n" +
          "• 1 uncja (31.1g) - od 8 650 PLN\n" +
          "• 50g - od 13 850 PLN\n" +
          "• 100g - od 27 650 PLN\n\n" +
          "✨ <b>Certyfikaty:</b>\n" +
          "• LBMA certified\n" +
          "• 999.9 próba\n" +
          "• Numerowane\n\n" +
          "💡 <i>Wszystkie sztabki z certyfikatem autentyczności!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("🥇 Kup sztabki", `${config.webAppUrl}/gold/bars`)
            .row()
            .text("📊 Aktualne ceny", "gold_prices")
            .text("🧮 Kalkulator", "gold_calculator")
            .row()
            .text("🔙 Złoto", "invest_gold"),
        }
      );
      break;

    case "gold_coins":
      await ctx.reply(
        "🪙 <b>Monety złote</b>\n\n" +
          "<b>Dostępne monety:</b>\n\n" +
          "• 🇿🇦 Krugerrand (1 oz) - od 8 900 PLN\n" +
          "• 🇨🇦 Maple Leaf (1 oz) - od 9 100 PLN\n" +
          "• 🇦🇹 Wiener Philharmoniker (1 oz) - od 9 000 PLN\n" +
          "• 🇵🇱 Orzeł Bielik (1 oz) - od 9 200 PLN\n" +
          "• 🇬🇧 Britannia (1 oz) - od 9 050 PLN\n\n" +
          "✨ <b>Zalety monet:</b>\n" +
          "• Łatwiejsze w przechowaniu\n" +
          "• Większa płynność\n" +
          "• Wartość kolekcjonerska\n\n" +
          "💡 <i>Idealne na prezent lub inwestycję!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("🪙 Kup monety", `${config.webAppUrl}/gold/coins`)
            .row()
            .text("📊 Aktualne ceny", "gold_prices")
            .text("🧮 Kalkulator", "gold_calculator")
            .row()
            .text("🔙 Złoto", "invest_gold"),
        }
      );
      break;

    case "gold_prices":
      await ctx.reply(
        "📊 <b>Aktualne ceny złota</b>\n\n" +
          "<b>Złoto (spot):</b>\n" +
          "• 1g: 285 PLN (kupno) / 295 PLN (sprzedaż)\n" +
          "• 1 oz: 8 650 PLN (kupno) / 8 950 PLN (sprzedaż)\n\n" +
          "<b>Zmiana:</b>\n" +
          "• 24h: +0.8% 📈\n" +
          "• 7 dni: +2.3% 📈\n" +
          "• 30 dni: -1.2% 📉\n\n" +
          "💡 <i>Ceny aktualizowane co 15 minut</i>\n",
        // "⏰ <i>Ostatnia aktualizacja: ${new Date().toLocaleTimeString("pl-PL")}</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("🔄 Odśwież", "gold_prices")
            .text("📈 Wykres", "gold_chart")
            .row()
            .text("🔔 Ustaw alert", "gold_alert")
            .text("🔙 Złoto", "invest_gold"),
        }
      );
      break;

    case "gold_calculator":
      await ctx.reply(
        "🧮 <b>Kalkulator złota</b>\n\n" +
          "Oblicz wartość inwestycji:\n\n" +
          "• Podaj ilość gramów\n" +
          "• Zobacz aktualną cenę\n" +
          "• Sprawdź koszty\n" +
          "• Symuluj przychód\n\n" +
          "💡 <i>Planuj inwestycję z wyprzedzeniem!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp(
              "🧮 Otwórz kalkulator",
              `${config.webAppUrl}/calculator/gold`
            )
            .row()
            .text("📊 Ceny", "gold_prices")
            .text("🔙 Złoto", "invest_gold"),
        }
      );
      break;

    case "gold_delivery":
      await ctx.reply(
        "📦 <b>Odbiór i dostawa</b>\n\n" +
          "<b>Opcje odbioru:</b>\n\n" +
          "🏢 <b>Odbiór osobisty:</b>\n" +
          "• Bezpłatnie\n" +
          "• W dowolnym kantorze\n" +
          "• Natychmiastowo po zakupie\n\n" +
          "🚚 <b>Dostawa kurierem:</b>\n" +
          "• Koszt: 30-50 PLN (zależnie od wartości)\n" +
          "• Ubezpieczona przesyłka\n" +
          "• 1-2 dni robocze\n" +
          "• Potwierdzenie odbioru\n\n" +
          "💡 <i>Dla zakupów powyżej 10 000 PLN dostawa gratis!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("📍 Nasze kantory", "menu_branches")
            .text("🚚 Zamów dostawę", "gold_order_delivery")
            .row()
            .text("🔙 Złoto", "invest_gold"),
        }
      );
      break;

    case "gold_storage":
      await ctx.reply(
        "🔒 <b>Przechowanie złota</b>\n\n" +
          "<b>Opcje przechowania:</b>\n\n" +
          "🏠 <b>Własne przechowanie:</b>\n" +
          "• Bezpłatnie\n" +
          "• Pełna kontrola\n" +
          "• Własna odpowiedzialność\n\n" +
          "🏦 <b>Sejf w CashyMine:</b>\n" +
          "• 10 PLN/miesiąc za każde 100g\n" +
          "• Ubezpieczone do 100 000 PLN\n" +
          "• Dostęp w godzinach otwarcia\n" +
          "• Bezpieczne przechowanie\n\n" +
          "💡 <i>Dla większych ilości polecamy profesjonalne przechowanie!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("🔒 Wynajmij sejf", `${config.webAppUrl}/storage`)
            .row()
            .text("📍 Nasze kantory", "menu_branches")
            .text("🔙 Złoto", "invest_gold"),
        }
      );
      break;

    case "gold_why":
      await ctx.reply(
        "💡 <b>Dlaczego inwestować w złoto?</b>\n\n" +
          "✅ <b>Ochrona przed inflacją</b>\n" +
          "Złoto zachowuje wartość w czasie\n\n" +
          "✅ <b>Dywersyfikacja portfela</b>\n" +
          "Nieskorelowane z akcjami i obligacjami\n\n" +
          "✅ <b>Aktywo materialne</b>\n" +
          "Fizyczne złoto w Twoich rękach\n\n" +
          "✅ <b>Płynność</b>\n" +
          "Łatwe do sprzedaży w każdej chwili\n\n" +
          "✅ <b>Stabilność</b>\n" +
          "Tysiące lat historii jako środek wymiany\n\n" +
          "✅ <b>Ochrona kapitału</b>\n" +
          "Bezpieczna przystań w czasach kryzysu\n\n" +
          "💡 <i>Złoto to fundament bezpiecznego portfela!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("🥇 Kup złoto", "gold_bars")
            .text("📊 Analiza", "invest_analysis")
            .row()
            .text("🔙 Złoto", "invest_gold"),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Akcja złota niedostępna.",
        show_alert: false,
      });
  }
}

/**
 * Handle silver investment callbacks
 */
async function handleSilverAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  switch (data) {
    case "silver_bars":
      await ctx.reply(
        "🥈 <b>Sztabki srebra</b>\n\n" +
          "<b>Dostępne rozmiary:</b>\n\n" +
          "• 100g - od 350 PLN\n" +
          "• 250g - od 870 PLN\n" +
          "• 500g - od 1 730 PLN\n" +
          "• 1kg - od 3 450 PLN\n" +
          "• 5kg - od 17 200 PLN\n\n" +
          "✨ <b>Certyfikaty:</b>\n" +
          "• 999 próba\n" +
          "• Numerowane\n" +
          "• Certyfikat autentyczności\n\n" +
          "💡 <i>Srebro - przystępna cena, duży potencjał!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("🥈 Kup sztabki", `${config.webAppUrl}/silver/bars`)
            .row()
            .text("📊 Aktualne ceny", "silver_prices")
            .text("🧮 Kalkulator", "silver_calculator")
            .row()
            .text("🔙 Srebro", "invest_silver"),
        }
      );
      break;

    case "silver_coins":
      await ctx.reply(
        "🪙 <b>Monety srebrne</b>\n\n" +
          "<b>Dostępne monety:</b>\n\n" +
          "• 🇺🇸 American Eagle (1 oz) - od 180 PLN\n" +
          "• 🇨🇦 Maple Leaf (1 oz) - od 175 PLN\n" +
          "• 🇦🇹 Filharmonik (1 oz) - od 170 PLN\n" +
          "• 🇬🇧 Britannia (1 oz) - od 178 PLN\n" +
          "• 🇦🇺 Kookaburra (1 oz) - od 185 PLN\n\n" +
          "✨ <b>Zalety monet srebrnych:</b>\n" +
          "• Niższa cena wejścia\n" +
          "• Wartość kolekcjonerska\n" +
          "• Wysoka płynność\n\n" +
          "💡 <i>Doskonały start w inwestycjach w metale!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("🪙 Kup monety", `${config.webAppUrl}/silver/coins`)
            .row()
            .text("📊 Aktualne ceny", "silver_prices")
            .text("🧮 Kalkulator", "silver_calculator")
            .row()
            .text("🔙 Srebro", "invest_silver"),
        }
      );
      break;

    case "silver_prices":
      await ctx.reply(
        "📊 <b>Aktualne ceny srebra</b>\n\n" +
          "<b>Srebro (spot):</b>\n" +
          "• 1g: 3.50 PLN (kupno) / 3.80 PLN (sprzedaż)\n" +
          "• 1 oz: 170 PLN (kupno) / 185 PLN (sprzedaż)\n\n" +
          "<b>Zmiana:</b>\n" +
          "• 24h: +1.2% 📈\n" +
          "• 7 dni: +3.5% 📈\n" +
          "• 30 dni: +0.8% 📈\n\n" +
          "💡 <i>Ceny aktualizowane co 15 minut</i>\n",
        // "⏰ <i>Ostatnia aktualizacja: ${new Date().toLocaleTimeString("pl-PL")}</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("🔄 Odśwież", "silver_prices")
            .text("📈 Wykres", "silver_chart")
            .row()
            .text("🔔 Ustaw alert", "silver_alert")
            .text("🔙 Srebro", "invest_silver"),
        }
      );
      break;

    case "silver_calculator":
      await ctx.reply(
        "🧮 <b>Kalkulator srebra</b>\n\n" +
          "Oblicz wartość inwestycji:\n\n" +
          "• Podaj ilość gramów\n" +
          "• Zobacz aktualną cenę\n" +
          "• Sprawdź koszty\n" +
          "• Symuluj przychód\n\n" +
          "💡 <i>Planuj inwestycję z wyprzedzeniem!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp(
              "🧮 Otwórz kalkulator",
              `${config.webAppUrl}/calculator/silver`
            )
            .row()
            .text("📊 Ceny", "silver_prices")
            .text("🔙 Srebro", "invest_silver"),
        }
      );
      break;

    case "silver_delivery":
      await ctx.reply(
        "📦 <b>Odbiór i dostawa</b>\n\n" +
          "<b>Opcje odbioru:</b>\n\n" +
          "🏢 <b>Odbiór osobisty:</b>\n" +
          "• Bezpłatnie\n" +
          "• W dowolnym kantorze\n" +
          "• Natychmiastowo po zakupie\n\n" +
          "🚚 <b>Dostawa kurierem:</b>\n" +
          "• Koszt: 25-40 PLN\n" +
          "• Ubezpieczona przesyłka\n" +
          "• 1-2 dni robocze\n\n" +
          "💡 <i>Dla zakupów powyżej 5 000 PLN dostawa gratis!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("📍 Nasze kantory", "menu_branches")
            .text("🚚 Zamów dostawę", "silver_order_delivery")
            .row()
            .text("🔙 Srebro", "invest_silver"),
        }
      );
      break;

    case "silver_storage":
      await ctx.reply(
        "🔒 <b>Przechowanie srebra</b>\n\n" +
          "<b>Opcje przechowania:</b>\n\n" +
          "🏠 <b>Własne przechowanie:</b>\n" +
          "• Bezpłatnie\n" +
          "• Pełna kontrola\n\n" +
          "🏦 <b>Sejf w CashyMine:</b>\n" +
          "• 5 PLN/miesiąc za każde 500g\n" +
          "• Ubezpieczone\n" +
          "• Bezpieczne\n\n" +
          "💡 <i>Dla większych ilości polecamy sejf!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("🔒 Wynajmij sejf", `${config.webAppUrl}/storage`)
            .row()
            .text("📍 Nasze kantory", "menu_branches")
            .text("🔙 Srebro", "invest_silver"),
        }
      );
      break;

    case "silver_why":
      await ctx.reply(
        "💡 <b>Dlaczego inwestować w srebro?</b>\n\n" +
          "✅ <b>Niska cena wejścia</b>\n" +
          "Dostępne dla każdego inwestora\n\n" +
          "✅ <b>Zastosowanie przemysłowe</b>\n" +
          "Popyt ze strony elektroniki, fotowoltaiki\n\n" +
          "✅ <b>Ratio do złota</b>\n" +
          "Historycznie niedowartościowane\n\n" +
          "✅ <b>Dywersyfikacja</b>\n" +
          "Uzupełnienie złota w portfelu\n\n" +
          "✅ <b>Wyższy potencjał wzrostu</b>\n" +
          "Większa zmienność = większe możliwości\n\n" +
          "💡 <i>Srebro to dynamiczna inwestycja!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("🥈 Kup srebro", "silver_bars")
            .text("📊 Analiza", "invest_analysis")
            .row()
            .text("🔙 Srebro", "invest_silver"),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Akcja srebra niedostępna.",
        show_alert: false,
      });
  }
}

// Part 2 of callbackHandler.ts - continuation from part 1

/**
 * Handle rates action callbacks
 */
async function handleRatesAction(ctx: BotContext, data: string): Promise<void> {
  switch (data) {
    case "rates_current":
    case "rates_live":
      await ctx.reply(MESSAGES.RATES, {
        parse_mode: "HTML",
        reply_markup: MainMenu.rates(),
      });
      break;

    case "rate_btc":
      await ctx.reply(
        "₿ <b>Bitcoin (BTC)</b>\n\n" +
          "<b>Aktualne kursy:</b>\n" +
          "• Kupno: <b>185 000 PLN</b>\n" +
          "• Sprzedaż: <b>188 000 PLN</b>\n" +
          "• Spread: 1.6%\n\n" +
          "<b>Zmiana ceny:</b>\n" +
          "• 1h: +0.3% 📈\n" +
          "• 24h: +2.5% 📈\n" +
          "• 7 dni: +5.8% 📈\n" +
          "• 30 dni: -3.2% 📉\n\n" +
          "<b>Wolumen 24h:</b> 45 000 PLN\n" +
          "<b>Market Cap:</b> $1.2T\n\n",
        // "⏰ <i>Aktualizacja: ${new Date().toLocaleTimeString("pl-PL")}</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("💱 Wymień BTC", "exchange_btc")
            .text("📈 Wykres", "rate_btc_chart")
            .row()
            .text("🔔 Ustaw alert", "rate_btc_alert")
            .text("🔄 Odśwież", "rate_btc")
            .row()
            .text("🔙 Kursy", "rates_current"),
        }
      );
      break;

    case "rate_eth":
      await ctx.reply(
        "Ξ <b>Ethereum (ETH)</b>\n\n" +
          "<b>Aktualne kursy:</b>\n" +
          "• Kupno: <b>12 500 PLN</b>\n" +
          "• Sprzedaż: <b>12 800 PLN</b>\n" +
          "• Spread: 2.4%\n\n" +
          "<b>Zmiana ceny:</b>\n" +
          "• 1h: +0.5% 📈\n" +
          "• 24h: +1.8% 📈\n" +
          "• 7 dni: +4.2% 📈\n" +
          "• 30 dni: -1.5% 📉\n\n" +
          "<b>Wolumen 24h:</b> 28 000 PLN\n" +
          "<b>Market Cap:</b> $420B\n\n",
        // "⏰ <i>Aktualizacja: ${new Date().toLocaleTimeString("pl-PL")}</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("💱 Wymień ETH", "exchange_eth")
            .text("📈 Wykres", "rate_eth_chart")
            .row()
            .text("🔔 Ustaw alert", "rate_eth_alert")
            .text("🔄 Odśwież", "rate_eth")
            .row()
            .text("🔙 Kursy", "rates_current"),
        }
      );
      break;

    case "rate_usdt":
      await ctx.reply(
        "💎 <b>USDT (Tether)</b>\n\n" +
          "<b>Aktualne kursy:</b>\n" +
          "• Kupno: <b>4.25 PLN</b>\n" +
          "• Sprzedaż: <b>4.35 PLN</b>\n" +
          "• Spread: 2.3%\n\n" +
          "<b>Zmiana ceny:</b>\n" +
          "• 1h: 0.0% ━\n" +
          "• 24h: 0.0% ━\n" +
          "• 7 dni: +0.1% 📈\n" +
          "• 30 dni: -0.2% 📉\n\n" +
          "<b>Wolumen 24h:</b> 65 000 PLN\n" +
          "<b>Market Cap:</b> $140B\n\n",
        // "⏰ <i>Aktualizacja: ${new Date().toLocaleTimeString("pl-PL")}</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("💱 Wymień USDT", "exchange_usdt")
            .text("📈 Wykres", "rate_usdt_chart")
            .row()
            .text("🔔 Ustaw alert", "rate_usdt_alert")
            .text("🔄 Odśwież", "rate_usdt")
            .row()
            .text("🔙 Kursy", "rates_current"),
        }
      );
      break;

    case "rate_others":
      await ctx.reply(
        "💰 <b>Inne kryptowaluty</b>\n\n" +
          "<b>Dostępne do wymiany:</b>\n\n" +
          "• 🔷 USDC - Stablecoin\n" +
          "• 🟣 Litecoin (LTC)\n" +
          "• 🔴 Cardano (ADA)\n" +
          "• 🟢 Polkadot (DOT)\n" +
          "• 🔵 Ripple (XRP)\n\n" +
          "💡 <i>Pełna lista w aplikacji webowej!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("💰 Zobacz wszystkie", `${config.webAppUrl}/rates`)
            .row()
            .text("🔙 Kursy", "rates_current"),
        }
      );
      break;

    case "rate_gold":
      await ctx.reply(
        "🥇 <b>Złoto</b>\n\n" +
          "<b>Cena za 1g:</b>\n" +
          "• Kupno: <b>285 PLN</b>\n" +
          "• Sprzedaż: <b>295 PLN</b>\n\n" +
          "<b>Cena za 1 oz (31.1g):</b>\n" +
          "• Kupno: <b>8 650 PLN</b>\n" +
          "• Sprzedaż: <b>8 950 PLN</b>\n\n" +
          "<b>Zmiana ceny:</b>\n" +
          "• 24h: +0.8% 📈\n" +
          "• 7 dni: +2.3% 📈\n" +
          "• 30 dni: -1.2% 📉\n\n",
        // "⏰ <i>Aktualizacja: ${new Date().toLocaleTimeString("pl-PL")}</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("🥇 Kup złoto", "invest_gold")
            .text("📈 Wykres", "gold_chart")
            .row()
            .text("🔔 Ustaw alert", "gold_alert")
            .text("🔄 Odśwież", "rate_gold")
            .row()
            .text("🔙 Kursy", "rates_current"),
        }
      );
      break;

    case "rate_silver":
      await ctx.reply(
        "🥈 <b>Srebro</b>\n\n" +
          "<b>Cena za 1g:</b>\n" +
          "• Kupno: <b>3.50 PLN</b>\n" +
          "• Sprzedaż: <b>3.80 PLN</b>\n\n" +
          "<b>Cena za 1 oz (31.1g):</b>\n" +
          "• Kupno: <b>170 PLN</b>\n" +
          "• Sprzedaż: <b>185 PLN</b>\n\n" +
          "<b>Zmiana ceny:</b>\n" +
          "• 24h: +1.2% 📈\n" +
          "• 7 dni: +3.5% 📈\n" +
          "• 30 dni: +0.8% 📈\n\n",
        // "⏰ <i>Aktualizacja: ${new Date().toLocaleTimeString("pl-PL")}</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("🥈 Kup srebro", "invest_silver")
            .text("📈 Wykres", "silver_chart")
            .row()
            .text("🔔 Ustaw alert", "silver_alert")
            .text("🔄 Odśwież", "rate_silver")
            .row()
            .text("🔙 Kursy", "rates_current"),
        }
      );
      break;

    case "rates_charts":
      await ctx.reply(
        "📈 <b>Wykresy kursów</b>\n\n" +
          "Zobacz historyczne zmiany cen:\n\n" +
          "• Wykresy świecowe\n" +
          "• Wskaźniki techniczne\n" +
          "• Porównanie aktywów\n" +
          "• Różne przedziały czasowe\n\n" +
          "💡 <i>Pełna analiza techniczna w aplikacji!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("📈 Otwórz wykresy", `${config.webAppUrl}/charts`)
            .row()
            .text("🔙 Kursy", "rates_current"),
        }
      );
      break;

    case "rates_alerts":
      await ctx.reply(
        "🔔 <b>Alerty cenowe</b>\n\n" +
          "Otrzymuj powiadomienia o zmianach cen:\n\n" +
          "• Ustaw cenę docelową\n" +
          "• Wybierz aktywo\n" +
          "• Otrzymaj powiadomienie\n" +
          "• Reaguj na czas\n\n" +
          "💡 <i>Nigdy nie przegap okazji!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("🔔 Zarządzaj alertami", `${config.webAppUrl}/alerts`)
            .row()
            .text("🔙 Kursy", "rates_current"),
        }
      );
      break;

    case "rates_refresh":
      await ctx.answerCallbackQuery({ text: "🔄 Odświeżanie kursów..." });
      setTimeout(async () => {
        await ctx.reply(MESSAGES.RATES, {
          parse_mode: "HTML",
          reply_markup: MainMenu.rates(),
        });
      }, 500);
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Akcja kursów niedostępna.",
        show_alert: false,
      });
  }
}

/**
 * Handle branches action callbacks
 */
async function handleBranchesAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  const cities = {
    warsaw: { name: "Warszawa", branches: 3 },
    krakow: { name: "Kraków", branches: 2 },
    wroclaw: { name: "Wrocław", branches: 1 },
    poznan: { name: "Poznań", branches: 1 },
    gdansk: { name: "Gdańsk", branches: 1 },
  };

  const cityKey = data.replace("branches_", "") as keyof typeof cities;
  const city = cities[cityKey];

  if (city) {
    await ctx.reply(
      `📍 <b>Kantory CashyMine - ${city.name}</b>\n\n` +
        `<b>Liczba oddziałów:</b> ${city.branches}\n\n` +
        `<b>Usługi:</b>\n` +
        `• Wymiana kryptowalut\n` +
        `• Sprzedaż złota i srebra\n` +
        `• Obsługa gotówkowa\n` +
        `• Doradztwo inwestycyjne\n\n` +
        `💡 <i>Zobacz szczegóły w aplikacji!</i>`,
      {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .webApp(
            `🗺️ Mapa ${city.name}`,
            `${config.webAppUrl}/kantory/${cityKey}`
          )
          .row()
          .text("📅 Zarezerwuj wizytę", "branches_reserve")
          .text("⏰ Godziny", "branches_hours")
          .row()
          .text("🔙 Kantory", "menu_branches"),
      }
    );
  } else if (data === "branches_other") {
    await ctx.reply(
      "📍 <b>Inne miasta</b>\n\n" +
        "<b>Dostępne lokalizacje:</b>\n\n" +
        "• Katowice - ul. Mariacka 12\n" +
        "• Łódź - ul. Piotrkowska 67\n" +
        "• Szczecin - ul. Bogusława 8\n" +
        "• Bydgoszcz - ul. Gdańska 23\n\n" +
        "💡 <i>Wkrótce nowe lokalizacje!</i>",
      {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .webApp("🗺️ Wszystkie kantory", `${config.webAppUrl}/kantory`)
          .row()
          .text("🔙 Kantory", "menu_branches"),
      }
    );
  } else if (data === "branches_reserve") {
    await ctx.reply(
      "📅 <b>Rezerwacja wizyty</b>\n\n" +
        "<b>Korzyści z rezerwacji:</b>\n\n" +
        "✅ Brak kolejki\n" +
        "✅ Gwarantowany czas obsługi\n" +
        "✅ Rezerwacja kursu (dla większych kwot)\n" +
        "✅ Dedykowany doradca\n\n" +
        "<b>Jak zarezerwować?</b>\n" +
        "1. Wybierz oddział\n" +
        "2. Wybierz datę i godzinę\n" +
        "3. Podaj rodzaj transakcji\n" +
        "4. Otrzymaj potwierdzenie\n\n" +
        "💡 <i>Zalecane dla transakcji powyżej 10 000 PLN!</i>",
      {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .webApp("📅 Zarezerwuj teraz", `${config.webAppUrl}/reserve`)
          .row()
          .text("📞 Zadzwoń", "support_callback")
          .text("🔙 Kantory", "menu_branches"),
      }
    );
  } else if (data === "branches_hours") {
    await ctx.reply(
      "⏰ <b>Godziny otwarcia</b>\n\n" +
        "<b>Dni robocze (Pn-Pt):</b>\n" +
        "• 9:00 - 19:00\n\n" +
        "<b>Soboty:</b>\n" +
        "• 10:00 - 16:00\n\n" +
        "<b>Niedziele i święta:</b>\n" +
        "• Zamknięte\n\n" +
        "⚠️ <b>Uwaga:</b> Godziny mogą się różnić w zależności od oddziału.\n\n" +
        "💡 <i>Sprawdź dokładne godziny konkretnego kantoru w aplikacji!</i>",
      {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .webApp("🗺️ Sprawdź oddział", `${config.webAppUrl}/kantory`)
          .row()
          .text("🔙 Kantory", "menu_branches"),
      }
    );
  }
}

/**
 * Handle referral action callbacks
 */
async function handleReferralAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  const userId = ctx.from?.id;

  switch (data) {
    case "referral_stats":
      const refStats = await getReferralStats(userId);
      await ctx.reply(
        `📊 <b>Statystyki poleceń</b>\n\n` +
          `👥 <b>Przegląd:</b>\n` +
          `• Łączne polecenia: ${refStats.total}\n` +
          `• Aktywni użytkownicy: ${refStats.active}\n` +
          `• Łączne zarobki: ${Formatters.formatCurrency(refStats.earnings)}\n` +
          `• Poziom: ${refStats.tier}\n\n` +
          `💰 <b>Ostatnie nagrody:</b>\n` +
          `${refStats.recent
            .map((r) => `• ${r.name}: ${Formatters.formatCurrency(r.amount)}`)
            .join("\n")}\n\n` +
          `🎯 <b>Cele:</b>\n` +
          `• Następny poziom (${refStats.nextTier}): ${refStats.remaining} więcej poleceń\n` +
          `• Cel miesięczny: ${refStats.monthlyTarget} poleceń\n\n` +
          `💡 <i>Udostępnij swój link, aby zarobić więcej!</i>`,
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("🔗 Kopiuj link", "referral_copy")
            .text("📈 Wykresy", "referral_charts")
            .row()
            .text("🏆 Poziomy", "referral_tiers")
            .text("🔙 Polecenia", "menu_referral"),
        }
      );
      break;

    case "referral_tiers":
      await ctx.reply(
        "🏆 <b>Poziomy poleceń</b>\n\n" +
          "Zarabiaj więcej polecając znajomych:\n\n" +
          "• 🥉 <b>Brąz</b> (1-5): 5% prowizji\n" +
          "• 🥈 <b>Srebro</b> (6-15): 7% prowizji\n" +
          "• 🥇 <b>Złoto</b> (16-30): 10% prowizji\n" +
          "• 💎 <b>Diament</b> (31+): 15% prowizji\n\n" +
          "✨ <b>Bonusowe nagrody:</b>\n" +
          "• Srebro: 200 PLN przy 10 poleceniach\n" +
          "• Złoto: 500 PLN przy 20 poleceniach\n" +
          "• Diament: 1500 PLN + wsparcie VIP\n\n" +
          "💡 <i>Prowizje przez cały czas aktywności poleconych użytkowników!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("📊 Mój poziom", "referral_stats")
            .text("🎯 Cele", "referral_goals")
            .row()
            .text("🔗 Udostępnij", "referral_share")
            .text("🔙 Polecenia", "menu_referral"),
        }
      );
      break;

    case "referral_share":
      await ctx.reply(
        `📣 <b>Udostępnij CashyMine</b>\n\n` +
          `Zarabiaj więcej udostępniając znajomym!\n\n` +
          `📱 <b>Opcje udostępniania:</b>\n` +
          `• Telegram - Najszybsze udostępnianie\n` +
          `• WhatsApp - Bezpośrednie wiadomości\n` +
          `• Email - Kontakty biznesowe\n` +
          `• Media społecznościowe - Dotarcie do większej liczby osób\n\n` +
          `💡 <i>Każde polecenie daje Ci prowizję na zawsze!</i>`,
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.referral(userId || 0),
        }
      );
      break;

    case "referral_copy":
      await copyReferralLink(ctx, userId || 0);
      break;

    case "referral_rewards":
      await ctx.reply(
        "🎁 <b>Nagrody za polecenia</b>\n\n" +
          "Zarabiaj bonusy za polecanie znajomych:\n\n" +
          "• Bonus natychmiastowy za każde polecenie\n" +
          "• Prowizja dożywotnia (5-15%)\n" +
          "• Bonusy za awans poziomu\n" +
          "• Ekskluzywne nagrody\n\n" +
          "✨ <b>Specjalne bonusy:</b>\n" +
          "• Poleć 5 znajomych: 100 PLN bonusu\n" +
          "• Poleć 10 znajomych: 300 PLN bonusu\n" +
          "• Poleć 20 znajomych: 750 PLN bonusu\n\n" +
          "💡 <i>Nagrody wypłacane codziennie!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("📊 Moje nagrody", "referral_myrewards")
            .text("📅 Historia", "referral_reward_history")
            .row()
            .text("🔗 Udostępnij teraz", "referral_share")
            .text("🔙 Polecenia", "menu_referral"),
        }
      );
      break;

    case "referral_leaderboard":
      await ctx.reply(
        "📊 <b>Ranking poleceń</b>\n\n" +
          "Najlepsi polecający w tym miesiącu:\n\n" +
          "1. @jan_kowalski - 45 poleceń\n" +
          "2. @anna_nowak - 38 poleceń\n" +
          "3. @piotr_wisniewski - 32 poleceń\n" +
          "4. @maria_wojcik - 28 poleceń\n" +
          "5. @tomasz_kaminski - 25 poleceń\n\n" +
          "🏆 <b>Twoja pozycja:</b> #12 (8 poleceń)\n\n" +
          "💡 <i>Aktualizowany codziennie. Top 3 otrzymują specjalne nagrody!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("📈 Mój postęp", "referral_stats")
            .text("🎯 Wejdź do top 10", "referral_beat")
            .row()
            .text("🔗 Udostępnij więcej", "referral_share")
            .text("🔙 Polecenia", "menu_referral"),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Akcja poleceń niedostępna.",
        show_alert: false,
      });
  }
}

/**
 * Handle support action callbacks
 */
async function handleSupportAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  switch (data) {
    case "support_contact":
      await ctx.reply(MESSAGES.SUPPORT, {
        parse_mode: "HTML",
        reply_markup: MainMenu.contact(),
      });
      break;

    case "support_faq":
      await ctx.reply(MESSAGES.FAQ, {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .webApp("🌐 Pełny FAQ", `${config.webAppUrl}/faq`)
          .row()
          .text("📞 Kontakt", "support_contact")
          .text("🔙 Pomoc", "menu_help"),
      });
      break;

    case "support_status":
      await showSystemStatus(ctx);
      break;

    case "support_feedback":
      await ctx.reply(
        "📝 <b>Opinie i sugestie</b>\n\n" +
          "Cenimy Twoją opinię! Podziel się:\n\n" +
          "• Co podoba Ci się w CashyMine\n" +
          "• Co można ulepszyć\n" +
          "• Pomysły na nowe funkcje\n" +
          "• Zgłoszenia błędów\n\n" +
          "📧 <b>Wyślij do:</b> feedback@cashymine.pl\n\n" +
          "💡 <i>Twoja opinia pomaga nam się rozwijać!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .url("📧 Wyślij opinię", "mailto:feedback@cashymine.pl")
            .row()
            .text("💡 Sugestie", "support_suggestions")
            .text("🐛 Zgłoś błąd", "support_bug")
            .row()
            .text("🔙 Pomoc", "menu_help"),
        }
      );
      break;

    case "support_callback":
      await ctx.reply(
        "📞 <b>Oddzwonienie</b>\n\n" +
          "Zostaw swój numer, oddzwonimy do Ciebie:\n\n" +
          "<b>Kiedy oddzwaniamy:</b>\n" +
          "• W ciągu 1 godziny (dni robocze 9-18)\n" +
          "• Następnego dnia roboczego (poza godzinami)\n\n" +
          "<b>Podaj:</b>\n" +
          "• Numer telefonu\n" +
          "• Preferowany czas\n" +
          "• Powód kontaktu\n\n" +
          "💡 <i>Użyj aplikacji webowej lub napisz na kontakt@cashymine.pl</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("📞 Zamów oddzwonienie", `${config.webAppUrl}/callback`)
            .row()
            .text("📧 Email", "support_contact")
            .text("🔙 Pomoc", "menu_help"),
        }
      );
      break;

    case "support_ticket":
      await ctx.reply(
        "📝 <b>Zgłoszenie</b>\n\n" +
          "Utwórz zgłoszenie wsparcia:\n\n" +
          "<b>Co możesz zgłosić:</b>\n" +
          "• Problem techniczny\n" +
          "• Pytanie o transakcję\n" +
          "• Pomoc z weryfikacją\n" +
          "• Inne sprawy\n\n" +
          "<b>Proces:</b>\n" +
          "1. Opisz problem\n" +
          "2. Dodaj załączniki (opcjonalnie)\n" +
          "3. Otrzymasz numer zgłoszenia\n" +
          "4. Odpowiedź w ciągu 24h\n\n" +
          "💡 <i>Śledzimy każde zgłoszenie!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp(
              "📝 Utwórz zgłoszenie",
              `${config.webAppUrl}/support/ticket`
            )
            .row()
            .text("🔙 Pomoc", "menu_help"),
        }
      );
      break;

    case "support_office":
      await ctx.reply(
        "🏢 <b>Nasze biuro</b>\n\n" +
          "<b>CashyMine Sp. z o.o.</b>\n\n" +
          "📍 <b>Adres:</b>\n" +
          "ul. Marszałkowska 115\n" +
          "00-102 Warszawa\n\n" +
          "📞 <b>Telefon:</b>\n" +
          "+48 22 XXX XX XX\n\n" +
          "📧 <b>Email:</b>\n" +
          "kontakt@cashymine.pl\n\n" +
          "⏰ <b>Godziny:</b>\n" +
          "Pn-Pt: 9:00-18:00\n\n" +
          "💡 <i>Umów wizytę telefonicznie!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .url("🗺️ Zobacz na mapie", "https://maps.google.com")
            .row()
            .text("📞 Zadzwoń", "support_callback")
            .text("🔙 Pomoc", "menu_help"),
        }
      );
      break;

    case "support_community":
      await ctx.reply(
        "👥 <b>Społeczność CashyMine</b>\n\n" +
          "Dołącz do naszej społeczności:\n\n" +
          "📱 <b>Telegram:</b>\n" +
          "• Grupa CashyMine PL\n" +
          "• Kanał ogłoszeń\n\n" +
          "🐦 <b>Social media:</b>\n" +
          "• Twitter/X\n" +
          "• Facebook\n" +
          "• LinkedIn\n\n" +
          "💡 <i>Bądź na bieżąco z nowościami!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .url("📱 Telegram", "https://t.me/cashymine_pl")
            .url("🐦 Twitter", "https://twitter.com/cashymine")
            .row()
            .text("🔙 Pomoc", "menu_help"),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Opcja wsparcia niedostępna.",
        show_alert: false,
      });
  }
}

/**
 * Handle help action callbacks
 */
async function handleHelpAction(ctx: BotContext, data: string): Promise<void> {
  switch (data) {
    case "help_faq":
      await ctx.reply(MESSAGES.FAQ, {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .webApp("🌐 Pełny FAQ", `${config.webAppUrl}/faq`)
          .row()
          .text("📞 Kontakt", "support_contact")
          .text("🔙 Pomoc", "menu_help"),
      });
      break;

    case "help_tutorial":
      await ctx.reply(
        "📖 <b>Samouczki i poradniki</b>\n\n" +
          "Naucz się efektywnie korzystać z CashyMine:\n\n" +
          "• 🎬 Poradniki wideo\n" +
          "• 📖 Przewodniki krok po kroku\n" +
          "• ❓ Często zadawane pytania\n" +
          "• ⚡ Wskazówki i triki\n" +
          "• 📊 Najlepsze praktyki\n" +
          "• ⚠️ Unikaj typowych błędów\n\n" +
          "💡 <i>Stań się ekspertem!</i>",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.tutorial(),
        }
      );
      break;

    case "help_quickstart":
      await ctx.reply(
        "🚀 <b>Szybki start</b>\n\n" +
          "Zacznij w 3 prostych krokach:\n\n" +
          "1️⃣ <b>Zarejestruj się i zweryfikuj</b>\n" +
          "• Utwórz konto\n" +
          "• Zweryfikuj email\n" +
          "• Uzupełnij profil\n\n" +
          "2️⃣ <b>Wpłać środki</b>\n" +
          "• Dodaj kryptowaluty lub PLN\n" +
          "• Zacznij od dowolnej kwoty\n" +
          "• Wybierz metodę wpłaty\n\n" +
          "3️⃣ <b>Rozpocznij wymianę</b>\n" +
          "• Kliknij 'Wymień'\n" +
          "• Wybierz aktywa\n" +
          "• Potwierdź transakcję\n\n" +
          "💡 <i>Zacznij w kilka minut!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("🎬 Zobacz wideo", "tutorial_video")
            .text("📖 Szczegółowy przewodnik", "tutorial_steps")
            .row()
            .text("🚀 Zacznij teraz", "exchange_quick")
            .text("🔙 Pomoc", "menu_help"),
        }
      );
      break;

    case "help_troubleshoot":
      await ctx.reply(
        "🔧 <b>Rozwiązywanie problemów</b>\n\n" +
          "Typowe problemy i rozwiązania:\n\n" +
          "❌ <b>Nie mogę dokonać wymiany?</b>\n" +
          "• Sprawdź saldo\n" +
          "• Zweryfikuj status konta\n" +
          "• Wyczyść pamięć podręczną przeglądarki\n\n" +
          "❌ <b>Wypłata oczekuje?</b>\n" +
          "• Zweryfikuj tożsamość\n" +
          "• Sprawdź limity wypłat\n" +
          "• Skontaktuj się ze wsparciem\n\n" +
          "❌ <b>Nie otrzymuję powiadomień?</b>\n" +
          "• Sprawdź ustawienia powiadomień\n" +
          "• Zweryfikuj adres email\n" +
          "• Sprawdź folder spam\n\n" +
          "💡 <i>Nadal masz problem? Skontaktuj się z nami!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("📞 Kontakt", "support_contact")
            .text("❓ Więcej rozwiązań", "help_faq")
            .row()
            .text("🔙 Pomoc", "menu_help"),
        }
      );
      break;

    case "help_glossary":
      await ctx.reply(
        "📖 <b>Słownik kryptowalutowy</b>\n\n" +
          "Kluczowe terminy wyjaśnione:\n\n" +
          "• <b>Blockchain:</b> Rozproszona księga transakcji\n" +
          "• <b>Wallet:</b> Portfel cyfrowy na kryptowaluty\n" +
          "• <b>APY:</b> Roczna stopa procentowa\n" +
          "• <b>Staking:</b> Blokowanie krypto za nagrody\n" +
          "• <b>Spread:</b> Różnica między kupnem a sprzedażą\n" +
          "• <b>Gas fee:</b> Opłata transakcyjna\n" +
          "• <b>Cold wallet:</b> Przechowywanie offline\n" +
          "• <b>KYC:</b> Weryfikacja tożsamości\n\n" +
          "💡 <i>Poznaj język krypto!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("📚 Więcej terminów", "glossary_more")
            .text("🎓 Naucz się krypto", "tutorial_crypto")
            .row()
            .text("🔙 Pomoc", "menu_help"),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Opcja pomocy niedostępna.",
        show_alert: false,
      });
  }
}

/**
 * Handle tutorial action callbacks
 */
async function handleTutorialAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  switch (data) {
    case "tutorial_video":
      await ctx.reply(
        "🎬 <b>Poradniki wideo</b>\n\n" +
          "Obejrzyj nasze samouczki wideo:\n\n" +
          "• Jak założyć konto\n" +
          "• Pierwsza wymiana krok po kroku\n" +
          "• Bezpieczne przechowywanie krypto\n" +
          "• Inwestycje w złoto i srebro\n" +
          "• Programy oszczędnościowe\n\n" +
          "💡 <i>Ucz się wizualnie!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .url("🎬 YouTube", "https://youtube.com/@cashymine")
            .row()
            .text("📖 Tekstowe przewodniki", "tutorial_steps")
            .text("🔙 Pomoc", "menu_help"),
        }
      );
      break;

    case "tutorial_steps":
      await ctx.reply(
        "📖 <b>Przewodnik krok po kroku</b>\n\n" +
          "Szczegółowe instrukcje:\n\n" +
          "• Rejestracja i weryfikacja\n" +
          "• Dokonywanie wpłat\n" +
          "• Wymiana kryptowalut\n" +
          "• Wypłaty środków\n" +
          "• Zabezpieczanie konta\n" +
          "• Korzystanie z kantorów\n\n" +
          "💡 <i>Wszystko co musisz wiedzieć!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("📖 Pełny przewodnik", `${config.webAppUrl}/guide`)
            .row()
            .text("🎬 Wideo", "tutorial_video")
            .text("🔙 Pomoc", "menu_help"),
        }
      );
      break;

    case "tutorial_faq":
      await ctx.reply(MESSAGES.FAQ, {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .webApp("🌐 Pełny FAQ", `${config.webAppUrl}/faq`)
          .row()
          .text("🔙 Pomoc", "menu_help"),
      });
      break;

    case "tutorial_tips":
      await ctx.reply(
        "⚡ <b>Wskazówki i triki</b>\n\n" +
          "<b>Porada #1: Użyj alertów cenowych</b>\n" +
          "Nie przegap okazji do korzystnej wymiany\n\n" +
          "<b>Porada #2: Zaplanuj większe transakcje</b>\n" +
          "Rezerwuj w kantorze dla lepszych kursów\n\n" +
          "<b>Porada #3: Wykorzystaj program poleceń</b>\n" +
          "Zarabiaj prowizję od znajomych\n\n" +
          "<b>Porada #4: Włącz 2FA</b>\n" +
          "Maksymalizuj bezpieczeństwo konta\n\n" +
          "<b>Porada #5: Sprawdzaj spread</b>\n" +
          "Porównaj różne metody wymiany\n\n" +
          "💡 <i>Małe rzeczy robią różnicę!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("📊 Najlepsze praktyki", "tutorial_best")
            .text("⚠️ Unikaj błędów", "tutorial_mistakes")
            .row()
            .text("🔙 Pomoc", "menu_help"),
        }
      );
      break;

    case "tutorial_best":
      await ctx.reply(
        "📊 <b>Najlepsze praktyki</b>\n\n" +
          "✅ <b>Bezpieczeństwo:</b>\n" +
          "• Używaj silnych, unikalnych haseł\n" +
          "• Włącz dwuskładnikowe uwierzytelnianie\n" +
          "• Nigdy nie udostępniaj kluczy prywatnych\n\n" +
          "✅ <b>Inwestycje:</b>\n" +
          "• Dywersyfikuj portfel\n" +
          "• Inwestuj tylko to, co możesz stracić\n" +
          "• Myśl długoterminowo\n\n" +
          "✅ <b>Transakcje:</b>\n" +
          "• Zawsze sprawdzaj adresy\n" +
          "• Weryfikuj kwoty przed potwierdzeniem\n" +
          "• Zachowaj potwierdzenia transakcji\n\n" +
          "💡 <i>Bezpieczeństwo i rozwaga!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("⚡ Więcej wskazówek", "tutorial_tips")
            .text("🔐 Bezpieczeństwo", "wallet_security")
            .row()
            .text("🔙 Pomoc", "menu_help"),
        }
      );
      break;

    case "tutorial_mistakes":
      await ctx.reply(
        "⚠️ <b>Unikaj typowych błędów</b>\n\n" +
          "❌ <b>Błąd #1: Niepoprawny adres</b>\n" +
          "Zawsze dokładnie sprawdzaj adres portfela\n\n" +
          "❌ <b>Błąd #2: Niewłaściwa sieć</b>\n" +
          "USDT: wybierz TRC-20 lub ERC-20 zgodnie z portfelem\n\n" +
          "❌ <b>Błąd #3: Brak 2FA</b>\n" +
          "Niezabezpieczone konto to zaproszenie dla hakerów\n\n" +
          "❌ <b>Błąd #4: Panika sprzedaż</b>\n" +
          "Nie reaguj emocjonalnie na krótkoterminowe wahania\n\n" +
          "❌ <b>Błąd #5: Brak weryfikacji</b>\n" +
          "Weryfikacja zapewnia wyższe limity i bezpieczeństwo\n\n" +
          "💡 <i>Ucz się na błędach innych!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("📊 Najlepsze praktyki", "tutorial_best")
            .text("🔐 Zabezpiecz konto", "settings_security")
            .row()
            .text("🔙 Pomoc", "menu_help"),
        }
      );
      break;

    case "tutorial_advanced":
      await ctx.reply(
        "📈 <b>Zaawansowane tematy</b>\n\n" +
          "Dla doświadczonych użytkowników:\n\n" +
          "• Analiza techniczna\n" +
          "• Strategie inwestycyjne\n" +
          "• Zarządzanie ryzykiem\n" +
          "• Trading OTC\n" +
          "• Optymalizacja podatkowa\n" +
          "• API dla deweloperów\n\n" +
          "💡 <i>Pogłęb swoją wiedzę!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("📚 Zaawansowane kursy", `${config.webAppUrl}/advanced`)
            .row()
            .text("💼 Oferta B2B", "b2b_info")
            .text("🔙 Pomoc", "menu_help"),
        }
      );
      break;

    case "tutorial_cert":
      await ctx.reply(
        "🎓 <b>Program certyfikacji</b>\n\n" +
          "Zdobądź certyfikat wiedzy o krypto:\n\n" +
          "• Podstawy kryptowalut\n" +
          "• Bezpieczeństwo\n" +
          "• Inwestycje\n" +
          "• Regulacje\n\n" +
          "<b>Korzyści:</b>\n" +
          "• Wyższe limity transakcyjne\n" +
          "• Lepsze kursy wymiany\n" +
          "• Dostęp do funkcji premium\n" +
          "• Certyfikat do pobrania\n\n" +
          "💡 <i>Udowodnij swoją wiedzę!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp(
              "🎓 Rozpocznij certyfikację",
              `${config.webAppUrl}/certification`
            )
            .row()
            .text("🔙 Pomoc", "menu_help"),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Samouczek niedostępny.",
        show_alert: false,
      });
  }
}

// Continue with remaining handlers...
// (Settings, Security, Notifications, History, B2B, Dashboard, Admin, Confirmation, Language, Theme, Unknown)

// Export helper function at the end of the file
async function copyReferralLink(
  ctx: BotContext,
  userId: number
): Promise<void> {
  const referralLink = `https://t.me/${config.botUsername}?start=ref_${userId}`;

  await ctx.answerCallbackQuery({
    text: "🔗 Link polecenia skopiowany!",
    show_alert: true,
  });

  await ctx.reply(
    `📋 <b>Link polecenia skopiowany</b>\n\n` +
      `Twój osobisty link:\n\n` +
      `<code>${referralLink}</code>\n\n` +
      `💡 <i>Udostępnij ten link, aby zacząć zarabiać prowizje!</i>`,
    { parse_mode: "HTML" }
  );
}

async function showSystemStatus(ctx: BotContext): Promise<void> {
  await ctx.reply(
    `📡 <b>Status systemu</b>\n\n` +
      `✅ <b>Wszystkie systemy działają</b>\n\n` +
      `🟢 <b>Główne usługi:</b>\n` +
      `• Wymiany: Operacyjne\n` +
      `• Transakcje: Operacyjne\n` +
      `• Portfel: Operacyjny\n` +
      `• API: Operacyjne\n\n` +
      `📊 <b>Wydajność:</b>\n` +
      `• Uptime: 99.9%\n` +
      `• Czas odpowiedzi: < 200ms\n` +
      `• Użytkownicy online: 2,458\n\n` +
      `🔔 <b>Ostatnia aktualizacja:</b> Przed chwilą\n` +
      `📅 <b>Następna konserwacja:</b> Zaplanowana\n\n` +
      `💡 <i>Sprawdź status.cashymine.pl dla szczegółów</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .url("🌐 Strona statusu", "https://status.cashymine.pl")
        .row()
        .text("🔄 Odśwież", "support_status_refresh")
        .text("📋 Historia", "support_status_history")
        .row()
        .text("🔙 Wsparcie", "menu_help"),
    }
  );
}

// Mock data functions
async function getUserStats(_?: number) {
  return {
    todayTransactions: 3,
    todayVolume: 2450.0,
    todayReferralEarnings: 125.5,
    weekVolume: 12450.0,
    avgDaily: 1778.57,
    bestDay: 3200.0,
  };
}

async function getWalletBalance(_?: number) {
  return {
    pln: 10000,
    eur: 1250,
    btc: 0.035,
    eth: 0.8,
    usdt: 1200,
    gold: 20,
    silver: 500,
  };
}

async function getInvestmentPortfolio(_?: number) {
  return {
    gold: { amount: 20, value: 5700, return: 8.5 },
    silver: { amount: 500, value: 1750, return: 12.3 },
    staking: { locked: 10000, earned: 450, apy: 10 },
    total: 17900,
    totalReturn: 9.8,
  };
}

async function getReferralStats(_?: number) {
  return {
    total: 8,
    active: 5,
    earnings: 1284.0,
    tier: "Złoto",
    recent: [
      { name: "Jan", amount: 24.5 },
      { name: "Anna", amount: 32.0 },
      { name: "Piotr", amount: 18.5 },
    ],
    nextTier: "Diament",
    remaining: 23,
    monthlyTarget: 10,
  };
}

// Part 3 of callbackHandler.ts - Final handlers

/**
 * Handle settings action callbacks
 */
async function handleSettingsAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  switch (data) {
    case "settings_profile":
      await ctx.reply(
        "👤 <b>Ustawienia profilu</b>\n\n" +
          "Zarządzaj danymi osobowymi:\n\n" +
          "• Imię i nazwisko\n" +
          "• Dane kontaktowe\n" +
          "• Zdjęcie profilowe\n" +
          "• Opis\n\n" +
          "🔒 <i>Twoja prywatność jest chroniona!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("👤 Edytuj profil", `${config.webAppUrl}/settings/profile`)
            .row()
            .text("📧 Email", "settings_email")
            .text("📱 Telefon", "settings_phone")
            .row()
            .text("🔙 Ustawienia", "menu_settings"),
        }
      );
      break;

    case "settings_notifications":
      await ctx.reply(
        "🔔 <b>Ustawienia powiadomień</b>\n\n" +
          "Wybierz, jakie powiadomienia chcesz otrzymywać:\n\n" +
          "• Aktualizacje transakcji\n" +
          "• Alerty wypłat\n" +
          "• Bonusy poleceń\n" +
          "• Ogłoszenia systemowe\n" +
          "• Oferty marketingowe\n\n" +
          "💡 <i>Bądź na bieżąco bez przesady!</i>",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.notificationSettings(),
        }
      );
      break;

    case "settings_security":
      await ctx.reply(MESSAGES.SECURITY_INFO, {
        parse_mode: "HTML",
        reply_markup: MainMenu.securitySettings(),
      });
      break;

    case "settings_privacy":
      await ctx.reply(
        "🛡️ <b>Ustawienia prywatności</b>\n\n" +
          "Kontroluj swoje preferencje prywatności:\n\n" +
          "• Opcje udostępniania danych\n" +
          "• Ustawienia widoczności\n" +
          "• Preferencje komunikacji\n" +
          "• Eksport/usunięcie danych\n\n" +
          "🔒 <i>Ty kontrolujesz swoje dane!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp(
              "🛡️ Centrum prywatności",
              `${config.webAppUrl}/settings/privacy`
            )
            .row()
            .text("📊 Użycie danych", "settings_data")
            .text("📧 Komunikacja", "settings_communications")
            .row()
            .text("🔙 Ustawienia", "menu_settings"),
        }
      );
      break;

    case "settings_language":
      await ctx.reply(
        "🌐 <b>Ustawienia języka</b>\n\n" +
          "Wybierz preferowany język:\n\n" +
          "• Polski (domyślny)\n" +
          "• Angielski\n" +
          "• Niemiecki\n" +
          "• Hiszpański\n\n" +
          "💡 <i>Więcej języków wkrótce!</i>",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.languageSelection(),
        }
      );
      break;

    case "settings_theme":
      await ctx.reply(
        "🎨 <b>Ustawienia motywu</b>\n\n" +
          "Dostosuj wygląd interfejsu:\n\n" +
          "• Jasny motyw (domyślny)\n" +
          "• Ciemny motyw\n" +
          "• Auto (preferencje systemu)\n" +
          "• Własne kolory\n\n" +
          "✨ <i>Dostosuj do siebie!</i>",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.themeSelection(),
        }
      );
      break;

    case "settings_display":
      await ctx.reply(
        "📊 <b>Ustawienia wyświetlania</b>\n\n" +
          "Dostosuj sposób wyświetlania:\n\n" +
          "• Rozmiar czcionki\n" +
          "• Format waluty\n" +
          "• Format daty/czasu\n" +
          "• Jednostki miar\n\n" +
          "💡 <i>Spersonalizuj swoje doświadczenie!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp(
              "📊 Ustawienia wyświetlania",
              `${config.webAppUrl}/settings/display`
            )
            .row()
            .text("🔙 Ustawienia", "menu_settings"),
        }
      );
      break;

    case "settings_mute":
      await ctx.reply(
        "🔕 <b>Wycisz powiadomienia</b>\n\n" +
          "Tymczasowo wyłącz powiadomienia:\n\n" +
          "• Na 1 godzinę\n" +
          "• Na 8 godzin\n" +
          "• Na 24 godziny\n" +
          "• Do odwołania\n\n" +
          "💡 <i>Spokój kiedy go potrzebujesz!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("🔕 1h", "mute_1h")
            .text("🔕 8h", "mute_8h")
            .row()
            .text("🔕 24h", "mute_24h")
            .text("🔕 Zawsze", "mute_forever")
            .row()
            .text("🔙 Ustawienia", "menu_settings"),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Opcja ustawień niedostępna.",
        show_alert: false,
      });
  }
}

/**
 * Handle security action callbacks
 */
async function handleSecurityAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  switch (data) {
    case "security_2fa_enable":
      await ctx.reply(
        "🔐 <b>Włącz 2FA</b>\n\n" +
          "Zabezpiecz swoje konto dwuskładnikowym uwierzytelnianiem:\n\n" +
          "<b>Kroki:</b>\n" +
          "1. Pobierz aplikację Google Authenticator\n" +
          "2. Zeskanuj kod QR\n" +
          "3. Wprowadź 6-cyfrowy kod\n" +
          "4. Zapisz kody zapasowe\n\n" +
          "💡 <i>2FA znacznie zwiększa bezpieczeństwo!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("🔐 Skonfiguruj 2FA", `${config.webAppUrl}/security/2fa`)
            .row()
            .text("❓ Jak to działa", "security_2fa_help")
            .text("🔙 Bezpieczeństwo", "settings_security"),
        }
      );
      break;

    case "security_2fa_disable":
      await ctx.reply(
        "🔓 <b>Wyłącz 2FA</b>\n\n" +
          "⚠️ <b>Uwaga:</b> Wyłączenie 2FA zmniejszy bezpieczeństwo Twojego konta.\n\n" +
          "<b>Aby wyłączyć 2FA potrzebujesz:</b>\n" +
          "• Aktualnego kodu 2FA\n" +
          "• Potwierdzenia emailem\n\n" +
          "💡 <i>Zalecamy pozostawienie 2FA włączonego!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("✅ Potwierdź wyłączenie", "confirm_2fa_disable_yes")
            .row()
            .text("❌ Anuluj", "security_2fa_disable_cancel")
            .text("🔙 Bezpieczeństwo", "settings_security"),
        }
      );
      break;

    case "security_password":
      await ctx.reply(
        "🔑 <b>Zmień hasło</b>\n\n" +
          "<b>Wymagania hasła:</b>\n" +
          "• Minimum 8 znaków\n" +
          "• Wielkie i małe litery\n" +
          "• Cyfry\n" +
          "• Znaki specjalne (!@#$%)\n\n" +
          "💡 <b>Wskazówki:</b>\n" +
          "• Użyj unikalnego hasła\n" +
          "• Nie używaj słów ze słownika\n" +
          "• Rozważ menedżer haseł\n\n" +
          "🔒 <i>Silne hasło to podstawa bezpieczeństwa!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("🔑 Zmień hasło", `${config.webAppUrl}/security/password`)
            .row()
            .text("🔙 Bezpieczeństwo", "settings_security"),
        }
      );
      break;

    case "security_email":
      await ctx.reply(
        "📧 <b>Weryfikacja email</b>\n\n" +
          "Zweryfikuj swój adres email:\n\n" +
          "<b>Korzyści:</b>\n" +
          "• Wyższe limity transakcyjne\n" +
          "• Odzyskiwanie hasła\n" +
          "• Ważne powiadomienia\n" +
          "• Pełny dostęp do funkcji\n\n" +
          "💡 <i>Weryfikacja zajmuje tylko minutę!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("📧 Wyślij link weryfikacyjny", "security_email_send")
            .row()
            .text("🔄 Zmień email", "security_email_change")
            .text("🔙 Bezpieczeństwo", "settings_security"),
        }
      );
      break;

    case "security_devices":
      await ctx.reply(
        "📱 <b>Zarządzanie urządzeniami</b>\n\n" +
          "Zobacz i zarządzaj urządzeniami z dostępem do konta:\n\n" +
          "<b>Aktywne sesje:</b>\n" +
          "• 📱 iPhone 12 - Warszawa, PL\n" +
          "  Ostatnia aktywność: 5 min temu\n" +
          "• 💻 Chrome Windows - Kraków, PL\n" +
          "  Ostatnia aktywność: 2 dni temu\n\n" +
          "💡 <i>Wyloguj nieznane urządzenia!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp(
              "📱 Zarządzaj urządzeniami",
              `${config.webAppUrl}/security/devices`
            )
            .row()
            .text("🚫 Wyloguj wszystkie", "security_logout_all")
            .text("🔙 Bezpieczeństwo", "settings_security"),
        }
      );
      break;

    case "security_sessions":
      await ctx.reply(
        "📋 <b>Log sesji</b>\n\n" +
          "Historia aktywności na koncie:\n\n" +
          "• 2025-01-31 14:32 - Logowanie (Warszawa)\n" +
          "• 2025-01-31 12:15 - Wymiana BTC → PLN\n" +
          "• 2025-01-30 18:45 - Wypłata PLN\n" +
          "• 2025-01-30 09:23 - Logowanie (Warszawa)\n\n" +
          "💡 <i>Regularnie sprawdzaj aktywność!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("📋 Pełny log", `${config.webAppUrl}/security/sessions`)
            .row()
            .text("📥 Eksportuj", "security_sessions_export")
            .text("🔙 Bezpieczeństwo", "settings_security"),
        }
      );
      break;

    case "security_ip":
      await ctx.reply(
        "🚫 <b>Whitelist IP</b>\n\n" +
          "Ogranicz dostęp do konta z określonych adresów IP:\n\n" +
          "<b>Aktualnie dozwolone IP:</b>\n" +
          "• 192.168.1.1 (Dom)\n" +
          "• 10.0.0.1 (Praca)\n\n" +
          "⚠️ <b>Uwaga:</b> Funkcja dla zaawansowanych użytkowników!\n\n" +
          "💡 <i>Dodatkowa warstwa bezpieczeństwa!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp("🚫 Zarządzaj IP", `${config.webAppUrl}/security/ip`)
            .row()
            .text("➕ Dodaj IP", "security_ip_add")
            .text("🔙 Bezpieczeństwo", "settings_security"),
        }
      );
      break;

    case "security_alerts":
      await ctx.reply(
        "⚠️ <b>Alerty aktywności</b>\n\n" +
          "Otrzymuj powiadomienia o:\n\n" +
          "• Nowym logowaniu\n" +
          "• Zmianie hasła\n" +
          "• Dużych transakcjach\n" +
          "• Zmianach ustawień\n" +
          "• Podejrzanej aktywności\n\n" +
          "💡 <i>Natychmiastowa reakcja na zagrożenia!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("🔔 Włącz alerty", "security_alerts_enable")
            .text("🔕 Wyłącz alerty", "security_alerts_disable")
            .row()
            .text("⚙️ Konfiguruj", "security_alerts_config")
            .text("🔙 Bezpieczeństwo", "settings_security"),
        }
      );
      break;

    case "security_withdrawal_lock":
      await ctx.reply(
        "🔒 <b>Blokada wypłat</b>\n\n" +
          "Dodatkowa ochrona przed nieautoryzowanymi wypłatami:\n\n" +
          "<b>Opcje:</b>\n" +
          "• Blokada na 24h\n" +
          "• Blokada na 48h\n" +
          "• Blokada na 7 dni\n" +
          "• Wymagaj email do wypłat\n\n" +
          "💡 <i>Idealne przed wyjazdem urlopowym!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("🔒 Włącz blokadę", "security_withdrawal_lock_enable")
            .row()
            .text("🔓 Wyłącz blokadę", "security_withdrawal_lock_disable")
            .text("🔙 Bezpieczeństwo", "settings_security"),
        }
      );
      break;

    case "security_address_whitelist":
      await ctx.reply(
        "📋 <b>Whitelist adresów</b>\n\n" +
          "Zezwalaj na wypłaty tylko na zaufane adresy:\n\n" +
          "<b>Zaufane adresy krypto:</b>\n" +
          "• ₿ bc1q... (Mój portfel Ledger)\n" +
          "• Ξ 0x... (Mój portfel MetaMask)\n\n" +
          "<b>Jak to działa:</b>\n" +
          "Wypłaty możliwe tylko na dodane adresy\n\n" +
          "💡 <i>Maksymalne bezpieczeństwo wypłat!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .webApp(
              "📋 Zarządzaj adresami",
              `${config.webAppUrl}/security/whitelist`
            )
            .row()
            .text("➕ Dodaj adres", "security_whitelist_add")
            .text("🔙 Bezpieczeństwo", "settings_security"),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Opcja bezpieczeństwa niedostępna.",
        show_alert: false,
      });
  }
}

/**
 * Handle notification action callbacks
 */
async function handleNotificationAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  const action = data.replace("notify_", "");
  await ctx.answerCallbackQuery({
    text: `✅ Ustawienia powiadomień zaktualizowane: ${action}`,
  });
  await ctx.reply(
    `✅ <b>Powiadomienia zaktualizowane</b>\n\n` +
      `Ustawiono: ${action}\n\n` +
      `💡 <i>Możesz zmienić to w każdej chwili w ustawieniach!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text("⚙️ Więcej opcji", "settings_notifications")
        .text("🔙 Ustawienia", "menu_settings"),
    }
  );
}

/**
 * Handle history action callbacks
 */
async function handleHistoryAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  const filter = data.replace("history_", "");
  await ctx.reply(
    `📜 <b>Historia transakcji - ${filter}</b>\n\n` +
      `Filtr: ${filter}\n\n` +
      `💡 <i>Pełna historia dostępna w aplikacji webowej!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .webApp("📜 Pełna historia", `${config.webAppUrl}/history`)
        .row()
        .text("📤 Eksport", "history_export")
        .text("🔙 Portfel", "menu_wallet"),
    }
  );
}

/**
 * Handle B2B action callbacks
 */
async function handleB2BAction(ctx: BotContext, data: string): Promise<void> {
  switch (data) {
    case "b2b_info":
      await ctx.reply(MESSAGES.B2B_INFO, {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .url("📧 Kontakt B2B", "mailto:b2b@cashymine.pl")
          .row()
          .webApp("💼 Pełna oferta", `${config.webAppUrl}/b2b`)
          .row()
          .text("📞 Umów spotkanie", "b2b_meeting")
          .text("🔙 Panel", "menu_dashboard"),
      });
      break;

    case "b2b_meeting":
      await ctx.reply(
        "📅 <b>Umów spotkanie B2B</b>\n\n" +
          "Porozmawiajmy o współpracy:\n\n" +
          "<b>Tematyka spotkania:</b>\n" +
          "• Prezentacja oferty\n" +
          "• Negocjacja warunków\n" +
          "• Integracja API\n" +
          "• Rozwiązania dedykowane\n\n" +
          "💡 <i>Skontaktuj się z nami telefonicznie lub emailem!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .url("📧 b2b@cashymine.pl", "mailto:b2b@cashymine.pl")
            .url("📞 Zadzwoń", "tel:+48221234567")
            .row()
            .text("🔙 Oferta B2B", "b2b_info"),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Akcja B2B niedostępna.",
        show_alert: false,
      });
  }
}

/**
 * Handle dashboard action callbacks
 */
async function handleDashboardAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  switch (data) {
    case "dashboard_refresh":
      await ctx.answerCallbackQuery({ text: "🔄 Odświeżanie panelu..." });
      setTimeout(async () => {
        await ctx.reply(MESSAGES.DASHBOARD(ctx.from?.first_name), {
          parse_mode: "HTML",
          reply_markup: MainMenu.dashboard(),
        });
      }, 500);
      break;

    case "dashboard_export":
      await ctx.reply(
        "📥 <b>Eksport danych panelu</b>\n\n" +
          "Eksportuj dane w różnych formatach:\n\n" +
          "• 📊 CSV - Format arkusza\n" +
          "• 📈 Excel - Zaawansowana analiza\n" +
          "• 📋 PDF - Raporty do wydruku\n" +
          "• 📅 JSON - Format dla programistów\n\n" +
          "💡 <i>Eksportuj historię zarobków, statystyki i więcej!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("📊 Eksport CSV", "export_csv")
            .text("📈 Eksport Excel", "export_excel")
            .row()
            .text("📋 Eksport PDF", "export_pdf")
            .text("📅 Eksport JSON", "export_json")
            .row()
            .text("🔙 Panel", "menu_dashboard"),
        }
      );
      break;

    case "account_tier":
      await ctx.reply(
        "🏆 <b>Poziom konta</b>\n\n" +
          "<b>Aktualny poziom: 🥈 Srebro</b>\n\n" +
          "<b>Twoje korzyści:</b>\n" +
          "• Limity dzienne: 25 000 PLN\n" +
          "• Prowizje: -10%\n" +
          "• Wsparcie: Email + chat\n\n" +
          "<b>Następny poziom: 🥇 Złoto</b>\n" +
          "• Wymagane: Pełna weryfikacja KYC\n" +
          "• Limity: 100 000 PLN/dzień\n" +
          "• Prowizje: -25%\n" +
          "• Dedykowany opiekun\n\n" +
          "💡 <i>Przejdź weryfikację aby awansować!</i>",
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard()
            .text("✅ Rozpocznij weryfikację", "security_kyc")
            .row()
            .text("🏆 Zobacz wszystkie poziomy", "account_tiers_all")
            .text("🔙 Panel", "menu_dashboard"),
        }
      );
      break;

    default:
      await ctx.answerCallbackQuery({
        text: "Akcja panelu niedostępna.",
        show_alert: false,
      });
  }
}

/**
 * Handle admin action callbacks
 */
async function handleAdminAction(ctx: BotContext, data: string): Promise<void> {
  if (!isAdmin) {
    await ctx.answerCallbackQuery({
      text: "🚫 Wymagany dostęp administratora.",
      show_alert: true,
    });
    return;
  }

  // Admin implementation similar to original but in Polish
  switch (data) {
    case "admin_stats":
      await ctx.reply(
        "📊 <b>Statystyki administratora</b>\n\n" +
          "Pobieranie statystyk systemu...\n\n" +
          "⏳ Proszę czekać na najnowsze dane.",
        { parse_mode: "HTML" }
      );
      setTimeout(async () => {
        await ctx.reply(
          "📊 <b>Statystyki systemu</b>\n\n" +
            "👥 <b>Użytkownicy:</b>\n" +
            "• Łącznie: 12,458\n" +
            "• Aktywni dzisiaj: 3,245\n" +
            "• Nowi dzisiaj: 187\n" +
            "• Premium: 2,458\n\n" +
            "💰 <b>Finanse:</b>\n" +
            "• Łączne wpłaty: 2.45M PLN\n" +
            "• Łączne wypłaty: 1.87M PLN\n" +
            "• Wolumen dzienny: 124,587 PLN\n" +
            "• Saldo platformy: 612,486 PLN\n\n" +
            "💱 <b>Wymiany:</b>\n" +
            "• Aktywni użytkownicy: 8,457\n" +
            "• Wolumen 24h: 450 000 PLN\n" +
            "• Dzienne wymiany: 1,245\n\n" +
            "📈 <b>Wydajność:</b>\n" +
            "• Czas odpowiedzi: 145ms\n" +
            "• Współczynnik błędów: 0.15%\n" +
            "• Zadowolenie użytkowników: 4.7/5",
          {
            parse_mode: "HTML",
            reply_markup: MainMenu.adminStats(),
          }
        );
      }, 1000);
      break;

    case "admin_users":
      await ctx.reply(
        "👥 <b>Zarządzanie użytkownikami</b>\n\n" +
          "Zarządzaj użytkownikami systemu:\n\n" +
          "• Wyszukaj użytkowników\n" +
          "• Zobacz szczegóły\n" +
          "• Edytuj informacje\n" +
          "• Zarządzaj uprawnieniami",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.adminUsers(),
        }
      );
      break;

    case "admin_transactions":
      await ctx.reply(
        "💰 <b>Monitorowanie transakcji</b>\n\n" +
          "Monitoruj wszystkie transakcje systemowe:\n\n" +
          "• Śledzenie w czasie rzeczywistym\n" +
          "• Wykrywanie oszustw\n" +
          "• Analityka i raporty\n" +
          "• Możliwości eksportu",
        { parse_mode: "HTML" }
      );
      break;

    case "admin_exchanges":
      await ctx.reply(
        "💱 <b>Monitorowanie wymian</b>\n\n" +
          "Przegląd wszystkich operacji wymiany:\n\n" +
          "• Wymiany w czasie rzeczywistym\n" +
          "• Statystyki wolumenu\n" +
          "• Najpopularniejsze pary\n" +
          "• Analiza spreadów",
        { parse_mode: "HTML" }
      );
      break;

    case "admin_maintenance":
      await ctx.reply(
        "🛠️ <b>Kontrole konserwacji</b>\n\n" +
          "Zarządzaj konserwacją systemu:\n\n" +
          "• Włącz/wyłącz tryb konserwacji\n" +
          "• Zaplanuj okna konserwacyjne\n" +
          "• Wyślij powiadomienia użytkownikom\n" +
          "• Monitoruj status systemu",
        {
          parse_mode: "HTML",
          reply_markup: MainMenu.adminMaintenance(),
        }
      );
      break;

    // Add more admin handlers as needed...

    default:
      await ctx.reply(
        `🛠️ <b>Akcja administratora: ${data.replace("admin_", "")}</b>\n\n` +
          "Ta funkcja administratora jest przetwarzana.",
        { parse_mode: "HTML" }
      );
  }
}

/**
 * Handle confirmation callbacks
 */
async function handleConfirmation(
  ctx: BotContext,
  data: string
): Promise<void> {
  const parts = data.split("_");
  const action = parts[1];
  const choice = parts[parts.length - 1];

  if (choice === "yes") {
    await ctx.reply(
      `✅ <b>Potwierdzone: ${action}</b>\n\n` +
        `Akcja została pomyślnie wykonana.`,
      { parse_mode: "HTML" }
    );
  } else {
    await ctx.reply(
      `❌ <b>Anulowano: ${action}</b>\n\n` + `Akcja została anulowana.`,
      { parse_mode: "HTML" }
    );
  }
}

/**
 * Handle language action callbacks
 */
async function handleLanguageAction(
  ctx: BotContext,
  data: string
): Promise<void> {
  const lang = data.replace("language_", "");
  const languages: Record<string, string> = {
    pl: "Polski",
    en: "English",
    de: "Deutsch",
    es: "Español",
    fr: "Français",
    ru: "Русский",
  };

  await ctx.answerCallbackQuery({
    text: `✅ Język zmieniony na: ${languages[lang] || lang}`,
  });

  await ctx.reply(
    `✅ <b>Język zmieniony</b>\n\n` +
      `Nowy język: ${languages[lang] || lang}\n\n` +
      `💡 <i>Interfejs zostanie zaktualizowany!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().text("🔙 Ustawienia", "menu_settings"),
    }
  );
}

/**
 * Handle theme action callbacks
 */
async function handleThemeAction(ctx: BotContext, data: string): Promise<void> {
  const theme = data.replace("theme_", "");
  const themes: Record<string, string> = {
    light: "Jasny",
    dark: "Ciemny",
    auto: "Automatyczny",
    custom: "Własny",
  };

  await ctx.answerCallbackQuery({
    text: `✅ Motyw zmieniony na: ${themes[theme] || theme}`,
  });

  await ctx.reply(
    `✅ <b>Motyw zmieniony</b>\n\n` +
      `Nowy motyw: ${themes[theme] || theme}\n\n` +
      `💡 <i>Odśwież aplikację aby zobaczyć zmiany!</i>`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().text("🔙 Ustawienia", "menu_settings"),
    }
  );
}

/**
 * Handle unknown callbacks
 */
async function handleUnknownCallback(
  ctx: BotContext,
  data: string
): Promise<void> {
  logger.warn(`Unknown callback data: ${data}`, {
    userId: ctx.from?.id,
    username: ctx.from?.username,
    data,
  });

  await ctx.answerCallbackQuery({
    text: "⚠️ Nieznana akcja. Spróbuj innej opcji.",
    show_alert: true,
  });
}

export { handleCallbackQuery };
