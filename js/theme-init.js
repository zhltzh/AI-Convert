/* AIXUNO theme init — sync script loaded in <head> before first paint.
   Reads localStorage "aixuno-theme" ("light" | "dark" | absent = follow system)
   and pins data-theme on <html> when the user has made an explicit choice. */
(function () {
  try {
    var saved = localStorage.getItem("aixuno-theme");
    if (saved === "light" || saved === "dark") {
      document.documentElement.setAttribute("data-theme", saved);
    }
  } catch (e) {
    /* localStorage unavailable — follow system */
  }
})();
