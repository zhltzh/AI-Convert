import { renderEnglishHeader, renderEnglishFooter } from '../components/english-shell.js';
import { renderMarkdownEditor } from '../components/markdown-editor.js';
import { renderPreviewPanel } from '../components/preview-panel.js';
import { renderMarkdown } from '../core/markdown-engine.js';
import { exportPdf } from '../exporters/pdf-export.js';

const sample = `# AI content brief\n\nCreate a clean PDF from an AI-generated Markdown answer.\n\n## Three steps\n\n1. Paste your content\n2. Check the preview\n3. Download a shareable PDF\n\n> Aixuno handles the conversion locally in your browser.`;

document.querySelector('#site-header').innerHTML = renderEnglishHeader();
document.querySelector('#site-footer').innerHTML = renderEnglishFooter();
document.querySelector('#editor-mount').innerHTML = renderMarkdownEditor(sample, { ariaLabel: 'Markdown input', placeholder: 'Paste Markdown from an AI tool…' });
document.querySelector('#preview-mount').innerHTML = renderPreviewPanel();

const input = document.querySelector('#markdown-input'); const preview = document.querySelector('#markdown-preview'); const status = document.querySelector('#converter-status'); const exportButton = document.querySelector('#export-pdf'); let pendingRender;
async function updatePreview() { const request = Symbol('preview'); pendingRender = request; status.textContent = 'Updating preview…'; try { const html = await renderMarkdown(input.value); if (pendingRender !== request) return; preview.innerHTML = html; status.textContent = input.value.trim() ? 'Preview updated · processed locally' : 'Paste Markdown to begin'; } catch (error) { if (pendingRender === request) status.textContent = error.message; } }
input.addEventListener('input', () => { clearTimeout(input.renderTimer); input.renderTimer = setTimeout(updatePreview, 180); });
exportButton.addEventListener('click', async () => { exportButton.disabled = true; exportButton.textContent = 'Creating PDF…'; try { await exportPdf(preview.innerHTML, 'ai-convert-document.pdf'); status.textContent = 'Your PDF is downloading.'; } catch { status.textContent = 'Unable to create the PDF. Check your connection and try again.'; } finally { exportButton.disabled = false; exportButton.innerHTML = 'Download PDF <span aria-hidden="true">→</span>'; } });
updatePreview();
