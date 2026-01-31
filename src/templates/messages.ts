import { config } from "../config";

export const MESSAGES = {
  WELCOME: (username?: string) => `
🎉 <b>Witaj w CashyMine${username ? " " + username : ""}!</b>

🚀 <i>Twój zaufany kantor kryptowalut i metali szlachetnych w Polsce</i>

Z CashyMine możesz:
• 💱 Bezpiecznie wymieniać kryptowaluty i gotówkę
• 🪙 Handlować Bitcoin, Ethereum, USDT i innymi
• 🥇 Inwestować w fizyczne złoto i srebro
• 🏦 Odwiedzić nasze kantory stacjonarne
• 🛡️ Korzystać z licencjonowanej usługi z procedurami AML/KYC

Gotowy do startu? Kliknij przycisk poniżej, aby rozpocząć bezpieczną wymianę.
`,

  WELCOME_EXISTING: (username?: string) => `
👋 <b>Witamy ponownie, ${username ? username : "Inwestorze"}!</b>

Twoja podróż z CashyMine trwa dalej. Oto co możesz teraz zrobić:
• 📊 Sprawdź najnowsze kursy kryptowalut i metali
• 💱 Rozpocznij nową operację wymiany
• 🥇 Poznaj opcje inwestycji w złoto i srebro
• 🧾 Zarządzaj swoimi transakcjami i fakturami (B2B i B2C)

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>Szybki przegląd:</b>
• Licencjonowany operator w Polsce ✅
• Bezpieczne połączenie 256-bit SSL 🔐
• Procedury AML / KYC na miejscu 🛡️

Kontynuuj poniżej, aby przejść do kolejnej bezpiecznej transakcji.
`,

  ABOUT: `
🏦 <b>O CashyMine</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>Czym jest CashyMine?</b>
CashyMine to licencjonowana sieć kantorów kryptowalut i metali szlachetnych w Polsce, łącząca tradycyjne finanse z nowoczesną technologią blockchain.

<b>📍 Gdzie działamy:</b>
• 12+ fizycznych kantorów w głównych miastach
• Obsługa klientów indywidualnych i biznesowych (B2C i B2B)
• Zasięg ogólnopolski z fachowym wsparciem na miejscu

<b>📊 CashyMine w liczbach:</b>
• 10 000+ aktywnych klientów
• 50M+ PLN miesięcznego wolumenu wymian
• 6 lat na rynku (od 2018)

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>✨ Nasza misja:</b>
Zapewnienie bezpiecznego, przejrzystego i profesjonalnego sposobu wymiany kryptowalut, gotówki i metali szlachetnych po najlepszych kursach w Polsce.

<b>🔒 Bezpieczeństwo i zgodność:</b>
• Instytucja zobowiązana zarejestrowana w GIIF
• Połączenia szyfrowane 256-bitowym SSL
• Standardy bezpieczeństwa informacji ISO 27001
• Pełne procedury AML / KYC
• Ochrona danych zgodna z RODO

<b>💼 Dla klientów biznesowych:</b>
• Dedykowani opiekunowie kont
• Faktury i pełna dokumentacja
• Negocjowalne kursy dla dużych wolumenów
• Wsparcie dla rozliczeń kryptowalutowych

<b>📜 Przejrzystość:</b>
• Jasne opłaty bez ukrytych kosztów
• Kursy rynkowe w czasie rzeczywistym
• Działalność zgodna z prawem w Polsce

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>🚀 Dołącz do CashyMine:</b>
Dołącz do tysięcy zadowolonych klientów, którzy bezpiecznie wymieniają kryptowaluty i metale szlachetne z pomocą naszych ekspertów.
`,

  HELP: `
🆘 <b>Centrum Pomocy CashyMine</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>📚 Rozpoczęcie pracy:</b>
1. Użyj /start aby rozpocząć
2. Otwórz aplikację webową
3. Sprawdź dostępne usługi i kursy
4. Rozpocznij wymianę lub inwestycję

<b>🛠️ Główne komendy:</b>
• /start - Rozpocznij w bocie CashyMine
• /dashboard - Zobacz swój profil i ostatnie operacje
• /rates - Sprawdź aktualne kursy kryptowalut i metali
• /branches - Znajdź najbliższy kantor
• /faq - Przeczytaj odpowiedzi na częste pytania
• /help - Ta wiadomość pomocy
• /about - Dowiedz się więcej o CashyMine

<b>⚙️ Komendy administratora (jeśli dotyczy):</b>
• /admin - Panel administratora
• /stats - Statystyki systemu

<b>❓ Często zadawane pytania:</b>

<b>P: Co mogę zrobić z CashyMine?</b>
O: Wymieniać kryptowaluty, gotówkę oraz inwestować w fizyczne złoto i srebro w naszej licencjonowanej sieci kantorów.

<b>P: Czy potrzebuję weryfikacji?</b>
O: Dla wyższych kwot i zgodnie z przepisami AML / KYC może być wymagana weryfikacja tożsamości.

<b>P: Czy to jest bezpieczne?</b>
O: Tak. Działamy jako zarejestrowany podmiot w Polsce, używamy szyfrowania SSL i przestrzegamy ścisłych procedur AML / KYC oraz ochrony danych.

<b>🔗 Wsparcie:</b>
• Email: kontakt@cashymine.pl
• Strona: cashimine.netlify.app
• Kantory: Użyj /branches aby znaleźć najbliższą lokalizację

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>⚠️ Ważne:</b>
Nigdy nie udostępniaj nikomu swoich kluczy prywatnych ani frazy seed, włączając nas. Przy wymianach zawsze weryfikuj adresy portfeli i szczegóły transakcji przed wysłaniem środków.
`,

  DASHBOARD: (username?: string) => `
📊 <b>Panel CashyMine</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

👋 Witamy ponownie, <b>${username || "Kliencie"}</b>!

<b>🎯 Przegląd Twojego profilu:</b>
• 🧾 Ostatnie wymiany: <b>3 ostatnie operacje</b>
• 💱 Preferowane aktywa: <b>BTC, ETH, USDT, złoto</b>
• 🏦 Najbliższy oddział: <b>Warszawa – Centrum</b>
• 👤 Typ klienta: <b>Indywidualny</b>

<b>💰 Ostatnia aktywność:</b>
• BTC → PLN: <b>zrealizowano</b>
• USDT → PLN: <b>w toku</b>
• PLN → złoto: <b>zrealizowano</b>

<b>📊 Migawka rynku:</b>
• 📈 Bitcoin, Ethereum, USDT – aktualizowane w czasie rzeczywistym
• 🥇 Dostępne opcje inwestycji w złoto i srebro
• 💹 Najlepsze kursy w naszej sieci kantorów

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>⚡ Szybkie działania:</b>
`,

  REFERRAL: (userId: number) => `
👥 <b>Program Poleceń i Lojalnościowy CashyMine</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>💰 Zaproś znajomych, rozwijaj sieć CashyMine!</b>

<b>✨ Korzyści:</b>
• 🎁 Specjalne bonusy dla Ciebie i Twoich znajomych
• 💼 Priorytetowa obsługa dla aktywnych polecających
• 🏆 Dostęp do wybranych promocji i lepszych kursów
• 📈 Wyższe poziomy = bardziej spersonalizowane wsparcie

<b>📊 Twoje statystyki:</b>
• 👫 Zaproszeni klienci: <b>8</b>
• 🎯 Aktywni: <b>5</b>
• 🏆 Poziom: <b>Złoto</b>

<b>🔗 Twój osobisty link:</b>
<code>https://t.me/${config.botUsername}?start=ref_${userId}</code>

<b>📣 Wiadomość do udostępnienia:</b>
<blockquote>
🎉 Dołącz do CashyMine – bezpiecznej sieci kantorów kryptowalut i metali szlachetnych w Polsce!

💱 Wymieniaj kryptowaluty i gotówkę
🥇 Inwestuj w złoto i srebro
🏦 Odwiedzaj nasze kantory stacjonarne
🛡️ Licencjonowany podmiot, procedury AML / KYC

👉 Start tutaj: https://t.me/${config.botUsername}?start=ref_${userId}
</blockquote>

<b>🏆 Poziomy:</b>
• 🥉 Brąz: 1–5 zaproszonych klientów (5% prowizji)
• 🥈 Srebro: 6–15 klientów (7% prowizji)
• 🥇 Złoto: 16–30 klientów (10% prowizji)
• 💎 Diament: 31+ klientów (15% prowizji)

<code>━━━━━━━━━━━━━━━━━━━━</code>

💡 <i>Prowizje są wypłacane z każdej transakcji poleconego klienta!</i>
`,

  WALLET: `
💰 <b>Twoje salda w CashyMine</b>

<code>━━━━━━━━━━━━━━━━━━━━━━━━</code>

<b>📊 Podsumowanie:</b>
• 💵 Salda fiat (PLN, EUR)
• 🪙 Salda kryptowalut (BTC, ETH, USDT)
• 🥇 Alokacje metali szlachetnych (złoto, srebro)

<code>━━━━━━━━━━━━━━━━━━━━━━━━</code>

<b>💵 Waluty fiat:</b>
• PLN: <b>10 000 PLN</b>
• EUR: <b>1 250 EUR</b>

<b>🪙 Kryptowaluty:</b>
• ₿ Bitcoin: <b>0.035 BTC</b>
• Ξ Ethereum: <b>0.80 ETH</b>
• 💎 USDT: <b>1 200 USDT</b>

<b>🥇 Metale szlachetne:</b>
• Złoto: <b>20 g</b>
• Srebro: <b>500 g</b>

<code>━━━━━━━━━━━━━━━━━━━━━━━━</code>

<b>⚡ Szybkie działania:</b>
• 💱 Rozpocznij nową wymianę
• 🏦 Zarezerwuj transakcję w kantorze
• 📊 Zobacz szczegółowe salda i historię w aplikacji webowej

<b>🔒 Bezpieczeństwo:</b>
Wszystkie operacje są zgodne z zasadami AML / KYC i przetwarzane przez bezpieczne, zweryfikowane kanały.
`,

  TRANSACTIONS: `
📜 <b>Ostatnie operacje</b>

<code>━━━━━━━━━━━━━━━━━━━━━━━━</code>

<b>🗓️ Dzisiaj</b>
🟢 BTC → PLN • 0.015 BTC • <b>zrealizowano</b>
🟢 USDT → PLN • 500 USDT • <b>w toku</b>

<b>📅 Wczoraj</b>
🟢 PLN → złoto • 5 000 PLN • <b>zrealizowano</b>
🟢 ETH → PLN • 0.25 ETH • <b>zrealizowano</b>

<b>📅 Ostatnie 7 dni</b>
🟢 8 zrealizowanych operacji
🟡 1 oczekuje na potwierdzenie

<code>━━━━━━━━━━━━━━━━━━━━━━━━</code>

<b>💰 Podsumowanie:</b>
• Łączna wartość wymian: <b>48 500 PLN</b>
• Największa pojedyncza transakcja: <b>25 000 PLN</b>

<code>━━━━━━━━━━━━━━━━━━━━━━━━</code>

<b>📊 Typy operacji:</b>
• 💱 Krypto → Fiat
• 💱 Fiat → Krypto
• 🥇 Fiat → Złoto/Srebro
• 🔄 Krypto → Krypto

<b>🔍 Zobacz pełną historię i pobierz potwierdzenia w aplikacji webowej.</b>
`,

  SUPPORT: `
🛠️ <b>Wsparcie CashyMine</b>

<code>━━━━━━━━━━━━━━━━━━━━━━━━</code>

<b>📞 Opcje kontaktu:</b>

<b>📧 Email:</b>
• Ogólne: kontakt@cashymine.pl
• Biznes / B2B: b2b@cashymine.pl
• Compliance / AML: aml@cashymine.pl

<b>🌐 Strona internetowa:</b>
• Strona główna: cashimine.netlify.app
• FAQ: użyj komendy /faq w bocie
• Oddziały: użyj komendy /branches

<code>━━━━━━━━━━━━━━━━━━━━━━━━</code>

<b>📍 W naszych kantorach:</b>
Możesz również skontaktować się z nami bezpośrednio w wybranym kantorze CashyMine – nasi doradcy pomogą Ci zaplanować i przeprowadzić większe transakcje.

<code>━━━━━━━━━━━━━━━━━━━━━━━━</code>

<b>⏰ Typowe czasy odpowiedzi:</b>
• Pilne sprawy (bezpieczeństwo/transakcje): priorytetowo
• Zapytania ogólne: do 1 dnia roboczego
• Współpraca B2B: indywidualnie

<code>━━━━━━━━━━━━━━━━━━━━━━━━</code>

<b>🔒 Przypomnienie o bezpieczeństwie:</b>
Nigdy nie udostępniaj nikomu swoich kluczy prywatnych, seed phrase ani haseł. CashyMine nigdy nie poprosi Cię o takie dane.
`,

  // Exchange-specific messages
  RATES: `
📊 <b>Aktualne kursy wymiany</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>💱 Kryptowaluty (przykładowe kursy):</b>

<b>₿ Bitcoin (BTC)</b>
• Kupno: <b>185 000 PLN</b>
• Sprzedaż: <b>188 000 PLN</b>
• Zmiana 24h: <b>+2.5%</b> 📈

<b>Ξ Ethereum (ETH)</b>
• Kupno: <b>12 500 PLN</b>
• Sprzedaż: <b>12 800 PLN</b>
• Zmiana 24h: <b>+1.8%</b> 📈

<b>💎 USDT (Tether)</b>
• Kupno: <b>4.25 PLN</b>
• Sprzedaż: <b>4.35 PLN</b>
• Zmiana 24h: <b>0.0%</b> ━

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>🥇 Metale szlachetne:</b>

<b>Złoto (1g)</b>
• Kupno: <b>285 PLN</b>
• Sprzedaż: <b>295 PLN</b>

<b>Srebro (1g)</b>
• Kupno: <b>3.50 PLN</b>
• Sprzedaż: <b>3.80 PLN</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

⏰ <i>Aktualizacja: ${new Date().toLocaleString("pl-PL")}</i>
💡 <i>Kursy są orientacyjne. Finalne kursy podane przy realizacji transakcji.</i>
`,

  BRANCHES: `
📍 <b>Nasze kantory CashyMine</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>🏢 Warszawa (3 lokalizacje):</b>

<b>1. Centrum</b>
📍 ul. Marszałkowska 115
⏰ Pn-Pt: 9:00-19:00, Sb: 10:00-16:00
📞 +48 22 123 4567

<b>2. Mokotów</b>
📍 ul. Puławska 45
⏰ Pn-Pt: 9:00-18:00, Sb: 10:00-15:00
📞 +48 22 234 5678

<b>3. Wola</b>
📍 ul. Górczewska 200
⏰ Pn-Pt: 10:00-19:00, Sb: 10:00-14:00
📞 +48 22 345 6789

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>🏢 Kraków (2 lokalizacje):</b>

<b>1. Stare Miasto</b>
📍 ul. Floriańska 12
⏰ Pn-Pt: 9:00-19:00, Sb: 10:00-16:00
📞 +48 12 456 7890

<b>2. Kazimierz</b>
📍 ul. Szeroka 8
⏰ Pn-Pt: 10:00-18:00, Sb: 10:00-15:00
📞 +48 12 567 8901

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>🏢 Inne miasta:</b>
• Wrocław - ul. Świdnicka 23
• Poznań - ul. Półwiejska 34
• Gdańsk - ul. Długa 45
• Katowice - ul. Mariacka 12
• Łódź - ul. Piotrkowska 67

<code>━━━━━━━━━━━━━━━━━━━━</code>

💡 <i>Rezerwuj większe transakcje telefonicznie lub przez aplikację!</i>
🗺️ <i>Pełna mapa oddziałów: cashimine.netlify.app/branches</i>
`,

  FAQ: `
❓ <b>Często zadawane pytania (FAQ)</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>P: Jak wymienić kryptowaluty w CashyMine?</b>
O: Możesz odwiedzić któryś z naszych kantorów lub użyć aplikacji webowej do rezerwacji transakcji online.

<b>P: Jakie dokumenty są potrzebne?</b>
O: Do kwot powyżej 15 000 PLN wymagany jest dowód tożsamości (dowód osobisty lub paszport) zgodnie z procedurami AML/KYC.

<b>P: Jakie są opłaty za wymianę?</b>
O: Opłaty są wliczone w spread (różnica między kursem kupna i sprzedaży). Brak dodatkowych ukrytych opłat.

<b>P: Czy mogę wymienić gotówkę na kryptowaluty?</b>
O: Tak! W naszych kantorach przyjmujemy gotówkę PLN, EUR i inne waluty.

<b>P: Jak długo trwa transakcja?</b>
O: W kantorze: natychmiastowo. Online: do 1 godziny roboczej po potwierdzeniu wpłaty.

<b>P: Czy CashyMine jest bezpieczne?</b>
O: Tak, jesteśmy licencjonowanym podmiotem zarejestrowanym w GIIF, przestrzegamy procedur AML/KYC i standardów bezpieczeństwa ISO 27001.

<b>P: Czy mogę kupić fizyczne złoto?</b>
O: Tak, oferujemy inwestycje w fizyczne złoto i srebro z możliwością odbioru osobistego lub przechowania.

<b>P: Jak działa program poleceń?</b>
O: Zaproś znajomych swoim unikalnym linkiem i otrzymuj prowizję od ich transakcji (5-15% w zależności od poziomu).

<b>P: Czy obsługujecie klientów biznesowych?</b>
O: Tak! Oferujemy dedykowaną obsługę B2B z fakturami VAT, negocjowalnymi kursami i opiekunem konta.

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>📧 Więcej pytań?</b>
Skontaktuj się z nami: kontakt@cashymine.pl
`,

  // Withdrawal messages
  WITHDRAW_INFO: `
💸 <b>Wypłata środków</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>💰 Dostępne metody wypłaty:</b>

<b>🏦 Przelew bankowy (PLN)</b>
• Czas: 1-3 dni robocze
• Min: 100 PLN
• Max: 50 000 PLN/dzień
• Opłata: 5 PLN

<b>₿ Bitcoin (BTC)</b>
• Czas: do 1 godziny
• Min: 0.001 BTC
• Opłata: 0.0005 BTC

<b>Ξ Ethereum (ETH)</b>
• Czas: do 30 minut
• Min: 0.01 ETH
• Opłata: 0.005 ETH

<b>💎 USDT (TRC-20)</b>
• Czas: do 15 minut
• Min: 10 USDT
• Opłata: 1 USDT

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>⚠️ Ważne:</b>
• Wypłaty wymagają weryfikacji tożsamości dla kwot >15 000 PLN
• Zawsze sprawdzaj adres portfela przed potwierdzeniem
• Transakcje są nieodwracalne

💡 <i>Wyższe poziomy konta = wyższe limity dzienne!</i>
`,

  DEPOSIT_INFO: `
💰 <b>Wpłata środków</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>💵 Dostępne metody wpłaty:</b>

<b>💳 Karta płatnicza</b>
• Czas: natychmiastowy
• Min: 50 PLN
• Max: 10 000 PLN/transakcja
• Opłata: 2.5%

<b>🏦 Przelew bankowy</b>
• Czas: do 2 godzin roboczych
• Min: 100 PLN
• Brak opłat

<b>₿ Bitcoin (BTC)</b>
• Czas: 3 potwierdzenia (~30 min)
• Min: 0.001 BTC
• Brak opłat

<b>Ξ Ethereum (ETH)</b>
• Czas: 12 potwierdzeń (~3 min)
• Min: 0.01 ETH
• Brak opłat

<b>💎 USDT</b>
• Czas: zależnie od sieci
• Min: 10 USDT
• Brak opłat

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>🎁 Bonusy za wpłatę:</b>
• Pierwsza wpłata: +5% bonusu
• Wpłata >1000 PLN: +2% bonusu
• Wpłata >5000 PLN: +3.5% bonusu

💡 <i>Bonusy są dodawane automatycznie do Twojego konta!</i>
`,

  // Investment messages
  GOLD_SILVER_INFO: `
🥇 <b>Inwestycje w złoto i srebro</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>✨ Dlaczego metale szlachetne?</b>
• Ochrona przed inflacją
• Dywersyfikacja portfela
• Aktywo materialne
• Historia zachowania wartości

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>🥇 Złoto inwestycyjne:</b>

<b>Sztabki złota:</b>
• 1g - od 285 PLN
• 5g - od 1 400 PLN
• 10g - od 2 780 PLN
• 1 uncja (31.1g) - od 8 650 PLN

<b>Monety złote:</b>
• Krugerrand - od 8 900 PLN
• Maple Leaf - od 9 100 PLN
• Wiener Philharmoniker - od 9 000 PLN

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>🥈 Srebro inwestycyjne:</b>

<b>Sztabki srebra:</b>
• 100g - od 350 PLN
• 250g - od 870 PLN
• 500g - od 1 730 PLN
• 1kg - od 3 450 PLN

<b>Monety srebrne:</b>
• American Eagle - od 180 PLN
• Maple Leaf - od 175 PLN
• Filharmonik - od 170 PLN

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>📦 Opcje przechowania:</b>
• Odbiór osobisty w kantorze (bezpłatnie)
• Przechowanie w sejfie (10 PLN/miesiąc)
• Dostawa kurierem ubezpieczonym (od 30 PLN)

💡 <i>Wszystkie metale z certyfikatami autentyczności!</i>
`,

  STAKING_INFO: `
🔒 <b>Programy oszczędnościowe (Staking)</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>💰 Zablokuj swoje kryptowaluty i zarabiaj!</b>

<b>🥉 Brązowy (30 dni):</b>
• Bitcoin: 3% APY
• Ethereum: 4% APY
• USDT: 5% APY
• Min: 1000 PLN
• Wypłata odsetek: miesięczna

<b>🥈 Srebrny (90 dni):</b>
• Bitcoin: 5% APY
• Ethereum: 6% APY
• USDT: 7% APY
• Min: 5000 PLN
• Wypłata odsetek: miesięczna
• Bonus: +100 PLN za założenie

<b>🥇 Złoty (180 dni):</b>
• Bitcoin: 8% APY
• Ethereum: 9% APY
• USDT: 10% APY
• Min: 10 000 PLN
• Wypłata odsetek: miesięczna
• Bonus: +500 PLN za założenie

<b>💎 Diamentowy (365 dni):</b>
• Bitcoin: 12% APY
• Ethereum: 13% APY
• USDT: 15% APY
• Min: 25 000 PLN
• Wypłata odsetek: miesięczna
• Bonus: +2000 PLN za założenie

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>✨ Korzyści:</b>
• Gwarantowane zwroty
• Ubezpieczenie środków
• Możliwość wcześniejszego zakończenia (z karą 2%)
• Kapitalizacja odsetek

<b>⚠️ Warunki:</b>
• Minimalna kwota zgodnie z planem
• Odsetki wypłacane co miesiąc
• Środki zablokowane na okres trwania planu

💡 <i>Im dłuższy okres, tym wyższe oprocentowanie!</i>
`,

  SECURITY_INFO: `
🔐 <b>Bezpieczeństwo w CashyMine</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>🛡️ Jak chronimy Twoje środki:</b>

<b>🏦 Bezpieczeństwo finansowe:</b>
• 95% środków w cold wallet
• Ubezpieczenie środków klientów
• Audyty bezpieczeństwa co kwartał
• Zgodność z ISO 27001

<b>🔒 Bezpieczeństwo konta:</b>
• Dwuskładnikowe uwierzytelnianie (2FA)
• Whitelist adresów wypłat
• Powiadomienia o każdej operacji
• Blokada konta przy podejrzanej aktywności

<b>📱 Bezpieczeństwo transakcji:</b>
• Szyfrowanie SSL 256-bit
• Weryfikacja wszystkich wypłat
• Limity dzienne i transakcyjne
• Historia wszystkich operacji

<b>⚖️ Zgodność prawna:</b>
• Rejestracja w GIIF jako instytucja zobowiązana
• Procedury AML/KYC zgodnie z prawem
• Ochrona danych RODO
• Regularne audyty compliance

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>🔑 Zalecenia bezpieczeństwa:</b>

✅ Włącz 2FA w ustawieniach konta
✅ Używaj silnych, unikalnych haseł
✅ Regularnie sprawdzaj historię transakcji
✅ Dodaj adresy wypłat do whitelisty
✅ Nie udostępniaj nikomu swoich danych logowania

❌ Nigdy nie udostępniaj seed phrase
❌ Nie klikaj w podejrzane linki
❌ Nie instaluj nieznanych aplikacji
❌ Nie przesyłaj haseł przez email

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>📞 Zgłoś problem:</b>
Jeśli zauważysz podejrzaną aktywność:
• Email: security@cashymine.pl
• Telefon: +48 22 XXX XXXX (24/7)
• Natychmiastowa blokada konta

💡 <i>Twoje bezpieczeństwo jest naszym priorytetem!</i>
`,

  B2B_INFO: `
💼 <b>Oferta dla Firm (B2B)</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>🏢 CashyMine dla biznesu</b>

Profesjonalne usługi wymiany kryptowalut i metali szlachetnych dla przedsiębiorców i firm.

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>✨ Korzyści współpracy:</b>

<b>💰 Korzystne warunki:</b>
• Indywidualne kursy wymiany
• Niższe prowizje dla dużych wolumenów
• Rabaty od 10 000 PLN miesięcznie
• Brak opłat za przelewy bankowe

<b>📄 Pełna dokumentacja:</b>
• Faktury VAT
• Umowy ramowe
• Potwierdzenia transakcji
• Raporty księgowe

<b>👨‍💼 Dedykowane wsparcie:</b>
• Osobisty opiekun konta
• Priorytetowa obsługa
• Konsultacje telefoniczne 24/7
• Wsparcie w większych transakcjach

<b>⚡ Dodatkowe usługi:</b>
• OTC (Over-The-Counter) dla dużych kwot
• Regularne rozliczenia kryptowalutowe
• Hedging i zarządzanie ryzykiem
• Płatności międzynarodowe

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>📊 Warunki współpracy:</b>

<b>🥉 Pakiet Start:</b>
• Wolumen: 10 000 - 50 000 PLN/mc
• Spread: -0.2%
• Faktury VAT
• Support: email

<b>🥈 Pakiet Business:</b>
• Wolumen: 50 000 - 200 000 PLN/mc
• Spread: -0.5%
• Faktury VAT
• Dedykowany opiekun
• Support: email + tel

<b>🥇 Pakiet Premium:</b>
• Wolumen: 200 000 - 1 000 000 PLN/mc
• Spread: -0.8%
• Wszystkie usługi Business
• Indywidualne rozwiązania OTC
• Support 24/7

<b>💎 Pakiet Enterprise:</b>
• Wolumen: >1 000 000 PLN/mc
• Spread: negocjowany indywidualnie
• Wszystkie usługi Premium
• API integration
• Dedykowany team

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>📞 Kontakt B2B:</b>
• Email: b2b@cashymine.pl
• Telefon: +48 22 XXX XXXX
• Umów spotkanie: cashimine.netlify.app/b2b

<b>📄 Wymagane dokumenty:</b>
• KRS/CEIDG
• NIP
• Umowa współpracy
• Pełnomocnictwa (jeśli dotyczy)

💡 <i>Rozpocznij współpracę z CashyMine już dziś!</i>
`,

  DEBUG_TEMPLATE: (data: any) => `
🐛 <b>Informacje debugowania</b>

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>👤 Informacje o użytkowniku:</b>
• ID: <code>${data.userId || "N/A"}</code>
• Nazwa użytkownika: ${data.username || "N/A"}
• Język: ${data.language || "pl"}
• Premium: ${data.isPremium ? "✅" : "❌"}

<b>💬 Informacje o czacie:</b>
• Typ: ${data.chatType || "N/A"}
• ID: <code>${data.chatId || "N/A"}</code>

<b>🤖 Informacje o bocie:</b>
• Środowisko: ${data.environment}
• Produkcja: ${data.isProduction ? "✅" : "❌"}
• Konserwacja: ${data.maintenanceMode ? "🛠️" : "✅"}

<b>📊 Sesja:</b>
<code>${JSON.stringify(data.session || {}, null, 2)}</code>

<b>⚙️ Handlery:</b>
• Ograniczanie częstotliwości: ${data.rateLimiting ? "✅" : "❌"}
• Monitor wydajności: ${data.performanceMonitoring ? "✅" : "❌"}
• Logowanie żądań: ${data.requestLogging ? "✅" : "❌"}

<b>👑 Status administratora:</b>
${data.isAdmin ? "✅ Jesteś administratorem" : "❌ Zwykły użytkownik"}
${data.adminCount ? `• Łączna liczba administratorów: ${data.adminCount}` : ""}

<code>━━━━━━━━━━━━━━━━━━━━</code>

<b>📡 System:</b>
• Znacznik czasu: ${new Date().toISOString()}
• ID aktualizacji: ${data.updateId || "N/A"}
• Pamięć: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
`,
} as const;
