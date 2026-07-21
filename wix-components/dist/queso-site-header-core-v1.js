(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const baseHeaderUrl = scriptUrl
    ? new URL("queso-site-header.js", scriptUrl).href
    : "";

  function patch(HeaderClass) {
    const prototype = HeaderClass?.prototype;
    if (!prototype || prototype.__quesoCoreHeaderPatched) return;

    const originalRender = prototype.render;

    prototype.render = function render() {
      originalRender.call(this);
      this.shadowRoot?.querySelector(".desktop-cake-menu")?.remove();
    };

    prototype.__quesoCoreHeaderPatched = true;

    document.querySelectorAll("queso-site-header").forEach((element) => {
      element.render();
      element.bindEvents();
    });
  }

  if (!baseHeaderUrl) {
    console.error("Queso core header: unable to resolve base header URL.");
    return;
  }

  const script = document.createElement("script");
  script.src = `${baseHeaderUrl}?v=core-header-1`;
  script.async = false;
  script.onload = async () => {
    await customElements.whenDefined("queso-site-header");
    patch(customElements.get("queso-site-header"));
  };
  script.onerror = () => {
    console.error("Queso core header: base header failed to load.");
  };
  document.head.appendChild(script);
})();
