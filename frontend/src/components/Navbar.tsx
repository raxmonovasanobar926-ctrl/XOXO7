import React from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTranslation, Language } from '../contexts/ThemeLanguageContext.tsx';
import { useSocket } from '../contexts/SocketContext.tsx';
import { Volume2, VolumeX, Globe, Plus } from 'lucide-react';
import { CharacterAvatar, StoneIcon } from './graphics/index.ts';
import { sounds } from '../utils/sounds.ts';

interface NavbarProps {
  onOpenStore?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenStore }) => {
  const { user } = useAuth();
  const { t, lang, setLang, soundEnabled, setSoundEnabled } = useTranslation();
  const { onlineCount } = useSocket();

  const cycleLang = () => {
    const list: Language[] = ['uz', 'ru', 'en'];
    const nextIdx = (list.indexOf(lang) + 1) % list.length;
    setLang(list[nextIdx]);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-surface border-b border-white/60 dark:border-white/10 px-4 py-2.5 flex items-center justify-between specular-rim">
      {/* Brand & Online Count */}
      <div className="flex items-center space-x-2.5 select-none">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 font-extrabold text-white text-base shadow-[0_4px_12px_rgba(110,86,207,0.3)] border border-white/40">
          XO
        </div>
        <div>
          <h1 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100 flex items-center space-x-1">
            <span>XOXO</span>
          </h1>
          <div className="flex items-center space-x-1.5 -mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
              {t('dashboard.online_count', { count: onlineCount })}
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls: Balance + Theme + Sound + Lang + Avatar */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Liquid Stone Balance Pill */}
        <button
          onClick={onOpenStore}
          className="flex items-center space-x-1.5 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full shadow-sm transition-all active:scale-95 group"
          title={t('out_of_stones.buy_stars')}
        >
          <StoneIcon size="xs" />
          <span className="font-extrabold text-sm text-amber-700 dark:text-amber-300 font-mono">
            {user?.token_balance ?? 0}
          </span>
          <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center text-[10px] font-black group-hover:bg-amber-500 group-hover:text-white transition-colors">
            <Plus className="w-2.5 h-2.5" />
          </span>
        </button>



        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 rounded-xl bg-white/40 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-white/10 transition-colors"
          title={t('profile.sound')}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          )}
        </button>

        {/* Language Switch */}
        <button
          onClick={cycleLang}
          className="flex items-center space-x-0.5 px-2 py-1 rounded-xl bg-white/40 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-white/10 uppercase transition-colors"
          title={t('profile.language')}
        >
          <Globe className="w-3 h-3 text-slate-400 dark:text-slate-500 mr-0.5" />
          {lang}
        </button>

        {/* Mini Avatar */}
        <CharacterAvatar avatarId={user?.avatar_url || 'fox'} size={32} />
      </div>
    </header>
  );
};
