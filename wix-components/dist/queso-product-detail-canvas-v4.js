(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const localVariantsUrl = scriptUrl
    ? new URL("queso-product-detail-local-variants.js", scriptUrl).href
    : "";
  const contractCssUrl = scriptUrl
    ? new URL("../../site/contract-v3.css", scriptUrl).href
    : "";

  const PHOTO_STORAGE_PREFIX = "queso-canvas-photo:";
  const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
  const ALLOWED_PHOTO_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp"
  ]);

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

  function readRecordValue(record, optionName) {
    if (!record || typeof record !== "object" || Array.isArray(record)) return "";
    if (Object.prototype.hasOwnProperty.call(record, optionName)) {
      return record[optionName];
    }

    const target = normalize(optionName);
    const match = Object.entries(record).find(([name]) => normalize(name) === target);
    return match?.[1] ?? "";
  }

  function readPhotoState(productId) {
    if (!productId) return {};

    try {
      const raw = sessionStorage.getItem(`${PHOTO_STORAGE_PREFIX}${productId}`);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function writePhotoState(productId, state) {
    if (!productId) return;

    try {
      sessionStorage.setItem(
        `${PHOTO_STORAGE_PREFIX}${productId}`,
        JSON.stringify({
          status: String(state?.status || "idle"),
          fileId: String(state?.fileId || ""),
          fileName: String(state?.fileName || ""),
          message: String(state?.message || "")
        })
      );
    } catch (_) {}
  }

  function clearPhotoState(productId) {
    if (!productId) return;

    try {
      sessionStorage.removeItem(`${PHOTO_STORAGE_PREFIX}${productId}`);
    } catch (_) {}
  }

  function patch(ProductDetail) {
    const prototype = ProductDetail?.prototype;
    if (!prototype || prototype.__quesoCanvasV4Patched) return;

    const originalRender = prototype.render;
    const originalBindEvents = prototype.bindEvents;
    const originalCustomTextFields = Object.getOwnPropertyDescriptor(
      prototype,
      "customTextFields"
    )?.get;

    prototype.isCanvasProduct = function isCanvasProduct() {
      const productName = normalize(this.product?.name);
      return productName === "canvas" || productName === "photo finish";
    };

    prototype.getCanvasTextFields = function getCanvasTextFields() {
      if (typeof originalCustomTextFields === "function") {
        const fields = originalCustomTextFields.call(this);
        return Array.isArray(fields) ? fields : [];
      }

      return Array.isArray(this.product?.customTextFields)
        ? this.product.customTextFields
        : [];
    };

    prototype.getCanvasTextField = function getCanvasTextField(fieldName) {
      const target = normalize(fieldName);
      return this.getCanvasTextFields().find((field) => {
        return normalize(field?.title || field?.name || field?.label) === target;
      }) || null;
    };

    prototype.getCanvasDecor = function getCanvasDecor() {
      return normalize(readRecordValue(this.selectedChoices, "Decor"));
    };

    prototype.getCanvasPhotoState = function getCanvasPhotoState() {
      return {
        status: "idle",
        fileId: "",
        fileName: "",
        message: "",
        ...readPhotoState(productIdFor(this)),
        ...(this.__quesoCanvasPhotoState || {})
      };
    };

    prototype.setCanvasPhotoState = function setCanvasPhotoState(nextState) {
      this.__quesoCanvasPhotoState = {
        status: "idle",
        fileId: "",
        fileName: "",
        message: "",
        ...(nextState || {})
      };

      writePhotoState(productIdFor(this), this.__quesoCanvasPhotoState);
      this.render();
      this.bindEvents();
    };

    prototype.renderCanvasOptionGroups = function renderCanvasOptionGroups() {
      return this.options.map((option, optionIndex) => {
        const choices = Array.isArray(option?.choices) ? option.choices : [];
        const buttons = choices.map((choice, choiceIndex) => {
          const value = String(choice?.value ?? choice?.label ?? choice?.description ?? "");
          const label = String(choice?.label ?? choice?.description ?? value);
          const selected = this.selectedChoices[option.name] === value;
          const disabled = choice?.visible === false || choice?.inStock === false;

          return `
            <button
              class="option${selected ? " is-active" : ""}"
              type="button"
              data-canvas-option-index="${optionIndex}"
              data-canvas-choice-index="${choiceIndex}"
              aria-pressed="${String(selected)}"
              ${disabled ? "disabled" : ""}
            >${this.escape(label)}</button>
          `;
        }).join("");

        return `
          <div class="option-group">
            <span class="option-label">Choose ${this.escape(option.name)}</span>
            <div class="option-row" aria-label="Choose ${this.escape(option.name)}">
              ${buttons}
            </div>
          </div>
        `;
      }).join("");
    };

    prototype.renderCanvas = function renderCanvas() {
      const product = this.product;
      if (!product) {
        this.renderLoading();
        return;
      }

      const messageField = this.getCanvasTextField("Cake Message");
      const photoField = this.getCanvasTextField("Photo Upload URL");
      const messageTitle = String(messageField?.title || messageField?.name || "Cake Message");
      const photoTitle = String(photoField?.title || photoField?.name || "Photo Upload URL");
      const messageMaximum = Math.max(
        1,
        Number(messageField?.maxLength || messageField?.maxCharacters || 40)
      );
      const messageValue = String(this.customTextValues?.[messageTitle] || "");
      const photoState = this.getCanvasPhotoState();
      const localPreviewUrl = String(this.__quesoCanvasPreviewUrl || "");
      const decor = this.getCanvasDecor();
      const showMessage = decor === "letters";
      const showPhoto = decor === "picture";
      const photoReady = Boolean(photoState.fileId);
      const photoVisible = Boolean(localPreviewUrl || photoReady);
      const uploading = photoState.status === "uploading";
      const uploadError = photoState.status === "error";

      if (photoReady) {
        this.customTextValues[photoTitle] = String(photoState.fileId);
      }

      const previewVisual = showPhoto && localPreviewUrl
        ? `<img class="canvas-preview-image" src="${this.escape(localPreviewUrl)}" alt="Your uploaded Canvas design">`
        : showPhoto && photoReady
          ? `<div class="canvas-ready"><strong>Photo ready</strong><span>${this.escape(photoState.fileName || "Uploaded image")}</span></div>`
          : "";

      const previewMessage = showMessage ? messageValue : "";
      const previewHint = showMessage
        ? messageValue.trim()
          ? "Your message is shown in the preview."
          : "Type your message to preview it on the cake."
        : showPhoto
          ? uploading
            ? "Uploading your image…"
            : uploadError
              ? String(photoState.message || "The image could not be uploaded.")
              : photoVisible
                ? "Your image is ready."
                : "Upload an image to preview it on the cake."
          : "Choose Letters or Picture under Decor to start your design.";

      const uploadStatus = uploading
        ? "Uploading…"
        : uploadError
          ? String(photoState.message || "Upload failed.")
          : photoReady
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

      const displayPrice = String(this.displayPrice || "")
        .replace(/^HK\$\s*/i, "HKD ")
        .replace(/\.00$/i, "");

      this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="${this.escape(contractCssUrl)}">
        <style>
          :host {
            --orange:#ed6011;
            --cream:#fdf3e6;
            --yellow:#f4c24a;
            --brown:#3d2416;
            --pink:#efa3b5;
            --line:2px solid var(--brown);
            --pad:clamp(20px,5vw,76px);
            display:block;
            width:100%;
            height:100%;
            min-height:0;
            overflow:hidden;
            background:var(--cream);
            color:var(--brown);
            font-family:Quicksand,Arial,sans-serif;
            font-weight:550;
          }
          :host([data-wix-frame]) { height:auto; }
          :host([data-wix-frame]) .product-page {
            position:fixed;
            inset:0;
            width:auto;
            height:auto;
            overflow:auto;
          }
          *,*::before,*::after { box-sizing:border-box; }
          button,input { color:inherit; font:inherit; }
          .canvas-page { width:100%; min-height:100%; background:var(--cream); }
          .canvas-panel-title { margin:15px 0; }
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
          .option.is-active {
            background:var(--yellow);
            outline:2px solid var(--brown);
            outline-offset:-2px;
          }
          .option:disabled { cursor:not-allowed; opacity:.35; text-decoration:line-through; }
          .canvas-tool { margin-top:30px; border:var(--line); background:#fff; padding:22px; }
          .canvas-preview-message {
            position:absolute;
            inset:auto 11% 13%;
            z-index:4;
            text-align:center;
            font-family:Lovelo,Arial,sans-serif;
            text-transform:uppercase;
            font-size:clamp(18px,4vw,34px);
            line-height:1;
            color:#fff;
            -webkit-text-stroke:1px var(--brown);
            overflow-wrap:anywhere;
          }
          .canvas-preview-message:empty { display:none; }
          .canvas-preview-image {
            position:absolute;
            inset:42px;
            width:calc(100% - 84px);
            height:calc(100% - 84px);
            object-fit:cover;
            z-index:1;
          }
          .canvas-ready {
            position:absolute;
            inset:42px;
            z-index:1;
            display:grid;
            place-items:center;
            align-content:center;
            gap:7px;
            text-align:center;
            background:linear-gradient(135deg,#fffdf8,#f7ead8);
          }
          .canvas-ready strong {
            font-family:Lovelo,Arial,sans-serif;
            font-size:24px;
            text-transform:uppercase;
          }
          .canvas-ready span { max-width:80%; font-size:11px; overflow-wrap:anywhere; }
          .canvas-field { margin-top:22px; }
          .canvas-field[hidden] { display:none; }
          .canvas-field input[type="file"],
          .canvas-field input[type="text"] {
            position:static;
            inset:auto;
            display:block;
            width:100%;
            height:auto;
            min-height:50px;
            margin:7px 0 0;
            padding:12px;
            border:var(--line);
            border-radius:7px;
            background:var(--cream);
            opacity:1;
            cursor:auto;
          }
          .canvas-field input[type="file"] { cursor:pointer; }
          .canvas-note { color:var(--orange); font-size:12px; font-weight:750; line-height:1.5; }
          .canvas-upload-status { margin:7px 0 0; font-size:11px; line-height:1.45; font-weight:750; }
          .canvas-upload-status.error { color:#a52a23; }
          .canvas-upload-status.success { color:#26723b; }
          .canvas-remove {
            margin-top:8px;
            min-height:38px;
            padding:0 12px;
            border:var(--line);
            border-radius:7px;
            background:var(--cream);
            font-size:10px;
            font-weight:850;
            text-transform:uppercase;
            cursor:pointer;
          }
          .status { min-height:18px; margin:10px 0 0; font-size:11px; font-weight:750; line-height:1.5; }
          .status.success { color:#26723b; }
          .status.error { color:#a52a23; }
          .add-to-cart:disabled { cursor:not-allowed; opacity:.55; }
          @media(max-width:680px) {
            .canvas-panel-title { font-size:56px; }
            .canvas-preview-image,
            .canvas-ready {
              inset:31px;
              width:calc(100% - 62px);
              height:calc(100% - 62px);
            }
          }
        </style>

        <main class="product-page canvas-page">
          <div class="product-layout">
            <div class="canvas-blank-column">
              <div class="canvas-blank-display" role="img" aria-label="A blank square Canvas cake ready to customize">
                <div class="canvas-blank-cake" aria-hidden="true"></div>
              </div>
              <div class="canvas-blank-copy">
                <p class="eyebrow">Blank by design</p>
                <h2>Start with a blank Canvas.</h2>
                <p>Your uploaded image or typed message is the only design shown in the preview.</p>
              </div>
            </div>

            <section class="product-panel" aria-labelledby="canvas-product-title">
              <span class="tag orange">Personalized</span>
              <h1 class="product-title canvas-panel-title" id="canvas-product-title">Canvas</h1>
              <p class="product-lead">Choose a flavor, topping and decor, then add your edible photo or short text treatment.</p>
              <strong class="product-price">${this.escape(displayPrice)}</strong>

              ${this.renderCanvasOptionGroups()}

              <section class="canvas-tool" aria-labelledby="canvas-heading">
                <h2 id="canvas-heading" class="display" style="font-size:28px">Build your preview</h2>
                <div class="canvas-preview" data-canvas-preview>
                  ${previewVisual}
                  <span class="canvas-preview-message" data-canvas-preview-message>${this.escape(previewMessage)}</span>
                </div>
                <p class="canvas-preview-hint" data-canvas-preview-hint>${this.escape(previewHint)}</p>

                <div class="canvas-field" data-canvas-photo-field ${showPhoto ? "" : "hidden"}>
                  <label class="option-label" for="canvas-upload">Upload your image</label>
                  <input id="canvas-upload" data-canvas-upload type="file" accept="image/jpeg,image/png,image/webp" ${uploading ? "disabled" : ""}>
                  <p class="canvas-note">Please note, image uploaded will be cropped into a square.</p>
                  <p class="canvas-upload-status${uploadError ? " error" : photoReady ? " success" : ""}" aria-live="polite">${this.escape(uploadStatus)}</p>
                  ${photoVisible ? '<button class="canvas-remove" type="button" data-canvas-remove>Remove image</button>' : ""}
                </div>

                <div class="canvas-field" data-canvas-message-field ${showMessage ? "" : "hidden"}>
                  <label class="option-label" for="canvas-message">Your message</label>
                  <input id="canvas-message" data-canvas-message type="text" maxlength="${messageMaximum}" value="${this.escape(messageValue)}" placeholder="Up to ${messageMaximum} characters">
                </div>
              </section>

              <div class="qty-row">
                <input data-quantity aria-label="Quantity" type="number" min="1" value="${this.escape(String(this.__quesoCanvasQuantity || 1))}">
                <button class="button primary add-to-cart" type="button" data-add-to-cart ${disabled ? "disabled" : ""}>${this.escape(buttonLabel)}</button>
              </div>
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

          <section class="product-proof" aria-label="Canvas product benefits">
            <div class="proof-grid">
              <article class="proof"><span class="brand-icon icon-canvas" aria-hidden="true"></span><strong>Your image</strong><span>Square-cropped and previewed.</span></article>
              <article class="proof"><span class="brand-icon icon-love" aria-hidden="true"></span><strong>Your message</strong><span>Type it and see it update.</span></article>
              <article class="proof"><span class="brand-icon icon-fresh" aria-hidden="true"></span><strong>Baked fresh</strong><span>Made fresh for your order.</span></article>
              <article class="proof"><span class="brand-icon icon-halal" aria-hidden="true"></span><strong>Halal</strong><span>Prepared with Halal ingredients.</span></article>
            </div>
          </section>
        </main>
      `;
    };

    prototype.uploadCanvasPhoto = async function uploadCanvasPhoto(file) {
      const photoField = this.getCanvasTextField("Photo Upload URL");
      const photoTitle = String(photoField?.title || photoField?.name || "Photo Upload URL");

      if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
        delete this.customTextValues[photoTitle];
        this.setCanvasPhotoState({
          status: "error",
          fileId: "",
          fileName: file.name,
          message: "Choose a JPG, PNG or WebP image."
        });
        return;
      }

      if (file.size > MAX_PHOTO_BYTES) {
        delete this.customTextValues[photoTitle];
        this.setCanvasPhotoState({
          status: "error",
          fileId: "",
          fileName: file.name,
          message: "The image must be 10 MB or smaller."
        });
        return;
      }

      const uploadUrl = String(this.product?.photoUploadUrls?.[file.type] || "");
      if (!uploadUrl) {
        delete this.customTextValues[photoTitle];
        this.setCanvasPhotoState({
          status: "error",
          fileId: "",
          fileName: file.name,
          message: "The uploader is not ready. Refresh the page and try again."
        });
        return;
      }

      this.setCanvasPhotoState({
        status: "uploading",
        fileId: "",
        fileName: file.name,
        message: ""
      });

      try {
        const response = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file
        });

        const responseText = await response.text();
        let payload = {};

        try {
          payload = responseText ? JSON.parse(responseText) : {};
        } catch (_) {}

        if (!response.ok) {
          throw new Error(payload?.message || `Upload failed with status ${response.status}.`);
        }

        const fileId = String(
          payload?.file?.id ||
          payload?.fileId ||
          payload?.id ||
          ""
        );

        if (!fileId) {
          throw new Error("Wix did not return the uploaded file ID.");
        }

        this.customTextValues[photoTitle] = fileId;
        this.setCanvasPhotoState({
          status: "success",
          fileId,
          fileName: file.name,
          message: ""
        });
      } catch (error) {
        delete this.customTextValues[photoTitle];
        this.setCanvasPhotoState({
          status: "error",
          fileId: "",
          fileName: file.name,
          message: error?.message || "The photo could not be uploaded."
        });
      }
    };

    prototype.clearCanvasPhoto = function clearCanvasPhoto() {
      const photoField = this.getCanvasTextField("Photo Upload URL");
      const photoTitle = String(photoField?.title || photoField?.name || "Photo Upload URL");
      delete this.customTextValues[photoTitle];
      clearPhotoState(productIdFor(this));

      if (this.__quesoCanvasPreviewUrl) {
        try {
          URL.revokeObjectURL(this.__quesoCanvasPreviewUrl);
        } catch (_) {}
      }

      this.__quesoCanvasPreviewUrl = "";
      this.__quesoCanvasPhotoState = {
        status: "idle",
        fileId: "",
        fileName: "",
        message: ""
      };
      this.render();
      this.bindEvents();
    };

    prototype.dispatchCanvasOptionChange = function dispatchCanvasOptionChange() {
      if (this.isEditorPreview) return;

      this.dispatchEvent(new CustomEvent("queso-product-options-change", {
        bubbles: true,
        composed: true,
        detail: {
          productId: productIdFor(this),
          choices: { ...this.selectedChoices }
        }
      }));
    };

    prototype.bindCanvasEvents = function bindCanvasEvents() {
      this.shadowRoot.querySelectorAll("[data-canvas-option-index]").forEach((button) => {
        button.addEventListener("click", () => {
          const optionIndex = Number(button.dataset.canvasOptionIndex);
          const choiceIndex = Number(button.dataset.canvasChoiceIndex);
          const option = this.options[optionIndex];
          const choice = option?.choices?.[choiceIndex];
          if (!option || !choice) return;

          this.selectedChoices[option.name] = String(
            choice.value ?? choice.label ?? choice.description ?? ""
          );
          this.render();
          this.bindEvents();
          this.dispatchCanvasOptionChange();
        });
      });

      this.shadowRoot.querySelector("[data-canvas-message]")?.addEventListener("input", (event) => {
        const messageField = this.getCanvasTextField("Cake Message");
        const messageTitle = String(messageField?.title || messageField?.name || "Cake Message");
        this.customTextValues[messageTitle] = event.currentTarget.value;

        const preview = this.shadowRoot.querySelector("[data-canvas-preview-message]");
        if (preview) preview.textContent = event.currentTarget.value;

        const hint = this.shadowRoot.querySelector("[data-canvas-preview-hint]");
        if (hint) {
          hint.textContent = event.currentTarget.value.trim()
            ? "Your message is shown in the preview."
            : "Type your message to preview it on the cake.";
        }
      });

      this.shadowRoot.querySelector("[data-canvas-upload]")?.addEventListener("change", async (event) => {
        const file = event.currentTarget.files?.[0];
        if (!file) return;

        if (this.__quesoCanvasPreviewUrl) {
          try {
            URL.revokeObjectURL(this.__quesoCanvasPreviewUrl);
          } catch (_) {}
        }

        this.__quesoCanvasPreviewUrl = URL.createObjectURL(file);
        this.render();
        this.bindEvents();
        await this.uploadCanvasPhoto(file);
      });

      this.shadowRoot.querySelector("[data-canvas-remove]")?.addEventListener("click", () => {
        this.clearCanvasPhoto();
      });

      this.shadowRoot.querySelector("[data-quantity]")?.addEventListener("input", (event) => {
        this.__quesoCanvasQuantity = Math.max(1, Number(event.currentTarget.value || 1));
      });

      this.shadowRoot.querySelector("[data-add-to-cart]")?.addEventListener("click", () => {
        if (this.isEditorPreview) return;

        const messageField = this.getCanvasTextField("Cake Message");
        const photoField = this.getCanvasTextField("Photo Upload URL");
        const messageTitle = String(messageField?.title || messageField?.name || "Cake Message");
        const photoTitle = String(photoField?.title || photoField?.name || "Photo Upload URL");
        const message = String(this.customTextValues?.[messageTitle] || "").trim();
        const photoState = this.getCanvasPhotoState();
        const photoId = String(
          this.customTextValues?.[photoTitle] ||
          photoState.fileId ||
          ""
        ).trim();
        const decor = this.getCanvasDecor();

        if (decor === "letters" && !message) {
          this.setAttribute("cart-state", "error");
          this.setAttribute("cart-message", "Type the cake message before adding Canvas to the cart.");
          return;
        }

        if (decor === "picture") {
          if (photoState.status === "uploading") {
            this.setAttribute("cart-state", "error");
            this.setAttribute("cart-message", "Please wait for your image to finish uploading.");
            return;
          }

          if (!photoId) {
            this.setAttribute("cart-state", "error");
            this.setAttribute("cart-message", "Upload an image before adding Canvas to the cart.");
            return;
          }
        }

        if (decor !== "letters" && decor !== "picture") {
          this.setAttribute("cart-state", "error");
          this.setAttribute("cart-message", "Choose Letters or Picture under Decor.");
          return;
        }

        const customTextFields = {};
        if (decor === "letters" && message) {
          customTextFields[messageTitle] = message;
        }
        if (decor === "picture" && photoId) {
          customTextFields[photoTitle] = photoId;
        }

        const quantity = Math.max(
          1,
          Number(this.shadowRoot.querySelector("[data-quantity]")?.value || 1)
        );
        this.__quesoCanvasQuantity = quantity;

        this.dispatchEvent(new CustomEvent("queso-add-to-cart", {
          bubbles: true,
          composed: true,
          detail: {
            productId: productIdFor(this),
            productName: String(this.product?.name || "Canvas"),
            manageVariants: Boolean(this.product?.manageVariants),
            choices: { ...this.selectedChoices },
            selectedVariantId: this.selectedVariantId,
            customTextFields,
            quantity
          }
        }));
      });
    };

    prototype.render = function render() {
      if (this.isCanvasProduct()) {
        this.renderCanvas();
        return;
      }

      originalRender.call(this);
    };

    prototype.bindEvents = function bindEvents() {
      if (this.isCanvasProduct()) {
        this.bindCanvasEvents();
        return;
      }

      originalBindEvents.call(this);
    };

    prototype.__quesoCanvasV4Patched = true;

    document.querySelectorAll("queso-product-detail").forEach((element) => {
      element.render();
      element.bindEvents();
    });
  }

  if (!localVariantsUrl) {
    console.error("Queso Canvas v4: unable to resolve local variants component URL.");
    return;
  }

  const script = document.createElement("script");
  script.src = `${localVariantsUrl}?v=canvas-v4-1`;
  script.async = false;
  script.onload = async () => {
    await customElements.whenDefined("queso-product-detail");
    patch(customElements.get("queso-product-detail"));
  };
  script.onerror = () => {
    console.error("Queso Canvas v4: local variants component failed to load.");
  };
  document.head.appendChild(script);
})();
