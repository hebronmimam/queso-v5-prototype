(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const DEFAULT_IMAGE = new URL(
    "site/assets/current-site/lotus-biscoff-main.png",
    REPO_ROOT
  ).href;
  const IS_WIX_FRAME = window.self !== window.top;

  function installFonts() {
    if (document.head.querySelector("style[data-queso-flavors-hero-fonts]")) {
      return;
    }

    const style = document.createElement("style");
    style.dataset.quesoFlavorsHeroFonts = "true";
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

  class QuesoFlavorsHero extends HTMLElement {
    static get observedAttributes() {
      return [
        "eyebrow",
        "title",
        "copy",
        "note",
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
      const eyebrow = this.value("eyebrow", "The Queso flavor line-up");
      const title = this.value("title", "Pick your flavor.");
      const copy = this.value(
        "copy",
        "Classic, chocolate, lemon, caramel, ube and a monthly drop that refuses to stay put."
      );
      const note = this.value(
        "note",
        "Choose the flavor first. Then choose the cake format that fits the moment."
      );
      const image = this.value("image", DEFAULT_IMAGE);
      const imageAlt = this.value(
        "image-alt",
        "Queso Bakehouse monthly flavor cheesecake"
      );
      const imagePosition = this.value("image-position", "center");

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            --orange: #ed6011;
            --cream: #fdf3e6;
            --yellow: #f4c24a;
            --brown: #3d2416;
            --pink: #efa3b5;
            --purple: #76509a;
            --pad: clamp(24px, 5vw, 76px);

            display: block;
            width: 100%;
            height: 100%;
            min-height: 0;
            overflow: hidden;
            background: var(--orange);
            color: var(--cream);
            font-family: "Quicksand", Arial, sans-serif;
            font-weight: 550;
            font-synthesis: none;
            text-rendering: geometricPrecision;
          }

          :host([data-wix-frame]) {
            height: auto;
          }

          *,
          *::before,
          *::after {
            box-sizing: border-box;
          }

          .hero {
            width: 100%;
            height: 100%;
            min-height: 0;
            display: grid;
            grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
            overflow: hidden;
            background: var(--orange);
            border-top: 2px solid var(--brown);
            border-bottom: 2px solid var(--brown);
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
            color: var(--yellow);
            font-size: 12px;
            font-weight: 850;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }

          h1 {
            max-width: 780px;
            margin: 0;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(70px, 8vw, 132px);
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
            margin-top: 38px;
            padding-top: 18px;
            border-top: 2px solid currentColor;
            font-size: 10px;
            font-weight: 850;
            letter-spacing: 0.08em;
            line-height: 1.55;
            text-transform: uppercase;
          }

          .chips {
            position: absolute;
            left: var(--pad);
            bottom: clamp(20px, 3vw, 40px);
            display: flex;
            flex-wrap: wrap;
            gap: 9px;
          }

          .chip {
            min-width: 62px;
            padding: 8px 12px;
            border: 2px solid var(--brown);
            border-radius: 999px;
            background: var(--cream);
            color: var(--brown);
            font-size: 8px;
            font-weight: 900;
            letter-spacing: 0.08em;
            text-align: center;
            text-transform: uppercase;
          }

          .chip:nth-child(2) { background: var(--pink); }
          .chip:nth-child(3) { background: var(--yellow); }
          .chip:nth-child(4) { background: #ff7a26; }
          .chip:nth-child(5) { background: #b99ad2; }

          .media {
            position: relative;
            min-width: 0;
            min-height: 0;
            overflow: hidden;
            background: var(--yellow);
            border-left: 2px solid var(--brown);
          }

          .media img {
            position: absolute;
            inset: 0;
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: ${this.escape(imagePosition)};
          }

          .media::after {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            background: linear-gradient(
              180deg,
              rgba(61, 36, 22, 0.03),
              rgba(61, 36, 22, 0.25)
            );
          }

          .drop-card {
            position: absolute;
            z-index: 2;
            right: clamp(18px, 3vw, 42px);
            top: clamp(18px, 3vw, 42px);
            width: min(220px, 46%);
            padding: 20px;
            border: 2px solid var(--brown);
            border-radius: 18px 8px 22px 10px;
            background: var(--cream);
            color: var(--brown);
            box-shadow: 7px 7px 0 var(--brown);
            transform: rotate(2deg);
          }

          .drop-card small {
            display: block;
            margin-bottom: 8px;
            color: #a84c09;
            font-size: 8px;
            font-weight: 900;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .drop-card strong {
            display: block;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(20px, 2vw, 28px);
            line-height: 1;
            text-transform: uppercase;
          }

          @media (max-width: 820px) {
            .hero {
              grid-template-columns: 1fr;
              grid-template-rows: minmax(0, 0.96fr) minmax(0, 1.04fr);
            }

            .copy-panel {
              padding: 48px 20px 78px;
            }

            .eyebrow {
              margin-bottom: 15px;
              font-size: 10px;
            }

            h1 {
              font-size: clamp(58px, 16vw, 82px);
              line-height: 0.91;
            }

            .lead {
              margin-top: 20px;
              font-size: 15px;
              line-height: 1.52;
            }

            .note {
              margin-top: 25px;
              padding-top: 14px;
              font-size: 8px;
            }

            .chips {
              left: 20px;
              bottom: 24px;
            }

            .media {
              border-top: 2px solid var(--brown);
              border-left: 0;
            }

            .drop-card {
              width: 178px;
              padding: 15px;
              box-shadow: 5px 5px 0 var(--brown);
            }
          }

          @media (max-width: 390px) {
            h1 {
              font-size: 52px;
            }

            .lead {
              font-size: 14px;
            }

            .chip {
              min-width: 54px;
              padding-inline: 9px;
            }
          }
        </style>

        <section class="hero" aria-labelledby="queso-flavors-hero-title">
          <div class="copy-panel">
            <p class="eyebrow">${this.escape(eyebrow)}</p>
            <h1 id="queso-flavors-hero-title">${this.escape(title)}</h1>
            <p class="lead">${this.escape(copy)}</p>
            <p class="note">${this.escape(note)}</p>

            <div class="chips" aria-hidden="true">
              <span class="chip">Classic</span>
              <span class="chip">Chocolate</span>
              <span class="chip">Lemon</span>
              <span class="chip">Caramel</span>
              <span class="chip">Ube</span>
            </div>
          </div>

          <div class="media">
            <img
              src="${this.escape(image)}"
              alt="${this.escape(imageAlt)}"
              loading="eager"
              fetchpriority="high"
              decoding="async"
            >

            <div class="drop-card">
              <small>Monthly drop</small>
              <strong>Here for a good time.</strong>
            </div>
          </div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-flavors-hero")) {
    customElements.define("queso-flavors-hero", QuesoFlavorsHero);
  }
})();
