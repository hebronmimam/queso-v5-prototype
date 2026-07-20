(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const repoAsset = (path) => new URL(path, REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

  const DEFAULT_FLAVORS = [
    {
      key: "classic",
      name: "Classic",
      copy: "Clean, creamy and the family-recipe starting point.",
      image: repoAsset("site/assets/v3-originals/flavor-five-overhead.png"),
      alt: "Classic cheesecake"
    },
    {
      key: "chocolate",
      name: "Chocolate",
      copy: "Rich cheesecake with premium Valrhona chocolate.",
      image: repoAsset("site/assets/current-site/Chocolate Artisan.png"),
      alt: "Chocolate cheesecake"
    },
    {
      key: "lemon",
      name: "Lemon",
      copy: "Bright citrus with a creamy, balanced finish.",
      image: repoAsset("site/assets/current-site/lemon_1.jpg"),
      alt: "Lemon meringue cheesecake"
    },
    {
      key: "caramel",
      name: "Caramel",
      copy: "Toasty caramel notes with a polished finish.",
      image: repoAsset("site/assets/current-site/Caramel.jpeg"),
      alt: "Caramel cheesecake"
    },
    {
      key: "ube",
      name: "Ube",
      copy: "Earthy, mellow and unmistakably purple.",
      image: repoAsset("site/assets/current-site/EDIT BARKADA.png"),
      alt: "Ube cheesecake collaboration"
    }
  ];

  const DEFAULT_FORMATS = [
    {
      title: "Birthday Suit",
      copy: "Party-ready and playful",
      image: repoAsset("assets/generated-campaign/02-birthday-suit.png"),
      url: "/cakes/birthday-suit"
    },
    {
      title: "Artisan",
      copy: "Polished centerpiece",
      image: repoAsset("assets/generated-campaign/03-artisan.png"),
      url: "/cakes/artisan"
    },
    {
      title: "Canvas",
      copy: "Your design on cake",
      image: repoAsset("assets/generated-campaign/04-canvas.png"),
      url: "/cakes/canvas"
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
      return [
        "eyebrow",
        "title",
        "copy",
        "cakes-url",
        "flavors-url",
        "drop-url",
        "initial-flavor"
      ];
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.selectedFlavor = "classic";
    }

    connectedCallback() {
      installFonts();
      this.toggleAttribute("data-wix-frame", IS_WIX_FRAME);
      this.selectedFlavor = this.normalizedInitialFlavor();
      this.render();
      this.bindEvents();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (!this.isConnected || oldValue === newValue) return;
      if (name === "initial-flavor") this.selectedFlavor = this.normalizedInitialFlavor();
      this.render();
      this.bindEvents();
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

    normalizedInitialFlavor() {
      const requested = this.value("initial-flavor", "classic").toLowerCase();
      return DEFAULT_FLAVORS.some((item) => item.key === requested) ? requested : "classic";
    }

    selectedItem() {
      return DEFAULT_FLAVORS.find((item) => item.key === this.selectedFlavor) || DEFAULT_FLAVORS[0];
    }

    render() {
      const eyebrow = this.value("eyebrow", "Step 1 of 2");
      const title = this.value("title", "Choose your flavor.");
      const copy = this.value(
        "copy",
        "Select one flavor, then choose the cake type that suits the occasion."
      );
      const cakesUrl = this.value("cakes-url", "/cakes");
      const flavorsUrl = this.value("flavors-url", "/flavors");
      const dropUrl = this.value("drop-url", "/cakes/flavor-drop");
      const selected = this.selectedItem();

      const flavorChoices = DEFAULT_FLAVORS.map((item) => `
        <button
          class="flavor-choice${item.key === this.selectedFlavor ? " is-active" : ""}"
          type="button"
          data-flavor-choice="${this.escape(item.key)}"
          aria-pressed="${String(item.key === this.selectedFlavor)}"
        >
          <img src="${this.escape(item.image)}" alt="${this.escape(item.alt)}" loading="lazy" decoding="async">
          <span class="flavor-choice-copy">
            <h3>${this.escape(item.name)}</h3>
            <p>${this.escape(item.copy)}</p>
          </span>
        </button>
      `).join("");

      const formatLinks = DEFAULT_FORMATS.map((item) => {
        const href = `${item.url}?flavor=${encodeURIComponent(this.selectedFlavor)}`;
        return `
          <a class="format-link" href="${this.escape(href)}" target="_top">
            <img src="${this.escape(item.image)}" alt="${this.escape(item.title)}" loading="lazy" decoding="async">
            <span>
              <strong>${this.escape(item.title)}</strong>
              <small>${this.escape(item.copy)}</small>
            </span>
            <span aria-hidden="true">→</span>
          </a>
        `;
      }).join("");

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            --orange: #ed6011;
            --cream: #fdf3e6;
            --yellow: #f4c24a;
            --brown: #3d2416;
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
          button { color: inherit; font: inherit; cursor: pointer; }
          img { display: block; max-width: 100%; }

          .section {
            width: 100%;
            height: 100%;
            min-height: 0;
            padding: clamp(76px, 9vw, 130px) var(--pad);
            overflow: hidden;
            background: var(--cream);
            border-bottom: 2px solid var(--brown);
          }

          :host([data-wix-frame]) .section {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
          }

          .category-nav {
            margin-bottom: 45px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            overflow: hidden;
            border: 2px solid var(--brown);
            border-radius: 14px;
          }

          .category-nav a {
            padding: 18px;
            background: #fff;
            font-size: 11px;
            font-weight: 850;
            text-align: center;
            text-transform: uppercase;
          }

          .category-nav a:first-child { border-right: 2px solid var(--brown); }
          .category-nav a.active,
          .category-nav a:hover,
          .category-nav a:focus-visible { background: var(--yellow); }

          .section-heading {
            margin-bottom: 42px;
            display: flex;
            align-items: end;
            justify-content: space-between;
            gap: 30px;
          }

          .eyebrow {
            margin: 0 0 17px;
            color: #a84c09;
            font-size: 12px;
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
            font-size: clamp(48px, 6vw, 88px);
            line-height: 1;
          }

          .section-heading > p {
            max-width: 520px;
            margin: 0;
            font-size: 16px;
            line-height: 1.6;
          }

          .flavor-journey {
            display: grid;
            grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.7fr);
            gap: 24px;
            align-items: start;
          }

          .flavor-choice-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }

          .flavor-choice {
            position: relative;
            min-height: 150px;
            padding: 0;
            display: grid;
            grid-template-columns: 130px 1fr;
            gap: 18px;
            align-items: center;
            overflow: hidden;
            border: 2px solid var(--brown);
            background: #fff;
            text-align: left;
          }

          .flavor-choice img {
            width: 130px;
            height: 100%;
            min-height: 150px;
            object-fit: cover;
            border-right: 2px solid var(--brown);
          }

          .flavor-choice-copy { padding: 18px 18px 18px 0; }

          .flavor-choice h3 {
            margin-bottom: 7px;
            font-size: 25px;
          }

          .flavor-choice p {
            margin: 0;
            font-size: 12px;
            line-height: 1.45;
          }

          .flavor-choice::after {
            content: "";
            position: absolute;
            inset: 7px;
            border: 3px solid transparent;
            pointer-events: none;
          }

          .flavor-choice.is-active { background: var(--yellow); }
          .flavor-choice.is-active::after { border-color: var(--orange); }

          .flavor-choice:focus-visible,
          .format-link:focus-visible,
          .category-nav a:focus-visible {
            outline: 4px solid var(--orange);
            outline-offset: 2px;
          }

          .drop-choice {
            grid-column: 1 / -1;
            color: var(--cream);
            background: var(--brown);
          }

          .flavor-format-panel {
            position: sticky;
            top: 22px;
            padding: 30px;
            border: 2px solid var(--brown);
            background: var(--orange);
            color: #fff;
          }

          .flavor-format-panel .eyebrow { color: var(--yellow); }

          .flavor-format-panel h2 {
            font-size: clamp(40px, 4.2vw, 66px);
          }

          .format-links {
            margin-top: 28px;
            display: grid;
            gap: 10px;
          }

          .format-link {
            padding: 12px;
            display: grid;
            grid-template-columns: 64px 1fr auto;
            align-items: center;
            gap: 15px;
            border: 2px solid var(--brown);
            background: var(--cream);
            color: var(--brown);
          }

          .format-link:hover { background: var(--yellow); }

          .format-link img {
            width: 64px;
            height: 64px;
            object-fit: cover;
            border: 1px solid var(--brown);
          }

          .format-link strong {
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 17px;
            text-transform: uppercase;
          }

          .format-link small {
            display: block;
            margin-top: 4px;
            font-size: 10px;
          }

          .format-link > span:last-child { font-size: 20px; }

          @media (max-width: 980px) {
            .flavor-journey { grid-template-columns: 1fr; }
            .flavor-format-panel { position: static; }
            .flavor-choice { grid-template-columns: 100px 1fr; }
            .flavor-choice img { width: 100px; }
          }

          @media (max-width: 680px) {
            .section { padding: 70px 20px; }
            .category-nav { margin-bottom: 30px; }
            .section-heading { display: block; }
            .section-heading > p { margin-top: 18px; }
            h2 { font-size: 49px; line-height: 1.02; }

            .flavor-choice-grid {
              display: flex;
              overflow-x: auto;
              scroll-snap-type: x mandatory;
              padding-bottom: 12px;
            }

            .flavor-choice {
              flex: 0 0 82vw;
              scroll-snap-align: start;
            }

            .drop-choice {
              flex: 0 0 82vw;
              grid-column: auto;
            }

            .flavor-format-panel { padding: 25px 20px; }
            .format-link { grid-template-columns: 54px 1fr auto; }
            .format-link img { width: 54px; height: 54px; }
          }
        </style>

        <section class="section" id="choose-format" aria-labelledby="queso-flavor-formats-title">
          <nav class="category-nav" aria-label="Shop navigation">
            <a href="${this.escape(cakesUrl)}" target="_top">Shop by cake type</a>
            <a class="active" href="${this.escape(flavorsUrl)}" target="_top" aria-current="page">Shop by flavor</a>
          </nav>

          <header class="section-heading">
            <div>
              <p class="eyebrow">${this.escape(eyebrow)}</p>
              <h2 id="queso-flavor-formats-title">${this.escape(title)}</h2>
            </div>
            <p>${this.escape(copy)}</p>
          </header>

          <div class="flavor-journey">
            <div class="flavor-choice-grid">
              ${flavorChoices}

              <a class="flavor-choice drop-choice" href="${this.escape(dropUrl)}" target="_top">
                <img src="${this.escape(repoAsset("site/assets/current-site/lotus-biscoff-main.png"))}" alt="This month's Lotus Biscoff flavor drop" loading="lazy" decoding="async">
                <span class="flavor-choice-copy">
                  <h3>This month's drop</h3>
                  <p>Lotus Biscoff is a separate limited release.</p>
                </span>
              </a>
            </div>

            <aside class="flavor-format-panel">
              <p class="eyebrow">Step 2 of 2</p>
              <h2><span data-selected-flavor>${this.escape(selected.name)}</span>, your way.</h2>
              <div class="format-links">${formatLinks}</div>
            </aside>
          </div>
        </section>
      `;
    }

    bindEvents() {
      this.shadowRoot.querySelectorAll("[data-flavor-choice]").forEach((choice) => {
        choice.addEventListener("click", () => {
          const flavor = choice.getAttribute("data-flavor-choice");
          if (!flavor || flavor === this.selectedFlavor) return;
          this.selectedFlavor = flavor;
          this.render();
          this.bindEvents();
        });
      });
    }
  }

  if (!customElements.get("queso-flavor-formats")) {
    customElements.define("queso-flavor-formats", QuesoFlavorFormats);
  }
})();
