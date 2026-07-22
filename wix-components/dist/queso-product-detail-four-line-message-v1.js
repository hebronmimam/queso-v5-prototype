(() => {
  "use strict";

  const MAX_LINES = 4;
  const MAX_CHARACTERS_PER_LINE = 6;
  const PATCH_MARKER = "__quesoFourLineMessagePatchedV1";

  function waitForProductDetail(attempt = 0) {
    const ProductDetail = customElements.get("queso-product-detail");
    const prototype = ProductDetail?.prototype;

    if (
      prototype?.__quesoCanvasV5Patched &&
      prototype?.__quesoProductionBuildPatchedV3
    ) {
      patch(ProductDetail);
      return;
    }

    if (attempt >= 200) {
      console.error(
        "Queso four-line message: product detail runtime did not finish loading."
      );
      return;
    }

    setTimeout(() => waitForProductDetail(attempt + 1), 25);
  }

  function patch(ProductDetail) {
    const prototype = ProductDetail?.prototype;
    if (!prototype || prototype[PATCH_MARKER]) return;

    const originalRender = prototype.render;
    const originalBindCanvasEvents = prototype.bindCanvasEvents;

    prototype.getQuesoMessageFieldDetails = function getQuesoMessageFieldDetails() {
      const field = this.getCanvasTextField?.("Cake Message");
      const title = String(field?.title || field?.name || "Cake Message");

      return {
        field,
        title
      };
    };

    prototype.getQuesoMessageLines = function getQuesoMessageLines() {
      const { title } = this.getQuesoMessageFieldDetails();
      const storedValue = String(this.customTextValues?.[title] || "");
      const sourceLines = Array.isArray(this.__quesoCanvasMessageLines)
        ? this.__quesoCanvasMessageLines
        : storedValue.split(/\r?\n/);

      const lines = sourceLines
        .slice(0, MAX_LINES)
        .map((line) => String(line || "").slice(0, MAX_CHARACTERS_PER_LINE));

      while (lines.length < MAX_LINES) {
        lines.push("");
      }

      return lines;
    };

    prototype.setQuesoMessageLines = function setQuesoMessageLines(nextLines) {
      const lines = Array.from({ length: MAX_LINES }, (_, index) => {
        return String(nextLines?.[index] || "").slice(
          0,
          MAX_CHARACTERS_PER_LINE
        );
      });

      this.__quesoCanvasMessageLines = lines;

      const { title } = this.getQuesoMessageFieldDetails();
      const combinedMessage = lines.join("\n").replace(/\n+$/g, "");

      if (combinedMessage) {
        this.customTextValues[title] = combinedMessage;
      } else {
        delete this.customTextValues[title];
      }

      this.updateCanvasV5Customizer?.();
    };

    prototype.installQuesoFourLineStyles = function installQuesoFourLineStyles() {
      if (!this.shadowRoot) return;
      if (this.shadowRoot.querySelector("style[data-queso-four-line-message]")) {
        return;
      }

      const style = document.createElement("style");
      style.dataset.quesoFourLineMessage = "true";
      style.textContent = `
        .canvas-message-lines {
          display: grid;
          gap: 12px;
          margin-top: 8px;
        }

        .canvas-message-lines .canvas-message-line {
          width: 100%;
          min-height: 54px;
          margin: 0 !important;
          padding: 13px 15px;
          border: var(--line);
          border-radius: 12px;
          background: #fff;
          color: var(--brown);
          font-size: 14px;
          font-weight: 650;
          line-height: 1.2;
          opacity: 1;
        }

        .canvas-message-lines .canvas-message-line::placeholder {
          color: color-mix(in srgb, var(--brown) 48%, transparent);
          opacity: 1;
        }

        .canvas-message-lines .canvas-message-line:focus-visible {
          outline: 3px solid var(--yellow);
          outline-offset: 2px;
        }

        [data-canvas-preview-message],
        .canvas-blank-circle-text,
        .canvas-blank-design-text {
          white-space: pre-line;
        }
      `;

      this.shadowRoot.appendChild(style);
    };

    prototype.installQuesoFourLineInputs = function installQuesoFourLineInputs() {
      if (!this.isCanvasProduct?.() || !this.shadowRoot) return;

      const field = this.shadowRoot.querySelector("[data-canvas-message-field]");
      if (!field) return;

      this.installQuesoFourLineStyles();

      const label = field.querySelector("label");
      if (label) {
        label.textContent = "Your message — up to 4 lines";
        label.removeAttribute("for");
      }

      let wrapper = field.querySelector("[data-canvas-message-lines]");
      if (!wrapper) {
        const originalInput = field.querySelector("[data-canvas-message]");
        if (!originalInput) return;

        wrapper = document.createElement("div");
        wrapper.className = "canvas-message-lines";
        wrapper.dataset.canvasMessageLines = "";

        const lines = this.getQuesoMessageLines();

        for (let index = 0; index < MAX_LINES; index += 1) {
          const input = document.createElement("input");
          input.className = "canvas-message-line";
          input.type = "text";
          input.maxLength = MAX_CHARACTERS_PER_LINE;
          input.autocomplete = "off";
          input.dataset.canvasMessageLine = String(index);
          input.setAttribute("aria-label", `Cake message line ${index + 1}`);
          input.placeholder = `Input Line ${index + 1}: 6 Characters Max`;
          input.value = lines[index];
          wrapper.appendChild(input);
        }

        originalInput.replaceWith(wrapper);
      }

      if (wrapper.dataset.quesoBound === "true") return;
      wrapper.dataset.quesoBound = "true";

      wrapper.querySelectorAll("[data-canvas-message-line]").forEach((input) => {
        input.addEventListener("input", () => {
          const nextLines = Array.from(
            wrapper.querySelectorAll("[data-canvas-message-line]")
          ).map((lineInput) => lineInput.value);

          this.setQuesoMessageLines(nextLines);
        });
      });
    };

    prototype.render = function render() {
      originalRender.call(this);

      if (this.isCanvasProduct?.()) {
        this.installQuesoFourLineInputs();
        this.centerQuesoCanvasPreviewMessage?.();
      }
    };

    prototype.bindCanvasEvents = function bindCanvasEvents() {
      originalBindCanvasEvents.call(this);
      this.installQuesoFourLineInputs();
    };

    prototype[PATCH_MARKER] = true;

    document.querySelectorAll("queso-product-detail").forEach((element) => {
      if (!element.isCanvasProduct?.()) return;
      element.render();
      element.bindEvents();
      element.updateCanvasV5Customizer?.();
    });
  }

  customElements.whenDefined("queso-product-detail").then(() => {
    waitForProductDetail();
  });
})();
