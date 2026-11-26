/* AIXUNO theme toggle — event delegation for the .theme-toggle buttons
   rendered by header components (CSP forbids inline handlers). */
export function currentTheme() {
  var el = document.documentElement;
  var pinned = el.getAttribute("data-theme");
  if (pinned === "light" || pinned === "dark") return pinned;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function toggleTheme() {
  var next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem("aixuno-theme", next);
  } catch (e) {
    /* ignore */
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("click", function (event) {
    var target = event.target;
    while (target && target !== document.body) {
      if (target.matches && target.matches(".theme-toggle")) {
        toggleTheme();
        return;
      }
      target = target.parentNode;
    }
  });
}
