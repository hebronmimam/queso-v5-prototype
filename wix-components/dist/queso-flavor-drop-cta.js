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
    if (document.head.querySelector("style[data-queso-flavor-drop-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoFlavorDropFonts = "true";
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

  class QuesoFlavorDropCta extends HTMLElement {
    static get observedAttributes() {
      return [
        "eyebrow",
        "title",
        "copy",
        "note",
        "button-label",
        "button-url",
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
      const eyebrow = this.value("eyebrow", "The monthly flavor drop");
      const title = this.value("title", "Here for a good time.");
      const copy = this.value(
        "copy",
        "One limited cheesecake flavor, released in a small batch and replaced when the next idea is ready."
      );
      const note = this.value(
        "note",
        "Available while the batch lasts. No promises, no permanent menu spot."
      );
      const buttonLabel = this.value("button-label", "See this month’s drop");
      const buttonUrl = this.value("button-url", "/cakes");
      const image = this.value("image", DEFAULT_IMAGE);
      const imageAlt = this.value(
        "image-alt",
        "Limited monthly Queso cheesecake flavor"
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
            --pad: clamp(22px, 5vw, 76px);

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

          *,
          *::before,
          *::after {
            box-sizing: border-box;
          }

          a {
            color: inherit;
            text-decoration: none;
          }

          .drop {
            width: 100%;
            height: 100%;
            min-height: 0;
            display: grid;
            grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
            overflow: hidden;
            background: var(--yellow);
            border-block: 2px solid var(--brown);
          }

          :host([data-wix-frame]) .drop {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
          }

          .media {
            position: relative;
            min-width: 0;
            min-height: 0;
            overflow: hidden;
            background: var(--orange);
            border-right: 2px solid var(--brown);
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
              rgba(61, 36, 22, 0.02),
              rgba(61, 36, 22, 0.2)
            );
          }

          .stamp {
            position: absolute;
            z-index: 2;
            left: clamp(18px, 3vw, 42px);
            top: clamp(18px, 3vw, 42px);
            width: 128px;
            aspect-ratio: 1;
            display: grid;
            place-items: center;
            padding: 18px;
            border: 2px solid var(--brown);
            border-radius: 50%;
            background: var(--pink);
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 18px;
            font-weight: 900;
            line-height: 1.02;
            text-align: center;
            text-transform: uppercase;
            transform: rotate(-7deg);
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
            margin: 0 0 18px;
            color: #a84c09;
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.13em;
            text-transform: uppercase;
          }

          h2 {
            max-width: 760px;
            margin: 0;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(58px, 6.7vw, 104px);
            font-weight: 900;
            line-height: 0.92;
            letter-spacing: -0.012em;
            text-transform: uppercase;
          }

          .lead {
            max-width: 560px;
            margin: 28px 0 0;
            font-size: clamp(16px, 1.35vw, 19px);
            line-height: 1.6;
          }

          .note {
            max-width: 560px;
            margin: 34px 0 0;
            padding-top: 17px;
            border-top: 2px solid var(--brown);
            font-size: 10px;
            font-weight: 850;
            letter-spacing: 0.07em;
            line-height: 1.55;
            text-transform: uppercase;
          }

          .button {
            align-self: flex-start;
            min-height: 52px;
            margin-top: 32px;
            padding: 0 24px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 2px solid var(--brown);
            border-radius: 10px;
            background: var(--orange);
            color: #fff;
            font-size: 10px;
            font-weight: 850;
            letter-spacing: 0.05em;
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

          .spark {
            position: absolute;
            right: 30px;
            bottom: 22px;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(74px, 8vw, 126px);
            line-height: 1;
            opacity: 0.18;
            transform: rotate(12deg);
          }

          @media (max-width: 820px) {
            .drop {
              grid-template-columns: 1fr;
              grid-template-rows: minmax(0, 1.03fr) minmax(0, 0.97fr);
            }

            .media {
              border-right: 0;
              border-bottom: 2px solid var(--brown);
            }

            .stamp {
              width: 100px;
              padding: 14px;
              font-size: 14px;
            }

            .copy-panel {
              padding: 44px 20px;
            }

            .eyebrow {
              margin-bottom: 14px;
              font-size: 9px;
            }

            h2 {
              font-size: clamp(50px, 14vw, 72px);
            }

            .lead {
              margin-top: 20px;
              font-size: 15px;
              line-height: 1.52;
            }

            .note {
              margin-top: 24px;
              padding-top: 14px;
              font-size: 8px;
            }

            .button {
              width: 100%;
              margin-top: 24px;
            }

            .spark {
              display: none;
            }
          }
        </style>

        <section class="drop" aria-labelledby="queso-flavor-drop-title">
          <div class="media">
            <img
              src="${this.escape(image)}"
              alt="${this.escape(imageAlt)}"
              loading="lazy"
              decoding="async"
            >

            <div class="stamp" aria-hidden="true">Limited<br>monthly<br>drop</div>
          </div>

          <div class="copy-panel">
            <p class="eyebrow">${this.escape(eyebrow)}</p>
            <h2 id="queso-flavor-drop-title">${this.escape(title)}</h2>
            <p class="lead">${this.escape(copy)}</p>
            <p class="note">${this.escape(note)}</p>
            <a class="button" href="${this.escape(buttonUrl)}">${this.escape(buttonLabel)}</a>
            <span class="spark" aria-hidden="true">✦</span>
          </div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-flavor-drop-cta")) {
    customElements.define("queso-flavor-drop-cta", QuesoFlavorDropCta);
  }
})();
