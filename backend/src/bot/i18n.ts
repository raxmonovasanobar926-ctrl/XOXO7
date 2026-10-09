// Bot Multi-Language Dictionary (uz, ru, en)
export type BotLanguage = 'uz' | 'ru' | 'en';

export const botTranslations: Record<BotLanguage, {
  botDescription: string;
  botShortDescription: string;
  welcome: (name: string, balance: number, refBonus: number) => string;
  playBtn: string;
  channelBtn: string;
  adminTitle: (nick: string) => string;
  adminBtn: string;
  paysupport: string;
  terms: string;
  help: string;
  referralMsg: (link: string, total: number, active: number, earned: number, bonus: number) => string;
  shareBtn: string;
  shareText: string;
  needStart: string;
  adminAppointed: string;
  giftReceived: (amount: number, note: string) => string;
  preCheckoutBlocked: string;
  preCheckoutInactivePack: string;
  preCheckoutError: string;
  paymentSuccess: (tokens: number, stars: number) => string;
}> = {
  uz: {
    botDescription: "XOXO — 3 ta belgili taktik shaxmat-arkada jangi! Real vaqtda o'yinchilar yoki AI Golemlar bilan kuch sinashing, toshlar yuting va eksklyuziv sovg'alarga ega bo'ling!",
    botShortDescription: "XOXO — Real-vaqtli strategik taktik o'yin!",
    welcome: (name, balance, refBonus) => 
`👋 **Salom, ${name}! XOXO jang olamiga xush kelibsiz!** 🎮

**XOXO** — bu retro neon arkada uslubidagi real-vaqtli strategik jang!

⚡ **Yangi o'yin qoidalari:**
• Har bir o'yinchida jami **faqat 3 ta belgi** bor!
• **1-bosqich:** Navbat bilan bo'sh kataklarga 3 ta belgingizni qo'yasiz.
• **2-bosqich:** 3 ta belgingiz doskada bo'lgach, istalgan belgingizni tanlab istalgan bo'sh katakka ko'chirasiz!
• Birinchi bo'lib gorizontal, vertikal yoki diagonal 3 ta belgi tergan o'yinchi yutadi!
• O'yin boshida **Tosh-Qaychi-Qog'oz (RPS)** o'ynab, kim "X" bo'lib birinchi yurishini aniqlaysiz!

🎁 **Sizning balansingiz:** ${balance} tosh
👥 **Do'stlaringizni taklif qilib, har biri uchun +${refBonus} tosh oling!**`,
    playBtn: "🔥 O'yinni boshlash",
    channelBtn: "📢 Kanalimiz",
    adminTitle: (nick) => `🛡️ **XOXO Admin Paneli**\n\nHurmatli **${nick}**, admin panelga kirish uchun quyidagi tugmani bosing:`,
    adminBtn: "🛡️ Admin Panelni ochish",
    paysupport: 
`⭐ **Telegram Stars to'lovlari bo'yicha yordam**

Agar toshlar xaridi yoki Stars to'lovida muammoga duch kelsangiz:
1. To'lov identifikatorini (Telegram Payment Charge ID) saqlab qoling.
2. Bot adminlariga yoki qo'llab-quvvatlash xizmatiga murojaat qiling.
3. Barcha muvaffaqiyatli to'lovlar hisobingizga avtomatik tarzda tosh sifatida qo'shiladi.`,
    terms:
`📜 **XOXO Foydalanish Shartlari (Terms of Service)**

1. XOXO platformasidagi toshlar faqat **o'yin ichidagi virtual valyuta** hisoblanadi.
2. Toshlarni haqiqiy pulga yoki Telegram Stars ga qayta almashtirib yoki yechib olib bo'lmaydi.
3. Toshlar boshqa foydalanuvchiga to'g'ridan-to'g'ri o'tkazilmaydi, faqat o'yin g'olibi sifatida yutib olinadi.
4. Telegram Stars orqali sotib olingan paketlar qaytarilmaydi (qoidabuzarlik va admin tekshiruvi holatlari bundan mustasno).
5. Haqiqiy o'yinchilar (PvP) o'rtasidagi o'yinlarda g'olib stavkalar yig'indisidan 1 tosh kam oladi (payout = stake × 2 − 1). Olingan 1 tosh platforma komissiyasi (rake) hisoblanadi. Durrangda komissiya olinmaydi va stavkalar to'liq qaytariladi. AI o'yinlariga bu komissiya tatbiq etilmaydi.`,
    help:
`🎮 **XOXO Arcade — Yordam va Qoidalar**

1️⃣ **O'yin qoidasi:** 3x3 Tic-Tac-Toe o'yini. Har bir o'yinchida ko'pi bilan 3 ta belgi bor. 4-belgi qo'yilganda birinchi qo'yilgan belgi g'oyib bo'ladi yoki 2-bosqichda ko'chiriladi!
2️⃣ **AI Golemlar:** Pebble, Rocky, Granite va Obsidian bilan kuch sinashing va toshlar yutib oling!
3️⃣ **Sovg'alar (Gifts):** Mini App ichida eksklyuziv sovg'alarni sotib oling, do'stlaringizga hadya qiling va reytingda 1-o'rinni egallab 3 Oylik Telegram Premium yutib oling!
4️⃣ **Do'stlar va Toshlar:** Do'stlaringizni taklif qilib, har biri uchun bepul tosh oling!`,
    referralMsg: (link, total, active, earned, bonus) =>
`🔗 **Sizning taklif havolangiz:**
\`${link}\`

📊 **Statistika:**
• Jami taklif etilganlar: **${total} ta**
• Faol do'stlar: **${active} ta**
• Ishlab topilgan bonus: **${earned} Tosh**

Do'stlaringizni taklif qiling va har bir do'st uchun **+${bonus} Tosh** oling!`,
    shareBtn: "📲 Do'stlarga ulashish",
    shareText: "Men bilan XOXO o'yinida kuch sinash va sovg'alar yutib ol!",
    needStart: "Iltimos avval /start buyrug'ini yuboring.",
    adminAppointed: "🛡️ **Tabriklaymiz!** Sizga XOXO loyihasida **Admin** huquqi berildi! Veb admin portali orqali boshqarishingiz mumkin.",
    giftReceived: (amount, note) => `🎁 **XOXO Sovg‘asi!**\n\nSizga **+${amount} tosh** sovg‘a qilindi! 🪙\n\n${note || ''}`,
    preCheckoutBlocked: "Akkauntingiz bloklanganligi sababli xarid rad etildi.",
    preCheckoutInactivePack: "Ushbu paket hozirda mavjud emas.",
    preCheckoutError: "To'lovni tasdiqlashda xatolik yuz berdi.",
    paymentSuccess: (tokens, stars) => `🎉 **Xaridingiz uchun rahmat!**\n\nHisobingizga **+${tokens} tosh** muvaffaqiyatli qo'shildi (${stars} ⭐).`,
  },

  ru: {
    botDescription: "XOXO — тактическая PvP битва с 3 фишками в стиле аркады! Сражайтесь в реальном времени с игроками или AI Големами, выигрывайте камни и подарки!",
    botShortDescription: "XOXO — Реальное тактическое PvP мини-приложение!",
    welcome: (name, balance, refBonus) => 
`👋 **Привет, ${name}! Добро пожаловать в XOXO!** 🎮

**XOXO** — это тактическая битва в стиле неоновой ретро-аркады в реальном времени!

⚡ **Правила игры:**
• У каждого игрока всего **3 фишки**!
• **Этап 1:** По очереди расставляйте свои 3 фишки на свободные клетки.
• **Этап 2:** Когда все 3 фишки на доске, перемещайте любую свою фишку на любую свободную клетку!
• Побеждает тот, кто первым выстроит 3 свои фишки в ряд (по горизонтали, вертикали или диагонали)!
• В начале раунда играется **Камень-Ножницы-Бумага (RPS)** за право ходить первым крестиком ('X')!

🎁 **Ваш баланс:** ${balance} камней
👥 **Приглашайте друзей и получайте +${refBonus} камней за каждого!**`,
    playBtn: "🔥 Начать битву",
    channelBtn: "📢 Наш канал",
    adminTitle: (nick) => `🛡️ **Панель Администратора XOXO**\n\nЗдравствуйте, **${nick}**, нажмите кнопку ниже для входа в панель:`,
    adminBtn: "🛡️ Открыть админ-панель",
    paysupport: 
`⭐ **Поддержка по платежам Telegram Stars**

Если у вас возникли вопросы по оплате Stars или начислению камней:
1. Сохраните идентификатор платежа (Telegram Payment Charge ID).
2. Обратитесь к администраторам или в службу поддержки.
3. Все успешные транзакции начисляются на баланс автоматически.`,
    terms:
`📜 **Условия использования XOXO (Terms of Service)**

1. Камни XOXO являются исключительно **внутриигровой виртуальной валютой**.
2. Камни не подлежат обмену на реальные деньги или возврату на Telegram Stars.
3. Камни нельзя передавать напрямую, они выигрываются в матчах.
4. Покупки через Telegram Stars окончательны и не подлежат возврату, кроме установленных правилами случаев.
5. В PvP матчах между реальными игроками победитель получает сумму ставок за вычетом 1 камня (выплата = ставка × 2 − 1). Удержанный 1 камень является комиссией платформы (рейк). При ничьей комиссия не взимается и ставки возвращаются полностью. В играх против AI данная комиссия не применяется.`,
    help:
`🎮 **XOXO Arcade — Помощь и Правила**

1️⃣ **Правила игры:** Игра 3x3 Tic-Tac-Toe. У каждого игрока не более 3 фишек. При установке 4-й фишки старая исчезает или перемещается!
2️⃣ **AI Големы:** Сражайтесь с Pebble, Rocky, Granite и Obsidian и выигрывайте камни!
3️⃣ **Подарки (Gifts):** Покупайте эксклюзивные подарки, дарите друзьям и выиграйте 3 Месяца Telegram Premium за 1-е место в рейтинге!
4️⃣ **Друзья и Камни:** Приглашайте друзей и получайте бесплатные камни!`,
    referralMsg: (link, total, active, earned, bonus) =>
`🔗 **Ваша реферальная ссылка:**
\`${link}\`

📊 **Статистика:**
• Всего приглашено: **${total}**
• Активных друзей: **${active}**
• Заработано бонусов: **${earned} Камней**

Приглашайте друзей и получайте **+${bonus} Камней** за каждого!`,
    shareBtn: "📲 Поделиться с друзьями",
    shareText: "Сыграй со мной в XOXO и выиграй призы!",
    needStart: "Пожалуйста, сначала отправьте команду /start.",
    adminAppointed: "🛡️ **Поздравляем!** Вам выданы права **Администратора** в XOXO! Управление доступно через веб-панель администратора.",
    giftReceived: (amount, note) => `🎁 **Подарок XOXO!**\n\nВам начислено **+${amount} камней**! 🪙\n\n${note || ''}`,
    preCheckoutBlocked: "Покупка отклонена: ваш аккаунт заблокирован.",
    preCheckoutInactivePack: "Этот пакет сейчас недоступен.",
    preCheckoutError: "Ошибка при подтверждении платежа.",
    paymentSuccess: (tokens, stars) => `🎉 **Спасибо за покупку!**\n\nНа ваш баланс успешно начислено **+${tokens} камней** (${stars} ⭐).`,
  },

  en: {
    botDescription: "XOXO — Real-time tactical 3-piece arcade battle! Compete against real players or AI Golems, win stones, and collect exclusive gifts!",
    botShortDescription: "XOXO — Real-time tactical arcade PvP mini app!",
    welcome: (name, balance, refBonus) => 
`👋 **Welcome, ${name}, to XOXO Arcade Battle!** 🎮

**XOXO** is a real-time tactical PvP battle with neon retro-arcade action!

⚡ **Game Rules:**
• Each player controls exactly **3 marks**!
• **Phase 1 (Drop):** Take turns placing your 3 marks on empty cells.
• **Phase 2 (Shift):** Once all 3 marks are on the board, pick any of your marks and move it to any empty cell!
• First player to form 3-in-a-row (horizontal, vertical, diagonal) wins!
• Match begins with a **Rock-Paper-Scissors (RPS)** showdown for the first turn ('X')!

🎁 **Your Balance:** ${balance} stones
👥 **Invite friends and get +${refBonus} stones for each friend!**`,
    playBtn: "🔥 Start Battle",
    channelBtn: "📢 Our Channel",
    adminTitle: (nick) => `🛡️ **XOXO Admin Panel**\n\nHello **${nick}**, tap below to open the admin dashboard:`,
    adminBtn: "🛡️ Open Admin Panel",
    paysupport: 
`⭐ **Telegram Stars Payment Support**

If you encounter issues with Stars purchases or stone delivery:
1. Keep your Telegram Payment Charge ID.
2. Contact our support team or bot admins.
3. Stones are credited automatically upon successful transaction.`,
    terms:
`📜 **XOXO Terms of Service**

1. Stones on XOXO are strictly **in-game virtual entertainment currency**.
2. Stones cannot be redeemed for fiat currency or refunded back to Telegram Stars.
3. Stones cannot be directly transferred; they are staked and won in matches.
4. Purchases made with Telegram Stars are final.
5. In PvP matches between real players, the winner receives the pot minus 1 stone (payout = stake × 2 − 1). The 1 deducted stone serves as platform commission (rake). In case of a draw, no commission is charged and stakes are fully refunded. AI matches are exempt from this commission.`,
    help:
`🎮 **XOXO Arcade — Help & Rules**

1️⃣ **Game Rules:** 3x3 tactical battle. Each player controls at most 3 marks. Move or place marks dynamically!
2️⃣ **AI Golems:** Challenge Pebble, Rocky, Granite, and Obsidian to win stones!
3️⃣ **Gifts:** Collect rare exclusive gifts, send them to friends, and win 3 Months of Telegram Premium for 1st rank!
4️⃣ **Friends & Stones:** Invite your friends and earn free stones for each friend!`,
    referralMsg: (link, total, active, earned, bonus) =>
`🔗 **Your Invite Link:**
\`${link}\`

📊 **Statistics:**
• Total invited: **${total}**
• Active friends: **${active}**
• Total bonus earned: **${earned} Stones**

Invite your friends and get **+${bonus} Stones** for each friend!`,
    shareBtn: "📲 Share with friends",
    shareText: "Join me in XOXO Arcade Battle and win awesome gifts!",
    needStart: "Please send /start command first.",
    adminAppointed: "🛡️ **Congratulations!** You have been granted **Admin** rights in XOXO! Management is available via the web admin portal.",
    giftReceived: (amount, note) => `🎁 **XOXO Gift!**\n\nYou received **+${amount} stones**! 🪙\n\n${note || ''}`,
    preCheckoutBlocked: "Purchase rejected: your account is blocked.",
    preCheckoutInactivePack: "This package is currently unavailable.",
    preCheckoutError: "Error confirming payment.",
    paymentSuccess: (tokens, stars) => `🎉 **Thank you for your purchase!**\n\nSuccessfully added **+${tokens} stones** (${stars} ⭐) to your balance.`,
  },
};

export function getBotLang(rawCode?: string | null): BotLanguage {
  if (!rawCode) return 'uz';
  const lower = rawCode.toLowerCase();
  if (lower.startsWith('ru')) return 'ru';
  if (lower.startsWith('uz')) return 'uz';
  return 'en';
}
