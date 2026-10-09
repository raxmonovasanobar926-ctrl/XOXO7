import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTranslation } from '../contexts/ThemeLanguageContext.tsx';
import { sounds } from '../utils/sounds.ts';
import { haptics } from '../utils/haptics.ts';
import { StoneIcon } from './graphics/StoneIcon.tsx';
import { Gift, Clock, Sparkles } from 'lucide-react';

export const DailyBonusCard: React.FC<{ onBonusClaimed?: () => void }> = ({ onBonusClaimed }) => {
  const { token, refreshUser } = useAuth();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [nextSeconds, setNextSeconds] = useState(0);
  const [bonusAmount, setBonusAmount] = useState(5);
  const [claiming, setClaiming] = useState(false);

  const fetchStatus = () => {
    if (!token) return;
    fetch('/api/daily-bonus/status', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setReady(!!data.ready);
        setNextSeconds(data.nextClaimInSeconds || 0);
        if (data.bonusAmount) setBonusAmount(data.bonusAmount);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
  }, [token]);

  // Live 24-hour Countdown Timer
  useEffect(() => {
    if (ready || nextSeconds <= 0) return;
    const interval = setInterval(() => {
      setNextSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setReady(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [ready, nextSeconds]);

  const formatCountdown = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleClaim = async () => {
    if (!token || claiming || !ready) return;
    setClaiming(true);
    sounds.playClick();
    haptics.impact('heavy');

    try {
      const res = await fetch('/api/daily-bonus/claim', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReady(false);
        setNextSeconds(24 * 3600);
        haptics.notification('success');
        refreshUser();
        onBonusClaimed?.();
      }
    } catch (e) {
      haptics.notification('error');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return null;

  return (
    <div className="glass-surface rounded-3xl p-4 border border-white/70 dark:border-white/10 relative overflow-hidden shadow-md specular-rim select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-sm shrink-0 border border-white/40">
            <Gift className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                {t('daily_bonus.title', { defaultValue: 'Kunlik Bonus' })}
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center space-x-1 shrink-0">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{t('daily_bonus.stone_reward', { count: bonusAmount })}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {ready
                ? t('daily_bonus.ready_subtitle')
                : t('daily_bonus.cooldown_subtitle')}
            </p>
          </div>
        </div>

        {ready ? (
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-xs shadow-sm hover:brightness-105 active:scale-95 transition-all flex items-center space-x-1.5 shrink-0"
          >
            <StoneIcon size="xs" />
            <span>{claiming ? t('daily_bonus.claiming') : t('daily_bonus.claim')}</span>
          </button>
        ) : (
          <div className="px-3 py-1.5 rounded-2xl bg-slate-100/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 text-center flex items-center space-x-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="font-mono font-extrabold text-xs text-slate-700 dark:text-slate-300 tracking-wider">
              {formatCountdown(nextSeconds)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
