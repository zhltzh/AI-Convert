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
  if (code === 'zh' && suffix === 'tools/markdown-to-html.html') suffix = 'tools/wechat-format.html';
  const prefix = code === 'en' ? '/' : `/${code}/`;
  return prefix + suffix;
}

export function renderIntlHeader() {
  const locale = getLocale();
  const home = locale.code === 'en' ? '/' : `/${locale.code}/`;
  const languageLinks = languageOrder.map(code => `<a href="${languageHref(code)}" hreflang="${code}" lang="${code}">${labels[code]}</a>`).join('');
  return `<header class="site-header"><div class="container site-header__inner"><a class="brand" href="${home}" aria-label="Aixuno"><span class="brand__mark" aria-hidden="true">M</span><span>${locale.brand}</span><small>Aixuno</small></a><nav class="nav" aria-label="Primary navigation"><a href="${home}#tools">${locale.nav[0]}</a><a href="${home}#guides">${locale.nav[1]}</a><a href="${home}#faq">${locale.nav[2]}</a><details class="language-menu"><summary>🌐 ${labels[locale.code]}</summary><div class="language-menu__list">${languageLinks}</div></details></nav></div></header>`;
}

export function renderIntlFooter() {
  const locale = getLocale();
  const prefix = '/';
  const words = {
    en:['About','Contact','Privacy','Terms','Disclaimer','Changelog','Your content stays in your browser.'],
    es:['Acerca de','Contacto','Privacidad','Términos','Aviso legal','Cambios','Tu contenido permanece en tu navegador.'],
    de:['Über uns','Kontakt','Datenschutz','Nutzungsbedingungen','Haftungsausschluss','Änderungen','Deine Inhalte bleiben im Browser.'],
    ja:['概要','お問い合わせ','プライバシー','利用規約','免責事項','更新履歴','コンテンツはブラウザ内に保持されます。'],
    fr:['À propos','Contact','Confidentialité','Conditions','Mentions légales','Modifications','Votre contenu reste dans votre navigateur.']
  }[locale.code] || ['About','Contact','Privacy','Terms','Disclaimer','Changelog','Your content stays in your browser.'];
  const pages=['about.html','contact.html','privacy.html','terms.html','disclaimer.html','changelog.html'];
  return `<footer class="site-footer"><div class="container site-footer__inner"><span>© ${new Date().getFullYear()} Aixuno</span><span class="footer-links">${pages.map((p,i)=>`<a href="${prefix}${p}">${words[i]}</a>`).join('')}</span><span>${words[6]}</span></div></footer>`;
}
