import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/index.js';
import { db } from '../../db/index.js';

// Simple in-memory rate limiter for failed promo attempts
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const failedAttempts = new Map<number, RateLimitEntry>();

function checkRateLimit(userId: number): boolean {
  const now = Date.now();
  const entry = failedAttempts.get(userId);
  if (!entry) return true;

  if (now > entry.resetAt) {
    failedAttempts.delete(userId);
    return true;
  }

  return entry.count < 5;
}

function recordFailedAttempt(userId: number) {
  const now = Date.now();
  const entry = failedAttempts.get(userId);
  if (!entry || now > entry.resetAt) {
    failedAttempts.set(userId, { count: 1, resetAt: now + 60 * 1000 }); // 1 minute
  } else {
    entry.count++;
  }
}

/**
 * Controller to redeem a promo code by an authenticated player
 */
export async function redeemPromoHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });
    }

    const userId = req.user.userId;

    if (!checkRateLimit(userId)) {
      return res.status(429).json({
        error: 'Juda ko‘p noto‘g‘ri urinishlar. Iltimos, 1 daqiqadan so‘ng qayta urinib ko‘ring.',
        errorCode: 'rate_limited'
      });
    }

    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Promokod kiritilishi shart', errorCode: 'not_found' });
    }

    const result = await db.redeemPromoCode(userId, code);

    if (!result.success) {
      recordFailedAttempt(userId);
      return res.status(400).json({ error: result.error, errorCode: result.errorCode });
    }

    return res.json({
      success: true,
      message: `Tabriklaymiz! +${result.tokens} token hisobingizga muvaffaqiyatli qo‘shildi!`,
      tokens: result.tokens,
      newBalance: result.newBalance,
    });
  } catch (err: any) {
    console.error('[Promo] Error in redeemPromoHandler:', err);
    return res.status(500).json({ error: 'Server xatoligi yuz berdi' });
  }
}
