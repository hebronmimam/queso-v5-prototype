(() => {
  "use strict";

  const CURRENT_SCRIPT_URL = document.currentScript?.src || "";
  const BASE_COMPONENT_URL = CURRENT_SCRIPT_URL
    ? new URL("queso-product-detail.js", CURRENT_SCRIPT_URL).href
    : "";

  function normalizeIdentity(value) {
    return String(value ?? "").trim().toLowerCase();
  }

  function readRecordValue(record, optionName) {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      return "";
    }

    if (Object.prototype.hasOwnProperty.call(record, optionName)) {
      return record[optionName];
    }

    const targetName = normalizeIdentity(optionName);
    const matchingEntry = Object.entries(record).find(
      ([name]) => normalizeIdentity(name) === targetName
    );

    return matchingEntry?.[1] ?? "";
  }

  function resolveChoiceValue(choices, requestedValue) {
    const requestedIdentity = normalizeIdentity(requestedValue);
    if (!requestedIdentity) return "";

    const match = choices.find((choice) => {
      const valueIdentity = normalizeIdentity(choice?.value);
      const labelIdentity = normalizeIdentity(choice?.label);
      const descriptionIdentity = normalizeIdentity(choice?.description);

      return (
        requestedIdentity === valueIdentity ||
        requestedIdentity === labelIdentity ||
        requestedIdentity === descriptionIdentity
      );
    });

    return match
      ? String(match.value ?? match.label ?? match.description ?? "")
      : "";
  }

  function patchProductDetail() {
    const ProductDetail = customElements.get("queso-product-detail");
    if (!ProductDetail) return false;

    const prototype = ProductDetail.prototype;
    if (prototype.__quesoSelectionRuntimePatched) return true;

    const originalSetAttribute = prototype.setAttribute;

    prototype.setAttribute = function setAttribute(name, value) {
      const attributeName = String(name || "").toLowerCase();
      const attributeValue = String(value ?? "").trim();

      /*
       * The base component clears availability-data to {} immediately
       * after every option click. Wix then treats that attribute change
       * as a fresh render and the UI visibly jumps back to its defaults.
       * Keep the current availability state until Velo returns the real
       * response for the selected choices.
       */
      if (
        attributeName === "availability-data" &&
        attributeValue === "{}" &&
        this.hasAttribute("product-data")
      ) {
        return;
      }

      return originalSetAttribute.call(this, name, value);
    };

    prototype.syncSelections = function syncSelections(reset) {
      const product = this.product;
      if (!product) return;

      const initialChoices =
        product.initialChoices && typeof product.initialChoices === "object"
          ? product.initialChoices
          : {};

      const confirmedChoices =
        this.availability?.selectedChoices &&
        typeof this.availability.selectedChoices === "object"
          ? this.availability.selectedChoices
          : {};

      const next = reset ? {} : { ...this.selectedChoices };

      this.options.forEach((option) => {
        const choices = Array.isArray(option?.choices) ? option.choices : [];
        const selectable = choices.filter(
          (choice) => choice?.visible !== false && choice?.inStock !== false
        );

        const confirmed = resolveChoiceValue(
          choices,
          readRecordValue(confirmedChoices, option.name)
        );

        const current = resolveChoiceValue(
          choices,
          readRecordValue(next, option.name)
        );

        const requested = resolveChoiceValue(
          choices,
          readRecordValue(initialChoices, option.name)
        );

        if (confirmed) {
          next[option.name] = confirmed;
          return;
        }

        if (current) {
          next[option.name] = current;
          return;
        }

        if (requested) {
          next[option.name] = requested;
          return;
        }

        const first = selectable[0] || choices[0];
        if (first) {
          next[option.name] = String(
            first.value ?? first.label ?? first.description ?? ""
          );
        }
      });

      this.selectedChoices = next;
    };

    prototype.__quesoSelectionRuntimePatched = true;
    return true;
  }

  if (patchProductDetail()) return;

  if (!BASE_COMPONENT_URL) {
    console.error("Queso product runtime: unable to resolve base component URL.");
    return;
  }

  const baseScript = document.createElement("script");
  baseScript.src = BASE_COMPONENT_URL;
  baseScript.async = false;
  baseScript.onload = () => {
    if (!patchProductDetail()) {
      console.error("Queso product runtime: base component loaded but patch failed.");
    }
  };
  baseScript.onerror = () => {
    console.error("Queso product runtime: base component failed to load.");
  };

  document.head.appendChild(baseScript);
})();
