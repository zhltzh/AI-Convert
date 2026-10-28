import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { renderMarkdownEditor } from '../components/markdown-editor.js';
import { renderMarkdownUpload, wireMarkdownUpload } from '../components/markdown-upload.js';
import { renderPreviewPanel } from '../components/preview-panel.js';
import { renderMarkdown } from '../core/markdown-engine.js';
import { exportPdf } from '../exporters/pdf-export.js';
import { printDocument } from '../exporters/print-pdf.js';
import { mountDownloadTray } from '../components/download-tray.js';

const sample = `# AI 内容整理示例

将 AI 生成的内容转换为一份清晰、便于分享的 PDF 文档。

## 文档内容

1. 复制 AI 生成内容
2. 选择需要的格式
3. 下载并分享文档

> Aixuno 的所有转换都在浏览器本地完成。

\`\`\`text
Markdown → HTML → PDF
\`\`\``;

document.querySelector('#site-header').innerHTML = renderHeader();
document.querySelector('#site-footer').innerHTML = renderFooter();
document.querySelector('#editor-mount').innerHTML = renderMarkdownUpload({ title: '拖入 Markdown 文件，或点击选择', hint: '支持 .md、.markdown · 最大 5MB · 文件仅在本地处理' }) + renderMarkdownEditor(sample);
document.querySelector('#preview-mount').innerHTML = renderPreviewPanel();

const input = document.querySelector('#markdown-input');
const preview = document.querySelector('#markdown-preview');
const status = document.querySelector('#converter-status');
const exportButton = document.querySelector('#export-pdf');
let pendingRender;

async function updatePreview() {
  const request = Symbol('preview');
  pendingRender = request;
  status.textContent = '正在更新预览…';
  try {
    const html = await renderMarkdown(input.value);
    if (pendingRender !== request) return;
    preview.innerHTML = html;
    status.textContent = input.value.trim() ? '预览已更新 · 内容仅在本地处理' : '等待输入 Markdown 内容';
  } catch (error) {
    if (pendingRender === request) status.textContent = error.message;
  }
}

input.addEventListener('input', () => {
  window.clearTimeout(input.renderTimer);
  input.renderTimer = window.setTimeout(updatePreview, 180);
});

wireMarkdownUpload({
  onFile: async (text) => { input.value = text; await updatePreview(); },
  setStatus: (message, isError) => {
    status.textContent = message;
    status.classList.toggle('converter__status--error', Boolean(isError));
  },
  messages: {
    invalid: '请选择 .md 或 .markdown 格式的文件。',
    large: 'Markdown 文件不能超过 5MB。',
    loaded: '已载入 {name}，可直接生成 PDF。',
    readError: '无法读取该 Markdown 文件。',
  },
  dropTarget: document.querySelector('#editor-mount')?.closest('.converter-panel'),
});

exportButton.addEventListener('click', async () => {
  exportButton.disabled = true;
  exportButton.textContent = '正在生成…';
  try {
    await exportPdf(preview.innerHTML);
    status.textContent = 'PDF 文件已开始下载';
  } catch (error) {
    status.textContent = error.message;
  } finally {
    exportButton.disabled = false;
    exportButton.innerHTML = '生成 PDF <span aria-hidden="true">↓</span>';
  }
});

document.querySelector('#print-pdf')?.addEventListener('click', async () => {
  try {
    await printDocument(preview.innerHTML, 'Markdown 转 PDF');
    status.textContent = '已打开打印窗口：目标选择「另存为 PDF」即可得到文字可选、可搜索的 PDF';
  } catch (error) {
    status.textContent = error.message;
  }
});

updatePreview();
mountDownloadTray({ triggers: [exportButton] });
