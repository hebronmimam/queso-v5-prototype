(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const baseUrl = scriptUrl
    ? new URL("queso-cart-page-dynamic-height-v2.js", scriptUrl)
    : null;

  const CHECKOUT_PENDING_MESSAGE = "__queso_checkout_pending__";

  function patch(CartPage) {
    const prototype = CartPage?.prototype;
    if (!prototype || prototype.__quesoValidatedCheckoutPatchedV3) return;

    const originalRender = prototype.render;

    /*
     * Clicking the button only emits the checkout event.
     * Velo validates the date/cart first, then controls the loading state.
     */
    prototype.startCheckoutFeedback = function startCheckoutFeedback() {
      return true;
    };

    /*
     * Reset pending state every time the component renders.
     * This prevents an old loading state from surviving after cart-message
     * has been cleared by Velo.
     */
    prototype.render = function render() {
      this.checkoutPending =
        this.value("cart-message", "") === CHECKOUT_PENDING_MESSAGE;

      originalRender.call(this);
    };

    /*
     * Keep the button state tied exactly to the current cart-message value.
     * Empty or normal messages restore Secure checkout immediately.
     */
    prototype.feedback = function feedback() {
      const rawMessage = this.value("cart-message", "");
      const pending = rawMessage === CHECKOUT_PENDING_MESSAGE;

      this.checkoutPending = pending;

      const status = this.shadowRoot?.querySelector(".status");
      if (status) {
        status.textContent = pending ? "" : rawMessage;
      }

      this.updateCheckoutButton?.();
    };

    prototype.__quesoValidatedCheckoutPatchedV3 = true;

    document.querySelectorAll("queso-cart-page").forEach((element) => {
      element.feedback?.();
    });
  }

  if (!baseUrl) {
    console.error("Queso cart page validated checkout: unable to resolve build URL.");
    return;
  }

  baseUrl.searchParams.set("validated-checkout", "v3");
  baseUrl.searchParams.set("cache", String(Date.now()));

  const script = document.createElement("script");
  script.src = baseUrl.href;
  script.async = false;
  script.onload = async () => {
    await customElements.whenDefined("queso-cart-page");
    patch(customElements.get("queso-cart-page"));
  };
  script.onerror = () => {
    console.error("Queso cart page validated checkout: base build failed to load.");
  };

  document.head.appendChild(script);
})();
