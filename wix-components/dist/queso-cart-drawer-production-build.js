(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const baseUrl = scriptUrl
    ? new URL("queso-cart-drawer-build.js", scriptUrl)
    : null;

  function readMoney(value) {
    const numeric = String(value || "")
      .replace(/[^0-9.-]+/g, "");

    const amount = Number(numeric);
    return Number.isFinite(amount) ? amount : 0;
  }

  function formatMoney(amount) {
    return `HK$${Number(amount || 0).toLocaleString("en-HK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  function patch(CartDrawer) {
    const prototype = CartDrawer?.prototype;
    if (!prototype || prototype.__quesoOptimisticCartPatched) return;

    const originalBindEvents = prototype.bindEvents;

    prototype.updateQuesoOptimisticQuantity = function updateQuesoOptimisticQuantity(
      button
    ) {
      const article = button.closest("[data-line-item]");
      const control = button.closest(".quantity-control");
      const quantityText = control?.querySelector("span");

      if (!article || !control || !quantityText) return;

      const currentQuantity = Math.max(
        1,
        Number(quantityText.textContent || 1)
      );

      const requestedQuantity = Math.max(
        1,
        Number(button.dataset.cartNextQuantity || currentQuantity)
      );

      if (requestedQuantity === currentQuantity) return;

      const unitPriceText = article.querySelector(".unit-price")?.textContent || "";
      const unitPrice = readMoney(unitPriceText);
      const delta = requestedQuantity - currentQuantity;

      quantityText.textContent = String(requestedQuantity);

      const quantityButtons = control.querySelectorAll("[data-cart-quantity]");

      /*
       * Keep the clicked button's current data value until the base event
       * listener has emitted it to Wix. Update both controls in a microtask
       * immediately after the click event finishes.
       */
      queueMicrotask(() => {
        if (quantityButtons[0]) {
          quantityButtons[0].dataset.cartNextQuantity = String(
            Math.max(1, requestedQuantity - 1)
          );
          quantityButtons[0].disabled = requestedQuantity <= 1;
        }
        if (quantityButtons[1]) {
          quantityButtons[1].dataset.cartNextQuantity = String(
            requestedQuantity + 1
          );
        }
      });

      const lineTotal = article.querySelector(".item-footer > strong");
      if (lineTotal && unitPrice > 0) {
        lineTotal.textContent = formatMoney(unitPrice * requestedQuantity);
      }

      const count = this.shadowRoot?.querySelector(".drawer-header p");
      if (count) {
        const existingCount = Math.max(
          0,
          Number.parseInt(count.textContent || "0", 10) || 0
        );
        const nextCount = Math.max(0, existingCount + delta);
        count.textContent = `${nextCount} ${nextCount === 1 ? "item" : "items"}`;
      }

      const subtotal = this.shadowRoot?.querySelector(".subtotal-row strong");
      if (subtotal && unitPrice > 0) {
        subtotal.textContent = formatMoney(
          Math.max(0, readMoney(subtotal.textContent) + (unitPrice * delta))
        );
      }
    };

    prototype.installQuesoOptimisticQuantity = function installQuesoOptimisticQuantity() {
      this.shadowRoot?.querySelectorAll("[data-cart-quantity]").forEach((button) => {
        if (button.dataset.quesoOptimisticQuantity === "true") return;

        button.dataset.quesoOptimisticQuantity = "true";
        button.addEventListener(
          "click",
          () => {
            this.updateQuesoOptimisticQuantity(button);
          },
          { capture: true }
        );
      });
    };

    prototype.bindEvents = function bindEvents() {
      originalBindEvents.call(this);
      this.installQuesoOptimisticQuantity();
    };

    prototype.__quesoOptimisticCartPatched = true;

    document.querySelectorAll("queso-cart-drawer").forEach((element) => {
      element.installQuesoOptimisticQuantity?.();
    });
  }

  if (!baseUrl) {
    console.error("Queso cart production build: unable to resolve base cart URL.");
    return;
  }

  baseUrl.searchParams.set("build", "optimistic-cart-3");
  baseUrl.searchParams.set("cache", String(Date.now()));

  const script = document.createElement("script");
  script.src = baseUrl.href;
  script.async = false;
  script.onload = async () => {
    await customElements.whenDefined("queso-cart-drawer");
    patch(customElements.get("queso-cart-drawer"));
  };
  script.onerror = () => {
    console.error("Queso cart production build: base cart failed to load.");
  };
  document.head.appendChild(script);
})();
