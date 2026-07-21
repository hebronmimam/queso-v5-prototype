(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const baseUrl = scriptUrl
    ? new URL("queso-cart-page-build.js", scriptUrl)
    : null;

  function prepareFrameDocument() {
    document.documentElement.style.setProperty("height", "auto", "important");
    document.documentElement.style.setProperty("min-height", "0", "important");
    document.documentElement.style.setProperty("overflow", "visible", "important");

    document.body.style.setProperty("height", "auto", "important");
    document.body.style.setProperty("min-height", "0", "important");
    document.body.style.setProperty("margin", "0", "important");
    document.body.style.setProperty("overflow", "visible", "important");
  }

  function patch(CartPage) {
    const prototype = CartPage?.prototype;
    if (!prototype || prototype.__quesoDynamicHeightPatchedV1) return;

    const originalRender = prototype.render;

    prototype.installQuesoDynamicHeightStyles = function installQuesoDynamicHeightStyles() {
      if (!this.shadowRoot) return;

      let style = this.shadowRoot.querySelector("style[data-queso-dynamic-height]");

      if (!style) {
        style = document.createElement("style");
        style.dataset.quesoDynamicHeight = "true";
        style.textContent = `
          :host,
          :host([data-wix-frame]) {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
          }

          .page,
          :host([data-wix-frame]) .page {
            position: relative !important;
            inset: auto !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
          }
        `;

        this.shadowRoot.appendChild(style);
      }
    };

    prototype.syncQuesoDynamicHeight = function syncQuesoDynamicHeight() {
      const page = this.shadowRoot?.querySelector(".page");
      if (!page) return;

      const height = Math.max(
        1,
        Math.ceil(
          Math.max(
            page.scrollHeight || 0,
            page.getBoundingClientRect().height || 0
          )
        )
      );

      if (Math.abs(Number(this.__quesoMeasuredHeight || 0) - height) < 2) {
        return;
      }

      this.__quesoMeasuredHeight = height;

      this.style.setProperty("height", `${height}px`, "important");
      this.style.setProperty("min-height", `${height}px`, "important");
      this.style.setProperty("max-height", "none", "important");
      this.style.setProperty("overflow", "visible", "important");

      document.body.style.setProperty("height", `${height}px`, "important");
      document.body.style.setProperty("min-height", `${height}px`, "important");

      this.dispatchEvent(
        new CustomEvent("queso-cart-page-height-change", {
          bubbles: true,
          composed: true,
          detail: { height }
        })
      );
    };

    prototype.observeQuesoDynamicHeight = function observeQuesoDynamicHeight() {
      this.__quesoHeightObserver?.disconnect();

      const page = this.shadowRoot?.querySelector(".page");
      if (!page) return;

      this.__quesoHeightObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => this.syncQuesoDynamicHeight());
      });

      this.__quesoHeightObserver.observe(page);

      requestAnimationFrame(() => {
        this.syncQuesoDynamicHeight();

        requestAnimationFrame(() => this.syncQuesoDynamicHeight());
      });
    };

    prototype.render = function render() {
      originalRender.call(this);
      this.installQuesoDynamicHeightStyles();
      this.observeQuesoDynamicHeight();
    };

    prototype.__quesoDynamicHeightPatchedV1 = true;

    document.querySelectorAll("queso-cart-page").forEach((element) => {
      element.render();
      element.bind();
    });
  }

  if (!baseUrl) {
    console.error("Queso cart page dynamic height: unable to resolve base build URL.");
    return;
  }

  prepareFrameDocument();

  baseUrl.searchParams.set("build", "dynamic-height-1");
  baseUrl.searchParams.set("cache", String(Date.now()));

  const script = document.createElement("script");
  script.src = baseUrl.href;
  script.async = false;
  script.onload = async () => {
    await customElements.whenDefined("queso-cart-page");
    patch(customElements.get("queso-cart-page"));
  };
  script.onerror = () => {
    console.error("Queso cart page dynamic height: base build failed to load.");
  };

  document.head.appendChild(script);
})();
