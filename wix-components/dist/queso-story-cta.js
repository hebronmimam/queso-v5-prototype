(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

  function installFonts() {
    if (document.head.querySelector("style[data-queso-story-cta-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoStoryCtaFonts = "true";
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

  class QuesoStoryCta extends HTMLElement {
    static get observedAttributes() {
      return [
        "eyebrow",
        "title",
        "copy",
        "primary-label",
        "primary-url",
        "secondary-label",
        "secondary-url"
      ];
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      installFonts();
      this.toggleAttribute("data-wix-frame", IS_WIX_FRAME);
      this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (!this.isConnected || oldValue === newValue) return;
      this.render();
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

    render() {
      const eyebrow = this.value("eyebrow", "Now you know the story");
      const title = this.value("title", "Time for the cake.");
      const copy = this.value(
        "copy",
        "Choose a flavor, pick the format and make the next celebration feel unmistakably Queso."
      );
      const primaryLabel = this.value("primary-label", "Shop cakes");
      const primaryUrl = this.value("primary-url", "/cakes");
      const secondaryLabel = this.value("secondary-label", "Explore flavors");
      const secondaryUrl = this.value("secondary-url", "/flavors");

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
            background: var(--orange);
            color: #fff;
            font-family: "Quicksand", Arial, sans-serif;
            font-weight: 550;
            font-synthesis: none;
          }

          :host([data-wix-frame]) { height: auto; }
          *, *::before, *::after { box-sizing: border-box; }
          a { color: inherit; text-decoration: none; }

          .cta {
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 0;
            padding: clamp(62px, 7vw, 108px) clamp(22px, 5vw, 76px);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background: var(--orange);
            border-bottom: 2px solid var(--brown);
          }

          :host([data-wix-frame]) .cta {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
          }

          .inner {
            position: relative;
            z-index: 2;
            width: min(1120px, 100%);
            text-align: center;
          }

          .eyebrow {
            margin: 0 0 18px;
            color: var(--yellow);
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }

          h2 {
            margin: 0 auto;
            max-width: 980px;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(64px, 9vw, 138px);
            font-weight: 900;
            line-height: 0.88;
            letter-spacing: -0.015em;
            text-transform: uppercase;
          }

          .copy {
            max-width: 650px;
            margin: 28px auto 0;
            font-size: clamp(16px, 1.4vw, 20px);
            line-height: 1.6;
          }

          .actions {
            margin-top: 34px;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 12px;
          }

          .button {
            min-height: 52px;
            padding: 0 24px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 2px solid var(--brown);
            border-radius: 10px;
            font-size: 10px;
            font-weight: 850;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            transition: transform 150ms ease;
          }

          .button:hover,
          .button:focus-visible {
            transform: translateY(-2px);
          }

          .button:focus-visible {
            outline: 3px solid var(--pink);
            outline-offset: 3px;
          }

          .button--primary {
            background: var(--yellow);
            color: var(--brown);
          }

          .button--secondary {
            background: var(--cream);
            color: var(--brown);
          }

          .shape {
            position: absolute;
            border: 2px solid var(--brown);
            pointer-events: none;
          }

          .shape--one {
            width: 180px;
            height: 180px;
            left: -44px;
            top: 26px;
            border-radius: 50%;
            background: var(--pink);
            transform: rotate(-8deg);
          }

          .shape--two {
            width: 150px;
            height: 150px;
            right: -30px;
            bottom: 28px;
            border-radius: 22px 8px 28px 10px;
            background: var(--yellow);
            transform: rotate(12deg);
          }

          .spark {
            position: absolute;
            right: 8%;
            top: 10%;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(76px, 9vw, 136px);
            line-height: 1;
            color: var(--cream);
            opacity: 0.18;
            transform: rotate(10deg);
          }

          @media (max-width: 760px) {
            .cta { padding: 58px 20px; }
            .eyebrow { font-size: 9px; }
            h2 { font-size: clamp(52px, 16vw, 78px); }
            .copy { margin-top: 20px; font-size: 15px; }
            .actions { align-items: stretch; flex-direction: column; }
            .button { width: 100%; }
            .shape--one { width: 112px; height: 112px; }
            .shape--two { width: 96px; height: 96px; }
            .spark { display: none; }
          }
        </style>

        <section class="cta" aria-labelledby="queso-story-cta-title">
          <span class="shape shape--one" aria-hidden="true"></span>
          <span class="shape shape--two" aria-hidden="true"></span>
          <span class="spark" aria-hidden="true">✦</span>

          <div class="inner">
            <p class="eyebrow">${this.escape(eyebrow)}</p>
            <h2 id="queso-story-cta-title">${this.escape(title)}</h2>
            <p class="copy">${this.escape(copy)}</p>

            <div class="actions">
              <a class="button button--primary" href="${this.escape(primaryUrl)}">${this.escape(primaryLabel)}</a>
              <a class="button button--secondary" href="${this.escape(secondaryUrl)}">${this.escape(secondaryLabel)}</a>
            </div>
          </div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-story-cta")) {
    customElements.define("queso-story-cta", QuesoStoryCta);
  }
})();
