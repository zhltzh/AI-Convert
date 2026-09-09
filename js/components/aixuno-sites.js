const SITES = [
  { id: 'markdown', href: 'https://aixuno.com/' },
  { id: 'image', href: 'https://image.aixuno.com/' },
  { id: 'compress', href: 'https://compress.aixuno.com/' },
  { id: 'pdf', href: 'https://pdf.aixuno.com/' },
  { id: 'cutout', href: 'https://bg.aixuno.com/' },
];

const LABELS = {
  en: ['Markdown', 'Pixkit Images', 'File Compress', 'PDF Tools', 'AI Cutout'],
  zh: ['Markdown 转换', 'Pixkit 图片', '文件压缩', 'PDF 工具', 'AI 抠图'],
  es: ['Markdown', 'Imágenes Pixkit', 'Comprimir archivos', 'Herramientas PDF', 'Recorte con IA'],
  de: ['Markdown', 'Pixkit Bilder', 'Dateien komprimieren', 'PDF-Werkzeuge', 'KI-Freisteller'],
  ja: ['Markdown変換', 'Pixkit画像', 'ファイル圧縮', 'PDFツール', 'AI切り抜き'],
  fr: ['Markdown', 'Images Pixkit', 'Compression', 'Outils PDF', 'Détourage IA'],
};

export function renderSitesNav(locale = 'en') {
  const labels = LABELS[locale] || LABELS.en;
  return `<nav class="site-network" aria-label="Aixuno products"><div class="container site-network__inner">${SITES.map((site, index) => `<a href="${site.href}"${site.id === 'markdown' ? ' class="is-current" aria-current="page"' : ''}>${labels[index]}</a>`).join('')}</div></nav>`;
}
