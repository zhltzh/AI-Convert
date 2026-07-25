import { renderEnglishHeader, renderEnglishFooter } from '../components/english-shell.js';
import { renderMarkdownEditor } from '../components/markdown-editor.js';
import { renderPreviewPanel } from '../components/preview-panel.js';
import { renderMarkdown } from '../core/markdown-engine.js';
import { exportWord } from '../exporters/word-export.js';

const sample = `# AI content brief\n\nTurn an AI answer into a document you can edit, share, and keep.\n\n## Key points\n\n- No sign-up\n- Processed locally in your browser\n- Supports common Markdown structure\n\n> Copy an answer from ChatGPT, DeepSeek, Claude, or Gemini and export it as a Word file.\n\n| Source | Output |\n| --- | --- |\n| ChatGPT | Word |\n| DeepSeek | Word |`;

document.querySelector('#site-header').innerHTML = renderEnglishHeader();
document.querySelector('#site-footer').innerHTML = renderEnglishFooter();
document.querySelector('#editor-mount').innerHTML = renderMarkdownEditor(sample, { ariaLabel: 'Markdown input', placeholder: 'Paste Markdown from an AI tool…' });
document.querySelector('#preview-mount').innerHTML = renderPreviewPanel();

const input = document.querySelector('#markdown-input');
const preview = document.querySelector('#markdown-preview');
const status = document.querySelector('#converter-status');
const exportButton = document.querySelector('#export-word');
let pendingRender;

async function updatePreview() {
  const request = Symbol('preview'); pendingRender = request; status.textContent = 'Updating preview…';
  try { const html = await renderMarkdown(input.value); if (pendingRender !== request) return; preview.innerHTML = html; status.textContent = input.value.trim() ? 'Preview updated · processed locally' : 'Paste Markdown to begin'; }
  catch (error) { if (pendingRender === request) status.textContent = error.message; }
}
input.addEventListener('input', () => { clearTimeout(input.renderTimer); input.renderTimer = setTimeout(updatePreview, 180); });
exportButton.addEventListener('click', async () => { exportButton.disabled = true; exportButton.textContent = 'Creating document…'; try { await exportWord(await renderMarkdown(input.value), 'ai-convert-document.docx'); status.textContent = 'Your Word document is downloading.'; } catch { status.textContent = 'Unable to create the document. Check your connection and try again.'; } finally { exportButton.disabled = false; exportButton.innerHTML = 'Download Word <span aria-hidden="true">→</span>'; } });
updatePreview();
