import React from 'react';

/**
 * LiquidGlassBackground
 * Premium Liquid Glass background system:
 * 1. Crisp, subtle 1px square grid lines (36px precision layer).
 * 2. Floating 3D liquid glass capsules and orbs with specular highlights, inner refraction,
 *    ambient shadows, and optical distortion.
 * 3. Hardware-accelerated CSS animations (smooth floating orbs).
 * 4. SVG displacement filter for authentic liquid refraction.
 */
export const LiquidGlassBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* Hidden SVG Filter for Real Liquid Refraction */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id="liquid-distort" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008 0.015"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="14"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* 0. Ambient Vibrant Light Blobs for Liquid Refraction */}
      <div className="absolute top-[-10%] left-[-15%] w-[340px] h-[340px] rounded-full bg-purple-600/30 filter blur-[90px] animate-orb-slow" />
      <div className="absolute top-[35%] right-[-10%] w-[360px] h-[360px] rounded-full bg-indigo-600/30 filter blur-[90px] animate-orb-reverse" />
      <div className="absolute bottom-[5%] left-[10%] w-[300px] h-[300px] rounded-full bg-rose-600/25 filter blur-[90px] animate-orb-slow" />

      {/* 1. Subtle 36px Precision Grid (Depth layer) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--bg-grid) 1px, transparent 1px),
            linear-gradient(to bottom, var(--bg-grid) 1px, transparent 1px)
          `,
          backgroundSize: 'var(--grid-size) var(--grid-size)',
        }}
      />

      {/* 2. Floating Liquid Glass Orbs & Capsules */}

      {/* Orb 1: Hero Large Horizontal Rounded Glass Capsule (Top-Right / Center) */}
      <div
        className="absolute animate-orb-slow"
        style={{
          top: '16%',
          right: '-8%',
          width: 'min(440px, 85vw)',
          height: '240px',
          borderRadius: '120px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(139, 92, 246, 0.12) 50%, rgba(30, 27, 75, 0.08) 100%)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1.5px solid rgba(255, 255, 255, 0.35)',
          boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.55), inset 0 2px 4px rgba(255, 255, 255, 0.65), inset 0 -3px 8px rgba(139, 92, 246, 0.2)',
        }}
      >
        {/* Specular curved glint (top-left) */}
        <div
          className="absolute"
          style={{
            top: '8px',
            left: '28px',
            width: '140px',
            height: '4px',
            borderRadius: '9999px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.2) 100%)',
            filter: 'blur(0.5px)',
          }}
        />
        {/* Secondary inner reflection rim */}
        <div
          className="absolute inset-2 pointer-events-none rounded-[112px]"
          style={{
            border: '1px solid rgba(255, 255, 255, 0.20)',
          }}
        />
      </div>

      {/* Orb 2: Small Spherical Bubble (Upper-Left) */}
      <div
        className="absolute animate-orb-reverse"
        style={{
          top: '26%',
          left: '20%',
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.40) 0%, rgba(167, 139, 250, 0.18) 60%, rgba(49, 46, 129, 0.08) 100%)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1.5px solid rgba(255, 255, 255, 0.45)',
          boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.45), inset 0 2px 3px rgba(255, 255, 255, 0.75)',
        }}
      >
        <div
          className="absolute"
          style={{
            top: '6px',
            left: '12px',
            width: '22px',
            height: '11px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.95)',
            transform: 'rotate(-25deg)',
            filter: 'blur(0.5px)',
          }}
        />
      </div>

      {/* Orb 3: Medium Spherical Glass Orb (Mid-Left) */}
      <div
        className="absolute animate-orb-slow"
        style={{
          top: '38%',
          left: '8%',
          width: '135px',
          height: '135px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.32) 0%, rgba(147, 197, 253, 0.16) 55%, rgba(30, 27, 75, 0.08) 100%)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          border: '1.5px solid rgba(255, 255, 255, 0.40)',
          boxShadow: '0 16px 36px -6px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.70)',
        }}
      >
        <div
          className="absolute"
          style={{
            top: '12px',
            left: '20px',
            width: '40px',
            height: '15px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.9)',
            transform: 'rotate(-30deg)',
            filter: 'blur(0.8px)',
          }}
        />
      </div>

      {/* Orb 4: Medium Horizontal Glass Capsule (Lower-Left) */}
      <div
        className="absolute animate-orb-reverse"
        style={{
          bottom: '12%',
          left: '10%',
          width: 'min(310px, 72vw)',
          height: '180px',
          borderRadius: '90px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(192, 132, 252, 0.14) 50%, rgba(30, 27, 75, 0.06) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(255, 255, 255, 0.35)',
          boxShadow: '0 20px 48px -8px rgba(0, 0, 0, 0.5), inset 0 2px 3px rgba(255, 255, 255, 0.70)',
        }}
      >
        <div
          className="absolute"
          style={{
            top: '10px',
            left: '24px',
            width: '85px',
            height: '4px',
            borderRadius: '9999px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, transparent 100%)',
          }}
        />
      </div>

      {/* Orb 5: Large Rounded Glass Sphere (Lower-Right) */}
      <div
        className="absolute animate-orb-slow"
        style={{
          bottom: '-5%',
          right: '-12%',
          width: 'min(350px, 80vw)',
          height: 'min(350px, 80vw)',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.26) 0%, rgba(129, 140, 248, 0.14) 55%, rgba(30, 27, 75, 0.08) 100%)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1.5px solid rgba(255, 255, 255, 0.35)',
          boxShadow: '0 24px 60px -10px rgba(0, 0, 0, 0.55), inset 0 2px 4px rgba(255, 255, 255, 0.70)',
        }}
      >
        <div
          className="absolute"
          style={{
            top: '18px',
            left: '32px',
            width: '95px',
            height: '25px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.85)',
            transform: 'rotate(-35deg)',
            filter: 'blur(1px)',
          }}
        />
      </div>
    </div>
  );
};
export default LiquidGlassBackground;
