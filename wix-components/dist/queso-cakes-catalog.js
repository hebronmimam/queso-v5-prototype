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
      tagClass: "",
      title: "Birthday Suit",
      copy: "Naked, playful and ready for the candles.",
      price: "From HKD 368",
      image: repoAsset("assets/generated-campaign/02-birthday-suit.png"),
      imageAlt: "Birthday Suit cheesecake",
      primaryLabel: "Add to cart",
      primaryUrl: "/checkout",
      secondaryLabel: "See details",
      secondaryUrl: "/cakes/birthday-suit",
      productName: "Birthday Suit",
      productPrice: "368"
    },
    {
      tag: "Polished",
      tagClass: "pink",
      title: "Artisan",
      copy: "A refined centerpiece with an elevated finish.",
      price: "From HKD 378",
      image: repoAsset("assets/generated-campaign/03-artisan.png"),
      imageAlt: "Artisan cheesecake",
      primaryLabel: "Add to cart",
      primaryUrl: "/checkout",
      secondaryLabel: "See details",
      secondaryUrl: "/cakes/artisan",
      productName: "Artisan",
      productPrice: "378"
    },
    {
      tag: "Personalized",
      tagClass: "orange",
      title: "Canvas",
      copy: "Your image or text, previewed before ordering.",
      price: "HKD 498",
      image: repoAsset("assets/generated-campaign/04-canvas.png"),
      imageAlt: "Canvas personalized cheesecake",
      primaryLabel: "Customize",
      primaryUrl: "/cakes/canvas#customize",
      secondaryLabel: "See details",
      secondaryUrl: "/cakes/canvas",
      productName: "Canvas",
      productPrice: "498"
    },
    {
      tag: "Leaving soon",
      tagClass: "dark",
      title: "This Month's Flavor Drop",
      copy: "Lotus Biscoff cheesecake with a spiced biscuit finish.",
      price: "HKD 528",
      image: repoAsset("site/assets/current-site/lotus-biscoff-main.png"),
      imageAlt: "Lotus Biscoff cheesecake",
      primaryLabel: "Add to cart",
      primaryUrl: "/checkout",
      secondaryLabel: "See details",
      secondaryUrl: "/cakes/flavor-drop",
      productName: "Lotus Biscoff Cheesecake",
      productPrice: "528"
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
        "type-label",
        "type-url",
        "flavor-label",
        "flavor-url",
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
          `item-${index}-product-price`,
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
          productPrice: this.value(`item-${number}-product-price`, fallback.productPrice),
          productId: this.value(`item-${number}-product-id`, "")
        };
      });
    }

    render() {
      const eyebrow = this.value("eyebrow", "The complete lineup");
      const title = this.value("title", "Choose your cake.");
      const copy = this.value(
        "copy",
        "Quick add the standard option, or open details to select flavor, size and quantity."
      );
      const typeLabel = this.value("type-label", "Shop by cake type");
      const typeUrl = this.value("type-url", "/cakes");
      const flavorLabel = this.value("flavor-label", "Shop by flavor");
      const flavorUrl = this.value("flavor-url", "/flavors");

      const cards = this.items.map((item, index) => `
        <article class="product-card">
          <img src="${this.escape(item.image)}" alt="${this.escape(item.imageAlt)}" loading="lazy" decoding="async">
          <div class="product-body">
            <span class="tag tag--${this.escape(item.tagClass)}">${this.escape(item.tag)}</span>
            <h3>${this.escape(item.title)}</h3>
            <p>${this.escape(item.copy)}</p>
            <span class="price">${this.escape(item.price)}</span>
            <div class="card-actions">
              <a class="button button--primary" href="${this.escape(item.primaryUrl)}" data-primary-action="${index}">${this.escape(item.primaryLabel)}</a>
              <a class="button" href="${this.escape(item.secondaryUrl)}">${this.escape(item.secondaryLabel)}</a>
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
          }

          :host([data-wix-frame]) { height: auto; }
          *, *::before, *::after { box-sizing: border-box; }
          a { color: inherit; text-decoration: none; }
          img { display: block; max-width: 100%; }

          .section {
            width: 100%;
            height: 100%;
            min-height: 0;
            padding: clamp(76px, 9vw, 130px) var(--pad);
            overflow: hidden;
            background: var(--cream);
          }

          :host([data-wix-frame]) .section {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
          }

          .category-nav {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            margin-bottom: 45px;
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

          .section-copy {
            max-width: 520px;
            margin: 0;
            font-size: 16px;
            line-height: 1.6;
          }

          .product-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 18px;
          }

          .product-card {
            min-width: 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border: 2px solid var(--brown);
            border-radius: 18px;
            background: #fff;
          }

          .product-card > img {
            width: 100%;
            aspect-ratio: 1;
            object-fit: cover;
            border-bottom: 2px solid var(--brown);
          }

          .product-body {
            flex: 1;
            padding: 19px;
            display: flex;
            flex-direction: column;
          }

          .tag {
            align-self: flex-start;
            padding: 6px 9px;
            border: 1.5px solid var(--brown);
            border-radius: 999px;
            background: var(--yellow);
            font-size: 8px;
            font-weight: 900;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .tag--pink { background: var(--pink); }
          .tag--orange { background: var(--orange); color: #fff; }
          .tag--dark { background: var(--brown); color: #fff; }

          .product-card h3 {
            margin: 16px 0 9px;
            font-size: clamp(23px, 2.2vw, 32px);
            line-height: 1.03;
          }

          .product-card p {
            margin: 0 0 16px;
            font-size: 12px;
            line-height: 1.5;
          }

          .price {
            margin-top: auto;
            font-size: 13px;
            font-weight: 850;
          }

          .card-actions {
            margin-top: 17px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 7px;
          }

          .button {
            min-height: 42px;
            padding: 0 15px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 2px solid var(--brown);
            border-radius: 10px;
            background: #fff;
            font-size: 9px;
            font-weight: 850;
            letter-spacing: 0.05em;
            text-align: center;
            text-transform: uppercase;
            transition: transform 150ms ease;
          }

          .button:hover,
          .button:focus-visible { transform: translateY(-2px); }
          .button:focus-visible { outline: 3px solid var(--yellow); outline-offset: 2px; }
          .button--primary { background: var(--orange); color: #fff; }

          @media (max-width: 980px) {
            .product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          }

          @media (max-width: 680px) {
            .section { padding: 70px 20px; }
            .category-nav { margin-bottom: 30px; }
            .section-heading { display: block; }
            .section-copy { margin-top: 18px; }
            h2 { font-size: 49px; line-height: 1.02; }
            .product-grid { grid-template-columns: 1fr; }
          }

          @media (prefers-reduced-motion: reduce) {
            .button { transition: none; }
          }
        </style>

        <section class="section" id="shop" aria-labelledby="queso-cakes-catalog-title">
          <nav class="category-nav" aria-label="Shop navigation">
            <a class="active" href="${this.escape(typeUrl)}">${this.escape(typeLabel)}</a>
            <a href="${this.escape(flavorUrl)}">${this.escape(flavorLabel)}</a>
          </nav>

          <header class="section-heading">
            <div>
              <p class="eyebrow">${this.escape(eyebrow)}</p>
              <h2 id="queso-cakes-catalog-title">${this.escape(title)}</h2>
            </div>
            <p class="section-copy">${this.escape(copy)}</p>
          </header>

          <div class="product-grid">${cards}</div>
        </section>
      `;
    }

    bindEvents() {
      this.shadowRoot.querySelectorAll("[data-primary-action]").forEach((link) => {
        link.addEventListener("click", (event) => {
          const index = Number(link.dataset.primaryAction);
          const item = this.items[index];
          const isAddToCart = item && item.primaryLabel.trim().toLowerCase() === "add to cart";
          if (!isAddToCart) return;

          const bridgeEnabled = ["true", "1", "on", "yes"].includes(
            (this.getAttribute("cart-bridge") || "").toLowerCase()
          );

          if (bridgeEnabled) event.preventDefault();

          const customEvent = new CustomEvent("queso-add-to-cart", {
            bubbles: true,
            composed: true,
            cancelable: true,
            detail: {
              itemIndex: index,
              productName: item.productName,
              productId: item.productId,
              productPrice: item.productPrice,
              fallbackUrl: item.primaryUrl
            }
          });

          this.dispatchEvent(customEvent);
          if (customEvent.defaultPrevented) event.preventDefault();
        });
      });
    }
  }

  if (!customElements.get("queso-cakes-catalog")) {
    customElements.define("queso-cakes-catalog", QuesoCakesCatalog);
  }
})();
