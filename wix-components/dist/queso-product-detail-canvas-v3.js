(() => {
  "use strict";

  /*
   * Compatibility value required by the Canvas v2 template while
   * preserving the Wix-tested upload and variant runtime beneath it.
   */
  window.messageMaximum = 40;

  const scriptUrl = document.currentScript?.src || "";
  const canvasUrl = scriptUrl
    ? new URL("queso-product-detail-canvas-v2.js", scriptUrl).href
    : "";

  if (!canvasUrl) {
    console.error("Queso Canvas v3: unable to resolve Canvas component URL.");
    return;
  }

  const script = document.createElement("script");
  script.src = `${canvasUrl}?v=canvas-v3-1`;
  script.async = false;
  script.onerror = () => {
    console.error("Queso Canvas v3: Canvas component failed to load.");
  };
  document.head.appendChild(script);
})();
