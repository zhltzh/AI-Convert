import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { mountHomeWorkspace } from './home-workspace.js';
import { rememberLocaleLinks } from './core/locale.js';
import { mountEcosystem } from './components/ecosystem.js';

document.querySelector('#site-header').innerHTML = renderHeader();
document.querySelector('#site-footer').innerHTML = renderFooter();
rememberLocaleLinks();
mountEcosystem('zh');
mountHomeWorkspace({ cards: document.querySelector('#mode-cards'), workspace: document.querySelector('#workspace') });
