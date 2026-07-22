import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { renderToolCard } from './components/tool-card.js';

const tools = [
  { icon: 'M↓W', title: 'Markdown 转 Word', description: '将 AI 生成内容快速转换为专业 Word 文档。', href: 'tools/markdown-to-word.html', available: true },
  { icon: 'M↓P', title: 'Markdown 转 PDF', description: '将 Markdown 内容生成清晰、高质量的 PDF 文件。', href: 'tools/markdown-to-pdf.html', available: true },
  { icon: 'X↓M', title: 'Excel 转 Markdown', description: '将表格数据转换为知识库可用的 Markdown 格式。', href: '#faq' },
];

document.querySelector('#site-header').innerHTML = renderHeader();
document.querySelector('#site-footer').innerHTML = renderFooter();
document.querySelector('#tool-cards').innerHTML = tools.map(renderToolCard).join('');
