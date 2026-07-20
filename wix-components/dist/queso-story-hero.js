(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const IMAGE_ONE = new URL(
    "site/assets/v4-originals/hero-canvas-wide.png",
    REPO_ROOT
  ).href;
  const IMAGE_TWO = new URL(
    "site/assets/current-site/lotus-biscoff-main.png",
    REPO_ROOT
  ).href;
  const IS_WIX_FRAME = window.self !== window.top;

  function installFonts() {
    if (document.head.querySelector("style[data-queso-story-hero-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoStoryHeroFonts = "true";
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

  class QuesoStoryHero extends HTMLElement {
    static get observedAttributes() {
      return [
        "eyebrow",
        "title",
        "copy",
        "note",
        "image-one",
        "image-one-alt",
        "image-one-position",
        "image-two",
        "image-two-alt",
        "image-two-position"
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
      const eyebrow = this.value("eyebrow", "Our story");
      const title = this.value("title", "Not your everyday cheesecake.");
      const copy = this.value(
        "copy",
        "Queso Bakehouse was built around a simple idea: cheesecake should feel less predictable, more personal and worth gathering around."
      );
      const note = this.value(
        "note",
        "Made fresh in Hong Kong • Online only • Popups"
      );
      const imageOne = this.value("image-one", IMAGE_ONE);
      const imageOneAlt = this.value(
        "image-one-alt",
        "Colorful Queso Bakehouse celebration cake"
      );
      const imageOnePosition = this.value("image-one-position", "center");
      const imageTwo = this.value("image-two", IMAGE_TWO);
      const imageTwoAlt = this.value(
        "image-two-alt",
        "Queso Bakehouse cheesecake close-up"
      );
      const imageTwoPosition = this.value("image-two-position", "center");

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            --orange: #ed6011;
            --cream: #fdf3e6;
            --yellow: #f4c24a;
            --brown: #3d2416;
            --pink: #efa3b5;
            --pad: clamp(24px, 5vw, 76px);
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

          .hero {
            width: 100%;
            height: 100%;
            min-height: 0;
            display: grid;
            grid-template-columns: minmax(0, 0.88fr) minmax(0, 1.12fr);
            overflow: hidden;
            background: var(--cream);
            border-block: 2px solid var(--brown);
          }

          :host([data-wix-frame]) .hero {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
          }

          .copy-panel {
            position: relative;
            min-width: 0;
            padding: var(--pad);
            display: flex;
            flex-direction: column;
            justify-content: center;
            overflow: hidden;
          }

          .eyebrow {
            margin: 0 0 20px;
            color: #a84c09;
            font-size: 12px;
            font-weight: 850;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }

          h1 {
            max-width: 780px;
            margin: 0;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(66px, 7.6vw, 124px);
            font-weight: 900;
            line-height: 0.9;
            letter-spacing: -0.015em;
            text-transform: uppercase;
          }

          .lead {
            max-width: 570px;
            margin: 28px 0 0;
            font-size: clamp(16px, 1.45vw, 20px);
            line-height: 1.58;
          }

          .note {
            max-width: 560px;
            margin: 38px 0 0;
            padding-top: 18px;
            border-top: 2px solid var(--brown);
            font-size: 10px;
            font-weight: 850;
            letter-spacing: 0.08em;
            line-height: 1.5;
            text-transform: uppercase;
          }

          .spark {
            position: absolute;
            right: 34px;
            bottom: 24px;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(82px, 8vw, 132px);
            line-height: 1;
            opacity: 0.12;
            transform: rotate(10deg);
          }

          .visual {
            min-width: 0;
            min-height: 0;
            display: grid;
            grid-template-columns: 1.08fr 0.92fr;
            grid-template-rows: 1fr 1fr;
            overflow: hidden;
            border-left: 2px solid var(--brown);
            background: var(--yellow);
          }

          .image {
            position: relative;
            min-width: 0;
            min-height: 0;
            overflow: hidden;
          }

          .image--one {
            grid-row: 1 / 3;
            border-right: 2px solid var(--brown);
          }

          .image--two {
            border-bottom: 2px solid var(--brown);
          }

          .image img {
            position: absolute;
            inset: 0;
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .image--one img { object-position: ${this.escape(imageOnePosition)}; }
          .image--two img { object-position: ${this.escape(imageTwoPosition)}; }

          .image::after {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            background: linear-gradient(180deg, rgba(61, 36, 22, 0.01), rgba(61, 36, 22, 0.15));
          }

          .statement {
            position: relative;
            padding: 26px;
            display: flex;
            align-items: flex-end;
            overflow: hidden;
            background: var(--orange);
            color: #fff;
          }

          .statement strong {
            position: relative;
            z-index: 2;
            max-width: 280px;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(28px, 3vw, 46px);
            line-height: 0.96;
            text-transform: uppercase;
          }

          .statement::after {
            content: "✦";
            position: absolute;
            right: 18px;
            top: 10px;
            color: var(--yellow);
            font-size: 86px;
            line-height: 1;
            opacity: 0.65;
          }

          .badge {
            position: absolute;
            z-index: 3;
            right: clamp(18px, 3vw, 42px);
            top: clamp(18px, 3vw, 42px);
            width: 118px;
            aspect-ratio: 1;
            padding: 16px;
            display: grid;
            place-items: center;
            border: 2px solid var(--brown);
            border-radius: 50%;
            background: var(--pink);
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 16px;
            font-weight: 900;
            line-height: 1.05;
            text-align: center;
            text-transform: uppercase;
            transform: rotate(7deg);
          }

          @media (max-width: 820px) {
            .hero {
              grid-template-columns: 1fr;
              grid-template-rows: minmax(0, 0.92fr) minmax(0, 1.08fr);
            }

            .copy-panel { padding: 48px 20px 42px; }
            .eyebrow { margin-bottom: 15px; font-size: 10px; }
            h1 { font-size: clamp(54px, 15.5vw, 78px); }
            .lead { margin-top: 20px; font-size: 15px; line-height: 1.52; }
            .note { margin-top: 25px; padding-top: 14px; font-size: 8px; }
            .spark { display: none; }

            .visual {
              border-left: 0;
              border-top: 2px solid var(--brown);
            }

            .badge { width: 94px; padding: 12px; font-size: 13px; }
          }

          @media (max-width: 520px) {
            .visual {
              grid-template-columns: 1fr 1fr;
              grid-template-rows: minmax(0, 1.2fr) minmax(0, 0.8fr);
            }

            .image--one {
              grid-column: 1 / 3;
              grid-row: 1;
              border-right: 0;
              border-bottom: 2px solid var(--brown);
            }

            .image--two {
              grid-column: 1;
              grid-row: 2;
              border-right: 2px solid var(--brown);
              border-bottom: 0;
            }

            .statement {
              grid-column: 2;
              grid-row: 2;
              padding: 18px;
            }

            .statement strong { font-size: 26px; }
          }
        </style>

        <section class="hero" aria-labelledby="queso-story-hero-title">
          <div class="copy-panel">
            <p class="eyebrow">${this.escape(eyebrow)}</p>
            <h1 id="queso-story-hero-title">${this.escape(title)}</h1>
            <p class="lead">${this.escape(copy)}</p>
            <p class="note">${this.escape(note)}</p>
            <span class="spark" aria-hidden="true">✦</span>
          </div>

          <div class="visual">
            <div class="image image--one">
              <img src="${this.escape(imageOne)}" alt="${this.escape(imageOneAlt)}" loading="eager" fetchpriority="high" decoding="async">
            </div>

            <div class="image image--two">
              <img src="${this.escape(imageTwo)}" alt="${this.escape(imageTwoAlt)}" loading="eager" decoding="async">
            </div>

            <div class="statement">
              <strong>Big personality. Small-batch cake.</strong>
            </div>

            <div class="badge" aria-hidden="true">Freshly<br>baked<br>here</div>
          </div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-story-hero")) {
    customElements.define("queso-story-hero", QuesoStoryHero);
  }
})();
