import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const HM = 'https://hm.baidu.com';

const rules = [
  ['https://unpkg.com https://static.cloudflareinsights.com; worker-src', `https://unpkg.com https://static.cloudflareinsights.com ${HM}; worker-src`],
  ['https://static.cloudflareinsights.com; object-src', `https://static.cloudflareinsights.com ${HM}; object-src`],
  ['https://unpkg.com; worker-src', `https://unpkg.com ${HM}; worker-src`],
  ['https://unpkg.com; object-src', `https://unpkg.com ${HM}; object-src`],
];

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
let skipped = 0;
for (const file of await walk(root)) {
  const label = relative(root, file);
  if (!file.endsWith('.html') || /^baidu_verify_[^/\\]+\.html$/i.test(label)) continue;
  const before = await readFile(file, 'utf8');
  if (before.includes(HM)) { skipped += 1; continue; }
  let after = before;
  for (const [from, to] of rules) after = after.split(from).join(to);
  if (after !== before) {
    await writeFile(file, after, 'utf8');
    changed += 1;
  }
}

console.log(`CSP allowlist updated on ${changed} HTML pages (${skipped} already had ${HM}).`);
