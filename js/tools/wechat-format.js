import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { renderMarkdownEditor } from '../components/markdown-editor.js';
import { renderPreviewPanel } from '../components/preview-panel.js';
import { renderMarkdown } from '../core/markdown-engine.js';
import { formatWechatHtml } from '../converters/wechat-format.js';

const sample = `# 一份适合微信公众号的 AI 内容

把 AI 生成的内容整理成清晰、易读、可直接发布的文章。

## 为什么需要排版？

> 好的内容需要好的阅读体验。清晰的层级会让读者更容易理解重点。

- 保留文章结构
- 调整标题与引用样式
- 复制到公众号编辑器

## 开始使用

复制内容，选择喜欢的配色，然后一键复制富文本。`;

document.querySelector('#site-header').innerHTML = renderHeader();
document.querySelector('#site-footer').innerHTML = renderFooter();
document.querySelector('#editor-mount').innerHTML = renderMarkdownEditor(sample);
document.querySelector('#preview-mount').innerHTML = renderPreviewPanel();

const input = document.querySelector('#markdown-input');
const preview = document.querySelector('#markdown-preview');
const theme = document.querySelector('#wechat-theme');
const status = document.querySelector('#converter-status');
const copyButton = document.querySelector('#copy-rich-text');
let currentHtml = '';
let renderTimer;

async function updatePreview() {
  status.textContent = '正在更新排版预览…';
  try {
    const html = await renderMarkdown(input.value);
    currentHtml = formatWechatHtml(html, theme.value);
    preview.innerHTML = currentHtml;
    status.textContent = input.value.trim() ? '排版预览已更新 · 内容仅在本地处理' : '等待输入 Markdown 内容';
  } catch (error) { status.textContent = error.message; }
}

input.addEventListener('input', () => { window.clearTimeout(renderTimer); renderTimer = window.setTimeout(updatePreview, 180); });
theme.addEventListener('change', updatePreview);
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([currentHtml], { type: 'text/html' }), 'text/plain': new Blob([preview.innerText], { type: 'text/plain' }) })]);
    status.textContent = '已复制富文本，可粘贴到微信公众号编辑器';
  } catch {
    const range = document.createRange(); range.selectNodeContents(preview); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); document.execCommand('copy'); selection.removeAllRanges(); status.textContent = '已复制排版内容';
  }
});
updatePreview();
