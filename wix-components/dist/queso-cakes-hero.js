(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const DEFAULT_IMAGE = new URL("assets/generated-campaign/06-occasion-party.png", REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

  function installFonts() {
    if (document.head.querySelector("style[data-queso-cakes-hero-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoCakesHeroFonts = "true";
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

  class QuesoCakesHero extends HTMLElement {
    static get observedAttributes() {
      return [
        "eyebrow",
        "title",
        "copy",
        "primary-label",
        "primary-url",
        "secondary-label",
        "secondary-url",
        "sticker",
        "image",
        "image-alt",
        "image-position"
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
      const eyebrow = this.value("eyebrow", "Cake types");
      const title = this.value("title", "Pick your format.");
      const copy = this.value(
        "copy",
        "Four clear ways to show up with cheesecake. Start here, or choose flavor first."
      );
      const primaryLabel = this.value("primary-label", "Shop cake types");
      const primaryUrl = this.value("primary-url", "#shop");
      const secondaryLabel = this.value("secondary-label", "Shop by flavor");
      const secondaryUrl = this.value("secondary-url", "/flavors");
      const sticker = this.value("sticker", "Easy choice. Good cake.");
      const image = this.value("image", DEFAULT_IMAGE);
      const imageAlt = this.value("image-alt", "Queso cheesecakes for a celebration");
      const imagePosition = this.value("image-position", "center");

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            --orange: #ed6011;
            --cream: #fdf3e6;
            --pink: #efa3b5;
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
          }

          :host([data-wix-frame]) { height: auto; }
          *, *::before, *::after { box-sizing: border-box; }
          a { color: inherit; text-decoration: none; }

          .page-hero {
            width: 100%;
            height: 100%;
            min-height: 0;
            display: grid;
            grid-template-columns: 0.9fr 1.1fr;
            overflow: hidden;
            background: var(--cream);
            border-bottom: 2px solid var(--brown);
          }

          :host([data-wix-frame]) .page-hero {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
          }

          .page-hero-copy {
            min-width: 0;
            padding: clamp(65px, 8vw, 115px) var(--pad);
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .eyebrow {
            margin: 0 0 17px;
            color: #a84c09;
            font-size: 12px;
            font-weight: 850;
            letter-spacing: 0.13em;
            text-transform: uppercase;
          }

          h1 {
            margin: 0;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(65px, 7.6vw, 115px);
            font-weight: 900;
            line-height: 1.02;
            text-transform: uppercase;
          }

          .lead {
            max-width: 590px;
            margin: 22px 0 0;
            font-size: 18px;
            line-height: 1.6;
          }

          .actions {
            margin-top: 24px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
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
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            transition: transform 150ms ease;
          }

          .button:hover,
          .button:focus-visible { transform: translateY(-2px); }
          .button:focus-visible { outline: 3px solid var(--pink); outline-offset: 3px; }
          .button--primary { background: var(--orange); color: #fff; }

          .page-hero-media {
            position: relative;
            min-width: 0;
            min-height: 0;
            overflow: hidden;
            border-left: 2px solid var(--brown);
          }

          .page-hero-media img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: ${this.escape(imagePosition)};
          }

          .sticker {
            position: absolute;
            right: 5%;
            bottom: 6%;
            padding: 12px 20px;
            border: 2px solid var(--brown);
            border-radius: 999px;
            background: var(--pink);
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            transform: rotate(3deg);
          }

          @media (max-width: 980px) {
            .page-hero { grid-template-columns: 1fr; grid-template-rows: 1fr 480px; }
            .page-hero-media { border-left: 0; border-top: 2px solid var(--brown); }
          }

          @media (max-width: 680px) {
            .page-hero { grid-template-rows: auto 410px; }
            .page-hero-copy { padding: 64px 20px; }
            h1 { font-size: 61px; }
            .lead { font-size: 16px; }
            .actions { flex-direction: column; }
            .button { width: 100%; }
          }

          @media (prefers-reduced-motion: reduce) {
            .button { transition: none; }
          }
        </style>

        <section class="page-hero" aria-labelledby="queso-cakes-title">
          <div class="page-hero-copy">
            <p class="eyebrow">${this.escape(eyebrow)}</p>
            <h1 id="queso-cakes-title">${this.escape(title)}</h1>
            <p class="lead">${this.escape(copy)}</p>
            <div class="actions">
              <a class="button button--primary" href="${this.escape(primaryUrl)}">${this.escape(primaryLabel)}</a>
              <a class="button" href="${this.escape(secondaryUrl)}">${this.escape(secondaryLabel)}</a>
            </div>
          </div>

          <div class="page-hero-media">
            <img
              src="${this.escape(image)}"
              alt="${this.escape(imageAlt)}"
              loading="eager"
              fetchpriority="high"
              decoding="async"
            >
            <span class="sticker">${this.escape(sticker)}</span>
          </div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-cakes-hero")) {
    customElements.define("queso-cakes-hero", QuesoCakesHero);
  }
})();
