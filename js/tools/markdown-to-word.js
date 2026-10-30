import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { renderMarkdownEditor } from '../components/markdown-editor.js';
import { renderMarkdownUpload, wireMarkdownUpload } from '../components/markdown-upload.js';
import { renderPreviewPanel } from '../components/preview-panel.js';
import { renderMarkdown } from '../core/markdown-engine.js';
import { exportWord } from '../exporters/word-export.js';
import { mountDownloadTray } from '../components/download-tray.js';

const sample = `# AI 内容整理示例

将 AI 生成的内容整理为一份可分享的专业文档。

## 核心价值

- 无需登录
- 浏览器本地处理
- 支持常见 Markdown 格式

> 复制 AI 的回答，选择格式，马上开始使用。

| 平台 | 可转换格式 |
| --- | --- |
| DeepSeek | Word、PDF |
| ChatGPT | Word、PDF |`;

const header = document.querySelector('#site-header');
const footer = document.querySelector('#site-footer');
const editorMount = document.querySelector('#editor-mount');
const previewMount = document.querySelector('#preview-mount');
const status = document.querySelector('#converter-status');
const exportButton = document.querySelector('#export-word');

header.innerHTML = renderHeader();
footer.innerHTML = renderFooter();
editorMount.innerHTML = renderMarkdownUpload({ title: '拖入 Markdown 文件，或点击选择', hint: '支持 .md、.markdown · 最大 5MB · 文件仅在本地处理' }) + renderMarkdownEditor(sample);
previewMount.innerHTML = renderPreviewPanel();

const input = document.querySelector('#markdown-input');
// The page ships with a demo sample; it should not float a download prompt on its own.
const initialSample = input.value;
const preview = document.querySelector('#markdown-preview');
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
    if (pendingRender !== request) return;
    status.textContent = error.message;
  }
}

input.addEventListener('input', () => {
  window.clearTimeout(input.renderTimer);
  input.renderTimer = window.setTimeout(updatePreview, 180);
});

wireMarkdownUpload({
  onFile: async (text) => { input.value = text; await updatePreview(); },
  // Dropping anywhere in the left panel, not just the dashed box, loads the file.
  dropTarget: document.querySelector('[aria-labelledby="input-title"]') || document.querySelector('.converter-panel'),
  setStatus: (message, isError) => {
    status.textContent = message;
    status.classList.toggle('converter__status--error', Boolean(isError));
  },
  messages: {
    invalid: '请选择 .md 或 .markdown 格式的文件。',
    large: 'Markdown 文件不能超过 5MB。',
    loaded: '已载入 {name}，可直接生成 Word。',
    readError: '无法读取该 Markdown 文件。',
  },
});

exportButton.addEventListener('click', async () => {
  exportButton.disabled = true;
  exportButton.textContent = '正在生成…';
  try {
    const html = await renderMarkdown(input.value);
    await exportWord(html);
    status.textContent = 'Word 文件已开始下载';
  } catch (error) {
    status.textContent = error.message;
  } finally {
    exportButton.disabled = false;
    exportButton.innerHTML = '生成 Word <span aria-hidden="true">↓</span>';
  }
});

updatePreview();
mountDownloadTray({ triggers: [exportButton], canShow: () => input.value.trim().length > 0 && input.value !== initialSample });
