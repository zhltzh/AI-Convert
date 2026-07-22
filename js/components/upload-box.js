export function renderUploadBox() {
  return `<label class="upload-box" id="upload-box" for="excel-file"><input id="excel-file" type="file" accept=".xlsx,.xls,.csv" hidden /><span class="upload-box__icon" aria-hidden="true">↑</span><strong>拖入 Excel 文件，或点击选择</strong><span>支持 .xlsx、.xls、.csv · 文件仅在本地处理</span></label>`;
}
