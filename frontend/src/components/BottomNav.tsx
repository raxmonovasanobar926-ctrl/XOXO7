import React from 'react';
import { useTranslation } from '../contexts/ThemeLanguageContext.tsx';
import { haptics } from '../utils/haptics.ts';
import { sounds } from '../utils/sounds.ts';
import { Home, Swords, Trophy, User, Users } from 'lucide-react';

export type NavTab = 'dashboard' | 'battle' | 'friends' | 'leaderboard' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const { t } = useTranslation();

  const handleTabClick = (tab: NavTab) => {
    if (tab !== activeTab) {
      haptics.selection();
      sounds.playClick();
      onSelectTab(tab);
    }
  };

  const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: t('nav.dashboard', { defaultValue: 'Bosh sahifa' }), icon: <Home className="w-5 h-5" /> },
    { id: 'battle', label: t('nav.battle', { defaultValue: 'Jang' }), icon: <Swords className="w-5 h-5" /> },
    { id: 'friends', label: t('nav.friends', { defaultValue: "Do'stlar" }), icon: <Users className="w-5 h-5" /> },
    { id: 'leaderboard', label: t('nav.leaderboard', { defaultValue: 'Reyting' }), icon: <Trophy className="w-5 h-5" /> },
    { id: 'profile', label: t('nav.profile', { defaultValue: 'Profil' }), icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none select-none">
      {/* Floating Apple Liquid Glass Dock */}
      <div className="max-w-md mx-auto px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1">
        <nav 
          className="pointer-events-auto w-full glass-surface rounded-3xl border border-white/80 dark:border-white/10 px-2 py-1.5 shadow-[0_12px_36px_-4px_rgba(31,26,61,0.18),0_1px_1.5px_0_rgba(255,255,255,0.9)_inset] dark:shadow-[0_12px_36px_-4px_rgba(0,0,0,0.6),0_1px_1px_0_rgba(255,255,255,0.15)_inset] specular-rim transition-all backdrop-blur-2xl"
          style={{
            background: 'var(--glass-bg)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            backdropFilter: 'blur(24px) saturate(180%)',
          }}
        >
          {/* Subtle top specular glow line */}
          <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent pointer-events-none" />

          <div className="grid grid-cols-5 gap-1 items-center justify-items-center">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  aria-label={tab.label}
                  className={`w-full flex flex-col items-center justify-center py-1 px-0.5 rounded-2xl transition-all duration-200 min-h-[48px] relative ${
                    isActive
                      ? 'text-purple-600 dark:text-purple-300 font-extrabold scale-105'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 active:scale-95'
                  }`}
                >
                  {/* Liquid Glass Capsule for Active Item */}
                  <div
                    className={`relative px-3.5 py-1 rounded-full transition-all duration-300 flex items-center justify-center ${
                      isActive
                        ? 'bg-purple-500/15 dark:bg-purple-500/30 border border-purple-500/35 shadow-[0_2px_14px_rgba(110,86,207,0.3)]'
                        : ''
                    }`}
                  >
                    {/* Active highlight reflection */}
                    {isActive && (
                      <span className="absolute top-0.5 left-2 w-3.5 h-1 bg-white/70 dark:bg-white/40 rounded-full blur-[0.3px]" />
                    )}

                    {tab.icon}

                    {/* Active tiny glowing pill indicator */}
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full shadow-[0_0_8px_rgba(110,86,207,0.8)]" />
                    )}
                  </div>

                  <span className="text-[10px] tracking-tight mt-0.5 font-bold truncate max-w-full leading-tight">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};
