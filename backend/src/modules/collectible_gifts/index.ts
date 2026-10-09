import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../auth/index.js';
import { db } from '../../db/index.js';

export async function getCollectibleCatalogHandler(req: Request, res: Response) {
  try {
    const catalog = await db.getCollectibleCatalog();
    return res.json({ catalog });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function getMyCollectibleGiftsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Ruxsat berilmagan' });
    const gifts = await db.getUserCollectibleGifts(req.user.userId);
    return res.json({ gifts });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function getUserCollectibleGiftsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) return res.status(400).json({ error: 'Yaroqsiz user ID' });
    const gifts = await db.getUserCollectibleGifts(userId);
    return res.json({ gifts });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function buyCollectibleGiftHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Ruxsat berilmagan' });
    const { giftCatalogId, catalogId, recipientUserId } = req.body;
    const targetCatalogId = giftCatalogId || catalogId;
    if (!targetCatalogId) return res.status(400).json({ error: 'Gift ID kiritilmadi' });

    const recipientId = recipientUserId ? parseInt(recipientUserId, 10) : undefined;
    const gift = await db.buyCollectibleGift(req.user.userId, targetCatalogId, recipientId);
    return res.json({ success: true, gift });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Sovg‘a sotib olishda xatolik' });
  }
}

export async function sellCollectibleGiftHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Ruxsat berilmagan' });
    const { userGiftId } = req.body;
    if (!userGiftId) return res.status(400).json({ error: 'User Gift ID kiritilmadi' });

    const result = await db.sellCollectibleGift(req.user.userId, parseInt(userGiftId, 10));
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Sovg‘ani sotishda xatolik' });
  }
}

export async function giftCollectibleGiftHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Ruxsat berilmagan' });
    const { userGiftId, recipientUserId } = req.body;
    if (!userGiftId || !recipientUserId) {
      return res.status(400).json({ error: 'User gift va qabul qiluvchi ID kiritilishi shart' });
    }

    const result = await db.giftCollectibleGift(req.user.userId, parseInt(userGiftId, 10), parseInt(recipientUserId, 10));
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Sovg‘a yuborishda xatolik' });
  }
}

export async function getTopGiftersLeaderboardHandler(req: Request, res: Response) {
  try {
    const monthStr = typeof req.query.month === 'string' ? req.query.month : undefined;
    const leaderboard = await db.getTopGiftersLeaderboard(monthStr);
    return res.json({ leaderboard });
  } catch (err: any) {
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}
