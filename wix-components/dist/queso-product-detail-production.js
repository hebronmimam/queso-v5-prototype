(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const buildUrl = scriptUrl
    ? new URL("queso-product-detail-production-build.js", scriptUrl)
    : null;

  if (!buildUrl) {
    console.error("Queso product production loader: unable to resolve build URL.");
    return;
  }

  /*
   * Keep this Wix-facing URL permanent. The internal build is fetched
   * with a cache buster, so future fixes can be deployed without asking
   * Wix users to replace the Custom Element URL again.
   */
  buildUrl.searchParams.set("cache", String(Date.now()));

  const script = document.createElement("script");
  script.src = buildUrl.href;
  script.async = false;
  script.onerror = () => {
    console.error("Queso product production loader: build failed to load.");
  };
  document.head.appendChild(script);
})();
