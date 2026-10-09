import React from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTranslation } from '../contexts/ThemeLanguageContext.tsx';
import { ShieldAlert, ExternalLink } from 'lucide-react';

export const BlockedScreen: React.FC = () => {
  const { user } = useAuth();
  const { t, lang } = useTranslation();

  const locale = lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US';
  const untilDateStr = user?.blocked_until
    ? new Date(user.blocked_until).toLocaleString(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : t('blocked.permanent');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-center animate-fadeIn select-none">
      <div className="w-full max-w-sm glass-modal-card rounded-3xl border border-rose-500/30 p-6 shadow-2xl relative animate-scale-up">
        <div className="specular-rim" />

        <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center text-4xl shadow-sm mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t('blocked.title')}</h2>
        <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1">
          {t('blocked.subtitle')}
        </p>

        <div className="my-5 p-4 rounded-2xl bg-slate-100/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 text-left space-y-2">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider block">
              {t('blocked.reason_label')}
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">
              {user?.blocked_reason || t('blocked.reason_default')}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200/50 dark:border-white/5">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider block">
              {t('blocked.duration_label')}
            </span>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 block mt-0.5">
              {untilDateStr}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
          {t('blocked.support_hint')}
        </p>

        <a
          href="https://t.me/telegram"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center space-x-2 w-full py-3 rounded-2xl bg-purple-600 text-white hover:brightness-105 text-xs font-extrabold shadow-sm transition-all"
        >
          <span>{t('blocked.support_btn')}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
export default BlockedScreen;
