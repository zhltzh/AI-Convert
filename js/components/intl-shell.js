import { getLocale, LOCALES } from '../i18n/home-locales.js';

const languageOrder = ['en','zh','es','de','ja','fr'];
const labels = { en:'English', zh:'简体中文', es:'Español', de:'Deutsch', ja:'日本語', fr:'Français' };

function pageSuffix() {
  const parts = location.pathname.split('/').filter(Boolean);
  if (['zh','es','de','ja','fr','en'].includes(parts[0])) parts.shift();
  return parts.join('/');
}

function languageHref(code) {
  let suffix = pageSuffix();
  if (code === 'zh' && suffix === 'tools/markdown-to-html.html') return '/zh/';
  if ((code === 'es' || code === 'de') && suffix === 'tools/markdown-table-to-excel.html') return `/${code}/`;
  const prefix = code === 'en' ? '/' : `/${code}/`;
  return prefix + suffix;
}

import { renderSitesNav } from './aixuno-sites.js';

const THEME_TOGGLE = `<button class="theme-toggle" type="button" aria-label="Toggle dark mode"><svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg><svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg></button>`;

export function renderIntlHeader() {
  const locale = getLocale();
  const home = locale.code === 'en' ? '/' : `/${locale.code}/`;
  const helpWords = { en: 'Help', es: 'Ayuda', de: 'Hilfe', ja: 'ヘルプ', fr: 'Aide' };
  const localizedHelpPages = { fr: '/fr/help.html', ja: '/ja/help.html', de: '/de/help.html' };
  const helpHref = localizedHelpPages[locale.code] || '/help.html';
  const languageLinks = languageOrder.map(code => `<a href="${languageHref(code)}" hreflang="${code}" lang="${code}" data-locale="${code}">${labels[code]}</a>`).join('');
  return `${renderSitesNav(locale.code)}<header class="site-header"><div class="container site-header__inner"><a class="brand" href="${home}"><span class="brand__mark" aria-hidden="true">M</span><span>${locale.brand}</span><small>Aixuno</small></a><nav class="nav" aria-label="Primary navigation"><a href="${home}#tools">${locale.nav[0]}</a><a href="${home}#guides">${locale.nav[1]}</a><a href="${home}#faq">${locale.nav[2]}</a><a href="${helpHref}">${helpWords[locale.code] || 'Help'}</a>${THEME_TOGGLE}<details class="language-menu"><summary>${labels[locale.code]}</summary><div class="language-menu__list">${languageLinks}</div></details></nav></div></header>`;
}

export function renderIntlFooter() {
  const locale = getLocale();
  const prefix = '/';
  const words = {
    en:['About','Contact','Privacy','Terms','Disclaimer','Changelog','Your content stays in your browser.'],
    es:['Acerca de','Contacto','Privacidad','Términos','Aviso legal','Cambios','Tu contenido permanece en tu navegador.'],
    de:['Über uns','Kontakt','Datenschutz','Nutzungsbedingungen','Haftungsausschluss','Änderungen','Ihre Inhalte bleiben in Ihrem Browser.'],
    ja:['概要','お問い合わせ','プライバシー','利用規約','免責事項','更新履歴','コンテンツはブラウザ内に保持されます。'],
    fr:['À propos','Contact','Confidentialité','Conditions','Mentions légales','Modifications','Votre contenu reste dans votre navigateur.']
  }[locale.code] || ['About','Contact','Privacy','Terms','Disclaimer','Changelog','Your content stays in your browser.'];
  // Pages that have a translated version for this locale. Anything missing
  // falls back to the English page and is labeled as such for ja.
  const localizedTrustPages = { ja: ['about.html','contact.html','privacy.html','terms.html','disclaimer.html','changelog.html'], fr: ['about.html','contact.html','privacy.html','terms.html','disclaimer.html','changelog.html'], de: ['about.html','contact.html','privacy.html','terms.html','disclaimer.html','changelog.html'] };
  const pages=['about.html','contact.html','privacy.html','terms.html','disclaimer.html','changelog.html'];
  const missingWords = { ja: '（英語）', fr: ' (en anglais)' };
  const trustLinks = pages.map((p,i)=>{
    const hasLocal = (localizedTrustPages[locale.code]||[]).includes(p);
    const href = hasLocal ? `/${locale.code}/${p}` : `${prefix}${p}`;
    const label = !hasLocal && missingWords[locale.code] ? `${words[i]}${missingWords[locale.code]}` : words[i];
    return `<a href="${href}">${label}</a>`;
  }).join('');
  return `<footer class="site-footer"><div class="container site-footer__inner"><span>© ${new Date().getFullYear()} Aixuno</span><span class="footer-links">${trustLinks}<a href="https://aixuno.com/">Markdown</a><a href="https://image.aixuno.com/">Pixkit</a><a href="https://compress.aixuno.com/">Compress</a><a href="https://pdf.aixuno.com/">PDF</a><a href="https://bg.aixuno.com/">AI Cutout</a><a href="https://scan.aixuno.com/">Document Scan</a><a href="https://idphoto.aixuno.com/">ID Photo</a><a href="https://restore.aixuno.com/">Photo Restore</a><a href="https://watermark.aixuno.com/">Watermark Remover</a></span><span>${words[6]}</span></div></footer>`;
}
