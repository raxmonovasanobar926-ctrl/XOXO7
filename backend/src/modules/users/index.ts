import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/index.js';
import { db } from '../../db/index.js';
import { presenceManager } from '../../socket/presence.js';

export async function getMeHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Ruxsat berilmagan' });
    const user = await db.findUserById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });

    const rank = await db.getUserRank(user.id);
    const team = user.team_id ? await db.findTeamById(user.team_id) : null;
    const recentGames = await db.getRecentGames(user.id, 5);
    const gifts = await db.getUserCollectibleGifts(user.id);

    const totalGames = user.wins + user.losses + user.draws;
    const winRate = totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0;

    return res.json({
      user: {
        ...user,
        rank,
        winRate,
        team,
        gifts,
      },
      recentGames,
    });
  } catch (err: any) {
    console.error('[Users] Error in getMeHandler:', err);
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function updateProfileHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Ruxsat berilmagan' });
    const { nickname, avatar_url } = req.body;

    const updates: any = {};

    if (nickname && typeof nickname === 'string') {
      const cleanNick = nickname.trim();
      if (cleanNick.length < 3 || cleanNick.length > 20) {
        return res.status(400).json({ error: 'Nickname 3 tadan 20 tagacha belgidan iborat bo‘lishi kerak' });
      }

      // XSS and character validation: only alphanumeric, cyrillic, spaces, underscores, hyphens
      if (!/^[a-zA-Z0-9_\u0400-\u04FF -]{3,20}$/.test(cleanNick) || /[<>]/.test(cleanNick)) {
        return res.status(400).json({ error: 'Nicknameda ruxsat etilmagan belgilar mavjud' });
      }

      // Check unique nickname (case-insensitive across all users)
      const existing = await db.findUserByNickname(cleanNick);
      if (existing && existing.id !== req.user.userId) {
        return res.status(400).json({ error: 'Bu nickname allaqachon boshqa foydalanuvchi tomonidan band qilingan' });
      }
      updates.nickname = cleanNick;
    }

    if (avatar_url && typeof avatar_url === 'string') {
      const low = avatar_url.toLowerCase();
      if (
        avatar_url.includes('..') ||
        low.startsWith('javascript:') ||
        low.startsWith('data:image/svg') ||
        low.endsWith('.svg') ||
        low.includes('<') ||
        low.includes('>')
      ) {
        return res.status(400).json({ error: 'Yaroqsiz yoki xavfli avatar formati' });
      }
      updates.avatar_url = avatar_url;
    }

    const updatedUser = await db.updateUser(req.user.userId, updates);
    return res.json({ user: updatedUser });
  } catch (err: any) {
    console.error('[Users] Error in updateProfileHandler:', err);
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function checkNicknameHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const rawNick = (req.query.nickname as string) || '';
    const cleanNick = rawNick.trim();
    if (!cleanNick) {
      return res.status(400).json({ available: false, error: 'Nickname kiritilmadi' });
    }
    if (cleanNick.length < 3 || cleanNick.length > 20) {
      return res.status(400).json({ 
        available: false, 
        error: 'Nickname 3 tadan 20 tagacha belgidan iborat bo‘lishi kerak' 
      });
    }

    const existing = await db.findUserByNickname(cleanNick);
    const isCurrent = req.user && existing && existing.id === req.user.userId;
    const available = !existing || isCurrent;

    return res.json({
      nickname: cleanNick,
      available,
      isCurrent: !!isCurrent,
    });
  } catch (err: any) {
    console.error('[Users] Error in checkNicknameHandler:', err);
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function getPublicProfileHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Yaroqsiz foydalanuvchi ID' });

    const user = await db.findUserById(id);
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });

    const rank = await db.getUserRank(user.id);
    const team = user.team_id ? await db.findTeamById(user.team_id) : null;
    const totalGames = user.wins + user.losses + user.draws;
    const winRate = totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0;
    const gifts = await db.getUserCollectibleGifts(user.id);

    let friendshipStatus: 'self' | 'none' | 'pending_sent' | 'pending_received' | 'friends' = 'none';
    if (req.user) {
      const currentUserId = req.user.userId;
      if (currentUserId === user.id) {
        friendshipStatus = 'self';
      } else {
        const friendsData = await db.getFriendsData(currentUserId);
        const isFriend = friendsData.friends.some((f: any) => f.id === user.id);
        if (isFriend) {
          friendshipStatus = 'friends';
        } else {
          const sentReq = (db as any).memoryData.friend_requests?.find(
            (r: any) => r.sender_id === currentUserId && r.recipient_id === user.id && r.status === 'pending'
          );
          const recReq = (db as any).memoryData.friend_requests?.find(
            (r: any) => r.sender_id === user.id && r.recipient_id === currentUserId && r.status === 'pending'
          );
          if (sentReq) friendshipStatus = 'pending_sent';
          else if (recReq) friendshipStatus = 'pending_received';
        }
      }
    }

    return res.json({
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
        token_balance: req.user?.userId === user.id ? user.token_balance : undefined,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws,
        winRate,
        rank,
        team_name: team ? team.name : null,
        gifts,
        friendshipStatus,
        is_online: presenceManager.isOnline(user.id),
      },
    });
  } catch (err: any) {
    console.error('[Users] Error in getPublicProfileHandler:', err);
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}


