import React from 'react';

export type ChatPhraseId = 'luck' | 'great_move' | 'watch_out' | 'gg' | 'rematch_req' | 'omg' | 'i_will_win' | 'you_missed';

export const ChatStickerIcon: React.FC<{ 
  phraseId?: ChatPhraseId; 
  name?: ChatPhraseId | string; 
  size?: number; 
  className?: string 
}> = ({
  phraseId,
  name,
  size = 20,
  className = '',
}) => {
  const id = (phraseId || name || 'luck') as ChatPhraseId;
  switch (id) {
    case 'luck':
      // Four-leaf clover SVG
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 12C10 6 6 6 6 10C6 14 10 12 12 12Z" fill="#22C55E" fillOpacity="0.4" />
          <path d="M12 12C18 10 18 6 14 6C10 6 12 10 12 12Z" fill="#22C55E" fillOpacity="0.4" />
          <path d="M12 12C14 18 18 18 18 14C18 10 14 12 12 12Z" fill="#22C55E" fillOpacity="0.4" />
          <path d="M12 12C6 14 6 18 10 18C14 18 12 14 12 12Z" fill="#22C55E" fillOpacity="0.4" />
          <path d="M12 12V22" stroke="#4ADE80" strokeWidth="2.5" />
        </svg>
      );
    case 'great_move':
      // Clapping hands SVG
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M7 11V5C7 3.5 8.5 2 10 2C11.5 2 13 3.5 13 5V11" fill="#F59E0B" fillOpacity="0.3" />
          <path d="M13 7C13 5.5 14.5 4 16 4C17.5 4 19 5.5 19 7V13" fill="#F59E0B" fillOpacity="0.3" />
          <path d="M4 11C4 16 8 20 13 20H15C18 20 20 18 20 15V13" />
        </svg>
      );
    case 'watch_out':
      // Warning eye / smug mask
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FB7185" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M2 12S6 5 12 5S22 12 22 12S18 19 12 19S2 12 2 12Z" fill="#E11D48" fillOpacity="0.25" />
          <circle cx="12" cy="12" r="3" fill="#FB7185" />
        </svg>
      );
    case 'gg':
      // Handshake / trophy
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M6 9H18V14C18 17 15 20 12 20C9 20 6 17 6 14V9Z" fill="#0284C7" fillOpacity="0.3" />
          <path d="M6 11H3C2.5 11 2 11.5 2 12V13C2 15 4 16 6 16" />
          <path d="M18 11H21C21.5 11 22 11.5 22 12V13C22 15 20 16 18 16" />
        </svg>
      );
    case 'rematch_req':
      // Cycling arrows
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 12A9 9 0 0 1 18.5 5.5L21 8" />
          <polyline points="21 3 21 8 16 8" />
          <path d="M21 12A9 9 0 0 1 5.5 18.5L3 16" />
          <polyline points="3 21 3 16 8 16" />
        </svg>
      );
    case 'omg':
      // Shocked lightning burst
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#F59E0B" fillOpacity="0.4" />
        </svg>
      );
    case 'i_will_win':
      // Power fist / fire
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 2C12 2 18 8 18 14C18 18 15 21 12 21C9 21 6 18 6 14C6 9 10 6 10 4C10.5 7 12 8 12 8C12 8 12 5 12 2Z" fill="#EA580C" fillOpacity="0.4" />
        </svg>
      );
    case 'you_missed':
      // Target crosshair
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="8" fill="#DC2626" fillOpacity="0.2" />
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
          <circle cx="12" cy="12" r="2" fill="#EF4444" />
        </svg>
      );
    default:
      return null;
  }
};
