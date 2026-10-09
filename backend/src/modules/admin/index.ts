import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/index.js';
import { db } from '../../db/index.js';
import { gameManager } from '../games/gameManager.js';
import { getTelegramBotInstance } from '../../bot/index.js';
import { botTranslations, getBotLang } from '../../bot/i18n.js';

// ================= 3.1 DASHBOARD =================
export async function getAdminDashboardHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const stats = await db.getAdminDashboardStats();
    return res.json({ stats });
  } catch (err: any) {
    console.error('[Admin] Error in getAdminDashboardHandler:', err);
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

// ================= 3.2 USERS MANAGEMENT =================
export async function getAdminUsersHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const search = req.query.search as string;
    const filter = req.query.filter as any;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;

    const result = await db.getAdminUsersList({ search, filter, page, limit });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function blockUserHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });

    const targetUserId = parseInt(req.params.id, 10);
    const { reason, blocked_until } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Bloklash sababi ko‘rsatilishi shart!' });
    }

    const result = await db.blockUser(targetUserId, req.user.userId, reason.trim(), blocked_until || null);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Terminate any active game for this user
    gameManager.terminateActiveGameForUser(targetUserId, 'Foydalanuvchi qoidabuzarlik sababli bloklandi');

    return res.json({ success: true, message: 'Foydalanuvchi bloklandi' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function unblockUserHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });

    const targetUserId = parseInt(req.params.id, 10);
    const result = await db.unblockUser(targetUserId, req.user.userId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({ success: true, message: 'Foydalanuvchi blokdan chiqarildi' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function adjustBalanceHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });

    const targetUserId = parseInt(req.params.id, 10);
    const { delta, reason } = req.body;

    if (delta === undefined || typeof delta !== 'number') {
      return res.status(400).json({ error: 'O‘zgarish miqdori (delta) son bo‘lishi kerak' });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Sabab ko‘rsatilishi shart!' });
    }

    const result = await db.adjustUserBalance(targetUserId, req.user.userId, delta, reason.trim());
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({ success: true, newBalance: result.newBalance });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function changeUserIdHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });

    const targetUserId = parseInt(req.params.id, 10);
    const { newId } = req.body;

    if (!newId || isNaN(newId) || typeof newId !== 'number') {
      return res.status(400).json({ error: 'Yangi ID kiritilishi shart (masalan: 777)' });
    }

    const result = await db.changeUserId(targetUserId, newId, req.user.userId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({ success: true, message: `Foydalanuvchi IDsi ${newId} ga o'zgartirildi!` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Server xatoligi' });
  }
}

export async function grantAdminCollectibleGiftHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });

    const targetUserId = parseInt(req.params.id, 10);
    const { giftCatalogId } = req.body;
    if (!giftCatalogId) return res.status(400).json({ error: 'Sovg\'a tanlanishi shart!' });

    const gift = await db.grantCollectibleGiftByAdmin(targetUserId, giftCatalogId, req.user.userId);
    return res.json({ success: true, gift });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Server xatoligi' });
  }
}

export async function resetUserStatsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });

    const targetUserId = parseInt(req.params.id, 10);
    await db.resetUserStats(targetUserId, req.user.userId);
    return res.json({ success: true, message: 'Statistika nollashtirildi' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

// ================= 3.5 ADMINS MANAGEMENT (super_admin) =================
export async function getAdminsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const list = await db.getAdminsList();
    return res.json({ admins: list });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function addAdminHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });

    const { query } = req.body; // telegramId or nickname
    if (!query) return res.status(400).json({ error: 'Foydalanuvchi Telegram ID yoki nickname kiritilishi shart' });

    const clean = String(query).trim().toLowerCase();
    const allUsers = (await db.getAdminUsersList({ limit: 10000 })).users;
    const target = allUsers.find(
      u => u.nickname.toLowerCase() === clean || String(u.telegram_id) === clean || String(u.id) === clean
    );

    if (!target) {
      return res.status(404).json({ error: 'Bunday foydalanuvchi topilmadi' });
    }

    const result = await db.setAdminRole(target.id, req.user.userId, 'admin');
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Send notification message to appointed admin via bot
    const bot = getTelegramBotInstance();
    if (bot && target.telegram_id) {
      const lang = getBotLang(target.language);
      const text = botTranslations[lang].adminAppointed;
      bot.telegram.sendMessage(target.telegram_id, text, { parse_mode: 'Markdown' }).catch(() => {});
    }

    return res.json({ success: true, message: `${target.nickname} muvaffaqiyatli admin etib tayinlandi` });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function removeAdminHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });

    const targetUserId = parseInt(req.params.id, 10);
    const result = await db.setAdminRole(targetUserId, req.user.userId, 'user');
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({ success: true, message: 'Adminlik huquqi olib tashlandi' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

// ================= 3.3 PROMO CODES ADMIN =================
export async function getAdminPromoCodesHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const list = await db.getAllPromoCodes();
    return res.json({ promoCodes: list });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function createAdminPromoCodeHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });

    const result = await db.createPromoCode({
      ...req.body,
      created_by: req.user.userId,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(201).json({ promo: result.promo });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function updateAdminPromoCodeHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });

    const promoId = parseInt(req.params.id, 10);
    const result = await db.updatePromoCode(promoId, req.user.userId, req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({ promo: result.promo });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function deleteAdminPromoCodeHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });

    const promoId = parseInt(req.params.id, 10);
    const result = await db.deletePromoCode(promoId, req.user.userId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

// ================= 3.6 STARS PAYMENTS & REFUND =================
export async function getAdminPaymentsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const list = await db.getAllStarPayments();
    const stats = await db.getAdminDashboardStats();
    return res.json({
      payments: list,
      totalStarsRevenue: stats.totalStarsRevenue,
      todayStarsRevenue: stats.todayStarsRevenue,
      weekStarsRevenue: stats.weekStarsRevenue,
      monthStarsRevenue: stats.monthStarsRevenue,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function refundPaymentHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });

    const { paymentId } = req.body;
    const payment = (await db.getAllStarPayments()).find(p => p.id === Number(paymentId));
    if (!payment) return res.status(404).json({ error: 'To‘lov topilmadi' });

    // Call Telegram API refundStarPayment if live bot available
    const bot = getTelegramBotInstance();
    if (bot && !payment.telegram_payment_charge_id.startsWith('mock_charge_')) {
      try {
        await (bot.telegram as any).callApi('refundStarPayment', {
          user_id: payment.userTelegramId,
          telegram_payment_charge_id: payment.telegram_payment_charge_id,
        });
      } catch (refundErr: any) {
        console.warn('[Admin] Telegram refundStarPayment API warning:', refundErr.message);
      }
    }

    const result = await db.refundStarPayment(Number(paymentId), req.user.userId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({ success: true, message: 'To‘lov muvaffaqiyatli qaytarildi va tokenlar olib tashlandi' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function getAdminPacksHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const packs = await db.getStarPacks(false);
    return res.json({ packs });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function updateAdminPackHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });

    const packId = parseInt(req.params.id, 10);
    const result = await db.updateStarPack(packId, req.user.userId, req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

// ================= 3.7 AUDIT LOG =================
export async function getAdminAuditLogHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const result = await db.getAuditLogs(limit, page);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

// ================= 3.8 SETTINGS =================
export async function getAdminSettingsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const settings = await db.getSettings();
    return res.json({ settings });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function updateAdminSettingsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });

    if (req.body.rake_amount !== undefined) {
      const rake = Number(req.body.rake_amount);
      const minStake = 2; // lowest stake level is 2
      if (isNaN(rake) || rake < 0 || rake >= minStake) {
        return res.status(400).json({ 
          error: `Komissiya miqdori 0 dan katta yoki teng va eng kichik stavkadan (${minStake} tosh) kichik bo'lishi shart!` 
        });
      }
    }

    const updated = await db.updateSettings(req.user.userId, req.body);
    return res.json({ settings: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function getAdminRakeStatsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const stats = await db.getRakeStats();
    return res.json({ stats });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

// ================= 4.7 AI OPPONENT ADMIN =================
export async function getAdminAIStatsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const aiStats = await db.getAdminAIStats();
    const settings = await db.getAILevelSettings();
    return res.json({ aiStats, settings });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function updateAdminAISettingHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });

    const level = req.params.level as 'easy' | 'medium' | 'hard' | 'expert';
    const result = await db.updateAILevelSetting(req.user.userId, level, req.body);
    if (!result) {
      return res.status(404).json({ error: 'AI darajasi topilmadi' });
    }

    return res.json({ success: true, setting: result });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function getSuspiciousActivityHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const suspicious = await db.getSuspiciousActivities();
    return res.json({ suspicious });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}
