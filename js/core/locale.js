const LOCALE_KEY = 'ai-convert-locale';
const SUPPORTED_LOCALES = ['zh', 'en', 'es', 'de', 'ja', 'fr'];

export function getPreferredLocale() {
  try {
    const saved = localStorage.getItem(LOCALE_KEY);
    if (SUPPORTED_LOCALES.includes(saved)) return saved;
  } catch {}
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language || navigator.userLanguage || 'en'];
  for (const language of languages) {
    const code = String(language).toLowerCase().split('-')[0];
    if (SUPPORTED_LOCALES.includes(code)) return code;
  }
  return 'en';
}

export function setPreferredLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) return;
  try { localStorage.setItem(LOCALE_KEY, locale); } catch {}
}

export function rememberLocaleLinks(root = document) {
  root.querySelectorAll('[data-locale]').forEach(link => link.addEventListener('click', () => setPreferredLocale(link.dataset.locale)));
}
