const fs = require('fs');
const path = require('path');

const localesDir = path.resolve(__dirname, '../src/locales');
const uzPath = path.join(localesDir, 'uz.json');
const ruPath = path.join(localesDir, 'ru.json');
const enPath = path.join(localesDir, 'en.json');

const uz = JSON.parse(fs.readFileSync(uzPath, 'utf8'));
const ru = JSON.parse(fs.readFileSync(ruPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// 1. daily_bonus
const daily_bonus = {
  uz: {
    title: "Kunlik Bonus",
    ready_subtitle: "Bonus tayyor! Hoziroq oling.",
    cooldown_subtitle: "Keyingi bonusga qolgan vaqt:",
    claim: "Olish",
    claiming: "Olinmoqda...",
    stone_reward: "+{{count}} Tosh"
  },
  ru: {
    title: "Ежедневный Бонус",
    ready_subtitle: "Бонус готов! Заберите сейчас.",
    cooldown_subtitle: "До следующего бонуса:",
    claim: "Забрать",
    claiming: "Получение...",
    stone_reward: "+{{count}} Камней"
  },
  en: {
    title: "Daily Bonus",
    ready_subtitle: "Bonus ready! Claim now.",
    cooldown_subtitle: "Time until next bonus:",
    claim: "Claim",
    claiming: "Claiming...",
    stone_reward: "+{{count}} Stones"
  }
};

// 2. celebratory
const celebratory = {
  uz: {
    new_gift_purchase: "Yangi Sovg'a Xaridi",
    admin_gift_title: "Maxsus Admin Sovg'asi",
    friend_gift_title: "Do'stdan Tantanali Sovg'a",
    view_in_collection: "Kolleksiyada Ko'rish ✨",
    accept_and_save: "Qabul qilish va Saqlash 🎁",
    luxe_gift: "Luxe Sovg'a",
    stones_reward: "{{count}} ta Tosh",
    added_to_collection: "Kolleksiyangizga muvaffaqiyatli qo'shildi!",
    presented_by_admin: "Tizim ma'muriyati tomonidan taqdim etildi",
    sender_prefix: "Yuboruvchi: {{name}}",
    official_bot: "Rasmiy XOXO Bot",
    player_label: "O'yinchi",
    tokens_received: "Qabul qilingan toshlar:",
    default_purchase_msg: "Siz bu eksklyuziv sovg'aning yagona egasisiz!",
    default_gift_msg: "O'yinda omad va g'alabalar tilayman!"
  },
  ru: {
    new_gift_purchase: "Покупка нового подарка",
    admin_gift_title: "Специальный подарок от админа",
    friend_gift_title: "Подарок от друга",
    view_in_collection: "Смотреть в коллекции ✨",
    accept_and_save: "Принять и сохранить 🎁",
    luxe_gift: "Люкс Подарок",
    stones_reward: "{{count}} Камней",
    added_to_collection: "Успешно добавлено в вашу коллекцию!",
    presented_by_admin: "Предоставлено администрацией системы",
    sender_prefix: "Отправитель: {{name}}",
    official_bot: "Официальный XOXO Бот",
    player_label: "Игрок",
    tokens_received: "Полученные камни:",
    default_purchase_msg: "Вы единственный обладатель этого подарка!",
    default_gift_msg: "Желаю удачи и побед в игре!"
  },
  en: {
    new_gift_purchase: "New Gift Purchase",
    admin_gift_title: "Special Admin Gift",
    friend_gift_title: "Celebratory Gift from Friend",
    view_in_collection: "View in Collection ✨",
    accept_and_save: "Accept & Save 🎁",
    luxe_gift: "Luxe Gift",
    stones_reward: "{{count}} Stones",
    added_to_collection: "Successfully added to your collection!",
    presented_by_admin: "Presented by system administration",
    sender_prefix: "Sender: {{name}}",
    official_bot: "Official XOXO Bot",
    player_label: "Player",
    tokens_received: "Stones received:",
    default_purchase_msg: "You are the exclusive owner of this gift!",
    default_gift_msg: "Wishing you good luck and victory in battle!"
  }
};

// 3. public_profile
const public_profile = {
  uz: {
    solo_player: "Yakkaxon o'yinchi",
    send_friend_request: "Do'stlik so'rovi",
    request_sent: "Do'stlik so'rovi yuborildi!",
    request_already_sent: "So'rovingiz yuborilgan ⏳",
    request_accepted: "Do'stlik qabul qilindi!",
    request_declined: "Rad etildi",
    accept_request: "Qabul qilish",
    decline_request: "Rad etish",
    your_friend: "Sizning do'stingiz",
    wins_stat: "G'alaba",
    losses_stat: "Mag'lubiyat",
    winrate_stat: "G'alaba %",
    collectible_gifts_title: "Kolleksiya Sovg'alari",
    send_gift_btn: "Sovg'a yuborish",
    server_error: "Serverda xatolik",
    request_send_error: "So'rov yuborishda xatolik",
    gift_count: "{{count}} ta"
  },
  ru: {
    solo_player: "Одиночный игрок",
    send_friend_request: "Запрос в друзья",
    request_sent: "Запрос в друзья отправлен!",
    request_already_sent: "Запрос уже отправлен ⏳",
    request_accepted: "Запрос в друзья принят!",
    request_declined: "Отклонено",
    accept_request: "Принять",
    decline_request: "Отклонить",
    your_friend: "Ваш друг",
    wins_stat: "Побед",
    losses_stat: "Поражений",
    winrate_stat: "% побед",
    collectible_gifts_title: "Коллекционные Подарки",
    send_gift_btn: "Отправить подарок",
    server_error: "Ошибка сервера",
    request_send_error: "Ошибка при отправке запроса",
    gift_count: "{{count}} шт."
  },
  en: {
    solo_player: "Solo player",
    send_friend_request: "Friend request",
    request_sent: "Friend request sent!",
    request_already_sent: "Request sent ⏳",
    request_accepted: "Friend request accepted!",
    request_declined: "Declined",
    accept_request: "Accept",
    decline_request: "Decline",
    your_friend: "Your friend",
    wins_stat: "Wins",
    losses_stat: "Losses",
    winrate_stat: "Win rate %",
    collectible_gifts_title: "Collectible Gifts",
    send_gift_btn: "Send gift",
    server_error: "Server error",
    request_send_error: "Error sending request",
    gift_count: "{{count}} items"
  }
};

// 4. common
const common = {
  uz: {
    loading: "Yuklanmoqda...",
    error_occurred: "Xatolik yuz berdi",
    close: "Yopish",
    stone: "Tosh"
  },
  ru: {
    loading: "Загрузка...",
    error_occurred: "Произошла ошибка",
    close: "Закрыть",
    stone: "Камень"
  },
  en: {
    loading: "Loading...",
    error_occurred: "An error occurred",
    close: "Close",
    stone: "Stone"
  }
};

// Add to uz
uz.daily_bonus = daily_bonus.uz;
uz.celebratory = celebratory.uz;
uz.public_profile = public_profile.uz;
uz.common = common.uz;

// Add to ru
ru.daily_bonus = daily_bonus.ru;
ru.celebratory = celebratory.ru;
ru.public_profile = public_profile.ru;
ru.common = common.ru;

// Add to en
en.daily_bonus = daily_bonus.en;
en.celebratory = celebratory.en;
en.public_profile = public_profile.en;
en.common = common.en;

// Update friends additions
const friendsExtra = {
  uz: {
    friends_tab: "Do'stlar",
    all_filter: "Barchasi",
    only_online_filter: "Faqat Online",
    challenge_action: "Jang",
    challenge_title: "Do'stni jangga chaqirish",
    online_tooltip: "Online (Hozir tarmoqda)",
    offline_tooltip: "Offline (Tarmoqda emas)"
  },
  ru: {
    friends_tab: "Друзья",
    all_filter: "Все",
    only_online_filter: "Только онлайн",
    challenge_action: "Бросить вызов",
    challenge_title: "Вызвать друга на бой",
    online_tooltip: "В сети (сейчас онлайн)",
    offline_tooltip: "Не в сети"
  },
  en: {
    friends_tab: "Friends",
    all_filter: "All",
    only_online_filter: "Online only",
    challenge_action: "Battle",
    challenge_title: "Challenge friend to battle",
    online_tooltip: "Online (Active now)",
    offline_tooltip: "Offline"
  }
};
Object.assign(uz.friends, friendsExtra.uz);
Object.assign(ru.friends, friendsExtra.ru);
Object.assign(en.friends, friendsExtra.en);

// Update gifts additions
const giftsExtra = {
  uz: {
    telegram_collectible: "Telegram Kolleksion Sovg'asi",
    rarity: "Raritet",
    initial_price: "Boshlang'ich Narxi",
    season_label: "Mavsum",
    resale: "Qayta Sotish",
    stones_price: "{{count}} Tosh",
    stones_gain: "+{{count}} Tosh",
    buy_for_amount: "{{amount}} Tosh evaziga sotib olish",
    send_to_friend_btn: "Do'stga sovg'a sifatida yuborish ✨",
    exchange_for_stones: "Toshga almashtirish (+{{amount}} Tosh)",
    sell_stones: "Sotish (+{{amount}} Tosh)",
    send_action: "Yuborish",
    view_action: "Ko'rish ✨"
  },
  ru: {
    telegram_collectible: "Коллекционный подарок Telegram",
    rarity: "Редкость",
    initial_price: "Начальная цена",
    season_label: "Сезон",
    resale: "Перепродажа",
    stones_price: "{{count}} Камней",
    stones_gain: "+{{count}} Камней",
    buy_for_amount: "Купить за {{amount}} камней",
    send_to_friend_btn: "Отправить другу как подарок ✨",
    exchange_for_stones: "Обменять на камни (+{{amount}} камней)",
    sell_stones: "Продать (+{{amount}} камней)",
    send_action: "Отправить",
    view_action: "Смотреть ✨"
  },
  en: {
    telegram_collectible: "Telegram Collectible Gift",
    rarity: "Rarity",
    initial_price: "Initial Price",
    season_label: "Season",
    resale: "Resale",
    stones_price: "{{count}} Stones",
    stones_gain: "+{{count}} Stones",
    buy_for_amount: "Buy for {{amount}} stones",
    send_to_friend_btn: "Send to a friend as a gift ✨",
    exchange_for_stones: "Exchange for stones (+{{amount}} stones)",
    sell_stones: "Sell (+{{amount}} stones)",
    send_action: "Send",
    view_action: "View ✨"
  }
};
Object.assign(uz.gifts, giftsExtra.uz);
Object.assign(ru.gifts, giftsExtra.ru);
Object.assign(en.gifts, giftsExtra.en);

// Update profile additions
const profileExtra = {
  uz: {
    gifts: "Sovg'alar",
    gifts_store: "Sovg'alar Do'koni",
    gifts_collection: "Kolleksiya Sovg'alari",
    gifts_expo_subtitle: "Telegram rasmiy sovg'alar ko'rgazmasi",
    store_short: "Do'kon",
    gifts_empty_title: "Kolleksiyangiz hozircha bo'sh",
    gifts_empty_desc: "Telegram kolleksion sovg'alarini to'plang, profilingizda namoyish qiling yoki do'stlaringizga yuboring!",
    open_gifts_store: "Sovg'alar Do'koni 🎁"
  },
  ru: {
    gifts: "Подарки",
    gifts_store: "Магазин подарков",
    gifts_collection: "Коллекционные Подарки",
    gifts_expo_subtitle: "Выставка официальных подарков Telegram",
    store_short: "Магазин",
    gifts_empty_title: "Ваша коллекция пока пуста",
    gifts_empty_desc: "Собирайте коллекционные подарки Telegram, показывайте в профиле или дарите друзьям!",
    open_gifts_store: "Магазин подарков 🎁"
  },
  en: {
    gifts: "Gifts",
    gifts_store: "Gifts Store",
    gifts_collection: "Collectible Gifts",
    gifts_expo_subtitle: "Official Telegram collectible gift showcase",
    store_short: "Store",
    gifts_empty_title: "Your collection is currently empty",
    gifts_empty_desc: "Collect Telegram gifts, showcase in profile, or gift them to friends!",
    open_gifts_store: "Gifts Store 🎁"
  }
};
Object.assign(uz.profile, profileExtra.uz);
Object.assign(ru.profile, profileExtra.ru);
Object.assign(en.profile, profileExtra.en);

// Update leaderboard additions
const leaderboardExtra = {
  uz: {
    win_rate: "G'alaba foizi",
    empty_individual: "Reytingda hali o'yinchilar yo'q. Birinchi bo'lib g'alaba qozoning!"
  },
  ru: {
    win_rate: "Процент побед",
    empty_individual: "В рейтинге пока нет игроков. Будьте первыми!"
  },
  en: {
    win_rate: "Win rate",
    empty_individual: "No players on leaderboard yet. Be the first to win!"
  }
};
Object.assign(uz.leaderboard, leaderboardExtra.uz);
Object.assign(ru.leaderboard, leaderboardExtra.ru);
Object.assign(en.leaderboard, leaderboardExtra.en);

fs.writeFileSync(uzPath, JSON.stringify(uz, null, 2) + '\n');
fs.writeFileSync(ruPath, JSON.stringify(ru, null, 2) + '\n');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');

console.log('Successfully updated uz.json, ru.json, and en.json with full parity!');
