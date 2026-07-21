(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const baseUrl = scriptUrl
    ? new URL("queso-cart-page-dynamic-height-v2.js", scriptUrl)
    : null;
  const SESSION_KEY = "queso-selected-delivery-date";
  const CHECKOUT_PENDING_MESSAGE = "__queso_checkout_pending__";

  function hasSelectedDeliveryDate() {
    try {
      return /^\d{4}-\d{2}-\d{2}$/.test(
        String(sessionStorage.getItem(SESSION_KEY) || "").trim()
      );
    } catch (error) {
      console.log("Queso cart checkout session state unavailable:", error);
      return false;
    }
  }

  function patch(CartPage) {
    const prototype = CartPage?.prototype;
    if (!prototype || prototype.__quesoLocalCheckoutFeedbackPatchedV1) return;

    const originalFeedback = prototype.feedback;

    prototype.clearQuesoLocalCheckoutFeedback = function clearQuesoLocalCheckoutFeedback() {
      clearTimeout(this.__quesoLocalCheckoutTimer);
      this.__quesoLocalCheckoutActive = false;
      this.checkoutPending = false;
      this.updateCheckoutButton?.();
    };

    /*
     * Start the visual state locally, inside the component itself.
     * No Velo attribute update is needed, so Wix does not refresh/flicker
     * the custom element before navigation.
     */
    prototype.startCheckoutFeedback = function startCheckoutFeedback() {
      if (!hasSelectedDeliveryDate()) {
        this.clearQuesoLocalCheckoutFeedback();
        return true;
      }

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
        /* Backward compatibility only. The Velo page should no longer send this. */
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

    prototype.__quesoLocalCheckoutFeedbackPatchedV1 = true;

    document.querySelectorAll("queso-cart-page").forEach((element) => {
      const rawMessage = element.value?.("cart-message", "") || "";
      if (rawMessage !== CHECKOUT_PENDING_MESSAGE) {
        element.clearQuesoLocalCheckoutFeedback?.();
      }
    });
  }

  if (!baseUrl) {
    console.error("Queso cart local checkout feedback: unable to resolve build URL.");
    return;
  }

  baseUrl.searchParams.set("local-checkout-feedback", "v1");
  baseUrl.searchParams.set("cache", String(Date.now()));

  const script = document.createElement("script");
  script.src = baseUrl.href;
  script.async = false;
  script.onload = async () => {
    await customElements.whenDefined("queso-cart-page");
    patch(customElements.get("queso-cart-page"));
  };
  script.onerror = () => {
    console.error("Queso cart local checkout feedback: build failed to load.");
  };

  document.head.appendChild(script);
})();
