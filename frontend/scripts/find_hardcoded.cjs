const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
console.log('Total TSX files:', files.length);

const hardcodedMatches = [];
const patterns = [
  'Yuklanmoqda', 'Xatolik', 'Muvaffaqiyatli', 'Hammasi', 'Faqat Online',
  'Do\'stlik', 'Yakkaxon', 'Kolleksiyada', 'Qabul qilish', 'Tosh',
  'G\'alaba', 'Mag\'lubiyat', 'Durrang', 'Sovg\'a', 'Tarmoqda',
  'Ошибка', 'Успешно', 'Загрузка', 'Камни', 'Победа', 'Поражение'
];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    const raw = l.trim();
    if (l.includes('import ') || l.includes('console.') || raw.startsWith('//') || raw.startsWith('*')) return;
    for (const pat of patterns) {
      if (raw.includes(pat) && !raw.includes(`t('${pat}')`)) {
        hardcodedMatches.push({ file: f, line: idx + 1, pattern: pat, text: raw });
        break;
      }
    }
  });
});

console.log('Found potential hardcoded strings:', hardcodedMatches.length);
hardcodedMatches.forEach(m => console.log(`${m.file}:${m.line} [${m.pattern}] -> ${m.text}`));
