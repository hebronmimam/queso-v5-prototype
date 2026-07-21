(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const buildUrl = scriptUrl
    ? new URL("queso-cart-drawer-build.js", scriptUrl)
    : null;

  if (!buildUrl) {
    console.error("Queso cart production loader: unable to resolve build URL.");
    return;
  }

  buildUrl.searchParams.set("cache", String(Date.now()));

  const script = document.createElement("script");
  script.src = buildUrl.href;
  script.async = false;
  script.onerror = () => {
    console.error("Queso cart production loader: build failed to load.");
  };
  document.head.appendChild(script);
})();
