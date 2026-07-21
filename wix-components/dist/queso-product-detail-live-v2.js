(() => {
  "use strict";

  const CURRENT_SCRIPT_URL = document.currentScript?.src || "";
  const BASE_COMPONENT_URL = CURRENT_SCRIPT_URL
    ? new URL("queso-product-detail.js", CURRENT_SCRIPT_URL).href
    : "";

  const selectionStore = new Map();
  const originalSetAttribute = HTMLElement.prototype.setAttribute;

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

  function productKey(element) {
    return String(element?.product?.id || element?.product?._id || "");
  }

  function recordsMatch(first, second) {
    if (!first || !second) return false;

    const firstEntries = Object.entries(first);
    const secondEntries = Object.entries(second);

    if (firstEntries.length !== secondEntries.length) return false;

    return firstEntries.every(([name, value]) => {
      return normalizeIdentity(value) === normalizeIdentity(
        readRecordValue(second, name)
      );
    });
  }

  /*
   * The base component clears availability-data to {} after every option
   * click. In Wix that attribute write can recreate the Custom Element,
   * which makes the selection jump back to its initial value. Intercept
   * only that internal reset before the base component is loaded.
   */
  HTMLElement.prototype.setAttribute = function setAttribute(name, value) {
    const attributeName = String(name || "").toLowerCase();
    const attributeValue = String(value ?? "").trim();

    if (
      this.localName === "queso-product-detail" &&
      attributeName === "availability-data" &&
      attributeValue === "{}" &&
      this.hasAttribute("product-data")
    ) {
      return;
    }

    return originalSetAttribute.call(this, name, value);
  };

  document.addEventListener("queso-product-options-change", (event) => {
    const key = String(event.detail?.productId || "");
    const choices = event.detail?.choices;

    if (!key || !choices || typeof choices !== "object") return;

    selectionStore.set(key, {
      choices: { ...choices },
      pendingUntil: Date.now() + 10000
    });
  });

  function patchProductDetail() {
    const ProductDetail = customElements.get("queso-product-detail");
    if (!ProductDetail) return false;

    const prototype = ProductDetail.prototype;
    if (prototype.__quesoLiveV2Patched) return true;

    prototype.syncSelections = function syncSelections(reset) {
      const product = this.product;
      if (!product) return;

      const key = productKey(this);
      const initialChoices =
        product.initialChoices && typeof product.initialChoices === "object"
          ? product.initialChoices
          : {};
      const confirmedChoices =
        this.availability?.selectedChoices &&
        typeof this.availability.selectedChoices === "object"
          ? this.availability.selectedChoices
          : {};
      const storedState = selectionStore.get(key) || null;
      const storedChoices = storedState?.choices || {};
      const pending = Boolean(
        storedState?.pendingUntil && storedState.pendingUntil > Date.now()
      );
      const currentChoices = reset ? {} : { ...this.selectedChoices };
      const next = {};

      if (storedState && recordsMatch(storedChoices, confirmedChoices)) {
        storedState.pendingUntil = 0;
        storedState.choices = { ...confirmedChoices };
        selectionStore.set(key, storedState);
      }

      this.options.forEach((option) => {
        const choices = Array.isArray(option?.choices) ? option.choices : [];
        const selectable = choices.filter(
          (choice) => choice?.visible !== false && choice?.inStock !== false
        );
        const sources = pending
          ? [storedChoices, confirmedChoices, currentChoices, initialChoices]
          : [confirmedChoices, currentChoices, storedChoices, initialChoices];

        let resolved = "";

        for (const source of sources) {
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

        if (resolved) {
          next[option.name] = resolved;
        }
      });

      this.selectedChoices = next;

      if (key) {
        selectionStore.set(key, {
          choices: { ...next },
          pendingUntil: pending ? storedState?.pendingUntil || 0 : 0
        });
      }
    };

    prototype.__quesoLiveV2Patched = true;
    return true;
  }

  if (!BASE_COMPONENT_URL) {
    console.error("Queso product live v2: unable to resolve base component URL.");
    return;
  }

  const baseScript = document.createElement("script");
  baseScript.src = `${BASE_COMPONENT_URL}?v=live-v2`;
  baseScript.async = false;
  baseScript.onload = () => {
    if (!patchProductDetail()) {
      console.error("Queso product live v2: base component loaded but patch failed.");
    }
  };
  baseScript.onerror = () => {
    console.error("Queso product live v2: base component failed to load.");
  };

  document.head.appendChild(baseScript);
})();