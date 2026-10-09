import React from 'react';

interface LiquidMarkProps {
  size?: number | string;
  color?: 'blue' | 'red' | 'gold' | 'default';
  className?: string;
  animated?: boolean;
}

/**
 * LiquidXMark
 * Apple-style Liquid Glass X:
 * Two smooth intersecting rounded glass capsule bars,
 * with light refraction, glossy specular highlight rim, and soft inner glow.
 */
export const LiquidXMark: React.FC<LiquidMarkProps> = ({
  size = 48,
  color = 'blue',
  className = '',
  animated = true,
}) => {
  const isRed = color === 'red';
  const isGold = color === 'gold';

  // Palette: soft liquid tint
  const baseGradStart = isRed ? '#FF4D6D' : isGold ? '#FBBF24' : '#38BDF8';
  const baseGradEnd = isRed ? '#E11D48' : isGold ? '#D97706' : '#0284C7';
  const shadowColor = isRed ? 'rgba(225, 29, 72, 0.25)' : isGold ? 'rgba(217, 119, 6, 0.25)' : 'rgba(2, 132, 199, 0.25)';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${animated ? 'transition-all duration-300 transform-gpu' : ''} ${className}`}
      style={{
        filter: `drop-shadow(0 4px 12px ${shadowColor})`,
      }}
    >
      <defs>
        {/* Main translucent glass bar gradient */}
        <linearGradient id={`liquidXGrad-${color}`} x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={baseGradStart} stopOpacity="0.85" />
          <stop offset="50%" stopColor={baseGradEnd} stopOpacity="0.75" />
          <stop offset="100%" stopColor={baseGradStart} stopOpacity="0.85" />
        </linearGradient>

        {/* Specular Top Rim */}
        <linearGradient id="liquidXSpecular" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Bar 1: Top-Left to Bottom-Right Capsule */}
      <rect
        x="13"
        y="27"
        width="38"
        height="10"
        rx="5"
        transform="rotate(45 32 32)"
        fill={`url(#liquidXGrad-${color})`}
        stroke="rgba(255, 255, 255, 0.65)"
        strokeWidth="1.2"
      />
      {/* Bar 1 Specular Highlight Line */}
      <line
        x1="18"
        y1="29.5"
        x2="46"
        y2="29.5"
        transform="rotate(45 32 32)"
        stroke="url(#liquidXSpecular)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Bar 2: Top-Right to Bottom-Left Capsule */}
      <rect
        x="13"
        y="27"
        width="38"
        height="10"
        rx="5"
        transform="rotate(-45 32 32)"
        fill={`url(#liquidXGrad-${color})`}
        stroke="rgba(255, 255, 255, 0.65)"
        strokeWidth="1.2"
      />
      {/* Bar 2 Specular Highlight Line */}
      <line
        x1="18"
        y1="29.5"
        x2="46"
        y2="29.5"
        transform="rotate(-45 32 32)"
        stroke="url(#liquidXSpecular)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Center Intersection Gloss Glint */}
      <circle cx="32" cy="32" r="3.5" fill="#FFFFFF" opacity="0.6" filter="blur(0.5px)" />
    </svg>
  );
};

/**
 * LiquidOMark
 * Apple-style Liquid Glass O:
 * Translucent liquid glass bubble / ring with inner depth,
 * specular crescent highlight, and soft ambient drop shadow.
 */
export const LiquidOMark: React.FC<LiquidMarkProps> = ({
  size = 48,
  color = 'red',
  className = '',
  animated = true,
}) => {
  const isBlue = color === 'blue';
  const isGold = color === 'gold';

  const baseGradStart = isBlue ? '#38BDF8' : isGold ? '#FBBF24' : '#FF4D6D';
  const baseGradEnd = isBlue ? '#0284C7' : isGold ? '#D97706' : '#E11D48';
  const shadowColor = isBlue ? 'rgba(2, 132, 199, 0.25)' : isGold ? 'rgba(217, 119, 6, 0.25)' : 'rgba(225, 29, 72, 0.25)';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${animated ? 'transition-all duration-300 transform-gpu' : ''} ${className}`}
      style={{
        filter: `drop-shadow(0 4px 12px ${shadowColor})`,
      }}
    >
      <defs>
        {/* Ring Torus Gradient */}
        <radialGradient id={`liquidOGrad-${color}`} cx="32" cy="32" r="22" gradientUnits="userSpaceOnUse">
          <stop offset="60%" stopColor={baseGradEnd} stopOpacity="0.8" />
          <stop offset="90%" stopColor={baseGradStart} stopOpacity="0.75" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.4" />
        </radialGradient>

        {/* Specular Highlight Arc */}
        <linearGradient id="liquidOSpecular" x1="16" y1="16" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Main Glass Torus Ring */}
      <circle
        cx="32"
        cy="32"
        r="17"
        stroke={`url(#liquidOGrad-${color})`}
        strokeWidth="9"
        strokeLinecap="round"
      />

      {/* Outer Fine Glass Rim */}
      <circle
        cx="32"
        cy="32"
        r="21.5"
        stroke="rgba(255, 255, 255, 0.7)"
        strokeWidth="1"
      />

      {/* Inner Fine Glass Rim */}
      <circle
        cx="32"
        cy="32"
        r="12.5"
        stroke="rgba(255, 255, 255, 0.55)"
        strokeWidth="1"
      />

      {/* Specular Highlight Crescent (Upper-Left) */}
      <path
        d="M 18 24 A 17 17 0 0 1 32 15"
        stroke="url(#liquidOSpecular)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* Small Secondary Glint (Bottom-Right) */}
      <path
        d="M 44 38 A 17 17 0 0 1 38 46"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
};

// Aliases for seamless backward compatibility
export const NeonXMark = LiquidXMark;
export const NeonOMark = LiquidOMark;
