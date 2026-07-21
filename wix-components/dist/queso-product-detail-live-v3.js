(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const baseUrl = scriptUrl ? new URL("queso-product-detail.js", scriptUrl).href : "";
  const prefix = "queso-product-selection:";

  const normalize = (value) => String(value ?? "").trim().toLowerCase();

  function readRecordValue(record, optionName) {
    if (!record || typeof record !== "object" || Array.isArray(record)) return "";
    if (Object.prototype.hasOwnProperty.call(record, optionName)) return record[optionName];

    const target = normalize(optionName);
    const match = Object.entries(record).find(([name]) => normalize(name) === target);
    return match?.[1] ?? "";
  }

  function resolveChoiceValue(choices, requestedValue) {
    const requested = normalize(requestedValue);
    if (!requested) return "";

    const match = choices.find((choice) =>
      [choice?.value, choice?.label, choice?.description]
        .some((value) => normalize(value) === requested)
    );

    return match ? String(match.value ?? match.label ?? match.description ?? "") : "";
  }

  function writeChoices(productId, choices) {
    const id = String(productId || "");
    if (!id || !choices || typeof choices !== "object") return;

    const payload = JSON.stringify({ choices: { ...choices }, updatedAt: Date.now() });

    try {
      sessionStorage.setItem(`${prefix}${id}`, payload);
      return;
    } catch (_) {}

    try {
      localStorage.setItem(`${prefix}${id}`, payload);
    } catch (_) {}
  }

  function readChoices(productId) {
    const id = String(productId || "");
    if (!id) return {};

    for (const storage of [sessionStorage, localStorage]) {
      try {
        const raw = storage.getItem(`${prefix}${id}`);
        if (!raw) continue;

        const parsed = JSON.parse(raw);
        if (parsed?.choices && typeof parsed.choices === "object") {
          return parsed.choices;
        }
      } catch (_) {}
    }

    return {};
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

  function patchConstructor(ProductDetail) {
    const prototype = ProductDetail?.prototype;
    if (!prototype || prototype.__quesoLiveV3Patched) return;

    const nativeSetAttribute = prototype.setAttribute;

    prototype.setAttribute = function setAttribute(name, value) {
      const attributeName = String(name || "").toLowerCase();
      const attributeValue = String(value ?? "").trim();

      if (
        attributeName === "availability-data" &&
        attributeValue === "{}" &&
        this.hasAttribute("product-data")
      ) {
        return;
      }

      return nativeSetAttribute.call(this, name, value);
    };

    prototype.syncSelections = function syncSelections(reset) {
      const product = this.product;
      if (!product) return;

      const productId = productIdFor(this);
      const initialChoices =
        product.initialChoices && typeof product.initialChoices === "object"
          ? product.initialChoices
          : {};
      const confirmedChoices =
        this.availability?.selectedChoices &&
        typeof this.availability.selectedChoices === "object"
          ? this.availability.selectedChoices
          : {};
      const storedChoices = readChoices(productId);
      const currentChoices = reset ? {} : { ...this.selectedChoices };
      const next = {};

      this.options.forEach((option) => {
        const choices = Array.isArray(option?.choices) ? option.choices : [];
        const selectable = choices.filter(
          (choice) => choice?.visible !== false && choice?.inStock !== false
        );

        let resolved = "";

        for (const source of [confirmedChoices, storedChoices, currentChoices, initialChoices]) {
          resolved = resolveChoiceValue(choices, readRecordValue(source, option.name));
          if (resolved) break;
        }

        if (!resolved) {
          const first = selectable[0] || choices[0];
          resolved = first ? String(first.value ?? first.label ?? first.description ?? "") : "";
        }

        if (resolved) next[option.name] = resolved;
      });

      this.selectedChoices = next;
      if (productId && Object.keys(next).length) writeChoices(productId, next);
    };

    prototype.__quesoLiveV3Patched = true;
  }

  document.addEventListener("queso-product-options-change", (event) => {
    const productId = String(event.detail?.productId || "");
    const choices = event.detail?.choices;
    if (productId && choices && typeof choices === "object") writeChoices(productId, choices);
  });

  if (!baseUrl) {
    console.error("Queso product live v3: unable to resolve base component URL.");
    return;
  }

  const registry = window.customElements;
  const originalDefine = registry.define.bind(registry);

  registry.define = function define(name, constructor, options) {
    if (String(name).toLowerCase() === "queso-product-detail") patchConstructor(constructor);
    return originalDefine(name, constructor, options);
  };

  const script = document.createElement("script");
  script.src = `${baseUrl}?v=live-v3`;
  script.async = false;
  script.onload = () => {
    registry.define = originalDefine;
  };
  script.onerror = () => {
    registry.define = originalDefine;
    console.error("Queso product live v3: base component failed to load.");
  };

  document.head.appendChild(script);
})();
