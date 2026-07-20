(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

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
        "product-data",
        "availability-data",
        "cart-state",
        "cart-message",
        "cart-bridge"
      ];
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.activeImage = 0;
      this.selectedChoices = {};
      this.customTextValues = {};
    }

    connectedCallback() {
      installFonts();
      this.toggleAttribute("data-wix-frame", IS_WIX_FRAME);
      this.syncSelections(true);
      this.render();
      this.bindEvents();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (!this.isConnected || oldValue === newValue) return;

      if (name === "product-data") {
        this.activeImage = 0;
        this.customTextValues = {};
        this.syncSelections(true);
      } else if (name === "availability-data") {
        this.syncSelections(false);
      }

      this.render();
      this.bindEvents();
    }

    value(name, fallback = "") {
      const value = this.getAttribute(name);
      return value === null || value.trim() === "" ? fallback : value.trim();
    }

    parseJson(name, fallback) {
      try {
        const raw = this.value(name, "");
        return raw ? JSON.parse(raw) : fallback;
      } catch (error) {
        console.error(`Queso product: invalid ${name} JSON.`, error);
        return fallback;
      }
    }

    escape(value) {
      return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    get product() {
      return this.parseJson("product-data", null);
    }

    get availability() {
      return this.parseJson("availability-data", {});
    }

    get options() {
      const availabilityOptions = this.availability?.options;
      const productOptions = this.product?.options;
      return Array.isArray(availabilityOptions)
        ? availabilityOptions
        : Array.isArray(productOptions)
          ? productOptions
          : [];
    }

    get media() {
      const availabilityMedia = this.availability?.media;
      const productMedia = this.product?.media;
      const media = Array.isArray(availabilityMedia) && availabilityMedia.length
        ? availabilityMedia
        : Array.isArray(productMedia)
          ? productMedia
          : [];

      return media.filter((item) => item?.src);
    }

    syncSelections(reset) {
      const product = this.product;
      if (!product) return;

      const initialChoices = product.initialChoices && typeof product.initialChoices === "object"
        ? product.initialChoices
        : {};
      const next = reset ? {} : { ...this.selectedChoices };

      this.options.forEach((option) => {
        const choices = Array.isArray(option?.choices) ? option.choices : [];
        const selectable = choices.filter((choice) => choice?.visible !== false && choice?.inStock !== false);
        const validValues = choices.map((choice) => String(choice?.value ?? choice?.label ?? ""));
        const current = String(next[option.name] ?? "");
        const requested = String(initialChoices[option.name] ?? "");

        if (current && validValues.includes(current)) return;
        if (requested && validValues.includes(requested)) {
          next[option.name] = requested;
          return;
        }

        const first = selectable[0] || choices[0];
        if (first) next[option.name] = String(first.value ?? first.label ?? "");
      });

      this.selectedChoices = next;
    }

    get selectedVariantId() {
      return String(
        this.availability?.selectedVariantId ||
        this.availability?.selectedVariant?._id ||
        this.availability?.selectedVariant?.id ||
        ""
      );
    }

    get isAvailable() {
      const product = this.product;
      if (!product || product.inStock === false) return false;
      if (typeof this.availability?.availableForPurchase === "boolean") {
        return this.availability.availableForPurchase;
      }
      return true;
    }

    get displayPrice() {
      return String(
        this.availability?.formattedDiscountedPrice ||
        this.availability?.formattedPrice ||
        this.product?.formattedDiscountedPrice ||
        this.product?.formattedPrice ||
        this.product?.priceLabel ||
        ""
      );
    }

    get customTextFields() {
      return Array.isArray(this.product?.customTextFields)
        ? this.product.customTextFields
        : [];
    }

    renderLoading() {
      this.shadowRoot.innerHTML = `
        <style>
          :host { display:block; width:100%; height:100%; background:#fdf3e6; }
          :host([data-wix-frame]) { height:auto; }
          .loading { position:absolute; inset:0; display:grid; place-items:center; color:#3d2416; font:800 12px Arial,sans-serif; letter-spacing:.12em; text-transform:uppercase; }
          :host([data-wix-frame]) .loading { position:fixed; }
        </style>
        <div class="loading" role="status">Loading cake…</div>
      `;
    }

    render() {
      const product = this.product;
      if (!product) {
        this.renderLoading();
        return;
      }

      const media = this.media;
      if (this.activeImage >= media.length) this.activeImage = 0;
      const activeImage = media[this.activeImage] || {
        src: product.mainImage || "",
        alt: product.name || "Queso cheesecake"
      };

      const thumbs = media.map((image, index) => `
        <button
          class="thumb${index === this.activeImage ? " is-active" : ""}"
          type="button"
          data-image-index="${index}"
          aria-label="Show product photo ${index + 1}"
          aria-pressed="${String(index === this.activeImage)}"
        >
          <img src="${this.escape(image.src)}" alt="${this.escape(image.alt || product.name)}" loading="lazy" decoding="async">
        </button>
      `).join("");

      const optionGroups = this.options.map((option, optionIndex) => {
        const choices = Array.isArray(option.choices) ? option.choices : [];
        const buttons = choices.map((choice, choiceIndex) => {
          const value = String(choice.value ?? choice.label ?? "");
          const label = String(choice.label ?? choice.description ?? value);
          const selected = this.selectedChoices[option.name] === value;
          const disabled = choice.visible === false || choice.inStock === false;

          return `
            <button
              class="option${selected ? " is-active" : ""}"
              type="button"
              data-option-index="${optionIndex}"
              data-choice-index="${choiceIndex}"
              aria-pressed="${String(selected)}"
              ${disabled ? "disabled" : ""}
            >${this.escape(label)}</button>
          `;
        }).join("");

        return `
          <div class="option-group">
            <span class="option-label">Choose ${this.escape(option.name)}</span>
            <div class="option-row" aria-label="Choose ${this.escape(option.name)}">${buttons}</div>
          </div>
        `;
      }).join("");

      const customFields = this.customTextFields.map((field, index) => {
        const title = String(field.title || field.name || `Custom text ${index + 1}`);
        const maximum = Number(field.maxLength || field.maxCharacters || 0);
        const required = Boolean(field.mandatory || field.required);
        const value = this.customTextValues[title] || "";

        return `
          <label class="custom-field">
            <span>${this.escape(title)}</span>
            <input
              type="text"
              data-custom-field-index="${index}"
              value="${this.escape(value)}"
              ${maximum > 0 ? `maxlength="${maximum}"` : ""}
              ${required ? "required" : ""}
            >
          </label>
        `;
      }).join("");

      const details = Array.isArray(product.details) && product.details.length
        ? product.details
        : [
            { title: "Product information", description: product.productInformation || product.description || "" },
            { title: "Ingredients & allergens", description: product.ingredients || "Contact Queso before ordering if you have an allergy or dietary restriction." },
            { title: "Cheesecake care", description: product.care || "Best served chilled. Refrigerate leftovers and do not reheat." },
            { title: "When will my cheesecake arrive?", description: product.arrival || "Choose delivery or pickup during checkout. Final handoff details are confirmed by email." }
          ];

      const detailsMarkup = details
        .filter((item) => item?.title && item?.description)
        .map((item, index) => `
          <details ${index === 0 ? "open" : ""}>
            <summary>${this.escape(item.title)}</summary>
            <p>${this.escape(item.description)}</p>
          </details>
        `).join("");

      const cartState = this.value("cart-state", "idle").toLowerCase();
      const cartMessage = this.value("cart-message", "");
      const isAdding = cartState === "adding";
      const disabled = isAdding || !this.isAvailable;
      const buttonLabel = isAdding ? "Adding…" : this.isAvailable ? "Add to cart" : "Unavailable";

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            --orange:#ed6011;
            --cream:#fdf3e6;
            --yellow:#f4c24a;
            --brown:#3d2416;
            --pink:#efa3b5;
            --pad:clamp(20px,5vw,76px);
            display:block;
            width:100%;
            height:100%;
            min-height:0;
            overflow:hidden;
            background:var(--cream);
            color:var(--brown);
            font-family:"Quicksand",Arial,sans-serif;
            font-weight:550;
            font-synthesis:none;
            text-rendering:geometricPrecision;
          }

          :host([data-wix-frame]) { height:auto; }
          *,*::before,*::after { box-sizing:border-box; }
          button,input { color:inherit; font:inherit; }
          img { display:block; max-width:100%; }

          .product-page {
            width:100%;
            height:100%;
            min-height:0;
            padding:clamp(40px,6vw,80px) var(--pad);
            overflow:hidden;
            background:var(--cream);
          }

          :host([data-wix-frame]) .product-page {
            position:fixed;
            inset:0;
            width:auto;
            height:auto;
          }

          .product-layout {
            display:grid;
            grid-template-columns:1.05fr .95fr;
            gap:clamp(35px,6vw,85px);
            align-items:start;
          }

          .gallery-shell { position:sticky; top:18px; }

          .gallery-stage {
            position:relative;
            overflow:hidden;
            border:2px solid var(--brown);
            background:#fff;
          }

          .gallery-main {
            width:100%;
            aspect-ratio:1;
            object-fit:cover;
          }

          .gallery-count {
            position:absolute;
            right:15px;
            bottom:15px;
            padding:7px 10px;
            border:1px solid var(--brown);
            background:var(--cream);
            font-size:9px;
            font-weight:850;
            text-transform:uppercase;
          }

          .thumbs {
            margin-top:8px;
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(110px,1fr));
            gap:8px;
          }

          .thumb {
            padding:0;
            border:0;
            background:transparent;
            cursor:pointer;
            opacity:.62;
            transition:opacity 150ms ease,transform 150ms ease;
          }

          .thumb img {
            width:100%;
            aspect-ratio:1.2;
            object-fit:cover;
            border:2px solid var(--brown);
          }

          .thumb:hover,.thumb:focus-visible,.thumb.is-active { opacity:1; transform:translateY(-3px); }
          .thumb.is-active img { outline:4px solid var(--orange); outline-offset:-4px; }

          .thumb:focus-visible,.option:focus-visible,.add-to-cart:focus-visible,input:focus-visible {
            outline:4px solid var(--orange);
            outline-offset:2px;
          }

          .product-panel { min-width:0; position:sticky; top:25px; }

          .tag {
            display:inline-flex;
            padding:7px 10px;
            border:1px solid var(--brown);
            border-radius:999px;
            background:var(--yellow);
            font-size:9px;
            font-weight:850;
            text-transform:uppercase;
          }

          h1 {
            margin:15px 0;
            font-family:"Lovelo",Arial,sans-serif;
            font-size:clamp(52px,5.7vw,86px);
            font-weight:900;
            line-height:1;
            text-transform:uppercase;
          }

          .product-lead { margin:0; font-size:16px; line-height:1.6; }
          .product-price { display:block; margin:20px 0; font-family:"Lovelo",Arial,sans-serif; font-size:25px; }
          .option-group + .option-group { margin-top:22px; }

          .option-label {
            display:block;
            margin:0 0 8px;
            font-size:10px;
            font-weight:850;
            letter-spacing:.09em;
            text-transform:uppercase;
          }

          .option-row { display:flex; flex-wrap:wrap; gap:7px; }

          .option {
            padding:10px 13px;
            border:2px solid var(--brown);
            border-radius:7px;
            background:#fff;
            font-size:11px;
            font-weight:750;
            cursor:pointer;
          }

          .option.is-active { background:var(--yellow); outline:2px solid var(--brown); outline-offset:-2px; }
          .option:disabled { cursor:not-allowed; opacity:.35; text-decoration:line-through; }

          .custom-fields { margin-top:22px; display:grid; gap:13px; }
          .custom-field { display:grid; gap:7px; font-size:10px; font-weight:850; text-transform:uppercase; }
          .custom-field input {
            width:100%;
            min-height:50px;
            padding:0 13px;
            border:2px solid var(--brown);
            border-radius:7px;
            background:#fff;
          }

          .qty-row { margin-top:23px; display:grid; grid-template-columns:100px 1fr; gap:8px; }
          .qty-row input {
            width:100%;
            height:52px;
            border:2px solid var(--brown);
            border-radius:8px;
            background:#fff;
            text-align:center;
          }

          .add-to-cart {
            min-height:52px;
            padding:0 20px;
            display:inline-flex;
            align-items:center;
            justify-content:center;
            border:2px solid var(--brown);
            border-radius:8px;
            background:var(--orange);
            color:#fff;
            font-size:11px;
            font-weight:850;
            text-transform:uppercase;
            cursor:pointer;
          }

          .add-to-cart:disabled { cursor:not-allowed; opacity:.55; }
          .status { min-height:18px; margin:10px 0 0; font-size:11px; font-weight:750; line-height:1.5; }
          .status.success { color:#26723b; }
          .status.error { color:#a52a23; }

          .detail-stack { margin-top:38px; border-top:2px solid var(--brown); }
          details { padding:18px 0; border-bottom:2px solid var(--brown); }
          summary { cursor:pointer; font-family:"Lovelo",Arial,sans-serif; font-size:16px; text-transform:uppercase; }
          details p { margin:14px 0 0; font-size:13px; line-height:1.65; }

          @media(max-width:980px) {
            .product-layout { grid-template-columns:1fr; }
            .gallery-shell,.product-panel { position:static; }
          }

          @media(max-width:680px) {
            .product-page { padding:35px 20px; }
            h1 { font-size:56px; }
            .qty-row { grid-template-columns:85px 1fr; }
          }
        </style>

        <main class="product-page">
          <div class="product-layout">
            <div class="gallery-shell">
              <div class="gallery-stage">
                ${activeImage.src ? `
                  <img
                    class="gallery-main"
                    src="${this.escape(activeImage.src)}"
                    alt="${this.escape(activeImage.alt || product.name)}"
                    loading="eager"
                    fetchpriority="high"
                    decoding="async"
                  >
                ` : ""}
                <span class="gallery-count">Select a photo</span>
              </div>
              ${thumbs ? `<div class="thumbs">${thumbs}</div>` : ""}
            </div>

            <section class="product-panel" aria-labelledby="queso-product-title">
              ${product.ribbon ? `<span class="tag">${this.escape(product.ribbon)}</span>` : ""}
              <h1 id="queso-product-title">${this.escape(product.name)}</h1>
              <p class="product-lead">${this.escape(product.description)}</p>
              <strong class="product-price">${this.escape(this.displayPrice)}</strong>

              ${optionGroups}
              ${customFields ? `<div class="custom-fields">${customFields}</div>` : ""}

              <div class="qty-row">
                <input data-quantity aria-label="Quantity" type="number" min="1" value="1">
                <button class="add-to-cart" type="button" data-add-to-cart ${disabled ? "disabled" : ""}>${this.escape(buttonLabel)}</button>
              </div>
              <p class="status ${this.escape(cartState)}" role="status" aria-live="polite">${this.escape(cartMessage)}</p>

              <div class="detail-stack">${detailsMarkup}</div>
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

      this.shadowRoot.querySelectorAll("[data-option-index]").forEach((button) => {
        button.addEventListener("click", () => {
          const optionIndex = Number(button.dataset.optionIndex);
          const choiceIndex = Number(button.dataset.choiceIndex);
          const option = this.options[optionIndex];
          const choice = option?.choices?.[choiceIndex];
          if (!option || !choice) return;

          this.selectedChoices[option.name] = String(choice.value ?? choice.label ?? "");
          this.setAttribute("availability-data", "{}");
          this.render();
          this.bindEvents();

          this.dispatchEvent(new CustomEvent("queso-product-options-change", {
            bubbles: true,
            composed: true,
            detail: {
              productId: String(this.product?.id || ""),
              choices: { ...this.selectedChoices }
            }
          }));
        });
      });

      this.shadowRoot.querySelectorAll("[data-custom-field-index]").forEach((input) => {
        input.addEventListener("input", () => {
          const index = Number(input.dataset.customFieldIndex);
          const field = this.customTextFields[index];
          if (!field) return;
          const title = String(field.title || field.name || `Custom text ${index + 1}`);
          this.customTextValues[title] = input.value;
        });
      });

      const addButton = this.shadowRoot.querySelector("[data-add-to-cart]");
      addButton?.addEventListener("click", () => {
        const requiredMissing = this.customTextFields.some((field, index) => {
          if (!(field.mandatory || field.required)) return false;
          const title = String(field.title || field.name || `Custom text ${index + 1}`);
          return !String(this.customTextValues[title] || "").trim();
        });

        if (requiredMissing) {
          this.setAttribute("cart-state", "error");
          this.setAttribute("cart-message", "Please complete the required custom text fields.");
          return;
        }

        const quantityInput = this.shadowRoot.querySelector("[data-quantity]");
        const quantity = Math.max(1, Number(quantityInput?.value || 1));

        this.dispatchEvent(new CustomEvent("queso-add-to-cart", {
          bubbles: true,
          composed: true,
          detail: {
            productId: String(this.product?.id || ""),
            productName: String(this.product?.name || ""),
            manageVariants: Boolean(this.product?.manageVariants),
            choices: { ...this.selectedChoices },
            selectedVariantId: this.selectedVariantId,
            customTextFields: { ...this.customTextValues },
            quantity
          }
        }));
      });
    }
  }

  if (!customElements.get("queso-product-detail")) {
    customElements.define("queso-product-detail", QuesoProductDetail);
  }
})();
