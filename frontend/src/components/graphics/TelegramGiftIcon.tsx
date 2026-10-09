import React, { useState } from 'react';
import { Sparkles, X, Send, Coins, ShieldCheck, Star, Trophy, ExternalLink } from 'lucide-react';
import { sounds } from '../../utils/sounds.ts';
import { haptics } from '../../utils/haptics.ts';
import { useTranslation } from '../../contexts/ThemeLanguageContext.tsx';

export interface TelegramGiftMetadata {
  id: string;
  title_uz?: string;
  title_ru?: string;
  title_en?: string;
  title?: string;
  token_price?: number;
  sell_price?: number;
  serialNumber?: string;
  rarity?: string;
  is_premium_reward?: boolean;
  can_sell?: boolean;
}

export const TelegramVerifiedBadge: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`inline-block shrink-0 drop-shadow-sm ${className}`}
  >
    <path
      d="M10.27 2.29a2.5 2.5 0 0 1 3.46 0l.97.94a2.5 2.5 0 0 0 2.29.68l1.32-.23a2.5 2.5 0 0 1 2.85 1.98l.3 1.32a2.5 2.5 0 0 0 1.63 1.77l1.26.47a2.5 2.5 0 0 1 1.5 3.14l-.44 1.28a2.5 2.5 0 0 0 .68 2.29l.94.97a2.5 2.5 0 0 1 0 3.46l-.94.97a2.5 2.5 0 0 0-.68 2.29l.44 1.28a2.5 2.5 0 0 1-1.5 3.14l-1.26.47a2.5 2.5 0 0 0-1.63 1.77l-.3 1.32a2.5 2.5 0 0 1-2.85 1.98l-1.32-.23a2.5 2.5 0 0 0-2.29.68l-.97.94a2.5 2.5 0 0 1-3.46 0l-.97-.94a2.5 2.5 0 0 0-2.29-.68l-1.32.23a2.5 2.5 0 0 1-2.85-1.98l-.3-1.32a2.5 2.5 0 0 0-1.63-1.77l-1.26-.47a2.5 2.5 0 0 1-1.5-3.14l.44-1.28a2.5 2.5 0 0 0-.68-2.29l-.94-.97a2.5 2.5 0 0 1 0-3.46l.94-.97a2.5 2.5 0 0 0 .68-2.29l-.44-1.28a2.5 2.5 0 0 1 1.5-3.14l1.26-.47a2.5 2.5 0 0 0 1.63-1.77l.3-1.32a2.5 2.5 0 0 1 2.85-1.98l1.32.23a2.5 2.5 0 0 0 2.29-.68l.97-.94z"
      fill="#2AABEE"
    />
    <path
      d="M8.5 12.3l2.4 2.4 4.8-5"
      stroke="#ffffff"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function normalizeGiftId(giftId: any): 'uzuk_diamond' | 'yurak_crystal' | 'atirgul_rose' | 'sovga_box' | 'ayiq_teddy' {
  const s = String(giftId ?? '').toLowerCase();
  if (s.includes('crown') || s.includes('ring') || s.includes('uzuk') || s.includes('diamond')) {
    return 'uzuk_diamond';
  } else if (s.includes('crystal') || s.includes('heart') || s.includes('yurak')) {
    return 'yurak_crystal';
  } else if (s.includes('rose') || s.includes('atirgul') || s.includes('cup')) {
    return 'atirgul_rose';
  } else if (s.includes('box') || s.includes('gift') || s.includes('sovga') || s.includes('rocket')) {
    return 'sovga_box';
  } else if (s.includes('bear') || s.includes('ayiq') || s.includes('scepter') || s.includes('star') || s.includes('elixir')) {
    return 'ayiq_teddy';
  }
  return 'sovga_box';
}

export function getGiftDisplayMeta(giftId: any) {
  const norm = normalizeGiftId(giftId);
  switch (norm) {
    case 'uzuk_diamond':
      return {
        id: 'uzuk_diamond',
        title: 'Olmos Toj',
        model: 'Diamond Ring',
        rarity: 'Afsonaviy',
        rarityEn: 'Legendary',
        serial: '№ 007',
        totalMinted: '5,000',
        price: 500,
        sellPrice: 400,
        glowColor: 'rgba(6, 182, 212, 0.4)',
        glowTailwind: 'from-cyan-500/20 via-sky-400/30 to-blue-600/20',
        badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
        themeGlow: 'bg-cyan-500/25',
      };
    case 'yurak_crystal':
      return {
        id: 'yurak_crystal',
        title: 'Yaqut Yurakcha',
        model: 'Crystal Heart',
        rarity: 'Qirolona',
        rarityEn: 'Royal',
        serial: '№ 018',
        totalMinted: '10,000',
        price: 250,
        sellPrice: 200,
        glowColor: 'rgba(236, 72, 153, 0.45)',
        glowTailwind: 'from-rose-500/20 via-pink-400/40 to-fuchsia-600/30',
        badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-400/40',
        themeGlow: 'bg-pink-500/25',
      };
    case 'atirgul_rose':
      return {
        id: 'atirgul_rose',
        title: 'Qirollik Atirguli',
        model: 'Velvet Rose',
        rarity: 'Noyob',
        rarityEn: 'Rare',
        serial: '№ 045',
        totalMinted: '25,000',
        price: 100,
        sellPrice: 80,
        glowColor: 'rgba(225, 29, 72, 0.45)',
        glowTailwind: 'from-rose-600/25 via-red-500/35 to-rose-700/20',
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
        themeGlow: 'bg-rose-500/25',
      };
    case 'sovga_box':
      return {
        id: 'sovga_box',
        title: "Luxe Sovg'a",
        model: 'Luxe Gift Box',
        rarity: 'Klassik',
        rarityEn: 'Classic',
        serial: '№ 089',
        totalMinted: '50,000',
        price: 50,
        sellPrice: 40,
        glowColor: 'rgba(168, 85, 247, 0.45)',
        glowTailwind: 'from-purple-500/25 via-amber-400/30 to-purple-700/20',
        badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
        themeGlow: 'bg-amber-500/25',
      };
    case 'ayiq_teddy':
    default:
      return {
        id: 'ayiq_teddy',
        title: 'Oltin Ayiqcha',
        model: 'Golden Bear',
        rarity: 'Kolleksiya',
        rarityEn: 'Collectible',
        serial: '№ 124',
        totalMinted: '100,000',
        price: 20,
        sellPrice: 16,
        glowColor: 'rgba(245, 158, 11, 0.45)',
        glowTailwind: 'from-amber-500/25 via-yellow-400/35 to-orange-600/20',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
        themeGlow: 'bg-yellow-500/25',
      };
  }
}

interface TelegramGiftIconProps {
  giftId: string;
  size?: number;
  showCard?: boolean;
  className?: string;
  serialNumber?: string;
  rarity?: string;
  price?: number;
  onClick?: () => void;
}

export const TelegramGiftIcon: React.FC<TelegramGiftIconProps> = ({
  giftId,
  size = 64,
  showCard = false,
  className = '',
  serialNumber,
  rarity,
  price,
  onClick,
}) => {
  const norm = normalizeGiftId(giftId);

  const renderGraphic = () => {
    switch (norm) {
      case 'uzuk_diamond':
        return (
          <div className="relative flex items-center justify-center group/ring select-none" style={{ width: size, height: size }}>
            {/* Dynamic Halo Atmosphere */}
            <div className="absolute inset-0 rounded-full bg-cyan-400/30 blur-xl animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-cyan-500/20 via-sky-400/30 to-blue-600/20 blur-md animate-spin-slow" />

            <svg viewBox="0 0 120 120" className="w-full h-full relative z-10 filter drop-shadow-[0_10px_20px_rgba(6,182,212,0.65)]">
              <defs>
                <linearGradient id="tgGoldBand" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFBEB" />
                  <stop offset="25%" stopColor="#FDE047" />
                  <stop offset="60%" stopColor="#CA8A04" />
                  <stop offset="90%" stopColor="#854D0E" />
                  <stop offset="100%" stopColor="#FEF08A" />
                </linearGradient>
                <linearGradient id="tgDiamondFacet1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="50%" stopColor="#E0F2FE" />
                  <stop offset="100%" stopColor="#38BDF8" />
                </linearGradient>
                <linearGradient id="tgDiamondFacet2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7DD3FC" />
                  <stop offset="100%" stopColor="#0284C7" />
                </linearGradient>
                <filter id="tgGlowLight">
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* 3D Ring Band Outer Shadow */}
              <ellipse cx="60" cy="74" rx="34" ry="30" fill="none" stroke="#0F172A" strokeWidth="14" opacity="0.4" />
              
              {/* 3D Gold Ring Band */}
              <circle cx="60" cy="70" r="32" fill="none" stroke="url(#tgGoldBand)" strokeWidth="12" />
              <circle cx="60" cy="70" r="32" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 7" opacity="0.8" />
              <circle cx="60" cy="70" r="26" fill="none" stroke="#78350F" strokeWidth="1.5" opacity="0.6" />

              {/* Crown Setting */}
              <polygon points="60,26 80,44 40,44" fill="url(#tgGoldBand)" />
              <polygon points="46,44 60,30 74,44" fill="#FEF08A" opacity="0.9" />

              {/* Brilliant Cut Diamond Facets */}
              <polygon points="60,10 82,28 60,46 38,28" fill="url(#tgDiamondFacet1)" />
              <polygon points="60,10 72,28 60,46" fill="url(#tgDiamondFacet2)" />
              <polygon points="60,10 60,46 48,28" fill="#FFFFFF" opacity="0.95" filter="url(#tgGlowLight)" />
              <polygon points="38,28 60,28 48,46" fill="#0284C7" opacity="0.5" />
              <polygon points="82,28 60,28 72,46" fill="#38BDF8" opacity="0.6" />
              <line x1="38" y1="28" x2="82" y2="28" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.9" />

              {/* Diamond Sparkle Glint */}
              <g className="animate-ping" style={{ transformOrigin: '60px 10px', animationDuration: '2.5s' }}>
                <path d="M60 0 L63 7 L70 10 L63 13 L60 20 L57 13 L50 10 L57 7 Z" fill="#FFFFFF" filter="url(#tgGlowLight)" />
              </g>
            </svg>
            {/* Ground Shadow Pedestal */}
            <div className="absolute -bottom-1 w-2/3 h-2 rounded-full bg-cyan-950/40 blur-xs" />
          </div>
        );

      case 'yurak_crystal':
        return (
          <div className="relative flex items-center justify-center group/heart select-none" style={{ width: size, height: size }}>
            <div className="absolute inset-0 rounded-full bg-pink-500/35 blur-xl animate-pulse" />
            <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-rose-500/20 via-pink-400/40 to-fuchsia-600/30 blur-md animate-ping-slow" />

            <svg viewBox="0 0 120 120" className="w-full h-full relative z-10 filter drop-shadow-[0_10px_20px_rgba(236,72,153,0.7)]">
              <defs>
                <linearGradient id="tgRubyCore" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F472B6" />
                  <stop offset="30%" stopColor="#E11D48" />
                  <stop offset="70%" stopColor="#BE123C" />
                  <stop offset="100%" stopColor="#4C0519" />
                </linearGradient>
                <linearGradient id="tgRubyLight" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#FBCFE8" />
                </linearGradient>
              </defs>

              {/* 3D Crystalline Heart Base */}
              <path
                d="M60 98 C26 72, 12 52, 12 35 A23 23 0 0 1 58 22 L60 25 L62 22 A23 23 0 0 1 108 35 C108 52, 94 72, 60 98 Z"
                fill="url(#tgRubyCore)"
                stroke="#FBCFE8"
                strokeWidth="3.5"
              />

              {/* Facet Refraction Cuts */}
              <path d="M30 32 A14 14 0 0 1 55 30 L48 52 Z" fill="url(#tgRubyLight)" opacity="0.45" />
              <path d="M60 25 L90 35 L75 56 Z" fill="#FDA4AF" opacity="0.35" />
              <path d="M60 98 L48 52 L60 25 L75 56 Z" fill="#9F1239" opacity="0.5" />
              <path d="M25 45 C25 35, 40 30, 48 40 Z" fill="#FFFFFF" opacity="0.75" />

              {/* Floating Sparkles */}
              <circle cx="20" cy="20" r="3" fill="#FFF" className="animate-ping" style={{ animationDuration: '2s' }} />
              <circle cx="100" cy="25" r="3.5" fill="#F472B6" className="animate-pulse" />
              <circle cx="95" cy="80" r="2.5" fill="#FFF" className="animate-ping" style={{ animationDuration: '3s' }} />
            </svg>
            <div className="absolute -bottom-1 w-2/3 h-2 rounded-full bg-rose-950/40 blur-xs" />
          </div>
        );

      case 'atirgul_rose':
        return (
          <div className="relative flex items-center justify-center group/rose select-none" style={{ width: size, height: size }}>
            <div className="absolute inset-0 rounded-full bg-rose-600/35 blur-xl animate-pulse" />

            <svg viewBox="0 0 120 120" className="w-full h-full relative z-10 filter drop-shadow-[0_10px_20px_rgba(225,29,72,0.7)]">
              <defs>
                <linearGradient id="tgRoseVelvet" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDA4AF" />
                  <stop offset="30%" stopColor="#F43F5E" />
                  <stop offset="70%" stopColor="#BE123C" />
                  <stop offset="100%" stopColor="#4C0519" />
                </linearGradient>
                <linearGradient id="tgStemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#86EFAC" />
                  <stop offset="50%" stopColor="#22C55E" />
                  <stop offset="100%" stopColor="#14532D" />
                </linearGradient>
              </defs>

              {/* Curved Stem & Leaves */}
              <path d="M60 60 Q 55 85 62 110" stroke="url(#tgStemGrad)" strokeWidth="7" strokeLinecap="round" fill="none" />
              <path d="M58 80 Q 30 70 38 58 Q 50 68 58 80 Z" fill="url(#tgStemGrad)" />
              <path d="M60 88 Q 88 78 80 66 Q 68 76 60 88 Z" fill="url(#tgStemGrad)" />

              {/* Outer Petals */}
              <circle cx="60" cy="50" r="36" fill="url(#tgRoseVelvet)" stroke="#FFE4E6" strokeWidth="2.5" />
              <path d="M30 45 C20 30, 50 20, 60 32 C70 20, 100 30, 90 45 C100 65, 70 82, 60 78 C50 82, 20 65, 30 45 Z" fill="#9F1239" opacity="0.8" />

              {/* Inner Petal Swirls */}
              <path d="M42 46 C42 32, 78 32, 78 46 C78 60, 42 60, 42 46 Z" fill="#E11D48" />
              <path d="M48 44 C48 36, 72 36, 72 44 C72 52, 48 52, 48 44 Z" fill="#FDA4AF" />
              <circle cx="60" cy="44" r="8" fill="#FFFBEB" opacity="0.95" />

              {/* Gold Dust Particles */}
              <circle cx="35" cy="25" r="2.5" fill="#FEF08A" className="animate-ping" />
              <circle cx="85" cy="22" r="3" fill="#FDE047" className="animate-pulse" />
              <circle cx="82" cy="75" r="2" fill="#FFF" className="animate-ping" style={{ animationDuration: '2.5s' }} />
            </svg>
            <div className="absolute -bottom-1 w-2/3 h-2 rounded-full bg-rose-950/40 blur-xs" />
          </div>
        );

      case 'sovga_box':
        return (
          <div className="relative flex items-center justify-center animate-bounce-subtle select-none" style={{ width: size, height: size }}>
            <div className="absolute inset-0 rounded-full bg-amber-500/35 blur-xl animate-pulse" />

            <svg viewBox="0 0 120 120" className="w-full h-full relative z-10 filter drop-shadow-[0_10px_20px_rgba(245,158,11,0.75)]">
              <defs>
                <linearGradient id="tgBoxBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E9D5FF" />
                  <stop offset="30%" stopColor="#A855F7" />
                  <stop offset="70%" stopColor="#7E22CE" />
                  <stop offset="100%" stopColor="#3B0764" />
                </linearGradient>
                <linearGradient id="tgGoldSatin" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFBEB" />
                  <stop offset="30%" stopColor="#FDE047" />
                  <stop offset="70%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#78350F" />
                </linearGradient>
              </defs>

              {/* 3D Purple Box Body */}
              <rect x="22" y="48" width="76" height="54" rx="12" fill="url(#tgBoxBodyGrad)" stroke="#F3E8FF" strokeWidth="3" />
              
              {/* 3D Lid */}
              <rect x="16" y="34" width="88" height="18" rx="6" fill="#9333EA" stroke="#FFFFFF" strokeWidth="3" />

              {/* Vertical Gold Ribbon */}
              <rect x="52" y="34" width="16" height="68" fill="url(#tgGoldSatin)" stroke="#FFF" strokeWidth="1" />

              {/* Horizontal Gold Ribbon */}
              <rect x="22" y="68" width="76" height="14" fill="url(#tgGoldSatin)" stroke="#FFF" strokeWidth="1" />

              {/* 3D Satin Ribbon Bow */}
              <path d="M42 22 C26 6, 54 26, 60 32 C66 26, 94 6, 78 22 C68 32, 52 32, 42 22 Z" fill="url(#tgGoldSatin)" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="60" cy="30" r="7" fill="#FEF08A" stroke="#B45309" strokeWidth="2" />

              {/* Star Particle Bursts */}
              <polygon points="25,20 28,26 34,28 28,30 25,36 22,30 16,28 22,26" fill="#FDE047" className="animate-ping" style={{ animationDuration: '2s' }} />
              <polygon points="95,25 97,29 102,31 97,33 95,37 93,33 88,31 93,29" fill="#FFFFFF" className="animate-pulse" />
            </svg>
            <div className="absolute -bottom-1 w-2/3 h-2 rounded-full bg-purple-950/40 blur-xs" />
          </div>
        );

      case 'ayiq_teddy':
      default:
        return (
          <div className="relative flex items-center justify-center group/bear select-none" style={{ width: size, height: size }}>
            <div className="absolute inset-0 rounded-full bg-amber-600/30 blur-xl animate-pulse" />

            <svg viewBox="0 0 120 120" className="w-full h-full relative z-10 filter drop-shadow-[0_10px_20px_rgba(217,119,6,0.7)]">
              <defs>
                <linearGradient id="tgTeddyFur" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FEF3C7" />
                  <stop offset="30%" stopColor="#F59E0B" />
                  <stop offset="70%" stopColor="#B45309" />
                  <stop offset="100%" stopColor="#451A03" />
                </linearGradient>
                <linearGradient id="tgInnerEar" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
              </defs>

              {/* Ears */}
              <circle cx="30" cy="34" r="17" fill="url(#tgTeddyFur)" stroke="#FFF" strokeWidth="2" />
              <circle cx="30" cy="34" r="9" fill="url(#tgInnerEar)" />
              <circle cx="90" cy="34" r="17" fill="url(#tgTeddyFur)" stroke="#FFF" strokeWidth="2" />
              <circle cx="90" cy="34" r="9" fill="url(#tgInnerEar)" />

              {/* Head Base */}
              <circle cx="60" cy="62" r="38" fill="url(#tgTeddyFur)" stroke="#FFFFFF" strokeWidth="3" />

              {/* Cute Snout */}
              <ellipse cx="60" cy="72" rx="18" ry="13" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
              <ellipse cx="60" cy="66" rx="7" ry="4.5" fill="#27272A" />

              {/* Eyes with Shiny Sparkle Dots */}
              <circle cx="45" cy="56" r="5" fill="#18181B" />
              <circle cx="43" cy="54" r="1.5" fill="#FFFFFF" />
              <circle cx="75" cy="56" r="5" fill="#18181B" />
              <circle cx="73" cy="54" r="1.5" fill="#FFFFFF" />

              {/* Star Crown Badge */}
              <polygon points="60,14 63,22 71,23 65,28 67,36 60,31 53,36 55,28 49,23 57,22" fill="#FDE047" stroke="#B45309" strokeWidth="1.5" />
            </svg>
            <div className="absolute -bottom-1 w-2/3 h-2 rounded-full bg-amber-950/40 blur-xs" />
          </div>
        );
    }
  };

  if (!showCard) {
    return (
      <div 
        onClick={onClick}
        className={`inline-flex items-center justify-center shrink-0 ${onClick ? 'cursor-pointer active:scale-95' : ''} ${className}`}
      >
        {renderGraphic()}
      </div>
    );
  }

  // Fallback to TelegramGiftCard if showCard is requested
  return (
    <TelegramGiftCard
      gift={{
        id: norm,
        title: getGiftDisplayMeta(norm).title,
        token_price: price || getGiftDisplayMeta(norm).price,
        serialNumber: serialNumber || getGiftDisplayMeta(norm).serial,
        rarity: rarity || getGiftDisplayMeta(norm).rarity,
      }}
      onClick={onClick}
      className={className}
    />
  );
};

/* =========================================================================
   OFFICIAL TELEGRAM GIFTS SQUIRCLE CARD (100% TELEGRAM GIFTS DESIGN)
   ========================================================================= */
interface TelegramGiftCardProps {
  gift: TelegramGiftMetadata;
  actionLabel?: string;
  actionType?: 'buy' | 'sell' | 'view' | 'send';
  canAfford?: boolean;
  onAction?: (gift: TelegramGiftMetadata) => void;
  onClick?: () => void;
  className?: string;
}

export const TelegramGiftCard: React.FC<TelegramGiftCardProps> = ({
  gift,
  actionLabel,
  actionType = 'view',
  canAfford = true,
  onAction,
  onClick,
  className = '',
}) => {
  const { t } = useTranslation();
  const meta = getGiftDisplayMeta(gift.id || gift.title || '');
  const serialTag = gift.serialNumber || meta.serial;
  const rarityTag = gift.rarity || meta.rarity;
  const priceVal = gift.token_price !== undefined ? gift.token_price : meta.price;

  const handleCardClick = (e: React.MouseEvent) => {
    sounds.playClick();
    haptics.selection();
    if (onClick) {
      onClick();
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    haptics.impact('medium');
    if (onAction) {
      onAction(gift);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative rounded-[26px] p-3.5 flex flex-col justify-between items-center text-center cursor-pointer select-none transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] overflow-hidden border border-white/10 hover:border-amber-400/50 shadow-[0_12px_32px_rgba(0,0,0,0.45)] bg-gradient-to-b from-[#182333] via-[#121a27] to-[#0c121c] ${className}`}
    >
      {/* 1. Subtle Telegram Starfield / Luxury Matrix Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.14] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}
      />

      {/* 2. Tailored Radial Spotlight behind Gift Asset */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-2xl pointer-events-none"
        style={{ background: meta.glowColor }}
      />

      {/* 3. Luminous Specular Rim on Top Edge */}
      <div className="absolute top-0 inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

      {/* 4. Top Header: Availability badge & Serial # */}
      <div className="w-full flex items-center justify-between text-[10px] font-bold relative z-10 mb-1">
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 shadow-sm text-[9px] tracking-wide">
          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
          <span>{meta.totalMinted} dan 1</span>
        </span>
        <span className="font-mono text-amber-400/90 font-black text-[11px] tracking-wider drop-shadow-sm">
          {serialTag}
        </span>
      </div>

      {/* 5. Hero 3D Artwork with dynamic hover elevation */}
      <div className="my-2.5 relative z-10 transform transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
        <TelegramGiftIcon giftId={gift.id || gift.title || ''} size={62} />
      </div>

      {/* 6. Title & Rarity info */}
      <div className="w-full relative z-10 space-y-1 mb-2">
        <h4 className="font-extrabold text-xs text-white tracking-tight truncate drop-shadow-sm">
          {gift.title || meta.title}
        </h4>
        <span className="text-[10px] font-bold text-slate-400 block tracking-wide uppercase">
          {rarityTag}
        </span>
      </div>

      {/* 7. Action Button / Price Pill (Telegram Star Style) */}
      <div className="w-full relative z-10 mt-auto">
        {actionType === 'buy' ? (
          <button
            onClick={handleButtonClick}
            disabled={!canAfford}
            className={`w-full py-2.5 px-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center space-x-1.5 shadow-md ${
              canAfford
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 active:scale-95 shadow-amber-500/25'
                : 'bg-white/10 text-slate-400 border border-white/5 cursor-not-allowed'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{t('gifts.stones_price', { count: priceVal })}</span>
          </button>
        ) : actionType === 'sell' ? (
          <button
            onClick={handleButtonClick}
            className="w-full py-2.5 px-3 rounded-2xl font-bold text-xs bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 active:scale-95 transition-all flex items-center justify-center space-x-1 shadow-sm"
          >
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('gifts.sell_stones', { amount: gift.sell_price || meta.sellPrice })}</span>
          </button>
        ) : actionType === 'send' ? (
          <button
            onClick={handleButtonClick}
            className="w-full py-2.5 px-3 rounded-2xl font-bold text-xs bg-purple-500/25 hover:bg-purple-500/35 border border-purple-400/40 text-purple-200 active:scale-95 transition-all flex items-center justify-center space-x-1 shadow-sm"
          >
            <Send className="w-3.5 h-3.5 text-purple-300" />
            <span>{t('gifts.send_action')}</span>
          </button>
        ) : (
          <div className="w-full py-2 px-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white/90 font-bold text-[11px] flex items-center justify-center space-x-1 transition-all">
            <span>{actionLabel || t('gifts.view_action')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   OFFICIAL TELEGRAM GIFTS INSPECTION DETAIL MODAL
   ========================================================================= */
export interface TelegramGiftDetailModalProps {
  gift: TelegramGiftMetadata | null;
  isOpen?: boolean;
  onClose: () => void;
  onBuy?: (gift: TelegramGiftMetadata) => void;
  onSell?: (gift: TelegramGiftMetadata) => void;
  onSend?: (gift: TelegramGiftMetadata) => void;
  canAfford?: boolean;
  userBalance?: number;
  isOwner?: boolean;
}

export const TelegramGiftDetailModal: React.FC<TelegramGiftDetailModalProps> = ({
  gift,
  isOpen = true,
  onClose,
  onBuy,
  onSell,
  onSend,
  canAfford: canAffordProp,
  userBalance,
  isOwner = false,
}) => {
  if (!isOpen || !gift) return null;

  const { t } = useTranslation();
  const meta = getGiftDisplayMeta(gift.id || gift.title || '');
  const serialTag = gift.serialNumber || meta.serial;
  const priceVal = gift.token_price !== undefined ? gift.token_price : meta.price;
  const sellVal = gift.sell_price !== undefined ? gift.sell_price : meta.sellPrice;
  const canAfford = canAffordProp !== undefined ? canAffordProp : (userBalance !== undefined ? userBalance >= priceVal : true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Blurred Scrim Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl animate-fade-in"
        onClick={onClose}
      />

      {/* Telegram Sheet Card Container */}
      <div className="relative z-10 w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-scale-up border border-white/15 bg-gradient-to-b from-[#1b2638] via-[#121c2b] to-[#0d1421] text-white overflow-hidden">
        {/* Ambient Halo Radial Glow */}
        <div 
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: meta.glowColor }}
        />

        {/* Specular Rim */}
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all active:scale-95 z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Tag: Verified Telegram Collectible Gift */}
        <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-sky-400 mb-3 relative z-10">
          <ShieldCheck className="w-4 h-4 text-sky-400 fill-sky-400/20" />
          <span className="tracking-wide">{t('gifts.telegram_collectible')}</span>
        </div>

        {/* Hero 3D Showcase in pedestal */}
        <div className="my-3 flex flex-col items-center justify-center relative z-10">
          <div className="p-3 rounded-full bg-white/5 border border-white/10 shadow-inner">
            <TelegramGiftIcon giftId={gift.id || gift.title || ''} size={104} />
          </div>
          <div className="mt-3 text-center">
            <h3 className="text-xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
              <span>{gift.title || meta.title}</span>
              <span className="text-amber-400 font-mono text-base">{serialTag}</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium block mt-0.5">
              {meta.model} • {meta.totalMinted} nusxa
            </span>
          </div>
        </div>

        {/* Attribute Badges Matrix */}
        <div className="grid grid-cols-2 gap-2 my-4 relative z-10 text-xs">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('gifts.rarity')}</span>
            <span className="font-black text-amber-300 mt-0.5">{meta.rarity}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('gifts.initial_price')}</span>
            <span className="font-mono font-black text-white mt-0.5">{t('gifts.stones_price', { count: priceVal })}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('gifts.season_label')}</span>
            <span className="font-mono font-bold text-slate-300 mt-0.5">2026 Season 1</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('gifts.resale')}</span>
            <span className="font-mono font-black text-emerald-400 mt-0.5">{t('gifts.stones_gain', { count: sellVal })}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 relative z-10 pt-2 border-t border-white/10">
          {!isOwner && onBuy && (
            <button
              disabled={!canAfford}
              onClick={() => {
                onBuy(gift);
                onClose();
              }}
              className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 transition-all shadow-lg ${
                canAfford
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 active:scale-95 shadow-amber-500/30'
                  : 'bg-white/10 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Star className="w-4 h-4 fill-current" />
              <span>{canAfford ? t('gifts.buy_for_amount', { amount: priceVal }) : t('gifts.not_enough_stones')}</span>
            </button>
          )}

          {isOwner && onSend && (
            <button
              onClick={() => {
                onSend(gift);
                onClose();
              }}
              className="w-full py-3.5 rounded-2xl font-black text-xs bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-purple-600/30"
            >
              <Send className="w-4 h-4" />
              <span>{t('gifts.send_to_friend_btn')}</span>
            </button>
          )}

          {isOwner && onSell && gift.can_sell !== false && (
            <button
              onClick={() => {
                onSell(gift);
                onClose();
              }}
              className="w-full py-2.5 rounded-2xl font-bold text-xs bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 active:scale-95 transition-all flex items-center justify-center space-x-1"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{t('gifts.exchange_for_stones', { amount: sellVal })}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-bold text-xs transition-all active:scale-95"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TelegramGiftIcon;
