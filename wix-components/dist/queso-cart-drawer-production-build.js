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
    if (!prototype || prototype.__quesoOptimisticCartPatchedV2) return;

    const originalBindEvents = prototype.bindEvents;

    prototype.installQuesoCartPresentation = function installQuesoCartPresentation() {
      if (!this.shadowRoot) return;

      let style = this.shadowRoot.querySelector("style[data-queso-cart-presentation]");
      if (!style) {
        style = document.createElement("style");
        style.dataset.quesoCartPresentation = "true";
        style.textContent = `
          .item-thumb.is-custom-text {
            position: relative;
            padding: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            background: #fdf3e6;
          }

          .item-thumb.is-custom-text::before {
            content: "";
            position: absolute;
            inset: 9px;
            border: 1px dashed rgba(61, 36, 22, 0.42);
            pointer-events: none;
          }

          .item-thumb.is-custom-text > span {
            position: relative;
            z-index: 1;
            width: 100%;
            max-width: 88%;
            min-height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            font-size: 13px;
            line-height: 1.05;
            text-align: center;
          }

          .item-thumb.is-custom-text small,
          .item-thumb .custom-badge {
            display: none !important;
          }
        `;
        this.shadowRoot.appendChild(style);
      }

      this.shadowRoot.querySelectorAll(
        ".item-thumb.is-custom-text small, .item-thumb .custom-badge"
      ).forEach((label) => label.remove());
    };

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

      queueMicrotask(() => {
        if (quantityButtons[0]) {
          quantityButtons[0].dataset.cartNextQuantity = String(
            Math.max(1, requestedQuantity - 1)
          );
          quantityButtons[0].disabled = requestedQuantity <= 1;
        }
        if (quantityButtons[1]) {
          quantityButtons[1].dataset.cartNextQuantity = String(requestedQuantity + 1);
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

    prototype.updateQuesoOptimisticRemoval = function updateQuesoOptimisticRemoval(
      button
    ) {
      const article = button.closest("[data-line-item]");
      if (!article) return;

      const quantity = Math.max(
        1,
        Number(article.querySelector(".quantity-control span")?.textContent || 1)
      );

      const lineTotalText = article.querySelector(".item-footer > strong")?.textContent || "";
      const unitPriceText = article.querySelector(".unit-price")?.textContent || "";
      const removalAmount = readMoney(lineTotalText) || (readMoney(unitPriceText) * quantity);

      queueMicrotask(() => {
        article.remove();

        const remainingArticles = Array.from(
          this.shadowRoot?.querySelectorAll("[data-line-item]") || []
        );

        const count = this.shadowRoot?.querySelector(".drawer-header p");
        if (count) {
          const existingCount = Math.max(
            0,
            Number.parseInt(count.textContent || "0", 10) || 0
          );
          const nextCount = Math.max(0, existingCount - quantity);
          count.textContent = `${nextCount} ${nextCount === 1 ? "item" : "items"}`;
        }

        const subtotal = this.shadowRoot?.querySelector(".subtotal-row strong");
        if (subtotal) {
          subtotal.textContent = formatMoney(
            Math.max(0, readMoney(subtotal.textContent) - removalAmount)
          );
        }

        if (!remainingArticles.length) {
          const content = this.shadowRoot?.querySelector(".cart-content");
          if (content) {
            content.innerHTML = `
              <div class="empty-state">
                <strong>Your cart is empty.</strong>
                <p>Choose a Queso cake, make it yours, then come back here.</p>
              </div>
            `;
          }

          const viewCart = this.shadowRoot?.querySelector("[data-cart-page]");
          const checkout = this.shadowRoot?.querySelector("[data-cart-checkout]");
          if (viewCart) viewCart.disabled = true;
          if (checkout) checkout.disabled = true;
        }
      });
    };

    prototype.installQuesoOptimisticCartActions = function installQuesoOptimisticCartActions() {
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

      this.shadowRoot?.querySelectorAll("[data-cart-remove]").forEach((button) => {
        if (button.dataset.quesoOptimisticRemoval === "true") return;

        button.dataset.quesoOptimisticRemoval = "true";
        button.addEventListener(
          "click",
          () => {
            this.updateQuesoOptimisticRemoval(button);
          },
          { capture: true }
        );
      });
    };

    prototype.bindEvents = function bindEvents() {
      originalBindEvents.call(this);
      this.installQuesoCartPresentation();
      this.installQuesoOptimisticCartActions();
    };

    prototype.__quesoOptimisticCartPatchedV2 = true;

    document.querySelectorAll("queso-cart-drawer").forEach((element) => {
      element.installQuesoCartPresentation?.();
      element.installQuesoOptimisticCartActions?.();
    });
  }

  if (!baseUrl) {
    console.error("Queso cart production build: unable to resolve base cart URL.");
    return;
  }

  baseUrl.searchParams.set("build", "optimistic-cart-4");
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
