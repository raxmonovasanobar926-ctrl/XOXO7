import React from 'react';

/**
 * LiquidTrophy
 * Apple-style 3D liquid glass trophy with translucent amber crystal bowl,
 * glossy specular highlights, and gold refraction for YOU WON screen.
 */
export const LiquidTrophy: React.FC<{ size?: number; className?: string }> = ({ size = 80, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none filter drop-shadow-[0_10px_20px_rgba(217,119,6,0.35)] ${className}`}
  >
    <defs>
      <linearGradient id="liquidTrophyBody" x1="18" y1="8" x2="46" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
        <stop offset="45%" stopColor="#F59E0B" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#B45309" stopOpacity="0.75" />
      </linearGradient>

      <linearGradient id="liquidTrophySpecular" x1="20" y1="12" x2="44" y2="12" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.8" />
      </linearGradient>

      <radialGradient id="liquidTrophyGlint" cx="32" cy="22" r="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
        <stop offset="60%" stopColor="#FDE68A" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Ambient base shadow */}
    <ellipse cx="32" cy="59" rx="18" ry="3" fill="rgba(180,83,9,0.2)" filter="blur(1.5px)" />

    {/* Trophy Cup Body */}
    <path
      d="M 18 10 H 46 V 27 C 46 36 38 42 32 42 C 26 42 18 36 18 27 V 10 Z"
      fill="url(#liquidTrophyBody)"
      stroke="rgba(255, 255, 255, 0.85)"
      strokeWidth="1.5"
    />

    {/* Inner Glint */}
    <ellipse cx="32" cy="22" rx="10" ry="8" fill="url(#liquidTrophyGlint)" />

    {/* Left Handle */}
    <path
      d="M 18 16 H 12 C 9 16 7 18 7 22 C 7 28 11 31 18 31"
      stroke="#F59E0B"
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.85"
    />
    <path
      d="M 17 18 H 13 C 10 18 9 19 9 22 C 9 26 12 29 17 29"
      stroke="rgba(255, 255, 255, 0.7)"
      strokeWidth="1"
      strokeLinecap="round"
    />

    {/* Right Handle */}
    <path
      d="M 46 16 H 52 C 55 16 57 18 57 22 C 57 28 53 31 46 31"
      stroke="#F59E0B"
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.85"
    />
    <path
      d="M 47 18 H 51 C 54 18 55 19 55 22 C 55 26 52 29 47 29"
      stroke="rgba(255, 255, 255, 0.7)"
      strokeWidth="1"
      strokeLinecap="round"
    />

    {/* Stem */}
    <path
      d="M 29 42 H 35 V 49 H 29 V 42 Z"
      fill="#D97706"
      stroke="rgba(255, 255, 255, 0.6)"
      strokeWidth="1"
    />

    {/* Base Pedestal (Glass Block) */}
    <rect
      x="20"
      y="49"
      width="24"
      height="8"
      rx="3"
      fill="linear-gradient(180deg, #F59E0B 0%, #B45309 100%)"
      stroke="rgba(255, 255, 255, 0.85)"
      strokeWidth="1.2"
    />

    {/* Specular Rim along cup lip */}
    <path
      d="M 20 12 H 44"
      stroke="url(#liquidTrophySpecular)"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Sparkling Star Emblem on Cup */}
    <circle cx="32" cy="24" r="3" fill="#FFFFFF" opacity="0.95" />
    <path
      d="M 32 18 V 30 M 26 24 H 38"
      stroke="#FFFFFF"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.85"
    />
  </svg>
);

/**
 * LiquidHandshake
 * Apple-style translucent dual glass clasp illustration for DRAW result.
 */
export const LiquidHandshake: React.FC<{ size?: number; className?: string }> = ({ size = 80, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none filter drop-shadow-[0_8px_20px_rgba(2,132,199,0.25)] ${className}`}
  >
    <defs>
      <linearGradient id="hsBlueGlass" x1="10" y1="20" x2="30" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#E0F2FE" />
        <stop offset="50%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
      <linearGradient id="hsRoseGlass" x1="54" y1="20" x2="34" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFE4E6" />
        <stop offset="50%" stopColor="#FB7185" />
        <stop offset="100%" stopColor="#E11D48" />
      </linearGradient>
    </defs>

    {/* Left Arm (Blue Glass) */}
    <path
      d="M 8 22 L 23 35 L 29 29 L 16 16 Z"
      fill="url(#hsBlueGlass)"
      stroke="rgba(255, 255, 255, 0.8)"
      strokeWidth="1.5"
    />

    {/* Right Arm (Rose Glass) */}
    <path
      d="M 56 22 L 41 35 L 35 29 L 48 16 Z"
      fill="url(#hsRoseGlass)"
      stroke="rgba(255, 255, 255, 0.8)"
      strokeWidth="1.5"
    />

    {/* Interlocking Glass Clasp Center */}
    <rect
      x="24"
      y="24"
      width="16"
      height="16"
      rx="6"
      fill="linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(186,230,253,0.85) 100%)"
      stroke="rgba(255, 255, 255, 0.95)"
      strokeWidth="1.5"
      transform="rotate(45 32 32)"
    />

    {/* Center Specular Glint */}
    <circle cx="32" cy="32" r="2.5" fill="#FFFFFF" />
  </svg>
);

export const StreakFlame: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)] ${className}`}
  >
    <defs>
      <linearGradient id="flameGrad" x1="16" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="45%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#E11D48" />
      </linearGradient>
    </defs>
    <path
      d="M 16 3 C 16 3 24 10 24 18 C 24 23 20 27 16 27 C 12 27 8 23 8 18 C 8 12 13 8 14 6 C 14.5 10 17 11 17 11 C 17 11 16 7 16 3 Z"
      fill="url(#flameGrad)"
      stroke="rgba(255, 255, 255, 0.4)"
      strokeWidth="0.8"
    />
    <path
      d="M 16 13 C 16 13 20 17 20 20 C 20 22.5 18 24.5 16 24.5 C 14 24.5 12 22.5 12 20 C 12 17 15 15 16 13 Z"
      fill="#FFFFFF"
      opacity="0.85"
    />
  </svg>
);

export const RankBadge: React.FC<{ rank: 1 | 2 | 3; size?: number; className?: string }> = ({ rank, size = 26, className = '' }) => {
  const colors = {
    1: { fill: 'linear-gradient(135deg, #FEF08A 0%, #F59E0B 100%)', stroke: '#FDE047', text: '#78350F' },
    2: { fill: 'linear-gradient(135deg, #F1F5F9 0%, #CBD5E1 100%)', stroke: '#E2E8F0', text: '#334155' },
    3: { fill: 'linear-gradient(135deg, #FFEDD5 0%, #FB923C 100%)', stroke: '#FED7AA', text: '#7C2D12' },
  }[rank];

  return (
    <div
      style={{
        width: size,
        height: size,
        background: colors.fill,
        borderColor: colors.stroke,
      }}
      className={`inline-flex items-center justify-center rounded-full border shadow-sm font-extrabold text-xs select-none ${className}`}
    >
      <span style={{ color: colors.text }}>{rank}</span>
    </div>
  );
};

// Backward compatibility aliases
export const ArcadeTrophy = LiquidTrophy;
export const ArcadeHandshake = LiquidHandshake;
