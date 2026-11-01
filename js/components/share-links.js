/**
 * Share controls for guide and tool pages.
 *
 * Renders three controls into every `.share-links` mount point:
 * copy link, share on X, share on Weibo. No third-party script, no tracking —
 * the component only builds links from the current URL and document title.
 */

const TEXT = {
  zh: { label: "分享这篇内容", copy: "复制链接", copied: "已复制", failed: "复制失败", x: "分享到 X", weibo: "分享到微博" },
  ja: { label: "このページを共有", copy: "リンクをコピー", copied: "コピーしました", failed: "コピーできません", x: "X で共有", weibo: "Weibo で共有" },
  de: { label: "Diese Seite teilen", copy: "Link kopieren", copied: "Kopiert", failed: "Kopieren fehlgeschlagen", x: "Auf X teilen", weibo: "Auf Weibo teilen" },
  es: { label: "Compartir esta página", copy: "Copiar enlace", copied: "Copiado", failed: "No se pudo copiar", x: "Compartir en X", weibo: "Compartir en Weibo" },
  fr: { label: "Partager cette page", copy: "Copier le lien", copied: "Copié", failed: "Échec de la copie", x: "Partager sur X", weibo: "Partager sur Weibo" },
  en: { label: "Share this page", copy: "Copy link", copied: "Copied", failed: "Copy failed", x: "Share on X", weibo: "Share on Weibo" },
};

function resolveLocale() {
  const lang = (document.documentElement.getAttribute("lang") || "en").toLowerCase();
  if (lang.startsWith("zh")) return "zh";
  if (lang.startsWith("ja")) return "ja";
  if (lang.startsWith("de")) return "de";
  if (lang.startsWith("es")) return "es";
  if (lang.startsWith("fr")) return "fr";
  return "en";
}

const COPY_ICON =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>';
const X_ICON =
  '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-7 8 8.2 12h-6.6l-5.2-7.6L5.5 22H2.3l7.5-8.6L2 2h6.8l4.7 7L18.9 2Zm-1.2 18h1.8L7.4 3.9H5.5L17.7 20Z"/></svg>';
const WEIBO_ICON =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10.1 20.2c-4 0-7.2-1.9-7.2-4.4 0-1.3.8-2.8 2.3-4.2 1.9-1.8 4.1-2.6 5-1.8.4.4.4 1 .1 1.8-.1.4.4.2.4.2 1.6-.7 3-.7 3.5.1.3.4.2 1 0 1.6-.1.3 0 .3.2.4 1 .3 2.1 1.1 2.1 2.5 0 2.1-2.5 3.8-6.4 3.8Zm6.6-8.9c-.3-.1-.3-.3-.2-.5.2-.5.2-1 0-1.3-.4-.6-1.4-.5-2.6.1 0 0-.4.2-.3-.1.2-.5.2-1-.1-1.3-.5-.5-1.7-.2-3 .5-1.9 1-3.4 2.6-3.4 2.6s-.2-.6-.7-.9c-1.1-.7-2.4-.4-3.9.6C1.2 12.3.4 14 .4 15.3c0 2.6 3 4.6 6.9 4.6 4.5 0 7.8-2.2 7.8-4.9 0-1.4-1-2.5-2.4-3Zm3.6-6.7c-1-1.1-2.4-1.5-3.8-1.2-.4.1-.6.4-.5.8.1.4.4.6.8.5 1-.2 2 0 2.7.9.7.8.9 1.8.7 2.6-.1.4.1.7.5.8.4.1.7-.1.8-.5.3-1.3 0-2.7-1.2-3.9Zm-1.9 1.9c-.4-.5-1-.7-1.6-.5-.3.1-.4.4-.3.6.1.3.4.4.6.3.3-.1.5 0 .7.2.2.2.3.5.2.8-.1.3 0 .5.3.6.3.1.5 0 .6-.3.2-.6 0-1.2-.5-1.7Z"/></svg>';

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Permission can still be denied inside a secure context, so fall through
      // to the legacy path instead of failing outright.
    }
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

function buildCopyButton(t, url) {
  const button = document.createElement("button");
  button.type = "button";
  button.innerHTML = `${COPY_ICON}<span>${t.copy}</span>`;
  button.addEventListener("click", async () => {
    const label = button.querySelector("span");
    const ok = await copyText(url);
    button.dataset.copied = ok ? "1" : "0";
    label.textContent = ok ? t.copied : t.failed;
    setTimeout(() => {
      delete button.dataset.copied;
      label.textContent = t.copy;
    }, 2200);
  });
  return button;
}

function buildLink(href, text, icon, label) {
  const link = document.createElement("a");
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.innerHTML = `${icon}<span>${label}</span>`;
  link.setAttribute("aria-label", text);
  return link;
}

function mount(root) {
  if (root.dataset.ready === "1") return;
  root.dataset.ready = "1";

  const t = TEXT[resolveLocale()] || TEXT.en;
  const url = `${location.origin}${location.pathname}`;
  const title = document.title.replace(/\s*[|｜]\s*Aixuno\s*$/, "");

  const label = document.createElement("span");
  label.className = "share-links__label";
  label.textContent = t.label;

  root.append(
    label,
    buildCopyButton(t, url),
    buildLink(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, t.x, X_ICON, "X"),
    buildLink(`https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, t.weibo, WEIBO_ICON, "Weibo"),
  );
}

function init() {
  document.querySelectorAll(".share-links").forEach(mount);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
