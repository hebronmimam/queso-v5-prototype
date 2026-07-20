(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

  const DEFAULT_CHAPTERS = [
    {
      number: "01",
      title: "Make it memorable",
      copy: "The goal was never to make cheesecake feel formal or predictable. It should feel like the part of the celebration people talk about afterwards.",
      className: "yellow"
    },
    {
      number: "02",
      title: "Bake it fresh",
      copy: "Every Queso cake is made in small batches from a licensed Hong Kong kitchen, with freshness doing more work than unnecessary fuss.",
      className: "pink"
    },
    {
      number: "03",
      title: "Keep it playful",
      copy: "From bold flavors to Canvas cakes and limited drops, the brand is built to leave room for experimentation, personality and a little surprise.",
      className: "orange"
    }
  ];

  function installFonts() {
    if (document.head.querySelector("style[data-queso-story-origin-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoStoryOriginFonts = "true";
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

  class QuesoStoryOrigin extends HTMLElement {
    static get observedAttributes() {
      const attributes = [
        "eyebrow",
        "title",
        "intro",
        "quote",
        "quote-note"
      ];

      for (let index = 1; index <= 3; index += 1) {
        attributes.push(
          `chapter-${index}-title`,
          `chapter-${index}-copy`
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

    get chapters() {
      return DEFAULT_CHAPTERS.map((item, index) => ({
        ...item,
        title: this.value(`chapter-${index + 1}-title`, item.title),
        copy: this.value(`chapter-${index + 1}-copy`, item.copy)
      }));
    }

    render() {
      const eyebrow = this.value("eyebrow", "The thinking behind Queso");
      const title = this.value("title", "Built around better cake moments.");
      const intro = this.value(
        "intro",
        "Queso began with a clear point of view: cheesecake can be premium without feeling stiff, playful without feeling cheap and personal without becoming complicated."
      );
      const quote = this.value(
        "quote",
        "Cheesecake should feel like the occasion, not an afterthought."
      );
      const quoteNote = this.value(
        "quote-note",
        "Small-batch. Made fresh. Built with personality."
      );

      const cards = this.chapters.map((item) => `
        <article class="chapter chapter--${item.className}">
          <span class="chapter__number" aria-hidden="true">${this.escape(item.number)}</span>
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
            background: var(--cream);
            color: var(--brown);
            font-family: "Quicksand", Arial, sans-serif;
            font-weight: 550;
            font-synthesis: none;
          }

          :host([data-wix-frame]) { height: auto; }
          *, *::before, *::after { box-sizing: border-box; }

          .origin {
            width: 100%;
            height: 100%;
            min-height: 0;
            padding: clamp(66px, 7vw, 104px) var(--pad);
            overflow: hidden;
            background: var(--cream);
            border-bottom: 2px solid var(--brown);
          }

          :host([data-wix-frame]) .origin {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
          }

          .top {
            display: grid;
            grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr);
            gap: clamp(36px, 6vw, 90px);
            align-items: end;
            margin-bottom: 54px;
          }

          .eyebrow {
            margin: 0 0 15px;
            color: #a84c09;
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.13em;
            text-transform: uppercase;
          }

          h2,
          h3 {
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

          .chapters {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 18px;
          }

          .chapter {
            min-width: 0;
            min-height: 350px;
            padding: 26px;
            display: flex;
            flex-direction: column;
            border: 2px solid var(--brown);
            border-radius: 18px 8px 22px 10px;
            box-shadow: 7px 7px 0 var(--brown);
            overflow: hidden;
          }

          .chapter--yellow { background: var(--yellow); }
          .chapter--pink { background: var(--pink); transform: rotate(0.4deg); }
          .chapter--orange { background: var(--orange); color: #fff; transform: rotate(-0.4deg); }

          .chapter__number {
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 50px;
            font-weight: 900;
            line-height: 1;
            opacity: 0.52;
          }

          .chapter h3 {
            margin-top: auto;
            font-size: clamp(30px, 3vw, 48px);
            line-height: 0.96;
          }

          .chapter p {
            margin: 18px 0 0;
            font-size: 14px;
            line-height: 1.58;
          }

          .quote-row {
            margin-top: 48px;
            display: grid;
            grid-template-columns: minmax(0, 1.3fr) minmax(260px, 0.7fr);
            border: 2px solid var(--brown);
          }

          blockquote {
            margin: 0;
            padding: clamp(34px, 4vw, 60px);
            background: var(--brown);
            color: var(--cream);
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(34px, 4.2vw, 64px);
            font-weight: 900;
            line-height: 0.98;
            text-transform: uppercase;
          }

          .quote-note {
            margin: 0;
            padding: clamp(30px, 4vw, 54px);
            display: flex;
            align-items: flex-end;
            background: var(--yellow);
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.07em;
            line-height: 1.5;
            text-transform: uppercase;
          }

          @media (max-width: 980px) {
            .top {
              grid-template-columns: 1fr;
              gap: 20px;
            }

            .chapters {
              grid-template-columns: 1fr;
            }

            .chapter {
              min-height: 290px;
            }

            .quote-row {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 760px) {
            .origin {
              padding: 56px 20px;
            }

            h2 {
              font-size: clamp(48px, 14vw, 68px);
            }

            .top {
              margin-bottom: 34px;
            }

            .chapter {
              min-height: 270px;
              padding: 22px;
              box-shadow: 5px 5px 0 var(--brown);
            }

            .chapter h3 {
              font-size: 34px;
            }

            .quote-row {
              margin-top: 38px;
            }

            blockquote {
              font-size: clamp(32px, 9vw, 48px);
            }
          }
        </style>

        <section class="origin" aria-labelledby="queso-story-origin-title">
          <header class="top">
            <div>
              <p class="eyebrow">${this.escape(eyebrow)}</p>
              <h2 id="queso-story-origin-title">${this.escape(title)}</h2>
            </div>
            <p class="intro">${this.escape(intro)}</p>
          </header>

          <div class="chapters">${cards}</div>

          <div class="quote-row">
            <blockquote>${this.escape(quote)}</blockquote>
            <p class="quote-note">${this.escape(quoteNote)}</p>
          </div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-story-origin")) {
    customElements.define("queso-story-origin", QuesoStoryOrigin);
  }
})();
