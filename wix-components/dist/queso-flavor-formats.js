(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

  const DEFAULT_FORMATS = [
    {
      number: "01",
      title: "Birthday Suit",
      eyebrow: "Keep it classic",
      copy: "A clean, celebration-ready cake with the flavor doing all the talking.",
      className: "yellow"
    },
    {
      number: "02",
      title: "Artisan",
      eyebrow: "A little extra",
      copy: "Layered, finished and styled for the table when the moment deserves more.",
      className: "pink"
    },
    {
      number: "03",
      title: "Canvas",
      eyebrow: "Make it yours",
      copy: "Personalize the top with your own image and message for a one-off cake.",
      className: "orange"
    },
    {
      number: "04",
      title: "Flavor Drop",
      eyebrow: "Limited monthly cake",
      copy: "A rotating release for anyone who likes their cheesecake with a deadline.",
      className: "purple"
    }
  ];

  function installFonts() {
    if (document.head.querySelector("style[data-queso-flavor-formats-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoFlavorFormatsFonts = "true";
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

  class QuesoFlavorFormats extends HTMLElement {
    static get observedAttributes() {
      const attributes = [
        "eyebrow",
        "title",
        "copy",
        "footer-note",
        "button-label",
        "button-url"
      ];

      for (let index = 1; index <= 4; index += 1) {
        attributes.push(
          `format-${index}-title`,
          `format-${index}-eyebrow`,
          `format-${index}-copy`
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

    get formats() {
      return DEFAULT_FORMATS.map((item, index) => ({
        ...item,
        title: this.value(`format-${index + 1}-title`, item.title),
        eyebrow: this.value(`format-${index + 1}-eyebrow`, item.eyebrow),
        copy: this.value(`format-${index + 1}-copy`, item.copy)
      }));
    }

    render() {
      const eyebrow = this.value("eyebrow", "One flavor. Four ways to show up.");
      const title = this.value("title", "Choose your format.");
      const copy = this.value(
        "copy",
        "Once the flavor is decided, choose the cake format that fits the occasion."
      );
      const footerNote = this.value(
        "footer-note",
        "Pick the flavor. Pick the format. We’ll handle the baking."
      );
      const buttonLabel = this.value("button-label", "See all cakes");
      const buttonUrl = this.value("button-url", "/cakes");

      const cards = this.formats.map((item) => `
        <article class="format-card format-card--${item.className}">
          <span class="format-card__number" aria-hidden="true">${this.escape(item.number)}</span>
          <p class="format-card__eyebrow">${this.escape(item.eyebrow)}</p>
          <h3>${this.escape(item.title)}</h3>
          <p class="format-card__copy">${this.escape(item.copy)}</p>
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
            --purple: #b99ad2;
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
          }

          :host([data-wix-frame]) { height: auto; }
          *, *::before, *::after { box-sizing: border-box; }
          a { color: inherit; text-decoration: none; }

          .formats {
            width: 100%;
            height: 100%;
            min-height: 0;
            padding: clamp(68px, 7vw, 104px) var(--pad);
            overflow: hidden;
            background: var(--cream);
            border-bottom: 2px solid var(--brown);
          }

          :host([data-wix-frame]) .formats {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
          }

          .formats__heading {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(280px, 0.45fr);
            gap: 48px;
            align-items: end;
            margin-bottom: 46px;
          }

          .eyebrow {
            margin: 0 0 15px;
            color: #a84c09;
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
            max-width: 850px;
            font-size: clamp(56px, 7vw, 102px);
            line-height: 0.94;
          }

          .intro-copy {
            margin: 0;
            font-size: clamp(15px, 1.3vw, 18px);
            line-height: 1.6;
          }

          .format-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 16px;
          }

          .format-card {
            min-width: 0;
            min-height: 370px;
            padding: 26px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border: 2px solid var(--brown);
            border-radius: 18px 7px 22px 10px;
            box-shadow: 7px 7px 0 var(--brown);
          }

          .format-card--yellow { background: var(--yellow); }
          .format-card--pink { background: var(--pink); transform: rotate(0.5deg); }
          .format-card--orange { background: var(--orange); color: #fff; transform: rotate(-0.5deg); }
          .format-card--purple { background: var(--purple); transform: rotate(0.35deg); }

          .format-card__number {
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 48px;
            font-weight: 900;
            line-height: 1;
            opacity: 0.55;
          }

          .format-card__eyebrow {
            margin: auto 0 13px;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: 0.09em;
            text-transform: uppercase;
          }

          h3 {
            font-size: clamp(30px, 2.7vw, 46px);
            line-height: 0.96;
          }

          .format-card__copy {
            margin: 18px 0 0;
            font-size: 14px;
            line-height: 1.55;
          }

          .footer-row {
            margin-top: 42px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 24px;
          }

          .footer-note {
            max-width: 650px;
            margin: 0;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.05em;
            line-height: 1.5;
            text-transform: uppercase;
          }

          .button {
            min-height: 50px;
            padding: 0 22px;
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

          .button:hover, .button:focus-visible { transform: translateY(-2px); }
          .button:focus-visible { outline: 3px solid var(--yellow); outline-offset: 3px; }

          @media (max-width: 1100px) {
            .formats__heading { grid-template-columns: 1fr; gap: 18px; }
            .format-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          }

          @media (max-width: 760px) {
            .formats { padding: 58px 20px; }
            .formats__heading { margin-bottom: 32px; }
            h2 { font-size: clamp(48px, 14vw, 68px); }
            .format-grid { grid-template-columns: 1fr; gap: 18px; }
            .format-card { min-height: 300px; padding: 22px; box-shadow: 5px 5px 0 var(--brown); }
            .footer-row { align-items: stretch; flex-direction: column; }
            .button { width: 100%; }
          }
        </style>

        <section class="formats" aria-labelledby="queso-flavor-formats-title">
          <header class="formats__heading">
            <div>
              <p class="eyebrow">${this.escape(eyebrow)}</p>
              <h2 id="queso-flavor-formats-title">${this.escape(title)}</h2>
            </div>
            <p class="intro-copy">${this.escape(copy)}</p>
          </header>

          <div class="format-grid">${cards}</div>

          <div class="footer-row">
            <p class="footer-note">${this.escape(footerNote)}</p>
            <a class="button" href="${this.escape(buttonUrl)}">${this.escape(buttonLabel)}</a>
          </div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-flavor-formats")) {
    customElements.define("queso-flavor-formats", QuesoFlavorFormats);
  }
})();
