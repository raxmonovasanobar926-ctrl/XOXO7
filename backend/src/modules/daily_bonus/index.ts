import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/index.js';
import { db } from '../../db/index.js';

export async function getDailyBonusStatusHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Ruxsat berilmagan' });
    const status = await db.getDailyBonusStatus(req.user.userId);
    return res.json(status);
  } catch (err: any) {
    console.error('[DailyBonus] Error in status handler:', err);
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function claimDailyBonusHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Ruxsat berilmagan' });
    const result = await db.claimDailyBonus(req.user.userId);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Bonusni olishda xatolik' });
  }
}
