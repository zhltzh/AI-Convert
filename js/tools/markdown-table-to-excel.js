import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { downloadBlob } from '../core/download.js';
import { exportTablesToXlsx, parseMarkdownTables, tableToCsv, tableToTsv } from '../converters/markdown-table.js';

const sample = `| 产品 | 数量 | 单价 | 备注 |
| --- | ---: | ---: | --- |
| 示例 A | 10 | 25.50 | AI 生成的数据 |
| 示例 B | 6 | 18.00 | 可导出 Excel |`;

document.querySelector('#site-header').innerHTML = renderHeader();
document.querySelector('#site-footer').innerHTML = renderFooter();

const input = document.querySelector('#markdown-table-input');
const preview = document.querySelector('#table-preview');
const status = document.querySelector('#converter-status');
const copyButton = document.querySelector('#copy-table');
const csvButton = document.querySelector('#download-csv');
const excelButton = document.querySelector('#download-xlsx');
let tables = [];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function renderTables() {
  tables = parseMarkdownTables(input.value);
  const disabled = tables.length === 0;
  copyButton.disabled = disabled;
  csvButton.disabled = disabled;
  excelButton.disabled = disabled;
  if (disabled) {
    preview.innerHTML = '<p class="preview-empty">未识别到表格。Markdown 表头下方需要包含 <code>| --- |</code> 分隔行。</p>';
    status.textContent = '等待输入 Markdown 表格';
    return;
  }
  preview.innerHTML = tables.map((rows, index) => `<section><h3>表格 ${index + 1}</h3><div class="table-scroll"><table><thead><tr>${rows[0].map((cell) => `<th>${escapeHtml(cell)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell).replace(/\n/g, '<br>')}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`).join('');
  status.textContent = `已识别 ${tables.length} 个表格 · 内容仅在本地处理`;
}

input.value = sample;
input.addEventListener('input', renderTables);
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(tableToTsv(tables[0]));
    status.textContent = '第一个表格已复制，可直接粘贴到 Excel 或 WPS';
  } catch (error) { status.textContent = error.message; }
});
csvButton.addEventListener('click', () => {
  downloadBlob(new Blob(['\ufeff', tableToCsv(tables[0])], { type: 'text/csv;charset=utf-8' }), 'markdown-table.csv');
  status.textContent = 'CSV 文件已开始下载';
});
excelButton.addEventListener('click', async () => {
  excelButton.disabled = true;
  try {
    await exportTablesToXlsx(tables);
    status.textContent = 'Excel 文件已开始下载';
  } catch (error) { status.textContent = error.message; }
  finally { excelButton.disabled = false; }
});

renderTables();
