const LOCALE_KEY = 'ai-convert-locale';

export function getPreferredLocale() {
  const saved = localStorage.getItem(LOCALE_KEY);
  if (saved === 'zh' || saved === 'en') return saved;
  return (navigator.language || navigator.userLanguage || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

export function setPreferredLocale(locale) {
  localStorage.setItem(LOCALE_KEY, locale);
}
