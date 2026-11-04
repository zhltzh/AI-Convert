/**
 * 顶部跨站导航。
 * 与 pdf / compress / image / bg 四站保持一致的视觉：彩色区块徽章 + 当前站高亮。
 */

const SITES = [
  { id: "markdown", href: "https://aixuno.com/", mark: "MD", tone: "amber" },
  { id: "image", href: "https://image.aixuno.com/", mark: "IMG", tone: "fuchsia" },
  { id: "compress", href: "https://compress.aixuno.com/", mark: "ZIP", tone: "sky" },
  { id: "pdf", href: "https://pdf.aixuno.com/", mark: "PDF", tone: "rose" },
  { id: "cutout", href: "https://bg.aixuno.com/", mark: "BG", tone: "violet" },
];

const LABELS = {
  en: ["Markdown", "Pixkit Images", "File Compress", "PDF Tools", "AI Cutout"],
  zh: ["Markdown 转换", "Pixkit 图片", "文件压缩", "PDF 工具", "AI 抠图"],
  es: ["Markdown", "Imágenes Pixkit", "Comprimir archivos", "Herramientas PDF", "Recorte con IA"],
  de: ["Markdown", "Pixkit Bilder", "Dateien komprimieren", "PDF-Werkzeuge", "KI-Freisteller"],
  ja: ["Markdown変換", "Pixkit画像", "ファイル圧縮", "PDFツール", "AI切り抜き"],
  fr: ["Markdown", "Images Pixkit", "Compression", "Outils PDF", "Détourage IA"],
};

export function renderSitesNav(locale = "en") {
  const labels = LABELS[locale] || LABELS.en;
  const items = SITES.map((site, index) => {
    const current = site.id === "markdown";
    return `<a class="site-net__item${current ? " is-current" : ""}" href="${site.href}"${current ? ' aria-current="page"' : ""}><span class="site-net__mark site-net__mark--${site.tone}" aria-hidden="true">${site.mark}</span><span class="site-net__label">${labels[index]}</span></a>`;
  }).join("");
  return `<nav class="site-network" aria-label="Aixuno products"><div class="container site-network__inner"><span class="site-net__brand" aria-hidden="true">Aixuno</span>${items}</div></nav>`;
}
