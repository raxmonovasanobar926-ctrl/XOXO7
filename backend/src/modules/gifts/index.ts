import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/index.js';
import { db } from '../../db/index.js';
import { getTelegramBotInstance } from '../../bot/index.js';
import { botTranslations, getBotLang } from '../../bot/i18n.js';

interface GiftSegmentOptions {
  activeDays?: number;
  topRank?: number;
  teamId?: number;
}

export async function executeAirdrop(
  adminId: number,
  targetType: 'single' | 'list' | 'all' | 'segment',
  amountPerUser: number,
  note: string,
  botMessage?: string | null,
  options?: {
    singleUserId?: number;
    userList?: (string | number)[];
    segmentOptions?: GiftSegmentOptions;
  }
) {
  // 1. Resolve recipients
  const allUsers = (await db.getAdminUsersList({ limit: 10000 })).users;
  let recipients: number[] = [];

  if (targetType === 'single') {
    if (options?.singleUserId) {
      recipients = [options.singleUserId];
    }
  } else if (targetType === 'list') {
    if (options?.userList && Array.isArray(options.userList)) {
      for (const item of options.userList) {
        const str = String(item).trim().toLowerCase();
        const found = allUsers.find(
          u => u.nickname.toLowerCase() === str || String(u.telegram_id) === str || String(u.id) === str
        );
        if (found && !recipients.includes(found.id)) {
          recipients.push(found.id);
        }
      }
    }
  } else if (targetType === 'all') {
    recipients = allUsers.filter(u => !u.is_blocked).map(u => u.id);
  } else if (targetType === 'segment') {
    let filtered = allUsers.filter(u => !u.is_blocked);
    const seg = options?.segmentOptions || {};

    if (seg.teamId) {
      filtered = filtered.filter(u => u.team_id === seg.teamId);
    }

    if (seg.topRank) {
      const topList = await db.getIndividualLeaderboard('all', seg.topRank);
      const topIds = topList.map(t => t.id);
      filtered = filtered.filter(u => topIds.includes(u.id));
    }

    recipients = filtered.map(u => u.id);
  }

  // Create gift record
  const gift = await db.createGift({
    admin_id: adminId,
    target_type: targetType,
    amount_per_user: amountPerUser,
    recipients_count: recipients.length,
    note,
    bot_message: botMessage || null,
  });

  // Execute airdrop asynchronously
  setTimeout(async () => {
    try {
      await db.updateGiftStatus(gift.id, 'running');
      const bot = getTelegramBotInstance();

      for (const userId of recipients) {
        try {
          await db.updateUserBalance(userId, amountPerUser, 'admin_gift');

          // Send bot notification if requested
          if (bot && botMessage) {
            const user = await db.findUserById(userId);
            if (user && user.telegram_id) {
              const lang = getBotLang(user.language);
              const text = botTranslations[lang].giftReceived(amountPerUser, botMessage);
              bot.telegram.sendMessage(user.telegram_id, text, { parse_mode: 'Markdown' }).catch(() => {});
            }
            // Sleep 40ms to stay within 25 msgs/sec rate limit
            await new Promise(r => setTimeout(r, 40));
          }
        } catch (e) {
          console.error(`[Gifts] Error delivering to user ${userId}:`, e);
        }
      }

      await db.updateGiftStatus(gift.id, 'done');
    } catch (err) {
      console.error('[Gifts] Error processing gift delivery:', err);
      await db.updateGiftStatus(gift.id, 'failed');
    }
  }, 100);

  return { gift, recipientsCount: recipients.length };
}

/**
 * Controller to preview or trigger a gift airdrop
 */
export async function createGiftHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });

    const { target_type, amount_per_user, note, bot_message, options } = req.body;

    if (!amount_per_user || amount_per_user <= 0) {
      return res.status(400).json({ error: 'Token miqdori musbat son bo‘lishi kerak' });
    }

    if (!note || !note.trim()) {
      return res.status(400).json({ error: 'Sovg‘a tarqatish uchun sabab/izoh yozilishi shart' });
    }

    // Check admin daily limit if not super_admin
    if (req.user.role !== 'super_admin') {
      const settings = await db.getSettings();
      const dailyLimit = settings.admin_daily_gift_limit || 500;
      const alreadyGifted = await db.getAdminTodayGiftedTokens(req.user.userId);

      if (alreadyGifted + amount_per_user > dailyLimit) {
        return res.status(400).json({
          error: `Sizning kunlik sovg‘a tarqatish limitingiz (${dailyLimit} token) oshib ketdi. Bugun tarqatilgan: ${alreadyGifted} token.`,
        });
      }
    }

    const result = await executeAirdrop(
      req.user.userId,
      target_type,
      amount_per_user,
      note.trim(),
      bot_message,
      options
    );

    return res.status(201).json({
      success: true,
      message: `${result.recipientsCount} ta foydalanuvchiga muvaffaqiyatli tarqatildi`,
      gift: result.gift,
    });
  } catch (err: any) {
    console.error('[Gifts] Error in createGiftHandler:', err);
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function getGiftsHistoryHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const list = await db.getAllGifts();
    return res.json({ gifts: list });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}
