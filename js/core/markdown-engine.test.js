import assert from 'node:assert/strict';
import { renderMarkdown, sanitizeHtml } from './markdown-engine.js';

globalThis.marked = {
  parse(markdown) {
    return `<h1>${markdown}</h1><script>alert('xss')</script><a href="javascript:alert(1)">unsafe</a>`;
  },
};

const html = await renderMarkdown('# 测试');
assert.match(html, /<h1># 测试<\/h1>/);

// The DOM sanitizer is browser-only; this verifies the renderer can also be
// consumed by non-browser tooling without changing conversion output.
assert.equal(sanitizeHtml('<p>hello</p>'), '<p>hello</p>');
console.log('markdown-engine interface: passed');
