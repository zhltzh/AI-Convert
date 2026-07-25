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

function block(node) {
  const tag = node.tagName?.toLowerCase();
  if (!tag) return inline(node);
  if (/^h[1-6]$/.test(tag)) return `${'#'.repeat(Number(tag[1]))} ${cleanText(inline(node))}`;
  if (tag === 'p') return cleanText(inline(node));
  if (tag === 'blockquote') return cleanText(inline(node)).split('\n').map((line) => `> ${line}`).join('\n');
  if (tag === 'pre') return `\`\`\`\n${node.textContent.trim()}\n\`\`\``;
  if (tag === 'table') return tableToMarkdown(node);
  if (tag === 'ul' || tag === 'ol') return [...node.children].filter((child) => child.tagName?.toLowerCase() === 'li').map((item, index) => `${tag === 'ol' ? `${index + 1}.` : '-'} ${cleanText(inline(item))}`).join('\n');
  if (tag === 'img') return inline(node);
  return cleanText(inline(node));
}

export function htmlToMarkdown(html) {
  if (typeof DOMParser === 'undefined') throw new Error('当前环境无法解析文档内容。');
  const body = new DOMParser().parseFromString(html, 'text/html').body;
  return cleanText([...body.childNodes].map(block).filter(Boolean).join('\n\n'));
}
