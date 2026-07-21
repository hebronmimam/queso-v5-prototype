(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = SCRIPT_URL ? new URL("../../", SCRIPT_URL).href : "";
  const FONT_LOVELO = REPO_ROOT ? new URL("Lovelo_Black.otf", REPO_ROOT).href : "";
  const FONT_QUICKSAND = REPO_ROOT ? new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href : "";
  const IS_WIX_FRAME = window.self !== window.top;

  const EDITOR_CART = {
    itemCount: 2,
    subtotal: "HK$996.00",
    items: [
      {
        id: "canvas-text-preview",
        name: "Canvas",
        quantity: 1,
        unitPrice: "HK$498.00",
        lineTotal: "HK$498.00",
        image: "",
        previewImage: "",
        previewText: "Happy birthday, Mia!",
        options: [
          { name: "Flavour", value: "Chocolate" },
          { name: "Topping", value: "No Thanks" },
          { name: "Decor", value: "Letters" }
        ]
      },
      {
        id: "regular-cake-preview",
        name: "Birthday Suit",
        quantity: 1,
        unitPrice: "HK$498.00",
        lineTotal: "HK$498.00",
        image: "",
        previewImage: "",
        previewText: "",
        options: [{ name: "Flavour", value: "Classic" }]
      }
    ]
  };

  function installFonts() {
    if (!FONT_LOVELO || document.head.querySelector("style[data-queso-cart-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoCartFonts = "true";
    style.textContent = `
      @font-face {
        font-family: "Lovelo";
        src: url("${FONT_LOVELO}") format("opentype");
        font-weight: 900;
        font-style: normal;
        font-display: swap;
      }

      @font-face {
        font-family: "Quicksand";
        src: url("${FONT_QUICKSAND}") format("truetype");
        font-weight: 300 700;
        font-style: normal;
        font-display: swap;
      }
    `;

    document.head.appendChild(style);
  }

  class QuesoCartDrawer extends HTMLElement {
    static get observedAttributes() {
      return ["cart-data", "cart-busy", "cart-message"];
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      installFonts();
      this.toggleAttribute("data-wix-frame", IS_WIX_FRAME);
      this.render();
      this.bindEvents();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (!this.isConnected || oldValue === newValue) return;
      this.render();
      this.bindEvents();
    }

    value(name, fallback = "") {
      const value = this.getAttribute(name);
      return value === null || value.trim() === "" ? fallback : value.trim();
    }

    parseJson(name, fallback) {
      try {
        const raw = this.value(name, "");
        return raw ? JSON.parse(raw) : fallback;
      } catch (error) {
        console.error(`Queso cart: invalid ${name} JSON.`, error);
        return fallback;
      }
    }

    escape(value) {
      return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    get cart() {
      const supplied = this.parseJson("cart-data", null);
      return supplied && typeof supplied === "object"
        ? supplied
        : EDITOR_CART;
    }

    get busy() {
      return ["true", "1", "yes", "on"].includes(this.value("cart-busy", "false").toLowerCase());
    }

    renderThumbnail(item) {
      const previewImage = String(item?.previewImage || "").trim();
      const previewText = String(item?.previewText || "").trim();
      const productImage = String(item?.image || "").trim();

      if (previewImage) {
        return `
          <div class="item-thumb is-custom-image">
            <img src="${this.escape(previewImage)}" alt="${this.escape(item?.name || "Canvas")} custom image">
            <span class="custom-badge">Your image</span>
          </div>
        `;
      }

      if (previewText) {
        return `
          <div class="item-thumb is-custom-text" aria-label="Customer cake message: ${this.escape(previewText)}">
            <span>${this.escape(previewText)}</span>
            <small>Your message</small>
          </div>
        `;
      }

      if (productImage) {
        return `
          <div class="item-thumb">
            <img src="${this.escape(productImage)}" alt="${this.escape(item?.name || "Queso product")}">
          </div>
        `;
      }

      return `
        <div class="item-thumb is-placeholder" aria-hidden="true">
          <span>Q</span>
        </div>
      `;
    }

    renderOptions(item) {
      const options = Array.isArray(item?.options) ? item.options : [];
      if (!options.length) return "";

      return `
        <dl class="item-options">
          ${options.map((option) => `
            <div>
              <dt>${this.escape(option?.name || "Option")}</dt>
              <dd>${this.escape(option?.value || "")}</dd>
            </div>
          `).join("")}
        </dl>
      `;
    }

    renderItem(item) {
      const id = String(item?.id || "");
      const quantity = Math.max(1, Number(item?.quantity || 1));

      return `
        <article class="cart-item" data-line-item="${this.escape(id)}">
          ${this.renderThumbnail(item)}

          <div class="item-main">
            <div class="item-heading">
              <div>
                <h3>${this.escape(item?.name || "Queso cake")}</h3>
                <p class="unit-price">${this.escape(item?.unitPrice || "")}</p>
              </div>

              <button
                class="remove-button"
                type="button"
                data-cart-remove="${this.escape(id)}"
                aria-label="Remove ${this.escape(item?.name || "item")}"
                ${this.busy ? "disabled" : ""}
              >×</button>
            </div>

            ${this.renderOptions(item)}

            <div class="item-footer">
              <div class="quantity-control" aria-label="Quantity for ${this.escape(item?.name || "item")}">
                <button
                  type="button"
                  data-cart-quantity="${this.escape(id)}"
                  data-cart-next-quantity="${Math.max(1, quantity - 1)}"
                  aria-label="Decrease quantity"
                  ${this.busy || quantity <= 1 ? "disabled" : ""}
                >−</button>
                <span>${quantity}</span>
                <button
                  type="button"
                  data-cart-quantity="${this.escape(id)}"
                  data-cart-next-quantity="${quantity + 1}"
                  aria-label="Increase quantity"
                  ${this.busy ? "disabled" : ""}
                >+</button>
              </div>

              <strong>${this.escape(item?.lineTotal || item?.unitPrice || "")}</strong>
            </div>
          </div>
        </article>
      `;
    }

    render() {
      const cart = this.cart;
      const items = Array.isArray(cart?.items) ? cart.items : [];
      const itemCount = Math.max(0, Number(cart?.itemCount || 0));
      const message = this.value("cart-message", "");

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            --orange: #ed6011;
            --burnt: #df6a06;
            --cream: #fdf3e6;
            --yellow: #f4c24a;
            --brown: #3d2416;
            --pink: #efa3b5;
            display: block;
            width: 100%;
            height: 100%;
            min-width: 0;
            min-height: 0;
            overflow: hidden;
            color: var(--brown);
            font-family: "Quicksand", Arial, sans-serif;
            font-weight: 550;
          }

          :host([data-wix-frame]) {
            height: auto;
          }

          :host([data-wix-frame]) .cart-shell {
            position: fixed;
            inset: 0;
          }

          *, *::before, *::after { box-sizing: border-box; }
          button, a { color: inherit; font: inherit; }
          button { cursor: pointer; }
          button:disabled { cursor: not-allowed; opacity: 0.45; }

          .cart-shell {
            width: 100%;
            height: 100%;
            min-height: 100vh;
            display: grid;
            grid-template-columns: minmax(0, 1fr) min(470px, 100%);
            background: rgba(61, 36, 22, 0.46);
            backdrop-filter: blur(2px);
          }

          .cart-dismiss {
            width: 100%;
            height: 100%;
            border: 0;
            background: transparent;
          }

          .drawer {
            min-width: 0;
            height: 100%;
            display: grid;
            grid-template-rows: auto minmax(0, 1fr) auto;
            background: var(--cream);
            border-left: 2px solid var(--brown);
            box-shadow: -18px 0 50px rgba(61, 36, 22, 0.16);
          }

          .drawer-header {
            min-height: 92px;
            padding: 24px 26px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            border-bottom: 2px solid var(--brown);
            background: var(--yellow);
          }

          .drawer-header h1 {
            margin: 0;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(28px, 5vw, 42px);
            line-height: 0.95;
            text-transform: uppercase;
          }

          .drawer-header p {
            margin: 6px 0 0;
            font-size: 12px;
            font-weight: 750;
          }

          .close-button {
            width: 44px;
            height: 44px;
            flex: 0 0 auto;
            border: 2px solid var(--brown);
            border-radius: 50%;
            background: var(--cream);
            font-size: 28px;
            line-height: 1;
          }

          .cart-content {
            min-height: 0;
            overflow-y: auto;
            overscroll-behavior: contain;
            scrollbar-width: thin;
          }

          .items { padding: 0 26px; }

          .cart-item {
            padding: 24px 0;
            display: grid;
            grid-template-columns: 116px minmax(0, 1fr);
            gap: 18px;
            border-bottom: 1px solid rgba(61, 36, 22, 0.28);
          }

          .item-thumb {
            position: relative;
            width: 116px;
            aspect-ratio: 1;
            overflow: hidden;
            display: grid;
            place-items: center;
            border: 2px solid var(--brown);
            background: #fff;
          }

          .item-thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .item-thumb.is-custom-text {
            padding: 14px;
            align-content: center;
            gap: 10px;
            text-align: center;
            background: linear-gradient(145deg, var(--pink), var(--yellow));
          }

          .item-thumb.is-custom-text > span {
            max-width: 100%;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 14px;
            line-height: 1;
            text-transform: uppercase;
            overflow-wrap: anywhere;
          }

          .item-thumb.is-custom-text small,
          .custom-badge {
            font-size: 8px;
            font-weight: 850;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .custom-badge {
            position: absolute;
            right: 6px;
            bottom: 6px;
            padding: 4px 6px;
            border: 1px solid var(--brown);
            background: var(--yellow);
          }

          .item-thumb.is-placeholder {
            background: var(--orange);
            color: #fff;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 46px;
          }

          .item-main { min-width: 0; }

          .item-heading {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
          }

          .item-heading h3 {
            margin: 0;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 19px;
            line-height: 1.05;
            text-transform: uppercase;
          }

          .unit-price {
            margin: 5px 0 0;
            color: var(--burnt);
            font-size: 12px;
            font-weight: 750;
          }

          .remove-button {
            width: 30px;
            height: 30px;
            flex: 0 0 auto;
            border: 0;
            background: transparent;
            font-size: 25px;
            line-height: 1;
          }

          .item-options {
            margin: 14px 0 0;
            display: grid;
            gap: 5px;
            font-size: 11px;
          }

          .item-options div {
            display: grid;
            grid-template-columns: minmax(64px, auto) minmax(0, 1fr);
            gap: 8px;
          }

          .item-options dt { font-weight: 800; }
          .item-options dd { margin: 0; overflow-wrap: anywhere; }

          .item-footer {
            margin-top: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
          }

          .quantity-control {
            display: grid;
            grid-template-columns: 34px 38px 34px;
            min-height: 36px;
            border: 1px solid var(--brown);
          }

          .quantity-control button {
            border: 0;
            background: #fff;
            font-size: 18px;
          }

          .quantity-control span {
            display: grid;
            place-items: center;
            border-right: 1px solid rgba(61, 36, 22, 0.22);
            border-left: 1px solid rgba(61, 36, 22, 0.22);
            background: var(--cream);
            font-size: 12px;
            font-weight: 800;
          }

          .empty-state {
            min-height: 100%;
            padding: 56px 28px;
            display: grid;
            place-items: center;
            align-content: center;
            gap: 13px;
            text-align: center;
          }

          .empty-state strong {
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 28px;
            text-transform: uppercase;
          }

          .empty-state p {
            max-width: 290px;
            margin: 0;
            font-size: 13px;
            line-height: 1.55;
          }

          .drawer-footer {
            padding: 22px 26px 26px;
            border-top: 2px solid var(--brown);
            background: var(--cream);
          }

          .subtotal-row {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 20px;
            font-size: 15px;
          }

          .subtotal-row strong {
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 24px;
          }

          .footer-note {
            margin: 7px 0 16px;
            font-size: 10px;
            line-height: 1.45;
          }

          .cart-status {
            min-height: 18px;
            margin: 0 0 10px;
            color: #a52a23;
            font-size: 11px;
            font-weight: 750;
          }

          .drawer-actions {
            display: grid;
            grid-template-columns: 1fr 1.2fr;
            gap: 9px;
          }

          .drawer-actions button {
            min-height: 50px;
            padding: 12px;
            border: 2px solid var(--brown);
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }

          .view-cart { background: var(--cream); }
          .checkout { background: var(--orange); color: #fff; }

          button:focus-visible {
            outline: 3px solid var(--yellow);
            outline-offset: 3px;
          }

          @media (max-width: 650px) {
            .cart-shell { grid-template-columns: 1fr; }
            .cart-dismiss { display: none; }
            .drawer { border-left: 0; }
            .drawer-header { min-height: 78px; padding: 18px 20px; }
            .items { padding: 0 20px; }
            .cart-item { grid-template-columns: 94px minmax(0, 1fr); gap: 13px; }
            .item-thumb { width: 94px; }
            .drawer-footer { padding: 18px 20px 20px; }
            .drawer-actions { grid-template-columns: 1fr; }
          }
        </style>

        <div class="cart-shell">
          <button class="cart-dismiss" type="button" data-cart-close aria-label="Close cart"></button>

          <aside class="drawer" aria-label="Shopping cart">
            <header class="drawer-header">
              <div>
                <h1>Your cart</h1>
                <p>${itemCount} ${itemCount === 1 ? "item" : "items"}</p>
              </div>

              <button class="close-button" type="button" data-cart-close aria-label="Close cart">×</button>
            </header>

            <div class="cart-content">
              ${items.length
                ? `<div class="items">${items.map((item) => this.renderItem(item)).join("")}</div>`
                : `
                  <div class="empty-state">
                    <strong>Your cart is empty.</strong>
                    <p>Choose a Queso cake, make it yours, then come back here.</p>
                  </div>
                `}
            </div>

            <footer class="drawer-footer">
              <div class="subtotal-row">
                <span>Estimated subtotal</span>
                <strong>${this.escape(cart?.subtotal || "HK$0.00")}</strong>
              </div>
              <p class="footer-note">Taxes, delivery and discounts are calculated during checkout.</p>
              <p class="cart-status" role="status" aria-live="polite">${this.escape(message)}</p>

              <div class="drawer-actions">
                <button class="view-cart" type="button" data-cart-page ${this.busy || !items.length ? "disabled" : ""}>View cart</button>
                <button class="checkout" type="button" data-cart-checkout ${this.busy || !items.length ? "disabled" : ""}>Secure checkout</button>
              </div>
            </footer>
          </aside>
        </div>
      `;
    }

    emit(name, detail = {}) {
      this.dispatchEvent(new CustomEvent(name, {
        bubbles: true,
        composed: true,
        detail
      }));
    }

    bindEvents() {
      this.shadowRoot.querySelectorAll("[data-cart-close]").forEach((button) => {
        button.addEventListener("click", () => this.emit("queso-cart-close"));
      });

      this.shadowRoot.querySelectorAll("[data-cart-remove]").forEach((button) => {
        button.addEventListener("click", () => {
          this.emit("queso-cart-remove", {
            lineItemId: String(button.dataset.cartRemove || "")
          });
        });
      });

      this.shadowRoot.querySelectorAll("[data-cart-quantity]").forEach((button) => {
        button.addEventListener("click", () => {
          this.emit("queso-cart-quantity-change", {
            lineItemId: String(button.dataset.cartQuantity || ""),
            quantity: Math.max(1, Number(button.dataset.cartNextQuantity || 1))
          });
        });
      });

      this.shadowRoot.querySelector("[data-cart-page]")?.addEventListener("click", () => {
        this.emit("queso-cart-page");
      });

      this.shadowRoot.querySelector("[data-cart-checkout]")?.addEventListener("click", () => {
        this.emit("queso-cart-checkout");
      });
    }
  }

  if (!customElements.get("queso-cart-drawer")) {
    customElements.define("queso-cart-drawer", QuesoCartDrawer);
  }
})();
