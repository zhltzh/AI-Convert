import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const marker = '<script defer src="/js/analytics.js"></script>';

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory() && !['.git', 'node_modules'].includes(entry.name)) return walk(fullPath);
    return [fullPath];
  }));
  return files.flat();
}

let changed = 0;
for (const file of await walk(root)) {
  const label = relative(root, file);
  if (!file.endsWith('.html') || /^baidu_verify_[^/\\]+\.html$/i.test(label)) continue;
  const html = await readFile(file, 'utf8');
  if (html.includes(marker)) continue;
  if (!/<\/head>/i.test(html)) throw new Error(`${label}: missing </head>`);
  await writeFile(file, html.replace(/<\/head>/i, `${marker}</head>`), 'utf8');
  changed += 1;
}

console.log(`Analytics marker added to ${changed} HTML pages.`);
