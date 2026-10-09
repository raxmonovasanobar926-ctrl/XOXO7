import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTranslation } from '../contexts/ThemeLanguageContext.tsx';
import { X, Star, Ticket, Sparkles, AlertCircle } from 'lucide-react';
import { sounds } from '../utils/sounds.ts';
import { haptics } from '../utils/haptics.ts';
import { StoneIcon } from './graphics/StoneIcon.tsx';
import confetti from 'canvas-confetti';

interface StoreModalProps {
  onClose: () => void;
  onOpenPromo: () => void;
  isOutOfTokens?: boolean;
}

export const StoreModal: React.FC<StoreModalProps> = ({ onClose, onOpenPromo, isOutOfTokens }) => {
  const { user, token, refreshUser } = useAuth();
  const { t } = useTranslation();

  const [packs, setPacks] = useState<any[]>([]);
  const [loadingPackId, setLoadingPackId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/payments/packs')
      .then((r) => r.json())
      .then((data) => {
        if (data.packs) setPacks(data.packs);
      })
      .catch(() => {});
  }, []);

  const handleBuyPack = async (pack: any) => {
    if (!token || loadingPackId) return;
    setLoadingPackId(pack.id);
    setErrorMsg(null);
    setSuccessMsg(null);
    sounds.playClick();
    haptics.selection();

    try {
      const res = await fetch('/api/payments/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ packId: pack.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invoice yaratilmadi');
      }

      const tg = (window as any).Telegram?.WebApp;
      if (tg?.openInvoice && !data.isMock) {
        // Native Telegram Stars checkout
        tg.openInvoice(data.invoiceLink, (status: string) => {
          if (status === 'paid') {
            sounds.playWin();
            haptics.notification('success');
            refreshUser();
            setSuccessMsg(t('store.credited_success', { count: pack.tokens }));
            try {
              confetti({ particleCount: 80, spread: 70 });
            } catch (e) {}
          } else if (status === 'failed') {
            setErrorMsg(t('store.payment_failed'));
          }
        });
      } else {
        // Dev mode simulation fallback
        const simRes = await fetch('/api/payments/simulate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ packId: pack.id }),
        });

        const simData = await simRes.json();
        if (simRes.ok && simData.success) {
          sounds.playWin();
          haptics.notification('success');
          await refreshUser();
          setSuccessMsg(t('store.credited_success', { count: pack.tokens }));
          try {
            confetti({ particleCount: 80, spread: 70 });
          } catch (e) {}
        } else {
          setErrorMsg(simData.error || t('store.error_general'));
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || t('store.error_general'));
    } finally {
      setLoadingPackId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 8.4 Scrim Backdrop */}
      <div
        className="fixed inset-0 glass-scrim animate-fade-in"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-sm glass-modal-card rounded-3xl p-5 shadow-2xl max-h-[90vh] flex flex-col animate-scale-up border border-white/50 dark:border-white/15">
        <div className="specular-rim" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-200/60 dark:bg-white/10 hover:bg-slate-300/60 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mt-1 mb-3">
          {isOutOfTokens ? (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-bold mb-1.5 shadow-sm">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{t('store.out_of_tokens_badge')}</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-extrabold uppercase tracking-wider mb-1.5 shadow-sm">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{t('store.stars_store_badge')}</span>
            </div>
          )}
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{t('store.title')}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('store.current_balance', { count: user?.token_balance || 0 })}
          </p>
        </div>

        {/* Quick Promo Option */}
        <div className="flex space-x-2 mb-3">
          <button
            onClick={() => {
              onClose();
              onOpenPromo();
            }}
            className="flex-1 py-2 px-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/30 text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center justify-center space-x-1.5 transition-all active:scale-95 shadow-sm"
          >
            <Ticket className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{t('store.promo_btn')}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs text-center font-medium mb-3">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs text-center font-bold flex items-center justify-center space-x-1.5 mb-3 shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Token Packs Grid */}
        <div className="grid grid-cols-2 gap-2.5 overflow-y-auto pr-1 py-1">
          {packs.map((pack) => {
            const isLoading = loadingPackId === pack.id;
            return (
              <div
                key={pack.id}
                className={`relative flex flex-col justify-between p-3.5 rounded-2xl border transition-all duration-200 ${
                  pack.badge === 'best_value'
                    ? 'border-purple-400/60 bg-purple-500/10 shadow-sm'
                    : pack.badge === 'popular'
                    ? 'border-amber-400/60 bg-amber-500/10 shadow-sm'
                    : 'border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/5'
                }`}
              >
                {pack.badge && (
                  <span className={`absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider text-white shadow-sm ${
                    pack.badge === 'best_value'
                      ? 'bg-purple-600'
                      : 'bg-amber-500'
                  }`}>
                    {pack.badge === 'best_value' ? t('store.best_value') : t('store.popular')}
                  </span>
                )}

                <div className="text-center pt-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{t('store.pack_' + pack.title.toLowerCase(), { defaultValue: pack.title })}</span>
                  <div className="flex items-center justify-center space-x-1.5 my-1.5">
                    <StoneIcon size="md" />
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{pack.tokens}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{t('store.tokens_count')}</span>
                </div>

                <button
                  onClick={() => handleBuyPack(pack)}
                  disabled={isLoading}
                  className={`mt-3 w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1 transition-all active:scale-95 shadow-sm ${
                    pack.badge === 'best_value'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:brightness-105'
                      : pack.badge === 'popular'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:brightness-105'
                      : 'bg-slate-200/70 dark:bg-white/10 hover:bg-slate-300/70 dark:hover:bg-white/15 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{isLoading ? '...' : t('store.stars_label', { stars: pack.stars_price, defaultValue: `${pack.stars_price} Stars` })}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-3 leading-tight">
          {t('store.disclaimer')}
        </p>
      </div>
    </div>
  );
};
export default StoreModal;
