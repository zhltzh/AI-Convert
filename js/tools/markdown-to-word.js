import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { renderMarkdownEditor } from '../components/markdown-editor.js';
import { renderPreviewPanel } from '../components/preview-panel.js';
import { renderMarkdown } from '../core/markdown-engine.js';
import { exportWord } from '../exporters/word-export.js';

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
editorMount.innerHTML = renderMarkdownEditor(sample);
previewMount.innerHTML = renderPreviewPanel();

const input = document.querySelector('#markdown-input');
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
