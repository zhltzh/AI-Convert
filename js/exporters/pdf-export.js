const HTML2PDF_CDN = 'https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js';
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

async function loadPdfExporter() {
  if (typeof globalThis.html2pdf === 'function') return globalThis.html2pdf;
  exporterLoader ??= loadScript(HTML2PDF_CDN).then(() => {
    if (typeof globalThis.html2pdf !== 'function') throw new Error('PDF 导出组件加载失败。');
    return globalThis.html2pdf;
  });
  return exporterLoader;
}

function createPrintContainer(html) {
  const container = document.createElement('article');
  container.setAttribute('aria-hidden', 'true');
  container.style.cssText = 'position:fixed;left:-100000px;top:0;width:794px;padding:56px;background:#fff;color:#111;font-family:Arial,"Microsoft YaHei",sans-serif;font-size:14px;line-height:1.7;';
  container.innerHTML = `<style>
    h1,h2,h3{line-height:1.25} h1{font-size:30px} h2{font-size:24px} h3{font-size:19px}
    table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:8px;text-align:left} th{background:#f5f5f5}
    blockquote{margin-left:0;padding-left:14px;border-left:3px solid #999;color:#555} pre{padding:12px;background:#f5f5f5;white-space:pre-wrap}
    img{max-width:100%} a{color:#111;text-decoration:none}
  </style>${html}`;
  document.body.append(container);
  return container;
}

export async function exportPdf(html, filename = 'aixuno-document.pdf') {
  if (!html.trim()) throw new Error('请先输入需要转换的 Markdown 内容。');
  const html2pdf = await loadPdfExporter();
  const container = createPrintContainer(html);

  try {
    await html2pdf()
      .set({
        filename,
        margin: [10, 10, 12, 10],
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] },
      })
      .from(container)
      .save();
  } finally {
    container.remove();
  }
}
