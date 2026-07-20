(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const repoAsset = (path) => new URL(path, REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

  const FLAVOR_INGREDIENTS = {
    classic: "Key ingredients: cream cheese, egg, sugar, flour and butter.",
    chocolate: "Key ingredients: cream cheese, egg, sugar, flour, butter and premium Valrhona chocolate.",
    lemon: "Key ingredients: cream cheese, egg, sugar, flour, butter and lemon.",
    caramel: "Key ingredients: cream cheese, egg, sugar, flour, butter and caramel.",
    ube: "Key ingredients: cream cheese, egg, sugar, flour, butter and ube."
  };

  const PRESETS = {
    birthday: {
      tag: "Celebration",
      tagClass: "",
      title: "Birthday Suit",
      lead: "Naked, playful and ready for birthdays, tiny wins and big news.",
      priceLabel: "From HKD 368",
      price: 368,
      productName: "Birthday Suit",
      imageOne: repoAsset("assets/generated-campaign/02-birthday-suit.png"),
      imageOneAlt: "Birthday Suit main view",
      imageTwo: repoAsset("site/assets/v3-originals/birthday-slice-detail.png"),
      imageTwoAlt: "Birthday Suit detail",
      imageThree: repoAsset("site/assets/v3-originals/hero-birthday-wide.png"),
      imageThreeAlt: "Birthday Suit serving view",
      productInfo: "Birthday Suit is Queso's party-ready format: the family cheesecake recipe, kept playful and ready for the candles."
    },
    artisan: {
      tag: "Polished",
      tagClass: "pink",
      title: "Artisan",
      lead: "A polished centerpiece with an elevated finish.",
      priceLabel: "From HKD 378",
      price: 378,
      productName: "Artisan",
      imageOne: repoAsset("assets/generated-campaign/03-artisan.png"),
      imageOneAlt: "Artisan main view",
      imageTwo: repoAsset("site/assets/v3-originals/artisan-chocolate-detail.png"),
      imageTwoAlt: "Artisan detail",
      imageThree: repoAsset("site/assets/v3-originals/hero-artisan-wide.png"),
      imageThreeAlt: "Artisan serving view",
      productInfo: "Artisan is Queso's refined format. The classic variation is finished with desiccated coconut; chocolate variations use premium Valrhona chocolate."
    }
  };

  function installFonts() {
    if (document.head.querySelector("style[data-queso-product-detail-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoProductDetailFonts = "true";
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

  class QuesoProductDetail extends HTMLElement {
    static get observedAttributes() {
      return [
        "product",
        "tag",
        "title",
        "lead",
        "price-label",
        "product-price",
        "product-name",
        "product-id",
        "image-1",
        "image-1-alt",
        "image-2",
        "image-2-alt",
        "image-3",
        "image-3-alt",
        "product-information",
        "ingredients-copy",
        "care-copy",
        "arrival-copy",
        "selected-flavor",
        "selected-size",
        "cart-url",
        "cart-bridge"
      ];
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.activeImage = 0;
      this.selectedFlavor = "classic";
      this.selectedSize = "standard";
    }

    connectedCallback() {
      installFonts();
      this.toggleAttribute("data-wix-frame", IS_WIX_FRAME);
      this.syncInitialSelections();
      this.render();
      this.bindEvents();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (!this.isConnected || oldValue === newValue) return;

      if (name === "product") this.activeImage = 0;
      if (["product", "selected-flavor", "selected-size"].includes(name)) {
        this.syncInitialSelections();
      }

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

    get preset() {
      return PRESETS[this.value("product", "birthday").toLowerCase()] || PRESETS.birthday;
    }

    get data() {
      const preset = this.preset;
      return {
        ...preset,
        tag: this.value("tag", preset.tag),
        title: this.value("title", preset.title),
        lead: this.value("lead", preset.lead),
        priceLabel: this.value("price-label", preset.priceLabel),
        price: Number(this.value("product-price", String(preset.price))) || preset.price,
        productName: this.value("product-name", preset.productName),
        productId: this.value("product-id", ""),
        images: [
          {
            src: this.value("image-1", preset.imageOne),
            alt: this.value("image-1-alt", preset.imageOneAlt)
          },
          {
            src: this.value("image-2", preset.imageTwo),
            alt: this.value("image-2-alt", preset.imageTwoAlt)
          },
          {
            src: this.value("image-3", preset.imageThree),
            alt: this.value("image-3-alt", preset.imageThreeAlt)
          }
        ],
        productInfo: this.value("product-information", preset.productInfo),
        ingredientsCopy: this.value(
          "ingredients-copy",
          "Key ingredients change with the selected flavor. Cakes contain dairy, egg and wheat; contact Queso before ordering if you have an allergy."
        ),
        careCopy: this.value(
          "care-copy",
          "Best served chilled. For a creamier texture, let it sit for 10 minutes before serving. Store in the fridge for up to 7 days, or freeze for up to 2 weeks. Do not reheat."
        ),
        arrivalCopy: this.value(
          "arrival-copy",
          "Choose delivery or pickup during checkout. Queso confirms each order before processing and shares the final handoff details by email."
        ),
        cartUrl: this.value("cart-url", "/checkout")
      };
    }

    syncInitialSelections() {
      const validFlavors = Object.keys(FLAVOR_INGREDIENTS);
      const validSizes = ["standard", "large"];

      let queryFlavor = "";
      try {
        queryFlavor = new URL(document.referrer || window.location.href).searchParams.get("flavor") || "";
      } catch {
        queryFlavor = "";
      }

      const flavor = this.value("selected-flavor", queryFlavor || this.selectedFlavor).toLowerCase();
      const size = this.value("selected-size", this.selectedSize).toLowerCase();

      this.selectedFlavor = validFlavors.includes(flavor) ? flavor : "classic";
      this.selectedSize = validSizes.includes(size) ? size : "standard";
    }

    render() {
      const data = this.data;
      const activeImage = data.images[this.activeImage] || data.images[0];
      const flavorButtons = [
        ["classic", "Classic"],
        ["chocolate", "Chocolate"],
        ["lemon", "Lemon"],
        ["caramel", "Caramel"],
        ["ube", "Ube"]
      ].map(([value, label]) => `
        <button
          class="option${this.selectedFlavor === value ? " is-active" : ""}"
          type="button"
          data-flavor="${value}"
          aria-pressed="${String(this.selectedFlavor === value)}"
        >${label}</button>
      `).join("");

      const sizeButtons = [
        ["standard", "Standard"],
        ["large", "Large"]
      ].map(([value, label]) => `
        <button
          class="option${this.selectedSize === value ? " is-active" : ""}"
          type="button"
          data-size="${value}"
          aria-pressed="${String(this.selectedSize === value)}"
        >${label}</button>
      `).join("");

      const thumbs = data.images.map((image, index) => `
        <button
          class="thumb${index === this.activeImage ? " is-active" : ""}"
          type="button"
          data-image-index="${index}"
          aria-label="Show product photo ${index + 1}"
          aria-pressed="${String(index === this.activeImage)}"
        >
          <img src="${this.escape(image.src)}" alt="${this.escape(image.alt)}" loading="lazy" decoding="async">
        </button>
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

          :host([data-wix-frame]) { height: auto; }
          *, *::before, *::after { box-sizing: border-box; }
          a { color: inherit; text-decoration: none; }
          button, input { color: inherit; font: inherit; }
          img { display: block; max-width: 100%; }

          .product-page {
            width: 100%;
            height: 100%;
            min-height: 0;
            padding: clamp(40px, 6vw, 80px) var(--pad);
            overflow: hidden;
            background: var(--cream);
          }

          :host([data-wix-frame]) .product-page {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
          }

          .product-layout {
            display: grid;
            grid-template-columns: 1.05fr 0.95fr;
            gap: clamp(35px, 6vw, 85px);
            align-items: start;
          }

          .gallery-shell {
            position: sticky;
            top: 18px;
          }

          .gallery-stage {
            position: relative;
            overflow: hidden;
            border: 2px solid var(--brown);
            background: #fff;
          }

          .gallery-main {
            width: 100%;
            aspect-ratio: 1;
            object-fit: cover;
          }

          .gallery-count {
            position: absolute;
            right: 15px;
            bottom: 15px;
            padding: 7px 10px;
            border: 1px solid var(--brown);
            background: var(--cream);
            font-size: 9px;
            font-weight: 850;
            text-transform: uppercase;
          }

          .thumbs {
            margin-top: 8px;
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 8px;
          }

          .thumb {
            padding: 0;
            border: 0;
            background: transparent;
            cursor: pointer;
            opacity: 0.62;
            transition: opacity 150ms ease, transform 150ms ease;
          }

          .thumb img {
            width: 100%;
            aspect-ratio: 1.2;
            object-fit: cover;
            border: 2px solid var(--brown);
          }

          .thumb:hover,
          .thumb:focus-visible,
          .thumb.is-active {
            opacity: 1;
            transform: translateY(-3px);
          }

          .thumb.is-active img {
            outline: 4px solid var(--orange);
            outline-offset: -4px;
          }

          .thumb:focus-visible,
          .option:focus-visible,
          .add-to-cart:focus-visible,
          input:focus-visible {
            outline: 4px solid var(--orange);
            outline-offset: 2px;
          }

          .product-panel {
            min-width: 0;
            position: sticky;
            top: 25px;
          }

          .tag {
            display: inline-flex;
            padding: 7px 10px;
            border: 1px solid var(--brown);
            border-radius: 999px;
            background: var(--yellow);
            font-size: 9px;
            font-weight: 850;
            text-transform: uppercase;
          }

          .tag.pink { background: var(--pink); }

          h1 {
            margin: 15px 0;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(52px, 5.7vw, 86px);
            font-weight: 900;
            line-height: 1;
            text-transform: uppercase;
          }

          .product-lead {
            margin: 0;
            font-size: 16px;
            line-height: 1.6;
          }

          .product-price {
            display: block;
            margin: 20px 0;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 25px;
          }

          .option-label {
            display: block;
            margin: 22px 0 8px;
            font-size: 10px;
            font-weight: 850;
            letter-spacing: 0.09em;
            text-transform: uppercase;
          }

          .option-row {
            display: flex;
            flex-wrap: wrap;
            gap: 7px;
          }

          .option {
            padding: 10px 13px;
            border: 2px solid var(--brown);
            border-radius: 7px;
            background: #fff;
            font-size: 11px;
            font-weight: 750;
            cursor: pointer;
            box-shadow: none;
          }

          .option.is-active {
            background: var(--yellow);
            outline: 2px solid var(--brown);
            outline-offset: -2px;
          }

          .selection-note {
            margin: 8px 0 0;
            color: #7f4c31;
            font-size: 11px;
            line-height: 1.55;
          }

          .selection-note strong { color: var(--brown); }

          .qty-row {
            margin-top: 23px;
            display: grid;
            grid-template-columns: 100px 1fr;
            gap: 8px;
          }

          .qty-row input {
            width: 100%;
            height: 52px;
            border: 2px solid var(--brown);
            border-radius: 8px;
            background: #fff;
            text-align: center;
          }

          .add-to-cart {
            min-height: 52px;
            padding: 0 20px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 2px solid var(--brown);
            border-radius: 8px;
            background: var(--orange);
            color: #fff;
            font-size: 11px;
            font-weight: 850;
            text-transform: uppercase;
          }

          .detail-stack {
            margin-top: 38px;
            border-top: 2px solid var(--brown);
          }

          details {
            padding: 18px 0;
            border-bottom: 2px solid var(--brown);
          }

          summary {
            cursor: pointer;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 16px;
            text-transform: uppercase;
          }

          details p {
            margin: 14px 0 0;
            font-size: 13px;
            line-height: 1.65;
          }

          @media (max-width: 980px) {
            .product-layout { grid-template-columns: 1fr; }
            .gallery-shell,
            .product-panel { position: static; }
          }

          @media (max-width: 680px) {
            .product-page { padding: 35px 20px; }
            h1 { font-size: 56px; }
            .qty-row { grid-template-columns: 85px 1fr; }
          }
        </style>

        <main class="product-page">
          <div class="product-layout">
            <div class="gallery-shell">
              <div class="gallery-stage">
                <img
                  class="gallery-main"
                  src="${this.escape(activeImage.src)}"
                  alt="${this.escape(activeImage.alt)}"
                  loading="eager"
                  fetchpriority="high"
                  decoding="async"
                >
                <span class="gallery-count">Select a photo</span>
              </div>
              <div class="thumbs">${thumbs}</div>
            </div>

            <section class="product-panel" aria-labelledby="queso-product-title">
              <span class="tag ${this.escape(data.tagClass)}">${this.escape(data.tag)}</span>
              <h1 id="queso-product-title">${this.escape(data.title)}</h1>
              <p class="product-lead">${this.escape(data.lead)}</p>
              <strong class="product-price">${this.escape(data.priceLabel)}</strong>

              <span class="option-label">Choose a flavor</span>
              <div class="option-row" aria-label="Choose a flavor">${flavorButtons}</div>
              <p class="selection-note">
                <strong data-flavor-ingredients>${this.escape(FLAVOR_INGREDIENTS[this.selectedFlavor])}</strong>
                Full allergen information should be confirmed before ordering.
              </p>

              <span class="option-label">Choose a size</span>
              <div class="option-row" aria-label="Choose a size">${sizeButtons}</div>

              <div class="qty-row">
                <input data-quantity aria-label="Quantity" type="number" min="1" value="1">
                <a class="add-to-cart" href="${this.escape(data.cartUrl)}" data-add-to-cart>Add to cart</a>
              </div>

              <div class="detail-stack">
                <details open>
                  <summary>Product information</summary>
                  <p>${this.escape(data.productInfo)}</p>
                </details>
                <details>
                  <summary>Ingredients &amp; allergens</summary>
                  <p>${this.escape(data.ingredientsCopy)}</p>
                </details>
                <details>
                  <summary>Cheesecake care</summary>
                  <p>${this.escape(data.careCopy)}</p>
                </details>
                <details>
                  <summary>When will my cheesecake arrive?</summary>
                  <p>${this.escape(data.arrivalCopy)}</p>
                </details>
              </div>
            </section>
          </div>
        </main>
      `;
    }

    bindEvents() {
      this.shadowRoot.querySelectorAll("[data-image-index]").forEach((button) => {
        button.addEventListener("click", () => {
          const index = Number(button.dataset.imageIndex);
          if (!Number.isFinite(index) || index === this.activeImage) return;
          this.activeImage = index;
          this.render();
          this.bindEvents();
        });
      });

      this.shadowRoot.querySelectorAll("[data-flavor]").forEach((button) => {
        button.addEventListener("click", () => {
          this.selectedFlavor = button.dataset.flavor || "classic";
          this.render();
          this.bindEvents();
        });
      });

      this.shadowRoot.querySelectorAll("[data-size]").forEach((button) => {
        button.addEventListener("click", () => {
          this.selectedSize = button.dataset.size || "standard";
          this.render();
          this.bindEvents();
        });
      });

      const addButton = this.shadowRoot.querySelector("[data-add-to-cart]");
      addButton?.addEventListener("click", (event) => {
        const bridgeEnabled = ["true", "1", "on", "yes"].includes(
          (this.getAttribute("cart-bridge") || "").toLowerCase()
        );

        if (bridgeEnabled) event.preventDefault();

        const quantityInput = this.shadowRoot.querySelector("[data-quantity]");
        const quantity = Math.max(1, Number(quantityInput?.value || 1));
        const data = this.data;

        const customEvent = new CustomEvent("queso-add-to-cart", {
          bubbles: true,
          composed: true,
          cancelable: true,
          detail: {
            productName: data.productName,
            productId: data.productId,
            productPrice: data.price,
            productImage: data.images[0].src,
            flavor: this.selectedFlavor,
            size: this.selectedSize,
            quantity
          }
        });

        this.dispatchEvent(customEvent);
        if (customEvent.defaultPrevented) event.preventDefault();
      });
    }
  }

  if (!customElements.get("queso-product-detail")) {
    customElements.define("queso-product-detail", QuesoProductDetail);
  }
})();
