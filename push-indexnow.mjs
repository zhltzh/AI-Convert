#!/usr/bin/env node
/**
 * IndexNow 主动推送脚本（Bing / Yandex / Seznam 等共享协议）
 *
 * 用法：
 *   node push-indexnow.mjs            # 推送全部五站
 *   node push-indexnow.mjs AI-Convert # 只推某一站
 *
 * 前置条件：各站根目录已部署 key 文件（{KEY}.txt），且已上线可访问。
 * 推送记录保存在 .indexnow-pushed.json，重复运行只推新 URL。
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY = '3b1cead5e362008c647f35b212814f68';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const PUSHED_FILE = join(__dirname, '.indexnow-pushed.json');

const SITES = {
  'AI-Convert': {
    host: 'aixuno.com',
    sitemaps: ['https://aixuno.com/sitemap.xml', 'https://aixuno.com/sitemap-zh.xml'],
    localFiles: ['sitemap.xml', 'sitemap-zh.xml'],
  },
  pdfbzy: { host: 'pdf.aixuno.com', sitemaps: ['https://pdf.aixuno.com/sitemap.xml'], localFiles: [] },
  filepomelo: { host: 'compress.aixuno.com', sitemaps: ['https://compress.aixuno.com/sitemap.xml'], localFiles: [] },
  'pixkit-images': { host: 'image.aixuno.com', sitemaps: ['https://image.aixuno.com/sitemap.xml'], localFiles: [] },
  'bg-remover': { host: 'bg.aixuno.com', sitemaps: ['https://bg.aixuno.com/sitemap.xml'], localFiles: [] },
};

async function fetchSitemapUrls(site) {
  const cfg = SITES[site];
  const urls = [];

  // 优先读本地文件（AI-Convert 有本地 sitemap）
  for (const rel of cfg.localFiles) {
    const p = join(__dirname, rel);
    if (existsSync(p)) {
      const c = readFileSync(p, 'utf8');
      urls.push(...[...c.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));
    }
  }
  if (urls.length) return urls;

  // 否则从线上抓取
  for (const sm of cfg.sitemaps) {
    try {
      const res = await fetch(sm);
      if (!res.ok) continue;
      const c = await res.text();
      urls.push(...[...c.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));
    } catch { /* 忽略，下一轮 */ }
  }
  return urls;
}

async function pushSite(site, pushed) {
  const cfg = SITES[site];
  const all = await fetchSitemapUrls(site);
  if (!all.length) {
    console.log(`[${site}] 未获取到 URL（站点可能尚未构建完成）`);
    return;
  }
  const fresh = all.filter(u => !(pushed[site] || []).includes(u));
  console.log(`[${site}] 共 ${all.length} 个 URL，待推送 ${fresh.length} 个`);
  if (!fresh.length) return;

  const body = {
    host: cfg.host,
    key: KEY,
    keyLocation: `https://${cfg.host}/${KEY}.txt`,
    urlList: fresh.slice(0, 10000),
  };

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    console.log(`[${site}] HTTP ${res.status} ${text || '(无响应体)'}`);
    if (res.ok) {
      pushed[site] = [...(pushed[site] || []), ...fresh.slice(0, 10000)];
      writeFileSync(PUSHED_FILE, JSON.stringify(pushed, null, 2), 'utf8');
    }
  } catch (e) {
    console.log(`[${site}] 推送失败: ${e.message}`);
  }
}

(async () => {
  let pushed = {};
  if (existsSync(PUSHED_FILE)) {
    try { pushed = JSON.parse(readFileSync(PUSHED_FILE, 'utf8')); } catch { pushed = {}; }
  }
  const arg = process.argv[2];
  const targets = arg ? [arg] : Object.keys(SITES);
  for (const s of targets) {
    if (!SITES[s]) { console.log(`未知站点: ${s}`); continue; }
    await pushSite(s, pushed);
  }
})().catch(e => console.error(e));