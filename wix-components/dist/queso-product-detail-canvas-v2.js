(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const photoUploadUrl = scriptUrl
    ? new URL("queso-product-detail-photo-upload-v1.js", scriptUrl).href
    : "";
  const contractCssUrl = scriptUrl
    ? new URL("../../site/contract-v3.css", scriptUrl).href
    : "";
  const photoStoragePrefix = "queso-product-photo:";
  const normalize = (value) => String(value ?? "").trim().toLowerCase();

  function productIdFor(element) {
    return String(
      element?.product?.id ||
      element?.product?._id ||
      element?.suppliedProduct?.id ||
      element?.suppliedProduct?._id ||
      ""
    );
  }

  function canvasPrice(value) {
    return String(value || "")
      .replace(/^HK\$\s*/i, "HKD ")
      .replace(/\.00$/i, "");
  }

  function clearStoredPhoto(productId) {
    if (!productId) return;
    try {
      sessionStorage.removeItem(`${photoStoragePrefix}${productId}`);
    } catch (_) {}
  }

  function storePhoto(productId, state) {
    if (!productId || !state?.fileId) return;
    try {
      sessionStorage.setItem(
        `${photoStoragePrefix}${productId}`,
        JSON.stringify({
          status: "success",
          fileId: String(state.fileId),
          fileName: String(state.fileName || "")
        })
      );
    } catch (_) {}
  }

  function patch(ProductDetail) {
    const prototype = ProductDetail?.prototype;
    if (!prototype || prototype.__quesoCanvasV2CompactPatched) return;

    const inheritedRender = prototype.render;
    const inheritedBindEvents = prototype.bindEvents;
    const inheritedSetPhotoState = prototype.setQuesoPhotoState;
    const inheritedGetPhotoState = prototype.getQuesoPhotoState;
    const inheritedCustomFields = Object.getOwnPropertyDescriptor(
      prototype,
      "customTextFields"
    )?.get;

    prototype.canvasRawFields = function canvasRawFields() {
      if (typeof this.getRawCustomTextFields === "function") {
        const fields = this.getRawCustomTextFields();
        return Array.isArray(fields) ? fields : [];
      }
      if (typeof inheritedCustomFields === "function") {
        const fields = inheritedCustomFields.call(this);
        return Array.isArray(fields) ? fields : [];
      }
      return Array.isArray(this.product?.customTextFields)
        ? this.product.customTextFields
        : [];
    };

    prototype.isCanvasProduct = function isCanvasProduct() {
      const name = normalize(this.product?.name);
      if (name === "canvas" || name === "photo finish") return true;
      const fields = this.canvasRawFields().map((field) =>
        normalize(field?.title || field?.name || field?.label)
      );
      return fields.includes("cake message") && fields.includes("photo upload url");
    };

    prototype.canvasField = function canvasField(title) {
      const requested = normalize(title);
      return this.canvasRawFields().find((field) =>
        normalize(field?.title || field?.name || field?.label) === requested
      ) || null;
    };

    Object.defineProperty(prototype, "customTextFields", {
      configurable: true,
      get() {
        if (this.isCanvasProduct()) return this.canvasRawFields();
        return typeof inheritedCustomFields === "function"
          ? inheritedCustomFields.call(this)
          : [];
      }
    });

    prototype.canvasPhotoState = function canvasPhotoState() {
      if (typeof inheritedGetPhotoState === "function") {
        return inheritedGetPhotoState.call(this);
      }
      return {
        status: "idle",
        fileId: "",
        fileName: "",
        message: "",
        ...(this.__quesoPhotoState || {})
      };
    };

    prototype.setQuesoPhotoState = function setQuesoPhotoState(state) {
      if (!this.isCanvasProduct()) {
        inheritedSetPhotoState?.call(this, state);
        return;
      }
      this.__quesoPhotoState = {
        status: "idle",
        fileId: "",
        fileName: "",
        message: "",
        ...(state || {})
      };
      if (this.__quesoPhotoState.fileId) {
        storePhoto(productIdFor(this), this.__quesoPhotoState);
      }
      this.render();
      this.bindEvents();
    };

    prototype.canvasSetOption = function canvasSetOption(names, values) {
      const wantedNames = (Array.isArray(names) ? names : [names]).map(normalize);
      const wantedValues = (Array.isArray(values) ? values : [values]).map(normalize);
      const option = this.options.find((item) => wantedNames.includes(normalize(item?.name)));
      if (!option) return false;
      const choice = (Array.isArray(option.choices) ? option.choices : []).find((item) =>
        wantedValues.includes(normalize(item?.value ?? item?.label ?? item?.description))
      );
      if (!choice) return false;
      this.selectedChoices[option.name] = String(
        choice.value ?? choice.label ?? choice.description ?? ""
      );
      return true;
    };

    prototype.canvasApplyHiddenOptions = function canvasApplyHiddenOptions(hasPhoto, hasMessage) {
      this.canvasSetOption("Topping", ["No Thanks", "None", "No topping"]);
      if (hasPhoto) {
        this.canvasSetOption("Decor", ["Picture", "Photo", "Image"]);
      } else if (hasMessage) {
        this.canvasSetOption("Decor", ["Letters", "Letter", "Text"]);
      }
    };

    prototype.canvasFlavorGroups = function canvasFlavorGroups() {
      return this.options
        .map((option, index) => ({ option, index }))
        .filter(({ option }) => ["flavour", "flavor"].includes(normalize(option?.name)));
    };

    prototype.renderCanvas = function renderCanvas() {
      const product = this.product;
      if (!product) {
        this.renderLoading();
        return;
      }

      const messageField = this.canvasField("Cake Message");
      const photoField = this.canvasField("Photo Upload URL");
      const messageTitle = String(messageField?.title || messageField?.name || "Cake Message");
      const photoTitle = String(photoField?.title || photoField?.name || "Photo Upload URL");
      const maxMessage = Math.max(1, Number(messageField?.maxLength || messageField?.maxCharacters || 40));
      const messageValue = String(this.customTextValues?.[messageTitle] || "");
      const photoState = this.canvasPhotoState();
      const previewUrl = String(this.__quesoCanvasPreviewUrl || "");
      const hasPhoto = Boolean(photoState.fileId || previewUrl);
      const hasMessage = Boolean(messageValue.trim());
      const uploading = photoState.status === "uploading";
      const uploadError = photoState.status === "error";
      this.canvasApplyHiddenOptions(hasPhoto, hasMessage);

      if (photoState.fileId) this.customTextValues[photoTitle] = String(photoState.fileId);

      const flavorGroups = this.canvasFlavorGroups().map(({ option, index }) => {
        const buttons = (Array.isArray(option.choices) ? option.choices : []).map((choice, choiceIndex) => {
          const value = String(choice?.value ?? choice?.label ?? "");
          const label = String(choice?.label ?? choice?.description ?? value);
          const selected = this.selectedChoices[option.name] === value;
          const disabled = choice?.visible === false || choice?.inStock === false;
          return `<button class="option${selected ? " is-active" : ""}" type="button" data-canvas-option="${index}" data-canvas-choice="${choiceIndex}" aria-pressed="${String(selected)}" ${disabled ? "disabled" : ""}>${this.escape(label)}</button>`;
        }).join("");
        return `<div class="option-group"><span class="option-label">Choose a flavor</span><div class="option-row" aria-label="Choose a flavor">${buttons}</div></div>`;
      }).join("");

      const previewVisual = previewUrl
        ? `<img class="canvas-preview-image" src="${this.escape(previewUrl)}" alt="Your uploaded Canvas design">`
        : photoState.fileId
          ? `<div class="canvas-ready"><strong>Photo ready</strong><span>${this.escape(photoState.fileName || "Uploaded image")}</span></div>`
          : "";

      const hint = uploading
        ? "Uploading your image…"
        : uploadError
          ? String(photoState.message || "The image could not be uploaded.")
          : hasPhoto && hasMessage
            ? "Your image and message are ready."
            : hasPhoto
              ? "Your image is ready. Add a message or continue."
              : hasMessage
                ? "Your message is shown in the preview."
                : "The cake stays blank until you add your design.";

      const uploadStatus = uploading
        ? "Uploading…"
        : uploadError
          ? String(photoState.message || "Upload failed.")
          : photoState.fileId
            ? `${String(photoState.fileName || "Photo")} uploaded successfully.`
            : "JPG, PNG or WebP. Maximum 10 MB.";

      const cartState = this.value("cart-state", "idle").toLowerCase();
      const cartMessage = this.value("cart-message", "");
      const adding = cartState === "adding";
      const disabled = this.isEditorPreview || adding || !this.isAvailable;
      const buttonLabel = this.isEditorPreview
        ? "Add to cart"
        : adding
          ? "Adding…"
          : this.isAvailable
            ? "Add to cart"
            : "Unavailable";

      this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="${this.escape(contractCssUrl)}">
        <style>
          :host{--orange:#ed6011;--cream:#fdf3e6;--yellow:#f4c24a;--brown:#3d2416;--pink:#efa3b5;--line:2px solid var(--brown);--pad:clamp(20px,5vw,76px);display:block;width:100%;height:100%;min-height:0;overflow:hidden;background:var(--cream);color:var(--brown);font-family:Quicksand,Arial,sans-serif;font-weight:550}
          :host([data-wix-frame]){height:auto}:host([data-wix-frame]) .product-page{position:fixed;inset:0;width:auto;height:auto;overflow:auto}
          *,*::before,*::after{box-sizing:border-box}button,input{font:inherit;color:inherit}.canvas-page{width:100%;min-height:100%;background:var(--cream)}
          .tag.orange{display:inline-flex}.canvas-panel-title{margin:15px 0}.canvas-tool{scroll-margin-top:20px}.canvas-preview-message{position:absolute;inset:auto 11% 13%;z-index:4;text-align:center;font-family:Lovelo,Arial,sans-serif;text-transform:uppercase;font-size:clamp(18px,4vw,34px);line-height:1;color:#fff;-webkit-text-stroke:1px var(--brown);overflow-wrap:anywhere}.canvas-preview-message:empty{display:none}
          .canvas-ready{position:absolute;inset:42px;z-index:1;display:grid;place-items:center;align-content:center;gap:7px;text-align:center;background:linear-gradient(135deg,#fffdf8,#f7ead8)}.canvas-ready strong{font-family:Lovelo,Arial,sans-serif;text-transform:uppercase;font-size:24px}.canvas-ready span{font-size:11px;max-width:80%;overflow-wrap:anywhere}
          .canvas-upload-status{margin:7px 0 0;font-size:11px;line-height:1.45;font-weight:750}.canvas-upload-status.error{color:#a52a23}.canvas-upload-status.success{color:#26723b}.canvas-remove{margin-top:8px;min-height:38px;padding:0 12px;border:var(--line);border-radius:7px;background:var(--cream);font-size:10px;font-weight:850;text-transform:uppercase;cursor:pointer}
          .status{min-height:18px;margin:10px 0 0;font-size:11px;font-weight:750;line-height:1.5}.status.success{color:#26723b}.status.error{color:#a52a23}.add-to-cart:disabled{cursor:not-allowed;opacity:.55}.canvas-preview-image{position:absolute!important;inset:42px!important;width:calc(100% - 84px)!important;height:calc(100% - 84px)!important;object-fit:cover!important;z-index:1!important}
          @media(max-width:680px){.canvas-preview-image{inset:31px!important;width:calc(100% - 62px)!important;height:calc(100% - 62px)!important}.canvas-ready{inset:31px}.canvas-panel-title{font-size:56px}}
        </style>
        <main class="product-page canvas-page">
          <div class="product-layout">
            <div class="canvas-blank-column">
              <div class="canvas-blank-display" role="img" aria-label="A blank square Canvas cake ready to customize"><div class="canvas-blank-cake" aria-hidden="true"></div></div>
              <div class="canvas-blank-copy"><p class="eyebrow">Blank by design</p><h2>Start with a blank Canvas.</h2><p>Your uploaded image or typed message is the only design shown in the preview.</p></div>
            </div>
            <section class="product-panel" aria-labelledby="canvas-product-title">
              <span class="tag orange">Personalized</span>
              <h1 class="product-title canvas-panel-title" id="canvas-product-title">Canvas</h1>
              <p class="product-lead">Choose a flavor, then add an edible photo or short text treatment.</p>
              <strong class="product-price">${this.escape(canvasPrice(this.displayPrice))}</strong>
              ${flavorGroups}
              <section class="canvas-tool" id="customize" aria-labelledby="canvas-heading">
                <h2 id="canvas-heading" class="display" style="font-size:28px">Build your preview</h2>
                <div class="canvas-preview" data-canvas-preview>${previewVisual}<span class="canvas-preview-message" data-canvas-preview-message>${this.escape(messageValue)}</span></div>
                <p class="canvas-preview-hint ${uploadError ? "canvas-upload-status error" : ""}" data-canvas-preview-hint>${this.escape(hint)}</p>
                <label class="option-label" for="canvas-upload">Upload your image</label>
                <input id="canvas-upload" data-canvas-upload type="file" accept="image/jpeg,image/png,image/webp" ${uploading ? "disabled" : ""}>
                <p class="canvas-note">Please note, image uploaded will be cropped into a square.</p>
                <p class="canvas-upload-status${uploadError ? " error" : photoState.fileId ? " success" : ""}" aria-live="polite">${this.escape(uploadStatus)}</p>
                ${photoState.fileId || previewUrl ? '<button class="canvas-remove" type="button" data-canvas-remove>Remove image</button>' : ""}
                <label class="option-label" for="canvas-message">Your message</label>
                <input id="canvas-message" data-canvas-message type="text" maxlength="${messageMaximum}" value="${this.escape(messageValue)}" placeholder="Up to ${messageMaximum} characters">
              </section>
              <div class="qty-row"><input data-quantity aria-label="Quantity" type="number" min="1" value="1"><button class="button primary add-to-cart" type="button" data-add-to-cart ${disabled ? "disabled" : ""}>${this.escape(buttonLabel)}</button></div>
              <p class="status ${this.escape(cartState)}" role="status" aria-live="polite">${this.escape(cartMessage)}</p>
              <div class="detail-stack">
                <details open><summary>Product information</summary><p>Canvas is Queso's customizable format. Choose an edible photo finish or text, then review the live preview before checkout.</p></details>
                <details><summary>Ingredients &amp; allergens</summary><p>Key ingredients: cream cheese, egg, sugar, flour and butter.</p><p>Cakes contain dairy, egg and wheat. Contact Queso before ordering if you have an allergy.</p></details>
                <details><summary>Photo privacy</summary><p>Your uploaded photo is used to produce the cake. Photos without marketing consent are deleted one month after delivery.</p></details>
                <details><summary>Cheesecake care</summary><p>Best served chilled. Let it sit for 10 minutes for a creamier texture. Refrigerate leftovers and do not reheat.</p></details>
                <details><summary>When will my cheesecake arrive?</summary><p>Choose delivery or pickup during checkout. Queso confirms each order before processing and shares the final handoff details by email.</p></details>
              </div>
            </section>
          </div>
          <section class="product-proof" aria-label="Canvas product benefits"><div class="proof-grid">
            <article class="proof"><span class="brand-icon icon-canvas" aria-hidden="true"></span><strong>Your image</strong><span>Square-cropped and previewed.</span></article>
            <article class="proof"><span class="brand-icon icon-love" aria-hidden="true"></span><strong>Your message</strong><span>Type it and see it update.</span></article>
            <article class="proof"><span class="brand-icon icon-fresh" aria-hidden="true"></span><strong>Baked fresh</strong><span>Made fresh for your order.</span></article>
            <article class="proof"><span class="brand-icon icon-halal" aria-hidden="true"></span><strong>Halal</strong><span>Prepared with Halal ingredients.</span></article>
          </div></section>
        </main>`;
    };

    prototype.canvasUpdateHint = function canvasUpdateHint() {
      const hint = this.shadowRoot.querySelector("[data-canvas-preview-hint]");
      if (!hint) return;
      const messageField = this.canvasField("Cake Message");
      const messageTitle = String(messageField?.title || messageField?.name || "Cake Message");
      const hasMessage = Boolean(String(this.customTextValues?.[messageTitle] || "").trim());
      const hasPhoto = Boolean(this.canvasPhotoState().fileId || this.__quesoCanvasPreviewUrl);
      hint.textContent = hasPhoto && hasMessage
        ? "Your image and message are ready."
        : hasPhoto
          ? "Your image is ready. Add a message or continue."
          : hasMessage
            ? "Your message is shown in the preview."
            : "The cake stays blank until you add your design.";
    };

    prototype.canvasRemovePhoto = function canvasRemovePhoto() {
      const field = this.canvasField("Photo Upload URL");
      const title = String(field?.title || field?.name || "Photo Upload URL");
      delete this.customTextValues[title];
      clearStoredPhoto(productIdFor(this));
      if (this.__quesoCanvasPreviewUrl) {
        try { URL.revokeObjectURL(this.__quesoCanvasPreviewUrl); } catch (_) {}
      }
      this.__quesoCanvasPreviewUrl = "";
      this.__quesoPhotoState = { status: "idle", fileId: "", fileName: "", message: "" };
      this.render();
      this.bindEvents();
    };

    prototype.render = function render() {
      if (this.isCanvasProduct()) {
        this.renderCanvas();
        return;
      }
      inheritedRender.call(this);
    };

    prototype.bindCanvasEvents = function bindCanvasEvents() {
      this.shadowRoot.querySelectorAll("[data-canvas-option]").forEach((button) => {
        button.addEventListener("click", () => {
          const option = this.options[Number(button.dataset.canvasOption)];
          const choice = option?.choices?.[Number(button.dataset.canvasChoice)];
          if (!option || !choice) return;
          this.selectedChoices[option.name] = String(choice.value ?? choice.label ?? "");
          this.render();
          this.bindEvents();
          if (!this.isEditorPreview) {
            this.dispatchEvent(new CustomEvent("queso-product-options-change", {
              bubbles: true,
              composed: true,
              detail: { productId: productIdFor(this), choices: { ...this.selectedChoices } }
            }));
          }
        });
      });

      this.shadowRoot.querySelector("[data-canvas-message]")?.addEventListener("input", (event) => {
        const field = this.canvasField("Cake Message");
        const title = String(field?.title || field?.name || "Cake Message");
        this.customTextValues[title] = event.currentTarget.value;
        this.canvasApplyHiddenOptions(
          Boolean(this.canvasPhotoState().fileId || this.__quesoCanvasPreviewUrl),
          Boolean(event.currentTarget.value.trim())
        );
        const preview = this.shadowRoot.querySelector("[data-canvas-preview-message]");
        if (preview) preview.textContent = event.currentTarget.value;
        this.canvasUpdateHint();
      });

      this.shadowRoot.querySelector("[data-canvas-upload]")?.addEventListener("change", async (event) => {
        const file = event.currentTarget.files?.[0];
        if (!file) return;
        if (this.__quesoCanvasPreviewUrl) {
          try { URL.revokeObjectURL(this.__quesoCanvasPreviewUrl); } catch (_) {}
        }
        this.__quesoCanvasPreviewUrl = URL.createObjectURL(file);
        this.render();
        this.bindEvents();
        await this.uploadQuesoPhoto?.(file);
      });

      this.shadowRoot.querySelector("[data-canvas-remove]")?.addEventListener("click", () => {
        this.canvasRemovePhoto();
      });

      this.shadowRoot.querySelector("[data-add-to-cart]")?.addEventListener("click", () => {
        if (this.isEditorPreview) return;
        const messageField = this.canvasField("Cake Message");
        const photoField = this.canvasField("Photo Upload URL");
        const messageTitle = String(messageField?.title || messageField?.name || "Cake Message");
        const photoTitle = String(photoField?.title || photoField?.name || "Photo Upload URL");
        const message = String(this.customTextValues?.[messageTitle] || "").trim();
        const photoState = this.canvasPhotoState();
        const photoId = String(this.customTextValues?.[photoTitle] || photoState.fileId || "").trim();

        if (photoState.status === "uploading") {
          this.setAttribute("cart-state", "error");
          this.setAttribute("cart-message", "Please wait for your image to finish uploading.");
          return;
        }
        if (!message && !photoId) {
          this.setAttribute("cart-state", "error");
          this.setAttribute("cart-message", "Add an image or type a message before adding Canvas to the cart.");
          return;
        }
        if (photoState.status === "error" && !photoId) {
          this.setAttribute("cart-state", "error");
          this.setAttribute("cart-message", "Please upload the image again before adding Canvas to the cart.");
          return;
        }

        if (message) this.customTextValues[messageTitle] = message;
        else delete this.customTextValues[messageTitle];
        if (photoId) this.customTextValues[photoTitle] = photoId;
        else delete this.customTextValues[photoTitle];
        this.canvasApplyHiddenOptions(Boolean(photoId), Boolean(message));

        const quantity = Math.max(
          1,
          Number(this.shadowRoot.querySelector("[data-quantity]")?.value || 1)
        );
        this.dispatchEvent(new CustomEvent("queso-add-to-cart", {
          bubbles: true,
          composed: true,
          detail: {
            productId: productIdFor(this),
            productName: String(this.product?.name || "Canvas"),
            manageVariants: Boolean(this.product?.manageVariants),
            choices: { ...this.selectedChoices },
            selectedVariantId: this.selectedVariantId,
            customTextFields: { ...this.customTextValues },
            quantity
          }
        }));
      });
    };

    prototype.bindEvents = function bindEvents() {
      if (this.isCanvasProduct()) {
        this.bindCanvasEvents();
        return;
      }
      inheritedBindEvents.call(this);
    };

    prototype.__quesoCanvasV2CompactPatched = true;
    document.querySelectorAll("queso-product-detail").forEach((element) => {
      element.render();
      element.bindEvents();
    });
  }

  if (!photoUploadUrl) {
    console.error("Queso Canvas v2: unable to resolve photo upload component URL.");
    return;
  }

  const script = document.createElement("script");
  script.src = `${photoUploadUrl}?v=canvas-v2-2`;
  script.async = false;
  script.onload = async () => {
    await customElements.whenDefined("queso-product-detail");
    patch(customElements.get("queso-product-detail"));
  };
  script.onerror = () => {
    console.error("Queso Canvas v2: photo upload component failed to load.");
  };
  document.head.appendChild(script);
})();
