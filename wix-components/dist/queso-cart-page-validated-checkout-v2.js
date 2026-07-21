(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const baseUrl = scriptUrl
    ? new URL("queso-cart-page-dynamic-height-v2.js", scriptUrl)
    : null;

  function patch(CartPage) {
    const prototype = CartPage?.prototype;
    if (!prototype || prototype.__quesoValidatedCheckoutPatchedV2) return;

    /*
     * Do not enter the pending state inside the Custom Element click handler.
     * Velo must first validate the selected delivery date and cart contents.
     * After validation succeeds, Velo sets the checkout-pending message token,
     * which the component already converts into the spinner/button state.
     */
    prototype.startCheckoutFeedback = function startCheckoutFeedback() {
      return true;
    };

    prototype.__quesoValidatedCheckoutPatchedV2 = true;

    document.querySelectorAll("queso-cart-page").forEach((element) => {
      if (element.checkoutPending) {
        element.checkoutPending = false;
        element.updateCheckoutButton?.();
      }
    });
  }

  if (!baseUrl) {
    console.error("Queso cart page validated checkout: unable to resolve build URL.");
    return;
  }

  baseUrl.searchParams.set("validated-checkout", "v2");
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
