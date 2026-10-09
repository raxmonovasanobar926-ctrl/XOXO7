import React from 'react';

interface RPSProps {
  size?: number | string;
  className?: string;
  glow?: boolean;
}

/**
 * RockEmoji: Closed Fist Hand Gesture (Musht / ✊)
 */
export const RockEmoji: React.FC<RPSProps> = ({ size = 56, className = '', glow = true }) => {
  const numericSize = typeof size === 'number' ? size : parseInt(size as string, 10) || 56;

  return (
    <div 
      style={{ 
        width: numericSize, 
        height: numericSize, 
        filter: glow ? 'drop-shadow(0 8px 20px rgba(245, 158, 11, 0.45))' : 'none' 
      }}
      className={`flex items-center justify-center select-none transition-transform hover:scale-110 active:scale-95 ${className}`}
    >
      <div className="relative flex items-center justify-center w-full h-full rounded-2xl bg-gradient-to-tr from-amber-500/20 via-amber-400/10 to-amber-300/20 border border-amber-400/40 shadow-inner">
        <span 
          style={{ fontSize: `${numericSize * 0.62}px` }} 
          role="img" 
          aria-label="Tosh Musht"
          className="filter drop-shadow-[0_4px_10px_rgba(245,158,11,0.5)] transform -rotate-12 transition-transform hover:rotate-0"
        >
          ✊
        </span>
      </div>
    </div>
  );
};

/**
 * ScissorsEmoji: Two-Fingers Scissors Hand Gesture (Qaychi Barmoqlar / ✌️)
 */
export const ScissorsEmoji: React.FC<RPSProps> = ({ size = 56, className = '', glow = true }) => {
  const numericSize = typeof size === 'number' ? size : parseInt(size as string, 10) || 56;

  return (
    <div 
      style={{ 
        width: numericSize, 
        height: numericSize, 
        filter: glow ? 'drop-shadow(0 8px 20px rgba(14, 165, 233, 0.45))' : 'none' 
      }}
      className={`flex items-center justify-center select-none transition-transform hover:scale-110 active:scale-95 ${className}`}
    >
      <div className="relative flex items-center justify-center w-full h-full rounded-2xl bg-gradient-to-tr from-sky-500/20 via-sky-400/10 to-sky-300/20 border border-sky-400/40 shadow-inner">
        <span 
          style={{ fontSize: `${numericSize * 0.62}px` }} 
          role="img" 
          aria-label="Qaychi Barmoqlar"
          className="filter drop-shadow-[0_4px_10px_rgba(14,165,233,0.5)] transform rotate-6 transition-transform hover:rotate-0"
        >
          ✌️
        </span>
      </div>
    </div>
  );
};

/**
 * PaperEmoji: Open Palm Hand Gesture (Ochiq Qo'l / ✋)
 */
export const PaperEmoji: React.FC<RPSProps> = ({ size = 56, className = '', glow = true }) => {
  const numericSize = typeof size === 'number' ? size : parseInt(size as string, 10) || 56;

  return (
    <div 
      style={{ 
        width: numericSize, 
        height: numericSize, 
        filter: glow ? 'drop-shadow(0 8px 20px rgba(16, 185, 129, 0.45))' : 'none' 
      }}
      className={`flex items-center justify-center select-none transition-transform hover:scale-110 active:scale-95 ${className}`}
    >
      <div className="relative flex items-center justify-center w-full h-full rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-emerald-400/10 to-emerald-300/20 border border-emerald-400/40 shadow-inner">
        <span 
          style={{ fontSize: `${numericSize * 0.62}px` }} 
          role="img" 
          aria-label="Ochiq Qo'l Qog'oz"
          className="filter drop-shadow-[0_4px_10px_rgba(16,185,129,0.5)] transform transition-transform hover:scale-105"
        >
          ✋
        </span>
      </div>
    </div>
  );
};

export const RPSGesture: React.FC<{
  gesture: 'rock' | 'paper' | 'scissors';
  size?: number | string;
  className?: string;
  glow?: boolean;
}> = ({ gesture, size = 56, className = '', glow = true }) => {
  if (gesture === 'rock') return <RockEmoji size={size} className={className} glow={glow} />;
  if (gesture === 'scissors') return <ScissorsEmoji size={size} className={className} glow={glow} />;
  return <PaperEmoji size={size} className={className} glow={glow} />;
};

export default RPSGesture;
