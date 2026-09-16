import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdownTables, tableToCsv, tableToTsv } from './markdown-table.js';

test('extracts multiple Markdown tables and normalizes row widths', () => {
  const tables = parseMarkdownTables(`正文\n\n| 名称 | 数量 |\n| :--- | ---: |\n| 苹果 | 2 |\n\n| A | B |\n| --- | --- |\n| 一 | |`);
  assert.deepEqual(tables, [[['名称', '数量'], ['苹果', '2']], [['A', 'B'], ['一', '']]]);
});

test('supports escaped pipes and br tags inside cells', () => {
  assert.deepEqual(parseMarkdownTables('| 名称 | 备注 |\n| --- | --- |\n| A\\|B | 第一行<br>第二行 |')[0], [
    ['名称', '备注'],
    ['A|B', '第一行\n第二行'],
  ]);
});

test('creates valid CSV and paste-ready TSV', () => {
  const rows = [['名称', '说明'], ['A', '含有,逗号'], ['B', '含有"引号"'], ['C', '两行\n文字']];
  assert.equal(tableToCsv(rows), '名称,说明\r\nA,"含有,逗号"\r\nB,"含有""引号"""\r\nC,"两行\n文字"');
  assert.equal(tableToTsv(rows), '名称\t说明\nA\t含有,逗号\nB\t含有"引号"\nC\t两行 文字');
});
