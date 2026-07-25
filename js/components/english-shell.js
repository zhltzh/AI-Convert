export function renderEnglishHeader() {
  return `<header class="site-header"><div class="container site-header__inner"><a class="brand" href="../index.html" aria-label="AI Convert home"><span class="brand__mark" aria-hidden="true">A</span>AI Convert</a><nav class="nav" aria-label="Primary navigation"><a href="../index.html#tools">Tools</a><a href="../index.html#how-it-works">How it works</a><a href="../index.html#faq">FAQ</a><a href="../../index.html">中文</a></nav></div></header>`;
}

export function renderEnglishFooter() {
  return `<footer class="site-footer"><div class="container site-footer__inner"><span>© ${new Date().getFullYear()} AI Convert</span><span class="footer-links"><a href="../about.html">About</a><a href="../privacy.html">Privacy</a><a href="../changelog.html">Changelog</a></span><span>Your content stays in your browser.</span></div></footer>`;
}
