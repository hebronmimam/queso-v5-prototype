(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const DEFAULT_IMAGE = new URL(
    "assets/generated-campaign/04-canvas.png",
    REPO_ROOT
  ).href;
  const IS_WIX_FRAME = window.self !== window.top;

  function installFonts() {
    if (document.head.querySelector("style[data-queso-connect-hero-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoConnectHeroFonts = "true";
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

  class QuesoConnectHero extends HTMLElement {
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
      const eyebrow = this.value("eyebrow", "Connect with Queso");
      const title = this.value("title", "Let’s talk cake.");
      const copy = this.value(
        "copy",
        "Questions, custom ideas, partnerships or popup plans—send the details and we’ll point you in the right direction."
      );
      const note = this.value(
        "note",
        "Online orders • Custom cakes • Events • Partnerships"
      );
      const image = this.value("image", DEFAULT_IMAGE);
      const imageAlt = this.value(
        "image-alt",
        "Personalised Queso Bakehouse Canvas cake"
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
            --purple: #b99ad2;
            --pad: clamp(24px, 5vw, 76px);

            display: block;
            width: 100%;
            height: 100%;
            min-height: 0;
            overflow: hidden;
            background: var(--pink);
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
            grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
            overflow: hidden;
            background: var(--pink);
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
            margin: 0 0 19px;
            color: #9d4509;
            font-size: 12px;
            font-weight: 850;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }

          h1 {
            max-width: 790px;
            margin: 0;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(72px, 8.2vw, 132px);
            font-weight: 900;
            line-height: 0.89;
            letter-spacing: -0.015em;
            text-transform: uppercase;
          }

          .lead {
            max-width: 560px;
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
            bottom: 20px;
            color: var(--cream);
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(82px, 8vw, 132px);
            line-height: 1;
            opacity: 0.4;
            transform: rotate(11deg);
          }

          .visual {
            position: relative;
            min-width: 0;
            min-height: 0;
            overflow: hidden;
            background: var(--yellow);
            border-left: 2px solid var(--brown);
          }

          .visual img {
            position: absolute;
            inset: 0;
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: ${this.escape(imagePosition)};
          }

          .visual::after {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            background: linear-gradient(180deg, rgba(61, 36, 22, 0.02), rgba(61, 36, 22, 0.18));
          }

          .contact-stack {
            position: absolute;
            z-index: 2;
            left: clamp(18px, 3vw, 42px);
            bottom: clamp(18px, 3vw, 42px);
            width: min(420px, calc(100% - 36px));
            display: grid;
            gap: 10px;
          }

          .contact-card {
            padding: 16px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 18px;
            border: 2px solid var(--brown);
            border-radius: 16px 7px 18px 9px;
            background: var(--cream);
            color: var(--brown);
            box-shadow: 5px 5px 0 var(--brown);
          }

          .contact-card:nth-child(2) {
            background: var(--yellow);
            transform: rotate(0.5deg);
          }

          .contact-card:nth-child(3) {
            background: var(--purple);
            transform: rotate(-0.4deg);
          }

          .contact-card strong {
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(18px, 1.8vw, 26px);
            line-height: 1;
            text-transform: uppercase;
          }

          .contact-card span {
            flex: 0 0 auto;
            font-size: 18px;
            font-weight: 900;
          }

          .badge {
            position: absolute;
            z-index: 2;
            right: clamp(18px, 3vw, 42px);
            top: clamp(18px, 3vw, 42px);
            width: 118px;
            aspect-ratio: 1;
            padding: 16px;
            display: grid;
            place-items: center;
            border: 2px solid var(--brown);
            border-radius: 50%;
            background: var(--orange);
            color: #fff;
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
            .eyebrow { margin-bottom: 14px; font-size: 10px; }
            h1 { font-size: clamp(58px, 16vw, 82px); }
            .lead { margin-top: 20px; font-size: 15px; line-height: 1.52; }
            .note { margin-top: 25px; padding-top: 14px; font-size: 8px; }
            .spark { display: none; }

            .visual {
              border-left: 0;
              border-top: 2px solid var(--brown);
            }

            .contact-stack {
              left: 18px;
              bottom: 18px;
              width: calc(100% - 36px);
            }

            .badge {
              width: 94px;
              padding: 12px;
              font-size: 13px;
            }
          }

          @media (max-width: 430px) {
            h1 { font-size: 54px; }
            .contact-card { padding: 13px 15px; }
            .contact-card strong { font-size: 17px; }
          }
        </style>

        <section class="hero" aria-labelledby="queso-connect-hero-title">
          <div class="copy-panel">
            <p class="eyebrow">${this.escape(eyebrow)}</p>
            <h1 id="queso-connect-hero-title">${this.escape(title)}</h1>
            <p class="lead">${this.escape(copy)}</p>
            <p class="note">${this.escape(note)}</p>
            <span class="spark" aria-hidden="true">✦</span>
          </div>

          <div class="visual">
            <img
              src="${this.escape(image)}"
              alt="${this.escape(imageAlt)}"
              loading="eager"
              fetchpriority="high"
              decoding="async"
            >

            <div class="contact-stack" aria-hidden="true">
              <div class="contact-card"><strong>Cake questions</strong><span>↗</span></div>
              <div class="contact-card"><strong>Custom orders</strong><span>↗</span></div>
              <div class="contact-card"><strong>Events & partnerships</strong><span>↗</span></div>
            </div>

            <div class="badge" aria-hidden="true">Say<br>hello<br>here</div>
          </div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-connect-hero")) {
    customElements.define("queso-connect-hero", QuesoConnectHero);
  }
})();
