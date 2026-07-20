(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

  const DEFAULT_ITEMS = [
    {
      iconClass: "fresh",
      title: "Baked fresh",
      copy: "Made fresh for your order."
    },
    {
      iconClass: "ingredient",
      title: "Premium ingredients",
      copy: "New Zealand milk and cream."
    },
    {
      iconClass: "halal",
      title: "Halal",
      copy: "Prepared with Halal ingredients."
    },
    {
      iconClass: "love",
      title: "Extra love",
      copy: "Playful by design, carefully finished."
    }
  ];

  function installFonts() {
    if (document.head.querySelector("style[data-queso-proof-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoProofFonts = "true";
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

  class QuesoProofGrid extends HTMLElement {
    static get observedAttributes() {
      const attributes = ["eyebrow", "title"];

      for (let index = 1; index <= 4; index += 1) {
        attributes.push(
          `item-${index}-title`,
          `item-${index}-copy`
        );
      }

      return attributes;
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

    attributeChangedCallback() {
      if (this.isConnected) this.render();
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

    get items() {
      return DEFAULT_ITEMS.map((item, index) => ({
        ...item,
        title: this.value(`item-${index + 1}-title`, item.title),
        copy: this.value(`item-${index + 1}-copy`, item.copy)
      }));
    }

    render() {
      const itemsMarkup = this.items.map((item) => `
        <article class="proof-card">
          <span class="brand-icon brand-icon--${item.iconClass}" aria-hidden="true"></span>
          <strong>${this.escape(item.title)}</strong>
          <span class="proof-copy">${this.escape(item.copy)}</span>
        </article>
      `).join("");

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            --cream: #fdf3e6;
            --yellow: #f4c24a;
            --brown: #3d2416;
            --orange: #ed6011;
            --pink: #efa3b5;
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

          :host([data-wix-frame]) {
            height: auto;
          }

          *, *::before, *::after {
            box-sizing: border-box;
          }

          .section {
            width: 100%;
            height: 100%;
            min-height: 0;
            padding: 72px var(--pad);
            display: flex;
            flex-direction: column;
            justify-content: center;
            overflow: hidden;
            background: var(--cream);
            border-bottom: 2px solid var(--brown);
          }

          :host([data-wix-frame]) .section {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
          }

          .section-heading {
            margin-bottom: 28px;
          }

          .eyebrow {
            margin: 0 0 17px;
            color: #a84c09;
            font-size: 12px;
            font-weight: 850;
            letter-spacing: 0.13em;
            text-transform: uppercase;
          }

          h2 {
            margin: 0;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(48px, 6vw, 88px);
            font-weight: 900;
            line-height: 1;
            letter-spacing: 0;
            text-transform: uppercase;
          }

          .proof-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            overflow: hidden;
            background: #fff;
            border: 2px solid var(--brown);
          }

          .proof-card {
            min-width: 0;
            min-height: 190px;
            padding: 28px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            background: #fff;
            border-right: 2px solid var(--brown);
          }

          .proof-card:last-child {
            border-right: 0;
          }

          .brand-icon {
            position: relative;
            width: 66px;
            height: 66px;
            flex: 0 0 66px;
            display: block;
            margin-bottom: 18px;
            overflow: hidden;
            border: 2px solid var(--brown);
            background: var(--yellow);
          }

          .brand-icon::before,
          .brand-icon::after {
            content: "";
            position: absolute;
            display: block;
          }

          .brand-icon--fresh {
            border-radius: 50%;
            background: var(--orange);
          }

          .brand-icon--fresh::before {
            inset: 15px;
            background: var(--cream);
            clip-path: polygon(
              50% 0,
              61% 36%,
              100% 50%,
              61% 64%,
              50% 100%,
              39% 64%,
              0 50%,
              39% 36%
            );
          }

          .brand-icon--ingredient {
            border-radius: 48% 48% 12px 48%;
            background: var(--yellow);
            transform: rotate(-4deg);
          }

          .brand-icon--ingredient::before {
            width: 23px;
            height: 31px;
            left: 20px;
            top: 14px;
            border: 2px solid var(--brown);
            border-radius: 55% 15% 55% 15%;
            background: var(--cream);
            transform: rotate(35deg);
          }

          .brand-icon--ingredient::after {
            width: 8px;
            height: 8px;
            right: 10px;
            bottom: 10px;
            border-radius: 50%;
            background: var(--orange);
          }

          .brand-icon--halal {
            border-radius: 50%;
            background: var(--brown);
          }

          .brand-icon--halal::before {
            width: 39px;
            height: 39px;
            left: 11px;
            top: 11px;
            border-radius: 50%;
            background: var(--yellow);
          }

          .brand-icon--halal::after {
            width: 39px;
            height: 39px;
            left: 22px;
            top: 6px;
            border-radius: 50%;
            background: var(--brown);
          }

          .brand-icon--love {
            border-radius: 16px 16px 32px 32px;
            background: var(--pink);
            transform: rotate(3deg);
          }

          .brand-icon--love::before {
            content: "♥";
            inset: 4px;
            display: grid;
            place-items: center;
            color: var(--brown);
            font-family: Arial, sans-serif;
            font-size: 42px;
          }

          .proof-card strong {
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 20px;
            font-weight: 900;
            line-height: 1.05;
            text-transform: uppercase;
          }

          .proof-copy {
            margin-top: 8px;
            font-size: 12px;
            line-height: 1.5;
          }

          @media (max-width: 900px) {
            .section {
              padding: 64px 48px;
            }

            .proof-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .proof-card:nth-child(2) {
              border-right: 0;
            }

            .proof-card:nth-child(-n + 2) {
              border-bottom: 2px solid var(--brown);
            }
          }

          @media (max-width: 560px) {
            .section {
              padding: 58px 20px;
              justify-content: flex-start;
              overflow-y: auto;
            }

            .section-heading {
              margin-bottom: 25px;
            }

            h2 {
              font-size: clamp(45px, 14vw, 58px);
            }

            .proof-grid {
              grid-template-columns: 1fr;
            }

            .proof-card,
            .proof-card:nth-child(2) {
              min-height: 164px;
              padding: 23px;
              border-right: 0;
              border-bottom: 2px solid var(--brown);
            }

            .proof-card:last-child {
              border-bottom: 0;
            }

            .brand-icon {
              width: 58px;
              height: 58px;
              flex-basis: 58px;
              margin-bottom: 15px;
            }

            .brand-icon--fresh::before {
              inset: 13px;
            }

            .brand-icon--ingredient::before {
              left: 17px;
              top: 11px;
            }

            .brand-icon--ingredient::after {
              right: 8px;
              bottom: 8px;
            }

            .brand-icon--halal::before {
              width: 34px;
              height: 34px;
              left: 9px;
              top: 9px;
            }

            .brand-icon--halal::after {
              width: 34px;
              height: 34px;
              left: 19px;
              top: 5px;
            }

            .brand-icon--love::before {
              font-size: 36px;
            }
          }

          @media (max-height: 760px) and (max-width: 560px) {
            .section {
              padding-block: 42px;
            }

            .eyebrow {
              margin-bottom: 11px;
              font-size: 10px;
            }

            h2 {
              font-size: 43px;
            }

            .proof-card,
            .proof-card:nth-child(2) {
              min-height: 145px;
            }
          }
        </style>

        <section class="section" aria-labelledby="queso-proof-title">
          <header class="section-heading">
            <p class="eyebrow">${this.escape(this.value("eyebrow", "Why choose Queso"))}</p>
            <h2 id="queso-proof-title">${this.escape(this.value("title", "Small batch. Big care."))}</h2>
          </header>
          <div class="proof-grid">${itemsMarkup}</div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-proof-grid")) {
    customElements.define("queso-proof-grid", QuesoProofGrid);
  }
})();
