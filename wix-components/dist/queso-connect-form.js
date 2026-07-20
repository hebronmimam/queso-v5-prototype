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
        "copy",
        "note",
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

      this.dispatchEvent(new CustomEvent("queso-contact-submit", {
        bubbles: true,
        composed: true,
        detail: {
          inquiryType: String(data.inquiryType || ""),
          name: String(data.name || ""),
          email: String(data.email || ""),
          phone: String(data.phone || ""),
          preferredDate: String(data.preferredDate || ""),
          message: String(data.message || "")
        }
      }));
    }

    render() {
      const eyebrow = this.value("eyebrow", "Send the details");
      const title = this.value("title", "Tell us what you need.");
      const copy = this.value(
        "copy",
        "Use the form for order questions, custom cake ideas, popup enquiries, partnerships and everything in between."
      );
      const note = this.value(
        "note",
        "For time-sensitive orders, include the preferred date and serving size in your message."
      );
      const submitLabel = this.value("submit-label", "Send enquiry");
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
            --pink: #efa3b5;
            --purple: #b99ad2;
            --pad: clamp(22px, 5vw, 76px);
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
          }

          :host([data-wix-frame]) { height: auto; }
          *, *::before, *::after { box-sizing: border-box; }
          input, select, textarea, button { color: inherit; font: inherit; }

          .contact {
            width: 100%;
            height: 100%;
            min-height: 0;
            display: grid;
            grid-template-columns: minmax(0, 0.78fr) minmax(0, 1.22fr);
            overflow: hidden;
            background: var(--cream);
            border-block: 2px solid var(--brown);
          }

          :host([data-wix-frame]) .contact {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
          }

          .intro {
            position: relative;
            min-width: 0;
            padding: var(--pad);
            display: flex;
            flex-direction: column;
            justify-content: center;
            overflow: hidden;
            background: var(--brown);
            color: var(--cream);
            border-right: 2px solid var(--brown);
          }

          .eyebrow {
            margin: 0 0 17px;
            color: var(--yellow);
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.13em;
            text-transform: uppercase;
          }

          h2 {
            max-width: 760px;
            margin: 0;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(58px, 6.9vw, 108px);
            font-weight: 900;
            line-height: 0.91;
            text-transform: uppercase;
          }

          .lead {
            max-width: 540px;
            margin: 27px 0 0;
            font-size: clamp(16px, 1.35vw, 19px);
            line-height: 1.6;
          }

          .note {
            max-width: 540px;
            margin: 36px 0 0;
            padding-top: 17px;
            border-top: 2px solid var(--cream);
            font-size: 10px;
            font-weight: 850;
            letter-spacing: 0.07em;
            line-height: 1.52;
            text-transform: uppercase;
          }

          .spark {
            position: absolute;
            right: 28px;
            bottom: 18px;
            color: var(--pink);
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(78px, 8vw, 126px);
            line-height: 1;
            opacity: 0.45;
            transform: rotate(10deg);
          }

          .form-panel {
            min-width: 0;
            padding: clamp(42px, 5vw, 76px);
            display: flex;
            align-items: center;
            background: var(--cream);
          }

          form {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }

          .field {
            min-width: 0;
            display: grid;
            gap: 8px;
          }

          .field--wide { grid-column: 1 / -1; }

          label {
            font-size: 10px;
            font-weight: 850;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          input,
          select,
          textarea {
            width: 100%;
            border: 2px solid var(--brown);
            border-radius: 11px 6px 13px 8px;
            background: #fff;
            outline: 0;
          }

          input,
          select {
            min-height: 54px;
            padding: 0 15px;
          }

          textarea {
            min-height: 170px;
            padding: 15px;
            resize: vertical;
          }

          input:focus,
          select:focus,
          textarea:focus {
            box-shadow: 5px 5px 0 var(--yellow);
          }

          .actions {
            grid-column: 1 / -1;
            margin-top: 4px;
            display: grid;
            gap: 13px;
          }

          button {
            min-height: 54px;
            padding: 0 24px;
            border: 2px solid var(--brown);
            border-radius: 10px;
            background: var(--orange);
            color: #fff;
            font-size: 10px;
            font-weight: 850;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            cursor: pointer;
            transition: transform 150ms ease;
          }

          button:hover:not(:disabled),
          button:focus-visible:not(:disabled) {
            transform: translateY(-2px);
          }

          button:disabled {
            cursor: wait;
            opacity: 0.65;
          }

          button:focus-visible {
            outline: 3px solid var(--pink);
            outline-offset: 3px;
          }

          .status {
            min-height: 20px;
            margin: 0;
            font-size: 11px;
            font-weight: 750;
            line-height: 1.5;
          }

          .status--success { color: #26723b; }
          .status--error { color: #a52a23; }

          .privacy {
            margin: 0;
            font-size: 9px;
            line-height: 1.5;
            opacity: 0.8;
          }

          @media (max-width: 900px) {
            .contact {
              grid-template-columns: 1fr;
              grid-template-rows: minmax(0, 0.78fr) minmax(0, 1.22fr);
            }

            .intro {
              border-right: 0;
              border-bottom: 2px solid var(--brown);
            }

            .form-panel { padding: 44px 20px; }
          }

          @media (max-width: 620px) {
            .intro { padding: 50px 20px 42px; }
            .eyebrow { font-size: 9px; }
            h2 { font-size: clamp(50px, 14vw, 72px); }
            .lead { margin-top: 20px; font-size: 15px; }
            .note { margin-top: 25px; font-size: 8px; }
            .spark { display: none; }
            form { grid-template-columns: 1fr; }
            .field--wide, .actions { grid-column: 1; }
            textarea { min-height: 150px; }
          }
        </style>

        <section class="contact" aria-labelledby="queso-connect-form-title">
          <div class="intro">
            <p class="eyebrow">${this.escape(eyebrow)}</p>
            <h2 id="queso-connect-form-title">${this.escape(title)}</h2>
            <p class="lead">${this.escape(copy)}</p>
            <p class="note">${this.escape(note)}</p>
            <span class="spark" aria-hidden="true">✦</span>
          </div>

          <div class="form-panel">
            <form novalidate>
              <div class="field field--wide">
                <label for="inquiryType">What is this about?</label>
                <select id="inquiryType" name="inquiryType" required>
                  <option value="">Choose one</option>
                  <option value="Order help">Order help</option>
                  <option value="Custom cake">Custom cake</option>
                  <option value="Events and partnerships">Events and partnerships</option>
                  <option value="Something else">Something else</option>
                </select>
              </div>

              <div class="field">
                <label for="name">Name</label>
                <input id="name" name="name" type="text" autocomplete="name" required>
              </div>

              <div class="field">
                <label for="email">Email</label>
                <input id="email" name="email" type="email" autocomplete="email" required>
              </div>

              <div class="field">
                <label for="phone">Phone / WhatsApp</label>
                <input id="phone" name="phone" type="tel" autocomplete="tel">
              </div>

              <div class="field">
                <label for="preferredDate">Preferred date</label>
                <input id="preferredDate" name="preferredDate" type="date">
              </div>

              <div class="field field--wide">
                <label for="message">Tell us more</label>
                <textarea id="message" name="message" required></textarea>
              </div>

              <div class="actions">
                <button type="submit" ${isSending ? "disabled" : ""}>${this.escape(isSending ? "Sending…" : submitLabel)}</button>
                <p class="status${statusClass}" role="status" aria-live="polite">${this.escape(formMessage)}</p>
                <p class="privacy">Your details are only used to respond to this enquiry.</p>
              </div>
            </form>
          </div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-connect-form")) {
    customElements.define("queso-connect-form", QuesoConnectForm);
  }
})();
