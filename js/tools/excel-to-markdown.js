import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { renderUploadBox } from '../components/upload-box.js';
import { downloadBlob } from '../core/download.js';
import { readSpreadsheet } from '../converters/excel-to-md.js';

document.querySelector('#site-header').innerHTML = renderHeader();
document.querySelector('#site-footer').innerHTML = renderFooter();
document.querySelector('#upload-mount').innerHTML = renderUploadBox();

const uploadBox = document.querySelector('#upload-box');
const fileInput = document.querySelector('#excel-file');
const sheetSelect = document.querySelector('#sheet-select');
const output = document.querySelector('#markdown-output');
const status = document.querySelector('#converter-status');
const copyButton = document.querySelector('#copy-markdown');
const downloadButton = document.querySelector('#download-markdown');
let spreadsheet;
let currentMarkdown = '';

async function renderSheet() {
  currentMarkdown = spreadsheet.toMarkdown(sheetSelect.value);
  output.value = currentMarkdown;
  status.textContent = currentMarkdown ? `已转换「${sheetSelect.value}」· 内容仅在本地处理` : '当前工作表没有可转换的数据';
  copyButton.disabled = !currentMarkdown;
  downloadButton.disabled = !currentMarkdown;
}

async function loadFile(file) {
  status.textContent = '正在读取文件…';
  try {
    spreadsheet = await readSpreadsheet(file);
    sheetSelect.innerHTML = spreadsheet.sheetNames.map((name) => `<option value="${name}">${name}</option>`).join('');
    sheetSelect.hidden = false;
    await renderSheet();
  } catch (error) {
    status.textContent = error.message;
  }
}

fileInput.addEventListener('change', () => loadFile(fileInput.files[0]));
sheetSelect.addEventListener('change', renderSheet);
['dragenter', 'dragover'].forEach((eventName) => uploadBox.addEventListener(eventName, (event) => { event.preventDefault(); uploadBox.classList.add('upload-box--active'); }));
['dragleave', 'drop'].forEach((eventName) => uploadBox.addEventListener(eventName, (event) => { event.preventDefault(); uploadBox.classList.remove('upload-box--active'); }));
uploadBox.addEventListener('drop', (event) => loadFile(event.dataTransfer.files[0]));

copyButton.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(currentMarkdown); status.textContent = 'Markdown 已复制到剪贴板'; } catch { status.textContent = '复制失败，请手动选择并复制内容'; }
});
downloadButton.addEventListener('click', () => downloadBlob(new Blob([currentMarkdown], { type: 'text/markdown;charset=utf-8' }), 'excel-to-markdown.md'));
