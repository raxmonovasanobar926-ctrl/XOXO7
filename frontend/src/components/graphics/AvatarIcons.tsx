import React from 'react';

export interface AvatarItem {
  id: string;
  nameKey: string;
  tagline: string;
  bgGradient: string;
  bgColor: string;
  borderGlow: string;
}

export const AVATAR_LIST: AvatarItem[] = [
  {
    id: 'avatar_1',
    nameKey: 'Broco',
    tagline: 'Eat me!',
    bgGradient: 'from-[#3FA796] to-[#1F7365]',
    bgColor: '#3FA796',
    borderGlow: '#4ADE80',
  },
  {
    id: 'avatar_2',
    nameKey: 'Tonot',
    tagline: 'The earth is flat',
    bgGradient: 'from-[#0B2545] to-[#041122]',
    bgColor: '#0B2545',
    borderGlow: '#38BDF8',
  },
  {
    id: 'avatar_3',
    nameKey: 'Bochill',
    tagline: 'Lil Skater Kid',
    bgGradient: 'from-[#FFFFFF] to-[#E2E8F0]',
    bgColor: '#F1F5F9',
    borderGlow: '#0EA5E9',
  },
  {
    id: 'avatar_4',
    nameKey: 'Bredo',
    tagline: 'Breakfaaast!',
    bgGradient: 'from-[#0284C7] to-[#0369A1]',
    bgColor: '#0284C7',
    borderGlow: '#60A5FA',
  },
  {
    id: 'avatar_5',
    nameKey: 'Kocheng',
    tagline: 'Ready to scratch',
    bgGradient: 'from-[#E0533C] to-[#B91C1C]',
    bgColor: '#DC4E38',
    borderGlow: '#F87171',
  },
  {
    id: 'avatar_6',
    nameKey: 'Yo',
    tagline: 'Everybody sing!',
    bgGradient: 'from-[#64748B] to-[#334155]',
    bgColor: '#475569',
    borderGlow: '#FB7185',
  },
  {
    id: 'avatar_7',
    nameKey: 'Ded',
    tagline: 'The bunny maker',
    bgGradient: 'from-[#E29E75] to-[#C2784D]',
    bgColor: '#DE9B72',
    borderGlow: '#F59E0B',
  },
  {
    id: 'avatar_8',
    nameKey: 'Wuhu',
    tagline: 'Who?',
    bgGradient: 'from-[#5C2040] to-[#3B0D28]',
    bgColor: '#581C3F',
    borderGlow: '#E879F9',
  },
  {
    id: 'avatar_9',
    nameKey: 'Drino',
    tagline: 'Work like hell',
    bgGradient: 'from-[#EAA023] to-[#B45309]',
    bgColor: '#EA9E1A',
    borderGlow: '#FBBF24',
  },
];

const ALIAS_MAP: Record<string, string> = {
  astronaut: 'avatar_2',
  ninja: 'avatar_1',
  'cyber-bot': 'avatar_3',
  fox: 'avatar_5',
  panda: 'avatar_8',
  wizard: 'avatar_7',
  viking: 'avatar_6',
  'cyber-cat': 'avatar_5',
  dragon: 'avatar_9',
  avatar_10: 'avatar_1',
  avatar_11: 'avatar_2',
  avatar_12: 'avatar_3',
  avatar_13: 'avatar_4',
  avatar_14: 'avatar_5',
  avatar_15: 'avatar_6',
  avatar_16: 'avatar_7',
};

export function resolveAvatarId(id: string): string {
  if (!id) return 'avatar_1';
  if (AVATAR_LIST.some((a) => a.id === id)) return id;
  const mapped = ALIAS_MAP[id.toLowerCase()];
  return mapped || 'avatar_1';
}

/**
 * 1. BROCO (Afro Cloud Broccoli Dude with Retro Headband)
 */
export const BrocoSVG: React.FC<{ size?: number }> = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Background */}
    <rect width="100" height="100" rx="20" fill="#3EA394" />
    
    {/* Retro Cone & Star Doodles */}
    <path d="M 82 22 L 88 34 L 76 34 Z" fill="none" stroke="#DDF05B" strokeWidth="2" strokeLinejoin="round" />
    <path d="M 74 34 L 90 34" stroke="#DDF05B" strokeWidth="2" strokeLinecap="round" />
    <path d="M 18 20 L 22 24 M 22 20 L 18 24" stroke="#DDF05B" strokeWidth="2" strokeLinecap="round" />

    {/* Broccoli Afro Cloud Puff (Back & Main) */}
    <g stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
      <path
        d="M 28 50 C 18 45 15 32 24 24 C 28 16 40 14 48 18 C 54 13 66 14 72 20 C 82 18 88 28 84 38 C 90 46 86 58 76 60 C 72 65 62 67 52 65 C 40 67 32 64 28 50 Z"
        fill="#D7EE54"
      />
      {/* Cloud lobe internal texture lines */}
      <path d="M 27 34 C 33 30 38 34 38 38" fill="none" />
      <path d="M 45 22 C 50 18 55 22 55 26" fill="none" />
      <path d="M 68 25 C 74 24 77 30 75 35" fill="none" />
      <path d="M 74 48 C 78 45 81 50 78 54" fill="none" />
      <path d="M 25 44 C 29 42 32 46 30 50" fill="none" />
    </g>

    {/* Peeking Face */}
    <rect x="34" y="44" width="32" height="24" rx="8" fill="#FFD5B8" stroke="#1E293B" strokeWidth="2.5" />

    {/* Headband */}
    <rect x="32" y="42" width="36" height="8" rx="3" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.2" />
    <rect x="33" y="45" width="34" height="2.5" fill="#EF4444" />

    {/* Eyes & Smile */}
    <path d="M 40 55 Q 43 52 46 55" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    <path d="M 54 55 Q 57 52 60 55" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    {/* Chill grin */}
    <path d="M 47 61 Q 50 64 53 61" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    {/* Cute blush */}
    <circle cx="39" cy="59" r="2" fill="#F87171" opacity="0.6" />
    <circle cx="61" cy="59" r="2" fill="#F87171" opacity="0.6" />

    {/* Body / Shirt */}
    <path d="M 32 68 L 32 88 L 68 88 L 68 68 Z" fill="#1F7365" stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round" />
    {/* Collar */}
    <path d="M 43 68 L 50 75 L 57 68" stroke="#1E293B" strokeWidth="2.2" fill="#3EA394" />
    {/* Sneaker/Leg hints */}
    <rect x="38" y="88" width="10" height="12" fill="#1E293B" rx="3" />
    <rect x="52" y="88" width="10" height="12" fill="#1E293B" rx="3" />
  </svg>
);

/**
 * 2. TONOT (Cute Space Astronaut with Moon Balloon)
 */
export const TonotSVG: React.FC<{ size?: number }> = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Cosmic Navy Background */}
    <rect width="100" height="100" rx="20" fill="#0D223A" />

    {/* Stars and Orbit lines */}
    <path d="M 16 28 L 18 32 L 22 34 L 18 36 L 16 40 L 14 36 L 10 34 L 14 32 Z" fill="#FACC15" />
    <circle cx="86" cy="72" r="1.5" fill="#38BDF8" />
    <circle cx="20" cy="80" r="1.5" fill="#FFFFFF" />
    <path d="M 12 60 Q 25 50 35 62" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />

    {/* Moon Balloon on String */}
    <path d="M 76 28 Q 72 45 62 55" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <g transform="translate(68, 12)">
      <circle cx="12" cy="12" r="11" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2.2" />
      {/* Craters */}
      <circle cx="8" cy="8" r="2.5" fill="#CBD5E1" stroke="#0F172A" strokeWidth="1.2" />
      <circle cx="16" cy="14" r="1.8" fill="#CBD5E1" stroke="#0F172A" strokeWidth="1.2" />
      <circle cx="10" cy="17" r="1.2" fill="#CBD5E1" stroke="#0F172A" strokeWidth="1" />
    </g>

    {/* Backpack */}
    <rect x="23" y="44" width="12" height="28" rx="5" fill="#0284C7" stroke="#0F172A" strokeWidth="2.5" />

    {/* Astronaut Helmet */}
    <g stroke="#0F172A" strokeWidth="2.5" strokeLinejoin="round">
      <circle cx="48" cy="38" r="22" fill="#F8FAFC" />
      {/* Visor */}
      <ellipse cx="49" cy="39" rx="15" ry="12" fill="#0F172A" />
      {/* Neon Smile Reflection on Visor */}
      <path d="M 40 40 Q 49 48 58 40" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="43" cy="35" r="1.5" fill="#38BDF8" />
      <circle cx="55" cy="35" r="1.5" fill="#38BDF8" />
      {/* Helmet side antennas */}
      <rect x="24" y="34" width="3" height="8" rx="1.5" fill="#EF4444" />
      <rect x="69" y="34" width="3" height="8" rx="1.5" fill="#EF4444" />
    </g>

    {/* Suit Torso */}
    <g stroke="#0F172A" strokeWidth="2.5" strokeLinejoin="round">
      <path d="M 32 58 L 32 82 Q 48 86 64 82 L 64 58 Z" fill="#F8FAFC" />
      {/* Red collar / shoulder pads */}
      <path d="M 32 60 L 40 68 L 56 68 L 64 60" fill="#EF4444" />
      {/* Life support chest box */}
      <rect x="42" y="70" width="12" height="8" rx="2" fill="#0284C7" />
      <circle cx="45" cy="74" r="1.5" fill="#38BDF8" />
      <circle cx="51" cy="74" r="1.5" fill="#FACC15" />
    </g>

    {/* Walking Legs */}
    <path d="M 38 82 L 34 94 L 44 94" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 58 82 L 62 94 L 72 94" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * 3. BOCHILL (The Lil Skater Kid with Backwards Cap)
 */
export const BochillSVG: React.FC<{ size?: number }> = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Streetwear Off-White Background */}
    <rect width="100" height="100" rx="20" fill="#F1F5F9" />

    {/* Speed Lines and Skater Doodles */}
    <path d="M 12 32 L 24 32 M 10 37 L 20 37" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M 78 24 L 88 18 M 82 28 L 92 24" stroke="#0EA5E9" strokeWidth="2.2" strokeLinecap="round" />

    {/* Spiky chartreuse bangs */}
    <path d="M 32 44 L 28 50 L 36 48 L 32 54 L 40 50" fill="#A3E635" stroke="#1E293B" strokeWidth="2" strokeLinejoin="round" />

    {/* Face */}
    <g stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round">
      <circle cx="50" cy="48" r="18" fill="#FCD34D" />
      {/* Cheek Band-Aid */}
      <rect x="36" y="52" width="7" height="3.5" rx="1.5" fill="#F472B6" transform="rotate(-15 36 52)" />
      {/* Anime Eye (Left) & Wink (Right) */}
      <ellipse cx="44" cy="46" rx="3.5" ry="5" fill="#1E293B" />
      <circle cx="43" cy="44" r="1.2" fill="#FFFFFF" />
      <path d="M 54 44 L 60 47 L 54 50" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* Smirk & Little Tongue */}
      <path d="M 46 54 Q 52 58 58 53" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
      <path d="M 50 56 Q 52 60 55 57" fill="#EF4444" />
    </g>

    {/* Backwards Snapback Cap */}
    <g stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round">
      {/* Cap dome */}
      <path d="M 32 44 C 32 28 68 28 68 44 Z" fill="#0EA5E9" />
      {/* Snapback opening & strap */}
      <path d="M 44 42 C 47 38 53 38 56 42 Z" fill="#F1F5F9" />
      <path d="M 44 42 L 56 42" stroke="#1E293B" strokeWidth="2" />
      {/* Green Bill turned to the back */}
      <path d="M 64 38 Q 78 34 82 42 Q 74 46 64 43 Z" fill="#84CC16" />
      {/* Cap button */}
      <circle cx="50" cy="28" r="2.5" fill="#84CC16" />
    </g>

    {/* Torso / Skater Jersey */}
    <g stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round">
      <path d="M 36 64 L 30 76 L 70 76 L 64 64 Z" fill="#EF4444" />
      <rect x="42" y="64" width="16" height="12" fill="#FFFFFF" />
      {/* Arms balanced */}
      <path d="M 30 68 L 18 64" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 70 68 L 82 64" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
    </g>

    {/* Skateboard at Bottom with Duck */}
    <g stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round">
      {/* Deck */}
      <rect x="22" y="80" width="56" height="6" rx="3" fill="#1E293B" />
      {/* Wheels */}
      <circle cx="32" cy="89" r="4.5" fill="#EF4444" />
      <circle cx="68" cy="89" r="4.5" fill="#EF4444" />
      {/* Cute yellow duck sticker */}
      <ellipse cx="50" cy="77" rx="4" ry="3" fill="#FACC15" />
      <circle cx="52" cy="74" r="2.5" fill="#FACC15" />
      <path d="M 54 74 L 57 75 L 54 76 Z" fill="#F97316" />
    </g>
  </svg>
);

/**
 * 4. BREDO (Breakfaaast! Adorable Toast Bread with Boots & Knife)
 */
export const BredoSVG: React.FC<{ size?: number }> = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Ocean Sky Blue Background */}
    <rect width="100" height="100" rx="20" fill="#0284C7" />

    {/* Butter jar & sparkles doodle */}
    <path d="M 76 56 L 86 56 L 84 68 L 78 68 Z" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
    <path d="M 78 53 L 84 53" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    <path d="M 18 30 L 22 34 M 22 30 L 18 34" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M 78 26 L 82 30 M 82 26 L 78 30" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />

    {/* Toast Slice Body */}
    <g stroke="#1E293B" strokeWidth="2.6" strokeLinejoin="round">
      {/* Outer Crust */}
      <path
        d="M 28 36 C 24 24 38 18 46 22 C 50 18 64 24 60 36 C 63 46 62 62 59 70 C 49 72 39 72 29 70 C 26 62 25 46 28 36 Z"
        fill="#C2784D"
      />
      {/* Soft Bread Center */}
      <path
        d="M 31 38 C 28 28 39 23 46 26 C 49 23 60 28 57 38 C 60 46 59 59 56 66 C 48 68 40 68 32 66 C 29 59 28 46 31 38 Z"
        fill="#FED7AA"
      />
    </g>

    {/* Big Kawaii Anime Eyes */}
    <g>
      {/* Left Eye */}
      <ellipse cx="38" cy="45" rx="5" ry="6.5" fill="#1E293B" />
      <circle cx="36.5" cy="43" r="2" fill="#FFFFFF" />
      <circle cx="39.5" cy="47" r="1" fill="#FFFFFF" />

      {/* Right Eye */}
      <ellipse cx="50" cy="45" rx="5" ry="6.5" fill="#1E293B" />
      <circle cx="48.5" cy="43" r="2" fill="#FFFFFF" />
      <circle cx="51.5" cy="47" r="1" fill="#FFFFFF" />

      {/* Sweet cute mouth */}
      <path d="M 43 54 Q 44.5 56 46 54" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Pink cheeks */}
      <circle cx="33" cy="51" r="2.5" fill="#F472B6" opacity="0.7" />
      <circle cx="55" cy="51" r="2.5" fill="#F472B6" opacity="0.7" />
    </g>

    {/* Butter Knife in Hand */}
    <g stroke="#1E293B" strokeWidth="2.2" strokeLinejoin="round">
      <path d="M 60 52 L 72 44 L 75 47 L 62 55 Z" fill="#E2E8F0" />
      {/* Pat of butter */}
      <circle cx="70" cy="44" r="2.5" fill="#FACC15" />
    </g>

    {/* Stick Legs & Cute Blue Boots */}
    <g stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M 37 70 L 37 80" />
      <path d="M 51 70 L 51 80" />
      {/* Boots */}
      <path d="M 33 80 L 40 80 L 41 87 L 31 87 Z" fill="#38BDF8" />
      <path d="M 47 80 L 54 80 L 55 87 L 45 87 Z" fill="#38BDF8" />
    </g>
  </svg>
);

/**
 * 5. KOCHENG (Chaotic Cute Blue Cat in a Box)
 */
export const KochengSVG: React.FC<{ size?: number }> = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Poppy Coral-Red Background */}
    <rect width="100" height="100" rx="20" fill="#DC4E38" />

    {/* Lightning Bolts & Scratch Doodles */}
    <path d="M 16 32 L 22 26 L 19 38 L 26 30" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M 76 28 L 84 22 L 80 34 L 88 26" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M 48 14 L 52 20 L 50 14" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Mischievous Blue Cat Head (Behind Front Flap) */}
    <g stroke="#1E293B" strokeWidth="2.6" strokeLinejoin="round">
      {/* Cat Head Base */}
      <path d="M 30 50 C 30 32 70 32 70 50 Z" fill="#0284C7" />
      {/* Pointy Left Ear */}
      <path d="M 32 38 L 30 22 L 42 32 Z" fill="#0284C7" />
      <path d="M 33 34 L 32 25 L 39 31 Z" fill="#F472B6" />
      {/* Pointy Right Ear */}
      <path d="M 68 38 L 70 22 L 58 32 Z" fill="#0284C7" />
      <path d="M 67 34 L 68 25 L 61 31 Z" fill="#F472B6" />
    </g>

    {/* 4 Funny Chaotic Eyes peering out */}
    <g stroke="#1E293B" strokeWidth="2">
      {/* Eye 1 */}
      <circle cx="38" cy="38" r="4.5" fill="#FFFFFF" />
      <circle cx="39" cy="37" r="2" fill="#1E293B" />
      {/* Eye 2 */}
      <circle cx="48" cy="35" r="4" fill="#FFFFFF" />
      <circle cx="47" cy="34" r="1.8" fill="#1E293B" />
      {/* Eye 3 */}
      <circle cx="56" cy="37" r="4.2" fill="#FFFFFF" />
      <circle cx="57" cy="38" r="1.8" fill="#1E293B" />
      {/* Eye 4 */}
      <circle cx="64" cy="40" r="3.8" fill="#FFFFFF" />
      <circle cx="63" cy="41" r="1.8" fill="#1E293B" />
    </g>

    {/* Whiskers & Little Nose */}
    <path d="M 49 43 L 51 43 L 50 45 Z" fill="#F472B6" />
    <path d="M 28 43 L 18 41 M 28 46 L 16 46" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    <path d="M 72 43 L 82 41 M 72 46 L 84 46" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />

    {/* Corrugated Cardboard Box Body */}
    <g stroke="#1E293B" strokeWidth="2.6" strokeLinejoin="round">
      {/* Box Front Face */}
      <rect x="24" y="48" width="52" height="38" rx="4" fill="#D97706" />
      {/* Left Folded Flap */}
      <path d="M 24 48 L 14 38 L 24 42 Z" fill="#B45309" />
      {/* Right Folded Flap */}
      <path d="M 76 48 L 86 38 L 76 42 Z" fill="#B45309" />
      {/* Tape Across Box */}
      <rect x="46" y="48" width="8" height="38" fill="#FDE68A" opacity="0.8" />
      {/* "ADOPT ME" Barcode / Stamp */}
      <rect x="28" y="66" width="14" height="12" fill="#FEF3C7" />
      <path d="M 31 70 L 31 76 M 34 70 L 34 76 M 37 70 L 37 76 M 39 70 L 39 76" stroke="#1E293B" strokeWidth="1.5" />
    </g>
  </svg>
);

/**
 * 6. YO (Rock & Roll Singing Mouth Creature with Mic)
 */
export const YoSVG: React.FC<{ size?: number }> = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Cool Slate Grey Background */}
    <rect width="100" height="100" rx="20" fill="#475569" />

    {/* Soundburst & Musical Doodles */}
    <path d="M 18 24 L 26 28 M 16 32 L 22 34" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 78 20 L 86 16 M 84 26 L 90 24" stroke="#A3E635" strokeWidth="2.5" strokeLinecap="round" />
    {/* Rock hand silhouette */}
    <path d="M 20 54 L 20 46 M 26 54 L 26 46 M 16 54 L 30 54" stroke="#A3E635" strokeWidth="2" strokeLinecap="round" />

    {/* Red Singing Mouth Body */}
    <g stroke="#1E293B" strokeWidth="2.8" strokeLinejoin="round">
      <path
        d="M 32 30 C 20 44 22 72 38 78 C 54 84 76 76 74 54 C 72 34 50 20 32 30 Z"
        fill="#E11D48"
      />
    </g>

    {/* Giant Singing Mouth Cavity */}
    <g stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round">
      <path d="M 40 44 C 44 38 64 42 66 54 C 68 66 48 72 40 64 C 36 60 36 50 40 44 Z" fill="#881337" />
      {/* Pearly White Cartoon Teeth */}
      <rect x="46" y="42" width="6" height="4" rx="1.5" fill="#FFFFFF" />
      <rect x="53" y="43" width="6" height="4" rx="1.5" fill="#FFFFFF" />
      {/* Pink Bouncing Tongue */}
      <path d="M 46 62 C 50 56 60 58 58 64 Z" fill="#FB7185" />
    </g>

    {/* Expressive Eye on Top */}
    <g stroke="#1E293B" strokeWidth="2.2">
      <circle cx="48" cy="30" r="7" fill="#FFFFFF" />
      <circle cx="50" cy="29" r="3.5" fill="#1E293B" />
      <circle cx="51" cy="28" r="1.2" fill="#FFFFFF" />
    </g>

    {/* Vintage Stage Microphone in Hand */}
    <g stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round">
      {/* Mic handle */}
      <path d="M 68 56 L 78 72" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
      {/* Metallic mic head */}
      <rect x="62" y="46" width="10" height="14" rx="5" fill="#CBD5E1" />
      {/* Mesh lines */}
      <path d="M 62 53 L 72 53" stroke="#1E293B" strokeWidth="1.5" />
      <path d="M 67 46 L 67 60" stroke="#1E293B" strokeWidth="1.5" />
    </g>

    {/* Sound waves emitting from mic */}
    <path d="M 76 46 Q 82 50 78 58" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M 80 43 Q 88 50 82 62" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

/**
 * 7. DED (The Magician Duck with Bunny-Eared Top Hat)
 */
export const DedSVG: React.FC<{ size?: number }> = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Warm Sandy Peach Terracotta Background */}
    <rect width="100" height="100" rx="20" fill="#DE9B72" />

    {/* Flying Cards Doodle */}
    <g transform="translate(14, 62) rotate(-20)">
      <rect width="12" height="16" rx="2" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.8" />
      <path d="M 6 6 L 8 9 L 4 9 Z" fill="#EF4444" />
    </g>
    <g transform="translate(74, 68) rotate(15)">
      <rect width="12" height="16" rx="2" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.8" />
      <path d="M 6 10 L 4 7 L 8 7 Z" fill="#1E293B" />
    </g>

    {/* Bunny Ears sticking out from hat */}
    <g stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round">
      {/* Left Ear */}
      <path d="M 40 28 C 36 12 44 10 46 26 Z" fill="#FFFFFF" />
      <path d="M 42 24 C 40 16 43 14 44 24 Z" fill="#FBCFE8" />
      {/* Right Ear */}
      <path d="M 54 28 C 56 10 64 12 60 26 Z" fill="#FFFFFF" />
      <path d="M 56 24 C 57 14 60 16 58 24 Z" fill="#FBCFE8" />
    </g>

    {/* Magician Top Hat */}
    <g stroke="#1E293B" strokeWidth="2.6" strokeLinejoin="round">
      {/* Hat Cylinder */}
      <path d="M 36 28 L 34 52 L 66 52 L 64 28 Z" fill="#1E293B" />
      {/* Red Satin Ribbon */}
      <rect x="34.5" y="44" width="31" height="6" fill="#DC2626" />
      {/* Hat Brim */}
      <ellipse cx="50" cy="52" rx="22" ry="5.5" fill="#1E293B" />
    </g>

    {/* Duck Face & Bill under hat */}
    <g stroke="#1E293B" strokeWidth="2.6" strokeLinejoin="round">
      {/* Head */}
      <ellipse cx="50" cy="58" rx="14" ry="10" fill="#1E293B" />
      {/* Cheeky Eyes */}
      <circle cx="44" cy="56" r="2.5" fill="#FFFFFF" />
      <circle cx="45" cy="56" r="1.2" fill="#1E293B" />
      <circle cx="56" cy="56" r="2.5" fill="#FFFFFF" />
      <circle cx="55" cy="56" r="1.2" fill="#1E293B" />
      {/* Big Golden Yellow Duck Bill */}
      <path d="M 40 60 C 40 56 60 56 60 60 C 62 68 38 68 40 60 Z" fill="#F59E0B" />
      <path d="M 44 62 L 56 62" stroke="#1E293B" strokeWidth="1.8" />
    </g>

    {/* Magic Wand & Spark */}
    <g stroke="#1E293B" strokeWidth="2.2" strokeLinejoin="round">
      <path d="M 68 56 L 82 46" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
      <path d="M 80 47 L 83 45" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      {/* Gold star spark */}
      <path d="M 85 41 L 86 44 L 89 45 L 86 46 L 85 49 L 84 46 L 81 45 L 84 44 Z" fill="#FACC15" />
    </g>

    {/* Legs */}
    <path d="M 44 72 L 40 84 L 34 84" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 56 72 L 60 84 L 66 84" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * 8. WUHU (The Sleepy Round Midnight Owl on Branch)
 */
export const WuhuSVG: React.FC<{ size?: number }> = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Deep Velvety Plum Violet Background */}
    <rect width="100" height="100" rx="20" fill="#581C3F" />

    {/* Golden Crescent Moon & Night Doodles */}
    <path
      d="M 80 20 C 76 22 74 28 78 34 C 72 32 70 24 76 18 Z"
      fill="#FACC15"
    />
    <circle cx="20" cy="30" r="1.5" fill="#FDE047" />
    <circle cx="28" cy="22" r="1.2" fill="#FDE047" />
    <circle cx="82" cy="50" r="1.5" fill="#FDE047" />

    {/* Owl Body (Round Navy Blue) */}
    <g stroke="#1E293B" strokeWidth="2.6" strokeLinejoin="round">
      <ellipse cx="50" cy="52" rx="22" ry="24" fill="#1E3A8A" />
      {/* Wing */}
      <path d="M 30 50 C 26 62 36 72 44 72 Z" fill="#172554" />
      {/* Fluffy Tail */}
      <path d="M 68 62 C 76 66 74 74 68 72 Z" fill="#F8FAFC" />
    </g>

    {/* Cozy Cloud Ruff / Neck Feathers */}
    <g stroke="#1E293B" strokeWidth="2.2" strokeLinejoin="round">
      <path
        d="M 34 46 C 30 40 40 34 44 38 C 48 32 58 34 60 40 C 66 38 72 46 66 52 C 60 56 40 56 34 46 Z"
        fill="#FEF08A"
      />
    </g>

    {/* Owl Face & Sleepy Closed Eyelids */}
    <g stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round">
      {/* Big Eye Discs */}
      <circle cx="42" cy="45" r="7" fill="#F8FAFC" />
      <circle cx="56" cy="45" r="7" fill="#F8FAFC" />

      {/* Serene Crescent Eyelids (Sleepy / Resting) */}
      <path d="M 38 46 Q 42 49 46 46" stroke="#1E293B" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M 52 46 Q 56 49 60 46" stroke="#1E293B" strokeWidth="2.4" strokeLinecap="round" fill="none" />

      {/* Curved Golden Beak */}
      <path d="M 47 48 L 51 48 L 49 55 Z" fill="#F59E0B" />
    </g>

    {/* Rustic Tree Branch & Fresh Leaf Sprout */}
    <g stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 18 78 Q 48 76 84 80" stroke="#78350F" strokeWidth="5" />
      {/* Branch twig */}
      <path d="M 68 78 L 76 72" stroke="#78350F" strokeWidth="3" />
      {/* Green leaf sprout */}
      <path d="M 76 72 C 80 66 84 70 76 72 Z" fill="#4ADE80" stroke="#1E293B" strokeWidth="1.8" />
      {/* Owl claws holding branch */}
      <circle cx="44" cy="76" r="2.5" fill="#F59E0B" />
      <circle cx="54" cy="76" r="2.5" fill="#F59E0B" />
    </g>
  </svg>
);

/**
 * 9. DRINO (Work Like Hell - Coder Baby Dragon with Headphones & Laptop)
 */
export const DrinoSVG: React.FC<{ size?: number }> = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Rich Golden Amber Background */}
    <rect width="100" height="100" rx="20" fill="#EA9E1A" />

    {/* Coffee Mug & Code Lightning Doodles */}
    <path d="M 18 28 L 24 22 L 20 34 L 28 26" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M 78 22 L 86 16 M 82 26 L 88 22" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
    {/* Coffee Mug */}
    <rect x="76" y="66" width="10" height="12" rx="2" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.8" />
    <path d="M 86 69 Q 90 72 86 75" stroke="#1E293B" strokeWidth="1.8" fill="none" />
    <path d="M 79 62 Q 81 59 79 56" stroke="#EF4444" strokeWidth="1.2" fill="none" />

    {/* Little Dragon Wings & Purple Spikes */}
    <g stroke="#1E293B" strokeWidth="2.2" strokeLinejoin="round">
      {/* Left Wing */}
      <path d="M 28 46 C 18 42 16 54 26 56 Z" fill="#0284C7" />
      {/* Purple Spikes on back */}
      <path d="M 32 30 L 26 26 L 34 36 Z" fill="#9333EA" />
      <path d="M 36 24 L 32 18 L 42 26 Z" fill="#9333EA" />
    </g>

    {/* Cute Baby Dragon Head & Body */}
    <g stroke="#1E293B" strokeWidth="2.6" strokeLinejoin="round">
      <path
        d="M 34 40 C 34 26 66 26 66 40 C 68 54 64 68 50 68 C 36 68 34 54 34 40 Z"
        fill="#06B6D4"
      />
      {/* Chubby Dragon Snout */}
      <ellipse cx="50" cy="48" rx="14" ry="8" fill="#22D3EE" />
      {/* Nostril dots */}
      <circle cx="47" cy="46" r="1.2" fill="#1E293B" />
      <circle cx="53" cy="46" r="1.2" fill="#1E293B" />

      {/* Focused Determined Eyes */}
      <ellipse cx="43" cy="38" rx="4.5" ry="5.5" fill="#FFFFFF" />
      <circle cx="44" cy="38" r="2.5" fill="#1E293B" />
      <circle cx="45" cy="37" r="1" fill="#FFFFFF" />

      <ellipse cx="57" cy="38" rx="4.5" ry="5.5" fill="#FFFFFF" />
      <circle cx="56" cy="38" r="2.5" fill="#1E293B" />
      <circle cx="55" cy="37" r="1" fill="#FFFFFF" />
    </g>

    {/* Chunky Gaming Headphones */}
    <g stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round">
      {/* Headband arch */}
      <path d="M 28 42 C 28 20 72 20 72 42" stroke="#1E293B" strokeWidth="4" fill="none" />
      {/* Glowing Magenta Earcups */}
      <rect x="24" y="36" width="7" height="14" rx="3.5" fill="#EC4899" />
      <rect x="69" y="36" width="7" height="14" rx="3.5" fill="#EC4899" />
    </g>

    {/* Modern Laptop with Glowing Screen */}
    <g stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round">
      {/* Screen open */}
      <path d="M 40 56 L 62 56 L 66 70 L 36 70 Z" fill="#F8FAFC" />
      {/* Glowing code on screen */}
      <path d="M 44 62 L 48 64 L 44 66" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="50" y1="64" x2="58" y2="64" stroke="#FACC15" strokeWidth="1.5" strokeLinecap="round" />
      {/* Laptop Keyboard Base & Hands */}
      <path d="M 32 72 L 68 72 L 72 78 L 28 78 Z" fill="#E2E8F0" />
      {/* Dragon hands on keyboard */}
      <circle cx="38" cy="71" r="3" fill="#22D3EE" />
      <circle cx="62" cy="71" r="3" fill="#22D3EE" />
    </g>
  </svg>
);

/**
 * Universal CharacterAvatar Component
 */
export const CharacterAvatar: React.FC<{
  avatarId: string;
  size?: number;
  className?: string;
  showBorder?: boolean;
}> = ({ avatarId, size = 48, className = '', showBorder = true }) => {
  const isCustomImage =
    avatarId &&
    (avatarId.startsWith('data:') ||
      avatarId.startsWith('http://') ||
      avatarId.startsWith('https://'));

  const canonicalId = resolveAvatarId(avatarId);
  const item = AVATAR_LIST.find((a) => a.id === canonicalId) || AVATAR_LIST[0];

  if (isCustomImage) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderColor: showBorder ? '#00F0FF' : 'transparent',
        }}
        className={`rounded-2xl bg-dark-800 flex items-center justify-center relative overflow-hidden select-none border-2 shadow-md ${className}`}
      >
        <img
          src={avatarId}
          alt="Avatar"
          className="w-full h-full object-cover rounded-xl"
          onError={(e) => {
            (e.target as any).src = 'https://via.placeholder.com/80?text=XO';
          }}
        />
      </div>
    );
  }

  const renderCharacterSVG = () => {
    switch (canonicalId) {
      case 'avatar_1':
        return <BrocoSVG size={size} />;
      case 'avatar_2':
        return <TonotSVG size={size} />;
      case 'avatar_3':
        return <BochillSVG size={size} />;
      case 'avatar_4':
        return <BredoSVG size={size} />;
      case 'avatar_5':
        return <KochengSVG size={size} />;
      case 'avatar_6':
        return <YoSVG size={size} />;
      case 'avatar_7':
        return <DedSVG size={size} />;
      case 'avatar_8':
        return <WuhuSVG size={size} />;
      case 'avatar_9':
        return <DrinoSVG size={size} />;
      default:
        return <BrocoSVG size={size} />;
    }
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        borderColor: showBorder ? item.borderGlow : 'transparent',
      }}
      className={`rounded-2xl flex items-center justify-center relative overflow-hidden select-none border-2 shadow-lg transition-transform ${className}`}
    >
      {renderCharacterSVG()}
    </div>
  );
};
