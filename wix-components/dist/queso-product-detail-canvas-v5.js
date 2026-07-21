(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const canvasV4Url = scriptUrl
    ? new URL("queso-product-detail-canvas-v4.js", scriptUrl).href
    : "";
  const PHOTO_STORAGE_PREFIX = "queso-canvas-photo:";
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

  function clearStoredPhoto(productId) {
    if (!productId) return;
    try {
      sessionStorage.removeItem(`${PHOTO_STORAGE_PREFIX}${productId}`);
    } catch (_) {}
  }

  function waitForCanvasV4(ProductDetail, attempt = 0) {
    if (ProductDetail?.prototype?.__quesoCanvasV4Patched) {
      patch(ProductDetail);
      return;
    }

    if (attempt >= 120) {
      console.error("Queso Canvas v5: Canvas v4 did not finish loading.");
      return;
    }

    setTimeout(() => waitForCanvasV4(ProductDetail, attempt + 1), 25);
  }

  function patch(ProductDetail) {
    const prototype = ProductDetail?.prototype;
    if (!prototype || prototype.__quesoCanvasV5Patched) return;

    prototype.installCanvasV5Styles = function installCanvasV5Styles() {
      if (this.shadowRoot.querySelector("style[data-queso-canvas-v5]")) return;

      const style = document.createElement("style");
      style.dataset.quesoCanvasV5 = "true";
      style.textContent = `
        .canvas-preview-message {
          inset: 42px;
          display: grid;
          place-items: center;
          padding: 22px;
          text-align: center;
        }

        .canvas-blank-circle {
          position: absolute;
          z-index: 4;
          top: 45px;
          right: 45px;
          width: 170px;
          height: 170px;
          overflow: hidden;
          display: grid;
          place-items: center;
          padding: 16px;
          border: var(--line);
          border-radius: 50%;
          background: var(--cream);
          text-align: center;
        }

        .canvas-blank-circle img,
        .canvas-blank-design img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .canvas-blank-circle img {
          position: absolute;
          inset: 0;
        }

        .canvas-blank-circle-text,
        .canvas-blank-design-text {
          position: relative;
          z-index: 2;
          max-width: 100%;
          font-family: Lovelo, Arial, sans-serif;
          font-weight: 900;
          line-height: 1;
          text-align: center;
          text-transform: uppercase;
          overflow-wrap: anywhere;
        }

        .canvas-blank-circle-text {
          font-size: clamp(11px, 1.25vw, 19px);
        }

        .canvas-blank-design {
          position: absolute;
          z-index: 5;
          inset: 54px;
          overflow: hidden;
          display: grid;
          place-items: center;
          padding: 18px;
          background: transparent;
        }

        .canvas-blank-design img {
          position: absolute;
          inset: 0;
        }

        .canvas-blank-design-text {
          font-size: clamp(15px, 2vw, 28px);
          color: #fff;
          -webkit-text-stroke: 1px var(--brown);
        }

        .canvas-ready {
          padding: 18px;
        }

        @media(max-width:680px) {
          .canvas-preview-message {
            inset: 31px;
            padding: 15px;
          }

          .canvas-blank-circle {
            top: 25px;
            right: 25px;
            width: 110px;
            height: 110px;
            padding: 10px;
          }

          .canvas-blank-design {
            inset: 42px;
            padding: 12px;
          }
        }
      `;

      this.shadowRoot.appendChild(style);
    };

    prototype.getCanvasV5Values = function getCanvasV5Values() {
      const messageField = this.getCanvasTextField("Cake Message");
      const photoField = this.getCanvasTextField("Photo Upload URL");
      const messageTitle = String(messageField?.title || messageField?.name || "Cake Message");
      const photoTitle = String(photoField?.title || photoField?.name || "Photo Upload URL");
      const message = String(this.customTextValues?.[messageTitle] || "");
      const photoState = this.getCanvasPhotoState();
      const previewUrl = String(this.__quesoCanvasPreviewUrl || "");
      const decor = this.getCanvasDecor();

      return {
        messageField,
        photoField,
        messageTitle,
        photoTitle,
        message,
        photoState,
        previewUrl,
        decor,
        showMessage: decor === "letters",
        showPhoto: decor === "picture",
        photoReady: Boolean(photoState.fileId),
        photoVisible: Boolean(previewUrl || photoState.fileId)
      };
    };

    prototype.renderCanvasV5Visual = function renderCanvasV5Visual(container, mode, values) {
      if (!container) return;

      const textClass = mode === "circle"
        ? "canvas-blank-circle-text"
        : "canvas-blank-design-text";

      if (values.showPhoto && values.previewUrl) {
        container.innerHTML = `<img src="${this.escape(values.previewUrl)}" alt="Your uploaded Canvas design">`;
        return;
      }

      if (values.showPhoto && values.photoReady) {
        container.innerHTML = `<span class="${textClass}">Photo ready</span>`;
        return;
      }

      if (values.showMessage && values.message.trim()) {
        container.innerHTML = `<span class="${textClass}">${this.escape(values.message)}</span>`;
        return;
      }

      container.innerHTML = "";
    };

    prototype.ensureCanvasV5LeftPreview = function ensureCanvasV5LeftPreview(values) {
      const display = this.shadowRoot.querySelector(".canvas-blank-display");
      const cake = this.shadowRoot.querySelector(".canvas-blank-cake");
      if (!display || !cake) return;

      let circle = display.querySelector(".canvas-blank-circle");
      if (!circle) {
        circle = document.createElement("div");
        circle.className = "canvas-blank-circle";
        circle.setAttribute("aria-hidden", "true");
        display.appendChild(circle);
      }

      let design = cake.querySelector(".canvas-blank-design");
      if (!design) {
        design = document.createElement("div");
        design.className = "canvas-blank-design";
        design.setAttribute("aria-hidden", "true");
        cake.appendChild(design);
      }

      this.renderCanvasV5Visual(circle, "circle", values);
      this.renderCanvasV5Visual(design, "design", values);
    };

    prototype.updateCanvasV5OptionButtons = function updateCanvasV5OptionButtons() {
      const options = this.options;

      this.shadowRoot.querySelectorAll("[data-canvas-option-index]").forEach((button) => {
        const optionIndex = Number(button.dataset.canvasOptionIndex);
        const choiceIndex = Number(button.dataset.canvasChoiceIndex);
        const option = options[optionIndex];
        const choice = option?.choices?.[choiceIndex];
        if (!option || !choice) return;

        const value = String(choice.value ?? choice.label ?? choice.description ?? "");
        const selected = String(this.selectedChoices[option.name] || "") === value;
        const disabled = choice?.visible === false || choice?.inStock === false;

        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
        button.disabled = disabled;
      });
    };

    prototype.updateCanvasV5Customizer = function updateCanvasV5Customizer() {
      if (!this.isCanvasProduct()) return;

      this.installCanvasV5Styles();
      const values = this.getCanvasV5Values();
      const preview = this.shadowRoot.querySelector("[data-canvas-preview]");
      const previewMessage = this.shadowRoot.querySelector("[data-canvas-preview-message]");
      const photoField = this.shadowRoot.querySelector("[data-canvas-photo-field]");
      const messageField = this.shadowRoot.querySelector("[data-canvas-message-field]");
      const hint = this.shadowRoot.querySelector("[data-canvas-preview-hint]");
      const status = this.shadowRoot.querySelector(".canvas-upload-status");
      const price = this.shadowRoot.querySelector(".product-price");
      const addButton = this.shadowRoot.querySelector("[data-add-to-cart]");

      if (photoField) photoField.hidden = !values.showPhoto;
      if (messageField) messageField.hidden = !values.showMessage;

      preview?.querySelector(".canvas-preview-image")?.remove();
      preview?.querySelector(".canvas-ready")?.remove();

      if (previewMessage) {
        previewMessage.textContent = values.showMessage ? values.message : "";
      }

      if (preview && values.showPhoto && values.previewUrl) {
        const image = document.createElement("img");
        image.className = "canvas-preview-image";
        image.src = values.previewUrl;
        image.alt = "Your uploaded Canvas design";
        preview.prepend(image);
      } else if (preview && values.showPhoto && values.photoReady) {
        const ready = document.createElement("div");
        ready.className = "canvas-ready";
        ready.innerHTML = `<strong>Photo ready</strong><span>${this.escape(values.photoState.fileName || "Uploaded image")}</span>`;
        preview.prepend(ready);
      }

      if (hint) {
        hint.textContent = values.showMessage
          ? values.message.trim()
            ? "Your message is shown in the preview."
            : "Type your message to preview it on the cake."
          : values.showPhoto
            ? values.photoState.status === "uploading"
              ? "Uploading your image…"
              : values.photoState.status === "error"
                ? String(values.photoState.message || "The image could not be uploaded.")
                : values.photoVisible
                  ? "Your image is ready."
                  : "Upload an image to preview it on the cake."
            : "Choose Letters or Picture under Decor to start your design.";
      }

      if (status) {
        status.classList.toggle("error", values.photoState.status === "error");
        status.classList.toggle("success", values.photoReady);
        status.textContent = values.photoState.status === "uploading"
          ? "Uploading…"
          : values.photoState.status === "error"
            ? String(values.photoState.message || "Upload failed.")
            : values.photoReady
              ? `${String(values.photoState.fileName || "Photo")} uploaded successfully.`
              : "JPG, PNG or WebP. Maximum 10 MB.";
      }

      if (photoField) {
        let removeButton = photoField.querySelector("[data-canvas-remove]");
        if (values.photoVisible && !removeButton) {
          removeButton = document.createElement("button");
          removeButton.className = "canvas-remove";
          removeButton.type = "button";
          removeButton.dataset.canvasRemove = "";
          removeButton.textContent = "Remove image";
          removeButton.addEventListener("click", (event) => {
            event.preventDefault();
            this.clearCanvasPhoto();
          });
          photoField.appendChild(removeButton);
        } else if (!values.photoVisible && removeButton) {
          removeButton.remove();
        }
      }

      if (price) {
        price.textContent = String(this.displayPrice || "")
          .replace(/^HK\$\s*/i, "HKD ")
          .replace(/\.00$/i, "");
      }

      if (addButton) {
        const cartState = this.value("cart-state", "idle").toLowerCase();
        const adding = cartState === "adding";
        addButton.disabled = this.isEditorPreview || adding || !this.isAvailable;
        addButton.textContent = adding
          ? "Adding…"
          : this.isAvailable
            ? "Add to cart"
            : "Unavailable";
      }

      this.updateCanvasV5OptionButtons();
      this.ensureCanvasV5LeftPreview(values);
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
      this.updateCanvasV5Customizer();
    };

    prototype.clearCanvasPhoto = function clearCanvasPhoto() {
      const photoField = this.getCanvasTextField("Photo Upload URL");
      const photoTitle = String(photoField?.title || photoField?.name || "Photo Upload URL");
      delete this.customTextValues[photoTitle];
      clearStoredPhoto(productIdFor(this));

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

      const uploadInput = this.shadowRoot.querySelector("[data-canvas-upload]");
      if (uploadInput) uploadInput.value = "";
      this.updateCanvasV5Customizer();
    };

    prototype.bindCanvasEvents = function bindCanvasEvents() {
      this.shadowRoot.querySelectorAll("[data-canvas-option-index]").forEach((button) => {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();

          const optionIndex = Number(button.dataset.canvasOptionIndex);
          const choiceIndex = Number(button.dataset.canvasChoiceIndex);
          const option = this.options[optionIndex];
          const choice = option?.choices?.[choiceIndex];
          if (!option || !choice) return;

          this.selectedChoices[option.name] = String(
            choice.value ?? choice.label ?? choice.description ?? ""
          );

          this.updateCanvasV5Customizer();
          this.dispatchCanvasOptionChange();
        });
      });

      this.shadowRoot.querySelector("[data-canvas-message]")?.addEventListener("input", (event) => {
        const messageField = this.getCanvasTextField("Cake Message");
        const messageTitle = String(messageField?.title || messageField?.name || "Cake Message");
        this.customTextValues[messageTitle] = event.currentTarget.value;
        this.updateCanvasV5Customizer();
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
        this.updateCanvasV5Customizer();
        await this.uploadCanvasPhoto(file);
      });

      this.shadowRoot.querySelector("[data-canvas-remove]")?.addEventListener("click", (event) => {
        event.preventDefault();
        this.clearCanvasPhoto();
      });

      this.shadowRoot.querySelector("[data-quantity]")?.addEventListener("input", (event) => {
        this.__quesoCanvasQuantity = Math.max(1, Number(event.currentTarget.value || 1));
      });

      this.shadowRoot.querySelector("[data-add-to-cart]")?.addEventListener("click", (event) => {
        event.preventDefault();
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

    const originalRender = prototype.render;
    prototype.render = function render() {
      originalRender.call(this);
      if (this.isCanvasProduct()) {
        this.updateCanvasV5Customizer();
      }
    };

    prototype.__quesoCanvasV5Patched = true;

    document.querySelectorAll("queso-product-detail").forEach((element) => {
      if (!element.isCanvasProduct?.()) return;
      element.render();
      element.bindEvents();
      element.updateCanvasV5Customizer();
    });
  }

  if (!canvasV4Url) {
    console.error("Queso Canvas v5: unable to resolve Canvas v4 URL.");
    return;
  }

  const script = document.createElement("script");
  script.src = `${canvasV4Url}?v=canvas-v5-1`;
  script.async = false;
  script.onload = async () => {
    await customElements.whenDefined("queso-product-detail");
    waitForCanvasV4(customElements.get("queso-product-detail"));
  };
  script.onerror = () => {
    console.error("Queso Canvas v5: Canvas v4 failed to load.");
  };
  document.head.appendChild(script);
})();
