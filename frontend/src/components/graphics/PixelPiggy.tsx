import React from 'react';

interface LiquidPiggyProps {
  size?: number;
  className?: string;
  wobble?: boolean;
}

/**
 * LiquidPiggy
 * Apple-style 3D Liquid Glass Piggy illustration for Game Over defeat screen.
 * Replaces the old 8-bit retro pixel art with a smooth, glossy, translucent glass character.
 */
export const LiquidPiggy: React.FC<LiquidPiggyProps> = ({
  size = 96,
  className = '',
  wobble = false,
}) => {
  return (
    <div className={`inline-block ${wobble ? 'animate-bounce' : ''} ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_12px_24px_rgba(244,114,182,0.3)] select-none"
      >
        <defs>
          {/* Main Body Translucent Liquid Gradient */}
          <radialGradient id="piggyBodyGrad" cx="42%" cy="38%" r="55%" fx="35%" fy="30%">
            <stop offset="0%" stopColor="#FFF0F5" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#FBCFE8" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#F472B6" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#DB2777" stopOpacity="0.65" />
          </radialGradient>

          {/* Ears Gradient */}
          <linearGradient id="piggyEarGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDF2F8" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>

          {/* Snout 3D Glass Gradient */}
          <radialGradient id="piggySnoutGrad" cx="35%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#F9A8D4" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0.75" />
          </radialGradient>

          {/* Specular Highlight */}
          <linearGradient id="piggySpecular" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Ambient shadow underneath */}
        <ellipse cx="50" cy="88" rx="34" ry="7" fill="rgba(219,39,119,0.18)" filter="blur(3px)" />

        {/* Left Ear */}
        <path
          d="M 22 28 C 14 16 26 8 36 18 C 34 24 28 28 22 28 Z"
          fill="url(#piggyEarGrad)"
          stroke="rgba(255, 255, 255, 0.7)"
          strokeWidth="1.5"
        />
        <path
          d="M 24 23 C 18 16 26 12 32 18"
          stroke="#F43F5E"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Right Ear */}
        <path
          d="M 78 28 C 86 16 74 8 64 18 C 66 24 72 28 78 28 Z"
          fill="url(#piggyEarGrad)"
          stroke="rgba(255, 255, 255, 0.7)"
          strokeWidth="1.5"
        />
        <path
          d="M 76 23 C 82 16 74 12 68 18"
          stroke="#F43F5E"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Main Spherical Glass Head / Body */}
        <circle
          cx="50"
          cy="52"
          r="36"
          fill="url(#piggyBodyGrad)"
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth="1.5"
        />

        {/* Specular Curved Highlight on Head (Top-Left) */}
        <path
          d="M 28 32 C 34 24 48 22 58 24"
          stroke="url(#piggySpecular)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="28" cy="35" r="2" fill="#FFFFFF" opacity="0.9" />

        {/* Dizzy Defeated Eyes: Left (Smooth X) */}
        <g stroke="#831843" strokeWidth="2.8" strokeLinecap="round">
          <line x1="30" y1="42" x2="38" y2="50" />
          <line x1="38" y1="42" x2="30" y2="50" />
        </g>
        {/* Dizzy Defeated Eyes: Right (Smooth X) */}
        <g stroke="#831843" strokeWidth="2.8" strokeLinecap="round">
          <line x1="62" y1="42" x2="70" y2="50" />
          <line x1="70" y1="42" x2="62" y2="50" />
        </g>

        {/* Soft Blushing Cheeks */}
        <circle cx="25" cy="56" r="6" fill="#F43F5E" opacity="0.25" filter="blur(1px)" />
        <circle cx="75" cy="56" r="6" fill="#F43F5E" opacity="0.25" filter="blur(1px)" />

        {/* 3D Glass Snout */}
        <rect
          x="35"
          y="52"
          width="30"
          height="20"
          rx="10"
          fill="url(#piggySnoutGrad)"
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth="1.2"
        />
        {/* Snout specular highlight */}
        <path
          d="M 40 56 Q 48 54 54 56"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* Nostrils */}
        <ellipse cx="45" cy="62" rx="2.5" ry="3.5" fill="#9D174D" />
        <ellipse cx="55" cy="62" rx="2.5" ry="3.5" fill="#9D174D" />

        {/* Tiny Droplet Tear (Sweet Defeat Feeling) */}
        <path
          d="M 68 53 C 68 57 65 60 63 60 C 61 60 60 57 63 53 C 65 50 67 50 68 53 Z"
          fill="#38BDF8"
          opacity="0.8"
        />

        {/* Little Cute Glass Trotters */}
        <rect x="36" y="80" width="10" height="7" rx="3.5" fill="#F472B6" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
        <rect x="54" y="80" width="10" height="7" rx="3.5" fill="#F472B6" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
      </svg>
    </div>
  );
};

// Backward compatibility alias
export const PixelPiggy = LiquidPiggy;
