/**
 * Shared Markdown rendering service for future Word and PDF exporters.
 * Marked is loaded only when a conversion tool needs it, keeping the homepage
 * free from conversion-library downloads.
 */
const LOCAL_MARKED = new URL('../../vendor/marked.min.js', import.meta.url).href;
const MARKED_CDN = 'https://cdn.jsdelivr.net/npm/marked@15.0.12/marked.min.js';
let markedLoader;

function normalizeMarkdown(markdown) {
  if (typeof markdown !== 'string') {
    throw new TypeError('Markdown content must be a string.');
  }

  return markdown.replace(/\r\n?/g, '\n').trim();
}

function loadScript(source) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = source;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('无法加载 Markdown 解析器，请检查网络连接后重试。'));
    document.head.append(script);
  });
}

/**
 * Loads marked.js on demand. A preloaded global `marked` is reused when present.
 * @returns {Promise<{parse: (markdown: string, options: object) => string}>}
 */
export async function loadMarkdownParser() {
  if (globalThis.marked?.parse) {
    return globalThis.marked;
  }

  if (typeof document === 'undefined') {
    throw new Error('Markdown parser is only available in a browser environment.');
  }

  markedLoader ??= loadScript(LOCAL_MARKED)
    .catch(() => loadScript(MARKED_CDN))
    .then(() => {
      if (!globalThis.marked?.parse) {
        throw new Error('Markdown parser loaded, but is unavailable.');
      }
      return globalThis.marked;
    });

  return markedLoader;
}

function isSafeUrl(value) {
  const url = value.trim().toLowerCase();
  return url.startsWith('https://') || url.startsWith('http://') || url.startsWith('mailto:') || url.startsWith('#');
}

/**
 * Keeps the rendered preview safe before it is inserted into the DOM.
 * Exporters may opt out because they create a downloadable document, not live DOM.
 */
export function sanitizeHtml(html) {
  if (typeof DOMParser === 'undefined') {
    return html;
  }

  const allowedTags = new Set([
    'a', 'blockquote', 'br', 'code', 'del', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'hr', 'img', 'li', 'ol', 'p', 'pre', 'strong', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'ul',
  ]);
  const documentNode = new DOMParser().parseFromString(html, 'text/html');

  documentNode.body.querySelectorAll('*').forEach((element) => {
    if (!allowedTags.has(element.tagName.toLowerCase())) {
      element.replaceWith(...element.childNodes);
      return;
    }

    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const isUrl = name === 'href' || name === 'src';
      const isSpan = (name === 'colspan' || name === 'rowspan') && /^\d{1,3}$/.test(attribute.value.trim());
      const isAllowedAttribute = ['href', 'src', 'alt', 'title'].includes(name);

      if (!isAllowedAttribute && !isSpan) {
        element.removeAttribute(attribute.name);
        return;
      }
      if (isUrl && !isSafeUrl(attribute.value)) element.removeAttribute(attribute.name);
    });
  });

  return documentNode.body.innerHTML;
}

/**
 * The preview panel already sits inside a page that owns the single <h1>, so the
 * rendered headings drop one level. `data-md-level` keeps the original level so
 * CSS can preserve the exact same visual size.
 * @param {string} html
 * @returns {string}
 */
export function demoteHeadingsForPreview(html) {
  return html
    .replace(/<h([1-5])(\s[^>]*)?>/g, (match, level, attrs = "") => `<h${Number(level) + 1}${attrs} data-md-level="${level}">`)
    .replace(/<\/h([1-5])>/g, (match, level) => `</h${Number(level) + 1}>`);
}

/**
 * Converts GitHub-flavoured Markdown to safe, presentation-ready HTML.
 * @param {string} markdown
 * @param {{ sanitize?: boolean, demoteHeadings?: boolean }} options
 * @returns {Promise<string>}
 */
export async function renderMarkdown(markdown, { sanitize = true, demoteHeadings = false } = {}) {
  const parser = await loadMarkdownParser();
  const normalized = normalizeMarkdown(markdown);

  if (!normalized) {
    return '';
  }

  const html = parser.parse(normalized, {
    gfm: true,
    breaks: true,
    headerIds: false,
    mangle: false,
  });

  const safeHtml = sanitize ? sanitizeHtml(html) : html;
  return demoteHeadings ? demoteHeadingsForPreview(safeHtml) : safeHtml;
}
