// astraa v2 mockup — shared behavior: theme persistence + ⌘K palette
(function () {
  var root = document.documentElement;

  // theme: default dark; persist across pages
  try {
    if (localStorage.getItem("astraa-theme") === "light") root.classList.add("light");
  } catch (e) {}

  function setTheme(mode) {
    root.classList.toggle("light", mode === "light");
    try { localStorage.setItem("astraa-theme", mode); } catch (e) {}
    document.querySelectorAll("[data-theme-btn]").forEach(function (b) {
      b.setAttribute("data-active", String(b.getAttribute("data-theme-btn") === mode));
    });
  }
  window.__setTheme = setTheme;

  document.addEventListener("DOMContentLoaded", function () {
    // sync segmented control to current theme
    setTheme(root.classList.contains("light") ? "light" : "dark");
    document.querySelectorAll("[data-theme-btn]").forEach(function (b) {
      b.addEventListener("click", function () { setTheme(b.getAttribute("data-theme-btn")); });
    });

    // command palette
    var pal = document.querySelector(".palette-backdrop");
    function openPal(o) { if (pal) pal.setAttribute("data-open", String(o)); if (o) { var i = pal.querySelector("input"); if (i) i.focus(); } }
    document.querySelectorAll("[data-open-palette]").forEach(function (el) {
      el.addEventListener("click", function () { openPal(true); });
    });
    if (pal) pal.addEventListener("click", function (e) { if (e.target === pal) openPal(false); });
    document.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPal(true); }
      if (e.key === "Escape") openPal(false);
    });
    // palette filter
    var input = pal && pal.querySelector("input");
    if (input) input.addEventListener("input", function () {
      var q = input.value.toLowerCase();
      pal.querySelectorAll(".palette__item").forEach(function (it) {
        it.style.display = it.textContent.toLowerCase().indexOf(q) > -1 ? "" : "none";
      });
    });
  });
})();
