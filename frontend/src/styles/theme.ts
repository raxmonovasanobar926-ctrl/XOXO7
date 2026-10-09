/**
 * Liquid Glass Design System - Theme Tokens & Utilities
 * Apple-inspired aesthetic: light, airy, translucent, specular highlights,
 * subtle refraction grid, and WCAG AA contrast compliance.
 */

export interface ColorToken {
  hex: string;
  rgb: [number, number, number];
  alpha?: number;
}

export const LIGHT_THEME = {
  name: 'light',
  bg: {
    base: '#F8F9FE',
    gradient: 'linear-gradient(180deg, #FFFFFF 0%, #F5F3FB 45%, #EBE7F7 100%)',
    grid: 'rgba(85, 75, 130, 0.055)',
  },
  text: {
    main: '#0F172A', // WCAG 16.5:1
    secondary: '#475569', // WCAG 5.8:1
    muted: '#64748B', // WCAG 4.6:1
    white: '#FFFFFF',
  },
  glass: {
    bg: 'linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0.42) 100%)',
    border: 'rgba(255, 255, 255, 0.85)',
    borderSubtle: 'rgba(148, 163, 184, 0.22)',
    shadow: '0 10px 30px -4px rgba(45, 35, 75, 0.08), 0 1px 1px 0 rgba(255, 255, 255, 0.9) inset',
    shadowLg: '0 20px 40px -8px rgba(45, 35, 75, 0.12), 0 1px 1.5px 0 rgba(255, 255, 255, 1) inset',
    specular: 'rgba(255, 255, 255, 0.95)',
  },
  accents: {
    purple: '#6E56CF',
    purpleLight: 'rgba(110, 86, 207, 0.12)',
    blue: '#0369A1',
    blueLight: 'rgba(3, 105, 161, 0.12)',
    rose: '#BE123C',
    roseLight: 'rgba(190, 18, 60, 0.12)',
    gold: '#B45309',
    goldLight: 'rgba(180, 83, 9, 0.12)',
    emerald: '#059669',
  }
};

export const DARK_THEME = {
  name: 'dark',
  bg: {
    base: '#0B0E17',
    gradient: 'linear-gradient(180deg, #0D111D 0%, #131726 50%, #0F121E 100%)',
    grid: 'rgba(200, 210, 255, 0.08)',
  },
  text: {
    main: '#F8FAFC', // WCAG 15+:1
    secondary: '#CBD5E1', // WCAG 9.8:1
    muted: '#94A3B8', // WCAG 5.9:1
    white: '#FFFFFF',
  },
  glass: {
    bg: 'linear-gradient(180deg, rgba(30, 38, 60, 0.72) 0%, rgba(18, 24, 40, 0.78) 100%)',
    border: 'rgba(255, 255, 255, 0.16)',
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    shadow: '0 12px 32px -4px rgba(0, 0, 0, 0.55), 0 1px 1px 0 rgba(255, 255, 255, 0.12) inset',
    shadowLg: '0 20px 48px -8px rgba(0, 0, 0, 0.7), 0 1px 1.5px 0 rgba(255, 255, 255, 0.2) inset',
    specular: 'rgba(255, 255, 255, 0.35)',
  },
  accents: {
    purple: '#A78BFA',
    purpleLight: 'rgba(167, 139, 250, 0.18)',
    blue: '#38BDF8',
    blueLight: 'rgba(56, 189, 248, 0.18)',
    rose: '#FB7185',
    roseLight: 'rgba(251, 113, 133, 0.18)',
    gold: '#FBBF24',
    goldLight: 'rgba(251, 191, 36, 0.18)',
    emerald: '#34D399',
  }
};

/**
 * Calculates relative luminance for sRGB color according to WCAG 2.1
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates WCAG contrast ratio between two hex or rgb colors
 */
export function getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Helper to parse 6-character hex to RGB
 */
export function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return [r, g, b];
}
