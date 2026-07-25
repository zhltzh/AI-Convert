const SHEETJS_CDN = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = new Set(['xlsx', 'xls', 'csv']);
let sheetJsLoader;

function loadScript(source) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = source;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('无法加载 Excel 解析组件，请检查网络连接后重试。'));
    document.head.append(script);
  });
}

async function loadSheetJs() {
  if (globalThis.XLSX?.read) return globalThis.XLSX;
  sheetJsLoader ??= loadScript(SHEETJS_CDN).then(() => {
    if (!globalThis.XLSX?.read) throw new Error('Excel 解析组件加载失败。');
    return globalThis.XLSX;
  });
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
  const source = extension === 'csv' ? await file.text() : await file.arrayBuffer();
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
