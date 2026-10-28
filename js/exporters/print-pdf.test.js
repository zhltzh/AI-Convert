import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPrintHtml } from './print-pdf.js';

test('print document carries A4 page rules and repeating table headers', () => {
  const html = buildPrintHtml('<h1>标题</h1><table><thead><tr><th>列</th></tr></thead><tbody><tr><td>值</td></tr></tbody></table>');
  assert.match(html, /@page \{ size: A4 portrait; margin: 18mm 16mm; \}/);
  assert.match(html, /thead \{ display: table-header-group; \}/);
  assert.match(html, /break-inside: avoid/);
  assert.ok(html.includes('<h1>标题</h1>'));
  assert.ok(html.includes('<td>值</td>'));
});

test('print document escapes the title but keeps document markup', () => {
  const html = buildPrintHtml('<p>正文</p>', '<script>alert(1)</script>');
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(!html.includes('<title><script>'));
  assert.ok(html.includes('<p>正文</p>'));
});
