import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/index.js';
import { db } from '../../db/index.js';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createTeamHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Ruxsat berilmagan' });
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 32) {
      return res.status(400).json({ error: 'Jamoa nomi 3 tadan 32 tagacha belgidan iborat bo‘lishi kerak' });
    }

    const cleanName = name.trim();
    if (!/^[a-zA-Z0-9_\u0400-\u04FF -]{3,32}$/.test(cleanName) || /[<>]/.test(cleanName)) {
      return res.status(400).json({ error: 'Jamoa nomida ruxsat etilmagan belgilar mavjud' });
    }

    const existing = await db.findTeamByName(cleanName);
    if (existing) {
      return res.status(400).json({ error: 'Bunday nomli jamoa allaqachon mavjud' });
    }

    let code = generateInviteCode();
    while (await db.findTeamByInviteCode(code)) {
      code = generateInviteCode();
    }

    const team = await db.createTeam(cleanName, code, req.user.userId);
    const members = await db.getTeamMembers(team.id);

    return res.status(201).json({
      team,
      members,
    });
  } catch (err: any) {
    console.error('[Teams] Error in createTeamHandler:', err);
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function joinTeamHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Ruxsat berilmagan' });
    const { invite_code } = req.body;

    if (!invite_code || typeof invite_code !== 'string') {
      return res.status(400).json({ error: 'Taklif kodi kiritilishi shart' });
    }

    const team = await db.findTeamByInviteCode(invite_code);
    if (!team) {
      return res.status(404).json({ error: 'Bunday kodli jamoa topilmadi' });
    }

    await db.joinTeam(req.user.userId, team.id);
    const members = await db.getTeamMembers(team.id);

    return res.json({
      team,
      members,
    });
  } catch (err: any) {
    console.error('[Teams] Error in joinTeamHandler:', err);
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function leaveTeamHandler(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Ruxsat berilmagan' });
    await db.leaveTeam(req.user.userId);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('[Teams] Error in leaveTeamHandler:', err);
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function getTeamDetailsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Yaroqsiz jamoa ID' });

    const team = await db.findTeamById(id);
    if (!team) return res.status(404).json({ error: 'Jamoa topilmadi' });

    const members = await db.getTeamMembers(team.id);
    const totalWins = members.reduce((sum, m) => sum + m.wins, 0);
    const totalTokens = members.reduce((sum, m) => sum + m.token_balance, 0);

    return res.json({
      team: {
        ...team,
        member_count: members.length,
        total_wins: totalWins,
        total_tokens: totalTokens,
      },
      members: members.map(m => ({
        id: m.id,
        nickname: m.nickname,
        avatar_url: m.avatar_url,
        token_balance: m.token_balance,
        wins: m.wins,
        losses: m.losses,
      })),
    });
  } catch (err: any) {
    console.error('[Teams] Error in getTeamDetailsHandler:', err);
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}
