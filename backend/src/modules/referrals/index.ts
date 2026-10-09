import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/index.js';
import { db } from '../../db/index.js';

export async function getReferralStatsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Ruxsat berilmagan' });
    const stats = await db.getReferralStats(req.user.userId);
    return res.json(stats);
  } catch (err: any) {
    console.error('[Referrals] Error in getReferralStatsHandler:', err);
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}
