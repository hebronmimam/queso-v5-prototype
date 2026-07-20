(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const repoAsset = (path) => new URL(path, REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

  const DEFAULT_FLAVORS = [
    { mark: "CL", className: "classic", title: "Classic", copy: "Clean & creamy", url: "/flavors?flavor=classic#choose-format", spark: "✦" },
    { mark: "CH", className: "chocolate", title: "Chocolate", copy: "Deep & fudgy", url: "/flavors?flavor=chocolate#choose-format", spark: "●" },
    { mark: "LE", className: "lemon", title: "Lemon", copy: "Bright & zesty", url: "/flavors?flavor=lemon#choose-format", spark: "✦" },
    { mark: "CA", className: "caramel", title: "Caramel", copy: "Toasty & rich", url: "/flavors?flavor=caramel#choose-format", spark: "●" },
    { mark: "UB", className: "ube", title: "Ube", copy: "Nutty & mellow", url: "/flavors?flavor=ube#choose-format", spark: "✦" },
    { mark: "DROP", className: "drop", title: "Monthly Drop", copy: "Here for a good time", url: "/cakes/flavor-drop", spark: "↗" }
  ];

  function installFonts() {
    if (document.head.querySelector("style[data-queso-flavor-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoFlavorFonts = "true";
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

  class QuesoFlavorShowcase extends HTMLElement {
    static get observedAttributes() {
      const attributes = [
        "eyebrow",
        "title",
        "copy",
        "image",
        "image-alt",
        "image-position",
        "stamp",
        "button-label",
        "button-url"
      ];

      for (let index = 1; index <= 6; index += 1) {
        attributes.push(
          `flavor-${index}-title`,
          `flavor-${index}-copy`,
          `flavor-${index}-url`
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

    get flavors() {
      return DEFAULT_FLAVORS.map((item, index) => ({
        ...item,
        title: this.value(`flavor-${index + 1}-title`, item.title),
        copy: this.value(`flavor-${index + 1}-copy`, item.copy),
        url: this.value(`flavor-${index + 1}-url`, item.url)
      }));
    }

    render() {
      const flavorsMarkup = this.flavors.map((item, index) => `
        <a class="flavor-link flavor-link--${index + 1}" href="${this.escape(item.url)}">
          <span class="flavor-mark flavor-mark--${item.className}" aria-hidden="true">${this.escape(item.mark)}</span>
          <span class="flavor-link__copy">
            <strong>${this.escape(item.title)}</strong>
            <small>${this.escape(item.copy)}</small>
          </span>
          <span class="flavor-spark" aria-hidden="true">${this.escape(item.spark)}</span>
        </a>
      `).join("");

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            --orange: #ed6011;
            --cream: #fdf3e6;
            --yellow: #f4c24a;
            --brown: #3d2416;
            --pink: #efa3b5;
            --purple: #76509a;
            display: block;
            width: 100%;
            height: 100%;
            min-height: 0;
            overflow: hidden;
            background: var(--orange);
            color: #fff;
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

          a {
            color: inherit;
            text-decoration: none;
          }

          img {
            display: block;
            max-width: 100%;
          }

          .showcase {
            width: 100%;
            height: 100%;
            min-height: 0;
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            overflow: hidden;
            background: var(--orange);
            border-block: 2px solid var(--brown);
          }

          :host([data-wix-frame]) .showcase {
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
            border-right: 2px solid var(--brown);
          }

          .media img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .stamp {
            position: absolute;
            top: 28px;
            left: 28px;
            width: 110px;
            height: 110px;
            display: grid;
            place-items: center;
            padding: 14px;
            border: 2px solid var(--brown);
            border-radius: 50%;
            background: var(--yellow);
            color: var(--brown);
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 16px;
            font-weight: 900;
            line-height: 1.05;
            text-align: center;
            text-transform: uppercase;
            transform: rotate(-6deg);
          }

          .copy-panel {
            min-width: 0;
            min-height: 0;
            padding: clamp(55px, 7vw, 110px);
            display: flex;
            flex-direction: column;
            justify-content: center;
            overflow: hidden;
          }

          .eyebrow {
            margin: 0 0 17px;
            color: var(--yellow);
            font-size: 12px;
            font-weight: 850;
            letter-spacing: 0.13em;
            text-transform: uppercase;
          }

          h2 {
            margin: 0;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(58px, 6.5vw, 98px);
            font-weight: 900;
            line-height: 1.02;
            text-transform: uppercase;
          }

          .intro-copy {
            max-width: 560px;
            margin: 20px 0 0;
            font-size: 18px;
            line-height: 1.6;
          }

          .flavor-links {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px 14px;
            margin: 34px 0 38px;
            align-items: center;
          }

          .flavor-link {
            position: relative;
            min-width: 0;
            min-height: 84px;
            padding: 12px 42px 12px 13px;
            display: flex;
            align-items: center;
            gap: 14px;
            overflow: hidden;
            isolation: isolate;
            background: var(--cream);
            color: var(--brown);
            border: 2px solid var(--brown);
            border-radius: 20px 6px 18px 8px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            transition: transform 200ms ease, background-color 200ms ease;
          }

          .flavor-link--1 {
            background: #fff8ec;
            transform: rotate(-1.2deg);
          }

          .flavor-link--2 {
            background: #f5b1c2;
            border-radius: 7px 22px 8px 18px;
            transform: rotate(0.8deg);
          }

          .flavor-link--3 {
            background: #ffd35c;
            border-radius: 24px 7px 20px 8px;
            transform: rotate(0.9deg);
          }

          .flavor-link--4 {
            background: #ff7a26;
            border-radius: 8px 20px 6px 24px;
            transform: rotate(-0.8deg);
          }

          .flavor-link--5 {
            background: #b99ad2;
            transform: rotate(-0.5deg);
          }

          .flavor-link--6 {
            background: #fff8ec;
            border-radius: 5px 22px 7px 18px;
            transform: rotate(1.1deg);
          }

          .flavor-link:hover,
          .flavor-link:focus-visible {
            background: var(--yellow);
            transform: rotate(0) translateY(-4px);
          }

          .flavor-link:focus-visible,
          .button:focus-visible {
            outline: 3px solid var(--cream);
            outline-offset: 3px;
          }

          .flavor-mark {
            width: 54px;
            height: 54px;
            flex: 0 0 54px;
            display: grid;
            place-items: center;
            border: 2px solid var(--brown);
            background: var(--yellow);
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 14px;
            font-weight: 900;
            line-height: 1;
            text-align: center;
          }

          .flavor-link--2 .flavor-mark {
            transform: rotate(-6deg);
          }

          .flavor-link--3 .flavor-mark {
            transform: rotate(5deg);
          }

          .flavor-link--4 .flavor-mark {
            transform: rotate(-4deg);
          }

          .flavor-link--5 .flavor-mark {
            transform: rotate(7deg);
          }

          .flavor-link--6 .flavor-mark {
            transform: rotate(-5deg);
          }

          .flavor-mark--classic {
            border-radius: 50%;
            background: var(--cream);
          }

          .flavor-mark--chocolate {
            border-radius: 8px;
            background: var(--brown);
            color: var(--cream);
          }

          .flavor-mark--lemon {
            border-radius: 50% 8px 50% 8px;
            background: var(--yellow);
          }

          .flavor-mark--caramel {
            border-radius: 50% 50% 8px 50%;
            background: var(--orange);
            color: #fff;
          }

          .flavor-mark--ube {
            border-radius: 50%;
            background: var(--purple);
            color: #fff;
          }

          .flavor-mark--drop {
            background: var(--pink);
            transform: rotate(3deg);
          }

          .flavor-link__copy {
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .flavor-link__copy strong {
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 15px;
            font-weight: 900;
            line-height: 1;
            text-transform: uppercase;
          }

          .flavor-link__copy small {
            font-size: 10px;
            font-weight: 700;
            line-height: 1.2;
            letter-spacing: 0;
            text-transform: none;
          }

          .flavor-spark {
            position: absolute;
            top: 12px;
            right: 14px;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 17px;
            color: var(--brown);
            transform: rotate(8deg);
          }

          .button {
            align-self: flex-start;
            min-height: 50px;
            padding: 0 22px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 2px solid var(--brown);
            border-radius: 10px;
            background: var(--yellow);
            color: var(--brown);
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            transition: transform 150ms ease;
          }

          .button:hover,
          .button:focus-visible {
            transform: translateY(-2px);
          }

          @media (max-width: 980px) {
            .showcase {
              grid-template-columns: 1fr;
              grid-template-rows: 570px minmax(0, 1fr);
            }

            .media {
              border-right: 0;
              border-bottom: 2px solid var(--brown);
            }

            .copy-panel {
              padding: 64px 48px;
            }
          }

          @media (max-width: 680px) {
            .showcase {
              grid-template-rows: 410px minmax(0, 1fr);
            }

            .media img {
              object-position: center center;
            }

            .copy-panel {
              padding: 64px 20px;
              justify-content: flex-start;
            }

            h2 {
              font-size: 55px;
              line-height: 1.02;
            }

            .intro-copy {
              font-size: 16px;
            }

            .flavor-links {
              grid-template-columns: 1fr;
              gap: 14px;
            }

            .flavor-link {
              min-height: 78px;
            }

            .stamp {
              top: 18px;
              left: 18px;
              width: 92px;
              height: 92px;
              font-size: 13px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .flavor-link,
            .button {
              transition: none;
            }
          }
        </style>

        <section class="showcase" aria-labelledby="queso-flavor-title">
          <div class="media">
            <img
              src="${this.escape(this.value("image", repoAsset("site/assets/v3-originals/flavor-five-overhead.png")))}"
              alt="${this.escape(this.value("image-alt", "Five Queso cheesecake flavors"))}"
              style="object-position:${this.escape(this.value("image-position", "center center"))}"
              loading="lazy"
              decoding="async"
            >
            <div class="stamp">${this.escape(this.value("stamp", "Pick your flavor ✦"))}</div>
          </div>

          <div class="copy-panel">
            <p class="eyebrow">${this.escape(this.value("eyebrow", "Find your favorite"))}</p>
            <h2 id="queso-flavor-title">${this.escape(this.value("title", "Same formats. Different mood."))}</h2>
            <p class="intro-copy">${this.escape(this.value("copy", "Start with a flavor, then choose the cake type that fits the occasion."))}</p>
            <div class="flavor-links">${flavorsMarkup}</div>
            <a class="button" href="${this.escape(this.value("button-url", "/flavors"))}">${this.escape(this.value("button-label", "Browse by flavor"))}</a>
          </div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-flavor-showcase")) {
    customElements.define("queso-flavor-showcase", QuesoFlavorShowcase);
  }
})();
