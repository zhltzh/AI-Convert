const PRINT_CSS = `
  @page { size: A4 portrait; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #111; font-family: "PingFang SC", "Microsoft YaHei", Arial, sans-serif; font-size: 14px; line-height: 1.7; }
  h1, h2, h3, h4 { line-height: 1.3; break-after: avoid; page-break-after: avoid; }
  h1 { font-size: 26px; margin: 0 0 12px; }
  h2 { font-size: 21px; margin: 22px 0 10px; }
  h3 { font-size: 17px; margin: 18px 0 8px; }
  p, ul, ol { margin: 0 0 10px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  thead { display: table-header-group; }
  tr, img, pre, blockquote, li { break-inside: avoid; page-break-inside: avoid; }
  th, td { border: 1px solid #cccccc; padding: 7px 9px; text-align: left; vertical-align: top; word-break: break-word; }
  th { background: #f5f5f5; }
  blockquote { margin: 12px 0; padding-left: 14px; border-left: 3px solid #bbbbbb; color: #555; }
  pre { padding: 12px; background: #f5f5f5; white-space: pre-wrap; word-break: break-word; }
  code { font-family: Consolas, Monaco, monospace; font-size: .92em; }
  img { max-width: 100%; height: auto; }
  a { color: inherit; text-decoration: none; }
  hr { border: 0; border-top: 1px solid #dddddd; margin: 18px 0; }
`;

export function buildPrintHtml(html, title = 'Aixuno 文档') {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>${PRINT_CSS}</style></head><body>${html}</body></html>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character]));
}

/**
 * Prints the document through the browser, which produces a real text PDF
 * (selectable, searchable, correct CJK glyphs) instead of a rasterised canvas.
 */
export async function printDocument(html, title = 'Aixuno 文档') {
  if (!html.trim()) throw new Error('请先输入需要转换的 Markdown 内容。');

  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.setAttribute('title', title);
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
  frame.srcdoc = buildPrintHtml(html, title);
  document.body.append(frame);

  await new Promise((resolve) => {
    if (frame.contentDocument?.readyState === 'complete') resolve();
    else frame.addEventListener('load', resolve, { once: true });
  });

  const frameDocument = frame.contentDocument;
  try {
    await Promise.all(Array.from(frameDocument.images).map((image) => (
      image.complete ? Promise.resolve() : new Promise((resolve) => { image.onload = resolve; image.onerror = resolve; })
    )));
    if (frameDocument.fonts?.ready) await frameDocument.fonts.ready;
    frame.contentWindow.focus();
    frame.contentWindow.print();
  } finally {
    window.setTimeout(() => frame.remove(), 2000);
  }
}
