(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

  const DEFAULT_ITEMS = [
    {
      mark: "01",
      title: "Fresh first",
      copy: "Small-batch baking keeps the texture, finish and flavour where they should be: fresh, rich and worth the wait.",
      className: "cream"
    },
    {
      mark: "02",
      title: "Full of personality",
      copy: "The cakes should look and feel unmistakably Queso—bold, playful and never like an anonymous bakery box.",
      className: "pink"
    },
    {
      mark: "03",
      title: "Made for the moment",
      copy: "From simple celebrations to personalised Canvas cakes, every format is designed around the occasion it joins.",
      className: "yellow"
    },
    {
      mark: "04",
      title: "Always evolving",
      copy: "Monthly drops, new ideas and unexpected flavours keep the menu moving without losing the core Queso character.",
      className: "orange"
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
      const attributes = ["eyebrow", "title", "copy", "note"];
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
      const eyebrow = this.value("eyebrow", "The Queso way");
      const title = this.value("title", "What stays true.");
      const copy = this.value(
        "copy",
        "The menu can change. The standard behind it should not."
      );
      const note = this.value(
        "note",
        "Freshly made • Small batch • Playful by design • Built for celebration"
      );

      const cards = this.items.map((item) => `
        <article class="principle principle--${item.className}">
          <span class="principle__mark" aria-hidden="true">${this.escape(item.mark)}</span>
          <h3>${this.escape(item.title)}</h3>
          <p>${this.escape(item.copy)}</p>
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
            background: var(--brown);
            color: var(--cream);
            font-family: "Quicksand", Arial, sans-serif;
            font-weight: 550;
            font-synthesis: none;
          }

          :host([data-wix-frame]) { height: auto; }
          *, *::before, *::after { box-sizing: border-box; }

          .principles {
            width: 100%;
            height: 100%;
            min-height: 0;
            padding: clamp(68px, 7vw, 106px) var(--pad);
            overflow: hidden;
            background: var(--brown);
            border-bottom: 2px solid var(--brown);
          }

          :host([data-wix-frame]) .principles {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
          }

          .heading {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(280px, 0.44fr);
            gap: 48px;
            align-items: end;
            margin-bottom: 46px;
          }

          .eyebrow {
            margin: 0 0 15px;
            color: var(--yellow);
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
            max-width: 840px;
            font-size: clamp(58px, 7vw, 104px);
            line-height: 0.93;
          }

          .intro {
            margin: 0;
            font-size: clamp(16px, 1.35vw, 19px);
            line-height: 1.6;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }

          .principle {
            min-width: 0;
            min-height: 280px;
            padding: 28px;
            display: flex;
            flex-direction: column;
            border: 2px solid var(--cream);
            border-radius: 18px 8px 22px 10px;
            box-shadow: 7px 7px 0 var(--cream);
            color: var(--brown);
            overflow: hidden;
          }

          .principle--cream { background: var(--cream); }
          .principle--pink { background: var(--pink); transform: rotate(0.35deg); }
          .principle--yellow { background: var(--yellow); transform: rotate(-0.35deg); }
          .principle--orange { background: var(--orange); color: #fff; }

          .principle__mark {
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 46px;
            font-weight: 900;
            line-height: 1;
            opacity: 0.48;
          }

          h3 {
            margin-top: auto;
            font-size: clamp(32px, 3vw, 48px);
            line-height: 0.96;
          }

          .principle p {
            margin: 18px 0 0;
            font-size: 14px;
            line-height: 1.58;
          }

          .note {
            margin: 44px 0 0;
            padding-top: 18px;
            border-top: 2px solid var(--cream);
            font-size: 10px;
            font-weight: 850;
            letter-spacing: 0.08em;
            line-height: 1.5;
            text-transform: uppercase;
          }

          @media (max-width: 980px) {
            .heading { grid-template-columns: 1fr; gap: 18px; }
          }

          @media (max-width: 760px) {
            .principles { padding: 56px 20px; }
            .heading { margin-bottom: 34px; }
            h2 { font-size: clamp(48px, 14vw, 68px); }
            .grid { grid-template-columns: 1fr; }
            .principle { min-height: 260px; padding: 22px; box-shadow: 5px 5px 0 var(--cream); }
            .note { margin-top: 36px; font-size: 8px; }
          }
        </style>

        <section class="principles" aria-labelledby="queso-story-principles-title">
          <header class="heading">
            <div>
              <p class="eyebrow">${this.escape(eyebrow)}</p>
              <h2 id="queso-story-principles-title">${this.escape(title)}</h2>
            </div>
            <p class="intro">${this.escape(copy)}</p>
          </header>

          <div class="grid">${cards}</div>
          <p class="note">${this.escape(note)}</p>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-story-principles")) {
    customElements.define("queso-story-principles", QuesoStoryPrinciples);
  }
})();
