import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTranslation } from '../contexts/ThemeLanguageContext.tsx';
import { sounds } from '../utils/sounds.ts';
import { haptics } from '../utils/haptics.ts';
import { 
  Trophy, 
  Users, 
  Gift, 
  X, 
  Shield,
  Crown 
} from 'lucide-react';
import { RankBadge } from '../components/graphics/ResultBadges.tsx';
import { CharacterAvatar, StoneIcon } from '../components/graphics/index.ts';
import { PublicProfileModal } from '../components/PublicProfileModal.tsx';

export const LeaderboardPage: React.FC<{ onOpenGiftsStore?: () => void }> = ({ onOpenGiftsStore }) => {
  const { user, token } = useAuth();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'individual' | 'gifts' | 'teams'>('individual');
  const [period, setPeriod] = useState<'all' | 'monthly' | 'weekly'>('all');
  const [individualList, setIndividualList] = useState<any[]>([]);
  const [giftsLeaderboard, setGiftsLeaderboard] = useState<any[]>([]);
  const [teamsList, setTeamsList] = useState<any[]>([]);
  const [myRankInfo, setMyRankInfo] = useState<any>(null);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    if (activeTab === 'individual') {
      fetch(`/api/leaderboard/individual?period=${period}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.leaderboard) setIndividualList(data.leaderboard);
          if (data.myRank) setMyRankInfo(data.myRank);
        })
        .catch(() => {});
    } else if (activeTab === 'gifts') {
      fetch('/api/gifts/leaderboard')
        .then((r) => r.json())
        .then((data) => {
          if (data.leaderboard) setGiftsLeaderboard(data.leaderboard);
        })
        .catch(() => {});
    } else {
      fetch('/api/leaderboard/teams')
        .then((r) => r.json())
        .then((data) => {
          if (data.leaderboard) setTeamsList(data.leaderboard);
        })
        .catch(() => {});
    }
  }, [activeTab, period, token]);

  const handleOpenUserProfile = (userId: number) => {
    sounds.playClick();
    haptics.selection();
    setSelectedUserId(userId);
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1 || rank === 2 || rank === 3) {
      return <RankBadge rank={rank as 1 | 2 | 3} size={24} />;
    }
    return <span className="font-extrabold text-xs text-slate-500 dark:text-slate-400">#{rank}</span>;
  };

  return (
    <div className="space-y-4 pb-24 safe-bottom-padding animate-fadeIn select-none">
      {/* Top Header & Tab switcher */}
      <div className="glass-surface rounded-3xl p-3.5 border border-white/70 dark:border-white/10 shadow-md specular-rim">
        <div className="grid grid-cols-3 bg-slate-100/70 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/50 dark:border-white/5 text-xs font-extrabold">
          <button
            onClick={() => {
              sounds.playClick();
              haptics.selection();
              setActiveTab('individual');
            }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'individual' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{t('leaderboard.players_tab')}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              haptics.selection();
              setActiveTab('gifts');
            }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'gifts' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>{t('leaderboard.gifts_tab')}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              haptics.selection();
              setActiveTab('teams');
            }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'teams' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t('leaderboard.teams_tab')}</span>
          </button>
        </div>

        {/* Period filter for Individual list */}
        {activeTab === 'individual' && (
          <div className="flex justify-center space-x-2 mt-3 pt-2.5 border-t border-slate-200/40 dark:border-white/5">
            {(['all', 'monthly', 'weekly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => {
                  sounds.playClick();
                  setPeriod(p);
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  period === p
                    ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {p === 'all' ? t('leaderboard.period_all') : p === 'monthly' ? t('leaderboard.period_month') : t('leaderboard.period_week')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* My Rank Banner if in Individual Mode */}
      {activeTab === 'individual' && myRankInfo && (
        <div className="glass-surface p-4 rounded-3xl border border-purple-500/30 flex items-center justify-between shadow-sm specular-rim">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-sm border border-purple-500/30">
              #{myRankInfo.rank || '-'}
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider block">
                {t('leaderboard.your_rank')}
              </span>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                {user?.nickname} ({t('leaderboard.wins_count', { count: myRankInfo.wins || user?.wins || 0 })})
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">
              {t('leaderboard.win_rate')}
            </span>
            <span className="font-mono font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
              {user?.winRate ?? 0}%
            </span>
          </div>
        </div>
      )}

      {/* Main Leaderboard List */}
      <div className="glass-surface rounded-3xl p-4 border border-white/70 dark:border-white/10 shadow-md specular-rim space-y-2">
        {/* TAB 1: INDIVIDUAL */}
        {activeTab === 'individual' && (
          <div className="space-y-2">
            {individualList.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
                {t('leaderboard.empty_individual')}
              </div>
            ) : (
              individualList.map((item, idx) => {
                const rank = idx + 1;
                const isMe = item.id === user?.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenUserProfile(item.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      isMe
                        ? 'bg-purple-500/10 border-purple-400/50 shadow-sm'
                        : 'bg-white/40 dark:bg-white/5 border-slate-200/50 dark:border-white/5 hover:border-purple-400/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        {getRankBadge(rank)}
                      </div>
                      <CharacterAvatar avatarId={item.avatar_url || 'fox'} size={38} />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{item.nickname}</span>
                          {item.team_name && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 font-semibold truncate shrink-0">
                              {item.team_name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {item.wins}W / {item.losses}L
                          </span>
                          {(item.total_gift_value || 0) > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-700 dark:text-pink-300 text-[9px] font-black flex items-center gap-0.5">
                              🎁 {item.total_gift_value} {t('common.stone')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0 pl-2">
                      <StoneIcon size="xs" />
                      <span className="font-mono font-extrabold text-xs text-amber-700 dark:text-amber-300">
                        {item.token_balance}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: GIFTS */}
        {activeTab === 'gifts' && (
          <div className="space-y-2">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 mb-2 flex items-start gap-2">
              <Trophy className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{t('gifts.promo_banner')}</span>
            </div>

            {giftsLeaderboard.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
                {t('gifts.empty_leaderboard')}
              </div>
            ) : (
              giftsLeaderboard.map((item, idx) => {
                const rank = idx + 1;
                return (
                  <div
                    key={item.user_id}
                    onClick={() => handleOpenUserProfile(item.user_id)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 hover:border-amber-400/40 cursor-pointer shadow-sm transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        {getRankBadge(rank)}
                      </div>
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white block">{item.nickname}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                          {t('gifts.total_spent', { count: item.total_spent })}
                        </span>
                      </div>
                    </div>

                    {rank === 1 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[9px] shadow-sm flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5" /> TOP 1
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: TEAMS */}
        {activeTab === 'teams' && (
          <div className="space-y-2">
            {teamsList.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
                {t('leaderboard.empty_teams')}
              </div>
            ) : (
              teamsList.map((team, idx) => {
                const rank = idx + 1;
                return (
                  <div
                    key={team.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 flex items-center justify-center shrink-0">
                        {getRankBadge(rank)}
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/30">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white block">{team.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                          {t('leaderboard.team_stats', { members: team.members_count, wins: team.total_wins })}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black font-mono text-purple-600 dark:text-purple-400">
                        {team.total_wins}W
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Telegram Official Public Profile Modal */}
      {selectedUserId && (
        <PublicProfileModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onSendGift={() => {
            setSelectedUserId(null);
            onOpenGiftsStore?.();
          }}
        />
      )}
    </div>
  );
};
export default LeaderboardPage;
