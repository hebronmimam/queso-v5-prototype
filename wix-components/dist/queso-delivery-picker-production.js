(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const buildUrl = scriptUrl
    ? new URL("queso-delivery-picker-build.js", scriptUrl)
    : null;

  if (!buildUrl) {
    console.error("Queso delivery picker: unable to resolve build URL.");
    return;
  }

  buildUrl.searchParams.set("build", "delivery-picker-1");
  buildUrl.searchParams.set("cache", String(Date.now()));

  const script = document.createElement("script");
  script.src = buildUrl.href;
  script.async = false;
  script.onerror = () => {
    console.error("Queso delivery picker: build failed to load.");
  };
  document.head.appendChild(script);
})();
