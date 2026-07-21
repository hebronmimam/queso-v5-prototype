(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const canvasUrl = scriptUrl
    ? new URL("queso-product-detail-canvas-v5.js", scriptUrl).href
    : "";

  function waitForCanvas(attempt = 0) {
    const ProductDetail = customElements.get("queso-product-detail");
    const prototype = ProductDetail?.prototype;

    if (prototype?.__quesoCanvasV5Patched) {
      patch(ProductDetail);
      return;
    }

    if (attempt >= 160) {
      console.error("Queso product production build: Canvas runtime did not finish loading.");
      return;
    }

    setTimeout(() => waitForCanvas(attempt + 1), 25);
  }

  function patch(ProductDetail) {
    const prototype = ProductDetail?.prototype;
    if (!prototype || prototype.__quesoProductionBuildPatched) return;

    const originalAttributeChanged = prototype.attributeChangedCallback;
    const originalBindCanvasEvents = prototype.bindCanvasEvents;

    prototype.updateQuesoCartFeedback = function updateQuesoCartFeedback() {
      const cartState = this.value("cart-state", "idle").toLowerCase();
      const cartMessage = this.value("cart-message", "");
      const adding = cartState === "adding";

      const status = this.shadowRoot?.querySelector(".status");
      if (status) {
        status.classList.remove("idle", "adding", "success", "error");
        status.classList.add(cartState || "idle");
        status.textContent = cartMessage;
      }

      const button = this.shadowRoot?.querySelector("[data-add-to-cart]");
      if (button) {
        button.disabled = this.isEditorPreview || adding || !this.isAvailable;
        button.textContent = adding
          ? "Adding…"
          : this.isAvailable
            ? "Add to cart"
            : "Unavailable";
      }
    };

    prototype.scheduleQuesoCartFeedback = function scheduleQuesoCartFeedback() {
      if (this.__quesoCartFeedbackFrame) {
        cancelAnimationFrame(this.__quesoCartFeedbackFrame);
      }

      this.__quesoCartFeedbackFrame = requestAnimationFrame(() => {
        this.__quesoCartFeedbackFrame = 0;
        this.updateQuesoCartFeedback();
      });
    };

    prototype.beginQuesoLocalAddFeedback = function beginQuesoLocalAddFeedback() {
      if (this.__quesoLocalAddResetTimer) {
        clearTimeout(this.__quesoLocalAddResetTimer);
      }

      const status = this.shadowRoot?.querySelector(".status");
      if (status) {
        status.classList.remove("idle", "success", "error");
        status.classList.add("adding");
        status.textContent = "Adding your cake…";
      }

      const button = this.shadowRoot?.querySelector("[data-add-to-cart]");
      if (button) {
        button.disabled = true;
        button.textContent = "Adding…";
      }

      this.__quesoLocalAddResetTimer = setTimeout(() => {
        this.__quesoLocalAddResetTimer = 0;
        this.updateQuesoCartFeedback();
      }, 6000);
    };

    prototype.installQuesoLocalAddFeedback = function installQuesoLocalAddFeedback() {
      const button = this.shadowRoot?.querySelector("[data-add-to-cart]");
      if (!button || button.dataset.quesoLocalAddFeedback === "true") return;

      button.dataset.quesoLocalAddFeedback = "true";
      button.addEventListener("click", () => {
        if (this.isEditorPreview || !this.isAvailable) return;
        this.beginQuesoLocalAddFeedback();
      });
    };

    prototype.bindCanvasEvents = function bindCanvasEvents() {
      originalBindCanvasEvents.call(this);
      this.installQuesoLocalAddFeedback();
    };

    prototype.attributeChangedCallback = function attributeChangedCallback(
      name,
      oldValue,
      newValue
    ) {
      if (!this.isConnected || oldValue === newValue) return;

      if (
        this.isCanvasProduct?.() &&
        (name === "cart-state" || name === "cart-message")
      ) {
        this.scheduleQuesoCartFeedback();
        return;
      }

      originalAttributeChanged.call(this, name, oldValue, newValue);
    };

    prototype.__quesoProductionBuildPatched = true;

    document.querySelectorAll("queso-product-detail").forEach((element) => {
      element.updateQuesoCartFeedback?.();
      element.installQuesoLocalAddFeedback?.();
    });
  }

  if (!canvasUrl) {
    console.error("Queso product production build: unable to resolve Canvas runtime URL.");
    return;
  }

  const script = document.createElement("script");
  const target = new URL(canvasUrl);
  target.searchParams.set("build", "production-2");
  target.searchParams.set("cache", String(Date.now()));
  script.src = target.href;
  script.async = false;
  script.onload = () => waitForCanvas();
  script.onerror = () => {
    console.error("Queso product production build: Canvas runtime failed to load.");
  };
  document.head.appendChild(script);
})();
