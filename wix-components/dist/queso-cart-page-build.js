(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const rootUrl = scriptUrl ? new URL("../../", scriptUrl).href : "";
  const loveloUrl = rootUrl ? new URL("Lovelo_Black.otf", rootUrl).href : "";
  const quicksandUrl = rootUrl
    ? new URL("Quicksand-VariableFont_wght.ttf", rootUrl).href
    : "";
  const inWixFrame = window.self !== window.top;
  const CHECKOUT_PENDING_MESSAGE = "__queso_checkout_pending__";

  const DEMO_CART = {
    itemCount: 2,
    subtotal: "HK$996.00",
    items: [
      {
        id: "canvas",
        name: "Canvas",
        quantity: 1,
        unitPrice: "HK$498.00",
        lineTotal: "HK$498.00",
        previewText: "Happy birthday, Mia!",
        options: [
          { name: "Flavour", value: "Chocolate" },
          { name: "Topping", value: "No Thanks" },
          { name: "Decor", value: "Letters" }
        ]
      },
      {
        id: "cake",
        name: "Birthday Suit",
        quantity: 1,
        unitPrice: "HK$498.00",
        lineTotal: "HK$498.00",
        options: [{ name: "Flavour", value: "Classic" }]
      }
    ]
  };

  function installFonts() {
    if (!loveloUrl || document.head.querySelector("[data-qcp-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.qcpFonts = "1";
    style.textContent = `
      @font-face {
        font-family: Lovelo;
        src: url('${loveloUrl}') format('opentype');
        font-weight: 900;
        font-display: swap;
      }

      @font-face {
        font-family: Quicksand;
        src: url('${quicksandUrl}') format('truetype');
        font-weight: 300 700;
        font-display: swap;
      }
    `;

    document.head.appendChild(style);
  }

  const money = (value) =>
    Number(String(value || "").replace(/[^0-9.-]+/g, "")) || 0;

  const formatMoney = (value) =>
    `HK$${Number(value || 0).toLocaleString("en-HK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  class QuesoCartPage extends HTMLElement {
    static get observedAttributes() {
      return ["cart-data", "cart-busy", "cart-message"];
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.checkoutPending = false;
    }

    connectedCallback() {
      installFonts();
      this.toggleAttribute("data-wix-frame", inWixFrame);
      this.render();
      this.bind();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (!this.isConnected || oldValue === newValue) return;

      if (name === "cart-data") {
        this.render();
        this.bind();
        return;
      }

      this.feedback();
    }

    value(name, fallback = "") {
      const value = this.getAttribute(name);
      return value === null || !value.trim() ? fallback : value.trim();
    }

    json(name, fallback) {
      try {
        const value = this.value(name);
        return value ? JSON.parse(value) : fallback;
      } catch (error) {
        console.error("Queso cart page JSON error", error);
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
      const cart = this.json("cart-data", null);
      return cart && typeof cart === "object" ? cart : DEMO_CART;
    }

    get busy() {
      return ["true", "1", "yes", "on"].includes(
        this.value("cart-busy", "false").toLowerCase()
      );
    }

    thumbnail(item) {
      const previewImage = String(item.previewImage || "");
      const previewText = String(item.previewText || "");
      const image = String(item.image || "");

      if (previewImage) {
        return `<div class="thumb"><img src="${this.escape(
          previewImage
        )}" alt="${this.escape(item.name)} customization"></div>`;
      }

      if (previewText) {
        return `<div class="thumb text"><span>${this.escape(
          previewText
        )}</span></div>`;
      }

      if (image) {
        return `<div class="thumb"><img src="${this.escape(
          image
        )}" alt="${this.escape(item.name)}"></div>`;
      }

      return `<div class="thumb blank">Q</div>`;
    }

    options(item) {
      const options = Array.isArray(item.options) ? item.options : [];
      if (!options.length) return "";

      return `<dl>${options
        .map(
          (option) =>
            `<div><dt>${this.escape(option.name)}</dt><dd>${this.escape(
              option.value
            )}</dd></div>`
        )
        .join("")}</dl>`;
    }

    cartItem(item) {
      const id = String(item.id || "");
      const quantity = Math.max(1, Number(item.quantity || 1));

      return `
        <article data-line-item="${this.escape(id)}">
          ${this.thumbnail(item)}
          <div class="copy">
            <header>
              <div>
                <h2>${this.escape(item.name || "Queso cake")}</h2>
                <p class="unit">${this.escape(item.unitPrice || "")}</p>
              </div>
              <button class="remove" data-remove="${this.escape(id)}" ${
                this.busy ? "disabled" : ""
              }>Remove</button>
            </header>
            ${this.options(item)}
            <footer>
              <div class="qty">
                <button data-qty="${this.escape(
                  id
                )}" data-next="${Math.max(1, quantity - 1)}" ${
                  this.busy || quantity <= 1 ? "disabled" : ""
                }>−</button>
                <span>${quantity}</span>
                <button data-qty="${this.escape(id)}" data-next="${
                  quantity + 1
                }" ${this.busy ? "disabled" : ""}>+</button>
              </div>
              <strong class="line">${this.escape(
                item.lineTotal || item.unitPrice || ""
              )}</strong>
            </footer>
          </div>
        </article>
      `;
    }

    checkoutButtonContent() {
      if (!this.checkoutPending) return "Secure checkout";

      return `
        <span class="checkout-loading">
          <span class="checkout-spinner" aria-hidden="true"></span>
          <span>Opening checkout…</span>
        </span>
      `;
    }

    render() {
      const cart = this.cart;
      const items = Array.isArray(cart.items) ? cart.items : [];
      const itemCount = Math.max(0, Number(cart.itemCount || 0));
      const rawMessage = this.value("cart-message", "");

      if (rawMessage === CHECKOUT_PENDING_MESSAGE) {
        this.checkoutPending = true;
      }

      const message =
        rawMessage === CHECKOUT_PENDING_MESSAGE ? "" : rawMessage;

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            --orange: #ed6011;
            --cream: #fdf3e6;
            --yellow: #f4c24a;
            --brown: #3d2416;
            --pink: #efa3b5;
            display: block;
            width: 100%;
            height: 100%;
            min-height: 0;
            overflow: hidden;
            background: var(--cream);
            color: var(--brown);
            font: 550 14px Quicksand, Arial, sans-serif;
          }

          :host([data-wix-frame]) {
            height: auto;
          }

          :host([data-wix-frame]) .page {
            position: fixed;
            inset: 0;
            overflow: auto;
          }

          * {
            box-sizing: border-box;
          }

          button {
            font: inherit;
            color: inherit;
            cursor: pointer;
          }

          button:disabled {
            opacity: 0.45;
            cursor: not-allowed;
          }

          .page {
            min-height: 100%;
            padding: clamp(34px, 5vw, 76px) clamp(18px, 5vw, 80px);
            background: var(--cream);
          }

          .top {
            display: flex;
            align-items: end;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 44px;
          }

          .eye {
            margin: 0 0 9px;
            color: #a84c09;
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.15em;
            text-transform: uppercase;
          }

          h1,
          h2,
          .sum h2 {
            font-family: Lovelo, Arial, sans-serif;
            text-transform: uppercase;
          }

          h1 {
            margin: 0;
            font-size: clamp(60px, 7vw, 108px);
            line-height: 0.88;
          }

          .meta {
            display: grid;
            gap: 11px;
            justify-items: end;
          }

          .count {
            margin: 0;
            font-weight: 800;
          }

          .continue {
            min-height: 44px;
            padding: 0 18px;
            border: 2px solid var(--brown);
            background: transparent;
            font-size: 11px;
            font-weight: 850;
            text-transform: uppercase;
          }

          .layout {
            display: grid;
            grid-template-columns: minmax(0, 1.55fr) minmax(300px, 0.72fr);
            gap: clamp(28px, 5vw, 72px);
            align-items: start;
          }

          .items {
            border-top: 2px solid var(--brown);
          }

          article {
            display: grid;
            grid-template-columns: 150px minmax(0, 1fr);
            gap: 23px;
            padding: 27px 0;
            border-bottom: 1px solid #3d24164d;
          }

          .thumb {
            position: relative;
            width: 150px;
            aspect-ratio: 1;
            display: grid;
            place-items: center;
            overflow: hidden;
            border: 2px solid var(--brown);
            background: #fff;
          }

          .thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .thumb.text {
            padding: 18px;
            text-align: center;
            background: var(--cream);
          }

          .thumb.text::before {
            content: "";
            position: absolute;
            inset: 11px;
            border: 1px dashed #3d24166b;
          }

          .thumb.text span {
            position: relative;
            z-index: 1;
            max-width: 88%;
            font: 900 16px/1.03 Lovelo, Arial, sans-serif;
            text-transform: uppercase;
            overflow-wrap: anywhere;
          }

          .thumb.blank {
            background: var(--orange);
            color: #fff;
            font: 900 60px Lovelo, Arial;
          }

          .copy {
            min-width: 0;
          }

          .copy header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            gap: 15px;
          }

          .copy h2 {
            margin: 0;
            font-size: clamp(22px, 2.2vw, 31px);
            line-height: 1;
          }

          .unit {
            margin: 7px 0 0;
            color: #df6a06;
            font-weight: 800;
          }

          .remove {
            padding: 3px 0;
            border: 0;
            border-bottom: 1px solid;
            background: transparent;
            font-size: 10px;
            font-weight: 850;
            text-transform: uppercase;
          }

          dl {
            display: grid;
            gap: 6px;
            margin: 17px 0 0;
            font-size: 12px;
          }

          dl div {
            display: grid;
            grid-template-columns: minmax(72px, auto) minmax(0, 1fr);
            gap: 9px;
          }

          dt {
            font-weight: 850;
          }

          dd {
            margin: 0;
            overflow-wrap: anywhere;
          }

          .copy footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 18px;
            margin-top: 21px;
          }

          .qty {
            display: grid;
            grid-template-columns: 38px 44px 38px;
            min-height: 40px;
            border: 1px solid var(--brown);
          }

          .qty button {
            border: 0;
            background: #fff;
            font-size: 19px;
          }

          .qty span {
            display: grid;
            place-items: center;
            border-inline: 1px solid #3d241640;
            font-weight: 850;
          }

          .line {
            font: 900 19px Lovelo, Arial;
          }

          .sum {
            position: sticky;
            top: 22px;
            padding: 27px;
            border: 2px solid var(--brown);
            background: var(--yellow);
          }

          .sum h2 {
            margin: 0 0 23px;
            font-size: 30px;
          }

          .row {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 18px;
            padding: 14px 0;
            border-top: 1px solid #3d241652;
          }

          .row strong {
            font: 900 22px Lovelo, Arial;
            text-align: right;
          }

          .note {
            margin: 4px 0 18px;
            font-size: 10px;
            line-height: 1.5;
          }

          .status {
            min-height: 18px;
            margin: 0 0 9px;
            color: #a52a23;
            font-size: 11px;
            font-weight: 800;
          }

          .checkout {
            width: 100%;
            min-height: 54px;
            padding: 12px;
            border: 2px solid var(--brown);
            background: var(--orange);
            color: #fff;
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            transition: transform 120ms ease, opacity 120ms ease;
          }

          .checkout:active:not(:disabled) {
            transform: translateY(2px);
          }

          .checkout.is-checkout-pending {
            opacity: 0.82;
            cursor: wait;
          }

          .checkout-loading {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 9px;
          }

          .checkout-spinner {
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255, 255, 255, 0.45);
            border-top-color: #fff;
            border-radius: 50%;
            animation: quesoCheckoutSpin 700ms linear infinite;
          }

          @keyframes quesoCheckoutSpin {
            to {
              transform: rotate(360deg);
            }
          }

          .empty {
            min-height: 430px;
            display: grid;
            place-items: center;
            align-content: center;
            gap: 13px;
            padding: 45px 20px;
            border-bottom: 2px solid var(--brown);
            text-align: center;
          }

          .empty strong {
            font: 900 32px Lovelo, Arial;
            text-transform: uppercase;
          }

          .empty p {
            max-width: 400px;
            margin: 0;
            line-height: 1.6;
          }

          @media (max-width: 900px) {
            .layout {
              grid-template-columns: 1fr;
            }

            .sum {
              position: static;
            }
          }

          @media (max-width: 620px) {
            .page {
              padding: 34px 18px 44px;
            }

            .top {
              align-items: start;
              flex-direction: column;
              gap: 17px;
              margin-bottom: 30px;
            }

            h1 {
              font-size: clamp(58px, 20vw, 78px);
            }

            .meta {
              width: 100%;
              justify-items: stretch;
            }

            .continue {
              width: 100%;
            }

            article {
              grid-template-columns: 90px minmax(0, 1fr);
              gap: 12px;
              padding: 21px 0;
            }

            .thumb {
              width: 90px;
            }

            .thumb.text {
              padding: 9px;
            }

            .thumb.text::before {
              inset: 7px;
            }

            .thumb.text span {
              font-size: 11px;
            }

            .copy h2 {
              font-size: 18px;
            }

            .remove {
              font-size: 9px;
            }

            dl {
              margin-top: 11px;
              gap: 4px;
              font-size: 10px;
            }

            dl div {
              grid-template-columns: 47px minmax(0, 1fr);
              gap: 6px;
            }

            .copy footer {
              align-items: start;
              flex-direction: column;
              gap: 9px;
              margin-top: 13px;
            }

            .qty {
              grid-template-columns: 32px 36px 32px;
              min-height: 35px;
            }

            .line {
              font-size: 14px;
            }

            .sum {
              padding: 22px 19px;
            }
          }
        </style>

        <main class="page">
          <header class="top">
            <div>
              <p class="eye">Almost yours</p>
              <h1>Your cart.</h1>
            </div>

            <div class="meta">
              <p class="count">${itemCount} ${
                itemCount === 1 ? "item" : "items"
              }</p>
              <button class="continue" data-continue>Continue shopping</button>
            </div>
          </header>

          <div class="layout">
            <section class="items">
              ${
                items.length
                  ? items.map((item) => this.cartItem(item)).join("")
                  : `
                    <div class="empty">
                      <strong>Your cart is empty.</strong>
                      <p>Choose a Queso cake, make it yours, then return here when you are ready.</p>
                      <button class="continue" data-continue>Shop the cakes</button>
                    </div>
                  `
              }
            </section>

            <aside class="sum">
              <h2>Order summary</h2>
              <div class="row">
                <span>Estimated subtotal</span>
                <strong data-subtotal>${this.escape(
                  cart.subtotal || "HK$0.00"
                )}</strong>
              </div>
              <div class="row">
                <span>Delivery</span>
                <strong>—</strong>
              </div>
              <p class="note">Delivery, taxes and discounts are confirmed during checkout.</p>
              <p class="status" aria-live="polite">${this.escape(
                message
              )}</p>
              <button
                class="checkout${
                  this.checkoutPending ? " is-checkout-pending" : ""
                }"
                data-checkout
                ${
                  this.busy || !items.length || this.checkoutPending
                    ? "disabled"
                    : ""
                }
                ${this.checkoutPending ? 'aria-busy="true"' : ""}
              >${this.checkoutButtonContent()}</button>
            </aside>
          </div>
        </main>
      `;
    }

    feedback() {
      const rawMessage = this.value("cart-message", "");
      const pendingMessage = rawMessage === CHECKOUT_PENDING_MESSAGE;

      if (pendingMessage) {
        this.checkoutPending = true;
      } else if (rawMessage) {
        this.checkoutPending = false;
      }

      const status = this.shadowRoot?.querySelector(".status");
      if (status) {
        status.textContent = pendingMessage ? "" : rawMessage;
      }

      this.updateCheckoutButton();
    }

    updateCheckoutButton() {
      const button = this.shadowRoot?.querySelector("[data-checkout]");
      if (!button) return;

      if (this.checkoutPending) {
        button.disabled = true;
        button.classList.add("is-checkout-pending");
        button.innerHTML = this.checkoutButtonContent();
        button.setAttribute("aria-busy", "true");
        return;
      }

      button.classList.remove("is-checkout-pending");
      button.textContent = "Secure checkout";
      button.removeAttribute("aria-busy");
      button.disabled =
        this.busy || !this.shadowRoot.querySelector("[data-line-item]");
    }

    startCheckoutFeedback() {
      if (this.checkoutPending) return false;

      this.checkoutPending = true;

      const status = this.shadowRoot?.querySelector(".status");
      if (status) status.textContent = "";

      this.updateCheckoutButton();
      return true;
    }

    emit(name, detail = {}) {
      this.dispatchEvent(
        new CustomEvent(name, {
          bubbles: true,
          composed: true,
          detail
        })
      );
    }

    updateQuantity(button) {
      const article = button.closest("[data-line-item]");
      const controls = button.closest(".qty");
      const amount = controls?.querySelector("span");
      if (!article || !controls || !amount) return;

      const oldQuantity = Math.max(1, Number(amount.textContent || 1));
      const quantity = Math.max(
        1,
        Number(button.dataset.next || oldQuantity)
      );
      if (quantity === oldQuantity) return;

      const unitPrice = money(article.querySelector(".unit")?.textContent);
      const difference = quantity - oldQuantity;
      amount.textContent = quantity;

      const quantityButtons = controls.querySelectorAll("[data-qty]");
      if (quantityButtons[0]) {
        quantityButtons[0].dataset.next = Math.max(1, quantity - 1);
        quantityButtons[0].disabled = quantity <= 1;
      }

      if (quantityButtons[1]) {
        quantityButtons[1].dataset.next = quantity + 1;
      }

      const lineTotal = article.querySelector(".line");
      if (lineTotal && unitPrice) {
        lineTotal.textContent = formatMoney(unitPrice * quantity);
      }

      const count = this.shadowRoot.querySelector(".count");
      if (count) {
        const nextCount = Math.max(0, parseInt(count.textContent) || 0) + difference;
        count.textContent = `${nextCount} ${nextCount === 1 ? "item" : "items"}`;
      }

      const subtotal = this.shadowRoot.querySelector("[data-subtotal]");
      if (subtotal && unitPrice) {
        subtotal.textContent = formatMoney(
          Math.max(0, money(subtotal.textContent) + unitPrice * difference)
        );
      }
    }

    removeItem(button) {
      const article = button.closest("[data-line-item]");
      if (!article) return;

      const quantity = Math.max(
        1,
        Number(article.querySelector(".qty span")?.textContent || 1)
      );
      const amount =
        money(article.querySelector(".line")?.textContent) ||
        money(article.querySelector(".unit")?.textContent) * quantity;

      article.remove();

      const remainingItems = this.shadowRoot.querySelectorAll("[data-line-item]");
      const count = this.shadowRoot.querySelector(".count");
      if (count) {
        const nextCount = Math.max(
          0,
          (parseInt(count.textContent) || 0) - quantity
        );
        count.textContent = `${nextCount} ${nextCount === 1 ? "item" : "items"}`;
      }

      const subtotal = this.shadowRoot.querySelector("[data-subtotal]");
      if (subtotal) {
        subtotal.textContent = formatMoney(
          Math.max(0, money(subtotal.textContent) - amount)
        );
      }

      if (!remainingItems.length) {
        this.shadowRoot.querySelector(".items").innerHTML = `
          <div class="empty">
            <strong>Your cart is empty.</strong>
            <p>Choose a Queso cake, make it yours, then return here when you are ready.</p>
            <button class="continue" data-continue>Shop the cakes</button>
          </div>
        `;

        this.shadowRoot
          .querySelector("[data-continue]")
          ?.addEventListener("click", () =>
            this.emit("queso-cart-page-continue")
          );

        const checkout = this.shadowRoot.querySelector("[data-checkout]");
        if (checkout) checkout.disabled = true;
      }
    }

    bind() {
      this.shadowRoot.querySelectorAll("[data-continue]").forEach((button) => {
        button.addEventListener("click", () =>
          this.emit("queso-cart-page-continue")
        );
      });

      this.shadowRoot.querySelectorAll("[data-remove]").forEach((button) => {
        button.addEventListener("click", () => {
          const lineItemId = String(button.dataset.remove || "");
          this.removeItem(button);
          this.emit("queso-cart-page-remove", { lineItemId });
        });
      });

      this.shadowRoot.querySelectorAll("[data-qty]").forEach((button) => {
        button.addEventListener("click", () => {
          const lineItemId = String(button.dataset.qty || "");
          const quantity = Math.max(1, Number(button.dataset.next || 1));
          this.updateQuantity(button);
          this.emit("queso-cart-page-quantity-change", {
            lineItemId,
            quantity
          });
        });
      });

      this.shadowRoot
        .querySelector("[data-checkout]")
        ?.addEventListener("click", () => {
          if (!this.startCheckoutFeedback()) return;
          this.emit("queso-cart-page-checkout");
        });
    }
  }

  if (!customElements.get("queso-cart-page")) {
    customElements.define("queso-cart-page", QuesoCartPage);
  }
})();
