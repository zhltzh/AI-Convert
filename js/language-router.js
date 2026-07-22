import { getPreferredLocale } from './core/locale.js';

// Only redirect the root landing page. Search engines and direct locale URLs
// remain stable, while first-time visitors receive a useful default.
if (getPreferredLocale() === 'en') {
  location.replace('en/');
}
