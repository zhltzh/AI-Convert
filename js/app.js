import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { mountHomeWorkspace } from './home-workspace.js';

document.querySelector('#site-header').innerHTML = renderHeader();
document.querySelector('#site-footer').innerHTML = renderFooter();
mountHomeWorkspace({ cards: document.querySelector('#mode-cards'), workspace: document.querySelector('#workspace') });
