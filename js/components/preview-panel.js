export function renderPreviewPanel() {
  // The preview updates on every keystroke, so it must not be a live region;
  // status messages are announced through the dedicated status element instead.
  return '<div class="preview-panel" id="markdown-preview"></div>';
}
