(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const buildUrl = scriptUrl
    ? new URL("queso-home-cake-menu-v1.js", scriptUrl)
    : null;

  if (!buildUrl) {
    console.error("Queso home cake menu: unable to resolve build URL.");
    return;
  }

  buildUrl.searchParams.set("build", "home-cake-menu-1");
  buildUrl.searchParams.set("cache", String(Date.now()));

  const script = document.createElement("script");
  script.src = buildUrl.href;
  script.async = false;
  script.onerror = () => {
    console.error("Queso home cake menu: build failed to load.");
  };
  document.head.appendChild(script);
})();
