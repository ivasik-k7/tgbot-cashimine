import { config } from "../config";

export const MESSAGES = {
  WELCOME: (username?: string) => `
🎉 <b>Welcome to CashyMine${username ? " " + username : ""}!</b>

🚀 <i>Your trusted crypto & precious metals exchange in Poland</i>

With CashyMine, you can:
• 💱 Safely exchange cryptocurrencies and cash
• 🪙 Trade Bitcoin, Ethereum, USDT and more
• 🥇 Invest in physical gold and silver
• 🏦 Visit our local exchange offices
• 🛡️ Rely on licensed, AML/KYC‑compliant service

Ready to start? Tap the button below to begin a secure exchange.
`,

  WELCOME_EXISTING: (username?: string) => `
👋 <b>Welcome back, ${username ? username : "Investor"}!</b>

Your journey with CashyMine continues. Here’s what you can do now:
• 📊 Check the latest crypto and metal rates
• 💱 Start a new exchange operation
• 🥇 Explore gold and silver investment options
• 🧾 Manage your transactions and invoices (B2B & B2C)

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>Quick Snapshot:</b>
• Licensed operator in Poland ✅
• Secure 256‑bit SSL connection 🔐
• AML / KYC procedures in place 🛡️

Continue below to proceed with your next secure transaction.
`,

  ABOUT: `
🤖 <b>About CashyMine</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>🏦 What is CashyMine?</b>
CashyMine is a licensed network of cryptocurrency and precious metals exchange offices in Poland, combining traditional finance with modern blockchain technology.

<b>📍 Where we operate:</b>
• 12+ physical exchange offices in major cities
• Service for individual and business clients (B2C & B2B)
• Nationwide coverage with expert on-site support

<b>📊 CashyMine in numbers:</b>
• 10,000+ active clients
• 50M+ PLN monthly exchange volume
• 6 years on the market (since 2018)

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>✨ Our Mission:</b>
Provide a safe, transparent and professional way to exchange cryptocurrencies, cash and precious metals with the best rates in Poland.

<b>🔒 Security & Compliance:</b>
• GIIF-registered obligated institution
• 256-bit SSL encrypted connections
• ISO 27001 information security standards
• Full AML / KYC procedures
• RODO-compliant data protection

<b>💼 For Business Clients:</b>
• Dedicated account managers
• Invoices and full documentation
• Negotiable rates for large volumes
• Support for crypto settlements

<b>📜 Transparency:</b>
• Clear fees and no hidden costs
• Real-time market rates
• Legally compliant operations in Poland

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>🚀 Join CashyMine:</b>
Dołącz do tysięcy zadowolonych klientów, którzy bezpiecznie wymieniają kryptowaluty i metale szlachetne z pomocą naszych ekspertów.
`,

  HELP: `
🆘 <b>CashyMine Help Center</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>📚 Getting Started:</b>
1. Use /start to begin
2. Open the Web App
3. Check available services and rates
4. Begin your exchange or investment

<b>🛠️ Main Commands:</b>
• /start - Begin in CashyMine bot
• /dashboard - View your profile & recent operations
• /rates - Check current crypto & metals rates
• /branches - Find nearest exchange office
• /faq - Read answers to common questions
• /help - This help message
• /about - Learn about CashyMine

<b>⚙️ Admin Commands (if applicable):</b>
• /admin - Admin panel
• /stats - System statistics

<b>❓ Frequently Asked Questions:</b>

<b>Q: What can I do with CashyMine?</b>
A: Exchange cryptocurrencies, cash and invest in physical gold and silver in our licensed network of exchange offices.

<b>Q: Do I need verification?</b>
A: For higher amounts and according to AML / KYC rules, identity verification may be required.

<b>Q: Is this secure?</b>
A: Yes. We operate as a registered entity in Poland, use SSL encryption and follow strict AML / KYC and data protection procedures.

<b>🔗 Support:</b>
• Email: kontakt@cashymine.pl
• Website: cashimine.netlify.app
• Offices: Use /branches to find the nearest location

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>⚠️ Important:</b>
Never share your private keys or seed phrase with anyone, including us. For exchanges, always verify wallet addresses and transaction details before sending funds.
`,

  // Dashboard message
  DASHBOARD: (username?: string) => `
📊 <b>CashyMine Dashboard</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

👋 Welcome back, <b>${username || "Client"}</b>!

<b>🎯 Your Profile Overview:</b>
• 🧾 Recent exchanges: <b>3 last operations</b>
• 💱 Preferred assets: <b>BTC, ETH, USDT, złoto</b>
• 🏦 Nearest branch: <b>Warszawa – Centrum</b> *
• 👤 Client type: <b>Indywidualny</b>

<b>💰 Recent Activity (example):</b>
• BTC → PLN: <b>zrealizowano</b>
• USDT → PLN: <b>w toku</b>
• PLN → złoto: <b>zrealizowano</b>

<b>📊 Market Snapshot:</b>
• 📈 Bitcoin, Ethereum, USDT – updated in real time
• 🥇 Gold & silver investment options available
• 💹 Best rates in our network of exchange offices

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>⚡ Quick Actions:</b>
• Sprawdź aktualne kursy
• Znajdź najbliższy kantor
• Umów większą transakcję (B2B / high volume)
`,

  // Referral message
  REFERRAL: (userId: number) => `
👥 <b>CashyMine Referral & Loyalty Program</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>💰 Invite friends, grow the CashyMine network!</b>

<b>✨ Benefits:</b>
• 🎁 Special bonuses for you & your friends (where applicable)
• 💼 Priority service for active referrers
• 🏆 Access to selected promotions and better rates
• 📈 Higher tiers = more personalized support

<b>📊 Your Stats:</b>
• 👫 Invited clients: <b>8</b>
• 🎯 Active: <b>5</b>
• 🏆 Tier: <b>Gold</b>

<b>🔗 Your Personal Link:</b>
<code>https://t.me/${config.botUsername}?start=ref_${userId}</code>

<b>📣 Share Message:</b>
<blockquote>
🎉 Dołącz do CashyMine – bezpiecznej sieci kantorów kryptowalut i metali szlachetnych w Polsce!

💱 Wymieniaj kryptowaluty i gotówkę
🥇 Inwestuj w złoto i srebro
🏦 Odwiedzaj nasze kantory stacjonarne
🛡️ Licencjonowany podmiot, procedury AML / KYC

👉 Start tutaj: https://t.me/${config.botUsername}?start=ref_${userId}
</blockquote>

<b>🏆 Tiers (example):</b>
• 🥉 Bronze: 1–5 invited clients
• 🥈 Silver: 6–15
• 🥇 Gold: 16–30
• 💎 Diamond: 31+
`,

  // Wallet message – rewritten as “Accounts & balances” for an exchange
  WALLET: `
💰 <b>Your CashyMine Balances</b>

<code>━━━━━━━━━━━━━━━━━━━━━━━━</code>

<b>📊 Summary:</b>
• 💵 Fiat balances (e.g. PLN, EUR)
• 🪙 Crypto balances (BTC, ETH, USDT)
• 🥇 Precious metals allocations (gold, silver)

<code>━━━━━━━━━━━━━━━━━━━━━━━━</code>

<b>💵 Fiat (example):</b>
• PLN: <b>10 000 PLN</b>
• EUR: <b>1 250 EUR</b>

<b>🪙 Crypto (example):</b>
• ₿ Bitcoin: <b>0.035 BTC</b>
• Ξ Ethereum: <b>0.80 ETH</b>
• 💎 USDT: <b>1 200 USDT</b>

<b>🥇 Metals (example):</b>
• Złoto: <b>20 g</b>
• Srebro: <b>500 g</b>

<code>━━━━━━━━━━━━━━━━━━━━━━━━</code>

<b>⚡ Quick Actions:</b>
• 💱 Start a new exchange
• 🏦 Zarezerwuj transakcję w kantorze
• 📊 View detailed balances and history in the Web App

<b>🔒 Security:</b>
All operations follow AML / KYC rules and are processed through secure, verified channels.
`,

  // Transactions message – rewritten as exchange operations history
  TRANSACTIONS: `
📜 <b>Recent Operations</b>

<code>━━━━━━━━━━━━━━━━━━━━━━━━</code>

<b>🗓️ Today</b>
🟢 BTC → PLN • 0.015 BTC • <b>zrealizowano</b>
🟢 USDT → PLN • 500 USDT • <b>w toku</b>

<b>📅 Yesterday</b>
🟢 PLN → złoto • 5 000 PLN • <b>zrealizowano</b>
🟢 ETH → PLN • 0.25 ETH • <b>zrealizowano</b>

<b>📅 Last 7 Days</b>
🟢 8 completed operations
🟡 1 pending confirmation

<code>━━━━━━━━━━━━━━━━━━━━━━━━</code>

<b>💰 Summary (example):</b>
• Łączna wartość wymian: <b>48 500 PLN</b>
• Największa pojedyncza transakcja: <b>25 000 PLN</b>

<code>━━━━━━━━━━━━━━━━━━━━━━━━</code>

<b>📊 Operation Types:</b>
• 💱 Crypto → Fiat
• 💱 Fiat → Crypto
• 🥇 Fiat → Gold/Silver

<b>🔍 View full history and download confirmations in the Web App.</b>
`,

  // Support message – aligned with CashyMine branding & contacts
  SUPPORT: `
🛠️ <b>CashyMine Support</b>

<code>━━━━━━━━━━━━━━━━━━━━━━━━</code>

<b>📞 Contact Options:</b>

<b>📧 Email:</b>
• General: kontakt@cashymine.pl
• Business / B2B: b2b@cashymine.pl
• Compliance / AML: aml@cashymine.pl

<b>🌐 Website:</b>
• Main site: cashimine.netlify.app
• FAQ: użyj komendy /faq w bocie
• Branches: użyj komendy /branches

<code>━━━━━━━━━━━━━━━━━━━━━━━━</code>

<b>📍 At our offices:</b>
Możesz również skontaktować się z nami bezpośrednio w wybranym kantorze CashyMine – nasi doradcy pomogą Ci zaplanować i przeprowadzić większe transakcje.

<code>━━━━━━━━━━━━━━━━━━━━━━━━</code>

<b>⏰ Typical Response Times:</b>
• Pilne sprawy (bezpieczeństwo / transakcje): priorytetowo
• Zapytania ogólne: do 1 dnia roboczego
• Współpraca i B2B: indywidualnie, w zależności od sprawy

<code>━━━━━━━━━━━━━━━━━━━━━━━━</code>

<b>🔒 Security Reminder:</b>
Nigdy nie udostępniaj nikomu swoich kluczy prywatnych, seed phrase ani haseł. CashyMine nigdy nie poprosi Cię o takie dane.
`,

  // Debug message template – can stay as is
  DEBUG_TEMPLATE: (data: any) => `
🐛 <b>Debug Information</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>👤 User Info:</b>
• ID: <code>${data.userId || "N/A"}</code>
• Username: ${data.username || "N/A"}
• Language: ${data.language || "en"}
• Premium: ${data.isPremium ? "✅" : "❌"}

<b>💬 Chat Info:</b>
• Type: ${data.chatType || "N/A"}
• ID: <code>${data.chatId || "N/A"}</code>

<b>🤖 Bot Info:</b>
• Environment: ${data.environment}
• Production: ${data.isProduction ? "✅" : "❌"}
• Maintenance: ${data.maintenanceMode ? "🛠️" : "✅"}

<b>📊 Session:</b>
<code>${JSON.stringify(data.session || {}, null, 2)}</code>

<b>⚙️ Handlers:</b>
• Rate Limiting: ${data.rateLimiting ? "✅" : "❌"}
• Performance Monitor: ${data.performanceMonitoring ? "✅" : "❌"}
• Request Logging: ${data.requestLogging ? "✅" : "❌"}

<b>👑 Admin Status:</b>
${data.isAdmin ? "✅ You are an administrator" : "❌ Regular user"}
${data.adminCount ? `• Total Admins: ${data.adminCount}` : ""}

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>📡 System:</b>
• Timestamp: ${new Date().toISOString()}
• Update ID: ${data.updateId || "N/A"}
• Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
`,
} as const;
