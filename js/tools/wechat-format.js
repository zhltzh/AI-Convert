import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { renderMarkdownEditor } from '../components/markdown-editor.js';
import { renderMarkdownUpload, wireMarkdownUpload } from '../components/markdown-upload.js';
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
document.querySelector('#editor-mount').innerHTML = renderMarkdownUpload({ title: '拖入 Markdown 文件，或点击选择', hint: '支持 .md、.markdown · 最大 5MB · 文件仅在本地处理' }) + renderMarkdownEditor(sample);
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

wireMarkdownUpload({
  onFile: async (text) => { input.value = text; await updatePreview(); },
  setStatus: (message, isError) => {
    status.textContent = message;
    status.classList.toggle('converter__status--error', Boolean(isError));
  },
  messages: {
    invalid: '请选择 .md 或 .markdown 格式的文件。',
    large: 'Markdown 文件不能超过 5MB。',
    loaded: '已载入 {name}，可继续排版预览。',
    readError: '无法读取该 Markdown 文件。',
  },
  dropTarget: document.querySelector('#editor-mount')?.closest('.converter-panel'),
});
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
