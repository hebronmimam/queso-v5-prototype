(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const buildFiles = [
    "queso-product-detail-production-build.js",
    "queso-product-detail-four-line-message-v1.js"
  ];

  if (!scriptUrl) {
    console.error("Queso product production loader: unable to resolve build URLs.");
    return;
  }

  function loadBuild(index) {
    if (index >= buildFiles.length) return;

    const target = new URL(buildFiles[index], scriptUrl);
    target.searchParams.set("cache", String(Date.now()));

    const script = document.createElement("script");
    script.src = target.href;
    script.async = false;
    script.addEventListener("load", () => loadBuild(index + 1), { once: true });
    script.addEventListener(
      "error",
      () => {
        console.error(
          `Queso product production loader: ${buildFiles[index]} failed to load.`
        );
      },
      { once: true }
    );

    document.head.appendChild(script);
  }

  loadBuild(0);
})();
