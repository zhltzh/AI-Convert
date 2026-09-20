import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const guideDirectories = [join(root, 'guides'), join(root, 'zh', 'guides')];

function extract(html, pattern, label) {
  const value = html.match(pattern)?.[1]?.trim();
  if (!value) throw new Error(`Missing ${label}`);
  return value;
}

let updated = 0;
for (const directory of guideDirectories) {
  const files = (await readdir(directory)).filter((name) => name.endsWith('.html') && name !== 'index.html');
  for (const name of files) {
    const file = join(directory, name);
    const html = await readFile(file, 'utf8');
    if (/<meta\s+http-equiv="refresh"/i.test(html) || /application\/ld\+json/i.test(html)) continue;

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: extract(html, /<h1[^>]*>([^<]+)<\/h1>/i, 'h1'),
      description: extract(html, /<meta\s+name="description"\s+content="([^"]+)"/i, 'description'),
      mainEntityOfPage: extract(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i, 'canonical'),
      inLanguage: extract(html, /<html\s+lang="([^"]+)"/i, 'language'),
      author: { '@type': 'Organization', name: 'Aixuno', url: 'https://aixuno.com/' },
      publisher: { '@type': 'Organization', name: 'Aixuno', url: 'https://aixuno.com/' },
    };
    const marker = '<script defer src="/js/analytics.js"></script>';
    if (!html.includes(marker)) throw new Error(`${relative(root, file)}: missing analytics marker`);
    const next = html.replace(marker, `<script type="application/ld+json">${JSON.stringify(schema)}</script>${marker}`);
    await writeFile(file, next, 'utf8');
    updated += 1;
  }
}

console.log(`Guide schema synchronized for ${updated} pages.`);
