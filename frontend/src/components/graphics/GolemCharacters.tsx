import React, { useState } from 'react';

export type GolemLevel = 'easy' | 'medium' | 'hard' | 'expert';

interface GolemProps {
  level: GolemLevel;
  size?: number | string;
  className?: string;
  glow?: boolean;
}

export const GOLEM_ROBOT_META: Record<
  GolemLevel,
  {
    image: string;
    name: string;
    role: string;
    glowShadow: string;
    borderColor: string;
    ringColor: string;
    accentHex: string;
  }
> = {
  easy: {
    image: '/images/ai/golem_easy.jpg',
    name: 'Pebble',
    role: 'Scout Robot',
    glowShadow: 'shadow-[0_0_20px_rgba(20,184,166,0.6)] drop-shadow-[0_0_12px_rgba(45,212,191,0.5)]',
    borderColor: 'border-teal-400',
    ringColor: 'ring-teal-400/40',
    accentHex: '#2DD4BF',
  },
  medium: {
    image: '/images/ai/golem_medium.jpg',
    name: 'Rocky',
    role: 'Combat Mech',
    glowShadow: 'shadow-[0_0_20px_rgba(245,158,11,0.65)] drop-shadow-[0_0_14px_rgba(251,191,36,0.5)]',
    borderColor: 'border-amber-400',
    ringColor: 'ring-amber-400/40',
    accentHex: '#FBBF24',
  },
  hard: {
    image: '/images/ai/golem_hard.jpg',
    name: 'Granite',
    role: 'Heavy Sentinel',
    glowShadow: 'shadow-[0_0_22px_rgba(249,115,22,0.7)] drop-shadow-[0_0_16px_rgba(251,146,60,0.55)]',
    borderColor: 'border-orange-500',
    ringColor: 'ring-orange-500/40',
    accentHex: '#F97316',
  },
  expert: {
    image: '/images/ai/golem_expert.jpg',
    name: 'Obsidian',
    role: 'Cyber Titan Boss',
    glowShadow: 'shadow-[0_0_28px_rgba(239,68,68,0.85)] drop-shadow-[0_0_18px_rgba(244,63,94,0.7)]',
    borderColor: 'border-rose-500',
    ringColor: 'ring-rose-500/50',
    accentHex: '#F43F5E',
  },
};

export const GolemAvatar: React.FC<GolemProps> = ({
  level,
  size = 64,
  className = '',
  glow = true,
}) => {
  const meta = GOLEM_ROBOT_META[level] || GOLEM_ROBOT_META.easy;
  const [imgError, setImgError] = useState(false);

  const numericSize = typeof size === 'number' ? size : parseInt(size, 10) || 64;
  const isCompact = numericSize <= 44;

  return (
    <div
      style={{ width: numericSize, height: numericSize }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none group transition-transform duration-300 hover:scale-105 ${className}`}
    >
      {/* Outer ambient glow */}
      {glow && (
        <div
          className={`absolute -inset-1 rounded-2xl opacity-75 blur-md transition-opacity duration-300 group-hover:opacity-100 ${
            level === 'easy'
              ? 'bg-gradient-to-tr from-teal-500/60 to-cyan-400/60'
              : level === 'medium'
              ? 'bg-gradient-to-tr from-amber-500/60 to-yellow-400/60'
              : level === 'hard'
              ? 'bg-gradient-to-tr from-orange-600/60 to-amber-500/60'
              : 'bg-gradient-to-tr from-rose-600/70 to-red-500/70'
          }`}
        />
      )}

      {/* Main Avatar Card Frame */}
      <div
        className={`relative w-full h-full rounded-2xl overflow-hidden border-2 bg-slate-900 ring-1 shadow-lg transition-all duration-300 ${
          meta.borderColor
        } ${meta.ringColor} ${glow ? meta.glowShadow : ''}`}
      >
        {!imgError ? (
          <img
            src={meta.image}
            alt={meta.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center transform transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          /* High-contrast fallback SVG */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 p-1">
            <span className="text-xl">🤖</span>
            <span className="text-[9px] font-black tracking-wider text-slate-300 uppercase mt-0.5">
              {meta.name}
            </span>
          </div>
        )}

        {/* Cyber Holographic Corner Accents for larger displays */}
        {!isCompact && (
          <>
            <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-white/80 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-white/80 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-white/80 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-white/80 rounded-br-sm pointer-events-none" />
          </>
        )}

        {/* Level badge indicator on bottom right for medium/large sizes */}
        {!isCompact && (
          <div
            className={`absolute bottom-0 inset-x-0 py-0.5 text-center backdrop-blur-md font-black text-[8px] uppercase tracking-wider text-white border-t border-white/20 ${
              level === 'easy'
                ? 'bg-teal-950/80 text-teal-200'
                : level === 'medium'
                ? 'bg-amber-950/80 text-amber-200'
                : level === 'hard'
                ? 'bg-orange-950/80 text-orange-200'
                : 'bg-rose-950/85 text-rose-200'
            }`}
          >
            {level === 'expert' ? 'BOSS' : meta.name}
          </div>
        )}
      </div>
    </div>
  );
};

export const PebbleGolem: React.FC<{ size?: number | string; className?: string; glow?: boolean }> = (props) => (
  <GolemAvatar level="easy" {...props} />
);

export const RockyGolem: React.FC<{ size?: number | string; className?: string; glow?: boolean }> = (props) => (
  <GolemAvatar level="medium" {...props} />
);

export const GraniteGolem: React.FC<{ size?: number | string; className?: string; glow?: boolean }> = (props) => (
  <GolemAvatar level="hard" {...props} />
);

export const ObsidianGolem: React.FC<{ size?: number | string; className?: string; glow?: boolean }> = (props) => (
  <GolemAvatar level="expert" {...props} />
);
