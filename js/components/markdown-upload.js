const MAX_SIZE = 5 * 1024 * 1024;
const VALID_EXTENSION = /\.(md|markdown)$/i;

export function renderMarkdownUpload(text) {
  return `<label class="markdown-drop-zone" data-md-drop for="markdown-file" tabindex="0"><input id="markdown-file" type="file" accept=".md,.markdown,text/markdown" data-md-upload /><span class="markdown-drop-zone__icon" aria-hidden="true">↥</span><strong>${text.title}</strong><span>${text.hint}</span></label>`;
}

export function wireMarkdownUpload({ onFile, setStatus, messages }) {
  const zone = document.querySelector('[data-md-drop]');
  const input = zone.querySelector('[data-md-upload]');
  const load = async file => {
    if (!file) return;
    if (!VALID_EXTENSION.test(file.name)) return setStatus(messages.invalid, true);
    if (file.size > MAX_SIZE) return setStatus(messages.large, true);
    try { await onFile(await file.text(), file); setStatus(messages.loaded.replace('{name}', file.name)); }
    catch (error) { setStatus(error.message || messages.readError, true); }
  };
  input.addEventListener('change', () => load(input.files[0]));
  ['dragenter', 'dragover'].forEach(name => zone.addEventListener(name, event => { event.preventDefault(); zone.classList.add('is-dragover'); }));
  ['dragleave', 'drop'].forEach(name => zone.addEventListener(name, event => { event.preventDefault(); zone.classList.remove('is-dragover'); }));
  zone.addEventListener('drop', event => load(event.dataTransfer.files[0]));
  zone.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); input.click(); } });
}
