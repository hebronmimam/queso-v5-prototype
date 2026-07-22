(() => {
  "use strict";

  const PATCH_MARKER = "__quesoRequestedFlavorPatchedV1";
  const normalize = (value) => String(value ?? "").trim().toLowerCase();

  function readRecordValue(record, optionName) {
    if (!record || typeof record !== "object" || Array.isArray(record)) return "";
    if (Object.prototype.hasOwnProperty.call(record, optionName)) {
      return record[optionName];
    }

    const target = normalize(optionName);
    const match = Object.entries(record).find(([name]) => normalize(name) === target);
    return match?.[1] ?? "";
  }

  function resolveChoiceValue(choices, requestedValue) {
    const requested = normalize(requestedValue);
    if (!requested) return "";

    const match = (Array.isArray(choices) ? choices : []).find((choice) => {
      return [choice?.value, choice?.label, choice?.description]
        .some((value) => normalize(value) === requested);
    });

    return match
      ? String(match.value ?? match.label ?? match.description ?? "")
      : "";
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

  function waitForProductDetail(attempt = 0) {
    const ProductDetail = customElements.get("queso-product-detail");
    const prototype = ProductDetail?.prototype;

    if (
      prototype?.__quesoLocalVariantsPatched &&
      prototype?.__quesoProductionBuildPatchedV3
    ) {
      patch(ProductDetail);
      return;
    }

    if (attempt >= 200) {
      console.error(
        "Queso requested flavor: product detail runtime did not finish loading."
      );
      return;
    }

    setTimeout(() => waitForProductDetail(attempt + 1), 25);
  }

  function patch(ProductDetail) {
    const prototype = ProductDetail?.prototype;
    if (!prototype || prototype[PATCH_MARKER]) return;

    const originalSyncSelections = prototype.syncSelections;

    prototype.syncSelections = function syncSelections(reset) {
      originalSyncSelections.call(this, reset);

      const requestedFlavor = String(this.product?.requestedFlavor || "").trim();
      if (!requestedFlavor) return;

      const options = Array.isArray(this.options) ? this.options : [];
      const flavorOption = options.find((option) => {
        const name = normalize(option?.name);
        return name === "flavor" || name === "flavour";
      });

      if (!flavorOption) return;

      const matchingVariant = (Array.isArray(this.localVariants)
        ? this.localVariants
        : []
      ).find((variant) => {
        if (variant?.visible === false || variant?.inStock === false) return false;
        return normalize(readRecordValue(variant?.choices, flavorOption.name)) ===
          normalize(requestedFlavor);
      });

      let nextChoices = { ...this.selectedChoices };

      if (matchingVariant?.choices) {
        const resolvedVariantChoices = {};

        options.forEach((option) => {
          const resolved = resolveChoiceValue(
            option?.choices,
            readRecordValue(matchingVariant.choices, option?.name)
          );

          if (resolved) {
            resolvedVariantChoices[option.name] = resolved;
          }
        });

        if (Object.keys(resolvedVariantChoices).length === options.length) {
          nextChoices = resolvedVariantChoices;
        }
      } else {
        const resolvedFlavor = resolveChoiceValue(
          flavorOption.choices,
          requestedFlavor
        );

        if (!resolvedFlavor) return;
        nextChoices[flavorOption.name] = resolvedFlavor;
      }

      const changed = Object.entries(nextChoices).some(([name, value]) => {
        return normalize(readRecordValue(this.selectedChoices, name)) !== normalize(value);
      });

      this.selectedChoices = nextChoices;

      if (changed) {
        this.dispatchEvent(new CustomEvent("queso-product-options-change", {
          bubbles: true,
          composed: true,
          detail: {
            productId: productIdFor(this),
            choices: { ...nextChoices },
            source: "requested-flavor"
          }
        }));
      }
    };

    prototype[PATCH_MARKER] = true;

    document.querySelectorAll("queso-product-detail").forEach((element) => {
      element.syncSelections?.(true);
      element.render?.();
      element.bindEvents?.();
    });
  }

  customElements.whenDefined("queso-product-detail").then(() => {
    waitForProductDetail();
  });
})();
