(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

  function installFonts() {
    if (document.head.querySelector("style[data-queso-connect-form-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoConnectFormFonts = "true";
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

  class QuesoConnectForm extends HTMLElement {
    static get observedAttributes() {
      return [
        "eyebrow",
        "title",
        "submit-label",
        "form-state",
        "form-message",
        "form-bridge"
      ];
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.handleSubmit = this.handleSubmit.bind(this);
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

    disconnectedCallback() {
      this.shadowRoot.querySelector("form")?.removeEventListener("submit", this.handleSubmit);
    }

    value(name, fallback = "") {
      const value = this.getAttribute(name);
      return value === null || value.trim() === "" ? fallback : value.trim();
    }

    escape(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    bindEvents() {
      const form = this.shadowRoot.querySelector("form");
      form?.removeEventListener("submit", this.handleSubmit);
      form?.addEventListener("submit", this.handleSubmit);
    }

    handleSubmit(event) {
      event.preventDefault();

      const form = event.currentTarget;
      if (!form.reportValidity()) return;

      const data = Object.fromEntries(new FormData(form).entries());
      const firstName = String(data.firstName || "");
      const lastName = String(data.lastName || "");

      this.dispatchEvent(new CustomEvent("queso-contact-submit", {
        bubbles: true,
        composed: true,
        detail: {
          firstName,
          lastName,
          name: `${firstName} ${lastName}`.trim(),
          email: String(data.email || ""),
          inquiryType: String(data.inquiryType || ""),
          message: String(data.message || "")
        }
      }));
    }

    render() {
      const eyebrow = this.value("eyebrow", "Choose the right route");
      const title = this.value("title", "How can we help?");
      const submitLabel = this.value("submit-label", "Send message");
      const formState = this.value("form-state", "idle").toLowerCase();
      const formMessage = this.value("form-message", "");
      const isSending = formState === "sending";
      const statusClass = ["success", "error"].includes(formState)
        ? ` status--${formState}`
        : "";

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            --orange: #ed6011;
            --cream: #fdf3e6;
            --yellow: #f4c24a;
            --brown: #3d2416;
            --pad: clamp(20px, 5vw, 76px);
            display: block;
            width: 100%;
            height: 100%;
            min-height: 0;
            overflow: hidden;
            background: var(--cream);
            color: var(--brown);
            font-family: "Quicksand", Arial, sans-serif;
            font-weight: 550;
            font-synthesis: none;
            text-rendering: geometricPrecision;
          }

          :host([data-wix-frame]) { height: auto; }
          *, *::before, *::after { box-sizing: border-box; }
          a { color: inherit; }
          input, select, textarea, button { color: inherit; font: inherit; }

          .section {
            width: 100%;
            height: 100%;
            min-height: 0;
            padding: clamp(76px, 9vw, 130px) var(--pad);
            overflow: hidden;
            background: var(--cream);
          }

          :host([data-wix-frame]) .section {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
          }

          .contact-layout {
            display: grid;
            grid-template-columns: 0.85fr 1.15fr;
            gap: 45px;
            align-items: start;
          }

          .eyebrow {
            margin: 0 0 17px;
            color: #a84c09;
            font-size: 12px;
            font-weight: 850;
            letter-spacing: 0.13em;
            text-transform: uppercase;
          }

          h2,
          h3 {
            margin: 0;
            font-family: "Lovelo", Arial, sans-serif;
            font-weight: 900;
            text-transform: uppercase;
          }

          h2 {
            font-size: clamp(48px, 6vw, 88px);
            line-height: 1;
          }

          .contact-options {
            margin-top: 36px;
            display: grid;
            gap: 11px;
          }

          .contact-card {
            padding: 24px;
            border: 2px solid var(--brown);
            background: #fff;
          }

          .contact-card:nth-child(2) { background: var(--yellow); }

          .contact-card h3 {
            font-size: 23px;
            line-height: 1;
          }

          .contact-card p {
            margin: 8px 0 0;
            font-size: 13px;
            line-height: 1.55;
          }

          .contact-form {
            padding: 30px;
            border: 2px solid var(--brown);
            background: #fff;
          }

          form {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .field {
            min-width: 0;
            display: block;
            font-size: 10px;
            font-weight: 850;
            text-transform: uppercase;
          }

          .field.full { grid-column: 1 / -1; }

          .field input,
          .field select,
          .field textarea {
            width: 100%;
            margin-top: 6px;
            padding: 12px;
            border: 2px solid var(--brown);
            border-radius: 7px;
            background: #fff;
            outline: 0;
          }

          .field input,
          .field select { min-height: 48px; }

          .field textarea {
            min-height: 130px;
            resize: vertical;
          }

          .field input:focus,
          .field select:focus,
          .field textarea:focus {
            box-shadow: 4px 4px 0 var(--yellow);
          }

          .button {
            grid-column: 1 / -1;
            width: 100%;
            min-height: 50px;
            padding: 0 22px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 2px solid var(--brown);
            border-radius: 10px;
            background: var(--orange);
            color: #fff;
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            cursor: pointer;
            transition: transform 150ms ease;
          }

          .button:hover:not(:disabled),
          .button:focus-visible:not(:disabled) { transform: translateY(-2px); }

          .button:disabled {
            cursor: wait;
            opacity: 0.65;
          }

          .button:focus-visible {
            outline: 3px solid var(--yellow);
            outline-offset: 3px;
          }

          .status {
            grid-column: 1 / -1;
            min-height: 18px;
            margin: 0;
            font-size: 11px;
            font-weight: 750;
            line-height: 1.5;
          }

          .status--success { color: #26723b; }
          .status--error { color: #a52a23; }

          @media (max-width: 900px) {
            .contact-layout { grid-template-columns: 1fr; }
          }

          @media (max-width: 680px) {
            .section { padding: 70px 20px; }
            h2 { font-size: 49px; line-height: 1.02; }
            .contact-form { padding: 22px; }
            form { grid-template-columns: 1fr; }
            .field.full,
            .button,
            .status { grid-column: 1; }
          }
        </style>

        <section class="section" id="contact" aria-labelledby="queso-connect-form-title">
          <div class="contact-layout">
            <div>
              <p class="eyebrow">${this.escape(eyebrow)}</p>
              <h2 id="queso-connect-form-title">${this.escape(title)}</h2>

              <div class="contact-options">
                <article class="contact-card">
                  <h3>Order support</h3>
                  <p>Include your order number, delivery or pickup date and the best way to reach you.</p>
                </article>

                <article class="contact-card">
                  <h3>Ingredients &amp; allergies</h3>
                  <p>Tell Queso the exact product and flavor before placing an order if you have an allergy or dietary restriction.</p>
                </article>

                <article class="contact-card">
                  <h3>General questions</h3>
                  <p>Email <a href="mailto:hello@quesocakes.com"><strong>hello@quesocakes.com</strong></a> or message <a href="https://www.instagram.com/quesohk/" target="_blank" rel="noopener"><strong>@quesohk</strong></a>.</p>
                </article>
              </div>
            </div>

            <div class="contact-form">
              <form novalidate>
                <label class="field">
                  First name
                  <input name="firstName" required autocomplete="given-name">
                </label>

                <label class="field">
                  Last name
                  <input name="lastName" required autocomplete="family-name">
                </label>

                <label class="field full">
                  Email
                  <input name="email" required type="email" autocomplete="email">
                </label>

                <label class="field full">
                  I'm getting in touch about
                  <select name="inquiryType" required>
                    <option value="">Choose one</option>
                    <option>Existing order</option>
                    <option>Delivery or pickup</option>
                    <option>Ingredients or allergies</option>
                    <option>Cheesecake care</option>
                    <option>General question</option>
                  </select>
                </label>

                <label class="field full">
                  Message
                  <textarea name="message" required placeholder="Include an order number if you have one."></textarea>
                </label>

                <button class="button" type="submit" ${isSending ? "disabled" : ""}>
                  ${this.escape(isSending ? "Sending…" : submitLabel)}
                </button>

                <p class="status${statusClass}" role="status" aria-live="polite">${this.escape(formMessage)}</p>
              </form>
            </div>
          </div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-connect-form")) {
    customElements.define("queso-connect-form", QuesoConnectForm);
  }
})();
