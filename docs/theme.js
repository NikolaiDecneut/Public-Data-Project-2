/* =======================================================================
   Page-wide dark-mode toggle.
   Sets data-theme on the master page AND relays the chosen theme into each
   embedded visual iframe, so all three charts switch together.

   Note: each visual ALSO self-applies the saved theme on its own load
   (see the inline snippet in each visual's <head>), which guarantees the
   correct theme even before this relay runs — avoiding the first-load race.
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

  // Tell each visual iframe which theme to use (used on toggle clicks).
  function relayToIframes(theme) {
    document.querySelectorAll("iframe.viz").forEach(function (frame) {
      setFrameTheme(frame, theme);
    });
  }

  function setFrameTheme(frame, theme) {
    try {
      const doc = frame.contentDocument;
      if (doc && doc.documentElement) doc.documentElement.setAttribute("data-theme", theme);
    } catch (e) {
      /* same-origin on GitHub Pages, so this won't throw in practice */
    }
  }

  // Attach load listeners immediately (not inside window.load) so we never
  // miss an iframe that finishes loading early.
  document.querySelectorAll("iframe.viz").forEach(function (frame) {
    frame.addEventListener("load", function () {
      const theme = root.getAttribute("data-theme") || "light";
      setFrameTheme(frame, theme);
    });
  });
})();
