import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdownTables, tableToCsv } from './markdown-table.js';

test('accepts tables without outer pipes and keeps escaped pipes', () => {
  const tables = parseMarkdownTables(['名称|数量', '---|---', '苹果|2'].join('\n'));
  assert.equal(tables.length, 1);
  assert.deepEqual(tables[0], [['名称', '数量'], ['苹果', '2']]);

  const escaped = parseMarkdownTables(['| a \\| b | c |', '| --- | --- |', '| 1 | 2 |'].join('\n'));
  assert.equal(escaped.length, 1);
  assert.deepEqual(escaped[0][0], ['a | b', 'c'], 'escaped pipes are unescaped inside cells');
});

test('recognises short alignment separators such as :--: and ---:', () => {
  const tables = parseMarkdownTables(['| left | center | right |', '| :--- | :--: | ----: |', '| 1 | 2 | 3 |'].join('\n'));
  assert.equal(tables.length, 1);
  assert.deepEqual(tables[0], [['left', 'center', 'right'], ['1', '2', '3']]);
});

test('splits several tables separated by prose', () => {
  const markdown = ['| a | b |', '| --- | --- |', '| 1 | 2 |', '', '段落', '', '| c |', '| --- |', '| 3 |'].join('\n');
  const tables = parseMarkdownTables(markdown);
  assert.equal(tables.length, 2);
  assert.deepEqual(tables[1], [['c'], ['3']]);
});

test('csv output escapes quotes, commas and newlines', () => {
  const csv = tableToCsv([['名称', '数量'], ['a,b', '说"引号"'], ['换\n行', '2']]);
  const lines = csv.split('\r\n');
  assert.equal(lines[0], '名称,数量');
  assert.equal(lines[1], '"a,b","说""引号"""');
  assert.equal(lines[2], '"换\n行",2');
});
