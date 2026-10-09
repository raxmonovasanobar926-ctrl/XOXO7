export * from './StoneIcon.tsx';
export * from './NeonMarks.tsx';
export * from './RPSGestures.tsx';
export * from './GolemCharacters.tsx';
export * from './PixelPiggy.tsx';
export * from './ResultBadges.tsx';
export * from './AvatarIcons.tsx';
export * from './ChatStickers.tsx';
export * from './StonePacks.tsx';
export * from './TelegramGiftIcon.tsx';

import React from 'react';
import { StoneIcon } from './StoneIcon.tsx';
import { CharacterAvatar } from './AvatarIcons.tsx';
import { GolemAvatar, GolemLevel } from './GolemCharacters.tsx';

// Unified <Stone amount={n} /> component
export const Stone: React.FC<{
  amount?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  label?: string;
  showLabel?: boolean;
  className?: string;
}> = ({ amount, size = 'md', label, showLabel = false, className = '' }) => (
  <span className={`inline-flex items-center space-x-1.5 font-bold ${className}`}>
    <StoneIcon size={size} />
    {amount !== undefined && <span>{amount}</span>}
    {showLabel && label && <span className="text-xs uppercase opacity-80">{label}</span>}
  </span>
);

// Unified <Avatar /> component
export const Avatar: React.FC<{
  id: string;
  size?: number;
  className?: string;
  showBorder?: boolean;
}> = ({ id, size = 48, className = '', showBorder = true }) => (
  <CharacterAvatar avatarId={id} size={size} className={className} showBorder={showBorder} />
);

// Unified <Golem /> component
export const Golem: React.FC<{
  level: GolemLevel;
  size?: number | string;
  className?: string;
  glow?: boolean;
}> = ({ level, size = 64, className = '', glow = true }) => (
  <GolemAvatar level={level} size={size} className={className} glow={glow} />
);
