(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const DEFAULT_IMAGE = new URL("assets/generated-campaign/07-kitchen-story.png", REPO_ROOT).href;
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
        "paragraph-1",
        "paragraph-2",
        "paragraph-3",
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
      const eyebrow = this.value("eyebrow", "Where it started");
      const title = this.value("title", "A family recipe, reimagined.");
      const paragraphOne = this.value(
        "paragraph-1",
        "Queso Bakehouse started in a home kitchen in Hong Kong with one family cheesecake recipe and two sisters who could not agree on how sweet it should be."
      );
      const paragraphTwo = this.value(
        "paragraph-2",
        "Soft-launched in February 2025, Queso has since become known for handcrafted cheesecakes made fresh in a licensed kitchen."
      );
      const paragraphThree = this.value(
        "paragraph-3",
        "From naked Birthday Suit cakes to custom Canvas creations with edible photo prints, every cake starts with the same family recipe - just dressed differently for the occasion."
      );
      const image = this.value("image", DEFAULT_IMAGE);
      const imageAlt = this.value("image-alt", "Cheesecake being prepared in a kitchen");
      const imagePosition = this.value("image-position", "center");

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            --yellow: #f4c24a;
            --brown: #3d2416;
            --pad: clamp(20px, 5vw, 76px);
            display: block;
            width: 100%;
            height: 100%;
            min-height: 0;
            overflow: hidden;
            background: var(--yellow);
            color: var(--brown);
            font-family: "Quicksand", Arial, sans-serif;
            font-weight: 550;
            font-synthesis: none;
            text-rendering: geometricPrecision;
          }

          :host([data-wix-frame]) { height: auto; }
          *, *::before, *::after { box-sizing: border-box; }

          .story-grid {
            width: 100%;
            height: 100%;
            min-height: 0;
            display: grid;
            grid-template-columns: 1fr 1fr;
            overflow: hidden;
            border-bottom: 2px solid var(--brown);
          }

          :host([data-wix-frame]) .story-grid {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
          }

          .story-copy {
            min-width: 0;
            padding: clamp(65px, 8vw, 115px) var(--pad);
            display: flex;
            flex-direction: column;
            justify-content: center;
            background: var(--yellow);
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
            font-size: clamp(55px, 6.5vw, 96px);
            font-weight: 900;
            line-height: 1;
            text-transform: uppercase;
          }

          .story-copy p:not(.eyebrow) {
            margin: 20px 0 0;
            font-size: 17px;
            line-height: 1.7;
          }

          .story-image {
            width: 100%;
            height: 100%;
            min-width: 0;
            min-height: 650px;
            object-fit: cover;
            object-position: ${this.escape(imagePosition)};
            border-left: 2px solid var(--brown);
          }

          @media (max-width: 980px) {
            .story-grid { grid-template-columns: 1fr; }
            .story-image {
              min-height: 480px;
              border-top: 2px solid var(--brown);
              border-left: 0;
            }
          }

          @media (max-width: 680px) {
            .story-copy { padding: 65px 20px; }
            h1 { font-size: 55px; }
            .story-copy p:not(.eyebrow) { font-size: 15px; line-height: 1.65; }
            .story-image { min-height: 410px; }
          }
        </style>

        <section class="story-grid" aria-labelledby="queso-story-title">
          <div class="story-copy">
            <p class="eyebrow">${this.escape(eyebrow)}</p>
            <h1 id="queso-story-title">${this.escape(title)}</h1>
            <p>${this.escape(paragraphOne)}</p>
            <p>${this.escape(paragraphTwo)}</p>
            <p>${this.escape(paragraphThree)}</p>
          </div>

          <img
            class="story-image"
            src="${this.escape(image)}"
            alt="${this.escape(imageAlt)}"
            loading="eager"
            fetchpriority="high"
            decoding="async"
          >
        </section>
      `;
    }
  }

  if (!customElements.get("queso-story-hero")) {
    customElements.define("queso-story-hero", QuesoStoryHero);
  }
})();
