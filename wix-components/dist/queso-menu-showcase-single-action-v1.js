(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const SOURCE_URL = new URL("queso-menu-showcase.js", SCRIPT_URL).href;
  const TAG_NAME = "queso-menu-showcase";
  const NAVIGATION_EVENT = "queso-menu-navigate";
  const patchedRoots = new WeakSet();

  function emitNavigation(element, item, url, action, index) {
    element.dispatchEvent(
      new CustomEvent(NAVIGATION_EVENT, {
        bubbles: true,
        composed: true,
        detail: {
          index,
          action,
          url,
          productId: item?.productId || "",
          productName: item?.productName || ""
        }
      })
    );
  }

  function patchElement(element) {
    const root = element.shadowRoot;
    if (!root) return;

    root.querySelectorAll("[data-secondary-action]").forEach((link) => {
      link.remove();
    });

    root.querySelectorAll(".card-actions").forEach((actions) => {
      actions.style.gridTemplateColumns = "1fr";
    });

    root.querySelectorAll("[data-primary-action]").forEach((link) => {
      const index = Number(link.dataset.primaryAction);
      const item = element.items?.[index];
      if (!item) return;

      const originalLabel = String(item.primaryLabel || "").trim();
      const displayLabel = originalLabel.toLowerCase().includes("add")
        ? "Choose options"
        : originalLabel;

      if (displayLabel) {
        link.textContent = displayLabel;
      }

      if (link.dataset.quesoSingleActionBound === "true") return;
      link.dataset.quesoSingleActionBound = "true";

      link.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();

          const currentIndex = Number(link.dataset.primaryAction);
          const currentItem = element.items?.[currentIndex];
          if (!currentItem) return;

          emitNavigation(
            element,
            currentItem,
            currentItem.primaryUrl,
            "primary",
            currentIndex
          );
        },
        true
      );
    });

    if (!patchedRoots.has(root)) {
      patchedRoots.add(root);

      const observer = new MutationObserver(() => {
        queueMicrotask(() => patchElement(element));
      });

      observer.observe(root, {
        childList: true,
        subtree: true
      });
    }
  }

  function patchAll() {
    document.querySelectorAll(TAG_NAME).forEach((element) => {
      patchElement(element);
    });
  }

  function startPatcher() {
    customElements.whenDefined(TAG_NAME).then(() => {
      patchAll();

      const observer = new MutationObserver(() => {
        queueMicrotask(patchAll);
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    });
  }

  if (customElements.get(TAG_NAME)) {
    startPatcher();
    return;
  }

  const script = document.createElement("script");
  script.src = SOURCE_URL;
  script.async = false;
  script.addEventListener("load", startPatcher, { once: true });
  script.addEventListener(
    "error",
    () => {
      console.error("Could not load the Queso menu showcase source.");
    },
    { once: true }
  );

  document.head.appendChild(script);
})();
