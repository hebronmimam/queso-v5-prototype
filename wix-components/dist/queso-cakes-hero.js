(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const DEFAULT_IMAGE = new URL(
    "site/assets/v4-originals/hero-canvas-wide.png",
    REPO_ROOT
  ).href;
  const IS_WIX_FRAME = window.self !== window.top;

  function installFonts() {
    if (document.head.querySelector("style[data-queso-cakes-hero-fonts]")) {
      return;
    }

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
        "note",
        "image",
        "image-alt"
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
      const eyebrow = this.value("eyebrow", "Meet the Queso lineup");
      const title = this.value("title", "The cakes.");
      const copy = this.value(
        "copy",
        "Four different personalities. One very serious commitment to good cheesecake."
      );
      const note = this.value(
        "note",
        "Birthday Suit • Artisan • Canvas • Flavor Drop"
      );
      const image = this.value("image", DEFAULT_IMAGE);
      const imageAlt = this.value(
        "image-alt",
        "Colorful handcrafted Queso cheesecake"
      );

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            --orange: #ed6011;
            --cream: #fdf3e6;
            --yellow: #f4c24a;
            --brown: #3d2416;
            --pink: #efa3b5;
            --pad: clamp(24px, 5vw, 76px);
            position: relative;
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

          :host([data-wix-frame]) {
            height: auto;
          }

          *, *::before, *::after {
            box-sizing: border-box;
          }

          .hero {
            position: absolute;
            inset: 0;
            display: grid;
            grid-template-columns: minmax(0, 0.86fr) minmax(0, 1.14fr);
            width: auto;
            height: auto;
            min-height: 0;
            overflow: hidden;
            background: var(--cream);
            border-top: 2px solid var(--brown);
            border-bottom: 2px solid var(--brown);
          }

          :host([data-wix-frame]) .hero {
            position: fixed;
            inset: 0;
          }

          .hero-copy {
            position: relative;
            z-index: 2;
            min-width: 0;
            padding: var(--pad);
            display: flex;
            flex-direction: column;
            justify-content: center;
            background: var(--cream);
          }

          .eyebrow {
            margin: 0 0 22px;
            color: #a84c09;
            font-size: 12px;
            font-weight: 850;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }

          h1 {
            max-width: 720px;
            margin: 0;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(68px, 8vw, 128px);
            font-weight: 900;
            line-height: 0.91;
            letter-spacing: -0.015em;
            text-transform: uppercase;
          }

          .lead {
            max-width: 560px;
            margin: 28px 0 0;
            font-size: clamp(16px, 1.5vw, 20px);
            line-height: 1.55;
          }

          .lineup {
            margin: 40px 0 0;
            padding-top: 18px;
            border-top: 2px solid var(--brown);
            font-size: 10px;
            font-weight: 850;
            letter-spacing: 0.09em;
            line-height: 1.5;
            text-transform: uppercase;
          }

          .hero-visual {
            position: relative;
            min-width: 0;
            min-height: 0;
            overflow: hidden;
            background: var(--orange);
            border-left: 2px solid var(--brown);
          }

          .hero-visual img {
            position: absolute;
            inset: 0;
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
          }

          .hero-visual::after {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            background: linear-gradient(
              180deg,
              rgba(61, 36, 22, 0.02),
              rgba(61, 36, 22, 0.18)
            );
          }

          .badge {
            position: absolute;
            z-index: 2;
            right: clamp(18px, 3vw, 46px);
            top: clamp(18px, 3vw, 46px);
            width: 126px;
            aspect-ratio: 1;
            padding: 16px;
            display: grid;
            place-items: center;
            border: 2px solid var(--brown);
            border-radius: 48% 52% 45% 55%;
            background: var(--pink);
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 18px;
            font-weight: 900;
            line-height: 1.05;
            text-align: center;
            text-transform: uppercase;
            transform: rotate(7deg);
          }

          .corner-shape {
            position: absolute;
            z-index: 2;
            left: -54px;
            bottom: -58px;
            width: 180px;
            aspect-ratio: 1;
            border: 2px solid var(--brown);
            border-radius: 50%;
            background: var(--yellow);
          }

          @media (max-width: 760px) {
            .hero {
              grid-template-columns: 1fr;
              grid-template-rows: minmax(0, 0.92fr) minmax(0, 1.08fr);
            }

            .hero-copy {
              padding: 46px 20px 34px;
            }

            .eyebrow {
              margin-bottom: 16px;
              font-size: 10px;
            }

            h1 {
              font-size: clamp(56px, 17vw, 76px);
              line-height: 0.92;
            }

            .lead {
              margin-top: 18px;
              font-size: 15px;
              line-height: 1.5;
            }

            .lineup {
              margin-top: 25px;
              padding-top: 14px;
              font-size: 8px;
            }

            .hero-visual {
              border-top: 2px solid var(--brown);
              border-left: 0;
            }

            .badge {
              width: 94px;
              padding: 12px;
              font-size: 13px;
            }

            .corner-shape {
              width: 130px;
            }
          }

          @media (max-width: 390px) {
            h1 {
              font-size: 52px;
            }

            .lead {
              font-size: 14px;
            }
          }
        </style>

        <section class="hero" aria-labelledby="queso-cakes-title">
          <div class="hero-copy">
            <p class="eyebrow">${this.escape(eyebrow)}</p>
            <h1 id="queso-cakes-title">${this.escape(title)}</h1>
            <p class="lead">${this.escape(copy)}</p>
            <p class="lineup">${this.escape(note)}</p>
          </div>

          <div class="hero-visual">
            <img
              src="${this.escape(image)}"
              alt="${this.escape(imageAlt)}"
              loading="eager"
              fetchpriority="high"
              decoding="async"
            >
            <div class="badge" aria-hidden="true">Four<br>ways<br>to cake</div>
            <div class="corner-shape" aria-hidden="true"></div>
          </div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-cakes-hero")) {
    customElements.define("queso-cakes-hero", QuesoCakesHero);
  }
})();
