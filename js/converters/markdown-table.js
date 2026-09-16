const SHEETJS_CDN = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
let sheetJsLoader;

function splitRow(line) {
  let value = line.trim();
  if (value.startsWith('|')) value = value.slice(1);
  if (value.endsWith('|') && !value.endsWith('\\|')) value = value.slice(0, -1);

  const cells = [];
  let cell = '';
  let escaped = false;
  for (const character of value) {
    if (escaped) {
      cell += character === '|' ? '|' : `\\${character}`;
      escaped = false;
    } else if (character === '\\') {
      escaped = true;
    } else if (character === '|') {
      cells.push(cell.trim().replace(/<br\s*\/?>/gi, '\n'));
      cell = '';
    } else {
      cell += character;
    }
  }
  if (escaped) cell += '\\';
  cells.push(cell.trim().replace(/<br\s*\/?>/gi, '\n'));
  return cells;
}

function isDivider(line) {
  const cells = splitRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s/g, '')));
}

export function parseMarkdownTables(markdown) {
  const lines = String(markdown ?? '').replace(/\r\n?/g, '\n').split('\n');
  const tables = [];

  for (let index = 0; index < lines.length - 1; index += 1) {
    if (!lines[index].includes('|') || !isDivider(lines[index + 1])) continue;
    const rows = [splitRow(lines[index])];
    index += 2;
    while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
      rows.push(splitRow(lines[index]));
      index += 1;
    }
    index -= 1;
    const width = Math.max(...rows.map((row) => row.length));
    tables.push(rows.map((row) => Array.from({ length: width }, (_, column) => row[column] ?? '')));
  }

  return tables;
}

export function tableToCsv(rows) {
  return rows.map((row) => row.map((cell) => {
    const value = String(cell ?? '');
    return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  }).join(',')).join('\r\n');
}

export function tableToTsv(rows) {
  return rows.map((row) => row.map((cell) => String(cell ?? '').replace(/[\t\r\n]+/g, ' ')).join('\t')).join('\n');
}

function loadScript(source) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = source;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('无法加载 Excel 导出组件，请检查网络连接后重试。'));
    document.head.append(script);
  });
}

async function loadSheetJs() {
  if (globalThis.XLSX?.utils) return globalThis.XLSX;
  sheetJsLoader ??= loadScript(SHEETJS_CDN).then(() => {
    if (!globalThis.XLSX?.utils) throw new Error('Excel 导出组件加载失败。');
    return globalThis.XLSX;
  });
  return sheetJsLoader;
}

export async function exportTablesToXlsx(tables, filename = 'markdown-tables.xlsx') {
  if (!tables.length) throw new Error('没有找到可导出的 Markdown 表格。');
  const XLSX = await loadSheetJs();
  const workbook = XLSX.utils.book_new();
  tables.forEach((rows, index) => {
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    const widths = rows[0]?.map((_, column) => Math.min(40, Math.max(10, ...rows.map((row) => String(row[column] ?? '').length + 2)))) ?? [];
    sheet['!cols'] = widths.map((wch) => ({ wch }));
    XLSX.utils.book_append_sheet(workbook, sheet, `表格${index + 1}`);
  });
  XLSX.writeFile(workbook, filename);
}
