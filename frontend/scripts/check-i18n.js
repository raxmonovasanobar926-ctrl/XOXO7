import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.resolve(__dirname, '../src/locales');
const uzPath = path.join(localesDir, 'uz.json');
const ruPath = path.join(localesDir, 'ru.json');
const enPath = path.join(localesDir, 'en.json');

const uz = JSON.parse(fs.readFileSync(uzPath, 'utf-8'));
const ru = JSON.parse(fs.readFileSync(ruPath, 'utf-8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

function flattenKeys(obj, prefix = '') {
  let keys = {};
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(keys, flattenKeys(v, fullKey));
    } else {
      keys[fullKey] = v;
    }
  }
  return keys;
}

const uzFlat = flattenKeys(uz);
const ruFlat = flattenKeys(ru);
const enFlat = flattenKeys(en);

const uzKeys = Object.keys(uzFlat).sort();
const ruKeys = Object.keys(ruFlat).sort();
const enKeys = Object.keys(enFlat).sort();

let errors = [];

// 1. Key Parity Check
const allKeys = Array.from(new Set([...uzKeys, ...ruKeys, ...enKeys])).sort();

for (const key of allKeys) {
  if (!(key in uzFlat)) errors.push(`[UZ missing key] ${key}`);
  if (!(key in ruFlat)) errors.push(`[RU missing key] ${key}`);
  if (!(key in enFlat)) errors.push(`[EN missing key] ${key}`);
}

// 2. Non-empty value check
for (const key of allKeys) {
  if (uzFlat[key] !== undefined && String(uzFlat[key]).trim() === '') {
    errors.push(`[UZ empty value] ${key}`);
  }
  if (ruFlat[key] !== undefined && String(ruFlat[key]).trim() === '') {
    errors.push(`[RU empty value] ${key}`);
  }
  if (enFlat[key] !== undefined && String(enFlat[key]).trim() === '') {
    errors.push(`[EN empty value] ${key}`);
  }
}

// 3. Exact Untranslated English check in non-English (excluding arcade terms)
const ALLOWED_UNTRANSLATED = new Set([
  'XOXO', 'VS', 'FIGHT!', 'GAME OVER', 'YOU WON', 'DRAW', 'CONTINUE?', 'YES', 'NO', 'CONTINUE? YES',
  'Telegram', 'GG!', 'OMG!', 'Telegram Stars', '{{stars}} Stars', 'Dashboard', 'BOT', 'ROBOT',
  'Pebble', 'Rocky', 'Granite', 'Obsidian', '1234'
]);

for (const key of allKeys) {
  const enVal = enFlat[key];
  if (!enVal || ALLOWED_UNTRANSLATED.has(enVal)) continue;

  if (ruFlat[key] === enVal) {
    errors.push(`[RU identical to EN] ${key}: "${enVal}"`);
  }
  if (uzFlat[key] === enVal) {
    errors.push(`[UZ identical to EN] ${key}: "${enVal}"`);
  }
}

if (errors.length > 0) {
  console.error('\n❌ check-i18n FAILED with ' + errors.length + ' error(s):');
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
} else {
  console.log(`\n✅ check-i18n PASSED! All ${allKeys.length} keys match perfectly across uz, ru, and en without missing or empty translations.\n`);
  process.exit(0);
}
