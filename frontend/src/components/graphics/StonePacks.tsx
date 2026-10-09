import React from 'react';

export const StarterPackIcon: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <polygon points="24,4 40,15 36,36 24,44 12,36 8,15" fill="#FFC83D" stroke="#FFE799" strokeWidth="2" />
    <polygon points="24,4 32,15 24,22 16,15" fill="#FFFFFF" fillOpacity="0.4" />
  </svg>
);

export const PopularPackIcon: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Pile of 3 gems */}
    <polygon points="16,18 28,10 32,24 20,32 10,24" fill="#EAB308" stroke="#FEF08A" strokeWidth="1.5" />
    <polygon points="26,14 40,20 36,36 22,34" fill="#CA8A04" stroke="#FEF08A" strokeWidth="1.5" />
    <polygon points="20,22 34,22 30,42 16,42" fill="#FACC15" stroke="#FFFFFF" strokeWidth="2" />
  </svg>
);

export const ProPackIcon: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Pouch / Bag */}
    <path d="M16 16C16 12 20 8 24 8C28 8 32 12 32 16L38 24C42 30 38 42 24 42C10 42 6 30 10 24L16 16Z" fill="#78350F" stroke="#FDE68A" strokeWidth="2" />
    {/* Pouch Tie Rope */}
    <rect x="14" y="16" width="20" height="4" rx="2" fill="#FBBF24" />
    {/* Glowing Stones spilling out */}
    <polygon points="24,6 30,12 24,16 18,12" fill="#FDE047" stroke="#FFF" strokeWidth="1" />
  </svg>
);

export const MegaPackIcon: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Treasure Chest */}
    <rect x="6" y="22" width="36" height="20" rx="3" fill="#854D0E" stroke="#FEF08A" strokeWidth="2" />
    {/* Chest Lid open */}
    <path d="M4 22C4 16 12 12 24 12C36 12 44 16 44 22H4Z" fill="#A16207" stroke="#FEF08A" strokeWidth="2" />
    {/* Gold trim */}
    <rect x="21" y="24" width="6" height="8" rx="1" fill="#FACC15" stroke="#FFFFFF" strokeWidth="1" />
    {/* Radiating Gems inside */}
    <circle cx="24" cy="18" r="4" fill="#FEF08A" />
  </svg>
);
