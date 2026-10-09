import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uz from '../locales/uz.json';
import ru from '../locales/ru.json';
import en from '../locales/en.json';

export type SupportedLanguage = 'uz' | 'ru' | 'en';

export const getInitialLanguage = (): SupportedLanguage => {
  const saved = localStorage.getItem('xoxo_lang');
  if (saved === 'uz' || saved === 'ru' || saved === 'en') {
    return saved;
  }

  // Telegram WebApp user language code detection
  try {
    const tgLang = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
    if (tgLang) {
      if (tgLang.startsWith('ru')) return 'ru';
      if (tgLang.startsWith('uz')) return 'uz';
      return 'en';
    }
  } catch {
    // fallback
  }

  const navLang = navigator.language?.toLowerCase() || '';
  if (navLang.startsWith('ru')) return 'ru';
  if (navLang.startsWith('uz')) return 'uz';

  return 'uz';
};

const initialLang = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      uz: { translation: uz },
      ru: { translation: ru },
      en: { translation: en },
    },
    lng: initialLang,
    fallbackLng: 'uz',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
