import { renderMarkdown } from './core/markdown-engine.js';
import { exportWord } from './exporters/word-export.js';
import { exportPdf } from './exporters/pdf-export.js';
import { formatWechatHtml } from './converters/wechat-format.js';
import { readSpreadsheet } from './converters/excel-to-md.js';
import { readDocxAsMarkdown } from './converters/docx-to-markdown.js';
import { readPdfAsMarkdown } from './converters/pdf-to-markdown.js';
import { downloadBlob } from './core/download.js';

const modes = [
  { id: 'word', target: 'W', title: 'Markdown 转 Word', label: '文档交付', description: '将 Markdown 内容或 MD 文件转为可编辑 Word 文档。', action: '下载 Word' },
  { id: 'pdf', target: 'PDF', title: 'Markdown 转 PDF', label: '保存与打印', description: '将 Markdown 内容或 MD 文件导出为适合分享的 PDF。', action: '下载 PDF' },
  { id: 'wechat', target: '微', title: 'Markdown 转公众号排版', label: '内容发布', description: '生成可复制到微信公众号编辑器的富文本排版。', action: '复制排版内容' },
  { id: 'office', source: 'DOC', target: 'MD', title: '办公文件转 Markdown', label: '资料整理', description: '按 Word、Excel / CSV、PDF 的常用顺序整理办公资料。', action: '转换为 Markdown' },
];

const drafts = new Map();
let activeMode = 'word';

function cardMarkup(mode) {
  const active = mode.id === activeMode;
  const source = mode.source ?? 'MD';
  return `<button class="mode-card mode-card--${mode.id}${active ? ' is-active' : ''}" type="button" role="tab" aria-selected="${active}" aria-controls="workspace" data-mode="${mode.id}"><span class="mode-card__top"><span class="format-glyph" aria-hidden="true"><b>${source}</b><i>→</i><em>${mode.target}</em></span></span><span class="mode-card__label">${mode.label}</span><strong>${mode.title}</strong><span class="mode-card__description">${mode.description}</span></button>`;
}

function markdownWorkspace(mode) {
  const isWechat = mode.id === 'wechat';
  const placeholder = '在这里粘贴 Markdown 内容，例如来自 DeepSeek、豆包、ChatGPT 或 Claude 的回答…';
  return `<div class="workspace__top"><div><p class="eyebrow">${mode.label}</p><h2>${mode.title}</h2><p>${mode.description}</p></div></div><div class="editor-grid"><div class="editor-pane"><div class="pane-title"><label for="home-markdown">Markdown 内容</label><label class="utility-button">上传 MD 文件<input type="file" accept=".md,.markdown,text/markdown,text/plain" data-md-upload /></label></div><textarea id="home-markdown" rows="16" placeholder="${placeholder}">${drafts.get(mode.id) ?? ''}</textarea><p class="field-note">支持标题、列表、表格、引用和代码块。</p></div><div class="preview-pane"><div class="pane-title"><p class="preview-pane__label">实时预览</p><button class="utility-button" type="button" id="copy-preview">复制预览</button></div><article id="home-preview" class="markdown-preview"><p class="preview-empty">粘贴内容后，会在这里显示预览。</p></article></div></div><div class="workspace__actions"><span class="status" id="workspace-status">支持 DeepSeek、豆包、腾讯元宝、通义千问、文心一言、ChatGPT、Claude 等 AI 内容；内容只在当前浏览器中处理。</span><button class="button button--primary" type="button" id="workspace-action">${mode.action}</button>${isWechat ? '<button class="button button--secondary" type="button" id="wechat-theme">切换简洁主题</button>' : ''}</div>`;
}

function officeWorkspace() {
  return `<div class="workspace__top"><div><p class="eyebrow">资料整理</p><h3>办公文件转 Markdown</h3><p>支持单个 Word、Excel / CSV、PDF 文件本地转换。</p></div></div><div class="office-types" role="list"><span role="listitem" class="office-type is-ready">Word <small>.docx 可转换</small></span><span role="listitem" class="office-type is-ready">Excel / CSV <small>可转换</small></span><span role="listitem" class="office-type is-ready">PDF <small>文本可转换</small></span></div><div class="office-upload"><label class="drop-zone" for="office-file"><strong>上传办公文件</strong><span>支持 .docx、.xlsx、.xls、.csv、.pdf；单个文件不超过 20MB<br />旧版 .doc 请先在 Word 或 WPS 中另存为 .docx</span><input id="office-file" type="file" accept=".doc,.docx,.xlsx,.xls,.csv,.pdf,text/csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" /></label><div class="office-result"><p class="preview-pane__label">Markdown 结果</p><textarea id="office-output" rows="10" readonly placeholder="转换后的 Markdown 内容会显示在这里。"></textarea></div></div><div class="workspace__actions"><span class="status" id="workspace-status">文件只在当前浏览器中读取和处理。</span><button class="button button--secondary" type="button" id="copy-office" disabled>复制 Markdown</button><button class="button button--primary" type="button" id="download-office" disabled>下载 MD 文件</button></div>`;
}

async function copyText(value) {
  if (!value) throw new Error('请先生成内容。');
  await navigator.clipboard.writeText(value);
}

async function copyRichText(html) {
  if (!html) throw new Error('请先输入需要排版的 Markdown 内容。');
  const text = new DOMParser().parseFromString(html, 'text/html').body.innerText;
  if (globalThis.ClipboardItem && navigator.clipboard?.write) {
    await navigator.clipboard.write([new ClipboardItem({
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([text], { type: 'text/plain' }),
    })]);
    return;
  }
  const helper = document.createElement('div');
  helper.contentEditable = 'true';
  helper.style.cssText = 'position:fixed;left:-9999px;top:0;';
  helper.innerHTML = html;
  document.body.append(helper);
  const range = document.createRange();
  range.selectNodeContents(helper);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  document.execCommand('copy');
  selection.removeAllRanges();
  helper.remove();
}

function setStatus(message, isError = false) {
  const status = document.querySelector('#workspace-status');
  status.textContent = message;
  status.classList.toggle('status--error', isError);
}

async function wireMarkdownWorkspace(mode) {
  const input = document.querySelector('#home-markdown');
  const preview = document.querySelector('#home-preview');
  const updatePreview = async () => {
    drafts.set(mode.id, input.value);
    try { preview.innerHTML = (await renderMarkdown(input.value)) || '<p class="preview-empty">粘贴内容后，会在这里显示预览。</p>'; }
    catch (error) { setStatus(error.message, true); }
  };
  input.addEventListener('input', updatePreview);
  document.querySelector('[data-md-upload]').addEventListener('change', async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setStatus('MD 文件不能超过 5MB。', true); return; }
    input.value = await file.text();
    await updatePreview();
    setStatus(`已载入 ${file.name}，可直接${mode.action}。`);
  });
  await updatePreview();
  document.querySelector('#workspace-action').addEventListener('click', async () => {
    try {
      const html = await renderMarkdown(input.value);
      if (mode.id === 'word') await exportWord(html, 'markdown-to-word.docx');
      if (mode.id === 'pdf') await exportPdf(html, 'markdown-to-pdf.pdf');
      if (mode.id === 'wechat') {
        await copyRichText(formatWechatHtml(html));
        setStatus('已复制富文本排版，可粘贴到微信公众号编辑器。');
        return;
      }
      setStatus('文件已开始下载。');
    } catch (error) { setStatus(error.message, true); }
  });
  document.querySelector('#copy-preview').addEventListener('click', async () => {
    try {
      const html = await renderMarkdown(input.value);
      await copyRichText(html);
      setStatus('预览内容已复制，可直接粘贴到 Word、飞书或其他支持富文本的编辑器。');
    } catch (error) { setStatus(error.message, true); }
  });
  document.querySelector('#wechat-theme')?.addEventListener('click', () => setStatus('公众号主题将在下一版提供多种可选样式。'));
}

function wireOfficeWorkspace() {
  const fileInput = document.querySelector('#office-file');
  const output = document.querySelector('#office-output');
  const copyButton = document.querySelector('#copy-office');
  const downloadButton = document.querySelector('#download-office');
  fileInput.addEventListener('change', async () => {
    output.value = '';
    copyButton.disabled = true;
    downloadButton.disabled = true;
    try {
      const [file] = fileInput.files;
      if (!file) return;
      setStatus('正在本地读取文件…');
      const extension = file.name?.split('.').pop()?.toLowerCase();
      if (extension === 'docx' || extension === 'doc') {
        const result = await readDocxAsMarkdown(file);
        output.value = result.markdown;
        setStatus(result.warnings.length ? `文档已转换，但有 ${result.warnings.length} 条格式提示，请检查结果。` : `已转换 ${file.name}。`);
      } else if (extension === 'pdf') {
        const result = await readPdfAsMarkdown(file);
        output.value = result.markdown;
        setStatus(result.imagePages ? `已转换 ${file.name}。其中 ${result.imagePages} 页含图片或图形，当前结果保留文字内容。` : `已转换 ${file.name}。`);
      } else {
        const spreadsheet = await readSpreadsheet(file);
        output.value = spreadsheet.toMarkdown(spreadsheet.sheetNames[0]);
        setStatus(`已转换 ${file.name} 的“${spreadsheet.sheetNames[0]}”工作表。`);
      }
      copyButton.disabled = !output.value;
      downloadButton.disabled = !output.value;
    } catch (error) { setStatus(error.message, true); }
  });
  copyButton.addEventListener('click', async () => { try { await copyText(output.value); setStatus('Markdown 已复制。'); } catch (error) { setStatus(error.message, true); } });
  downloadButton.addEventListener('click', () => { downloadBlob(new Blob([output.value], { type: 'text/markdown;charset=utf-8' }), 'office-file.md'); setStatus('MD 文件已开始下载。'); });
}

async function renderWorkspace(workspace) {
  const mode = modes.find((item) => item.id === activeMode);
  workspace.classList.remove('workspace--enter');
  workspace.innerHTML = activeMode === 'office' ? officeWorkspace() : markdownWorkspace(mode);
  requestAnimationFrame(() => workspace.classList.add('workspace--enter'));
  if (activeMode === 'office') wireOfficeWorkspace(); else await wireMarkdownWorkspace(mode);
}

export async function mountHomeWorkspace({ cards, workspace }) {
  const renderCards = () => { cards.className = `mode-cards mode-cards--${activeMode}`; cards.innerHTML = modes.map(cardMarkup).join(''); };
  renderCards();
  cards.addEventListener('click', async (event) => {
    const card = event.target.closest('[data-mode]');
    if (!card || card.dataset.mode === activeMode) return;
    activeMode = card.dataset.mode;
    renderCards();
    await renderWorkspace(workspace);
    workspace.querySelector('textarea:not([readonly])')?.focus();
  });
  await renderWorkspace(workspace);
}
