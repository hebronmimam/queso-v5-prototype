(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const BUILD_URL = new URL(
    "queso-menu-showcase-single-action-v1.js",
    SCRIPT_URL
  ).href;

  if (document.querySelector(`script[src="${BUILD_URL}"]`)) {
    return;
  }

  const script = document.createElement("script");
  script.src = BUILD_URL;
  script.async = false;
  document.head.appendChild(script);
})();
