/* =======================================================================
   Page-wide dark-mode toggle.
   Sets data-theme on the master page AND relays the chosen theme into each
   embedded visual iframe, so all three charts switch together.
   ======================================================================= */

(function () {
  const root = document.documentElement;
  const toggle = document.querySelector("[data-theme-toggle]");

  // Restore saved preference (default light)
  const saved = localStorage.getItem("pricedout-theme") || "light";
  applyTheme(saved);

  if (toggle) {
    toggle.addEventListener("click", function () {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("pricedout-theme", next);
    });
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    relayToIframes(theme);
  }

  // Tell each visual iframe which theme to use.
  function relayToIframes(theme) {
    document.querySelectorAll("iframe.viz").forEach(function (frame) {
      try {
        const doc = frame.contentDocument;
        if (doc) doc.documentElement.setAttribute("data-theme", theme);
      } catch (e) {
        /* cross-origin safety net — same-origin on GitHub Pages so this is fine */
      }
    });
  }

  // Re-apply theme to iframes once they finish loading.
  window.addEventListener("load", function () {
    const theme = root.getAttribute("data-theme") || "light";
    document.querySelectorAll("iframe.viz").forEach(function (frame) {
      frame.addEventListener("load", function () {
        try {
          frame.contentDocument.documentElement.setAttribute("data-theme", theme);
        } catch (e) {}
      });
    });
  });
})();
