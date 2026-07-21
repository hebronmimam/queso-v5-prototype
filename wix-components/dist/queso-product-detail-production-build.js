(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const canvasUrl = scriptUrl
    ? new URL("queso-product-detail-canvas-v5.js", scriptUrl).href
    : "";

  const normalize = (value) => String(value ?? "").trim().toLowerCase();

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
    if (!prototype || prototype.__quesoProductionBuildPatchedV3) return;

    const originalRender = prototype.render;
    const originalAttributeChanged = prototype.attributeChangedCallback;
    const originalBindEvents = prototype.bindEvents;
    const originalBindCanvasEvents = prototype.bindCanvasEvents;
    const originalUpdateCanvasCustomizer = prototype.updateCanvasV5Customizer;

    prototype.removeQuesoEmbeddedGoodStuff = function removeQuesoEmbeddedGoodStuff() {
      this.shadowRoot?.querySelectorAll(
        ".product-proof, .product-good-stuff, [data-queso-good-stuff]"
      ).forEach((section) => section.remove());
    };

    prototype.render = function render() {
      originalRender.call(this);
      this.removeQuesoEmbeddedGoodStuff();
    };

    prototype.centerQuesoCanvasPreviewMessage = function centerQuesoCanvasPreviewMessage() {
      const message = this.shadowRoot?.querySelector("[data-canvas-preview-message]");
      if (!message) return;

      message.style.setProperty("position", "absolute", "important");
      message.style.setProperty("top", "42px", "important");
      message.style.setProperty("right", "42px", "important");
      message.style.setProperty("bottom", "42px", "important");
      message.style.setProperty("left", "42px", "important");
      message.style.setProperty("width", "auto", "important");
      message.style.setProperty("height", "auto", "important");
      message.style.setProperty("display", "flex", "important");
      message.style.setProperty("align-items", "center", "important");
      message.style.setProperty("justify-content", "center", "important");
      message.style.setProperty("padding", "22px", "important");
      message.style.setProperty("text-align", "center", "important");
      message.style.setProperty("transform", "none", "important");
    };

    prototype.updateCanvasV5Customizer = function updateCanvasV5Customizer() {
      originalUpdateCanvasCustomizer.call(this);
      this.centerQuesoCanvasPreviewMessage();
      this.removeQuesoEmbeddedGoodStuff();
    };

    prototype.clearQuesoLocalAddTimers = function clearQuesoLocalAddTimers() {
      if (this.__quesoLocalAddedTimer) {
        clearTimeout(this.__quesoLocalAddedTimer);
        this.__quesoLocalAddedTimer = 0;
      }

      if (this.__quesoLocalResetTimer) {
        clearTimeout(this.__quesoLocalResetTimer);
        this.__quesoLocalResetTimer = 0;
      }
    };

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

    prototype.canBeginQuesoLocalAddFeedback = function canBeginQuesoLocalAddFeedback() {
      if (this.isEditorPreview || !this.isAvailable) return false;

      const requiredMissing = (Array.isArray(this.customTextFields)
        ? this.customTextFields
        : []
      ).some((field, index) => {
        if (!(field?.mandatory || field?.required)) return false;
        const title = String(field?.title || field?.name || `Custom text ${index + 1}`);
        return !String(this.customTextValues?.[title] || "").trim();
      });

      if (requiredMissing) return false;

      if (!this.isCanvasProduct?.()) return true;

      const decorOption = (Array.isArray(this.options) ? this.options : []).find(
        (option) => normalize(option?.name) === "decor"
      );
      const decor = normalize(this.selectedChoices?.[decorOption?.name]);

      if (decor === "letters") {
        const messageField = this.canvasField?.("Cake Message");
        const messageTitle = String(messageField?.title || messageField?.name || "Cake Message");
        return Boolean(String(this.customTextValues?.[messageTitle] || "").trim());
      }

      if (decor === "picture") {
        const photoField = this.canvasField?.("Photo Upload URL");
        const photoTitle = String(photoField?.title || photoField?.name || "Photo Upload URL");
        const storedPhoto = String(this.customTextValues?.[photoTitle] || "").trim();
        const photoState = this.canvasPhotoState?.() || {};
        return photoState.status !== "uploading" && Boolean(storedPhoto || photoState.fileId);
      }

      return true;
    };

    prototype.showQuesoLocalAddState = function showQuesoLocalAddState(
      state,
      message,
      buttonLabel,
      disabled
    ) {
      const status = this.shadowRoot?.querySelector(".status");
      if (status) {
        status.classList.remove("idle", "adding", "success", "error");
        status.classList.add(state);
        status.textContent = message;
      }

      const button = this.shadowRoot?.querySelector("[data-add-to-cart]");
      if (button) {
        button.disabled = Boolean(disabled);
        button.textContent = buttonLabel;
      }
    };

    prototype.beginQuesoLocalAddFeedback = function beginQuesoLocalAddFeedback() {
      this.clearQuesoLocalAddTimers();

      this.showQuesoLocalAddState(
        "adding",
        "Adding your cake…",
        "Adding…",
        true
      );

      this.__quesoLocalAddedTimer = setTimeout(() => {
        this.__quesoLocalAddedTimer = 0;

        this.showQuesoLocalAddState(
          "success",
          "Added to cart.",
          "Added",
          true
        );

        this.__quesoLocalResetTimer = setTimeout(() => {
          this.__quesoLocalResetTimer = 0;
          this.updateQuesoCartFeedback();
        }, 2200);
      }, 900);
    };

    prototype.installQuesoLocalAddFeedback = function installQuesoLocalAddFeedback() {
      const button = this.shadowRoot?.querySelector("[data-add-to-cart]");
      if (!button || button.dataset.quesoLocalAddFeedback === "true") return;

      button.dataset.quesoLocalAddFeedback = "true";
      button.addEventListener("click", () => {
        if (!this.canBeginQuesoLocalAddFeedback()) return;
        this.beginQuesoLocalAddFeedback();
      });
    };

    prototype.bindCanvasEvents = function bindCanvasEvents() {
      originalBindCanvasEvents.call(this);
      this.installQuesoLocalAddFeedback();
      this.centerQuesoCanvasPreviewMessage();
      this.removeQuesoEmbeddedGoodStuff();
    };

    prototype.bindEvents = function bindEvents() {
      originalBindEvents.call(this);
      this.installQuesoLocalAddFeedback();
      if (this.isCanvasProduct?.()) {
        this.centerQuesoCanvasPreviewMessage();
      }
      this.removeQuesoEmbeddedGoodStuff();
    };

    prototype.attributeChangedCallback = function attributeChangedCallback(
      name,
      oldValue,
      newValue
    ) {
      if (!this.isConnected || oldValue === newValue) return;

      if (name === "cart-state" || name === "cart-message") {
        if (name === "cart-state" && normalize(newValue) === "error") {
          this.clearQuesoLocalAddTimers();
        }
        this.scheduleQuesoCartFeedback();
        return;
      }

      originalAttributeChanged.call(this, name, oldValue, newValue);
    };

    prototype.__quesoProductionBuildPatchedV3 = true;

    document.querySelectorAll("queso-product-detail").forEach((element) => {
      element.updateQuesoCartFeedback?.();
      element.installQuesoLocalAddFeedback?.();
      element.centerQuesoCanvasPreviewMessage?.();
      element.removeQuesoEmbeddedGoodStuff?.();
    });
  }

  if (!canvasUrl) {
    console.error("Queso product production build: unable to resolve Canvas runtime URL.");
    return;
  }

  const script = document.createElement("script");
  const target = new URL(canvasUrl);
  target.searchParams.set("build", "production-5");
  target.searchParams.set("cache", String(Date.now()));
  script.src = target.href;
  script.async = false;
  script.onload = () => waitForCanvas();
  script.onerror = () => {
    console.error("Queso product production build: Canvas runtime failed to load.");
  };
  document.head.appendChild(script);
})();
