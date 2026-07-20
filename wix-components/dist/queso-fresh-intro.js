(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_QUESO = new URL("queso font.ttf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

  function installFonts() {
    if (document.head.querySelector("style[data-queso-intro-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoIntroFonts = "true";
    style.textContent = `
      @font-face {
        font-family: "Queso Display";
        src: url("${FONT_QUESO}") format("truetype");
        font-weight: 400;
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

  class QuesoFreshIntro extends HTMLElement {
    static get observedAttributes() {
      return ["eyebrow", "title", "copy"];
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
          :host {
            --yellow: #f4c24a;
            --brown: #3d2416;
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

          :host([data-wix-frame]) {
            height: auto;
          }

          *, *::before, *::after {
            box-sizing: border-box;
          }

          .intro {
            width: 100%;
            height: 100%;
            min-height: 0;
            padding: clamp(38px, 8vh, 92px) clamp(20px, 5vw, 76px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            overflow: hidden;
            background: var(--yellow);
            border-bottom: 2px solid var(--brown);
          }

          :host([data-wix-frame]) .intro {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
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
            font-family: "Queso Display", sans-serif;
            font-size: clamp(54px, 7vw, 104px);
            font-weight: 400;
            line-height: 1.02;
            letter-spacing: 0;
            text-transform: none;
          }

          .copy {
            max-width: 810px;
            margin: 26px auto 0;
            font-size: clamp(16px, 1.8vw, 21px);
            line-height: 1.6;
          }

          @media (max-width: 680px) {
            .intro {
              padding: clamp(30px, 7vh, 58px) 20px;
            }

            h2 {
              max-width: 330px;
              font-size: clamp(43px, 14.5vw, 58px);
              line-height: 1.02;
            }

            .copy {
              max-width: 320px;
              margin-top: 22px;
              font-size: 15px;
              line-height: 1.55;
            }
          }

          @media (max-width: 360px) {
            h2 {
              font-size: 47px;
            }
          }

          @media (max-height: 390px) {
            .intro {
              padding-block: 22px;
            }

            .eyebrow {
              margin-bottom: 10px;
              font-size: 10px;
            }

            h2 {
              font-size: clamp(38px, 12vw, 54px);
            }

            .copy {
              margin-top: 14px;
              font-size: 13px;
              line-height: 1.45;
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
