import React from 'react';
import { LiquidGlassBackground } from '../components/glass/LiquidGlassBackground.tsx';
import { Home, AlertTriangle } from 'lucide-react';

interface NotFoundPageProps {
  onGoHome?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome }) => {
  const handleHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 selection:bg-purple-500 selection:text-white">
      <LiquidGlassBackground />

      <div className="relative z-10 glass-panel p-8 sm:p-10 rounded-3xl text-center shadow-2xl border border-white/60 dark:border-white/10 max-w-sm w-full animate-scale-up space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-rose-500/20 via-purple-500/20 to-indigo-500/20 border border-rose-500/30 flex items-center justify-center shadow-[0_8px_30px_rgba(244,63,94,0.25)]">
          <AlertTriangle className="w-10 h-10 text-rose-500 animate-bounce" />
        </div>

        <div>
          <h1 className="text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 font-mono">
            404
          </h1>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
            Sahifa topilmadi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Siz qidirayotgan sahifa mavjud emas, nomi o‘zgartirilgan yoki ushbu havolaga kirish taqiqlangan.
          </p>
        </div>

        <button
          onClick={handleHome}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-[0_8px_20px_rgba(110,86,207,0.35)] active:scale-95 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Asosiy sahifaga qaytish</span>
        </button>
      </div>
    </div>
  );
};
