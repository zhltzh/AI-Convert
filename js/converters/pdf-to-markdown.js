import { importModule } from '../core/script-loader.js';

/**
 * 解析模块和它的 worker 必须成对来源，否则版本不一致会直接报错。
 * 本地副本 → 国内镜像 → 境外源，jsdelivr 放在最后兜底。
 */
const PDFJS_SOURCES = [
  {
    module: new URL('../../vendor/pdf.min.mjs', import.meta.url).href,
    worker: new URL('../../vendor/pdf.worker.min.mjs', import.meta.url).href,
  },
  {
    module: 'https://registry.npmmirror.com/pdfjs-dist/5.4.149/files/build/pdf.min.mjs',
    worker: 'https://registry.npmmirror.com/pdfjs-dist/5.4.149/files/build/pdf.worker.min.mjs',
  },
  {
    module: 'https://unpkg.com/pdfjs-dist@5.4.149/build/pdf.min.mjs',
    worker: 'https://unpkg.com/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs',
  },
  {
    module: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs',
    worker: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs',
  },
];
const PDFJS_ERROR = '无法加载 PDF 解析组件，请检查网络或更换网络环境后重试。';
// Character maps and standard fonts ship with the site: the CDN copy is often
// unreachable on mainland networks, and a missing CJK cmap degrades extraction
// to garbage text instead of failing loudly.
const LOCAL_CMAPS = new URL('../../vendor/cmaps/', import.meta.url).href;
const LOCAL_STANDARD_FONTS = new URL('../../vendor/standard_fonts/', import.meta.url).href;
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_PAGES = 100;
let pdfJsLoader;

async function loadPdfJs() {
  pdfJsLoader ??= (async () => {
    for (const source of PDFJS_SOURCES) {
      try {
        const pdfjs = await importModule(source.module, { errorMessage: PDFJS_ERROR });
        pdfjs.GlobalWorkerOptions.workerSrc = source.worker;
        return pdfjs;
      } catch {
        // 当前源不可用，换下一个。
      }
    }
    throw new Error(PDFJS_ERROR);
  })();
  return pdfJsLoader;
}

export function toLines(items) {
  const sorted = [...items].filter((item) => item.str?.trim()).sort((a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4]);
  const lines = [];
  for (const item of sorted) {
    const y = item.transform[5];
    const current = lines.at(-1);
    if (current && Math.abs(current.y - y) < 3) current.items.push(item);
    else lines.push({ y, items: [item] });
  }
  return lines.map((line) => ({ text: line.items.sort((a, b) => a.transform[4] - b.transform[4]).map((item) => item.str).join(' ').replace(/\s+/g, ' ').trim(), size: Math.max(...line.items.map((item) => Math.abs(item.transform[0]) || 10)) }));
}

export function lineToMarkdown(line, average) {
  if (!line.text) return null;
  if (line.size >= average * 1.65 && line.text.length < 90) return { kind: 'heading', text: `# ${line.text}` };
  if (line.size >= average * 1.32 && line.text.length < 110) return { kind: 'heading', text: `## ${line.text}` };
  if (/^[•●▪◦\-–—]\s+/.test(line.text)) return { kind: 'list', text: `- ${line.text.replace(/^[•●▪◦\-–—]\s+/, '')}` };
  if (/^\d+[.)、]\s+/.test(line.text)) return { kind: 'list', text: line.text };
  return { kind: 'body', text: line.text };
}

/** Body lines stay in one paragraph; headings and list items get their own block. */
export function blocksToMarkdown(blocks) {
  return blocks.map((block, index) => {
    if (index === 0) return block.text;
    const previous = blocks[index - 1];
    const separator = previous.kind === 'body' && block.kind === 'body' ? '\n' : '\n\n';
    return separator + block.text;
  }).join('');
}

export async function readPdfAsMarkdown(file) {
  if (!file) throw new Error('请选择一个 PDF 文件。');
  if (file.name?.split('.').pop()?.toLowerCase() !== 'pdf') throw new Error('仅支持 .pdf 文件。');
  if (file.size === 0) throw new Error('所选 PDF 文件为空。');
  if (file.size > MAX_FILE_BYTES) throw new Error('文件超过 20MB。请使用更小的 PDF 文件后重试。');
  const pdfjs = await loadPdfJs();
  let pdf;
  try {
    pdf = await pdfjs.getDocument({
      data: new Uint8Array(await file.arrayBuffer()),
      cMapUrl: LOCAL_CMAPS,
      cMapPacked: true,
      standardFontDataUrl: LOCAL_STANDARD_FONTS,
    }).promise;
  }
  catch { throw new Error('无法读取该 PDF。请确认文件未加密、未损坏，且包含可选中的文字。'); }
  if (pdf.numPages > MAX_PAGES) throw new Error(`PDF 共 ${pdf.numPages} 页，超过单次 ${MAX_PAGES} 页限制。`);
  const pages = [];
  let imagePages = 0;
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const lines = toLines(textContent.items);
    const average = lines.length ? lines.reduce((total, line) => total + line.size, 0) / lines.length : 0;
    const blocks = lines.map((line) => lineToMarkdown(line, average)).filter(Boolean);
    const markdown = blocksToMarkdown(blocks);
    try {
      const operators = await page.getOperatorList();
      if (operators.fnArray.some((operator) => [pdfjs.OPS.paintImageXObject, pdfjs.OPS.paintJpegXObject, pdfjs.OPS.paintInlineImageXObject].includes(operator))) imagePages += 1;
    } catch { /* Image detection must not prevent text conversion. */ }
    if (markdown) pages.push(`<!-- 第 ${pageNumber} 页 -->\n\n${markdown}`);
  }
  if (!pages.length) throw new Error('没有提取到可选中的文字。扫描件或图片型 PDF 暂时无法直接转换为 Markdown。');
  return { markdown: pages.join('\n\n---\n\n'), imagePages };
}
