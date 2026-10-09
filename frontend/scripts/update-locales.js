import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.resolve(__dirname, '../src/locales');
const uzPath = path.join(localesDir, 'uz.json');
const ruPath = path.join(localesDir, 'ru.json');
const enPath = path.join(localesDir, 'en.json');

const uz = JSON.parse(fs.readFileSync(uzPath, 'utf-8'));
const ru = JSON.parse(fs.readFileSync(ruPath, 'utf-8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

const additions = {
  uz: {
    dashboard: {
      gifts_btn: "Sovg'alar"
    },
    matchmaking: {
      open_room: "Ochiq xona",
      open_room_desc: "Hamma ko'radi",
      private_room: "Shaxsiy xona",
      private_room_desc: "Kod bilan",
      join_with_code: "Kod bilan kirish",
      code_sub: "5-xonali kod",
      enter_room: "Xonaga kirish",
      enter_code_hint: "5 xonali o'yin kodini kiriting"
    },
    gifts: {
      title: "Eksklyuziv Sovg'alar",
      subtitle: "Telegram gift uslubidagi noyob kolleksiya",
      tab_store: "Do'kon",
      tab_my: "Mening ({{count}})",
      tab_leaderboard: "Reyting",
      promo_banner: "Oylik reytingda eng ko'p sovg'a sotib olgan 1-o'rin ishtirokchisiga 3 Oylik Telegram Premium sovg'a qilinadi!",
      sell_price: "Sotish narxi: {{price}} Tosh",
      buy_btn: "Sotib olish",
      not_enough_stones: "Tosh yetarli emas",
      empty_my_gifts: "Sizda hali sovg'alar mavjud emas.",
      empty_hint: "Do'kondan min 250 Tosh evaziga sovg'alarni sotib oling!",
      season: "Mavsum: {{season}}",
      premium_non_sellable: "Telegram Premium (Sotilmaydi)",
      sell_btn: "Sotish (+{{price}} Tosh)",
      old_season: "Eski mavsum (Sotilmaydi)",
      total_spent: "Jami sovg'alar: {{count}} Tosh",
      premium_badge: "3-Oy Premium",
      sold_success: "Sovg'a sotildi (+{{price}} Tosh)",
      empty_leaderboard: "Hozircha sovg'alar reytingi bo'sh.",
      send_to_friend: "{{name}} ga sovg'a yuborish",
      select_gift_to_send: "Sovg'ani tanlang:",
      send_gift_btn: "Sovg‘ani yuborish",
      sending: "Yuborilmoqda...",
      get_from_store: "Do'kondan sovg'a olish"
    },
    friends: {
      invite_title: "Do'stlarni taklif qilish",
      invite_subtitle: "Har bir taklif uchun +{{bonus}} Tosh oling",
      copy_link: "Nusxalash",
      your_id: "Sizning XOXO ID",
      copy_id: "ID nusxalash",
      friends_count: "Do'stlar soni",
      id_placeholder: "Do'st ID yoki Telegram ID",
      add_btn: "Qo'shish",
      team_title: "Jamoa (Klanning)",
      team_member_prefix: "A'zolik: {{name}}",
      team_join_or_create: "Jamoaga qo'shiling yoki yarating",
      create_team: "Jamoa yaratish",
      join_team_code: "Kod bilan kirish",
      invite_code_label: "Taklif kodi: {{code}}",
      copy_code: "Kod nusxalash",
      my_friends: "Mening do'stlarim ({{count}})",
      loading: "Yuklanmoqda...",
      empty_list: "Hozircha do'stlaringiz yo'q. Yuqoridagi havola orqali do'stlaringizni taklif qiling!",
      gift_action: "Sovg'a",
      join_team_title: "Jamoaga qo‘shilish",
      team_name_label: "Jamoa nomi:",
      team_name_placeholder: "Masalan: Qaldirg'ochlar",
      create_action: "Yaratish",
      join_action: "Qo‘shilish"
    },
    leaderboard: {
      gifts_tab: "Sovg'alar",
      empty_teams: "Hozircha jamoalar mavjud emas. Birinchi bo'lib jamoa tuzing!",
      team_stats: "A'zolar: {{members}} ta • {{wins}} g'alaba",
      user_team: "Jamoa: {{name}}",
      user_solo: "Yakkaxon o‘yinchi",
      user_gifts: "Sovg'alari ({{count}}):",
      no_gifts: "Hali sovg'alar yo'q"
    },
    avatar: {
      select_desc: "Pop-art qahramonlardan birini tanlang yoki o‘z rasmingizni yuklang",
      gallery_title: "Galereyadan",
      gallery_desc: "Rasm yuklash"
    },
    promo: {
      error_not_found: "Bunday promokod mavjud emas",
      error_inactive: "Ushbu promokod faol emas",
      error_not_started: "Promokod hali kuchga kirmagan",
      error_expired: "Promokodning amal qilish muddati tugagan",
      error_max_uses: "Ushbu promokoddan foydalanish limiti tugagan",
      error_already_used: "Siz bu promokoddan allaqachon foydalangansiz",
      error_rate_limited: "Juda ko‘p noto‘g‘ri urinishlar. Iltimos, 1 daqiqadan so‘ng qayta urinib ko‘ring.",
      error_network: "Server bilan ulanishda xatolik"
    },
    profile: {
      copied: "Nusxalandi",
      copy: "Nusxa",
      wins: "G'alaba",
      losses: "Mag'lubiyat"
    },
    store: {
      pack_starter: "Boshlang'ich",
      pack_popular: "Ommabop",
      pack_pro: "Professional",
      pack_mega: "Ulkan"
    }
  },
  ru: {
    dashboard: {
      gifts_btn: "Подарки"
    },
    matchmaking: {
      open_room: "Открытая комната",
      open_room_desc: "Видна всем",
      private_room: "Приватная комната",
      private_room_desc: "По коду",
      join_with_code: "Войти по коду",
      code_sub: "5-значный код",
      enter_room: "Войти в комнату",
      enter_code_hint: "Введите 5-значный код комнаты"
    },
    gifts: {
      title: "Эксклюзивные Подарки",
      subtitle: "Уникальная коллекция в стиле подарков Telegram",
      tab_store: "Магазин",
      tab_my: "Мои ({{count}})",
      tab_leaderboard: "Рейтинг",
      promo_banner: "Игрок на 1-м месте по итогам месяца получает 3 Месяца Telegram Premium!",
      sell_price: "Цена продажи: {{price}} Камней",
      buy_btn: "Купить",
      not_enough_stones: "Недостаточно камней",
      empty_my_gifts: "У вас пока нет подарков.",
      empty_hint: "Покупайте подарки в магазине от 250 Камней!",
      season: "Сезон: {{season}}",
      premium_non_sellable: "Telegram Premium (Не продается)",
      sell_btn: "Продать (+{{price}} Камней)",
      old_season: "Старый сезон (Не продается)",
      total_spent: "Всего подарков: {{count}} Камней",
      premium_badge: "3-Мес Premium",
      sold_success: "Подарок продан (+{{price}} Камней)",
      empty_leaderboard: "Рейтинг подарков пока пуст.",
      send_to_friend: "Отправить подарок для {{name}}",
      select_gift_to_send: "Выберите подарок:",
      send_gift_btn: "Отправить подарок",
      sending: "Отправка...",
      get_from_store: "Купить подарок в магазине"
    },
    friends: {
      invite_title: "Пригласить друзей",
      invite_subtitle: "Получайте +{{bonus}} Камней за каждого друга",
      copy_link: "Копировать",
      your_id: "Ваш XOXO ID",
      copy_id: "Копировать ID",
      friends_count: "Количество друзей",
      id_placeholder: "ID друга или Telegram ID",
      add_btn: "Добавить",
      team_title: "Команда (Клан)",
      team_member_prefix: "Участие: {{name}}",
      team_join_or_create: "Присоединяйтесь или создайте команду",
      create_team: "Создать команду",
      join_team_code: "Войти по коду",
      invite_code_label: "Код приглашения: {{code}}",
      copy_code: "Копировать код",
      my_friends: "Мои друзья ({{count}})",
      loading: "Загрузка...",
      empty_list: "У вас пока нет друзей. Приглашайте друзей по ссылке выше!",
      gift_action: "Подарок",
      join_team_title: "Вступить в команду",
      team_name_label: "Название команды:",
      team_name_placeholder: "Например: Ласточки",
      create_action: "Создать",
      join_action: "Присоединиться"
    },
    leaderboard: {
      gifts_tab: "Подарки",
      empty_teams: "Команд пока нет. Создайте команду первым!",
      team_stats: "Участников: {{members}} • {{wins}} побед",
      user_team: "Команда: {{name}}",
      user_solo: "Одиночный игрок",
      user_gifts: "Подарки ({{count}}):",
      no_gifts: "Подарков пока нет"
    },
    avatar: {
      select_desc: "Выберите поп-арт персонажа или загрузите свое фото",
      gallery_title: "Из галереи",
      gallery_desc: "Загрузить фото"
    },
    promo: {
      error_not_found: "Такой промокод не существует",
      error_inactive: "Этот промокод не активен",
      error_not_started: "Срок действия промокода еще не начался",
      error_expired: "Срок действия промокода истек",
      error_max_uses: "Лимит использований промокода исчерпан",
      error_already_used: "Вы уже использовали этот промокод",
      error_rate_limited: "Слишком много неудачных попыток. Пожалуйста, попробуйте через 1 минуту.",
      error_network: "Ошибка подключения к серверу"
    },
    profile: {
      copied: "Скопировано",
      copy: "Копия",
      wins: "Победы",
      losses: "Поражения"
    },
    store: {
      pack_starter: "Стартовый",
      pack_popular: "Популярный",
      pack_pro: "Про",
      pack_mega: "Мега"
    }
  },
  en: {
    dashboard: {
      gifts_btn: "Gifts"
    },
    matchmaking: {
      open_room: "Public Room",
      open_room_desc: "Visible to all",
      private_room: "Private Room",
      private_room_desc: "With code",
      join_with_code: "Join via code",
      code_sub: "5-digit code",
      enter_room: "Enter Room",
      enter_code_hint: "Enter 5-digit room code"
    },
    gifts: {
      title: "Exclusive Gifts",
      subtitle: "Unique Telegram gift-style collection",
      tab_store: "Store",
      tab_my: "My Gifts ({{count}})",
      tab_leaderboard: "Leaderboard",
      promo_banner: "1st place player in the monthly gifts ranking wins 3 Months of Telegram Premium!",
      sell_price: "Sell price: {{price}} Stones",
      buy_btn: "Buy",
      not_enough_stones: "Not enough stones",
      empty_my_gifts: "You have no gifts yet.",
      empty_hint: "Buy gifts in the store starting from 250 Stones!",
      season: "Season: {{season}}",
      premium_non_sellable: "Telegram Premium (Non-sellable)",
      sell_btn: "Sell (+{{price}} Stones)",
      old_season: "Old season (Non-sellable)",
      total_spent: "Total gifts: {{count}} Stones",
      premium_badge: "3-Mo Premium",
      sold_success: "Gift sold (+{{price}} Stones)",
      empty_leaderboard: "Gifts leaderboard is currently empty.",
      send_to_friend: "Send gift to {{name}}",
      select_gift_to_send: "Select a gift:",
      send_gift_btn: "Send gift",
      sending: "Sending...",
      get_from_store: "Get gift from store"
    },
    friends: {
      invite_title: "Invite Friends",
      invite_subtitle: "Get +{{bonus}} Stones for each friend",
      copy_link: "Copy",
      your_id: "Your XOXO ID",
      copy_id: "Copy ID",
      friends_count: "Friends count",
      id_placeholder: "Friend ID or Telegram ID",
      add_btn: "Add",
      team_title: "Team (Clan)",
      team_member_prefix: "Member: {{name}}",
      team_join_or_create: "Join or create a team",
      create_team: "Create Team",
      join_team_code: "Join with Code",
      invite_code_label: "Invite code: {{code}}",
      copy_code: "Copy Code",
      my_friends: "My Friends ({{count}})",
      loading: "Loading...",
      empty_list: "You do not have friends yet. Invite friends using the link above!",
      gift_action: "Gift",
      join_team_title: "Join Team",
      team_name_label: "Team name:",
      team_name_placeholder: "E.g.: Eagles",
      create_action: "Create",
      join_action: "Join"
    },
    leaderboard: {
      gifts_tab: "Gifts",
      empty_teams: "No teams yet. Be the first to create a team!",
      team_stats: "Members: {{members}} • {{wins}} wins",
      user_team: "Team: {{name}}",
      user_solo: "Solo Player",
      user_gifts: "Gifts ({{count}}):",
      no_gifts: "No gifts yet"
    },
    avatar: {
      select_desc: "Choose a pop-art character or upload your own photo",
      gallery_title: "From gallery",
      gallery_desc: "Upload photo"
    },
    promo: {
      error_not_found: "This promo code does not exist",
      error_inactive: "This promo code is inactive",
      error_not_started: "Promo code is not active yet",
      error_expired: "Promo code has expired",
      error_max_uses: "Promo code usage limit reached",
      error_already_used: "You have already redeemed this promo code",
      error_rate_limited: "Too many failed attempts. Please try again after 1 minute.",
      error_network: "Error connecting to server"
    },
    profile: {
      copied: "Copied",
      copy: "Copy",
      wins: "Wins",
      losses: "Losses"
    },
    store: {
      pack_starter: "Starter",
      pack_popular: "Popular",
      pack_pro: "Pro",
      pack_mega: "Mega"
    }
  }
};

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

deepMerge(uz, additions.uz);
deepMerge(ru, additions.ru);
deepMerge(en, additions.en);

fs.writeFileSync(uzPath, JSON.stringify(uz, null, 2) + '\n');
fs.writeFileSync(ruPath, JSON.stringify(ru, null, 2) + '\n');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');
console.log('✅ Successfully updated uz.json, ru.json, and en.json!');
