(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

  const DEFAULT_ITEMS = [
    {
      icon: "fresh",
      title: "Licensed kitchen",
      copy: "Handcrafted fresh in Hong Kong."
    },
    {
      icon: "ingredient",
      title: "Premium ingredients",
      copy: "Quality dairy and Valrhona chocolate variations."
    },
    {
      icon: "love",
      title: "Made by hand",
      copy: "Slight variation is part of the craft."
    },
    {
      icon: "drop",
      title: "Seasonal flavors",
      copy: "A new limited flavor each month."
    }
  ];

  function installFonts() {
    if (document.head.querySelector("style[data-queso-story-principles-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoStoryPrinciplesFonts = "true";
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

  class QuesoStoryPrinciples extends HTMLElement {
    static get observedAttributes() {
      const attributes = ["eyebrow", "title"];
      for (let index = 1; index <= 4; index += 1) {
        attributes.push(`item-${index}-title`, `item-${index}-copy`);
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
      const eyebrow = this.value("eyebrow", "What Queso stands for");
      const title = this.value("title", "Fresh, playful, handcrafted.");

      const cards = this.items.map((item) => `
        <article class="proof">
          <span class="brand-icon icon-${this.escape(item.icon)}" aria-hidden="true"></span>
          <strong>${this.escape(item.title)}</strong>
          <span>${this.escape(item.copy)}</span>
        </article>
      `).join("");

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
            background: var(--cream);
            color: var(--brown);
            font-family: "Quicksand", Arial, sans-serif;
            font-weight: 550;
            font-synthesis: none;
            text-rendering: geometricPrecision;
          }

          :host([data-wix-frame]) { height: auto; }
          *, *::before, *::after { box-sizing: border-box; }

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

          .section-heading { margin-bottom: 42px; }

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
            text-transform: uppercase;
          }

          .proof-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            border: 2px solid var(--brown);
            background: #fff;
          }

          .proof {
            min-height: 190px;
            padding: 28px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            border-right: 2px solid var(--brown);
          }

          .proof:last-child { border-right: 0; }

          .brand-icon {
            position: relative;
            display: block;
            width: 66px;
            height: 66px;
            margin-bottom: 18px;
            overflow: hidden;
            flex: 0 0 auto;
            border: 2px solid var(--brown);
            background: var(--yellow);
          }

          .brand-icon::before,
          .brand-icon::after {
            content: "";
            position: absolute;
            display: block;
          }

          .icon-fresh {
            border-radius: 50%;
            background: var(--orange);
          }

          .icon-fresh::before {
            inset: 15px;
            background: var(--cream);
            clip-path: polygon(50% 0,61% 36%,100% 50%,61% 64%,50% 100%,39% 64%,0 50%,39% 36%);
          }

          .icon-ingredient {
            border-radius: 48% 48% 12px 48%;
            background: var(--yellow);
            transform: rotate(-4deg);
          }

          .icon-ingredient::before {
            width: 23px;
            height: 31px;
            left: 20px;
            top: 14px;
            border: 2px solid var(--brown);
            border-radius: 55% 15% 55% 15%;
            background: var(--cream);
            transform: rotate(35deg);
          }

          .icon-ingredient::after {
            width: 8px;
            height: 8px;
            right: 10px;
            bottom: 10px;
            border-radius: 50%;
            background: var(--orange);
          }

          .icon-love {
            border-radius: 16px 16px 32px 32px;
            background: var(--pink);
            transform: rotate(3deg);
          }

          .icon-love::before {
            content: "♥";
            inset: 4px;
            display: grid;
            place-items: center;
            color: var(--brown);
            font-family: Arial, sans-serif;
            font-size: 42px;
          }

          .icon-drop {
            border-radius: 50% 50% 10px 50%;
            background: var(--orange);
            transform: rotate(45deg);
          }

          .icon-drop::before {
            content: "✦";
            inset: 0;
            display: grid;
            place-items: center;
            color: var(--yellow);
            font-size: 31px;
            transform: rotate(-45deg);
          }

          .proof strong {
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 20px;
            line-height: 1.05;
            text-transform: uppercase;
          }

          .proof > span:last-child {
            margin-top: 8px;
            font-size: 12px;
            line-height: 1.5;
          }

          @media (max-width: 980px) {
            .proof-grid { grid-template-columns: 1fr 1fr; }
            .proof:nth-child(2) { border-right: 0; }
            .proof:nth-child(-n + 2) { border-bottom: 2px solid var(--brown); }
          }

          @media (max-width: 680px) {
            .section { padding: 70px 20px; }
            h2 { font-size: 49px; line-height: 1.02; }
            .proof-grid { grid-template-columns: 1fr; }
            .proof {
              min-height: 150px;
              border-right: 0;
              border-bottom: 2px solid var(--brown);
            }
            .proof:nth-child(2) { border-right: 0; }
            .proof:last-child { border-bottom: 0; }
          }
        </style>

        <section class="section" aria-labelledby="queso-story-principles-title">
          <header class="section-heading">
            <p class="eyebrow">${this.escape(eyebrow)}</p>
            <h2 id="queso-story-principles-title">${this.escape(title)}</h2>
          </header>

          <div class="proof-grid">${cards}</div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-story-principles")) {
    customElements.define("queso-story-principles", QuesoStoryPrinciples);
  }
})();
