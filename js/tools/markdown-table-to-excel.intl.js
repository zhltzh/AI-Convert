import { renderIntlHeader, renderIntlFooter } from '../components/intl-shell.js';
import { downloadBlob } from '../core/download.js';
import { exportTablesToXlsx, parseMarkdownTables, tableToCsv, tableToTsv } from '../converters/markdown-table.js';
import { mountDownloadTray } from '../components/download-tray.js';
import { getLocale } from '../i18n/home-locales.js';

const locale = getLocale();

const EXTRA = {
  en: {
    tableLabel: 'Table',
    copyFail: 'Copy failed — select the preview table and copy it manually.',
    sample: `| Product | Qty | Unit price | Notes |
| --- | ---: | ---: | --- |
| Widget A | 10 | 25.50 | AI-generated data |
| Widget B | 6 | 18.00 | Ready for Excel |`
  },
  ja: {
    tableLabel: '表',
    copyFail: 'コピーに失敗しました。プレビューの表を選択して手動でコピーしてください。',
    sample: `| 商品 | 数量 | 単価 | 備考 |
| --- | ---: | ---: | --- |
| サンプル A | 10 | 25.50 | AI が生成したデータ |
| サンプル B | 6 | 18.00 | Excel に書き出し可能 |`
  },
  es: {
    tableLabel: 'Tabla',
    copyFail: 'No se pudo copiar: selecciona la tabla en la vista previa y cópiala manualmente.',
    sample: `| Producto | Cantidad | Precio | Notas |
| --- | ---: | ---: | --- |
| Artículo A | 10 | 25.50 | Datos generados por IA |
| Artículo B | 6 | 18.00 | Listo para Excel |`
  },
  de: {
    tableLabel: 'Tabelle',
    copyFail: 'Kopieren fehlgeschlagen — wähle die Tabelle in der Vorschau und kopiere sie manuell.',
    sample: `| Produkt | Menge | Preis | Hinweis |
| --- | ---: | ---: | --- |
| Artikel A | 10 | 25.50 | KI-generierte Daten |
| Artikel B | 6 | 18.00 | Bereit für Excel |`
  },
  fr: {
    tableLabel: 'Tableau',
    copyFail: 'Échec de la copie — sélectionnez le tableau dans l’aperçu et copiez-le manuellement.',
    sample: `| Produit | Quantité | Prix | Remarques |
| --- | ---: | ---: | --- |
| Article A | 10 | 25.50 | Données générées par IA |
| Article B | 6 | 18.00 | Prêt pour Excel |`
  }
};

const extra = EXTRA[locale.code] || EXTRA.en;
const tableText = locale.table || EXTRA.en; // safe fallback

document.querySelector('#site-header').innerHTML = renderIntlHeader();
document.querySelector('#site-footer').innerHTML = renderIntlFooter();

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

function countText(n) {
  const tpl = n === 1 ? tableText.countOne : tableText.count;
  return String(tpl).replace('{n}', String(n));
}

function renderTables() {
  tables = parseMarkdownTables(input.value);
  const disabled = tables.length === 0;
  copyButton.disabled = disabled;
  csvButton.disabled = disabled;
  excelButton.disabled = disabled;
  if (disabled) {
    preview.innerHTML = `<p class="preview-empty">${tableText.empty}</p>`;
    status.textContent = tableText.placeholder;
    return;
  }
  preview.innerHTML = tables.map((rows, index) => `<section><h3>${extra.tableLabel} ${index + 1}</h3><div class="table-scroll"><table><thead><tr>${rows[0].map((cell) => `<th>${escapeHtml(cell)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell).replace(/\n/g, '<br>')}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`).join('');
  status.textContent = `${countText(tables.length)} · ${tableText.privacy}`;
}

input.value = extra.sample;
input.addEventListener('input', renderTables);
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(tableToTsv(tables[0]));
    status.textContent = tableText.copied;
  } catch { status.textContent = extra.copyFail; }
});
csvButton.addEventListener('click', () => {
  downloadBlob(new Blob(['\ufeff', tableToCsv(tables[0])], { type: 'text/csv;charset=utf-8' }), 'markdown-table.csv');
  status.textContent = tableText.csvDone;
});
excelButton.addEventListener('click', async () => {
  excelButton.disabled = true;
  try {
    await exportTablesToXlsx(tables);
    status.textContent = tableText.xlsxDone;
  } catch (error) { status.textContent = error.message; }
  finally { excelButton.disabled = false; }
});

renderTables();
mountDownloadTray({ triggers: [excelButton] });
