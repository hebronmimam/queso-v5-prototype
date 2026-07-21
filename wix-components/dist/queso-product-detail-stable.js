(() => {
  "use strict";

  const CURRENT_SCRIPT_URL = document.currentScript?.src || "";
  const BASE_COMPONENT_URL = CURRENT_SCRIPT_URL
    ? new URL("queso-product-detail.js", CURRENT_SCRIPT_URL).href
    : "";

  const OLD_CLEAR_AVAILABILITY = `          this.setAttribute("availability-data", "{}");
`;

  const OLD_SYNC_SELECTIONS = `    syncSelections(reset) {
      const product = this.product;
      if (!product) return;

      const initialChoices = product.initialChoices && typeof product.initialChoices === "object"
        ? product.initialChoices
        : {};
      const next = reset ? {} : { ...this.selectedChoices };

      this.options.forEach((option) => {
        const choices = Array.isArray(option?.choices) ? option.choices : [];
        const selectable = choices.filter((choice) => choice?.visible !== false && choice?.inStock !== false);
        const validValues = choices.map((choice) => String(choice?.value ?? choice?.label ?? ""));
        const current = String(next[option.name] ?? "");
        const requested = String(initialChoices[option.name] ?? "");

        if (current && validValues.includes(current)) return;
        if (requested && validValues.includes(requested)) {
          next[option.name] = requested;
          return;
        }

        const first = selectable[0] || choices[0];
        if (first) next[option.name] = String(first.value ?? first.label ?? "");
      });

      this.selectedChoices = next;
    }
`;

  const NEW_SYNC_SELECTIONS = `    syncSelections(reset) {
      const product = this.product;
      if (!product) return;

      const normalizeIdentity = (value) => String(value ?? "").trim().toLowerCase();

      const readRecordValue = (record, optionName) => {
        if (!record || typeof record !== "object" || Array.isArray(record)) return "";
        if (Object.prototype.hasOwnProperty.call(record, optionName)) return record[optionName];

        const targetName = normalizeIdentity(optionName);
        const match = Object.entries(record).find(
          ([name]) => normalizeIdentity(name) === targetName
        );

        return match?.[1] ?? "";
      };

      const resolveChoiceValue = (choices, requestedValue) => {
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
      };

      const initialChoices = product.initialChoices && typeof product.initialChoices === "object"
        ? product.initialChoices
        : {};

      const confirmedChoices = this.availability?.selectedChoices &&
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
    }
`;

  async function loadStableComponent() {
    if (!BASE_COMPONENT_URL) {
      throw new Error("Unable to resolve the Queso Product Detail base component URL.");
    }

    if (customElements.get("queso-product-detail")) {
      return;
    }

    const response = await fetch(BASE_COMPONENT_URL, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Base component request failed with status ${response.status}.`);
    }

    let source = await response.text();

    if (!source.includes(OLD_CLEAR_AVAILABILITY)) {
      throw new Error("The availability reset line was not found in the base component.");
    }

    if (!source.includes(OLD_SYNC_SELECTIONS)) {
      throw new Error("The selection synchronisation method was not found in the base component.");
    }

    source = source.replace(OLD_CLEAR_AVAILABILITY, "");
    source = source.replace(OLD_SYNC_SELECTIONS, NEW_SYNC_SELECTIONS);

    const blobUrl = URL.createObjectURL(
      new Blob([source], { type: "text/javascript" })
    );

    const script = document.createElement("script");
    script.src = blobUrl;
    script.async = false;
    script.onload = () => URL.revokeObjectURL(blobUrl);
    script.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      console.error("Queso product stable runtime: transformed component failed to execute.");
    };

    document.head.appendChild(script);
  }

  loadStableComponent().catch((error) => {
    console.error("Queso product stable runtime failed:", error);
  });
})();
