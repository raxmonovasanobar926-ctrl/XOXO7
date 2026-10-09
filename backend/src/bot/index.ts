import { Telegraf, Markup } from 'telegraf';
import { config } from '../config/index.js';
import { db } from '../db/index.js';
import { botTranslations, getBotLang, BotLanguage } from './i18n.js';

function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function mdToHtml(md: string): string {
  if (!md) return '';
  return md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<i>$1</i>');
}

let botInstance: Telegraf | null = null;

export function getTelegramBotInstance(): Telegraf | null {
  return botInstance;
}

export function setupTelegramBot(): Telegraf | null {
  if (!config.botToken || config.botToken === 'dummy_token_dev') {
    console.log('[Bot] BOT_TOKEN not configured or dummy, skipping live Telegram bot connection.');
    return null;
  }

  const bot = new Telegraf(config.botToken);
  botInstance = bot;

  bot.catch((err: any, ctx) => {
    console.error(`[Bot] Telegraf error for ${ctx?.updateType}:`, err?.message || err);
  });

  bot.use(async (ctx, next) => {
    return next();
  });

  // Localized bot commands registration and bot descriptions
  const registerLocalizedCommands = async () => {
    try {
      for (const l of ['uz', 'ru', 'en'] as BotLanguage[]) {
        const t = botTranslations[l];
        await (bot.telegram as any).setMyDescription(t.botDescription, { language_code: l }).catch(() => {});
        await (bot.telegram as any).setMyShortDescription(t.botShortDescription, { language_code: l }).catch(() => {});
      }

      await bot.telegram.setMyCommands([
        { command: 'start', description: "O'yinni boshlash / Start game" },
        { command: 'help', description: 'Yordam va Qoidalar / Help & Rules' },
        { command: 'referral', description: "Do'stlarni taklif qilish va tosh olish" },
        { command: 'paysupport', description: "To'lovlar bo'yicha yordam" },
        { command: 'terms', description: 'Foydalanish shartlari' },
      ], { language_code: 'uz' }).catch(() => {});

      await bot.telegram.setMyCommands([
        { command: 'start', description: 'Начать игру / Start game' },
        { command: 'help', description: 'Помощь и Правила / Help & Rules' },
        { command: 'referral', description: 'Пригласить друзей / Referral link' },
        { command: 'paysupport', description: 'Поддержка по платежам' },
        { command: 'terms', description: 'Условия использования' },
      ], { language_code: 'ru' }).catch(() => {});

      await bot.telegram.setMyCommands([
        { command: 'start', description: 'Start XOXO Arcade Battle' },
        { command: 'help', description: 'Help & Rules' },
        { command: 'referral', description: 'Referral link & Invite friends' },
        { command: 'paysupport', description: 'Payment Support' },
        { command: 'terms', description: 'Terms of Service' },
      ], { language_code: 'en' }).catch(() => {});
    } catch (e) {
      console.warn('[Bot] Note: Localized bot commands registration:', e);
    }
  };

  const getPlayMarkup = (webAppUrl: string, playBtnText: string, channelBtnText: string) => {
    const isHttps = webAppUrl.startsWith('https://');
    const playButton = isHttps
      ? Markup.button.webApp(playBtnText, webAppUrl)
      : Markup.button.url(playBtnText, webAppUrl);

    return Markup.inlineKeyboard([
      [playButton],
      [Markup.button.url(channelBtnText, 'https://t.me/telegram')],
    ]);
  };

  // /start command
  bot.start(async (ctx) => {
    try {
      const telegramId = ctx.from.id;
      const firstName = ctx.from.first_name || 'Do‘st';
      const username = ctx.from.username || '';
      const payload = ctx.payload; // Contains ref_12345 or game_xyz
      const userLang = getBotLang(ctx.from.language_code);

      let referrerId: number | undefined;

      if (payload && payload.startsWith('ref_')) {
        const refTgId = parseInt(payload.replace('ref_', ''), 10);
        if (!isNaN(refTgId) && refTgId !== telegramId) {
          const referrer = await db.findUserByTelegramId(refTgId);
          if (referrer) {
            referrerId = referrer.id;
          }
        }
      }

      // Check if user already exists
      let user = await db.findUserByTelegramId(telegramId);
      if (!user) {
        let nickname = username || firstName;
        let uniqueNick = nickname;
        let counter = 1;
        while (await db.findUserByNickname(uniqueNick)) {
          uniqueNick = `${nickname}_${counter++}`;
        }
        user = await db.createUser(telegramId, uniqueNick, 'avatar_1', referrerId);
        await db.updateUser(user.id, { language: userLang });
        user.language = userLang;
      } else if (!user.language) {
        await db.updateUser(user.id, { language: userLang });
        user.language = userLang;
      }

      // Auto add friend if referred!
      if (referrerId) {
        await db.addFriend(referrerId, user.id).catch(() => {});
      }

      // Check super_admin configuration
      if (config.superAdminTelegramId && Number(telegramId) === Number(config.superAdminTelegramId) && user.role !== 'super_admin') {
        await db.updateUser(user.id, { role: 'super_admin' });
        user.role = 'super_admin';
      }

      const webAppUrl = `${config.webAppUrl}${payload ? `?startapp=${payload}` : ''}`;
      const lang = user.language || userLang;
      const t = botTranslations[lang];

      const safeName = escapeHtml(firstName);
      const welcomeRaw = t.welcome(safeName, user.token_balance, config.referralBonus);
      const htmlMsg = mdToHtml(welcomeRaw);
      const keyboard = getPlayMarkup(webAppUrl, t.playBtn, t.channelBtn);

      try {
        await ctx.replyWithHTML(htmlMsg, keyboard);
      } catch (err) {
        await ctx.reply(welcomeRaw.replace(/[*_`]/g, ''), keyboard);
      }
      console.log(`[Bot] /start handled successfully for user ${telegramId} (${firstName})`);
    } catch (err) {
      console.error('[Bot] Error in /start handler:', err);
      ctx.reply('Error occurred. Please try again.').catch(() => {});
    }
  });

  // /help command
  bot.command('help', async (ctx) => {
    try {
      const telegramId = ctx.from.id;
      const user = await db.findUserByTelegramId(telegramId);
      const lang = user?.language || getBotLang(ctx.from.language_code);
      const t = botTranslations[lang];
      const webAppUrl = config.webAppUrl;
      const keyboard = getPlayMarkup(webAppUrl, t.playBtn, t.channelBtn);

      await ctx.replyWithHTML(mdToHtml(t.help), keyboard);
    } catch (e) {
      console.error('[Bot] Help command error:', e);
    }
  });

  // /referral command
  bot.command('referral', async (ctx) => {
    try {
      const telegramId = ctx.from.id;
      const user = await db.findUserByTelegramId(telegramId);
      const lang = user?.language || getBotLang(ctx.from.language_code);
      const t = botTranslations[lang];

      if (!user) {
        return ctx.reply(t.needStart);
      }

      const botInfo = await ctx.telegram.getMe();
      const refLink = `https://t.me/${botInfo.username}?start=ref_${telegramId}`;
      const stats = await db.getReferralStats(user.id);

      const refMessage = t.referralMsg(
        refLink,
        stats.totalInvited,
        stats.activeInvited,
        stats.totalEarned,
        config.referralBonus || 5
      );

      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(t.shareText)}`;

      await ctx.replyWithHTML(mdToHtml(refMessage), Markup.inlineKeyboard([
        [Markup.button.url(t.shareBtn, shareUrl)]
      ]));
    } catch (e) {
      console.error('[Bot] Referral command error:', e);
    }
  });

  // /paysupport command
  bot.command('paysupport', async (ctx) => {
    try {
      const user = await db.findUserByTelegramId(ctx.from.id);
      const lang = user?.language || getBotLang(ctx.from.language_code);
      await ctx.replyWithHTML(mdToHtml(botTranslations[lang].paysupport));
    } catch (e) {
      console.error('[Bot] Paysupport error:', e);
    }
  });

  // /terms command
  bot.command('terms', async (ctx) => {
    try {
      const user = await db.findUserByTelegramId(ctx.from.id);
      const lang = user?.language || getBotLang(ctx.from.language_code);
      await ctx.replyWithHTML(mdToHtml(botTranslations[lang].terms));
    } catch (e) {
      console.error('[Bot] Terms error:', e);
    }
  });


  // Telegram Stars: pre_checkout_query
  bot.on('pre_checkout_query', async (ctx) => {
    try {
      const payloadStr = ctx.preCheckoutQuery.invoice_payload;
      let payload: any = {};
      try {
        payload = JSON.parse(payloadStr);
      } catch {}

      const user = await db.findUserById(payload.userId);
      const lang = user?.language || getBotLang(ctx.from.language_code);
      const t = botTranslations[lang];

      if (!user || user.is_blocked) {
        return ctx.answerPreCheckoutQuery(false, t.preCheckoutBlocked);
      }

      const pack = await db.getStarPackById(payload.packId);
      if (!pack || !pack.is_active) {
        return ctx.answerPreCheckoutQuery(false, t.preCheckoutInactivePack);
      }

      await ctx.answerPreCheckoutQuery(true);
    } catch (err: any) {
      console.error('[Bot] pre_checkout_query error:', err);
      ctx.answerPreCheckoutQuery(false, 'Payment verification error.').catch(() => {});
    }
  });

  // Telegram Stars: successful_payment
  bot.on('successful_payment', async (ctx) => {
    try {
      const sp = ctx.message.successful_payment;
      const chargeId = sp.telegram_payment_charge_id;
      const starsAmount = sp.total_amount;

      let payload: any = {};
      try {
        payload = JSON.parse(sp.invoice_payload);
      } catch {}

      const pack = await db.getStarPackById(payload.packId);
      const tokensGranted = pack ? pack.tokens : starsAmount;

      await db.recordStarPayment(
        payload.userId,
        payload.packId || 1,
        starsAmount,
        tokensGranted,
        chargeId
      );

      const user = await db.findUserById(payload.userId);
      const lang = user?.language || getBotLang(ctx.from.language_code);
      const t = botTranslations[lang];

      await ctx.replyWithHTML(mdToHtml(t.paymentSuccess(tokensGranted, starsAmount)));
    } catch (err: any) {
      console.error('[Bot] successful_payment error:', err);
    }
  });

  // Handle generic text messages to guide user to open the game
  bot.on('text', async (ctx) => {
    try {
      const text = ctx.message.text.trim();
      if (text.startsWith('/')) return; // ignore unknown commands

      const telegramId = ctx.from.id;
      const user = await db.findUserByTelegramId(telegramId);
      const lang = user?.language || getBotLang(ctx.from.language_code);
      const t = botTranslations[lang];
      const webAppUrl = config.webAppUrl;
      const keyboard = getPlayMarkup(webAppUrl, t.playBtn, t.channelBtn);

      const promptMsg = lang === 'ru' 
        ? "🎮 Нажмите кнопку ниже, чтобы войти в игру XOXO:"
        : (lang === 'en' ? "🎮 Tap the button below to play XOXO:" : "🎮 O'yinni boshlash uchun quyidagi tugmani bosing:");

      await ctx.reply(promptMsg, keyboard);
    } catch (e) {
      // ignore
    }
  });

  console.log('[Bot] Connecting to Telegram bot with polling...');
  bot.telegram.getMe()
    .then((botInfo) => {
      console.log(`[Bot] Telegram bot successfully connected as @${botInfo.username} (${botInfo.first_name}) [ID: ${botInfo.id}]`);
      registerLocalizedCommands();
    })
    .catch((err) => {
      console.error('[Bot] Error verifying Telegram bot credentials:', err.message);
    });

  const launchBotWithRetry = async (retries = 10, delay = 3000) => {
    for (let i = 0; i < retries; i++) {
      try {
        await bot.telegram.deleteWebhook({ drop_pending_updates: true }).catch(() => {});
        await bot.launch({
          dropPendingUpdates: true,
          allowedUpdates: ['message', 'callback_query', 'pre_checkout_query'],
        });
        console.log('[Bot] Long polling started successfully (zero backlog, ultra-responsive).');
        break;
      } catch (err: any) {
        console.error(`[Bot] Launch attempt ${i + 1}/${retries} failed:`, err.message);
        if (i < retries - 1) {
          console.log(`[Bot] Retrying in ${delay / 1000}s...`);
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }
  };

  launchBotWithRetry();

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  return bot;
}
