(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const buildUrl = scriptUrl
    ? new URL("queso-events-cms-v1.js", scriptUrl)
    : null;

  if (!buildUrl) {
    console.error("Queso events: unable to resolve production build URL.");
    return;
  }

  buildUrl.searchParams.set("cache", String(Date.now()));

  const script = document.createElement("script");
  script.src = buildUrl.href;
  script.async = false;
  script.onerror = () => {
    console.error("Queso events: production build failed to load.");
  };

  document.head.appendChild(script);
})();
