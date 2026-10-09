import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname, '../src');

// Unicode Emoji regex (excluding standard symbols like #, *, 0-9)
const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;

const allowedExtensions = ['.ts', '.tsx', '.json', '.js'];
const ignoredFiles = ['check-emoji.js'];

let violations = [];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist') {
        scanDir(fullPath);
      }
    } else if (entry.isFile()) {
      if (ignoredFiles.includes(entry.name)) continue;
      const ext = path.extname(entry.name);
      if (!allowedExtensions.includes(ext)) continue;

      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const matches = line.match(emojiRegex);
        if (matches) {
          violations.push({
            file: path.relative(path.resolve(__dirname, '..'), fullPath),
            line: idx + 1,
            emojis: matches.join(' '),
            snippet: line.trim().slice(0, 80),
          });
        }
      });
    }
  }
}

scanDir(srcDir);

if (violations.length > 0) {
  console.error(`\n❌ check-emoji FAILED: Found ${violations.length} raw emoji usage(s) in source code:`);
  violations.slice(0, 30).forEach(v => {
    console.error(`  - ${v.file}:${v.line} [${v.emojis}] -> ${v.snippet}`);
  });
  if (violations.length > 30) {
    console.error(`  ... and ${violations.length - 30} more.`);
  }
  console.error('\nReplace raw emojis with vector SVGs or graphic components from components/graphics.\n');
  process.exit(1);
} else {
  console.log('\n✅ check-emoji PASSED! Zero raw system emojis found across all source files.\n');
  process.exit(0);
}
