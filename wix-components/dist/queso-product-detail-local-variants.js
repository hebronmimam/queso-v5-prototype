(() => {
  "use strict";

  const currentScriptUrl = document.currentScript?.src || "";
  const baseComponentUrl = currentScriptUrl
    ? new URL("queso-product-detail.js", currentScriptUrl).href
    : "";
  const storagePrefix = "queso-product-selection:";

  const normalize = (value) => String(value ?? "").trim().toLowerCase();

  function readRecordValue(record, optionName) {
    if (!record || typeof record !== "object" || Array.isArray(record)) return "";
    if (Object.prototype.hasOwnProperty.call(record, optionName)) return record[optionName];

    const target = normalize(optionName);
    const match = Object.entries(record).find(([name]) => normalize(name) === target);
    return match?.[1] ?? "";
  }

  function exactChoicesMatch(requiredChoices, selectedChoices) {
    if (!requiredChoices || typeof requiredChoices !== "object") return false;

    const entries = Object.entries(requiredChoices);
    if (!entries.length) return false;

    return entries.every(([name, value]) => {
      return normalize(value) === normalize(readRecordValue(selectedChoices, name));
    });
  }

  function choicesAreCompatible(variantChoices, selectedChoices) {
    if (!variantChoices || typeof variantChoices !== "object") return false;

    return Object.entries(selectedChoices || {}).every(([name, value]) => {
      if (!String(value ?? "").trim()) return true;
      return normalize(value) === normalize(readRecordValue(variantChoices, name));
    });
  }

  function productIdFor(element) {
    return String(
      element?.product?.id ||
      element?.product?._id ||
      element?.suppliedProduct?.id ||
      element?.suppliedProduct?._id ||
      ""
    );
  }

  function readStoredChoices(productId) {
    if (!productId) return {};

    try {
      const raw = sessionStorage.getItem(`${storagePrefix}${productId}`);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function writeStoredChoices(productId, choices) {
    if (!productId || !choices || typeof choices !== "object") return;

    try {
      sessionStorage.setItem(
        `${storagePrefix}${productId}`,
        JSON.stringify({ ...choices })
      );
    } catch (_) {}
  }

  function resolveChoiceValue(choices, requestedValue) {
    const requested = normalize(requestedValue);
    if (!requested) return "";

    const match = choices.find((choice) => {
      return [choice?.value, choice?.label, choice?.description]
        .some((value) => normalize(value) === requested);
    });

    return match
      ? String(match.value ?? match.label ?? match.description ?? "")
      : "";
  }

  function patchProductDetail(ProductDetail) {
    const prototype = ProductDetail?.prototype;
    if (!prototype || prototype.__quesoLocalVariantsPatched) return;

    const originalMedia = Object.getOwnPropertyDescriptor(prototype, "media")?.get;
    const originalOptions = Object.getOwnPropertyDescriptor(prototype, "options")?.get;
    const originalDisplayPrice = Object.getOwnPropertyDescriptor(prototype, "displayPrice")?.get;
    const originalSelectedVariantId = Object.getOwnPropertyDescriptor(prototype, "selectedVariantId")?.get;
    const originalIsAvailable = Object.getOwnPropertyDescriptor(prototype, "isAvailable")?.get;

    Object.defineProperty(prototype, "localVariants", {
      configurable: true,
      get() {
        return Array.isArray(this.product?.variants) ? this.product.variants : [];
      }
    });

    Object.defineProperty(prototype, "localVariant", {
      configurable: true,
      get() {
        if (!this.localVariants.length) return null;
        return this.localVariants.find((variant) => {
          return exactChoicesMatch(variant?.choices, this.selectedChoices);
        }) || null;
      }
    });

    Object.defineProperty(prototype, "options", {
      configurable: true,
      get() {
        const productOptions = Array.isArray(this.product?.options)
          ? this.product.options
          : typeof originalOptions === "function"
            ? originalOptions.call(this)
            : [];

        if (!this.localVariants.length) return productOptions;

        return productOptions.map((option) => ({
          ...option,
          choices: (Array.isArray(option?.choices) ? option.choices : []).map((choice) => {
            const value = String(choice?.value ?? choice?.label ?? choice?.description ?? "");
            const candidateSelections = {
              ...this.selectedChoices,
              [option.name]: value
            };

            const availableCombinationExists = this.localVariants.some((variant) => {
              if (variant?.visible === false || variant?.inStock === false) return false;
              return choicesAreCompatible(variant?.choices, candidateSelections);
            });

            return {
              ...choice,
              inStock: choice?.inStock !== false && availableCombinationExists
            };
          })
        }));
      }
    });

    Object.defineProperty(prototype, "media", {
      configurable: true,
      get() {
        const variantMedia = this.localVariant?.media;
        if (Array.isArray(variantMedia) && variantMedia.length) {
          return variantMedia
            .map((item, index) => this.normalizeMedia(item, index))
            .filter(Boolean);
        }

        const productOptions = Array.isArray(this.product?.options)
          ? this.product.options
          : [];

        for (const option of productOptions) {
          const selectedValue = readRecordValue(this.selectedChoices, option.name);
          const selectedChoice = (Array.isArray(option?.choices) ? option.choices : [])
            .find((choice) => {
              return normalize(choice?.value ?? choice?.label) === normalize(selectedValue);
            });

          if (Array.isArray(selectedChoice?.media) && selectedChoice.media.length) {
            return selectedChoice.media
              .map((item, index) => this.normalizeMedia(item, index))
              .filter(Boolean);
          }
        }

        return typeof originalMedia === "function" ? originalMedia.call(this) : [];
      }
    });

    Object.defineProperty(prototype, "displayPrice", {
      configurable: true,
      get() {
        const variant = this.localVariant;
        return String(
          variant?.formattedDiscountedPrice ||
          variant?.formattedPrice ||
          (typeof originalDisplayPrice === "function" ? originalDisplayPrice.call(this) : "") ||
          ""
        );
      }
    });

    Object.defineProperty(prototype, "selectedVariantId", {
      configurable: true,
      get() {
        return String(
          this.localVariant?.id ||
          this.localVariant?._id ||
          (typeof originalSelectedVariantId === "function"
            ? originalSelectedVariantId.call(this)
            : "") ||
          ""
        );
      }
    });

    Object.defineProperty(prototype, "isAvailable", {
      configurable: true,
      get() {
        if (this.product?.inStock === false) return false;

        if (this.localVariants.length) {
          const variant = this.localVariant;
          return Boolean(
            variant &&
            variant.visible !== false &&
            variant.inStock !== false
          );
        }

        return typeof originalIsAvailable === "function"
          ? originalIsAvailable.call(this)
          : true;
      }
    });

    prototype.syncSelections = function syncSelections(reset) {
      const product = this.product;
      if (!product) return;

      const productId = productIdFor(this);
      const initialChoices = product.initialChoices && typeof product.initialChoices === "object"
        ? product.initialChoices
        : {};
      const storedChoices = readStoredChoices(productId);
      const currentChoices = reset ? {} : { ...this.selectedChoices };
      const next = {};
      const productOptions = Array.isArray(product.options) ? product.options : [];

      productOptions.forEach((option) => {
        const choices = Array.isArray(option?.choices) ? option.choices : [];
        const selectable = choices.filter(
          (choice) => choice?.visible !== false && choice?.inStock !== false
        );
        let resolved = "";

        for (const source of [currentChoices, storedChoices, initialChoices]) {
          resolved = resolveChoiceValue(
            choices,
            readRecordValue(source, option.name)
          );
          if (resolved) break;
        }

        if (!resolved) {
          const first = selectable[0] || choices[0];
          resolved = first
            ? String(first.value ?? first.label ?? first.description ?? "")
            : "";
        }

        if (resolved) next[option.name] = resolved;
      });

      this.selectedChoices = next;
      writeStoredChoices(productId, next);
    };

    document.addEventListener("queso-product-options-change", (event) => {
      const productId = String(event.detail?.productId || "");
      const choices = event.detail?.choices;
      writeStoredChoices(productId, choices);
    });

    prototype.__quesoLocalVariantsPatched = true;
  }

  if (!baseComponentUrl) {
    console.error("Queso local variants: unable to resolve base component URL.");
    return;
  }

  const registry = window.customElements;
  const originalDefine = registry.define.bind(registry);

  registry.define = function define(name, constructor, options) {
    if (String(name).toLowerCase() === "queso-product-detail") {
      patchProductDetail(constructor);
    }

    return originalDefine(name, constructor, options);
  };

  const baseScript = document.createElement("script");
  baseScript.src = `${baseComponentUrl}?v=local-variants-1`;
  baseScript.async = false;
  baseScript.onload = () => {
    registry.define = originalDefine;
  };
  baseScript.onerror = () => {
    registry.define = originalDefine;
    console.error("Queso local variants: base component failed to load.");
  };

  document.head.appendChild(baseScript);
})();