import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const pages = {
  'markdown-to-word.html': {
    title: 'Markdown to Word FAQ',
    intro: 'Practical answers about files, formatting, and privacy.',
    items: [
      ['Can I convert an MD file to Word?', 'Yes. Upload a .md or .markdown file, review the preview, and download an editable DOCX document.'],
      ['Does it work with ChatGPT or Claude output?', 'Yes. Paste Markdown-formatted answers from ChatGPT, Claude, Gemini, Copilot, Perplexity, or another assistant.'],
      ['Which formatting is preserved?', 'Common headings, paragraphs, lists, tables, quotes, links, and code blocks are converted. Review complex layouts before sharing.'],
      ['Is my content uploaded?', 'No. Supported conversion runs in your browser and the content is not uploaded to an Aixuno application server.'],
      ['Do I need an account?', 'No. The basic Markdown to Word converter works without registration.'],
    ],
  },
  'markdown-to-pdf.html': {
    title: 'Markdown to PDF FAQ',
    intro: 'What to expect before exporting a PDF.',
    items: [
      ['Can I convert an MD file to PDF?', 'Yes. Upload a .md or .markdown file, check the preview, and download the generated PDF.'],
      ['Can I use AI-generated Markdown?', 'Yes. Paste structured output from ChatGPT, Claude, Gemini, Copilot, Perplexity, or another assistant.'],
      ['Are tables and code blocks supported?', 'Common Markdown tables, quotes, lists, headings, and code blocks are included in the rendered document.'],
      ['Is the file uploaded?', 'No. The supported preview and PDF export run locally in your browser.'],
      ['Should I review the PDF?', 'Yes. Check pagination, links, fonts, and complex tables before printing or publishing an important document.'],
    ],
  },
  'excel-to-markdown.html': {
    title: 'Office files to Markdown FAQ',
    intro: 'Supported formats, limitations, and local processing.',
    items: [
      ['Which files can I convert?', 'The converter supports DOCX, XLSX, XLS, CSV, and PDFs that contain selectable text.'],
      ['Can it convert a scanned PDF?', 'Not yet. A scanned or image-only PDF needs OCR before its text can be converted to Markdown.'],
      ['Can it read an old DOC file?', 'Save the file as DOCX in Word, LibreOffice, or WPS first, then upload the DOCX version.'],
      ['Are files uploaded?', 'No. Supported files are read and converted in your browser.'],
      ['Will complex formatting be identical?', 'No. Markdown represents content structure rather than page layout, so text boxes, images, and complex tables may require review.'],
    ],
  },
  'markdown-to-html.html': {
    title: 'Markdown to HTML FAQ',
    intro: 'Answers about generated HTML and publishing.',
    items: [
      ['What does the converter generate?', 'It generates HTML from common Markdown headings, lists, links, tables, quotes, and code blocks.'],
      ['Can I copy the HTML into a CMS?', 'Yes. Use the generated fragment in a CMS or blog editor that accepts HTML, then verify the final styling.'],
      ['Can I download a complete HTML file?', 'Yes. The tool can create a file that opens in a browser as well as copy generated HTML.'],
      ['Is my Markdown uploaded?', 'No. The supported conversion runs locally in your browser.'],
      ['Is generated HTML safe to publish automatically?', 'Review links and embedded content before publishing, especially when the original Markdown came from an untrusted source.'],
    ],
  },
};

let updated = 0;
for (const [name, faq] of Object.entries(pages)) {
  const file = join(root, 'tools', name);
  const html = await readFile(file, 'utf8');
  if (html.includes('class="section tool-faq"')) continue;
  const headingId = `faq-${name.replace('.html', '')}`;
  const details = faq.items.map(([question, answer], index) => `<details${index === 0 ? ' open' : ''}><summary>${question}</summary><p>${answer}</p></details>`).join('');
  const section = `<section class="section tool-faq" aria-labelledby="${headingId}"><div class="container faq__layout"><div><p class="eyebrow">Frequently asked questions</p><h2 id="${headingId}">${faq.title}</h2><p>${faq.intro}</p></div><div class="faq__list">${details}</div></div></section>`;
  const marker = /<section class="section"><div class="container"><p class="eyebrow">Guide/;
  if (!marker.test(html)) throw new Error(`${name}: related guide section marker not found`);
  await writeFile(file, html.replace(marker, `${section}$&`), 'utf8');
  updated += 1;
}

console.log(`Tool FAQ synchronized for ${updated} pages.`);
