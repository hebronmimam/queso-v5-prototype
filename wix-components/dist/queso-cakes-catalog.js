(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const repoAsset = (path) => new URL(path, REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

  const DEFAULT_ITEMS = [
    {
      tag: "Celebration",
      tagClass: "yellow",
      title: "Birthday Suit",
      copy: "Naked, playful and ready for the candles. A celebration-first cheesecake made for birthdays, tiny wins and everything in between.",
      price: "From HKD 368",
      image: repoAsset("assets/generated-campaign/02-birthday-suit.png"),
      imageAlt: "Birthday Suit cheesecake",
      accent: "#f4c24a",
      primaryLabel: "Add to cart",
      primaryUrl: "/checkout",
      secondaryLabel: "See details",
      secondaryUrl: "/cakes/birthday-suit",
      productName: "Birthday Suit"
    },
    {
      tag: "Polished",
      tagClass: "pink",
      title: "Artisan",
      copy: "A refined centerpiece with a caramelized finish. Built for dinner tables, gifting and moments that deserve something polished.",
      price: "From HKD 378",
      image: repoAsset("assets/generated-campaign/03-artisan.png"),
      imageAlt: "Artisan cheesecake",
      accent: "#efa3b5",
      primaryLabel: "Add to cart",
      primaryUrl: "/checkout",
      secondaryLabel: "See details",
      secondaryUrl: "/cakes/artisan",
      productName: "Artisan"
    },
    {
      tag: "Personalized",
      tagClass: "orange",
      title: "Canvas",
      copy: "Your image, your message and your moment. Upload the artwork and turn the cheesecake into something completely personal.",
      price: "HKD 498",
      image: repoAsset("assets/generated-campaign/04-canvas.png"),
      imageAlt: "Canvas personalized cheesecake",
      accent: "#ed6011",
      primaryLabel: "Customize",
      primaryUrl: "/cakes/canvas#customize",
      secondaryLabel: "See details",
      secondaryUrl: "/cakes/canvas",
      productName: "Canvas"
    },
    {
      tag: "Limited drop",
      tagClass: "dark",
      title: "Flavor Drop",
      copy: "A rotating monthly flavor made in limited batches. This month: Lotus Biscoff cheesecake with a deep caramelized finish.",
      price: "HKD 528",
      image: repoAsset("site/assets/current-site/lotus-biscoff-main.png"),
      imageAlt: "Lotus Biscoff flavor drop cheesecake",
      accent: "#af5309",
      primaryLabel: "Add to cart",
      primaryUrl: "/checkout",
      secondaryLabel: "See details",
      secondaryUrl: "/cakes/flavor-drop",
      productName: "Lotus Biscoff Cheesecake"
    }
  ];

  function installFonts() {
    if (document.head.querySelector("style[data-queso-cakes-catalog-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoCakesCatalogFonts = "true";
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

  class QuesoCakesCatalog extends HTMLElement {
    static get observedAttributes() {
      const attributes = [
        "eyebrow",
        "title",
        "copy",
        "cart-bridge"
      ];

      for (let index = 1; index <= 4; index += 1) {
        attributes.push(
          `item-${index}-tag`,
          `item-${index}-title`,
          `item-${index}-copy`,
          `item-${index}-price`,
          `item-${index}-image`,
          `item-${index}-image-alt`,
          `item-${index}-primary-label`,
          `item-${index}-primary-url`,
          `item-${index}-secondary-label`,
          `item-${index}-secondary-url`,
          `item-${index}-product-name`,
          `item-${index}-product-id`
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
      this.bindEvents();
    }

    attributeChangedCallback() {
      if (!this.isConnected) return;
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

    get items() {
      return DEFAULT_ITEMS.map((fallback, index) => {
        const number = index + 1;
        return {
          ...fallback,
          tag: this.value(`item-${number}-tag`, fallback.tag),
          title: this.value(`item-${number}-title`, fallback.title),
          copy: this.value(`item-${number}-copy`, fallback.copy),
          price: this.value(`item-${number}-price`, fallback.price),
          image: this.value(`item-${number}-image`, fallback.image),
          imageAlt: this.value(`item-${number}-image-alt`, fallback.imageAlt),
          primaryLabel: this.value(`item-${number}-primary-label`, fallback.primaryLabel),
          primaryUrl: this.value(`item-${number}-primary-url`, fallback.primaryUrl),
          secondaryLabel: this.value(`item-${number}-secondary-label`, fallback.secondaryLabel),
          secondaryUrl: this.value(`item-${number}-secondary-url`, fallback.secondaryUrl),
          productName: this.value(`item-${number}-product-name`, fallback.productName),
          productId: this.value(`item-${number}-product-id`, "")
        };
      });
    }

    render() {
      const eyebrow = this.value("eyebrow", "Four personalities. One serious cheesecake habit.");
      const title = this.value("title", "Choose your cake.");
      const copy = this.value(
        "copy",
        "Pick the one that fits the moment. Each cake is made fresh in Hong Kong in small batches."
      );

      const cards = this.items.map((item, index) => `
        <article class="cake-card" style="--card-accent:${this.escape(item.accent)}">
          <div class="cake-card__media">
            <img
              src="${this.escape(item.image)}"
              alt="${this.escape(item.imageAlt)}"
              loading="lazy"
              decoding="async"
            >
            <span class="cake-card__number" aria-hidden="true">0${index + 1}</span>
          </div>

          <div class="cake-card__body">
            <span class="tag tag--${this.escape(item.tagClass)}">${this.escape(item.tag)}</span>
            <h3>${this.escape(item.title)}</h3>
            <p class="cake-card__copy">${this.escape(item.copy)}</p>
            <p class="price">${this.escape(item.price)}</p>

            <div class="cake-card__actions">
              <a
                class="button button--primary"
                href="${this.escape(item.primaryUrl)}"
                data-primary-action="${index}"
              >${this.escape(item.primaryLabel)}</a>

              <a class="button button--secondary" href="${this.escape(item.secondaryUrl)}">
                ${this.escape(item.secondaryLabel)}
              </a>
            </div>
          </div>
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

          .catalog {
            width: 100%;
            height: 100%;
            min-height: 0;
            padding: clamp(72px, 8vw, 120px) var(--pad);
            overflow: hidden;
            background: var(--cream);
            border-bottom: 2px solid var(--brown);
          }

          :host([data-wix-frame]) .catalog {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
          }

          .catalog-heading {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(260px, 0.42fr);
            gap: 48px;
            align-items: end;
            margin-bottom: 48px;
          }

          .eyebrow {
            margin: 0 0 16px;
            color: #a84c09;
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.13em;
            line-height: 1.4;
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
            max-width: 850px;
            font-size: clamp(56px, 7vw, 102px);
            line-height: 0.94;
          }

          .intro-copy {
            margin: 0 0 5px;
            font-size: clamp(15px, 1.3vw, 18px);
            line-height: 1.55;
          }

          .cake-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 22px;
          }

          .cake-card {
            display: grid;
            grid-template-columns: minmax(0, 1.08fr) minmax(300px, 0.92fr);
            min-width: 0;
            min-height: 500px;
            overflow: hidden;
            border: 2px solid var(--brown);
            border-radius: 22px;
            background: #fff;
          }

          .cake-card__media {
            position: relative;
            min-width: 0;
            min-height: 0;
            overflow: hidden;
            background: var(--card-accent);
            border-right: 2px solid var(--brown);
          }

          .cake-card__media img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 350ms ease;
          }

          .cake-card:hover .cake-card__media img,
          .cake-card:focus-within .cake-card__media img {
            transform: scale(1.025);
          }

          .cake-card__number {
            position: absolute;
            left: 16px;
            bottom: 12px;
            color: var(--cream);
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 48px;
            font-weight: 900;
            line-height: 1;
            text-shadow: 0 2px 0 rgba(61, 36, 22, 0.3);
          }

          .cake-card__body {
            min-width: 0;
            padding: 28px;
            display: flex;
            flex-direction: column;
          }

          .tag {
            align-self: flex-start;
            padding: 7px 10px;
            border: 1.5px solid var(--brown);
            border-radius: 999px;
            font-size: 8px;
            font-weight: 900;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .tag--yellow {
            background: var(--yellow);
          }

          .tag--pink {
            background: var(--pink);
          }

          .tag--orange {
            background: var(--orange);
            color: #fff;
          }

          .tag--dark {
            background: var(--brown);
            color: var(--cream);
          }

          h3 {
            margin-top: 20px;
            font-size: clamp(34px, 3vw, 54px);
            line-height: 0.98;
          }

          .cake-card__copy {
            margin: 18px 0 0;
            font-size: 14px;
            line-height: 1.55;
          }

          .price {
            margin: auto 0 0;
            padding-top: 28px;
            font-size: 12px;
            font-weight: 850;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }

          .cake-card__actions {
            display: grid;
            grid-template-columns: 1fr;
            gap: 9px;
            margin-top: 16px;
          }

          .button {
            min-height: 48px;
            padding: 0 18px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 2px solid var(--brown);
            border-radius: 10px;
            font-size: 10px;
            font-weight: 850;
            letter-spacing: 0.05em;
            text-align: center;
            text-transform: uppercase;
            transition: transform 150ms ease, background 150ms ease;
          }

          .button:hover,
          .button:focus-visible {
            transform: translateY(-2px);
          }

          .button:focus-visible {
            outline: 3px solid var(--yellow);
            outline-offset: 3px;
          }

          .button--primary {
            background: var(--orange);
            color: #fff;
          }

          .button--secondary {
            background: var(--cream);
          }

          @media (max-width: 1180px) {
            .catalog-heading {
              grid-template-columns: 1fr;
              gap: 18px;
            }

            .intro-copy {
              max-width: 620px;
            }

            .cake-card {
              grid-template-columns: 1fr;
              grid-template-rows: 330px 1fr;
              min-height: 710px;
            }

            .cake-card__media {
              border-right: 0;
              border-bottom: 2px solid var(--brown);
            }
          }

          @media (max-width: 760px) {
            .catalog {
              padding: 58px 20px;
            }

            .catalog-heading {
              margin-bottom: 32px;
            }

            .eyebrow {
              font-size: 9px;
            }

            h2 {
              font-size: clamp(48px, 14vw, 68px);
            }

            .intro-copy {
              font-size: 15px;
            }

            .cake-grid {
              grid-template-columns: 1fr;
              gap: 18px;
            }

            .cake-card {
              grid-template-rows: 340px auto;
              min-height: 620px;
              border-radius: 18px;
            }

            .cake-card__body {
              padding: 22px;
            }

            h3 {
              font-size: 40px;
            }

            .cake-card__copy {
              font-size: 14px;
            }
          }

          @media (max-width: 390px) {
            .cake-card {
              grid-template-rows: 300px auto;
            }

            h3 {
              font-size: 36px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .cake-card__media img,
            .button {
              transition: none;
            }
          }
        </style>

        <section class="catalog" aria-labelledby="queso-cakes-catalog-title">
          <header class="catalog-heading">
            <div>
              <p class="eyebrow">${this.escape(eyebrow)}</p>
              <h2 id="queso-cakes-catalog-title">${this.escape(title)}</h2>
            </div>
            <p class="intro-copy">${this.escape(copy)}</p>
          </header>

          <div class="cake-grid">
            ${cards}
          </div>
        </section>
      `;
    }

    bindEvents() {
      const bridgeEnabled = ["true", "1", "on", "yes"].includes(
        (this.getAttribute("cart-bridge") || "").toLowerCase()
      );

      this.shadowRoot.querySelectorAll("[data-primary-action]").forEach((link) => {
        link.addEventListener("click", (event) => {
          const index = Number(link.dataset.primaryAction);
          const item = this.items[index];

          if (!item || item.primaryLabel.toLowerCase() !== "add to cart") return;
          if (!bridgeEnabled) return;

          event.preventDefault();

          this.dispatchEvent(new CustomEvent("queso-add-to-cart", {
            bubbles: true,
            composed: true,
            detail: {
              itemIndex: index,
              productName: item.productName,
              productId: item.productId,
              productPrice: item.price
            }
          }));
        });
      });
    }
  }

  if (!customElements.get("queso-cakes-catalog")) {
    customElements.define("queso-cakes-catalog", QuesoCakesCatalog);
  }
})();
