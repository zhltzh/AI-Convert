const SITES = [['https://aixuno.com/','MD'],['https://image.aixuno.com/','IMG'],['https://compress.aixuno.com/','ZIP'],['https://pdf.aixuno.com/','PDF'],['https://bg.aixuno.com/','BG']];

const COPY = {
  en:{eyebrow:'Aixuno tools',title:'One toolkit for everyday file work',cards:[['Markdown & AI content','Turn Markdown and AI answers into Word, PDF, HTML, or reusable Markdown.'],['Pixkit image tools','Convert, resize, crop, and optimize images in your browser.'],['File compression','Reduce image and document file sizes for faster sharing.'],['PDF tools','Work with PDFs through focused, browser-based utilities.'],['AI background removal','Remove image backgrounds quickly with an AI-powered workflow.']]},
  zh:{eyebrow:'Aixuno 工具生态',title:'一套工具，处理日常文件工作',cards:[['Markdown 与 AI 内容转换','将 Markdown 和 AI 回答转换为 Word、PDF、HTML 或可复用 Markdown。'],['Pixkit 图片工具','在浏览器中转换、缩放、裁剪和优化图片。'],['文件压缩','减小图片和文档体积，方便存储与分享。'],['PDF 工具','使用专注、易用的浏览器工具处理 PDF。'],['AI 抠图','通过 AI 工作流快速移除图片背景。']]},
  es:{eyebrow:'Herramientas Aixuno',title:'Un conjunto de herramientas para archivos cotidianos',cards:[['Markdown y contenido de IA','Convierte Markdown y respuestas de IA en Word, PDF, HTML o Markdown reutilizable.'],['Herramientas de imagen Pixkit','Convierte, redimensiona, recorta y optimiza imágenes en el navegador.'],['Compresión de archivos','Reduce el tamaño de imágenes y documentos para compartirlos fácilmente.'],['Herramientas PDF','Trabaja con PDF mediante utilidades sencillas en el navegador.'],['Recorte con IA','Elimina rápidamente el fondo de una imagen con IA.']]},
  de:{eyebrow:'Aixuno-Werkzeuge',title:'Ein Werkzeugpaket für alltägliche Dateien',cards:[['Markdown und KI-Inhalte','Markdown und KI-Antworten in Word, PDF, HTML oder Markdown umwandeln.'],['Pixkit Bildwerkzeuge','Bilder im Browser umwandeln, skalieren, zuschneiden und optimieren.'],['Dateikomprimierung','Bild- und Dokumentgrößen für einfaches Teilen reduzieren.'],['PDF-Werkzeuge','PDFs mit fokussierten Browser-Werkzeugen bearbeiten.'],['KI-Freisteller','Bildhintergründe schnell mit KI entfernen.']]},
  ja:{eyebrow:'Aixuno ツール',title:'日常のファイル作業を一つのツール群で',cards:[['Markdown・AIコンテンツ変換','MarkdownやAIの回答をWord、PDF、HTML、再利用可能なMarkdownに変換。'],['Pixkit画像ツール','ブラウザで画像の変換、リサイズ、切り抜き、最適化。'],['ファイル圧縮','画像や文書の容量を減らし、共有しやすくします。'],['PDFツール','目的に合ったブラウザツールでPDFを処理。'],['AI切り抜き','AIで画像の背景をすばやく削除。']]},
  fr:{eyebrow:'Outils Aixuno',title:'Une suite pour vos fichiers du quotidien',cards:[['Markdown et contenu IA','Convertissez Markdown et les réponses IA en Word, PDF, HTML ou Markdown.'],['Outils image Pixkit','Convertissez, redimensionnez, recadrez et optimisez vos images.'],['Compression de fichiers','Réduisez la taille des images et documents pour les partager.'],['Outils PDF','Traitez vos PDF avec des utilitaires simples dans le navigateur.'],['Détourage IA','Supprimez rapidement l’arrière-plan d’une image grâce à l’IA.']]}
};

export function mountEcosystem(locale) {
  const faq = document.querySelector('#faq');
  if (!faq) return;
  const copy = COPY[locale] || COPY.en;
  const section = document.createElement('section');
  section.className = 'section ecosystem';
  section.setAttribute('aria-labelledby', 'ecosystem-title');
  const cards = copy.cards.map((card,index)=>`<a class="ecosystem-card${index===0?' is-current':''}" href="${SITES[index][0]}"${index===0?' aria-current="page"':''}><span class="ecosystem-card__mark" aria-hidden="true">${SITES[index][1]}</span><strong>${card[0]}</strong><span>${card[1]}</span><em aria-hidden="true">↗</em></a>`).join('');
  section.innerHTML = `<div class="container"><p class="eyebrow">${copy.eyebrow}</p><h2 id="ecosystem-title">${copy.title}</h2><div class="ecosystem__grid">${cards}</div></div>`;
  faq.before(section);
}
