import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const requiredRootFiles = ['robots.txt', 'sitemap.xml', 'llms.txt', '_headers', '404.html'];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const results = await Promise.all(entries.map(async (entry) => {
    const fullPath = join(directory, entry.name);
    return entry.isDirectory() && !['.git', 'node_modules'].includes(entry.name) ? walk(fullPath) : [fullPath];
  }));
  return results.flat();
}

for (const file of requiredRootFiles) {
  await readFile(join(root, file), 'utf8');
}

const allFiles = await walk(root);
const htmlFiles = allFiles.filter((file) => file.endsWith('.html'));
const errors = [];

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const label = relative(root, file);
  if (!/<title>[^<]+<\/title>/i.test(html)) errors.push(`${label}: missing title`);
  if (!/<meta\s+name="description"/i.test(html) && !label.endsWith('404.html')) errors.push(`${label}: missing description`);
  if (!/<html\s+lang="[^"]+"/i.test(html)) errors.push(`${label}: missing language marker`);
  if (/\son\w+\s*=/i.test(html)) errors.push(`${label}: contains inline event handler`);
}

const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
for (const route of ['/en/', '/en/tools/markdown-to-word.html', '/en/guides/deepseek-to-word.html', '/about.html', '/privacy.html']) {
  if (!sitemap.includes(route)) errors.push(`sitemap.xml: missing ${route}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

for (const route of ['index.html', 'tools/markdown-to-word.html', 'tools/markdown-to-pdf.html', 'tools/excel-to-markdown.html', 'tools/wechat-format.html']) {
  const html = await readFile(join(root, route), 'utf8');
  if (!/application\/ld\+json/i.test(html)) errors.push(`${route}: missing structured data`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Static audit passed for ${htmlFiles.length} HTML pages.`);
