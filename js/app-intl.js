import { renderIntlHeader, renderIntlFooter } from './components/intl-shell.js';
import { mountIntlWorkspace } from './home-workspace.intl.js';
document.querySelector('#site-header').innerHTML=renderIntlHeader();
document.querySelector('#site-footer').innerHTML=renderIntlFooter();
mountIntlWorkspace({cards:document.querySelector('#mode-cards'),workspace:document.querySelector('#workspace')});
