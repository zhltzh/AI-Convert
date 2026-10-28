const LOCAL_PDFJS = new URL('../../vendor/pdf.min.mjs', import.meta.url).href;
const LOCAL_PDF_WORKER = new URL('../../vendor/pdf.worker.min.mjs', import.meta.url).href;
const PDFJS_CDN = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs';
const PDF_WORKER_CDN = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs';
// Character maps and standard fonts stay on the CDN: they are only fetched for
// PDFs that need them, and a failure there degrades font metrics, not extraction.
const PDF_CMAP_CDN = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/cmaps/';
const PDF_STANDARD_FONTS_CDN = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/standard_fonts/';
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_PAGES = 100;
let pdfJsLoader;

async function loadPdfJs() {
  pdfJsLoader ??= import(LOCAL_PDFJS)
    .then((pdfjs) => { pdfjs.GlobalWorkerOptions.workerSrc = LOCAL_PDF_WORKER; return pdfjs; })
    .catch(() => import(PDFJS_CDN).then((pdfjs) => { pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_CDN; return pdfjs; }))
    .catch(() => { throw new Error('无法加载 PDF 解析组件，请检查网络后重试。'); });
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
      cMapUrl: PDF_CMAP_CDN,
      cMapPacked: true,
      standardFontDataUrl: PDF_STANDARD_FONTS_CDN,
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
