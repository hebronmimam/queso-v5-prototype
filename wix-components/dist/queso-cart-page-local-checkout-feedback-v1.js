(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const baseUrl = scriptUrl
    ? new URL("queso-cart-page-dynamic-height-v2.js", scriptUrl)
    : null;
  const CHECKOUT_PENDING_MESSAGE = "__queso_checkout_pending__";

  function patch(CartPage) {
    const prototype = CartPage?.prototype;
    if (!prototype || prototype.__quesoLocalCheckoutFeedbackPatchedV2) return;

    const originalFeedback = prototype.feedback;

    prototype.clearQuesoLocalCheckoutFeedback = function clearQuesoLocalCheckoutFeedback() {
      clearTimeout(this.__quesoLocalCheckoutTimer);
      this.__quesoLocalCheckoutActive = false;
      this.checkoutPending = false;
      this.updateCheckoutButton?.();
    };

    prototype.observeQuesoCheckoutReset = function observeQuesoCheckoutReset() {
      this.__quesoCheckoutResetObserver?.disconnect();

      this.__quesoCheckoutResetObserver = new MutationObserver((mutations) => {
        const resetRequested = mutations.some(
          (mutation) => mutation.type === "attributes" && mutation.attributeName === "checkout-reset"
        );

        if (resetRequested) {
          this.clearQuesoLocalCheckoutFeedback();
        }
      });

      this.__quesoCheckoutResetObserver.observe(this, {
        attributes: true,
        attributeFilter: ["checkout-reset"]
      });
    };

    /*
     * Always show feedback immediately on click.
     * Velo validates the date. If validation fails, it sends checkout-reset.
     * Successful checkout requires no Wix attribute update, so there is no flicker.
     */
    prototype.startCheckoutFeedback = function startCheckoutFeedback() {
      if (this.__quesoLocalCheckoutActive) {
        return false;
      }

      this.__quesoLocalCheckoutActive = true;
      this.checkoutPending = true;
      this.updateCheckoutButton?.();

      clearTimeout(this.__quesoLocalCheckoutTimer);
      this.__quesoLocalCheckoutTimer = setTimeout(() => {
        this.clearQuesoLocalCheckoutFeedback();
      }, 20000);

      return true;
    };

    prototype.feedback = function feedback() {
      const rawMessage = this.value("cart-message", "");

      if (rawMessage === CHECKOUT_PENDING_MESSAGE) {
        this.__quesoLocalCheckoutActive = true;
        this.checkoutPending = true;
        this.updateCheckoutButton?.();
        return;
      }

      if (rawMessage) {
        this.clearQuesoLocalCheckoutFeedback();
      }

      originalFeedback.call(this);

      if (this.__quesoLocalCheckoutActive) {
        this.checkoutPending = true;
        this.updateCheckoutButton?.();
      }
    };

    const originalConnectedCallback = prototype.connectedCallback;
    prototype.connectedCallback = function connectedCallback() {
      originalConnectedCallback.call(this);
      this.observeQuesoCheckoutReset();
    };

    prototype.__quesoLocalCheckoutFeedbackPatchedV2 = true;

    document.querySelectorAll("queso-cart-page").forEach((element) => {
      element.observeQuesoCheckoutReset?.();
      element.clearQuesoLocalCheckoutFeedback?.();
    });
  }

  if (!baseUrl) {
    console.error("Queso cart local checkout feedback: unable to resolve build URL.");
    return;
  }

  baseUrl.searchParams.set("local-checkout-feedback", "v2");
  baseUrl.searchParams.set("cache", String(Date.now()));

  const script = document.createElement("script");
  script.src = baseUrl.href;
  script.async = false;
  script.onload = async () => {
    await customElements.whenDefined("queso-cart-page");
    patch(customElements.get("queso-cart-page"));
  };
  script.onerror = () => {
    console.error("Queso cart local checkout feedback: base build failed to load.");
  };

  document.head.appendChild(script);
})();
