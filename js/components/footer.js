export function renderFooter() {
  const isToolPage = globalThis.location?.pathname.includes('/tools/');
  const prefix = isToolPage ? '../' : '';
  return `<footer class="site-footer"><div class="container site-footer__inner"><span>© ${new Date().getFullYear()} Aixuno</span><span class="footer-links"><a href="${prefix}about.html">关于</a><a href="${prefix}contact.html">联系我们</a><a href="${prefix}privacy.html">隐私</a><a href="${prefix}terms.html">条款</a><a href="${prefix}disclaimer.html">免责声明</a><a href="${prefix}changelog.html">更新日志</a></span><span>你的内容，仅在你的浏览器中处理。</span></div></footer>`;
}
