/**
 * check-design-tokens.js
 * Automated token verification and WCAG AA contrast ratio compliance checker
 * for the Liquid Glass Design System.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// WCAG Luminance and Contrast calculation functions
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '');
  return [
    parseInt(cleanHex.substring(0, 2), 16),
    parseInt(cleanHex.substring(2, 4), 16),
    parseInt(cleanHex.substring(4, 6), 16),
  ];
}

function getContrastRatio(hex1, hex2) {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

console.log('═'.repeat(60));
console.log('  LIQUID GLASS DESIGN TOKENS & WCAG AA CONTRAST AUDIT');
console.log('═'.repeat(60));

let failures = 0;

// Test 1: Light Mode Palettes
console.log('\n[1] Auditing Light Mode Tokens (Default Apple Style):');
const lightBg = '#FFFFFF';
const lightSurface = '#F8F9FE';

const lightTextPairs = [
  { name: 'Primary Text (--text-main)', color: '#0F172A', min: 4.5, isLarge: false },
  { name: 'Secondary Text (--text-secondary)', color: '#475569', min: 4.5, isLarge: false },
  { name: 'Muted Text (--text-muted)', color: '#64748B', min: 3.0, isLarge: true },
  { name: 'Purple Accent (--accent-purple)', color: '#6E56CF', min: 4.5, isLarge: false },
  { name: 'Blue Accent (--accent-blue)', color: '#0369A1', min: 4.5, isLarge: false },
  { name: 'Rose Accent (--accent-rose)', color: '#BE123C', min: 4.5, isLarge: false },
  { name: 'Gold / Amber Accent (--accent-gold)', color: '#B45309', min: 4.5, isLarge: false },
];

for (const pair of lightTextPairs) {
  const ratioBg = getContrastRatio(pair.color, lightBg);
  const ratioSurface = getContrastRatio(pair.color, lightSurface);
  const effectiveRatio = Math.min(ratioBg, ratioSurface);
  const passed = effectiveRatio >= pair.min;

  if (passed) {
    console.log(`  ✓ ${pair.name} [${pair.color}] vs white/surface: ${effectiveRatio.toFixed(2)}:1 (Req: ${pair.min}:1) -> PASS`);
  } else {
    console.error(`  ✗ ${pair.name} [${pair.color}] vs surface: ${effectiveRatio.toFixed(2)}:1 (Req: ${pair.min}:1) -> FAIL`);
    failures++;
  }
}

// Test 2: Dark Mode Palettes
console.log('\n[2] Auditing Dark Mode Tokens (Telegram Dark Mode):');
const darkBg = '#0B0E17';
const darkSurface = '#161B2E';

const darkTextPairs = [
  { name: 'Primary Text (--text-main)', color: '#F8FAFC', min: 4.5, isLarge: false },
  { name: 'Secondary Text (--text-secondary)', color: '#CBD5E1', min: 4.5, isLarge: false },
  { name: 'Muted Text (--text-muted)', color: '#94A3B8', min: 3.0, isLarge: true },
  { name: 'Purple Accent (--accent-purple)', color: '#A78BFA', min: 4.5, isLarge: false },
  { name: 'Blue Accent (--accent-blue)', color: '#38BDF8', min: 4.5, isLarge: false },
  { name: 'Rose Accent (--accent-rose)', color: '#FB7185', min: 4.5, isLarge: false },
  { name: 'Gold / Amber Accent (--accent-gold)', color: '#FBBF24', min: 4.5, isLarge: false },
];

for (const pair of darkTextPairs) {
  const ratioBg = getContrastRatio(pair.color, darkBg);
  const ratioSurface = getContrastRatio(pair.color, darkSurface);
  const effectiveRatio = Math.min(ratioBg, ratioSurface);
  const passed = effectiveRatio >= pair.min;

  if (passed) {
    console.log(`  ✓ ${pair.name} [${pair.color}] vs dark bg: ${effectiveRatio.toFixed(2)}:1 (Req: ${pair.min}:1) -> PASS`);
  } else {
    console.error(`  ✗ ${pair.name} [${pair.color}] vs dark bg: ${effectiveRatio.toFixed(2)}:1 (Req: ${pair.min}:1) -> FAIL`);
    failures++;
  }
}

// Test 3: Scan for legacy pixel font classes in src
console.log('\n[3] Auditing Codebase for Residual Legacy Pixel/CRT Styling:');
function scanDir(dir, forbiddenRegexes) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist') {
        scanDir(fullPath, forbiddenRegexes);
      }
    } else if (entry.isFile() && /\.(tsx|ts|jsx|js|html)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const { name, regex } of forbiddenRegexes) {
        if (regex.test(content)) {
          console.error(`  ✗ Forbidden pattern "${name}" found in: ${fullPath}`);
          failures++;
        }
      }
    }
  }
}

const forbiddenChecks = [
  { name: 'font-pixel class in markup', regex: /className=["'][^"']*font-pixel[^"']*["']/ },
  { name: 'CRT scanline styling in markup', regex: /repeating-linear-gradient\(0deg,\s*#000/ },
];

const srcDir = path.resolve(__dirname, '../src');
scanDir(srcDir, forbiddenChecks);

// Test 4: Verify tokens.css and theme.ts exist
console.log('\n[4] Auditing Design System Files Existence:');
const tokensCssPath = path.resolve(__dirname, '../src/styles/tokens.css');
const themeTsPath = path.resolve(__dirname, '../src/styles/theme.ts');
if (fs.existsSync(tokensCssPath)) {
  console.log('  ✓ tokens.css exists');
} else {
  console.error('  ✗ tokens.css missing');
  failures++;
}

if (fs.existsSync(themeTsPath)) {
  console.log('  ✓ theme.ts exists');
} else {
  console.error('  ✗ theme.ts missing');
  failures++;
}

console.log('\n' + '═'.repeat(60));
if (failures === 0) {
  console.log('  AUDIT SUCCESS: All tokens, WCAG AA contrast, and files PASS! ✓');
  console.log('═'.repeat(60));
  process.exit(0);
} else {
  console.error(`  AUDIT FAILED: ${failures} issues detected. ✗`);
  console.log('═'.repeat(60));
  process.exit(1);
}
