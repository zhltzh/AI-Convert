import { renderSitesNav } from './aixuno-sites.js';

export function renderHeader() {
  const isToolPage = globalThis.location?.pathname.includes('/tools/');
  const isGuidePage = globalThis.location?.pathname.includes('/guides/');
  const depthPrefix = isToolPage || isGuidePage ? '../' : '';
  const home = depthPrefix + 'index.html';
  const rootPrefix = isToolPage || isGuidePage ? '../../' : '../';
  const currentFile = globalThis.location?.pathname.split('/').pop() || '';
  const intlFile = currentFile === 'wechat-format.html' ? 'markdown-to-html.html' : currentFile;
  const isZhPage = (globalThis.location?.pathname || '').includes('/zh/');
  const helpHref = isZhPage ? `${rootPrefix}zh/help.html` : `${rootPrefix}help.html`;
  const intlSuffix = isToolPage ? `tools/${intlFile}` : '';
  const intlPath = (code) => {
    const localeRoot = `${rootPrefix}${code === 'en' ? '' : `${code}/`}`;
    return currentFile === 'markdown-table-to-excel.html' ? localeRoot : `${localeRoot}${intlSuffix}`;
  };
  return `${renderSitesNav(isZhPage ? 'zh' : 'en')}<header class="site-header"><div class="container site-header__inner"><a class="brand" href="${home}"><span class="brand__mark" aria-hidden="true">M</span><span>Markdown 万能转换器</span><small>Aixuno</small></a><nav class="nav" aria-label="主导航"><a href="${home}#tools">转换工具</a><a href="${home}#guides">使用教程</a><a href="${home}#faq">常见问题</a><a href="${helpHref}">帮助</a><button class="theme-toggle" type="button" aria-label="切换深色模式"><svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg><svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg></button><details class="language-menu"><summary>简体中文</summary><div class="language-menu__list"><a href="${intlPath('en')}" lang="en" data-locale="en">English</a><a href="${home}" lang="zh-CN" data-locale="zh">简体中文</a><a href="${intlPath('es')}" lang="es" data-locale="es">Español</a><a href="${intlPath('de')}" lang="de" data-locale="de">Deutsch</a><a href="${intlPath('ja')}" lang="ja" data-locale="ja">日本語</a><a href="${intlPath('fr')}" lang="fr" data-locale="fr">Français</a></div></details></nav></div></header>`;
}
