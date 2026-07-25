import { htmlToMarkdown } from './html-to-markdown.js';

const MAMMOTH_CDN = 'https://cdn.jsdelivr.net/npm/mammoth@1.12.0/mammoth.browser.min.js';
const MAX_FILE_BYTES = 20 * 1024 * 1024;
let mammothLoader;

function loadMammoth() {
  if (globalThis.mammoth?.convertToHtml) return Promise.resolve(globalThis.mammoth);
  mammothLoader ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = MAMMOTH_CDN;
    script.async = true;
    script.onload = () => globalThis.mammoth?.convertToHtml ? resolve(globalThis.mammoth) : reject(new Error('Word 解析组件加载失败，请刷新后重试。'));
    script.onerror = () => reject(new Error('无法加载 Word 解析组件，请检查网络后重试。'));
    document.head.append(script);
  });
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
