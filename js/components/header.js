export function renderHeader() {
  const isToolPage = globalThis.location?.pathname.includes('/tools/');
  const isGuidePage = globalThis.location?.pathname.includes('/guides/');
  const depthPrefix = isToolPage || isGuidePage ? '../' : '';
  const home = depthPrefix + 'index.html';
  const rootPrefix = isToolPage || isGuidePage ? '../../' : '../';
  const currentFile = globalThis.location?.pathname.split('/').pop() || '';
  const intlFile = currentFile === 'wechat-format.html' ? 'markdown-to-html.html' : currentFile;
  const intlSuffix = isToolPage ? `tools/${intlFile}` : '';
  const intlPath = (code) => `${rootPrefix}${code === 'en' ? '' : `${code}/`}${intlSuffix}`;
  return `<header class="site-header"><div class="container site-header__inner"><a class="brand" href="${home}" aria-label="Markdown 万能转换器首页"><span class="brand__mark" aria-hidden="true">M</span><span>Markdown 万能转换器</span><small>Aixuno</small></a><nav class="nav" aria-label="主导航"><a href="${home}#tools">转换工具</a><a href="${home}#guides">使用教程</a><a href="${home}#faq">常见问题</a><details class="language-menu"><summary>🌐 简体中文</summary><div class="language-menu__list"><a href="${intlPath('en')}" lang="en">English</a><a href="${home}" lang="zh-CN">简体中文</a><a href="${intlPath('es')}" lang="es">Español</a><a href="${intlPath('de')}" lang="de">Deutsch</a><a href="${intlPath('ja')}" lang="ja">日本語</a><a href="${intlPath('fr')}" lang="fr">Français</a></div></details></nav></div></header>`;
}
