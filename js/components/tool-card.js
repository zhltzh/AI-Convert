export function renderToolCard({ icon, title, description, href, available = false }) {
  const label = available ? '开始使用' : '即将推出';
  return `<article class="tool-card"><span class="tool-card__icon" aria-hidden="true">${icon}</span><h3>${title}</h3><p>${description}</p><a class="tool-card__link" href="${href}">${label} <span aria-hidden="true">↗</span></a></article>`;
}
