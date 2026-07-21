(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const baseUrl = scriptUrl
    ? new URL("queso-cart-drawer-build.js", scriptUrl)
    : null;

  function sameItemOrder(existingArticles, items) {
    if (existingArticles.length !== items.length) return false;

    return items.every((item, index) => {
      return String(existingArticles[index]?.dataset?.lineItem || "") ===
        String(item?.id || "");
    });
  }

  function patch(CartDrawer) {
    const prototype = CartDrawer?.prototype;
    if (!prototype || prototype.__quesoSmoothCartPatched) return;

    const originalAttributeChanged = prototype.attributeChangedCallback;
    const originalRender = prototype.render;
    const originalBindEvents = prototype.bindEvents;

    prototype.updateQuesoCartBusyState = function updateQuesoCartBusyState() {
      const busy = Boolean(this.busy);
      const cart = this.cart;
      const hasItems = Array.isArray(cart?.items) && cart.items.length > 0;

      this.shadowRoot?.querySelectorAll("[data-cart-remove]").forEach((button) => {
        button.disabled = busy;
      });

      this.shadowRoot?.querySelectorAll("[data-cart-quantity]").forEach((button) => {
        const control = button.closest(".quantity-control");
        const current = Math.max(
          1,
          Number(control?.querySelector("span")?.textContent || 1)
        );
        const next = Math.max(
          1,
          Number(button.dataset.cartNextQuantity || current)
        );

        button.disabled = busy || (next < current && current <= 1);
      });

      const viewCart = this.shadowRoot?.querySelector("[data-cart-page]");
      if (viewCart) viewCart.disabled = busy || !hasItems;

      const checkout = this.shadowRoot?.querySelector("[data-cart-checkout]");
      if (checkout) checkout.disabled = busy || !hasItems;
    };

    prototype.updateQuesoCartMessage = function updateQuesoCartMessage() {
      const status = this.shadowRoot?.querySelector(".cart-status");
      if (status) status.textContent = this.value("cart-message", "");
    };

    prototype.renderQuesoCartPreservingScroll = function renderQuesoCartPreservingScroll() {
      const content = this.shadowRoot?.querySelector(".cart-content");
      const scrollTop = Number(content?.scrollTop || 0);

      originalRender.call(this);
      originalBindEvents.call(this);

      requestAnimationFrame(() => {
        const nextContent = this.shadowRoot?.querySelector(".cart-content");
        if (nextContent) nextContent.scrollTop = scrollTop;
        this.updateQuesoCartBusyState();
        this.updateQuesoCartMessage();
      });
    };

    prototype.updateQuesoCartDataInPlace = function updateQuesoCartDataInPlace() {
      const cart = this.cart;
      const items = Array.isArray(cart?.items) ? cart.items : [];
      const articles = Array.from(
        this.shadowRoot?.querySelectorAll("[data-line-item]") || []
      );

      if (!sameItemOrder(articles, items)) {
        this.renderQuesoCartPreservingScroll();
        return;
      }

      const itemCount = Math.max(0, Number(cart?.itemCount || 0));
      const count = this.shadowRoot?.querySelector(".drawer-header p");
      if (count) {
        count.textContent = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;
      }

      const subtotal = this.shadowRoot?.querySelector(".subtotal-row strong");
      if (subtotal) subtotal.textContent = String(cart?.subtotal || "HK$0.00");

      items.forEach((item, index) => {
        const article = articles[index];
        if (!article) return;

        const quantity = Math.max(1, Number(item?.quantity || 1));
        const quantityText = article.querySelector(".quantity-control span");
        if (quantityText) quantityText.textContent = String(quantity);

        const quantityButtons = article.querySelectorAll("[data-cart-quantity]");
        if (quantityButtons[0]) {
          quantityButtons[0].dataset.cartNextQuantity = String(
            Math.max(1, quantity - 1)
          );
        }
        if (quantityButtons[1]) {
          quantityButtons[1].dataset.cartNextQuantity = String(quantity + 1);
        }

        const unitPrice = article.querySelector(".unit-price");
        if (unitPrice) unitPrice.textContent = String(item?.unitPrice || "");

        const lineTotal = article.querySelector(".item-footer > strong");
        if (lineTotal) {
          lineTotal.textContent = String(item?.lineTotal || item?.unitPrice || "");
        }
      });

      this.updateQuesoCartBusyState();
      this.updateQuesoCartMessage();
    };

    prototype.attributeChangedCallback = function attributeChangedCallback(
      name,
      oldValue,
      newValue
    ) {
      if (!this.isConnected || oldValue === newValue) return;

      if (name === "cart-busy") {
        this.updateQuesoCartBusyState();
        return;
      }

      if (name === "cart-message") {
        this.updateQuesoCartMessage();
        return;
      }

      if (name === "cart-data") {
        this.updateQuesoCartDataInPlace();
        return;
      }

      originalAttributeChanged.call(this, name, oldValue, newValue);
    };

    prototype.__quesoSmoothCartPatched = true;

    document.querySelectorAll("queso-cart-drawer").forEach((element) => {
      element.updateQuesoCartBusyState?.();
      element.updateQuesoCartMessage?.();
    });
  }

  if (!baseUrl) {
    console.error("Queso cart production build: unable to resolve base cart URL.");
    return;
  }

  baseUrl.searchParams.set("build", "smooth-cart-1");
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
