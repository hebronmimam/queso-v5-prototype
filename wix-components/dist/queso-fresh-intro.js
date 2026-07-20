(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

  class QuesoFreshIntro extends HTMLElement {
    static get observedAttributes() {
      return ["eyebrow", "title", "copy"];
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.handleFrameResize = this.syncFrameHeight.bind(this);
    }

    connectedCallback() {
      this.toggleAttribute("data-wix-frame", IS_WIX_FRAME);
      this.syncFrameHeight();
      window.addEventListener("resize", this.handleFrameResize);
      this.preloadFonts();
      this.render();
    }

    disconnectedCallback() {
      window.removeEventListener("resize", this.handleFrameResize);
    }

    attributeChangedCallback() {
      if (this.isConnected) this.render();
    }

    syncFrameHeight() {
      if (!IS_WIX_FRAME) {
        this.style.removeProperty("--queso-frame-height");
        return;
      }

      this.style.setProperty(
        "--queso-frame-height",
        `${Math.max(window.innerHeight, 1)}px`
      );
    }

    preloadFonts() {
      [
        [FONT_LOVELO, "font/otf"],
        [FONT_QUICKSAND, "font/ttf"]
      ].forEach(([href, type]) => {
        if (document.head.querySelector(`link[data-queso-font="${href}"]`)) return;

        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "font";
        link.type = type;
        link.href = href;
        link.crossOrigin = "anonymous";
        link.dataset.quesoFont = href;
        document.head.appendChild(link);
      });
    }

    value(name, fallback) {
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
      const eyebrow = this.value("eyebrow", "Fresh out the kitchen");
      const title = this.value("title", "we make them freshhhhh");
      const copy = this.value(
        "copy",
        "with premium cream cheese made from fresh New Zealand milk and cream. Delivered straight to your door from our licensed kitchen."
      );

      this.shadowRoot.innerHTML = `
        <style>
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

          :host {
            --yellow: #f4c24a;
            --brown: #3d2416;
            display: block;
            width: 100%;
            height: var(--queso-frame-height, 100%);
            min-height: 390px;
            overflow: hidden;
            background: var(--yellow);
            color: var(--brown);
            font-family: "Quicksand", Arial, sans-serif;
            font-weight: 550;
            font-synthesis: none;
            text-rendering: geometricPrecision;
          }

          :host([data-wix-frame]) {
            min-height: 0;
          }

          *, *::before, *::after {
            box-sizing: border-box;
          }

          .intro {
            width: 100%;
            height: 100%;
            min-height: 0;
            padding: clamp(42px, 9vh, 92px) clamp(20px, 5vw, 76px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            overflow: hidden;
            background: var(--yellow);
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

          h2 {
            max-width: 1150px;
            margin: 0;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(54px, 7vw, 104px);
            font-weight: 900;
            line-height: 1.04;
            letter-spacing: 0;
            text-transform: uppercase;
          }

          .copy {
            max-width: 810px;
            margin: 26px auto 0;
            font-size: clamp(16px, 1.8vw, 21px);
            line-height: 1.6;
          }

          @media (max-width: 680px) {
            :host {
              min-height: 360px;
            }

            :host([data-wix-frame]) {
              min-height: 0;
            }

            .intro {
              padding: 48px 20px;
            }

            h2 {
              font-size: clamp(42px, 13vw, 60px);
            }

            .copy {
              margin-top: 20px;
              font-size: 16px;
            }
          }
        </style>

        <section class="intro" aria-labelledby="queso-fresh-intro-title">
          <p class="eyebrow">${this.escape(eyebrow)}</p>
          <h2 id="queso-fresh-intro-title">${this.escape(title)}</h2>
          <p class="copy">${this.escape(copy)}</p>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-fresh-intro")) {
    customElements.define("queso-fresh-intro", QuesoFreshIntro);
  }
})();
