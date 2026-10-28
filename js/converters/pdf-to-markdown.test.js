import test from 'node:test';
import assert from 'node:assert/strict';
import { blocksToMarkdown, lineToMarkdown, toLines } from './pdf-to-markdown.js';

test('groups text items into lines by baseline and orders them left to right', () => {
  const lines = toLines([
    { str: '第二行', transform: [10, 0, 0, 10, 10, 800] },
    { str: '第一行', transform: [10, 0, 0, 10, 10, 820] },
    { str: '尾部', transform: [10, 0, 0, 10, 120, 820] },
    { str: '   ', transform: [10, 0, 0, 10, 200, 760] },
  ]);
  assert.deepEqual(lines.map((line) => line.text), ['第一行 尾部', '第二行']);
});

test('detects headings by relative font size and keeps list markers', () => {
  assert.equal(lineToMarkdown({ text: '大标题', size: 24 }, 10).kind, 'heading');
  assert.equal(lineToMarkdown({ text: '小标题', size: 15 }, 10).kind, 'heading');
  assert.deepEqual(lineToMarkdown({ text: '• 项目', size: 10 }, 10), { kind: 'list', text: '- 项目' });
  assert.deepEqual(lineToMarkdown({ text: '1. 步骤', size: 10 }, 10), { kind: 'list', text: '1. 步骤' });
  assert.deepEqual(lineToMarkdown({ text: '正文一行', size: 10 }, 10), { kind: 'body', text: '正文一行' });
});

test('keeps consecutive body lines in one paragraph but splits headings', () => {
  const blocks = [
    { kind: 'heading', text: '# 标题' },
    { kind: 'body', text: '第一行' },
    { kind: 'body', text: '第二行' },
    { kind: 'list', text: '- 列表项' },
    { kind: 'body', text: '结束段' },
  ];
  assert.equal(blocksToMarkdown(blocks), '# 标题\n\n第一行\n第二行\n\n- 列表项\n\n结束段');
});
