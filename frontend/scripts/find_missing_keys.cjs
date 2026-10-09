const fs = require('fs');
const path = require('path');

const uz = JSON.parse(fs.readFileSync('src/locales/uz.json', 'utf8'));

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

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
const missingKeys = new Set();
const foundCalls = [];

const tRegex = /\bt\(\s*['"]([a-zA-Z0-9_.]+)['"]/g;

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = tRegex.exec(content)) !== null) {
    const key = match[1];
    foundCalls.push({ file: f, key });
    if (!(key in uzFlat)) {
      missingKeys.add(key);
    }
  }
});

console.log('Total t(...) calls found:', foundCalls.length);
console.log('Missing keys count:', missingKeys.size);
missingKeys.forEach(k => console.log('MISSING KEY:', k));
