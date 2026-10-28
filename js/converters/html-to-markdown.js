function cleanText(value) {
  return value.replace(/\u00a0/g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function inline(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent.replace(/([\\`])/g, '\\$1');
  const content = [...node.childNodes].map(inline).join('');
  const tag = node.tagName?.toLowerCase();
  if (tag === 'strong' || tag === 'b') return `**${content}**`;
  if (tag === 'em' || tag === 'i') return `*${content}*`;
  if (tag === 'code') return `\`${content}\``;
  if (tag === 'a') return node.href ? `[${content}](${node.href})` : content;
  if (tag === 'br') return '  \n';
  if (tag === 'img') return node.src ? `![${node.alt || '图片'}](${node.src})` : '';
  return content;
}

function tableToMarkdown(table) {
  const rows = [...table.querySelectorAll('tr')].map((row) => [...row.querySelectorAll('th,td')].map((cell) => cleanText(inline(cell)).replace(/\|/g, '\\|')));
  if (!rows.length || !rows[0].length) return '';
  const width = Math.max(...rows.map((row) => row.length));
  const normalized = rows.map((row) => Array.from({ length: width }, (_, index) => row[index] ?? ''));
  return [`| ${normalized[0].join(' | ')} |`, `| ${normalized[0].map(() => '---').join(' | ')} |`, ...normalized.slice(1).map((row) => `| ${row.join(' | ')} |`)].join('\n');
}

const CONTAINER_TAGS = new Set(['div', 'section', 'article', 'main', 'header', 'footer', 'body']);

function listToMarkdown(node, indent = '') {
  const ordered = node.tagName?.toLowerCase() === 'ol';
  const start = Number(node.getAttribute?.('start')) || 1;
  return [...node.children]
    .filter((child) => child.tagName?.toLowerCase() === 'li')
    .map((item, index) => {
      const nested = [...item.children].filter((child) => ['ul', 'ol'].includes(child.tagName?.toLowerCase()));
      const clone = item.cloneNode(true);
      clone.querySelectorAll('ul,ol').forEach((list) => list.remove());
      const marker = ordered ? `${start + index}.` : '-';
      const text = cleanText(inline(clone)).replace(/\n/g, `\n${indent}  `);
      const nestedMarkdown = nested.map((list) => listToMarkdown(list, `${indent}  `)).join('\n');
      return `${indent}${marker} ${text}${nestedMarkdown ? `\n${nestedMarkdown}` : ''}`;
    })
    .join('\n');
}

function block(node) {
  const tag = node.tagName?.toLowerCase();
  if (!tag) return inline(node);
  if (/^h[1-6]$/.test(tag)) return `${'#'.repeat(Number(tag[1]))} ${cleanText(inline(node))}`;
  if (tag === 'p') return cleanText(inline(node));
  if (tag === 'blockquote') return cleanText(inline(node)).split('\n').map((line) => `> ${line}`).join('\n');
  if (tag === 'pre') return `\`\`\`\n${node.textContent.trim()}\n\`\`\``;
  if (tag === 'table') return tableToMarkdown(node);
  if (tag === 'ul' || tag === 'ol') return listToMarkdown(node);
  if (tag === 'img') return inline(node);
  if (CONTAINER_TAGS.has(tag)) return [...node.children].map(block).filter(Boolean).join('\n\n');
  return cleanText(inline(node));
}

export function htmlToMarkdown(html) {
  if (typeof DOMParser === 'undefined') throw new Error('当前环境无法解析文档内容。');
  const body = new DOMParser().parseFromString(html, 'text/html').body;
  return cleanText([...body.childNodes].map(block).filter(Boolean).join('\n\n'));
}
