import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/index.js';
import { db } from '../../db/index.js';

export async function getTransactionHistoryHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Ruxsat berilmagan' });
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const history = await db.getUserTransactions(req.user.userId, limit);
    return res.json({ history });
  } catch (err: any) {
    console.error('[Transactions] Error in getTransactionHistoryHandler:', err);
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function getGlobalStatsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const stats = await db.getGlobalStats();
    return res.json({ stats });
  } catch (err: any) {
    console.error('[Transactions] Error in getGlobalStatsHandler:', err);
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}
