export function renderMarkdownEditor(initialValue = '') {
  return `<textarea class="markdown-editor" id="markdown-input" aria-label="Markdown 输入" placeholder="粘贴 DeepSeek、ChatGPT 等 AI 生成的 Markdown 内容…">${initialValue}</textarea>`;
}
