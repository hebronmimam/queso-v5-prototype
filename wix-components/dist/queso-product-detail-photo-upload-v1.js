(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const localVariantsUrl = scriptUrl
    ? new URL("queso-product-detail-local-variants.js", scriptUrl).href
    : "";
  const photoStoragePrefix = "queso-product-photo:";
  const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
  const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
  const normalize = (value) => String(value ?? "").trim().toLowerCase();

  function readRecordValue(record, optionName) {
    if (!record || typeof record !== "object" || Array.isArray(record)) return "";
    if (Object.prototype.hasOwnProperty.call(record, optionName)) return record[optionName];
    const target = normalize(optionName);
    const match = Object.entries(record).find(([name]) => normalize(name) === target);
    return match?.[1] ?? "";
  }

  function productIdFor(element) {
    return String(element?.product?.id || element?.product?._id || "");
  }

  function readPhotoState(productId) {
    if (!productId) return {};
    try {
      const raw = sessionStorage.getItem(`${photoStoragePrefix}${productId}`);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function writePhotoState(productId, state) {
    if (!productId) return;
    try {
      sessionStorage.setItem(`${photoStoragePrefix}${productId}`, JSON.stringify(state));
    } catch (_) {}
  }

  function clearPhotoState(productId) {
    if (!productId) return;
    try {
      sessionStorage.removeItem(`${photoStoragePrefix}${productId}`);
    } catch (_) {}
  }

  function patch(ProductDetail) {
    const prototype = ProductDetail?.prototype;
    if (!prototype || prototype.__quesoPhotoUploadV1Patched) return;

    const originalCustomTextFields = Object.getOwnPropertyDescriptor(
      prototype,
      "customTextFields"
    )?.get;
    const originalRender = prototype.render;
    const originalBindEvents = prototype.bindEvents;

    prototype.getRawCustomTextFields = function getRawCustomTextFields() {
      return typeof originalCustomTextFields === "function"
        ? originalCustomTextFields.call(this)
        : [];
    };

    prototype.getDecorSelection = function getDecorSelection() {
      return normalize(readRecordValue(this.selectedChoices, "Decor"));
    };

    prototype.getCakeMessageField = function getCakeMessageField() {
      return this.getRawCustomTextFields().find((field) => {
        return normalize(field?.title || field?.name) === "cake message";
      }) || null;
    };

    prototype.getPhotoUploadField = function getPhotoUploadField() {
      return this.getRawCustomTextFields().find((field) => {
        return normalize(field?.title || field?.name) === "photo upload url";
      }) || null;
    };

    Object.defineProperty(prototype, "customTextFields", {
      configurable: true,
      get() {
        const fields = this.getRawCustomTextFields();
        const cakeField = this.getCakeMessageField();
        const photoField = this.getPhotoUploadField();
        if (!cakeField && !photoField) return fields;

        const otherFields = fields.filter((field) => {
          const title = normalize(field?.title || field?.name);
          return title !== "cake message" && title !== "photo upload url";
        });
        const decor = this.getDecorSelection();

        if (decor === "letters" && cakeField) {
          return [...otherFields, { ...cakeField, mandatory: true, required: true }];
        }

        if (decor === "picture" && photoField) {
          return [...otherFields, { ...photoField, mandatory: true, required: true }];
        }

        return otherFields;
      }
    });

    prototype.prepareQuesoCustomization = function prepareQuesoCustomization() {
      const decor = this.getDecorSelection();
      const cakeField = this.getCakeMessageField();
      const photoField = this.getPhotoUploadField();
      const cakeTitle = String(cakeField?.title || cakeField?.name || "");
      const photoTitle = String(photoField?.title || photoField?.name || "");

      if (decor === "letters" && photoTitle) {
        delete this.customTextValues[photoTitle];
      }

      if (decor === "picture") {
        if (cakeTitle) delete this.customTextValues[cakeTitle];
        const stored = readPhotoState(productIdFor(this));
        if (photoTitle && stored?.fileId) {
          this.customTextValues[photoTitle] = String(stored.fileId);
        }
      }
    };

    prototype.render = function render() {
      this.prepareQuesoCustomization();
      originalRender.call(this);
      this.renderQuesoPhotoUploader();
    };

    prototype.getQuesoPhotoState = function getQuesoPhotoState() {
      return {
        status: "idle",
        fileId: "",
        fileName: "",
        message: "",
        ...readPhotoState(productIdFor(this)),
        ...(this.__quesoPhotoState || {})
      };
    };

    prototype.setQuesoPhotoState = function setQuesoPhotoState(state) {
      this.__quesoPhotoState = { ...state };
      if (state?.fileId) {
        writePhotoState(productIdFor(this), {
          status: "success",
          fileId: String(state.fileId),
          fileName: String(state.fileName || "")
        });
      }
      this.renderQuesoPhotoUploader();
      this.bindQuesoPhotoEvents();
    };

    prototype.renderQuesoPhotoUploader = function renderQuesoPhotoUploader() {
      if (this.getDecorSelection() !== "picture") return;

      const field = this.getPhotoUploadField();
      const title = String(field?.title || field?.name || "Photo Upload URL");
      const label = Array.from(this.shadowRoot.querySelectorAll(".custom-field"))
        .find((item) => normalize(item.querySelector("span")?.textContent) === normalize(title));
      if (!label) return;

      const state = this.getQuesoPhotoState();
      const isUploading = state.status === "uploading";
      const isSuccess = Boolean(state.fileId);
      const text = isUploading
        ? "Uploading your photo…"
        : state.status === "error"
          ? String(state.message || "The photo could not be uploaded.")
          : isSuccess
            ? `${String(state.fileName || "Photo")} uploaded successfully.`
            : "JPG, PNG or WebP. Maximum 10 MB.";

      label.classList.add("photo-custom-field");
      label.innerHTML = `
        <span>Upload your photo <b aria-hidden="true">*</b></span>
        <div class="photo-upload-box${isSuccess ? " is-success" : ""}${state.status === "error" ? " is-error" : ""}">
          <input
            class="photo-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            data-photo-upload-input
            ${isUploading || isSuccess ? "disabled" : ""}
          >
          <div class="photo-upload-copy">
            <strong>${isSuccess ? "Photo ready" : isUploading ? "Uploading…" : "Choose a photo"}</strong>
            <span>${this.escape(text)}</span>
          </div>
          ${isSuccess ? '<button type="button" class="photo-remove" data-photo-remove>Remove</button>' : ""}
        </div>
      `;

      if (!this.shadowRoot.querySelector("style[data-queso-photo-upload]")) {
        const style = document.createElement("style");
        style.dataset.quesoPhotoUpload = "true";
        style.textContent = `
          .photo-custom-field { gap: 8px; }
          .photo-custom-field > span b { color: var(--orange); }
          .photo-upload-box {
            position: relative;
            min-height: 92px;
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            border: 2px dashed var(--brown);
            border-radius: 8px;
            background: #fff;
            overflow: hidden;
          }
          .photo-upload-box.is-success { border-style: solid; background: #fff8dc; }
          .photo-upload-box.is-error { border-color: #a52a23; }
          .photo-file-input {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
          }
          .photo-file-input:disabled { cursor: default; }
          .photo-upload-copy { display: grid; gap: 4px; pointer-events: none; }
          .photo-upload-copy strong {
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 14px;
            text-transform: uppercase;
          }
          .photo-upload-copy span {
            font-size: 11px;
            line-height: 1.45;
            text-transform: none;
          }
          .photo-remove {
            position: relative;
            z-index: 2;
            min-height: 38px;
            padding: 0 12px;
            border: 2px solid var(--brown);
            border-radius: 7px;
            background: var(--cream);
            font-size: 10px;
            font-weight: 850;
            text-transform: uppercase;
            cursor: pointer;
          }
        `;
        this.shadowRoot.appendChild(style);
      }
    };

    prototype.bindQuesoPhotoEvents = function bindQuesoPhotoEvents() {
      const input = this.shadowRoot.querySelector("[data-photo-upload-input]");
      input?.addEventListener("change", async () => {
        const file = input.files?.[0];
        if (file) await this.uploadQuesoPhoto(file);
      });

      const removeButton = this.shadowRoot.querySelector("[data-photo-remove]");
      removeButton?.addEventListener("click", () => {
        const field = this.getPhotoUploadField();
        const title = String(field?.title || field?.name || "Photo Upload URL");
        delete this.customTextValues[title];
        clearPhotoState(productIdFor(this));
        this.__quesoPhotoState = { status: "idle", fileId: "", fileName: "", message: "" };
        this.renderQuesoPhotoUploader();
        this.bindQuesoPhotoEvents();
      });
    };

    prototype.uploadQuesoPhoto = async function uploadQuesoPhoto(file) {
      const field = this.getPhotoUploadField();
      const title = String(field?.title || field?.name || "Photo Upload URL");

      if (!ALLOWED_TYPES.has(file.type)) {
        delete this.customTextValues[title];
        this.setQuesoPhotoState({
          status: "error",
          fileId: "",
          fileName: file.name,
          message: "Choose a JPG, PNG or WebP image."
        });
        return;
      }

      if (file.size > MAX_PHOTO_BYTES) {
        delete this.customTextValues[title];
        this.setQuesoPhotoState({
          status: "error",
          fileId: "",
          fileName: file.name,
          message: "The image must be 10 MB or smaller."
        });
        return;
      }

      const uploadUrl = String(this.product?.photoUploadUrls?.[file.type] || "");
      if (!uploadUrl) {
        delete this.customTextValues[title];
        this.setQuesoPhotoState({
          status: "error",
          fileId: "",
          fileName: file.name,
          message: "The uploader is not ready. Refresh the page and try again."
        });
        return;
      }

      this.setQuesoPhotoState({ status: "uploading", fileId: "", fileName: file.name, message: "" });

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

        const fileId = String(payload?.file?.id || payload?.fileId || payload?.id || "");
        if (!fileId) throw new Error("Wix did not return the uploaded file ID.");

        this.customTextValues[title] = fileId;
        this.setQuesoPhotoState({ status: "success", fileId, fileName: file.name, message: "" });
      } catch (error) {
        delete this.customTextValues[title];
        this.setQuesoPhotoState({
          status: "error",
          fileId: "",
          fileName: file.name,
          message: error?.message || "The photo could not be uploaded."
        });
      }
    };

    prototype.bindEvents = function bindEvents() {
      originalBindEvents.call(this);
      this.bindQuesoPhotoEvents();
    };

    prototype.__quesoPhotoUploadV1Patched = true;

    document.querySelectorAll("queso-product-detail").forEach((element) => {
      element.render();
      element.bindEvents();
    });
  }

  if (!localVariantsUrl) {
    console.error("Queso photo upload v1: unable to resolve local variants component URL.");
    return;
  }

  const script = document.createElement("script");
  script.src = `${localVariantsUrl}?v=photo-upload-v1`;
  script.async = false;
  script.onload = async () => {
    await customElements.whenDefined("queso-product-detail");
    patch(customElements.get("queso-product-detail"));
  };
  script.onerror = () => {
    console.error("Queso photo upload v1: local variants component failed to load.");
  };
  document.head.appendChild(script);
})();