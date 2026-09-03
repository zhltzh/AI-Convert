import { getPreferredLocale } from './core/locale.js';

// Only redirect the root landing page. Search engines and direct locale URLs
// remain stable, while first-time visitors receive a useful default.
const isRoot = location.pathname === '/' || location.pathname === '/index.html';
const isCrawler = /bot|crawler|spider|slurp|bingpreview/i.test(navigator.userAgent || '');
const locale = getPreferredLocale();
if (isRoot && !isCrawler && locale !== 'en') location.replace(`/${locale}/${location.search}${location.hash}`);
