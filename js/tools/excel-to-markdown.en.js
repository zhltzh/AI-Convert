import { renderEnglishHeader, renderEnglishFooter } from '../components/english-shell.js';
import { downloadBlob } from '../core/download.js';
import { readSpreadsheet } from '../converters/excel-to-md.js';

document.querySelector('#site-header').innerHTML = renderEnglishHeader();
document.querySelector('#site-footer').innerHTML = renderEnglishFooter();
document.querySelector('#upload-mount').innerHTML = '<label class="upload-box" id="upload-box" for="excel-file"><input id="excel-file" type="file" accept=".xlsx,.xls,.csv" hidden /><span class="upload-box__icon" aria-hidden="true">↗</span><strong>Drop an Excel file here, or choose one</strong><span>Supports .xlsx, .xls, and .csv · processed locally</span></label>';

const uploadBox = document.querySelector('#upload-box');
const fileInput = document.querySelector('#excel-file');
const sheetSelect = document.querySelector('#sheet-select');
const output = document.querySelector('#markdown-output');
const status = document.querySelector('#converter-status');
const copyButton = document.querySelector('#copy-markdown');
const downloadButton = document.querySelector('#download-markdown');
let spreadsheet;
let currentMarkdown = '';

async function renderSheet() { currentMarkdown = spreadsheet.toMarkdown(sheetSelect.value); output.value = currentMarkdown; status.textContent = currentMarkdown ? `${sheetSelect.value} converted · processed locally` : 'This sheet has no convertible data.'; copyButton.disabled = !currentMarkdown; downloadButton.disabled = !currentMarkdown; }
async function loadFile(file) { if (!file) return; status.textContent = 'Reading file…'; try { spreadsheet = await readSpreadsheet(file); sheetSelect.innerHTML = spreadsheet.sheetNames.map((name) => `<option value="${name}">${name}</option>`).join(''); sheetSelect.hidden = false; await renderSheet(); } catch { status.textContent = 'We could not read this file. Use a non-empty .xlsx, .xls, or .csv file smaller than 20MB.'; } }
fileInput.addEventListener('change', () => loadFile(fileInput.files[0]));
sheetSelect.addEventListener('change', renderSheet);
['dragenter', 'dragover'].forEach((name) => uploadBox.addEventListener(name, (event) => { event.preventDefault(); uploadBox.classList.add('upload-box--active'); }));
['dragleave', 'drop'].forEach((name) => uploadBox.addEventListener(name, (event) => { event.preventDefault(); uploadBox.classList.remove('upload-box--active'); }));
uploadBox.addEventListener('drop', (event) => loadFile(event.dataTransfer.files[0]));
copyButton.addEventListener('click', async () => { try { await navigator.clipboard.writeText(currentMarkdown); status.textContent = 'Markdown copied to your clipboard.'; } catch { status.textContent = 'Copy failed. Please select and copy the text manually.'; } });
downloadButton.addEventListener('click', () => downloadBlob(new Blob([currentMarkdown], { type: 'text/markdown;charset=utf-8' }), 'excel-to-markdown.md'));
