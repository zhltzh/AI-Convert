import test from 'node:test';
import assert from 'node:assert/strict';
import { crc32, escapeXml, zipStore } from './docx-writer.js';

const encoder = new TextEncoder();

test('crc32 matches the reference vector used by zip readers', () => {
  assert.equal(crc32(encoder.encode('123456789')), 0xcbf43926);
  assert.equal(crc32(new Uint8Array(0)), 0);
});

test('escapeXml neutralises markup characters', () => {
  assert.equal(escapeXml('<a href="x">&\'</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;&apos;&lt;/a&gt;');
  assert.equal(escapeXml(null), '');
});

test('zipStore writes a readable stored archive', async () => {
  const blob = zipStore([
    { name: 'word/document.xml', data: '<w:document/>' },
    { name: 'word/styles.xml', data: '<w:styles/>' },
  ]);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const view = new DataView(bytes.buffer);

  assert.equal(view.getUint32(0, true), 0x04034b50, 'local header signature');
  assert.equal(view.getUint32(bytes.length - 22, true), 0x06054b50, 'end of central directory signature');
  assert.equal(view.getUint16(bytes.length - 12, true), 2, 'entry count');

  const text = new TextDecoder().decode(bytes);
  assert.ok(text.includes('word/document.xml'));
  assert.ok(text.includes('<w:document/>'));
});

test('zipStore declares the docx content type so Office opens it directly', () => {
  const blob = zipStore([{ name: 'word/document.xml', data: '<w:document/>' }]);
  assert.equal(blob.type, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
});
