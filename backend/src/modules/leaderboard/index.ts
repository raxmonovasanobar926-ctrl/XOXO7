import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/index.js';
import { db } from '../../db/index.js';

export async function getIndividualLeaderboardHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const period = (req.query.period as 'all' | 'monthly' | 'weekly') || 'all';
    const leaderboard = await db.getIndividualLeaderboard(period, 100);

    let myRankInfo = null;
    if (req.user) {
      const myRank = await db.getUserRank(req.user.userId);
      const me = await db.findUserById(req.user.userId);
      if (me) {
        const team = me.team_id ? await db.findTeamById(me.team_id) : null;
        const totalGames = me.wins + me.losses + me.draws;
        const winRate = totalGames > 0 ? Math.round((me.wins / totalGames) * 100) : 0;
        myRankInfo = {
          rank: myRank,
          id: me.id,
          nickname: me.nickname,
          avatar_url: me.avatar_url,
          token_balance: me.token_balance,
          wins: me.wins,
          losses: me.losses,
          draws: me.draws,
          winRate,
          team_name: team ? team.name : null,
        };
      }
    }

    return res.json({
      leaderboard,
      myRank: myRankInfo,
    });
  } catch (err: any) {
    console.error('[Leaderboard] Error in getIndividualLeaderboardHandler:', err);
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}

export async function getTeamLeaderboardHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const leaderboard = await db.getTeamLeaderboard(100);
    return res.json({ leaderboard });
  } catch (err: any) {
    console.error('[Leaderboard] Error in getTeamLeaderboardHandler:', err);
    return res.status(500).json({ error: 'Server xatoligi' });
  }
}
