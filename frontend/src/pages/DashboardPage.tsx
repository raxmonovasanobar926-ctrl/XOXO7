import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTranslation } from '../contexts/ThemeLanguageContext.tsx';
import { useSocket } from '../contexts/SocketContext.tsx';
import { sounds } from '../utils/sounds.ts';
import { haptics } from '../utils/haptics.ts';
import { CharacterAvatar, StoneIcon } from '../components/graphics/index.ts';
import { 
  Trophy, 
  Swords, 
  TrendingUp, 
  Clock, 
  Users, 
  Flame,
  Plus,
  Ticket,
  Gift
} from 'lucide-react';

interface DashboardPageProps {
  onGoToBattle: () => void;
  onOpenStore?: () => void;
  onOpenPromo?: () => void;
  onOpenGifts?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  onGoToBattle, 
  onOpenStore, 
  onOpenPromo,
  onOpenGifts
}) => {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const { onlineCount } = useSocket();

  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [globalStats, setGlobalStats] = useState<any>({ todayMatches: 12, totalMatches: 84 });

  const totalGames = (user?.wins || 0) + (user?.losses || 0) + (user?.draws || 0);

  useEffect(() => {
    if (token) {
      // Fetch recent games
      fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.recentGames) setRecentGames(data.recentGames);
        })
        .catch(() => {});

      // Fetch global stats
      fetch('/api/stats/global')
        .then((r) => r.json())
        .then((data) => {
          if (data.stats) setGlobalStats(data.stats);
        })
        .catch(() => {});
    }
  }, [token]);

  return (
    <div className="space-y-3.5 pb-20 safe-bottom-padding animate-fadeIn">

      {/* Hero Apple Liquid Glass Profile & Balance Card */}
      <div className="relative overflow-hidden glass-surface rounded-3xl p-5 border border-white/70 dark:border-white/10 shadow-lg specular-rim">
        {/* Soft background ambient gradient */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-gradient-to-br from-purple-500/10 to-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <CharacterAvatar 
              avatarId={user?.avatar_url || 'fox'} 
              size={52} 
              className="shadow-md border-2 border-white/80 dark:border-white/20 shrink-0" 
            />
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 min-w-0">
                <h2 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                  {user?.nickname}
                </h2>
                {user?.rank && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 shrink-0">
                    #{user.rank}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                {user?.team?.name ? t('dashboard.team_prefix', { name: user.team.name }) : t('dashboard.solo_player')}
              </span>
            </div>
          </div>

          {/* Quick Play CTA */}
          <button
            onClick={() => {
              sounds.playClick();
              haptics.impact('medium');
              onGoToBattle();
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 font-extrabold text-xs text-white shadow-md hover:brightness-105 active:scale-95 transition-all shrink-0"
          >
            <Swords className="w-4 h-4" />
            <span>{t('dashboard.play_btn')}</span>
          </button>
        </div>

        {/* Big Balance Display (Apple Liquid Glass Style) */}
        <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-white/10 flex items-end justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider block">
              {t('dashboard.stone_balance')}
            </span>
            <div className="flex items-center space-x-2 mt-0.5">
              <StoneIcon size="lg" />
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                {user?.token_balance ?? 0}
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">
                {t('dashboard.insert_coin')}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              haptics.selection();
              onOpenGifts?.();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs transition-all active:scale-95 shadow-sm"
          >
            <Gift className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('dashboard.gifts_btn')}</span>
          </button>
        </div>

        {/* Quick Stone Purchase & Promo Bar */}
        <div className="mt-3.5 pt-3 border-t border-slate-200/40 dark:border-white/5 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              haptics.impact('medium');
              onOpenStore?.();
            }}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 font-extrabold text-xs text-white shadow-sm hover:brightness-105 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{t('dashboard.buy_stones')}</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              haptics.selection();
              onOpenPromo?.();
            }}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 font-bold text-xs text-purple-700 dark:text-purple-300 transition-all active:scale-95 shadow-sm"
          >
            <Ticket className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>{t('dashboard.promo_code')}</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="glass-surface p-3 rounded-2xl text-center border border-white/60 dark:border-white/10 shadow-sm">
          <div className="w-8 h-8 mx-auto rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
            <Trophy className="w-4 h-4" />
          </div>
          <span className="text-lg font-black text-slate-900 dark:text-white">{user?.wins ?? 0}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">{t('dashboard.win_tag')}</span>
        </div>

        <div className="glass-surface p-3 rounded-2xl text-center border border-white/60 dark:border-white/10 shadow-sm">
          <div className="w-8 h-8 mx-auto rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-lg font-black text-slate-900 dark:text-white">{user?.winRate ?? 0}%</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">{t('profile.win_rate')}</span>
        </div>

        <div className="glass-surface p-3 rounded-2xl text-center border border-white/60 dark:border-white/10 shadow-sm">
          <div className="w-8 h-8 mx-auto rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1">
            <Flame className="w-4 h-4" />
          </div>
          <span className="text-lg font-black text-slate-900 dark:text-white">{totalGames}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">{t('dashboard.total_games')}</span>
        </div>
      </div>

      {/* Global Server Pulse Pill */}
      <div className="glass-surface p-3 rounded-2xl border border-white/60 dark:border-white/10 shadow-sm flex items-center justify-around text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">{t('dashboard.online_players')}</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">{onlineCount}</span>
          </div>
        </div>
        <div className="w-px h-6 bg-slate-200 dark:bg-white/10"></div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">{t('dashboard.matches_today')}</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">{globalStats.todayMatches}</span>
          </div>
        </div>
        <div className="w-px h-6 bg-slate-200 dark:bg-white/10"></div>
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">{t('dashboard.total_matches')}</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">{globalStats.totalMatches}</span>
          </div>
        </div>
      </div>

      {/* Recent Games History */}
      <div className="glass-surface rounded-3xl p-4 border border-white/60 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{t('dashboard.recent_games')}</span>
          </h3>
        </div>

        {recentGames.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">
            {t('dashboard.no_recent_games')}
          </div>
        ) : (
          <div className="space-y-2">
            {recentGames.map((g, idx) => {
              const isWin = g.result === 'win';
              const isDraw = g.result === 'draw';

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <CharacterAvatar 
                      avatarId={g.opponentAvatar || 'ninja'} 
                      size={32} 
                      className="shadow-sm"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{g.opponentNickname}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{t('dashboard.staked_amount', { count: g.stake })}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-black px-2.5 py-0.5 rounded-full text-[10px] uppercase ${
                        isWin
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                          : isDraw
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isWin
                        ? !g.is_ai_game
                          ? `+${g.prize || (g.stake * 2 - (g.rake !== undefined ? g.rake : 1))} ${t('dashboard.rake_tag', { rake: g.rake !== undefined ? g.rake : 1 })}`
                          : `+${g.prize || (g.stake * 2)}`
                        : isDraw
                        ? '± 0'
                        : `- ${g.stake}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default DashboardPage;
