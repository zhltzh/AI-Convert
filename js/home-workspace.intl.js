import { renderMarkdown } from './core/markdown-engine.js';
import { exportWord } from './exporters/word-export.js';
import { exportPdf } from './exporters/pdf-export.js';
import { readSpreadsheet } from './converters/excel-to-md.js';
import { readDocxAsMarkdown } from './converters/docx-to-markdown.js';
import { readPdfAsMarkdown } from './converters/pdf-to-markdown.js';
import { downloadBlob } from './core/download.js';
import { getLocale } from './i18n/home-locales.js';
import { renderMarkdownUpload, wireMarkdownUpload } from './components/markdown-upload.js';

const locale = getLocale();
const uploadCopy = {
  en:{title:'Drop a Markdown file here, or click to choose',hint:'Supports .md and .markdown · 5 MB max · processed locally',invalid:'Choose a .md or .markdown file.',readError:'This Markdown file could not be read.',loaded:'Loaded {name}. You can export it now.'},
  es:{title:'Arrastra un archivo Markdown aquí o haz clic para elegirlo',hint:'Admite .md y .markdown · máximo 5 MB · procesamiento local',invalid:'Elige un archivo .md o .markdown.',readError:'No se pudo leer el archivo Markdown.',loaded:'{name} cargado. Ya puedes exportarlo.'},
  de:{title:'Markdown-Datei hier ablegen oder zum Auswählen klicken',hint:'Unterstützt .md und .markdown · max. 5 MB · lokale Verarbeitung',invalid:'Bitte eine .md- oder .markdown-Datei auswählen.',readError:'Die Markdown-Datei konnte nicht gelesen werden.',loaded:'{name} geladen. Die Datei kann jetzt exportiert werden.'},
  ja:{title:'Markdownファイルをここにドロップ、またはクリックして選択',hint:'.md・.markdown対応 · 最大5MB · ローカル処理',invalid:'.mdまたは.markdownファイルを選択してください。',readError:'Markdownファイルを読み込めませんでした。',loaded:'{name}を読み込みました。書き出しできます。'},
  fr:{title:'Déposez un fichier Markdown ici ou cliquez pour le choisir',hint:'Formats .md et .markdown · 5 Mo max. · traitement local',invalid:'Choisissez un fichier .md ou .markdown.',readError:'Impossible de lire ce fichier Markdown.',loaded:'{name} chargé. Vous pouvez maintenant l’exporter.'}
}[locale.code];
locale.workspace.drop = uploadCopy;
locale.workspace.fileInvalid = uploadCopy.invalid;
locale.workspace.fileReadError = uploadCopy.readError;
locale.workspace.loaded = uploadCopy.loaded;
const modes = locale.modes;
const drafts = new Map();
let activeMode = document.body.dataset.mode || new URLSearchParams(location.search).get('mode') || 'word';
if (!modes.some(mode => mode.id === activeMode)) activeMode = 'word';

function cardMarkup(mode) {
  const active = mode.id === activeMode;
  const source = mode.source ?? 'MD';
  return `<button class="mode-card mode-card--${mode.id}${active ? ' is-active' : ''}" type="button" role="tab" aria-selected="${active}" aria-controls="workspace" data-mode="${mode.id}"><span class="mode-card__top"><span class="format-glyph" aria-hidden="true"><b>${source}</b><i>→</i><em>${mode.target}</em></span></span><span class="mode-card__label">${mode.label}</span><strong>${mode.title}</strong><span class="mode-card__description">${mode.description}</span></button>`;
}

function markdownWorkspace(mode) {
  const t = locale.workspace;
  const htmlExtra = mode.id === 'html' ? '<button class="button button--secondary" type="button" id="download-html">Download HTML</button>' : '';
  return `<div class="workspace__top"><div><p class="eyebrow">${mode.label}</p><h2>${mode.title}</h2><p>${mode.description}</p></div></div><div class="editor-grid"><div class="editor-pane"><div class="pane-title"><label for="home-markdown">${t.input}</label></div>${renderMarkdownUpload(t.drop)}<textarea id="home-markdown" rows="16" placeholder="${t.placeholder}">${drafts.get(mode.id) ?? ''}</textarea><p class="field-note">${t.support}</p></div><div class="preview-pane"><div class="pane-title"><p class="preview-pane__label">${t.preview}</p><button class="utility-button" type="button" id="copy-preview">${t.copyPreview}</button></div><article id="home-preview" class="markdown-preview"><p class="preview-empty">${t.empty}</p></article></div></div><div class="workspace__actions"><span class="status" id="workspace-status">${t.privacy}</span><button class="button button--primary" type="button" id="workspace-action">${mode.action}</button>${htmlExtra}</div>`;
}

function officeWorkspace() {
  const t = locale.office;
  return `<div class="workspace__top"><div><p class="eyebrow">${t.eyebrow}</p><h2>${t.title}</h2><p>${t.lead}</p></div></div><div class="office-types" role="list"><span role="listitem" class="office-type is-ready">Word <small>.docx</small></span><span role="listitem" class="office-type is-ready">Excel / CSV <small>.xlsx · .xls · .csv</small></span><span role="listitem" class="office-type is-ready">PDF <small>text PDF</small></span></div><div class="office-upload"><label class="drop-zone" for="office-file"><strong>${t.upload}</strong><span>${t.hint}</span><input id="office-file" type="file" accept=".doc,.docx,.xlsx,.xls,.csv,.pdf,text/csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" /></label><div class="office-result"><p class="preview-pane__label">${t.result}</p><textarea id="office-output" rows="10" readonly placeholder="${t.placeholder}"></textarea></div></div><div class="workspace__actions"><span class="status" id="workspace-status">${t.privacy}</span><button class="button button--secondary" type="button" id="copy-office" disabled>${t.copy}</button><button class="button button--primary" type="button" id="download-office" disabled>${t.download}</button></div>`;
}

async function copyRichText(html) {
  if (!html) throw new Error(locale.workspace.needContent);
  const text = new DOMParser().parseFromString(html, 'text/html').body.innerText;
  if (globalThis.ClipboardItem && navigator.clipboard?.write) {
    await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([html],{type:'text/html'}),'text/plain':new Blob([text],{type:'text/plain'})})]);
  } else {
    await navigator.clipboard.writeText(text);
  }
}
function setStatus(message,isError=false){const status=document.querySelector('#workspace-status');status.textContent=message;status.classList.toggle('status--error',isError);}
function htmlDocument(body){return `<!doctype html>
<html lang="${locale.code}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Aixuno HTML document</title>
</head>
<body>
${body}
</body>
</html>
`;}

async function wireMarkdownWorkspace(mode){
  const input=document.querySelector('#home-markdown');const preview=document.querySelector('#home-preview');let html='';
  const update=async()=>{drafts.set(mode.id,input.value);try{html=await renderMarkdown(input.value);preview.innerHTML=html||`<p class="preview-empty">${locale.workspace.empty}</p>`;}catch(error){setStatus(error.message,true);}};
  input.addEventListener('input',update);
  wireMarkdownUpload({onFile:async text=>{input.value=text;await update();},setStatus,messages:{invalid:locale.workspace.fileInvalid,large:locale.workspace.fileLarge,loaded:locale.workspace.loaded,readError:locale.workspace.fileReadError}});
  await update();
  document.querySelector('#workspace-action').addEventListener('click',async()=>{try{html=await renderMarkdown(input.value);if(!html)throw new Error(locale.workspace.needContent);if(mode.id==='word')await exportWord(html,'aixuno-document.docx');if(mode.id==='pdf')await exportPdf(html,'aixuno-document.pdf');if(mode.id==='html'){await navigator.clipboard.writeText(html);setStatus(locale.workspace.htmlCopied);return;}setStatus(locale.workspace.downloaded);}catch(error){setStatus(error.message,true);}});
  document.querySelector('#copy-preview').addEventListener('click',async()=>{try{await copyRichText(await renderMarkdown(input.value));setStatus(locale.workspace.previewCopied);}catch(error){setStatus(error.message,true);}});
  document.querySelector('#download-html')?.addEventListener('click',async()=>{try{html=await renderMarkdown(input.value);if(!html)throw new Error(locale.workspace.needContent);downloadBlob(new Blob([htmlDocument(html)],{type:'text/html;charset=utf-8'}),'aixuno-document.html');setStatus(locale.workspace.downloaded);}catch(error){setStatus(error.message,true);}});
}

function wireOfficeWorkspace(){
  const t=locale.office;const fileInput=document.querySelector('#office-file');const output=document.querySelector('#office-output');const copyButton=document.querySelector('#copy-office');const downloadButton=document.querySelector('#download-office');
  fileInput.addEventListener('change',async()=>{output.value='';copyButton.disabled=true;downloadButton.disabled=true;try{const[file]=fileInput.files;if(!file)return;setStatus(t.reading);const ext=file.name.split('.').pop().toLowerCase();if(ext==='docx'||ext==='doc'){output.value=(await readDocxAsMarkdown(file)).markdown;}else if(ext==='pdf'){output.value=(await readPdfAsMarkdown(file)).markdown;}else{const book=await readSpreadsheet(file);output.value=book.toMarkdown(book.sheetNames[0]);}copyButton.disabled=!output.value;downloadButton.disabled=!output.value;setStatus(t.converted);}catch(error){setStatus(error.message,true);}});
  copyButton.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(output.value);setStatus(t.copied);}catch(error){setStatus(error.message,true);}});
  downloadButton.addEventListener('click',()=>{downloadBlob(new Blob([output.value],{type:'text/markdown;charset=utf-8'}),'aixuno-document.md');setStatus(locale.workspace.downloaded);});
}
async function renderWorkspace(workspace){const mode=modes.find(item=>item.id===activeMode);workspace.classList.remove('workspace--enter');workspace.innerHTML=activeMode==='office'?officeWorkspace():markdownWorkspace(mode);requestAnimationFrame(()=>workspace.classList.add('workspace--enter'));if(activeMode==='office')wireOfficeWorkspace();else await wireMarkdownWorkspace(mode);}
export async function mountIntlWorkspace({cards,workspace}){const renderCards=()=>{cards.innerHTML=modes.map(cardMarkup).join('');cards.querySelectorAll('[data-mode]').forEach(card=>card.addEventListener('click',async()=>{activeMode=card.dataset.mode;renderCards();await renderWorkspace(workspace);}));};renderCards();await renderWorkspace(workspace);}
