/**
 * 顶部跨站导航。
 * 与 pdf / compress / image / bg / scan / restore / watermark 各站保持一致的视觉：彩色区块徽章 + 当前站高亮。
 */

const SITES = [
  { id: "markdown", href: "https://aixuno.com/", mark: "MD", tone: "amber" },
  { id: "image", href: "https://image.aixuno.com/", mark: "IMG", tone: "fuchsia" },
  { id: "compress", href: "https://compress.aixuno.com/", mark: "ZIP", tone: "sky" },
  { id: "pdf", href: "https://pdf.aixuno.com/", mark: "PDF", tone: "rose" },
  { id: "cutout", href: "https://bg.aixuno.com/", mark: "BG", tone: "violet" },
  { id: "scan", href: "https://scan.aixuno.com/", mark: "DOC", tone: "teal" },
  { id: "restore", href: "https://restore.aixuno.com/", mark: "FIX", tone: "indigo" },
  { id: "watermark", href: "https://watermark.aixuno.com/", mark: "WM", tone: "cyan" },
];

const LABELS = {
  en: ["Markdown", "Pixkit Images", "File Compress", "PDF Tools", "AI Cutout", "Document Scan", "Photo Restore", "Watermark Remover"],
  zh: ["Markdown 转换", "Pixkit 图片", "文件压缩", "PDF 工具", "AI 抠图", "文档扫描", "老照片修复", "视频去水印"],
  es: ["Markdown", "Imágenes Pixkit", "Comprimir archivos", "Herramientas PDF", "Recorte con IA", "Escáner de documentos", "Restaurar fotos", "Quitar marca de agua"],
  de: ["Markdown", "Pixkit Bilder", "Dateien komprimieren", "PDF-Werkzeuge", "KI-Freisteller", "Dokument-Scan", "Foto-Restaurierung", "Wasserzeichen entfernen"],
  ja: ["Markdown変換", "Pixkit画像", "ファイル圧縮", "PDFツール", "AI切り抜き", "文書スキャン", "写真修復", "透かし削除"],
  fr: ["Markdown", "Images Pixkit", "Compression", "Outils PDF", "Détourage IA", "Scan de documents", "Restauration photo", "Supprimer filigrane"],
};

export function renderSitesNav(locale = "en") {
  const labels = LABELS[locale] || LABELS.en;
  const items = SITES.map((site, index) => {
    const current = site.id === "markdown";
    return `<a class="site-net__item${current ? " is-current" : ""}" href="${site.href}"${current ? ' aria-current="page"' : ""}><span class="site-net__mark site-net__mark--${site.tone}" aria-hidden="true">${site.mark}</span><span class="site-net__label">${labels[index]}</span></a>`;
  }).join("");
  return `<nav class="site-network" aria-label="Aixuno products"><div class="container site-network__inner"><span class="site-net__brand" aria-hidden="true">Aixuno</span>${items}</div></nav>`;
}
