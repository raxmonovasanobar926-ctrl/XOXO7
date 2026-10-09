import React from 'react';

interface StoneIconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero' | number;
  className?: string;
  glow?: boolean;
}

const SIZE_MAP = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 44,
  hero: 56,
};

/**
 * LiquidStone / StoneIcon
 * Apple-style glowing translucent golden-amber liquid glass drop / jewel orb.
 * Replaces metallic look with translucent amber glass and glossy specular highlight.
 */
export const StoneIcon: React.FC<StoneIconProps> = ({ size = 'md', className = '', glow = true }) => {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 24;

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none transition-transform duration-200 ${
        glow ? 'filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]' : ''
      } ${className}`}
    >
      <defs>
        {/* Liquid Glass Drop Radial Gradient */}
        <radialGradient id="liquidStoneBody" cx="38%" cy="32%" r="58%" fx="30%" fy="26%">
          <stop offset="0%" stopColor="#FEF9C3" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#FBBF24" stopOpacity="0.88" />
          <stop offset="75%" stopColor="#D97706" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#92400E" stopOpacity="0.75" />
        </radialGradient>

        {/* Specular Highlight Arc */}
        <linearGradient id="liquidStoneSpecular" x1="12" y1="12" x2="32" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
        </linearGradient>

        {/* Inner Caustic Glow */}
        <radialGradient id="liquidStoneCaustic" cx="50%" cy="65%" r="35%">
          <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient Drop Shadow */}
      <ellipse cx="24" cy="43" rx="14" ry="3.5" fill="rgba(146,64,14,0.22)" filter="blur(1.5px)" />

      {/* Main Liquid Glass Teardrop / Gem Body */}
      <path
        d="M 24 5 C 24 5 38 18 38 29 C 38 37 31.7 43 24 43 C 16.3 43 10 37 10 29 C 10 18 24 5 24 5 Z"
        fill="url(#liquidStoneBody)"
        stroke="rgba(255, 255, 255, 0.75)"
        strokeWidth="1.2"
      />

      {/* Inner Caustic Light in lower belly */}
      <ellipse cx="24" cy="33" rx="9" ry="6" fill="url(#liquidStoneCaustic)" />

      {/* Specular Curved Highlight (Upper-Left) */}
      <path
        d="M 22 11 C 18 17 14 24 14 29"
        stroke="url(#liquidStoneSpecular)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Tiny Sparkling Glint at apex */}
      <circle cx="21" cy="13" r="1.6" fill="#FFFFFF" opacity="0.95" />
    </svg>
  );
};
