# 🎮 XOXO — Telegram Bot & Real-Time Mini App

**XOXO** — bu do‘stlar bilan referral orqali kengayadigan, tokenlar bilan pul tikish (in-app virtual currency) tizimiga ega ijtimoiy va real-vaqtli **"Vanishing Tic-Tac-Toe"** o‘yini.

---

## 🌟 Asosiy Imkoniyatlar va Qoidalar

### 1. 🪨 Tosh-Qaychi-Qog‘oz (RPS) Bosqichi
* Har bir o‘yin boshlanishidan oldin 5 soniyalik RPS bosqichi o‘ynaladi.
* Tanlovlar yashirin saqlanadi ("sealed choice" pattern) va bir vaqtda ochiladi (3-2-1 animatsiya bilan).
* G‘olib o‘yinchi **"X"** belgisini oladi va o‘yinda birinchi yuradi.
* Durrang bo‘lsa, qayta o‘ynaladi (maksimal 3 marta, so‘ngra tizim tasodifiy hal qiladi).
* AFK himoyasi: vaqt tugasa, tizim avtomatik tanlov qiladi.

### 2. ⭕ "Vanishing Tic-Tac-Toe" (3 ta belgi qoidasi)
* Doska — standart 3x3.
* Har bir o‘yinchida bir vaqtning o‘zida **faqat 3 tagacha** o‘z belgisi (X yoki O) doskada turishi mumkin.
* 4-belgi qo‘yilganda — **eng birinchi (eng eski) qo‘yilgan belgi doskadan avtomatik yo‘qoladi (FIFO)**!
* Frontendda o‘yinchiga keyingi safar qaysi belgisi yo‘qolishi aniq pulsatsiyalanuvchi / aylanuvchi vizual signal orqali ko‘rsatiladi.
* 20 soniyalik yurish taymeri — vaqt tugasa, avtomatik bo‘sh katakchaga yurish qilinadi.

### 3. 💬 Battle-Chat (Tezkor muloqot)
* O‘yin paytida raqibga yuboriladigan emoji to‘plami: 👍, 🔥, 😅, 😢, 🎉, 😡, 💀, 🧠, 👑
* Tayyor iboralar to‘plami: *"Omad! 🍀"*, *"Zo‘r yurish! 👏"*, *"Ehtiyot bo‘l 😏"*, *"GG! 🤝"*, *"Rematch so‘rayman 🔁"*, *"Voydod! 😱"*, *"Men yutaman! ⚡"*, *"Xato qilding! 🎯"*
* Xabarlar real vaqtda raqib ustida suzuvchi animatsion pufakcha (chat bubble) ko‘rinishida chiqadi.

### 4. 🪙 Token Iqtisodiyoti & Referrallar
* Yangi ro‘yxatdan o‘tgan o‘yinchiga **25 token** beriladi.
* Tikish (stake) darajalari: **1, 3, 5, 10 token**.
* G‘olib ikkala tomon tikkan summani oladi (masalan, 5 tokendan tikilsa, g‘olib 10 token oladi).
* Har bir taklif qilingan faol do‘st uchun **+5 token** bonus.
* Har 24 soatda **+5 token** kunlik bonus olish imkoniyati.
* Barcha tranzaksiyalar `transactions` audit jadvalida qayd etiladi.

### 5. 👥 Jamoalar (Teams) va 🏆 Reytinglar
* Individual reyting (Top-100, haftalik, oylik, umumiy) va foydalanuvchining shaxsiy o‘rni (sticky rank card).
* Jamoalar tuzish, invite-kod orqali qo‘shilish va jamoaviy reyting.
* Istalgan o‘yinchining profilini bosib uning statistikasini ko‘rish (Public Profile Modal).

### 6. 🎨 Premium Dizayn & Haptics
* Dark gaming neon dizayn (X uchun elektr-ko‘k `#00F0FF`, O uchun neon-olov `#FF5E00`).
* Web Audio API orqali generatsiya qilinadigan real-vaqtli ovoz effektlari.
* Telegram WebApp native `HapticFeedback` tebranishlari.
* 3 tilda to‘liq lokalizatsiya (O‘zbekcha, Ruscha, Inglizcha).
* 16 xil tayyor o‘yinchi personajlari (avatar) yoki shaxsiy rasm URL yuklash.

---

### 7. 🛡️ Admin Panel & RBAC Tizimi (Task 2)
* **3 ta Rol:**
  - `user`: Oddiy o‘yinchi.
  - `admin`: Admin panelga kirish, userlarni bloklash, promokod yaratish, sovg'a tarqatish.
  - `super_admin`: Faqat 1 ta (`SUPER_ADMIN_TELEGRAM_ID` orqali auto-tayinlanadi). Admin qo‘shish/o‘chirish, Stars to‘lovlarini nazorat qilish va qaytarish (refund), tizim sozlamalarini boshqarish.
* **Xavfsizlik:**
  - `super_admin`ni bloklab, o‘chirib yoki rolini pasaytirib bo‘lmaydi.
  - Adminlar bir-birini bloklay olmaydi; faqat `super_admin` adminni bloklay oladi.
  - Har bir endpoint backendda qat'iy tekshiriladi (ruxsat yo‘q bo‘lsa 403 Forbidden).
* **Admin Panel 8 ta Bo‘limi:**
  1. **Dashboard:** Jami/bugungi userlar, onlayn, o‘yinlar soni, aylanmadagi tokenlar, Stars daromadi, 30 kunlik grafiklar.
  2. **Foydalanuvchilar:** Qidiruv (ID, nickname), filtrlar, sahifalash, kartochka, bloklash (sabab va muddat bilan) va balansni qo‘lda o‘zgartirish (audit sababi bilan).
  3. **Promokodlar:** Kod generatsiya/yozish, token summasi, max_uses, per_user_limit, muddatlar, faollik, redemption log.
  4. **Sovg‘a tarqatish (Airdrop):** Yagona user, ro‘yxat, barcha userlar yoki segment bo‘yicha tarqatish. Tasdiqlash oynasi, kunlik admin limiti, idempotentlik, fon navbati va Telegram rate-limit (~25 msg/s).
  5. **Adminlar (Faqat super_admin):** Yangi admin qo‘shish, o‘chirish, bot bildirishnomasi.
  6. **Stars To‘lovlari & Refund (Faqat super_admin):** Barcha Stars xaridlari, umumiy tushum, `refundStarPayment` orqali qaytarish va balansni to‘g‘rilash.
  7. **Audit Log:** Barcha admin harakatlari (kim, qachon, nima qildi, sabab) append-only qayd etiladi.
  8. **Sozlamalar (Faqat super_admin):** Boshlang‘ich token (25), referral bonusi, kunlik bonus, admin kunlik limiti, va yurish vaqtlarini kodga tegmasdan o‘zgartirish.

### 8. ⭐️ Telegram Stars (`XTR`) orqali Token Sotish
* Tokenlar tugaganda (yoki ixtiyoriy paytda) ochiluvchi zamonaviy do‘kon:
  - **Starter:** 25 token — 25 Stars
  - **Popular:** 60 token — 50 Stars (~20% bonus)
  - **Pro:** 150 token — 100 Stars (~50% bonus)
  - **Mega:** 400 token — 250 Stars (~60% bonus)
* `createInvoiceLink` (`currency: "XTR"`, `prices: [...]`), `pre_checkout_query` 10 soniyalik validatsiya, va `successful_payment` idempotent kvitansiya hisobi (`telegram_payment_charge_id` bo‘yicha).
* Botda `/paysupport` va `/terms` buyruqlari mavjud.

---

## 🛠 Texnologik Stack

- **Backend:** Node.js (TypeScript, ES2022) + Express.js + Socket.IO + Telegraf
- **Frontend (Mini App):** React 19 + TypeScript + Vite + TailwindCSS + Lucide Icons + Canvas-Confetti
- **Database & Cache:** PostgreSQL + Redis (Production) / Local Persistent Atomic JSON Store (Zero-config local run)
- **Testlar:** Vitest (34 ta to‘liq unit va E2E testlar: o‘yin, rps, chat, admin, rbac, promo race condition, stars to‘lovlari va refund)
- **Deployment:** Docker + Docker Compose

---

## 🚀 Ishga tushirish (Local Development)

### 1. Bog'liqliklarni o'rnatish
```bash
# Backend uchun
cd backend
npm install

# Frontend uchun
cd ../frontend
npm install
```

### 2. Testlarni yurgizish
Barcha o'yin mantig'i, E2E va yangi Admin/Stars/Promo testlarini tekshirish:
```bash
cd backend
npm test
```
*Natija: 34 ta test 100% muvaffaqiyatli o'tadi.*

### 3. Ilovani ishga tushirish
Ikkita alohida terminal oynasida:

**1-terminal (Backend):**
```bash
cd backend
npm run dev
```
*Backend http://localhost:3001 manzilida ishga tushadi.*

**2-terminal (Frontend):**
```bash
cd frontend
npm run dev
```
*Frontend http://localhost:5173 manzilida ishga tushadi.*

Brauzeringizda `http://localhost:5173` manzilini oching.

> **💡 Multi-player Dev Test & Admin Rejimi:**
> - Profil sahifasining eng pastida **"Dev Multi-player Switch"** mavjud (Player 1, Player 2, Player 3).
> - `Player 1` (Telegram ID: `1001`) — `.env` dagi `SUPER_ADMIN_TELEGRAM_ID` ga mos kelgani uchun avtomatik **Super Admin** hisoblanadi.
> - Navbar'da yoki Profil sahifasida **"🛡️ Admin Panel"** tugmasi orqali to‘g‘ridan-to‘g‘ri barcha 8 ta admin bo‘limiga kirishingiz mumkin!

---

## 🐳 Docker orqali ishga tushirish (Production)

Loyihada to'liq Docker Compose konfiguratsiyasi mavjud (PostgreSQL, Redis, Backend, Frontend):

```bash
# 1. Muhit parametrlarini sozlang
cp .env.example .env

# 2. Barcha konteynerlarni quring va ishga tushiring
docker-compose up -d --build
```

---

## 🤖 Telegram Botni ulash (@BotFather)

1. Telegramda [@BotFather](https://t.me/BotFather) botiga kiring va `/newbot` buyrug'i bilan yangi bot yarating.
2. Olingan `token`ni `backend/.env` faylidagi `BOT_TOKEN` parametriga yozing.
3. BotFather'ga `/setmenubutton` buyrug'ini yuboring:
   - Botni tanlang
   - Mini App havolangizni kiriting (masalan, `https://your-domain.com` yoki ngrok havolasi)
   - Tugma nomini yozing: `🎮 O'ynash`
4. Botni ishga tushiring:
   ```bash
   cd backend
   npm run start
   ```
5. Foydalanuvchilar botga kirib:
   - `/start` — Chiroyli tabrik xabari, referral havola va Mini App tugmasi.
   - `/admin` — Admin va Super Adminlar uchun WebApp Admin panel tugmasi (oddiy userlarga ko‘rinmaydi).
   - `/paysupport` — Stars to‘lovlari yordam xizmati.
   - `/terms` — Tokenlar faqat o‘yin ichida ishlatilishi haqidagi foydalanish shartlari.

---

## 📁 Loyiha Strukturasi

```
XOXO/
├── backend/
│   ├── src/
│   │   ├── config/            # Konfiguratsiya parametrlari (tokenlar, taymerlar, stavkalar, super admin ID)
│   │   ├── core/              # O'yin dvigatellari (Vanishing TicTacToe, RPS)
│   │   ├── db/                # Ma'lumotlar bazasi (Postgres & Persistent JSON store, Settings, Audit log)
│   │   ├── modules/
│   │   │   ├── auth/          # Telegram HMAC initData validatsiyasi, JWT, requireAdmin, requireSuperAdmin
│   │   │   ├── users/         # Foydalanuvchilar, profillar, kunlik bonus
│   │   │   ├── referrals/     # Takliflar statistikasi va bonuslar
│   │   │   ├── games/         # Matchmaking, o'yin xonalari va bloklanganda raqibga refund qilish
│   │   │   ├── teams/         # Jamoalar tuzish, invite kodlar, a'zolar
│   │   │   ├── leaderboard/   # Individual va jamoaviy reytinglar (bloklanganlar chetlatiladi)
│   │   │   ├── transactions/  # Token auditi va global statistika
│   │   │   ├── admin/         # Admin dashboard, user boshqaruvi, paketlar, audit log, sozlamalar
│   │   │   ├── promo/         # Promokodlarni atomic tekshirish, race-condition safe redemption, rate-limit
│   │   │   ├── gifts/         # Sovg'a tarqatish (airdrop), segmentatsiya, fon navbati, bot bildirishnomasi
│   │   │   └── payments/      # Telegram Stars (XTR) paketlari, invoice yaratish, to'lov simulyatsiyasi
│   │   ├── bot/               # Telegraf bot (/start, /admin, /paysupport, /terms, pre_checkout, successful_payment)
│   │   ├── socket/            # Socket.IO real-vaqt eventlari va bloklangan foydalanuvchini uzish
│   │   ├── tests/             # Vitest testlari (34 ta test: game, e2e, admin_features)
│   │   └── index.ts           # Server start & route registratsiyasi
├── frontend/
│   ├── src/
│   │   ├── components/        # Navbar, BottomNav, GameBoard, RPSStage, BattleChat, StoreModal, PromoModal, BlockedScreen
│   │   ├── pages/             # Dashboard, Matchmaking, Leaderboard, Profile
│   │   ├── pages/admin/       # AdminPanel (8 ta to'liq tab: Dashboard, Users, Promo, Gifts, Admins, Stars, Audit, Settings)
│   │   ├── contexts/          # Auth (RBAC, block status), Socket, ThemeLanguage
│   │   ├── locales/           # uz.json, ru.json, en.json
│   │   ├── styles/            # TailwindCSS va maxsus neon gaming stillari
│   │   ├── utils/             # Haptic feedback, procedural ovoz effektlari, avatarlar
│   │   ├── App.tsx            # Asosiy app & admin/modal navigatsiyasi
│   │   └── main.tsx
├── netlify.toml               # Netlify build, SPA redirects & Telegram iframe headers
├── supabase_schema.sql        # Supabase 1-click database schema & starter seed
├── package.json               # Root monorepo scripts
├── docker-compose.yml         # Postgres, Redis, Backend, Frontend
├── Dockerfile.backend
├── Dockerfile.frontend
└── README.md
```

---

## 🚀 Netlify & Supabase Deploy Qo'llanmasi

### 1. 🗄️ Supabase Ma'lumotlar Bazasini Sozlash

1. **Supabase loyiha ochish:**
   - [supabase.com](https://supabase.com) ga kiring va yangi loyiha (New Project) yarating.
   - Parol (Database Password) ni eslab qoling.
2. **Sxemani ishga tushirish (1 Click):**
   - Supabase boshqaruv panelida chap menyudan **SQL Editor** ga o'ting.
   - Loyihaning ildiz papkasidagi `supabase_schema.sql` fayli tarkibini nusxalab, SQL Editorga tashlang va **Run** tugmasini bosing.
   - Barcha jadvallar (`teams`, `users`, `games`, `transactions`, `promo_codes`, `gifts`, `system_state` va h.k.) avtomatik yaratiladi.
3. **Ulanish manzilini olish:**
   - **Project Settings -> Database -> Connection string** bo'limiga o'ting.
   - **URI** tabini tanlang:
     ```text
     postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
     ```
   - Parolingizni `[YOUR-PASSWORD]` o'rniga qo'ying.
   - Backend `.env` faylidagi `DATABASE_URL` ga shu manzilni yozasiz. SSL ulanish backendda avtomatik ta'minlangan!

---

### 2. 🌐 Netlify ga Frontendni Yuklash

Loyiha Netlify uchun 100% tayyorlangan (`netlify.toml` va `public/_redirects` kiritilgan, Telegram Mini App iframe xavfsizlik sarlavhalari sozlangan).

1. **GitHub orqali deploy qilish:**
   - Loyihani GitHub reponizga push qiling.
   - [netlify.com](https://netlify.com) ga kiring va **"Add new site" -> "Import an existing project"** ni tanlang.
   - Repozitoriyangizni tanlang.
   - `netlify.toml` avtomatik tarzda sozlamalarni aniqlaydi:
     - **Base directory:** `frontend`
     - **Build command:** `npm run build`
     - **Publish directory:** `dist`
2. **Environment Variables (Atrof-muhit o'zgaruvchilari):**
   - Netlify loyihangizda: **Site configuration -> Environment variables** bo'limiga o'ting va qo'shing:
     - `VITE_BACKEND_URL`: Backend serveringiz havolasi (masalan, `https://xoxo-backend.onrender.com` yoki Railway/VPS manzili).
     - `VITE_SUPABASE_URL`: Supabase loyihangiz URL manzili.
     - `VITE_SUPABASE_ANON_KEY`: Supabase Anon kaliti.
3. **Deploy tugmasini bosing:**
   - Netlify saytingizni soniyalar ichida quradi va sizga `https://your-site.netlify.app` havolasini beradi.
4. **Telegram BotFather da WebApp URL ni yangilash:**
   - `@BotFather` ga kiring: `/mybots` -> Botingizni tanlang -> **Bot Settings -> Menu Button -> Edit Menu Button URL** va Netlify bergan havolani kiriting!

---

## 💎 4-Topshiriq Yangilanishlari (AI Raqib + "Tosh" Valyutasi + Original Grafika)

### 1. 🪙 "Token" → "Tosh" (Stone) Valyutasi
- Barcha interfeyslarda (Mini App, Bot xabarlari, Admin panel, Do'kon, Promokodlar, Audit log, `/terms` va `/paysupport`) valyuta **Tosh** (o‘zbekcha), **Stone/Stones** (inglizcha), **Камень/Камни** (ruscha) deb qayta nomlandi.
- `i18next` plural qoidalari to'liq joriy qilindi (`stones_one`, `stones_few`, `stones_many`, `stones_other`).
- RPS dagi tosh (musht ishorasi) va valyuta tosh (oltin tomirli porloq tosh) bir-biridan vizual tarzda to'liq ajratildi.

### 2. 🚫 Kunlik Bonusning Butunlay Yo'qotilishi
- 24 soatlik bepul kunlik bonus barcha qatlamlardan (DB, backend API, cron, push xabarlar, frontend dashboard, i18n) to'liq olib tashlandi.
- Balans 0 bo'lganda chiquvchi "Toshlaringiz tugadi" oynasi faqat 3 ta qonuniy yo'lni ko'rsatadi:
  1. **Tosh sotib olish (Telegram Stars)**
  2. **Promokod kiritish**
  3. **Do‘st taklif qilish (Referral bonusi)**

### 3. 🤖 AI Raqib (Golemlar) Tizimi
- Server tomonida to'liq hisoblangan mustaqil sun'iy intellekt raqib:
  - **Easy (Pebble):** Stavka 1 tosh, Yutuq +1 tosh. Blunder ~45%, qidiruv chuqurligi 1.
  - **Medium (Rocky):** Stavka 3 tosh, Yutuq +3 tosh. Blunder ~25%, qidiruv chuqurligi 2.
  - **Hard (Granite):** Stavka 5 tosh, Yutuq +7 tosh. Blunder ~10%, qidiruv chuqurligi 3.
  - **Expert (Obsidian):** Stavka 10 tosh, Yutuq +20 tosh. Blunder ~3.5%, qidiruv chuqurligi 4, uy afzalligi ~8%.
- **Shaffof va Insoniy O'yin:**
  - 0.8–2.2 soniya tasodifiy o'ylash kechikishi va o'ylash indikatori.
  - Tasodifiy mustaqil muhrlangan RPS ("sealed choice").
  - Doimiy "BOT" belgisi va xarakterli Golem rasmlari.
  - Xarakter reaksiyalari va battle-chat iboralari.
- **Iqtisodiy Himoya va Kunlik Chegara:**
  - Golem o'yinlarida kunlik yutuq chegarasi: maksimal **30 tosh** (`BOT_MAX_STONES_WON_PER_DAY = 30`).
  - Golem g'alabalari reytingdagi umumiy yig'ilgan toshlarga hisoblanmaydi (`BOT_GAMES_COUNT_TO_RATING = false`).
  - Ketma-ket 2 ta taymaut = mag'lubiyat; o'yinni tashlab ketish = tikilgan stavkani yo'qotish.

### 4. 🎨 Original Grafika (Zero-Emoji Tizimi)
- Tizim emojilari interfeysdan butunlay olib tashlandi.
- `npm run check-emoji` avtomatik tekshiruv skripti barcha manba kodlari va til fayllarini tekshiradi (0 ta emoji qoidasi).
- Barcha elementlar original SVG vektor grafikalari bilan ta'minlangan:
  - `<StoneIcon />` — oltin tomirli neon tosh ikonkasi.
  - `<RPSGesture />` — neon qo'l ishoralari (musht, qaychi, kaft).
  - `<GolemAvatar />` — 4 ta Golem (Pebble, Rocky, Granite, Obsidian).
  - `<CharacterAvatar />` — 16 ta original personaj avatarlari.
  - `<PixelPiggy />` — GAME OVER ekrani uchun retro piksel cho'chqa (sakrash va chayqalish animatsiyasi, Image 2 uslubi).
  - `<ArcadeTrophy />`, `<ArcadeHandshake />`, `<RankBadge />`, `<ChatStickerIcon />`.

### 5. 🏷️ Telegram BotFather Brend Assetlari
Quyidagi fayllar `assets/brand/` papkasida tayyorlab qo'yildi:
- `bot_avatar_512.svg`: Telegram bot profil rasmi (512x512)
- `botfather_description_banner.svg`: BotFather "Edit Description Picture" (640x360 banner)
- `splash_screen.svg`: Mini App ochilish ekrani
- `app_icon.svg`: Ilova ikonkasi (256x256)

#### BotFather'da qo'lda sozlash bo'yicha yo'riqnoma:
1. `@BotFather` ga kiring va `/mybots` buyrug'ini yuboring.
2. Botingizni tanlang (`@xoxoglobalbot`).
3. **Bot Settings -> Edit Bot -> Edit Botpic** bo'limiga kirib, `assets/brand/bot_avatar_512.svg` (yoki PNG ko'rinishi) ni yuklang.
4. **Edit Description Picture** bo'limiga kirib, `assets/brand/botfather_description_banner.svg` ni yuklang.
5. **Edit Description** ga botning qisqa tavsifini yozing.

---

## 🧪 Avtomatlashtirilgan Testlar & QA

```bash
# 1. Emoji yo'qligini tekshirish (100% yashil bo'lishi shart)
npm --prefix frontend run check-emoji

# 2. Uchala til (uz, ru, en) kalitlarining to'liq mosligini tekshirish
npm --prefix frontend run check-i18n

# 3. Backend unit, integratsion va e2e testlari (42 ta test)
npm --prefix backend test

# 4. Frontend ishlab chiqarish (production) buildi
npm --prefix frontend run build
```

Barcha testlar, xavfsizlik tekshiruvlari va i18n pariteti 100% muvaffaqiyatli yakunlangan!



