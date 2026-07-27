import { renderEnglishHeader, renderEnglishFooter } from '../components/english-shell.js';
import { renderMarkdownEditor } from '../components/markdown-editor.js';
import { renderPreviewPanel } from '../components/preview-panel.js';
import { renderMarkdown } from '../core/markdown-engine.js';

const sample = `# AI research summary

Convert useful AI output into **clean HTML** for a blog, CMS, email, or static website.

## Supported workflow

1. Paste Markdown
2. Review the HTML
3. Copy or download the result

> Everything is processed locally in your browser.`;

document.querySelector('#site-header').innerHTML = renderEnglishHeader();
document.querySelector('#site-footer').innerHTML = renderEnglishFooter();
document.querySelector('#editor-mount').innerHTML = renderMarkdownEditor(sample, { ariaLabel: 'Markdown input', placeholder: 'Paste Markdown from ChatGPT, Claude, Gemini, Copilot, or Perplexity…' });
document.querySelector('#preview-mount').innerHTML = renderPreviewPanel();

const input = document.querySelector('#markdown-input');
const preview = document.querySelector('#markdown-preview');
const output = document.querySelector('#html-output');
const status = document.querySelector('#converter-status');
const copyButton = document.querySelector('#copy-html');
const downloadButton = document.querySelector('#download-html');
let pendingRender;

async function updateOutput() {
  const request = Symbol('render');
  pendingRender = request;
  status.textContent = 'Updating HTML…';
  try {
    const html = await renderMarkdown(input.value);
    if (pendingRender !== request) return;
    preview.innerHTML = html || '<p>Paste Markdown to see a preview.</p>';
    output.value = html;
    status.textContent = input.value.trim() ? 'HTML updated · processed locally' : 'Paste Markdown to begin';
  } catch (error) {
    if (pendingRender === request) status.textContent = error.message;
  }
}

input.addEventListener('input', () => {
  clearTimeout(input.renderTimer);
  input.renderTimer = setTimeout(updateOutput, 180);
});

copyButton.addEventListener('click', async () => {
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
    status.textContent = 'HTML copied to your clipboard.';
  } catch {
    output.focus();
    output.select();
    status.textContent = 'Select and copy the HTML manually.';
  }
});

downloadButton.addEventListener('click', () => {
  if (!output.value) return;
  const documentHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Aixuno HTML document</title>
</head>
<body>
${output.value}
</body>
</html>
`;
  const url = URL.createObjectURL(new Blob([documentHtml], { type: 'text/html;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'aixuno-document.html';
  link.click();
  URL.revokeObjectURL(url);
  status.textContent = 'Your HTML file is downloading.';
});

updateOutput();
