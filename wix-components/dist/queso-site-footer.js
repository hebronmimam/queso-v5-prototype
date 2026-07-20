(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const LIGHT_LOGO = new URL("logo/Quesco Logo - Light.svg", REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

  const NAV_GROUPS = [
    {
      title: "Shop",
      links: [
        ["Cake types", "/cakes"],
        ["Shop by flavor", "/flavors"],
        ["Monthly drop", "/cakes/flavor-drop"]
      ]
    },
    {
      title: "About",
      links: [
        ["Our story", "/about"],
        ["Popups", "/#popups"],
        ["Connect", "/connect"]
      ]
    },
    {
      title: "Help",
      links: [
        ["Contact us", "/connect"],
        ["Privacy policy", "/privacy-policy"],
        ["Terms", "/terms-conditions"]
      ]
    },
    {
      title: "Follow",
      links: [
        ["Instagram @quesohk ↗", "https://www.instagram.com/quesohk/"],
        ["hello@quesocakes.com", "mailto:hello@quesocakes.com"]
      ]
    }
  ];

  function installFonts() {
    if (document.head.querySelector("style[data-queso-footer-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoFooterFonts = "true";
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

  class QuesoSiteFooter extends HTMLElement {
    static get observedAttributes() {
      return [
        "marquee",
        "pitch-eyebrow",
        "pitch-title",
        "pitch-button-label",
        "pitch-button-url",
        "signup-eyebrow",
        "signup-title",
        "signup-copy",
        "signup-placeholder",
        "signup-button-label",
        "brand-copy",
        "copyright",
        "location-copy",
        "newsletter-bridge",
        "newsletter-state",
        "newsletter-message"
      ];
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.newsletterEmail = "";
    }

    connectedCallback() {
      installFonts();
      this.toggleAttribute("data-wix-frame", IS_WIX_FRAME);
      this.render();
      this.bindEvents();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (!this.isConnected || oldValue === newValue) return;

      if (name === "newsletter-state" && newValue === "success") {
        this.newsletterEmail = "";
      }

      this.render();
      this.bindEvents();
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

    renderNavGroups() {
      return NAV_GROUPS.map((group) => `
        <nav class="footer-col" aria-label="${this.escape(group.title)}">
          <strong>${this.escape(group.title)}</strong>
          ${group.links.map(([label, url]) => {
            const external = url.startsWith("http");
            return `<a href="${this.escape(url)}"${external ? ' target="_blank" rel="noopener"' : ""}>${this.escape(label)}</a>`;
          }).join("")}
        </nav>
      `).join("");
    }

    render() {
      const marquee = this.value(
        "marquee",
        "FRESHLY BAKED ✦ HONG KONG ✦ ONLINE ONLY ✦ POPUPS ✦ FREE TST MTR PICKUP ✦"
      );
      const newsletterState = this.value("newsletter-state", "idle").toLowerCase();
      const newsletterDisabled = newsletterState === "submitting";
      const newsletterMessage = this.value(
        "newsletter-message",
        newsletterState === "success"
          ? "You're on the list. Check your inbox soon."
          : newsletterState === "error"
            ? "Something went wrong. Please try again."
            : newsletterDisabled
              ? "Adding you to the list..."
              : ""
      );

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            --orange: #ed6011;
            --cream: #fdf3e6;
            --yellow: #f4c24a;
            --brown: #3d2416;
            --pink: #efa3b5;
            --pad: clamp(20px, 5vw, 76px);
            display: block;
            width: 100%;
            height: 100%;
            min-height: 0;
            overflow: hidden;
            background: var(--brown);
            color: var(--cream);
            font-family: "Quicksand", Arial, sans-serif;
            font-weight: 550;
            font-synthesis: none;
            text-rendering: geometricPrecision;
          }

          :host([data-wix-frame]) {
            height: auto;
          }

          *, *::before, *::after {
            box-sizing: border-box;
          }

          a {
            color: inherit;
            text-decoration: none;
          }

          img {
            display: block;
            max-width: 100%;
          }

          button,
          input {
            font: inherit;
          }

          .footer {
            width: 100%;
            height: 100%;
            min-height: 0;
            overflow-x: hidden;
            overflow-y: auto;
            background: var(--brown);
            border-top: 2px solid var(--brown);
          }

          :host([data-wix-frame]) .footer {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
          }

          .marquee {
            overflow: hidden;
            white-space: nowrap;
            background: var(--yellow);
            color: var(--brown);
            border-bottom: 2px solid var(--brown);
          }

          .marquee-track {
            display: flex;
            width: max-content;
            animation: footer-marquee 28s linear infinite;
            will-change: transform;
          }

          .marquee-row {
            padding: 11px 0;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 12px;
            font-weight: 900;
            line-height: 1;
            letter-spacing: 0.06em;
            word-spacing: 0.4em;
          }

          @keyframes footer-marquee {
            to {
              transform: translateX(-50%);
            }
          }

          .footer-play {
            min-height: 290px;
            padding: 52px var(--pad);
            display: grid;
            grid-template-columns: minmax(0, 1fr) 150px auto;
            align-items: center;
            gap: 35px;
            background: var(--orange);
            border-bottom: 2px solid var(--brown);
          }

          .eyebrow {
            margin: 0 0 17px;
            color: #a84c09;
            font-size: 12px;
            font-weight: 850;
            letter-spacing: 0.13em;
            text-transform: uppercase;
          }

          .eyebrow--light {
            color: var(--yellow);
          }

          .footer-pitch h2 {
            margin: 8px 0 0;
            color: var(--cream);
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(55px, 7vw, 105px);
            font-weight: 900;
            line-height: 0.91;
            letter-spacing: 0;
            text-transform: uppercase;
          }

          .footer-doodle {
            width: 132px;
            height: 132px;
            display: grid;
            place-items: center;
            align-content: center;
            border: 2px solid var(--brown);
            border-radius: 52% 48% 46% 54%;
            background: var(--pink);
            color: var(--brown);
            transform: rotate(7deg);
          }

          .footer-doodle span {
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 60px;
            font-weight: 900;
            line-height: 0.8;
          }

          .footer-doodle small {
            margin-top: 7px;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 8px;
            font-weight: 900;
            line-height: 1.15;
            text-align: center;
          }

          .button {
            min-height: 50px;
            padding: 0 22px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 2px solid var(--brown);
            border-radius: 10px;
            background: #fff;
            color: var(--brown);
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            transition: transform 150ms ease;
          }

          .button:hover,
          .button:focus-visible {
            transform: translateY(-2px);
          }

          .button:focus-visible,
          input:focus-visible,
          a:focus-visible {
            outline: 3px solid var(--yellow);
            outline-offset: 3px;
          }

          .button--yellow {
            justify-self: end;
            white-space: nowrap;
            background: var(--yellow);
            transform: rotate(-2deg);
          }

          .footer-signup {
            padding: 52px var(--pad);
            display: grid;
            grid-template-columns: 1fr minmax(390px, 0.75fr);
            gap: 45px;
            align-items: end;
            background: var(--yellow);
            color: var(--brown);
            border-bottom: 2px solid var(--brown);
          }

          .footer-signup h2 {
            margin: 0;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(34px, 4vw, 62px);
            font-weight: 900;
            line-height: 1;
            text-transform: uppercase;
          }

          .footer-signup p:not(.eyebrow) {
            max-width: 600px;
            margin: 12px 0 0;
            font-size: 13px;
            line-height: 1.55;
          }

          .footer-form {
            display: flex;
            align-items: stretch;
          }

          .footer-form label {
            position: absolute;
            left: -9999px;
          }

          .footer-form input {
            min-width: 0;
            flex: 1;
            height: 54px;
            padding: 0 16px;
            border: 2px solid var(--brown);
            border-right: 0;
            border-radius: 0;
            background: #fff;
            color: var(--brown);
          }

          .footer-form .button {
            height: 54px;
            border-radius: 0;
            background: var(--orange);
            color: #fff;
          }

          .footer-form .button:disabled {
            opacity: 0.65;
            cursor: wait;
            transform: none;
          }

          .form-status {
            min-height: 20px;
            margin-top: 8px;
            font-size: 11px;
            font-weight: 750;
          }

          .footer-top {
            padding: 58px var(--pad) 38px;
            display: grid;
            grid-template-columns: 1.4fr 0.8fr 0.8fr 0.9fr 0.9fr;
            gap: 55px;
          }

          .footer-logo {
            width: 190px;
            height: auto;
          }

          .footer-brand p {
            max-width: 300px;
            margin: 20px 0 0;
            color: rgba(253, 243, 230, 0.78);
            font-size: 13px;
            line-height: 1.55;
          }

          .footer-col {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .footer-col strong {
            margin-bottom: 4px;
            color: var(--pink);
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }

          .footer-col a {
            font-size: 13px;
            line-height: 1.45;
          }

          .footer-col a:hover {
            color: var(--yellow);
          }

          .footer-bottom {
            margin: 0 var(--pad);
            padding: 22px 0 28px;
            display: flex;
            justify-content: space-between;
            gap: 20px;
            border-top: 1px solid rgba(253, 243, 230, 0.35);
            color: rgba(253, 243, 230, 0.75);
            font-size: 11px;
          }

          @media (max-width: 980px) {
            .footer-play {
              grid-template-columns: 1fr auto;
            }

            .footer-doodle {
              display: none;
            }

            .footer-signup {
              grid-template-columns: 1fr;
            }

            .footer-top {
              grid-template-columns: 1fr 1fr;
            }

            .footer-brand {
              grid-column: 1 / -1;
            }
          }

          @media (max-width: 680px) {
            .marquee-row {
              font-size: 10px;
            }

            .footer-play {
              min-height: 0;
              padding: 46px 20px;
              display: block;
            }

            .footer-pitch h2 {
              font-size: 52px;
            }

            .button--yellow {
              margin-top: 28px;
              transform: rotate(-1deg);
            }

            .footer-signup {
              padding: 44px 20px;
            }

            .footer-signup h2 {
              font-size: clamp(36px, 10vw, 48px);
            }

            .footer-form {
              display: grid;
              grid-template-columns: 1fr;
              margin-top: 24px;
            }

            .footer-form input {
              width: 100%;
              border-right: 2px solid var(--brown);
              border-bottom: 0;
            }

            .footer-form .button {
              width: 100%;
            }

            .footer-top {
              padding: 44px 20px 30px;
              grid-template-columns: 1fr 1fr;
              gap: 34px 25px;
            }

            .footer-bottom {
              margin: 0 20px;
              flex-direction: column;
            }
          }

          @media (max-width: 390px) {
            .footer-top {
              grid-template-columns: 1fr;
            }

            .footer-brand {
              grid-column: auto;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .marquee-track {
              animation: none;
            }

            .button {
              transition: none;
            }
          }
        </style>

        <footer class="footer">
          <div class="marquee" aria-hidden="true">
            <div class="marquee-track">
              <div class="marquee-row">${this.escape(marquee)} ${this.escape(marquee)} ${this.escape(marquee)}</div>
              <div class="marquee-row">${this.escape(marquee)} ${this.escape(marquee)} ${this.escape(marquee)}</div>
            </div>
          </div>

          <div class="footer-play">
            <div class="footer-pitch">
              <p class="eyebrow eyebrow--light">${this.escape(this.value("pitch-eyebrow", "One more slice?"))}</p>
              <h2>${this.escape(this.value("pitch-title", "GOOD CAKE.\nGOOD MOOD.")).replaceAll("\n", "<br>")}</h2>
            </div>
            <div class="footer-doodle" aria-hidden="true">
              <span>Q</span>
              <small>BAKED<br>FRESH</small>
            </div>
            <a class="button button--yellow" href="${this.escape(this.value("pitch-button-url", "/cakes"))}">${this.escape(this.value("pitch-button-label", "Shop the cakes"))}</a>
          </div>

          <section class="footer-signup" aria-labelledby="queso-footer-signup-title">
            <div>
              <p class="eyebrow">${this.escape(this.value("signup-eyebrow", "Fresh drops first"))}</p>
              <h2 id="queso-footer-signup-title">${this.escape(this.value("signup-title", "Get HKD 30 off your first order."))}</h2>
              <p>${this.escape(this.value("signup-copy", "Flavor drop alerts, pop-up dates, fun news and zero spam. Promise."))}</p>
            </div>
            <div>
              <form class="footer-form" novalidate aria-busy="${newsletterDisabled ? "true" : "false"}">
                <label for="queso-footer-email">Email address</label>
                <input id="queso-footer-email" required type="email" autocomplete="email" value="${this.escape(this.newsletterEmail)}" placeholder="${this.escape(this.value("signup-placeholder", "you@example.com"))}">
                <button class="button" type="submit"${newsletterDisabled ? " disabled" : ""}>${this.escape(newsletterDisabled ? "Signing you up..." : this.value("signup-button-label", "Sign me up"))}</button>
              </form>
              <div class="form-status" role="status" aria-live="polite">${this.escape(newsletterMessage)}</div>
            </div>
          </section>

          <div class="footer-top">
            <div class="footer-brand">
              <img class="footer-logo" src="${LIGHT_LOGO}" alt="Queso Bakehouse">
              <p>${this.escape(this.value("brand-copy", "Handcrafted cheesecake, made fresh in a licensed Hong Kong kitchen."))}</p>
            </div>
            ${this.renderNavGroups()}
          </div>

          <div class="footer-bottom">
            <span>${this.escape(this.value("copyright", "© 2026 Queso Bakehouse."))}</span>
            <span>${this.escape(this.value("location-copy", "Hong Kong • Online only • Popups"))}</span>
          </div>
        </footer>
      `;
    }

    bindEvents() {
      const form = this.shadowRoot.querySelector(".footer-form");
      const input = this.shadowRoot.querySelector("#queso-footer-email");
      const button = this.shadowRoot.querySelector(".footer-form .button");
      const status = this.shadowRoot.querySelector(".form-status");
      if (!form || !input || !button || !status) return;

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (form.dataset.submitting === "true") return;

        const email = input.value.trim();

        if (!email || !input.checkValidity()) {
          status.textContent = "Enter a valid email address.";
          input.focus();
          return;
        }

        this.newsletterEmail = email;
        const bridgeEnabled = ["true", "1", "on", "yes"].includes(
          (this.getAttribute("newsletter-bridge") || "").toLowerCase()
        );

        if (!bridgeEnabled) {
          status.textContent = "Form received. Connect this event to Wix before launch.";
          return;
        }

        form.dataset.submitting = "true";
        form.setAttribute("aria-busy", "true");
        button.disabled = true;
        button.textContent = "Signing you up...";
        status.textContent = "Adding you to the list...";

        this.dispatchEvent(new CustomEvent("queso-newsletter-submit", {
          bubbles: true,
          composed: true,
          detail: { email }
        }));
      });
    }
  }

  if (!customElements.get("queso-site-footer")) {
    customElements.define("queso-site-footer", QuesoSiteFooter);
  }
})();
