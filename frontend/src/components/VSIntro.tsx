import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTranslation } from '../contexts/ThemeLanguageContext.tsx';
import { CharacterAvatar, GolemAvatar, StoneIcon } from './graphics/index.ts';
import { sounds } from '../utils/sounds.ts';
import { haptics } from '../utils/haptics.ts';

interface VSIntroProps {
  onComplete: () => void;
}

/**
 * VSIntro
 * Apple-style Liquid Glass VS & FIGHT sequence:
 * 1. Panjara + suzuvchi shisha orblar foni.
 * 2. Ko'k tusli (Player 1) va qizil/pushti tusli (Player 2 / Golem) shisha panellar.
 * 3. Katta, qalin, zamonaviy shaffof-shisha VS va FIGHT! tipografiyasi (pixel art yo'q).
 * 4. Shisha sirtida markazdan tarqaluvchi yumshoq shaffof shok to'lqini.
 * 5. Audio va haptics to'liq saqlangan.
 */
export const VSIntro: React.FC<VSIntroProps> = ({ onComplete }) => {
  const { currentRoom } = useSocket();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'panels' | 'vs' | 'fight' | 'done'>('panels');
  const [shaking, setShaking] = useState(false);

  const isPlayer1 = currentRoom?.player1.userId === user?.id;
  const isOpponentBot = currentRoom?.isAiGame || currentRoom?.player2?.isBot;
  const aiLevel = currentRoom?.aiLevel || 'easy';

  const myNickname = isPlayer1
    ? currentRoom?.player1.nickname
    : currentRoom?.player2?.nickname || t('game.you');

  const oppNickname = isOpponentBot
    ? `${t(`ai_opponent.${aiLevel}_name`)} Golem`
    : isPlayer1
      ? currentRoom?.player2?.nickname || t('game.opponent')
      : currentRoom?.player1.nickname;

  const myAvatar = isPlayer1
    ? currentRoom?.player1.avatarUrl
    : currentRoom?.player2?.avatarUrl || 'fox';

  const oppAvatar = isPlayer1
    ? currentRoom?.player2?.avatarUrl || 'ninja'
    : currentRoom?.player1.avatarUrl;

  const handleSkip = useCallback(() => {
    setPhase('done');
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // Sequence timing: 0ms panels slide in, 600ms VS slam, 1800ms FIGHT!, 2800ms complete
    const t1 = setTimeout(() => {
      setPhase('vs');
      setShaking(true);
      haptics.impact('heavy');
      setTimeout(() => setShaking(false), 450);
    }, 600);

    const t2 = setTimeout(() => {
      setPhase('fight');
      sounds.playFight();
      haptics.impact('heavy');
    }, 1800);

    const t3 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/90 dark:bg-black/95 backdrop-blur-xl overflow-hidden select-none ${
        shaking ? 'animate-screen-shake' : ''
      }`}
    >
      {/* Precision Grid Layer */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Floating Ambient Glass Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-rose-500/15 blur-3xl" />
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-[110] px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-bold border border-white/20 backdrop-blur-md transition-all active:scale-95"
      >
        {t('game.skip', { defaultValue: 'O‘tkazib yuborish ▸' })}
      </button>

      {/* Central Glass Shockwave on Impact */}
      {(phase === 'vs' || phase === 'fight') && (
        <div className="absolute pointer-events-none w-48 h-48 rounded-full border-2 border-white/60 shadow-[0_0_40px_rgba(255,255,255,0.5)] animate-shockwave" />
      )}

      {/* Player Panels */}
      <div className="relative z-10 flex items-center justify-center w-full max-w-md px-5 gap-3.5">
        {/* Left Panel: Blue-tinted Liquid Glass (Player 1) */}
        <div className="flex-1 flex flex-col items-center p-4 rounded-3xl glass-surface bg-sky-500/15 border-sky-400/50 shadow-[0_12px_32px_rgba(2,132,199,0.2)] specular-rim animate-slide-left">
          <div className="relative">
            <CharacterAvatar
              avatarId={myAvatar || 'fox'}
              size={64}
              className="border-2 border-sky-400 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-sky-500 text-white font-extrabold text-[11px] flex items-center justify-center shadow">
              X
            </span>
          </div>
          <span className="mt-2.5 text-sm font-extrabold text-sky-200 truncate max-w-[110px]">
            {myNickname}
          </span>
          <div className="flex items-center space-x-1.5 mt-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
            <StoneIcon size="xs" />
            <span className="text-[11px] text-amber-300 font-mono font-bold">
              {t('game.total_stake', { count: currentRoom?.stake || 0 })}
            </span>
          </div>
        </div>

        {/* Center VS / FIGHT! in Thick Liquid Glass Typography */}
        <div className="relative flex items-center justify-center w-24 h-24 flex-shrink-0">
          {(phase === 'vs' || phase === 'fight') && phase !== 'fight' && (
            <div className="relative animate-vs-slam">
              <span
                className="font-extrabold text-5xl tracking-tight text-white"
                style={{
                  textShadow: '0 4px 20px rgba(255,255,255,0.7), 0 0 40px rgba(110,86,207,0.4)',
                }}
              >
                VS
              </span>
            </div>
          )}
          {phase === 'fight' && (
            <div className="relative animate-fight-flash text-center">
              <span
                className="font-black text-3xl tracking-wider text-amber-300 drop-shadow-[0_4px_24px_rgba(245,158,11,0.8)]"
              >
                FIGHT!
              </span>
            </div>
          )}
        </div>

        {/* Right Panel: Rose-tinted Liquid Glass (Player 2 / Golem) */}
        <div className="flex-1 flex flex-col items-center p-4 rounded-3xl glass-surface bg-rose-500/15 border-rose-400/50 shadow-[0_12px_32px_rgba(225,29,72,0.2)] specular-rim animate-slide-right">
          <div className="relative">
            {isOpponentBot ? (
              <div className="relative">
                <GolemAvatar level={aiLevel} size={64} glow={true} />
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-rose-500 text-white shadow">
                  BOT
                </span>
              </div>
            ) : (
              <>
                <CharacterAvatar
                  avatarId={oppAvatar || 'ninja'}
                  size={64}
                  className="border-2 border-rose-400 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-extrabold text-[11px] flex items-center justify-center shadow">
                  O
                </span>
              </>
            )}
          </div>
          <span className="mt-2.5 text-sm font-extrabold text-rose-200 truncate max-w-[110px]">
            {oppNickname}
          </span>
          <div className="flex items-center space-x-1.5 mt-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
            <StoneIcon size="xs" />
            <span className="text-[11px] text-amber-300 font-mono font-bold">
              {t('game.total_stake', { count: currentRoom?.stake || 0 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
