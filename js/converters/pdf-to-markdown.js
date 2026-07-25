const PDFJS_CDN = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs';
const PDF_WORKER_CDN = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs';
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_PAGES = 100;
let pdfJsLoader;

async function loadPdfJs() {
  pdfJsLoader ??= import(PDFJS_CDN).then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_CDN;
    return pdfjs;
  }).catch(() => { throw new Error('无法加载 PDF 解析组件，请检查网络后重试。'); });
  return pdfJsLoader;
}

function toLines(items) {
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

function lineToMarkdown(line, sizes) {
  if (!line.text) return '';
  const average = sizes.reduce((total, size) => total + size, 0) / sizes.length;
  if (line.size >= average * 1.65 && line.text.length < 90) return `# ${line.text}`;
  if (line.size >= average * 1.32 && line.text.length < 110) return `## ${line.text}`;
  if (/^[•●▪◦\-–—]\s+/.test(line.text)) return `- ${line.text.replace(/^[•●▪◦\-–—]\s+/, '')}`;
  if (/^\d+[.)、]\s+/.test(line.text)) return line.text;
  return line.text;
}

export async function readPdfAsMarkdown(file) {
  if (!file) throw new Error('请选择一个 PDF 文件。');
  if (file.name?.split('.').pop()?.toLowerCase() !== 'pdf') throw new Error('仅支持 .pdf 文件。');
  if (file.size === 0) throw new Error('所选 PDF 文件为空。');
  if (file.size > MAX_FILE_BYTES) throw new Error('文件超过 20MB。请使用更小的 PDF 文件后重试。');
  const pdfjs = await loadPdfJs();
  let pdf;
  try { pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise; }
  catch { throw new Error('无法读取该 PDF。请确认文件未加密、未损坏，且包含可选中的文字。'); }
  if (pdf.numPages > MAX_PAGES) throw new Error(`PDF 共 ${pdf.numPages} 页，超过单次 ${MAX_PAGES} 页限制。`);
  const pages = [];
  let imagePages = 0;
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const lines = toLines(textContent.items);
    const markdown = lines.map((line) => lineToMarkdown(line, lines.map((entry) => entry.size))).filter(Boolean).join('\n\n');
    try {
      const operators = await page.getOperatorList();
      if (operators.fnArray.some((operator) => [pdfjs.OPS.paintImageXObject, pdfjs.OPS.paintJpegXObject, pdfjs.OPS.paintInlineImageXObject].includes(operator))) imagePages += 1;
    } catch { /* Image detection must not prevent text conversion. */ }
    if (markdown) pages.push(`<!-- 第 ${pageNumber} 页 -->\n\n${markdown}`);
  }
  if (!pages.length) throw new Error('没有提取到可选中的文字。扫描件或图片型 PDF 暂时无法直接转换为 Markdown。');
  return { markdown: pages.join('\n\n---\n\n'), imagePages };
}
