import assert from 'node:assert/strict';
import test from 'node:test';
import { tableToMarkdown } from './excel-to-md.js';

test('converts a rectangular table to Markdown', () => {
  assert.equal(
    tableToMarkdown([['Name', 'Score'], ['Ada', 10], ['Lin', 8]]),
    '| Name | Score |\n| --- | --- |\n| Ada | 10 |\n| Lin | 8 |',
  );
});

test('escapes Markdown table separators and skips empty rows', () => {
  assert.equal(
    tableToMarkdown([['A', 'B'], ['', ''], ['One|Two', 'Line one\nLine two']]),
    '| A | B |\n| --- | --- |\n| One\\|Two | Line one<br>Line two |',
  );
});

test('returns an empty string for a table without values', () => {
  assert.equal(tableToMarkdown([['', ''], [null, undefined]]), '');
});
