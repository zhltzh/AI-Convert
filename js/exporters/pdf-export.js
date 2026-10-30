const LOCAL_HTML2PDF = new URL('../../vendor/html2pdf.bundle.min.js', import.meta.url).href;
const CDN_HTML2PDF = 'https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js';
let exporterLoader;

function loadScript(source) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = source;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('无法加载 PDF 导出组件，请检查网络连接后重试。'));
    document.head.append(script);
  });
}

/** The bundled copy ships with the site, so exports keep working when the CDN is unreachable. */
async function loadPdfExporter() {
  if (typeof globalThis.html2pdf === 'function') return globalThis.html2pdf;
  exporterLoader ??= loadScript(LOCAL_HTML2PDF)
    .catch(() => loadScript(CDN_HTML2PDF))
    .then(() => {
      if (typeof globalThis.html2pdf !== 'function') throw new Error('PDF 导出组件加载失败。');
      return globalThis.html2pdf;
    });
  return exporterLoader;
}

// A4 width (210mm) minus the 12mm side margins, expressed at 96dpi.
const PRINT_WIDTH = Math.round(((210 - 24) / 25.4) * 96);

const PRINT_STYLES = '.pdf-export-scope h1,.pdf-export-scope h2,.pdf-export-scope h3,.pdf-export-scope h4{line-height:1.3;page-break-after:avoid;break-after:avoid}'
  + '.pdf-export-scope h1{font-size:28px;margin:0 0 12px}.pdf-export-scope h2{font-size:22px;margin:22px 0 10px}'
  + '.pdf-export-scope h3{font-size:18px;margin:18px 0 8px}.pdf-export-scope h4{font-size:16px}'
  + '.pdf-export-scope p,.pdf-export-scope ul,.pdf-export-scope ol{margin:0 0 10px;padding-left:22px}'
  + '.pdf-export-scope table{width:100%;border-collapse:collapse;margin:12px 0;page-break-inside:auto}'
  + '.pdf-export-scope thead{display:table-header-group}'
  + '.pdf-export-scope tr{page-break-inside:avoid;break-inside:avoid}'
  + '.pdf-export-scope th,.pdf-export-scope td{border:1px solid #ddd;padding:7px 9px;text-align:left;vertical-align:top;word-break:break-word}'
  + '.pdf-export-scope th{background:#f5f5f5}'
  + '.pdf-export-scope blockquote{margin:12px 0;padding-left:14px;border-left:3px solid #bbb;color:#555;page-break-inside:avoid;break-inside:avoid}'
  + '.pdf-export-scope pre{padding:12px;background:#f5f5f5;white-space:pre-wrap;word-break:break-word;page-break-inside:avoid;break-inside:avoid}'
  + '.pdf-export-scope code{font-family:Consolas,Monaco,monospace;font-size:.92em}'
  + '.pdf-export-scope img{max-width:100%;page-break-inside:avoid;break-inside:avoid}'
  + '.pdf-export-scope li{page-break-inside:avoid;break-inside:avoid}'
  + '.pdf-export-scope a{color:#111;text-decoration:none}'
  + '.pdf-export-scope hr{border:0;border-top:1px solid #ddd;margin:18px 0}';

/**
 * The stylesheet has to live in <head>: html2canvas paints a <style> element
 * inside the captured node as literal text, which filled the export with CSS.
 */
function ensurePrintStyles() {
  let element = document.querySelector('style[data-pdf-styles]');
  if (element) return element;
  element = document.createElement('style');
  element.setAttribute('data-pdf-styles', '');
  element.textContent = PRINT_STYLES;
  document.head.append(element);
  return element;
}

/**
 * html2canvas renders nothing for an element that is `position: fixed`, which is
 * why the previous off-screen container produced empty PDFs. The article now
 * lives inside a fixed overlay while keeping a normal flow layout, and the
 * overlay doubles as progress feedback.
 */
function createPrintContainer(html) {
  const overlay = document.createElement('div');
  overlay.setAttribute('data-pdf-overlay', '');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;overflow:auto;background:#fff;padding:24px 24px 48px;cursor:progress;';

  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.textContent = '正在生成 PDF，请稍候…';
  status.style.cssText = 'position:sticky;top:0;left:0;margin:0 auto 14px;max-width:420px;padding:9px 14px;border-radius:10px;background:#111;color:#fff;font:600 13px/1.4 system-ui,sans-serif;text-align:center;';

  const article = document.createElement('article');
  article.className = 'pdf-export-scope';
  article.setAttribute('aria-hidden', 'true');
  article.style.cssText = `width:${PRINT_WIDTH}px;margin:0 auto;padding:0;background:#fff;color:#111;font-family:"PingFang SC",Arial,"Microsoft YaHei",sans-serif;font-size:14px;line-height:1.7;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;`;
  article.innerHTML = html;
  ensurePrintStyles();

  overlay.append(status, article);
  document.body.append(overlay);
  return { overlay, article };
}

/** Long documents need a smaller raster scale, otherwise the canvas exceeds browser limits. */
function pickScale(container) {
  const height = container.scrollHeight;
  if (height > 12000) return 1.2;
  if (height > 6000) return 1.6;
  return 2;
}

function stampPageNumbers(pdf) {
  const total = pdf.internal.getNumberOfPages();
  for (let page = 1; page <= total; page += 1) {
    pdf.setPage(page);
    pdf.setFontSize(9);
    pdf.setTextColor(130);
    pdf.text(`${page} / ${total}`, pdf.internal.pageSize.getWidth() - 12, pdf.internal.pageSize.getHeight() - 6, { align: 'right' });
  }
}

/**
 * html2canvas paints an empty page whenever the window is scrolled: it renders the
 * clone from the document top while the capture target sits further down. Jumping
 * to the top has to settle before the clone is taken, and the root's smooth
 * scrolling rule has to be switched off or the jump is animated frame by frame.
 */
async function scrollToTop() {
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  const previousX = window.scrollX;
  const previousY = window.scrollY;
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
  for (let frame = 0; frame < 30 && window.scrollY !== 0; frame += 1) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  await new Promise((resolve) => requestAnimationFrame(resolve));
  return { previousBehavior, previousX, previousY };
}

/**
 * A blocked or swallowed download used to fail silently: `pdf.save()` triggers an
 * anchor click that the browser can cancel (site permission, antivirus, a second
 * download without a fresh gesture) with no visible result. The blob URL is kept
 * so the save bar below can offer a manual save instead.
 */
function savePdfBlob(pdf, filename) {
  const blob = pdf.output('blob');
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  return { url, filename, bytes: blob.size };
}

/** Shown after every export: the click above is not guaranteed to reach the disk. */
function showSaveFallback({ url, filename, bytes }) {
  const previous = document.querySelector('[data-pdf-save-bar]');
  if (previous) {
    previous.remove();
    if (previous.dataset.blobUrl) URL.revokeObjectURL(previous.dataset.blobUrl);
  }
  const bar = document.createElement('div');
  bar.setAttribute('data-pdf-save-bar', '');
  bar.dataset.blobUrl = url;
  bar.style.cssText = 'position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:2147483646;display:flex;gap:12px;align-items:center;padding:10px 14px;border-radius:12px;background:#111;color:#fff;font:500 13px/1.4 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.24);max-width:calc(100vw - 32px);';

  const label = document.createElement('span');
  label.textContent = `PDF 已生成（${Math.max(1, Math.round(bytes / 1024))} KB）。没有自动下载？`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.textContent = '点此保存';
  link.style.cssText = 'flex:none;padding:5px 12px;border-radius:8px;background:#fff;color:#111;font-weight:600;text-decoration:none;';

  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = '关闭';
  close.setAttribute('aria-label', '关闭提示');
  close.style.cssText = 'flex:none;padding:5px 10px;border:1px solid #555;border-radius:8px;background:transparent;color:#ddd;font:inherit;cursor:pointer;';

  const dismiss = () => {
    if (!bar.isConnected) return;
    bar.remove();
    URL.revokeObjectURL(url);
  };
  const dismissSoon = () => window.setTimeout(dismiss, 2000);
  close.addEventListener('click', dismiss);
  // Saving from the bar counts as done, so the prompt can go away.
  link.addEventListener('click', dismissSoon);
  bar.append(label, link, close);
  document.body.append(bar);
  window.setTimeout(dismiss, 20000);
}

export async function exportPdf(html, filename = 'aixuno-document.pdf') {
  if (!html.trim()) throw new Error('请先输入需要转换的 Markdown 内容。');
  const html2pdf = await loadPdfExporter();
  const restore = await scrollToTop();
  const { overlay, article } = createPrintContainer(html);

  try {
    const worker = html2pdf().set({
      margin: [12, 12, 16, 12],
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: pickScale(article),
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      // 'legacy' slicing re-measures cloned nodes and duplicates or empties
      // pages; the print styles above already hold the CSS break rules.
      pagebreak: { mode: ['css'], avoid: ['table', 'tr', 'pre', 'blockquote', 'img'] },
    }).from(article);

    await worker.toPdf();
    const pdf = await worker.get('pdf');
    stampPageNumbers(pdf);
    const result = savePdfBlob(pdf, filename);
    showSaveFallback(result);
    return result;
  } finally {
    overlay.remove();
    // Scroll back while scrolling is still instant, then hand the page its
    // smooth behaviour again.
    window.scrollTo(restore.previousX, restore.previousY);
    document.documentElement.style.scrollBehavior = restore.previousBehavior;
  }
}
