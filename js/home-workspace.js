import { renderMarkdown } from './core/markdown-engine.js';
import { exportWord } from './exporters/word-export.js';
import { exportPdf } from './exporters/pdf-export.js';
import { exportTablesToXlsx, parseMarkdownTables, tableToCsv, tableToTsv } from './converters/markdown-table.js';
import { readSpreadsheet } from './converters/excel-to-md.js';
import { readDocxAsMarkdown } from './converters/docx-to-markdown.js';
import { readPdfAsMarkdown } from './converters/pdf-to-markdown.js';
import { downloadBlob } from './core/download.js';
import { renderMarkdownUpload, wireMarkdownUpload } from './components/markdown-upload.js';

const modes = [
  { id: 'word', target: 'W', title: 'Markdown 转 Word', label: '文档交付', description: '将 Markdown 内容或 MD 文件转为可编辑 Word 文档。', action: '下载 Word' },
  { id: 'pdf', target: 'PDF', title: 'Markdown 转 PDF', label: '保存与打印', description: '将 Markdown 内容或 MD 文件导出为适合分享的 PDF。', action: '下载 PDF' },
  { id: 'table', target: 'XLS', title: 'Markdown 表格转 Excel', label: '表格整理', description: '识别 Markdown 表格，导出 Excel 或 CSV 文件。', action: '下载 Excel' },
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
  const placeholder = '在这里粘贴 Markdown 内容，例如来自 DeepSeek、豆包、ChatGPT 或 Claude 的回答…';
  return `<div class="workspace__top"><div><p class="eyebrow">${mode.label}</p><h2>${mode.title}</h2><p>${mode.description}</p></div></div><div class="editor-grid"><div class="editor-pane"><div class="pane-title"><label for="home-markdown">Markdown 内容</label></div>${renderMarkdownUpload({title:'将 Markdown 文件拖到这里，或点击选择文件',hint:'支持 .md、.markdown · 最大 5MB · 文件仅在本地处理'})}<textarea id="home-markdown" rows="16" placeholder="${placeholder}">${drafts.get(mode.id) ?? ''}</textarea><p class="field-note">支持标题、列表、表格、引用和代码块。</p></div><div class="preview-pane"><div class="pane-title"><p class="preview-pane__label">实时预览</p><button class="utility-button" type="button" id="copy-preview">复制预览</button></div><article id="home-preview" class="markdown-preview"><p class="preview-empty">粘贴内容后，会在这里显示预览。</p></article></div></div><div class="workspace__actions"><span class="status" id="workspace-status">支持 DeepSeek、豆包、腾讯元宝、通义千问、文心一言、ChatGPT、Claude 等 AI 内容；内容只在当前浏览器中处理。</span><button class="button button--primary" type="button" id="workspace-action">${mode.action}</button></div>`;
}

function tableWorkspace() {
  const sample = drafts.get('table') ?? '| 项目 | 数量 | 备注 |\n| --- | ---: | --- |\n| 示例 A | 10 | 可直接导出 |\n| 示例 B | 20 | 中文内容正常 |';
  return `<div class="workspace__top"><div><p class="eyebrow">表格整理</p><h2>Markdown 表格转 Excel / CSV</h2><p>粘贴 AI 生成的 Markdown 表格，在本地导出为可编辑表格。</p></div></div><div class="editor-grid"><div class="editor-pane"><div class="pane-title"><label for="home-markdown">Markdown 表格</label></div><textarea id="home-markdown" rows="16" placeholder="粘贴包含 | 列头 | 的 Markdown 表格…">${sample}</textarea><p class="field-note">可同时识别多个表格；Excel 中每个表格会生成一个工作表。</p></div><div class="preview-pane"><div class="pane-title"><p class="preview-pane__label">表格预览</p><span id="table-count">0 个表格</span></div><article id="home-preview" class="markdown-preview"></article></div></div><div class="workspace__actions"><span class="status" id="workspace-status">内容只在当前浏览器中解析和导出。</span><button class="button button--secondary" type="button" id="copy-table">复制到 Excel</button><button class="button button--secondary" type="button" id="download-csv">下载 CSV</button><button class="button button--primary" type="button" id="download-xlsx">下载 Excel</button></div>`;
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
  wireMarkdownUpload({onFile:async text=>{input.value=text;await updatePreview();},setStatus,messages:{invalid:'请选择 .md 或 .markdown 格式的文件。',large:'Markdown 文件不能超过 5MB。',loaded:'已载入 {name}，可直接转换或导出。',readError:'无法读取该 Markdown 文件。'}});
  await updatePreview();
  document.querySelector('#workspace-action').addEventListener('click', async () => {
    try {
      const html = await renderMarkdown(input.value);
      if (mode.id === 'word') await exportWord(html, 'markdown-to-word.docx');
      if (mode.id === 'pdf') await exportPdf(html, 'markdown-to-pdf.pdf');
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
}

function wireTableWorkspace() {
  const input = document.querySelector('#home-markdown');
  const preview = document.querySelector('#home-preview');
  const count = document.querySelector('#table-count');
  let tables = [];
  const update = async () => {
    drafts.set('table', input.value);
    tables = parseMarkdownTables(input.value);
    count.textContent = `${tables.length} 个表格`;
    preview.innerHTML = tables.length ? await renderMarkdown(input.value) : '<p class="preview-empty">未识别到 Markdown 表格，请检查表头下方是否有 <code>| --- |</code> 分隔行。</p>';
  };
  input.addEventListener('input', update);
  document.querySelector('#copy-table').addEventListener('click', async () => {
    try { if (!tables.length) throw new Error('没有找到可复制的 Markdown 表格。'); await copyText(tableToTsv(tables[0])); setStatus('第一个表格已复制，可直接粘贴到 Excel 或 WPS。'); } catch (error) { setStatus(error.message, true); }
  });
  document.querySelector('#download-csv').addEventListener('click', () => {
    try { if (!tables.length) throw new Error('没有找到可导出的 Markdown 表格。'); downloadBlob(new Blob(['\ufeff', tableToCsv(tables[0])], { type: 'text/csv;charset=utf-8' }), 'markdown-table.csv'); setStatus('CSV 文件已开始下载。'); } catch (error) { setStatus(error.message, true); }
  });
  document.querySelector('#download-xlsx').addEventListener('click', async () => {
    try { await exportTablesToXlsx(tables); setStatus('Excel 文件已开始下载。'); } catch (error) { setStatus(error.message, true); }
  });
  update();
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
  workspace.innerHTML = activeMode === 'office' ? officeWorkspace() : activeMode === 'table' ? tableWorkspace() : markdownWorkspace(mode);
  requestAnimationFrame(() => workspace.classList.add('workspace--enter'));
  if (activeMode === 'office') wireOfficeWorkspace(); else if (activeMode === 'table') wireTableWorkspace(); else await wireMarkdownWorkspace(mode);
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
