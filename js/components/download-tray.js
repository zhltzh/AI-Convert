/**
 * Floating download entry for long pages.
 * The tray appears only when every tracked trigger (top/bottom export buttons)
 * is scrolled out of the viewport, and it reuses the trigger itself, so labels,
 * busy states, and click behaviour stay identical to the original button.
 */

const TRAY_CLASS = 'download-tray';
let currentTray = null;

function isVisible(element) {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
}

function labelOf(element) {
  return (element.textContent || '').replace(/[\s↓↗→←]+$/u, '').trim();
}

export function unmountDownloadTray() {
  if (!currentTray) return;
  currentTray.destroy();
  currentTray = null;
}

export function mountDownloadTray({ triggers, label }) {
  unmountDownloadTray();
  const buttons = (triggers || []).filter(Boolean);
  if (!buttons.length || typeof document === 'undefined') return () => {};

  const primary = buttons[0];
  const tray = document.createElement('div');
  tray.className = TRAY_CLASS;
  tray.hidden = true;
  tray.innerHTML = '<button class="button button--primary" type="button"></button>';
  const trayButton = tray.querySelector('button');
  if (label) trayButton.textContent = label;
  trayButton.addEventListener('click', () => primary.click());
  document.body.append(tray);

  let frame = 0;
  let fallbackTimer = 0;
  const sync = () => {
    frame = 0;
    if (!tray.isConnected) return;
    const text = labelOf(primary);
    if (text) trayButton.textContent = text;
    trayButton.disabled = primary.disabled;
    tray.hidden = buttons.some(isVisible);
  };
  const schedule = () => {
    if (frame || fallbackTimer) return;
    frame = window.requestAnimationFrame(sync);
    // Safety net for throttled animation frames (background tabs, embedded views).
    fallbackTimer = window.setTimeout(() => {
      fallbackTimer = 0;
      if (!frame) return;
      window.cancelAnimationFrame(frame);
      sync();
    }, 200);
  };

  const observer = typeof MutationObserver === 'function'
    ? new MutationObserver(schedule)
    : null;
  observer?.observe(primary, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['disabled'],
  });

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  trayButton.addEventListener('click', schedule);
  schedule();

  const destroy = () => {
    if (frame) window.cancelAnimationFrame(frame);
    if (fallbackTimer) window.clearTimeout(fallbackTimer);
    observer?.disconnect();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    tray.remove();
  };

  currentTray = { destroy };
  return destroy;
}
