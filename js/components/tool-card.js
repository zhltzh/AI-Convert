export function renderToolCard({ icon, category, title, description, href }) {
  return `<article class="tool-card"><span class="tool-card__icon" aria-hidden="true">${icon}</span><p class="tool-card__meta">${category}</p><h3>${title}</h3><p>${description}</p><a class="tool-card__link" href="${href}">立即使用 <span aria-hidden="true">→</span></a></article>`;
}
