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

function createPrintContainer(html) {
  const container = document.createElement('article');
  container.setAttribute('aria-hidden', 'true');
  container.style.cssText = `position:fixed;left:-100000px;top:0;width:${PRINT_WIDTH}px;padding:0;background:#fff;color:#111;font-family:"PingFang SC",Arial,"Microsoft YaHei",sans-serif;font-size:14px;line-height:1.7;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;`;
  container.innerHTML = `<style>
    h1,h2,h3,h4{line-height:1.3;page-break-after:avoid;break-after:avoid}
    h1{font-size:28px;margin:0 0 12px} h2{font-size:22px;margin:22px 0 10px} h3{font-size:18px;margin:18px 0 8px} h4{font-size:16px}
    p,ul,ol{margin:0 0 10px}
    table{width:100%;border-collapse:collapse;margin:12px 0;page-break-inside:auto}
    thead{display:table-header-group}
    tr{page-break-inside:avoid;break-inside:avoid}
    th,td{border:1px solid #ddd;padding:7px 9px;text-align:left;vertical-align:top;word-break:break-word}
    th{background:#f5f5f5}
    blockquote{margin:12px 0;padding-left:14px;border-left:3px solid #bbb;color:#555;page-break-inside:avoid;break-inside:avoid}
    pre{padding:12px;background:#f5f5f5;white-space:pre-wrap;word-break:break-word;page-break-inside:avoid;break-inside:avoid}
    code{font-family:Consolas,Monaco,monospace;font-size:.92em}
    img{max-width:100%;page-break-inside:avoid;break-inside:avoid}
    li{page-break-inside:avoid;break-inside:avoid}
    a{color:#111;text-decoration:none}
    hr{border:0;border-top:1px solid #ddd;margin:18px 0}
  </style>${html}`;
  document.body.append(container);
  return container;
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

export async function exportPdf(html, filename = 'aixuno-document.pdf') {
  if (!html.trim()) throw new Error('请先输入需要转换的 Markdown 内容。');
  const html2pdf = await loadPdfExporter();
  const container = createPrintContainer(html);

  try {
    const worker = html2pdf().set({
      margin: [12, 12, 16, 12],
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: pickScale(container),
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: PRINT_WIDTH,
        windowWidth: PRINT_WIDTH,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'], avoid: ['table', 'tr', 'pre', 'blockquote', 'img', 'h1', 'h2', 'h3'] },
    }).from(container);

    await worker.toPdf();
    const pdf = await worker.get('pdf');
    stampPageNumbers(pdf);
    pdf.save(filename);
  } finally {
    container.remove();
  }
}
