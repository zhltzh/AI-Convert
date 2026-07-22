export function renderHeader() {
  const isToolPage = globalThis.location?.pathname.includes('/tools/');
  const home = isToolPage ? '../index.html' : 'index.html';

  return `
    <header class="site-header">
      <div class="container site-header__inner">
        <a class="brand" href="${home}" aria-label="AI Convert 首页"><span class="brand__mark" aria-hidden="true">A</span>AI Convert</a>
        <nav class="nav" aria-label="主导航">
          <a href="${home}#tools">工具</a><a href="${home}#how-it-works">教程</a><a href="${home}#faq">FAQ</a>
        </nav>
      </div>
    </header>`;
}
