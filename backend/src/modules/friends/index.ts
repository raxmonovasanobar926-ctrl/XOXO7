import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/index.js';
import { db } from '../../db/index.js';
import { presenceManager } from '../../socket/presence.js';

export async function getFriendsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Ruxsat berilmagan' });
    const data = await db.getFriendsData(req.user.userId);
    const enrichedFriends = (data.friends || []).map((f: any) => ({
      ...f,
      is_online: presenceManager.isOnline(f.id),
    }));
    return res.json({
      ...data,
      friends: enrichedFriends,
    });
  } catch (err: any) {
    console.error('[Friends] Error in getFriendsHandler:', err);
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function sendFriendRequestHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Ruxsat berilmagan' });
    const { query, friendId } = req.body;
    const targetQuery = query || friendId;
    if (!targetQuery) {
      return res.status(400).json({ error: 'Foydalanuvchi ID yoki Nickname kiriting' });
    }

    const result = await db.sendFriendRequest(req.user.userId, targetQuery);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Do‘stlik so‘rovi yuborishda xatolik' });
  }
}

export async function respondFriendRequestHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Ruxsat berilmagan' });
    const { requestId, action } = req.body;
    if (!requestId || (action !== 'accept' && action !== 'decline')) {
      return res.status(400).json({ error: 'Amal (action) yaroqsiz' });
    }

    const result = await db.respondFriendRequest(req.user.userId, parseInt(requestId, 10), action);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Javob berishda xatolik' });
  }
}

export async function addFriendHandler(req: AuthenticatedRequest, res: Response) {
  return sendFriendRequestHandler(req, res);
}

export async function giftTokensHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Ruxsat berilmagan' });
    const { recipientId, amount } = req.body;

    if (!recipientId || (amount !== 10 && amount !== 25)) {
      return res.status(400).json({ error: 'Faqat 10 yoki 25 ta token yuborish mumkin!' });
    }

    const result = await db.giftTokens(req.user.userId, parseInt(recipientId, 10), parseInt(amount, 10));
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Token yuborishda xatolik' });
  }
}
