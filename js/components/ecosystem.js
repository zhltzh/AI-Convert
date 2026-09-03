const COPY = {
  en:['Aixuno tools','More local-first tools for everyday files','Image conversion','Convert and optimize images online.','AI background removal','Coming soon','PDF tools'],
  zh:['Aixuno 工具生态','更多面向日常文件的本地处理工具','图片转换','在线转换与优化图片。','AI 抠图','敬请期待','PDF 工具'],
  es:['Herramientas Aixuno','Más herramientas locales para tus archivos','Conversión de imágenes','Convierte y optimiza imágenes en línea.','Recorte con IA','Próximamente','Herramientas PDF'],
  de:['Aixuno-Werkzeuge','Weitere lokale Werkzeuge für Dateien','Bildkonvertierung','Bilder online umwandeln und optimieren.','KI-Freisteller','Demnächst','PDF-Werkzeuge'],
  ja:['Aixuno ツール','日常のファイルをローカル処理するツール','画像変換','画像をオンラインで変換・最適化。','AI切り抜き','公開予定','PDFツール'],
  fr:['Outils Aixuno','D’autres outils locaux pour vos fichiers','Conversion d’images','Convertissez et optimisez vos images en ligne.','Détourage IA','Bientôt','Outils PDF']
};
export function mountEcosystem(locale) {
  const faq = document.querySelector('#faq');
  if (!faq) return;
  const t = COPY[locale] || COPY.en;
  const section = document.createElement('section');
  section.className = 'section ecosystem';
  section.setAttribute('aria-labelledby', 'ecosystem-title');
  section.innerHTML = `<div class="container"><p class="eyebrow">${t[0]}</p><h2 id="ecosystem-title">${t[1]}</h2><div class="ecosystem__grid"><a class="ecosystem-card" href="https://image.aixuno.com/"><strong>${t[2]}</strong><span>${t[3]}</span><em aria-hidden="true">↗</em></a><article class="ecosystem-card is-coming"><strong>${t[4]}</strong><span>${t[5]}</span></article><article class="ecosystem-card is-coming"><strong>${t[6]}</strong><span>${t[5]}</span></article></div></div>`;
  faq.before(section);
}
