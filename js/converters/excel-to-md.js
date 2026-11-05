import { loadScriptSources } from '../core/script-loader.js';

/**
 * xlsx@0.20.3 只在官方 CDN 发布（npm 上最高 0.18.5），没有可用的国内镜像，
 * 因此本地副本之后只剩下官方源；版本必须保持一致，不能退回旧版本。
 */
const SHEETJS_SOURCES = [
  new URL('../../vendor/xlsx.full.min.js', import.meta.url).href,
  'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js',
];
const SHEETJS_ERROR = '无法加载 Excel 解析组件，请检查网络或更换网络环境后重试。';
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = new Set(['xlsx', 'xls', 'csv']);
let sheetJsLoader;

async function loadSheetJs() {
  if (globalThis.XLSX?.read) return globalThis.XLSX;
  sheetJsLoader ??= loadScriptSources(SHEETJS_SOURCES, {
    isReady: () => Boolean(globalThis.XLSX?.read),
    errorMessage: SHEETJS_ERROR,
  }).then(() => globalThis.XLSX);
  return sheetJsLoader;
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

export function tableToMarkdown(rows) {
  const cleanedRows = rows.filter((row) => row.some((cell) => String(cell ?? '').trim() !== ''));
  if (!cleanedRows.length) return '';
  const width = Math.max(...cleanedRows.map((row) => row.length));
  const normalized = cleanedRows.map((row) => Array.from({ length: width }, (_, index) => escapeCell(row[index])));
  const header = normalized[0];
  const divider = header.map(() => '---');
  return [`| ${header.join(' | ')} |`, `| ${divider.join(' | ')} |`, ...normalized.slice(1).map((row) => `| ${row.join(' | ')} |`)].join('\n');
}

export async function readSpreadsheet(file) {
  if (!file) throw new Error('请选择一个 Excel 或 CSV 文件。');
  const extension = file.name?.split('.').pop()?.toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error('仅支持 .xlsx、.xls 或 .csv 文件。');
  }
  if (file.size === 0) {
    throw new Error('所选文件为空，请选择包含表格数据的文件。');
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('文件超过 20MB。本地浏览器转换请使用更小的文件。');
  }
  const XLSX = await loadSheetJs();
  // Blob.text() keeps UTF-8 Chinese CSV content intact. XLSX/XLS files still
  // need their original binary data so formatting and workbook structure work.
  // A leading BOM would otherwise leak into the first header cell.
  const source = extension === 'csv'
    ? (await file.text()).replace(/^\uFEFF/, '')
    : await file.arrayBuffer();
  const workbook = XLSX.read(source, extension === 'csv' ? { type: 'string' } : { type: 'array' });
  return {
    sheetNames: workbook.SheetNames,
    toMarkdown(sheetName) {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      return tableToMarkdown(rows);
    },
  };
}
