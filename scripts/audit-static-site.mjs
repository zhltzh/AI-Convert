import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
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
const htmlFiles = allFiles.filter((file) => (
  file.endsWith('.html') && !/^baidu_verify_[^/\\]+\.html$/i.test(relative(root, file))
));
const errors = [];

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const label = relative(root, file);
  const isRedirectPage = /<meta\s+http-equiv="refresh"/i.test(html);
  if (!/<title>[^<]+<\/title>/i.test(html)) errors.push(`${label}: missing title`);
  if (!/<meta\s+name="description"/i.test(html) && !label.endsWith('404.html')) errors.push(`${label}: missing description`);
  if (!/<html\s+lang="[^"]+"/i.test(html)) errors.push(`${label}: missing language marker`);
  if (!label.endsWith('404.html') && !/^baidu_verify_/i.test(label)) {
    const canonicalCount = (html.match(/rel="canonical"/gi) || []).length;
    if (canonicalCount !== 1) errors.push(`${label}: expected one canonical, found ${canonicalCount}`);
  }
  if (!isRedirectPage && !label.endsWith('404.html')) {
    const h1Count = (html.match(/<h1\b/gi) || []).length;
    if (h1Count !== 1) errors.push(`${label}: expected one h1, found ${h1Count}`);
  }
  for (const match of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); } catch { errors.push(`${label}: invalid JSON-LD`); }
  }
  if (!html.includes('<script defer src="/js/analytics.js"></script>')) errors.push(`${label}: missing analytics marker`);
  if ((html.match(/\/js\/analytics\.js/g) || []).length !== 1) errors.push(`${label}: analytics marker must appear once`);
  if (/\son\w+\s*=/i.test(html)) errors.push(`${label}: contains inline event handler`);

  const localLinks = [...html.matchAll(/href="([^"]+)"/gi)]
    .map((match) => match[1].split(/[?#]/)[0])
    .filter((href) => href && !/^(?:https?:|mailto:|tel:|javascript:)/i.test(href));

  for (const href of localLinks) {
    let target = resolve(dirname(file), decodeURIComponent(href));
    if (href.endsWith('/')) target = join(target, 'index.html');
    try {
      await readFile(target);
    } catch {
      errors.push(`${label}: broken local link ${href}`);
    }
  }
}

const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
for (const route of ['/zh/', '/es/', '/de/', '/ja/', '/fr/', '/tools/markdown-to-html.html', '/zh/tools/markdown-table-to-excel.html', '/about.html', '/privacy.html', '/guides/', '/zh/guides/', '/guides/copy-ai-answer-to-word.html', '/zh/guides/copy-ai-answer-to-word.html']) {
  if (!sitemap.includes(route)) errors.push(`sitemap.xml: missing ${route}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

for (const route of [
  'zh/tools/markdown-to-word.html',
  'zh/tools/markdown-to-pdf.html',
  'zh/tools/excel-to-markdown.html',
  'zh/tools/markdown-table-to-excel.html',
]) {
  const html = await readFile(join(root, route), 'utf8');
  const faqCount = (html.match(/<details\b/gi) || []).length;
  if (faqCount < 5) errors.push(`${route}: expected at least five visible FAQ items, found ${faqCount}`);
}

const localeFiles = {
  en: '',
  'zh-CN': 'zh/',
  es: 'es/',
  de: 'de/',
  ja: 'ja/',
  fr: 'fr/',
};
for (const suffix of ['', 'tools/markdown-to-word.html', 'tools/markdown-to-pdf.html', 'tools/excel-to-markdown.html', 'tools/markdown-to-html.html']) {
  const activeLocales = suffix === 'tools/markdown-to-html.html'
    ? Object.fromEntries(Object.entries(localeFiles).filter(([locale]) => locale !== 'zh-CN'))
    : localeFiles;
  for (const [locale, prefix] of Object.entries(activeLocales)) {
    const file = join(root, prefix, suffix || 'index.html');
    const html = await readFile(file, 'utf8');
    for (const [alternateLocale, alternatePrefix] of Object.entries(activeLocales)) {
      const expectedUrl = `https://aixuno.com/${alternatePrefix}${suffix}`;
      const expectedTag = `hreflang="${alternateLocale}" href="${expectedUrl}"`;
      if (!html.includes(expectedTag)) errors.push(`${relative(root, file)}: missing alternate ${alternateLocale} for ${suffix || 'homepage'}`);
    }
    const defaultUrl = `https://aixuno.com/${suffix}`;
    if (!html.includes(`hreflang="x-default" href="${defaultUrl}"`)) {
      errors.push(`${relative(root, file)}: missing x-default for ${suffix || 'homepage'}`);
    }
  }
}

for (const route of ['index.html', 'tools/markdown-to-word.html', 'tools/markdown-to-pdf.html', 'tools/excel-to-markdown.html', 'tools/markdown-to-html.html', 'zh/tools/markdown-table-to-excel.html']) {
  const html = await readFile(join(root, route), 'utf8');
  if (!/application\/ld\+json/i.test(html)) errors.push(`${route}: missing structured data`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Static audit passed for ${htmlFiles.length} HTML pages.`);
