import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n, { getInitialLanguage } from '../i18n/index.ts';
import { sounds } from '../utils/sounds.ts';
import { haptics } from '../utils/haptics.ts';

export type Language = 'uz' | 'ru' | 'en';
export type ThemeMode = 'light' | 'dark';

interface ThemeLanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  t: (key: string, options?: Record<string, any>) => string;
  formatNumber: (num: number) => string;
  formatTokens: (count: number) => string;
  formatDate: (date: string | Date) => string;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  hapticEnabled: boolean;
  setHapticEnabled: (enabled: boolean) => void;
}

const ThemeLanguageContext = createContext<ThemeLanguageContextType | null>(null);

export const ThemeLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    return getInitialLanguage();
  });

  const [theme, setThemeState] = useState<ThemeMode>('dark');

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('xoxo_sound');
    return saved !== null ? saved === 'true' : true;
  });

  const [hapticEnabled, setHapticEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('xoxo_haptics');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    sounds.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    haptics.setEnabled(hapticEnabled);
  }, [hapticEnabled]);

  // Enforce dark Liquid Glass mode permanently across the bot
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    localStorage.setItem('xoxo_theme', 'dark');
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem('xoxo_lang', newLang);

    // Sync to user profile in backend if logged in
    const token = localStorage.getItem('xoxo_token');
    if (token) {
      fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ language: newLang }),
      }).catch(() => {});
    }
  };

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    localStorage.setItem('xoxo_sound', String(val));
  };

  const setHapticEnabled = (val: boolean) => {
    setHapticEnabledState(val);
    localStorage.setItem('xoxo_haptics', String(val));
  };

  const t = (key: string, options?: Record<string, any>): string => {
    return i18n.t(key, options);
  };

  const formatNumber = (num: number): string => {
    const locale = lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US';
    return new Intl.NumberFormat(locale).format(num);
  };

  const formatTokens = (count: number): string => {
    const formattedNum = formatNumber(count);
    return i18n.t('dashboard.tokens', { count, defaultValue: `${formattedNum} token` });
  };

  const formatDate = (date: string | Date): string => {
    const locale = lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US';
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  return (
    <ThemeLanguageContext.Provider
      value={{
        lang,
        setLang,
        theme,
        setTheme,
        toggleTheme,
        t,
        formatNumber,
        formatTokens,
        formatDate,
        soundEnabled,
        setSoundEnabled,
        hapticEnabled,
        setHapticEnabled,
      }}
    >
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(ThemeLanguageContext);
  if (!context) throw new Error('useTranslation must be used within ThemeLanguageProvider');
  return context;
};
