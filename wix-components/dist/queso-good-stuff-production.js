(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const buildUrl = scriptUrl
    ? new URL("queso-good-stuff-build.js", scriptUrl)
    : null;

  if (!buildUrl) {
    console.error("Queso Good Stuff: unable to resolve build URL.");
    return;
  }

  buildUrl.searchParams.set("build", "good-stuff-1");
  buildUrl.searchParams.set("cache", String(Date.now()));

  const script = document.createElement("script");
  script.src = buildUrl.href;
  script.async = false;
  script.onerror = () => {
    console.error("Queso Good Stuff: build failed to load.");
  };
  document.head.appendChild(script);
})();
