import { downloadBlob } from '../core/download.js';

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
  exporterLoader ??= loadScript(HTML_DOCX_CDN).then(() => {
    if (!globalThis.htmlDocx?.asBlob) throw new Error('Word 导出组件加载失败。');
    return globalThis.htmlDocx;
  });
  return exporterLoader;
}

function createDocument(html) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body { font-family: Arial, "Microsoft YaHei", sans-serif; font-size: 11pt; line-height: 1.65; color: #111; }
    h1, h2, h3 { line-height: 1.25; } h1 { font-size: 22pt; } h2 { font-size: 17pt; } h3 { font-size: 14pt; }
    table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 6px; } th { background: #f5f5f5; }
    blockquote { border-left: 3px solid #999; margin-left: 0; padding-left: 12px; color: #555; } pre { white-space: pre-wrap; }
  </style></head><body>${html}</body></html>`;
}

export async function exportWord(html, filename = 'aixuno-document.docx') {
  if (!html.trim()) throw new Error('请先输入需要转换的 Markdown 内容。');
  const exporter = await loadWordExporter();
  const blob = exporter.asBlob(createDocument(html));
  downloadBlob(blob, filename);
}
