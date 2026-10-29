import { downloadBlob } from '../core/download.js';
import { buildDocx } from './docx-writer.js';

async function toDataUri(url) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(url, { signal: controller.signal, referrerPolicy: 'no-referrer' });
    if (!response.ok) return null;
    const blob = await response.blob();
    if (blob.size > 5 * 1024 * 1024) return null;
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

/** Remote images never reach the docx unless they are embedded as data URIs. */
async function inlineImages(html) {
  if (typeof DOMParser === 'undefined') return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const images = [...doc.body.querySelectorAll('img[src^="http"]')];
  if (!images.length) return html;
  await Promise.all(images.map(async (image) => {
    const dataUri = await toDataUri(image.getAttribute('src'));
    if (dataUri) image.setAttribute('src', dataUri);
    else image.removeAttribute('src');
  }));
  return doc.body.innerHTML;
}

export async function exportWord(html, filename = 'aixuno-document.docx') {
  if (!html.trim()) throw new Error('请先输入需要转换的 Markdown 内容。');
  const blob = await buildDocx(await inlineImages(html));
  downloadBlob(blob, filename);
}
