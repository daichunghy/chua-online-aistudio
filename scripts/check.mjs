// Kiểm tra cú pháp (node --check) toàn bộ file .mjs của dự án — thay cho danh sách file viết tay trong package.json.
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const files = ['server.mjs'];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.mjs')) files.push(p);
  }
};
walk('src');
walk('scripts');
for (const f of files) execFileSync(process.execPath, ['--check', f], { stdio: 'inherit' });
console.log(`OK: ${files.length} file .mjs hợp lệ cú pháp.`);
