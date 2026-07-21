(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const baseUrl = scriptUrl
    ? new URL("queso-cart-page-build.js", scriptUrl)
    : null;

  const EMPTY_CART = {
    itemCount: 0,
    subtotal: "HK$0.00",
    items: []
  };

  function prepareFrameDocument() {
    document.documentElement.style.setProperty("width", "100%", "important");
    document.documentElement.style.setProperty("height", "auto", "important");
    document.documentElement.style.setProperty("min-height", "0", "important");
    document.documentElement.style.setProperty("overflow-x", "hidden", "important");
    document.documentElement.style.setProperty("overflow-y", "hidden", "important");
    document.documentElement.style.setProperty("scrollbar-gutter", "stable", "important");

    document.body.style.setProperty("width", "100%", "important");
    document.body.style.setProperty("height", "auto", "important");
    document.body.style.setProperty("min-height", "0", "important");
    document.body.style.setProperty("margin", "0", "important");
    document.body.style.setProperty("overflow", "hidden", "important");
  }

  function patch(CartPage) {
    const prototype = CartPage?.prototype;
    if (!prototype || prototype.__quesoDynamicHeightPatchedV2) return;

    const originalRender = prototype.render;

    Object.defineProperty(prototype, "cart", {
      configurable: true,
      get() {
        const cart = this.json("cart-data", null);
        return cart && typeof cart === "object"
          ? cart
          : EMPTY_CART;
      }
    });

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
            overflow: hidden !important;
          }

          .page,
          :host([data-wix-frame]) .page {
            position: relative !important;
            inset: auto !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: hidden !important;
          }
        `;

        this.shadowRoot.appendChild(style);
      }
    };

    prototype.measureQuesoDynamicHeight = function measureQuesoDynamicHeight() {
      const page = this.shadowRoot?.querySelector(".page");
      if (!page) return 0;

      const rawHeight = Math.max(
        page.scrollHeight || 0,
        page.getBoundingClientRect().height || 0
      );

      return Math.max(1, Math.ceil(rawHeight / 4) * 4);
    };

    prototype.applyQuesoDynamicHeight = function applyQuesoDynamicHeight(height) {
      const previous = Number(this.__quesoMeasuredHeight || 0);

      if (previous && Math.abs(previous - height) < 8) {
        return;
      }

      this.__quesoMeasuredHeight = height;

      this.style.setProperty("height", `${height}px`, "important");
      this.style.setProperty("min-height", `${height}px`, "important");
      this.style.setProperty("max-height", "none", "important");
      this.style.setProperty("overflow", "hidden", "important");

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

    prototype.scheduleQuesoDynamicHeight = function scheduleQuesoDynamicHeight() {
      clearTimeout(this.__quesoHeightTimer);

      this.__quesoHeightTimer = setTimeout(() => {
        const first = this.measureQuesoDynamicHeight();

        requestAnimationFrame(() => {
          const second = this.measureQuesoDynamicHeight();
          const stableHeight = Math.max(first, second);

          if (!stableHeight) return;

          if (this.__quesoPendingHeight === stableHeight) {
            this.__quesoPendingMatches = Number(this.__quesoPendingMatches || 0) + 1;
          } else {
            this.__quesoPendingHeight = stableHeight;
            this.__quesoPendingMatches = 1;
          }

          if (this.__quesoPendingMatches >= 2 || !this.__quesoMeasuredHeight) {
            this.applyQuesoDynamicHeight(stableHeight);
            this.__quesoPendingMatches = 0;
          } else {
            this.scheduleQuesoDynamicHeight();
          }
        });
      }, 120);
    };

    prototype.observeQuesoDynamicHeight = function observeQuesoDynamicHeight() {
      this.__quesoHeightObserver?.disconnect();

      const page = this.shadowRoot?.querySelector(".page");
      if (!page) return;

      this.__quesoHeightObserver = new ResizeObserver(() => {
        this.scheduleQuesoDynamicHeight();
      });

      this.__quesoHeightObserver.observe(page);
      this.scheduleQuesoDynamicHeight();
    };

    prototype.render = function render() {
      originalRender.call(this);
      this.installQuesoDynamicHeightStyles();
      this.observeQuesoDynamicHeight();
    };

    prototype.__quesoDynamicHeightPatchedV2 = true;

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

  baseUrl.searchParams.set("build", "dynamic-height-2");
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
