import { downloadBlob } from '../core/download.js';

const LOCAL_HTML_DOCX = new URL('../../vendor/html-docx.js', import.meta.url).href;
const HTML_DOCX_CDN = 'https://cdn.jsdelivr.net/npm/html-docx-js/dist/html-docx.js';
let exporterLoader;

function loadScript(source) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = source;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('无法加载 Word 导出组件，请检查网络连接后重试。'));
    document.head.append(script);
  });
}

async function loadWordExporter() {
  if (globalThis.htmlDocx?.asBlob) return globalThis.htmlDocx;
  exporterLoader ??= loadScript(LOCAL_HTML_DOCX)
    .catch(() => loadScript(HTML_DOCX_CDN))
    .then(() => {
      if (!globalThis.htmlDocx?.asBlob) throw new Error('Word 导出组件加载失败。');
      return globalThis.htmlDocx;
    });
  return exporterLoader;
}

const BLOCK_STYLES = {
  h1: 'font-size:22pt;line-height:1.25;margin:18pt 0 8pt;',
  h2: 'font-size:17pt;line-height:1.3;margin:16pt 0 7pt;',
  h3: 'font-size:14pt;line-height:1.3;margin:13pt 0 6pt;',
  h4: 'font-size:12pt;line-height:1.3;margin:11pt 0 5pt;',
  p: 'margin:0 0 8pt;',
  blockquote: 'margin:10pt 0;padding-left:10pt;border-left:3px solid #bbbbbb;color:#555555;',
  pre: 'margin:9pt 0;padding:8pt;background:#f5f5f5;font-family:Consolas,monospace;font-size:9.5pt;',
  table: 'border-collapse:collapse;width:100%;margin:9pt 0;',
  th: 'border:1px solid #cccccc;padding:5pt;background:#f5f5f5;text-align:left;',
  td: 'border:1px solid #cccccc;padding:5pt;text-align:left;vertical-align:top;',
  img: 'max-width:520pt;',
};

/**
 * html-docx-js ignores <style> blocks, so every visible layout rule has to be
 * inlined or Word renders borderless tables and unstyled code blocks.
 */
function inlineBlockStyles(html) {
  if (typeof DOMParser === 'undefined') return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  Object.entries(BLOCK_STYLES).forEach(([tag, css]) => {
    doc.body.querySelectorAll(tag).forEach((element) => {
      const existing = element.getAttribute('style') || '';
      element.setAttribute('style', existing ? `${existing.replace(/;?$/, ';')}${css}` : css);
    });
  });
  doc.body.querySelectorAll('code').forEach((element) => {
    element.setAttribute('style', 'font-family:Consolas,monospace;');
  });
  return doc.body.innerHTML;
}

function createDocument(html) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body { font-family: Arial, "Microsoft YaHei", sans-serif; font-size: 11pt; line-height: 1.65; color: #111; }
  </style></head><body>${inlineBlockStyles(html)}</body></html>`;
}

async function toDataUri(url) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(url, { signal: controller.signal, referrerPolicy: 'no-referrer' });
    if (!response.ok) return null;
    const blob = await response.blob();
    if (blob.size > 5 * 1024 * 1024) return null;
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

/** Remote images never reach the docx unless they are embedded as data URIs. */
async function inlineImages(html) {
  if (typeof DOMParser === 'undefined') return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const images = [...doc.body.querySelectorAll('img[src^="http"]')];
  if (!images.length) return html;
  await Promise.all(images.map(async (image) => {
    const dataUri = await toDataUri(image.getAttribute('src'));
    if (dataUri) image.setAttribute('src', dataUri);
    else image.removeAttribute('src');
  }));
  return doc.body.innerHTML;
}

export async function exportWord(html, filename = 'aixuno-document.docx') {
  if (!html.trim()) throw new Error('请先输入需要转换的 Markdown 内容。');
  const exporter = await loadWordExporter();
  const blob = exporter.asBlob(createDocument(await inlineImages(html)), {
    orientation: 'portrait',
    margins: { top: 720, right: 720, bottom: 720, left: 720 },
  });
  downloadBlob(blob, filename);
}
