(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const baseUrl = scriptUrl
    ? new URL("queso-cart-page-dynamic-height-v2.js", scriptUrl)
    : null;

  const CHECKOUT_PENDING_MESSAGE = "__queso_checkout_pending__";

  function installCheckoutFeedback(CartPage) {
    const prototype = CartPage?.prototype;
    if (!prototype || prototype.__quesoCheckoutFeedbackPatchedV1) return;

    const originalFeedback = prototype.feedback;

    prototype.installQuesoCheckoutFeedbackStyles = function installQuesoCheckoutFeedbackStyles() {
      if (!this.shadowRoot) return;

      let style = this.shadowRoot.querySelector("style[data-queso-checkout-feedback]");
      if (style) return;

      style = document.createElement("style");
      style.dataset.quesoCheckoutFeedback = "true";
      style.textContent = `
        .checkout {
          transition: transform 120ms ease, opacity 120ms ease, background 120ms ease;
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
          to { transform: rotate(360deg); }
        }
      `;

      this.shadowRoot.appendChild(style);
    };

    prototype.updateQuesoCheckoutFeedback = function updateQuesoCheckoutFeedback() {
      if (!this.shadowRoot) return;

      const message = this.val("cart-message", "");
      const pending = message === CHECKOUT_PENDING_MESSAGE;
      const status = this.shadowRoot.querySelector(".status");
      const button = this.shadowRoot.querySelector("[data-checkout]");

      if (status) {
        status.textContent = pending ? "" : message;
      }

      if (!button) return;

      if (pending) {
        button.disabled = true;
        button.classList.add("is-checkout-pending");
        button.innerHTML = `
          <span class="checkout-loading">
            <span class="checkout-spinner" aria-hidden="true"></span>
            <span>Opening checkout…</span>
          </span>
        `;
        button.setAttribute("aria-busy", "true");
        return;
      }

      button.classList.remove("is-checkout-pending");
      button.textContent = "Secure checkout";
      button.removeAttribute("aria-busy");
      button.disabled = this.busy || !this.shadowRoot.querySelector("[data-line-item]");
    };

    prototype.feedback = function feedback() {
      this.installQuesoCheckoutFeedbackStyles();

      if (this.val("cart-message", "") === CHECKOUT_PENDING_MESSAGE) {
        this.updateQuesoCheckoutFeedback();
        return;
      }

      originalFeedback.call(this);
      this.updateQuesoCheckoutFeedback();
    };

    const originalRender = prototype.render;
    prototype.render = function render() {
      originalRender.call(this);
      this.installQuesoCheckoutFeedbackStyles();
      this.updateQuesoCheckoutFeedback();
    };

    prototype.__quesoCheckoutFeedbackPatchedV1 = true;

    document.querySelectorAll("queso-cart-page").forEach((element) => {
      element.installQuesoCheckoutFeedbackStyles();
      element.updateQuesoCheckoutFeedback();
    });
  }

  if (!baseUrl) {
    console.error("Queso cart page checkout feedback: unable to resolve base build URL.");
    return;
  }

  baseUrl.searchParams.set("feedback", "checkout-v1");
  baseUrl.searchParams.set("cache", String(Date.now()));

  const script = document.createElement("script");
  script.src = baseUrl.href;
  script.async = false;
  script.onload = async () => {
    await customElements.whenDefined("queso-cart-page");
    installCheckoutFeedback(customElements.get("queso-cart-page"));
  };
  script.onerror = () => {
    console.error("Queso cart page checkout feedback: base build failed to load.");
  };

  document.head.appendChild(script);
})();
