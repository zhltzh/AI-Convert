import { loadScriptSources } from '../core/script-loader.js';
import { htmlToMarkdown } from './html-to-markdown.js';

// 本地副本 → 国内镜像 → 境外源，国内访问 jsdelivr 经常超时。
const MAMMOTH_SOURCES = [
  new URL('../../vendor/mammoth.browser.min.js', import.meta.url).href,
  'https://registry.npmmirror.com/mammoth/1.12.0/files/mammoth.browser.min.js',
  'https://unpkg.com/mammoth@1.12.0/mammoth.browser.min.js',
  'https://cdn.jsdelivr.net/npm/mammoth@1.12.0/mammoth.browser.min.js',
];
const MAMMOTH_ERROR = '无法加载 Word 解析组件，请检查网络或更换网络环境后重试。';
const MAX_FILE_BYTES = 20 * 1024 * 1024;
let mammothLoader;

function loadMammoth() {
  if (globalThis.mammoth?.convertToHtml) return Promise.resolve(globalThis.mammoth);
  mammothLoader ??= loadScriptSources(MAMMOTH_SOURCES, {
    isReady: () => Boolean(globalThis.mammoth?.convertToHtml),
    errorMessage: MAMMOTH_ERROR,
  }).then(() => globalThis.mammoth);
  return mammothLoader;
}

export async function readDocxAsMarkdown(file) {
  if (!file) throw new Error('请选择一个 .docx 文件。');
  const extension = file.name?.split('.').pop()?.toLowerCase();
  if (extension === 'doc') throw new Error('检测到旧版 .doc 文件。请在 Word 或 WPS 中选择“另存为” .docx 后重新上传。');
  if (extension !== 'docx') throw new Error('仅支持 .docx 文件。旧版 .doc 请先另存为 .docx。');
  if (file.size === 0) throw new Error('所选文件为空，请选择包含内容的 .docx 文件。');
  if (file.size > MAX_FILE_BYTES) throw new Error('文件超过 20MB。请使用更小的 .docx 文件后重试。');
  const mammoth = await loadMammoth();
  let result;
  try { result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() }); }
  catch { throw new Error('无法读取该 .docx 文件。请确认文件未损坏、未加密，并使用 Word 或 WPS 重新保存后重试。'); }
  const markdown = htmlToMarkdown(result.value);
  if (!markdown) throw new Error('未从文档中读取到可转换的文字内容。图片型或受保护内容暂不支持。');
  return { markdown, warnings: result.messages?.map((message) => message.message).filter(Boolean) ?? [] };
}
