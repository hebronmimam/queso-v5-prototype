(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

  const DEFAULT_ROUTES = [
    {
      number: "01",
      title: "Order help",
      copy: "Questions about flavors, sizing, delivery, pickup or an existing order.",
      detail: "Best for straightforward cake questions",
      className: "yellow"
    },
    {
      number: "02",
      title: "Custom cake",
      copy: "Share the date, serving size, flavor direction and what you want the cake to say.",
      detail: "Best for Canvas and special requests",
      className: "pink"
    },
    {
      number: "03",
      title: "Events & partnerships",
      copy: "Popups, brand collaborations, corporate orders, press and other bigger ideas.",
      detail: "Best for projects beyond one cake",
      className: "orange"
    }
  ];

  function installFonts() {
    if (document.head.querySelector("style[data-queso-connect-routes-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoConnectRoutesFonts = "true";
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

  class QuesoConnectRoutes extends HTMLElement {
    static get observedAttributes() {
      const attributes = ["eyebrow", "title", "copy", "note"];

      for (let index = 1; index <= 3; index += 1) {
        attributes.push(
          `route-${index}-title`,
          `route-${index}-copy`,
          `route-${index}-detail`
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

    get routes() {
      return DEFAULT_ROUTES.map((item, index) => ({
        ...item,
        title: this.value(`route-${index + 1}-title`, item.title),
        copy: this.value(`route-${index + 1}-copy`, item.copy),
        detail: this.value(`route-${index + 1}-detail`, item.detail)
      }));
    }

    render() {
      const eyebrow = this.value("eyebrow", "Start in the right place");
      const title = this.value("title", "What are we talking about?");
      const copy = this.value(
        "copy",
        "A little context upfront helps Queso answer faster and keeps your request with the right conversation."
      );
      const note = this.value(
        "note",
        "Include your preferred date, serving size and contact details whenever they matter."
      );

      const cards = this.routes.map((item) => `
        <article class="route route--${item.className}">
          <span class="route__number" aria-hidden="true">${this.escape(item.number)}</span>
          <h3>${this.escape(item.title)}</h3>
          <p class="route__copy">${this.escape(item.copy)}</p>
          <p class="route__detail">${this.escape(item.detail)}</p>
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
            --pad: clamp(22px, 5vw, 76px);
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
          }

          :host([data-wix-frame]) { height: auto; }
          *, *::before, *::after { box-sizing: border-box; }

          .routes {
            width: 100%;
            height: 100%;
            min-height: 0;
            padding: clamp(68px, 7vw, 106px) var(--pad);
            overflow: hidden;
            background: var(--cream);
            border-bottom: 2px solid var(--brown);
          }

          :host([data-wix-frame]) .routes {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
          }

          .heading {
            display: grid;
            grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
            gap: clamp(34px, 6vw, 88px);
            align-items: end;
            margin-bottom: 48px;
          }

          .eyebrow {
            margin: 0 0 15px;
            color: #9d4509;
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.13em;
            text-transform: uppercase;
          }

          h2, h3 {
            margin: 0;
            font-family: "Lovelo", Arial, sans-serif;
            font-weight: 900;
            text-transform: uppercase;
          }

          h2 {
            max-width: 900px;
            font-size: clamp(56px, 7vw, 104px);
            line-height: 0.93;
          }

          .intro {
            margin: 0;
            font-size: clamp(16px, 1.35vw, 19px);
            line-height: 1.62;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 18px;
          }

          .route {
            min-width: 0;
            min-height: 390px;
            padding: 28px;
            display: flex;
            flex-direction: column;
            border: 2px solid var(--brown);
            border-radius: 18px 8px 22px 10px;
            box-shadow: 7px 7px 0 var(--brown);
            overflow: hidden;
          }

          .route--yellow { background: var(--yellow); }
          .route--pink { background: var(--pink); transform: rotate(0.4deg); }
          .route--orange { background: var(--orange); color: #fff; transform: rotate(-0.4deg); }

          .route__number {
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 50px;
            font-weight: 900;
            line-height: 1;
            opacity: 0.52;
          }

          .route h3 {
            margin-top: auto;
            font-size: clamp(32px, 3vw, 50px);
            line-height: 0.95;
          }

          .route__copy {
            margin: 18px 0 0;
            font-size: 14px;
            line-height: 1.58;
          }

          .route__detail {
            margin: 24px 0 0;
            padding-top: 15px;
            border-top: 2px solid currentColor;
            font-size: 9px;
            font-weight: 850;
            letter-spacing: 0.07em;
            line-height: 1.5;
            text-transform: uppercase;
          }

          .note {
            margin: 46px 0 0;
            padding-top: 18px;
            border-top: 2px solid var(--brown);
            font-size: 10px;
            font-weight: 850;
            letter-spacing: 0.08em;
            line-height: 1.5;
            text-transform: uppercase;
          }

          @media (max-width: 980px) {
            .heading { grid-template-columns: 1fr; gap: 20px; }
            .grid { grid-template-columns: 1fr; }
            .route { min-height: 300px; }
          }

          @media (max-width: 760px) {
            .routes { padding: 56px 20px; }
            .heading { margin-bottom: 34px; }
            h2 { font-size: clamp(48px, 14vw, 68px); }
            .route { min-height: 280px; padding: 22px; box-shadow: 5px 5px 0 var(--brown); }
            .route h3 { font-size: 35px; }
            .note { margin-top: 38px; font-size: 8px; }
          }
        </style>

        <section class="routes" aria-labelledby="queso-connect-routes-title">
          <header class="heading">
            <div>
              <p class="eyebrow">${this.escape(eyebrow)}</p>
              <h2 id="queso-connect-routes-title">${this.escape(title)}</h2>
            </div>
            <p class="intro">${this.escape(copy)}</p>
          </header>

          <div class="grid">${cards}</div>
          <p class="note">${this.escape(note)}</p>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-connect-routes")) {
    customElements.define("queso-connect-routes", QuesoConnectRoutes);
  }
})();
