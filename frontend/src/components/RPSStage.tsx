import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTranslation } from '../contexts/ThemeLanguageContext.tsx';
import { sounds } from '../utils/sounds.ts';
import { haptics } from '../utils/haptics.ts';
import { RPSGesture } from './graphics/RPSGestures.tsx';
import { CharacterAvatar } from './graphics/AvatarIcons.tsx';
import { GolemAvatar } from './graphics/GolemCharacters.tsx';
import { Check, LogOut, Sparkles, Swords } from 'lucide-react';

const RPS_OPTIONS = [
  { 
    id: 'rock', 
    labelKey: 'rps.rock', 
    theme: {
      from: 'from-amber-500/15',
      via: 'via-amber-500/5',
      border: 'border-amber-500/30',
      activeBorder: 'border-amber-500',
      activeBg: 'bg-amber-500/20',
      activeShadow: 'shadow-[0_0_28px_rgba(245,158,11,0.4)]',
      activeRing: 'ring-2 ring-amber-400/60',
      glowColor: 'rgba(245,158,11,0.25)',
      badgeBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
    }
  },
  { 
    id: 'scissors', 
    labelKey: 'rps.scissors', 
    theme: {
      from: 'from-sky-500/15',
      via: 'via-sky-500/5',
      border: 'border-sky-500/30',
      activeBorder: 'border-sky-500',
      activeBg: 'bg-sky-500/20',
      activeShadow: 'shadow-[0_0_28px_rgba(14,165,233,0.4)]',
      activeRing: 'ring-2 ring-sky-400/60',
      glowColor: 'rgba(14,165,233,0.25)',
      badgeBg: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30'
    }
  },
  { 
    id: 'paper', 
    labelKey: 'rps.paper', 
    theme: {
      from: 'from-emerald-500/15',
      via: 'via-emerald-500/5',
      border: 'border-emerald-500/30',
      activeBorder: 'border-emerald-500',
      activeBg: 'bg-emerald-500/20',
      activeShadow: 'shadow-[0_0_28px_rgba(16,185,129,0.4)]',
      activeRing: 'ring-2 ring-emerald-400/60',
      glowColor: 'rgba(16,185,129,0.25)',
      badgeBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
    }
  },
] as const;

export const RPSStage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { currentRoom, rpsData, submitRPSChoice, leaveGame } = useSocket();
  const [selectedChoice, setSelectedChoice] = useState<'rock' | 'paper' | 'scissors' | null>(null);
  const [timeLeft, setTimeLeft] = useState(5);

  const timeoutTotal = rpsData?.timeoutSeconds || 5;

  useEffect(() => {
    setSelectedChoice(null);
    setTimeLeft(timeoutTotal);
  }, [rpsData?.round]);

  useEffect(() => {
    if (!rpsData || rpsData.revealed) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [rpsData?.round, rpsData?.revealed]);

  if (!currentRoom || !rpsData) return null;

  const isPlayer1 = currentRoom.player1.userId === user?.id;
  const opponent = isPlayer1 ? currentRoom.player2 : currentRoom.player1;
  const me = isPlayer1 ? currentRoom.player1 : currentRoom.player2;

  const myHasSealed = user ? rpsData.sealedUsers.includes(user.id) || selectedChoice !== null : false;
  const oppHasSealed = opponent ? rpsData.sealedUsers.includes(opponent.userId) : false;

  const handleSelect = (choice: 'rock' | 'paper' | 'scissors') => {
    if (selectedChoice || rpsData.revealed) return;
    setSelectedChoice(choice);
    sounds.playClick();
    haptics.selection();
    submitRPSChoice(choice);
  };

  const renderChoiceGesture = (choice: string | null) => {
    if (choice === 'rock' || choice === 'scissors' || choice === 'paper') {
      return <RPSGesture gesture={choice} size={54} />;
    }
    return <span className="text-slate-400 text-xl font-mono font-bold">?</span>;
  };

  const isOpponentBot = opponent?.isBot || currentRoom.isAiGame;

  // Circular progress math
  const progressRatio = Math.max(0, Math.min(1, timeLeft / timeoutTotal));
  const strokeDashoffset = 157 - (157 * progressRatio);

  return (
    <div className="flex flex-col items-center justify-between min-h-[80vh] px-4 py-3 max-w-md mx-auto w-full select-none">
      {/* 1. Top Header Area */}
      <div className="w-full flex items-center justify-between mb-1">
        <div className="text-left">
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 flex items-center gap-1 shadow-sm">
              <Swords className="w-3 h-3 inline text-purple-500" />
              <span>{t('rps.round_badge', { count: rpsData.round, defaultValue: `RPS • ${rpsData.round}-raund` })}</span>
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('rps.title')}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            {t('rps.subtitle')}
          </p>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            leaveGame();
          }}
          className="px-3 py-1.5 rounded-2xl glass-surface border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center space-x-1.5 transition-all active:scale-95 shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t('rps.leave', { defaultValue: 'Chiqish' })}</span>
        </button>
      </div>

      {/* 2. Versus Arena Pods (Apple Liquid Glass) */}
      <div 
        className="w-full glass-surface p-5 rounded-3xl border border-white/80 dark:border-white/10 shadow-[0_16px_40px_-8px_rgba(31,26,61,0.16)] flex items-center justify-between px-6 my-4 specular-rim relative overflow-hidden backdrop-blur-2xl"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        }}
      >
        {/* Top Rim Specular Shine */}
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent pointer-events-none" />

        {/* Player 1 Pod (Me) */}
        <div className="flex flex-col items-center w-28">
          <div className="relative p-1 rounded-full bg-gradient-to-tr from-purple-500/30 to-indigo-500/10 shadow-inner">
            <CharacterAvatar avatarId={me?.avatarUrl || 'avatar_1'} size={60} />
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-white mt-1.5 truncate max-w-[95px] text-center">
            {me?.nickname || t('game.you')}
          </span>
          <div className="mt-2 h-12 flex items-center justify-center">
            {rpsData.revealed ? (
              <div className="animate-scaleIn">
                {renderChoiceGesture(isPlayer1 ? rpsData.player1Choice : rpsData.player2Choice)}
              </div>
            ) : myHasSealed ? (
              <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/35 flex items-center space-x-1 shadow-[0_2px_8px_rgba(110,86,207,0.2)]">
                <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 stroke-[3]" />
                <span>{t('rps.ready')}</span>
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-slate-400 animate-pulse flex items-center gap-1">
                <span>{t('rps.choosing')}</span>
              </span>
            )}
          </div>
        </div>

        {/* Center Countdown Gauge / VS Battle Emblem */}
        <div className="flex flex-col items-center justify-center shrink-0 mx-2">
          {!rpsData.revealed ? (
            <div className="relative flex items-center justify-center w-16 h-16">
              {/* Circular SVG Countdown Ring */}
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28"
                  cy="28"
                  r="25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  className="text-slate-200/40 dark:text-slate-700/30"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="25"
                  fill="none"
                  stroke="url(#countdown-ring-grad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="157"
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
                <defs>
                  <linearGradient id="countdown-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Number Center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-black font-mono transition-transform duration-300 ${timeLeft <= 2 ? 'text-rose-500 scale-110 animate-ping' : 'text-amber-500 dark:text-amber-400'}`}>
                  {timeLeft}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center animate-scaleIn flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl glass-surface border border-purple-500/40 flex items-center justify-center shadow-md">
                <span className="text-xl font-black text-purple-600 dark:text-purple-300 tracking-wider">VS</span>
              </div>
              <div className="text-[11px] font-black px-2.5 py-0.5 mt-2 rounded-full shadow-sm whitespace-nowrap bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300">
                {rpsData.winner === 'draw'
                  ? t('rps.draw_alert')
                  : (isPlayer1 && rpsData.winner === 'player1') || (!isPlayer1 && rpsData.winner === 'player2')
                  ? t('rps.you_got_x')
                  : t('rps.opponent_got_x')}
              </div>
            </div>
          )}
        </div>

        {/* Player 2 Pod (Opponent / Golem) */}
        <div className="flex flex-col items-center w-28">
          <div className="relative p-1 rounded-full bg-gradient-to-tr from-rose-500/30 to-amber-500/10 shadow-inner">
            {isOpponentBot && currentRoom.aiLevel ? (
              <GolemAvatar level={currentRoom.aiLevel} size={60} />
            ) : (
              <CharacterAvatar avatarId={opponent?.avatarUrl || 'avatar_2'} size={60} />
            )}
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-white mt-1.5 truncate max-w-[95px] text-center">
            {opponent?.nickname || t('game.opponent')}
          </span>
          <div className="mt-2 h-12 flex items-center justify-center">
            {rpsData.revealed ? (
              <div className="animate-scaleIn">
                {renderChoiceGesture(isPlayer1 ? rpsData.player2Choice : rpsData.player1Choice)}
              </div>
            ) : oppHasSealed ? (
              <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/35 flex items-center space-x-1 shadow-[0_2px_8px_rgba(225,29,72,0.2)]">
                <Check className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 stroke-[3]" />
                <span>{t('rps.ready')}</span>
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-slate-400 animate-pulse flex items-center gap-1">
                <span>{t('rps.choosing')}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Interactive Apple Liquid Glass Choice Cards */}
      <div className="w-full flex flex-col items-center my-2">
        <div className="w-full flex items-center justify-center mb-3">
          <span className="px-3.5 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 shadow-sm flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>{selectedChoice ? t('rps.choice_sealed') : t('rps.choose_one')}</span>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3.5 w-full">
          {RPS_OPTIONS.map((opt) => {
            const isSelected = selectedChoice === opt.id;
            const theme = opt.theme;

            return (
              <button
                key={opt.id}
                disabled={!!selectedChoice || !!rpsData.revealed}
                onClick={() => handleSelect(opt.id)}
                className={`relative min-h-[142px] py-4 px-2.5 rounded-3xl glass-surface flex flex-col items-center justify-between border transition-all duration-300 select-none overflow-hidden group ${
                  isSelected
                    ? `${theme.activeBorder} ${theme.activeBg} ${theme.activeShadow} ${theme.activeRing} scale-105 -translate-y-1`
                    : selectedChoice
                    ? 'opacity-40 grayscale-[40%] scale-95 border-white/40 dark:border-white/5'
                    : `border-white/80 dark:border-white/10 hover:-translate-y-1 hover:scale-102 hover:shadow-lg active:scale-95 bg-gradient-to-b ${theme.from} ${theme.via} to-transparent`
                }`}
                style={{
                  backdropFilter: 'blur(20px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                }}
              >
                {/* Curved Top Specular Reflection Highlight */}
                <div className="absolute top-1.5 inset-x-3 h-[2px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/40 to-transparent rounded-full blur-[0.3px]" />

                {/* Gesture 3D Art */}
                <div className="w-16 h-16 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <RPSGesture gesture={opt.id} size={58} />
                </div>

                {/* Label and Badge */}
                <div className="flex flex-col items-center mt-2 w-full">
                  <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white uppercase">
                    {t(opt.labelKey)}
                  </span>

                  {isSelected ? (
                    <span className="mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-600 text-white shadow-sm flex items-center gap-0.5 animate-pulse">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      <span>{t('rps.sealed', { defaultValue: 'Tanlandi' })}</span>
                    </span>
                  ) : (
                    <span className={`mt-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${theme.badgeBg}`}>
                      {t(opt.labelKey)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RPSStage;
