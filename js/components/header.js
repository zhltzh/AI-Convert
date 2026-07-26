export function renderHeader() {
  const isToolPage = globalThis.location?.pathname.includes('/tools/');
  const home = isToolPage ? '../index.html' : 'index.html';
  const englishTarget = isToolPage ? '../en/' : 'en/';
  return `<header class="site-header"><div class="container site-header__inner"><a class="brand" href="${home}" aria-label="Markdown 万能转换器首页"><span class="brand__mark" aria-hidden="true">M</span><span>Markdown 万能转换器</span><small>Aixuno</small></a><nav class="nav" aria-label="主导航"><a href="${home}#tools">转换工具</a><a href="${home}#guides">使用教程</a><a href="${home}#faq">常见问题</a><a href="${englishTarget}" lang="en">EN</a></nav></div></header>`;
}
