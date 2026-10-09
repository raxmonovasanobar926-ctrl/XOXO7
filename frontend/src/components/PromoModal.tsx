import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTranslation } from '../contexts/ThemeLanguageContext.tsx';
import { Ticket, X, Sparkles } from 'lucide-react';
import { sounds } from '../utils/sounds.ts';
import { haptics } from '../utils/haptics.ts';
import confetti from 'canvas-confetti';

interface PromoModalProps {
  onClose: () => void;
}

export const PromoModal: React.FC<PromoModalProps> = ({ onClose }) => {
  const { token, refreshUser } = useAuth();
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !token || loading) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    sounds.playClick();
    haptics.selection();

    try {
      const res = await fetch('/api/promo/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(t('promo.success', { count: data.tokens, defaultValue: data.message }));
        sounds.playWin();
        haptics.notification('success');
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch (e) {}

        await refreshUser();
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        const errKey = data.errorCode ? `promo.error_${data.errorCode.toLowerCase()}` : '';
        setError((errKey ? t(errKey) : null) || data.error || t('promo.error_not_found'));
        haptics.notification('error');
      }
    } catch (err: any) {
      setError(t('promo.error_network'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 8.4 Scrim Backdrop */}
      <div
        className="fixed inset-0 glass-scrim animate-fade-in"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-sm glass-modal-card rounded-3xl p-6 shadow-2xl animate-scale-up border border-white/50 dark:border-white/15">
        <div className="specular-rim" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-200/60 dark:bg-white/10 hover:bg-slate-300/60 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center mt-2 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl shadow-sm mb-2.5">
            <Ticket className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{t('promo.title')}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('promo.subtitle')}
          </p>
        </div>

        <form onSubmit={handleRedeem} className="space-y-3">
          <div>
            <input
              type="text"
              placeholder={t('promo.placeholder', { defaultValue: 'XOXO_2026' })}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={loading || !!successMsg}
              className="w-full glass-input rounded-2xl px-4 py-3 text-center uppercase tracking-widest font-mono font-bold text-sm text-purple-700 dark:text-purple-300 placeholder-slate-400"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs text-center font-medium animate-fadeIn">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs text-center font-bold flex items-center justify-center space-x-1.5 animate-fadeIn shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!code.trim() || loading || !!successMsg}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 font-extrabold text-sm text-white shadow-md disabled:opacity-50 transition-all active:scale-95"
          >
            {loading ? '...' : t('promo.redeem')}
          </button>
        </form>
      </div>
    </div>
  );
};
export default PromoModal;
