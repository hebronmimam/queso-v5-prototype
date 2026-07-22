(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const SOURCE_URL = new URL("queso-flavor-formats.js", SCRIPT_URL).href;
  const TAG_NAME = "queso-flavor-formats";
  const NAVIGATION_EVENT = "queso-flavor-navigate";
  const rootObservers = new WeakMap();
  const attributeObservers = new WeakMap();

  const clean = (value) => String(value ?? "").trim();

  function hostValue(element, name, fallback = "") {
    const value = clean(element.getAttribute(name));
    return value || clean(fallback);
  }

  function withFlavor(url, flavor) {
    const target = clean(url);
    const selectedFlavor = clean(flavor).toLowerCase();
    if (!target || !selectedFlavor) return target;

    if (/([?&])flavor=/i.test(target)) {
      return target.replace(
        /([?&]flavor=)[^&#]*/i,
        `$1${encodeURIComponent(selectedFlavor)}`
      );
    }

    const separator = target.includes("?") ? "&" : "?";
    return `${target}${separator}flavor=${encodeURIComponent(selectedFlavor)}`;
  }

  function emitNavigation(element, detail) {
    element.dispatchEvent(
      new CustomEvent(NAVIGATION_EVENT, {
        bubbles: true,
        composed: true,
        detail
      })
    );
  }

  function bindNavigation(element, link, detailFactory) {
    if (!link || link.dataset.quesoNavigationBound === "true") return;

    link.dataset.quesoNavigationBound = "true";
    link.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        const detail = detailFactory();
        if (!detail?.url) return;

        emitNavigation(element, detail);
      },
      true
    );
  }

  function patchElement(element) {
    const root = element.shadowRoot;
    if (!root) return;

    const selectedFlavor = clean(element.selectedFlavor || element.getAttribute("initial-flavor") || "classic").toLowerCase();

    const categoryLinks = root.querySelectorAll(".category-nav a");
    const cakesLink = categoryLinks[0];
    const flavorsLink = categoryLinks[1];

    if (cakesLink) {
      const url = hostValue(element, "cakes-url", cakesLink.getAttribute("href"));
      cakesLink.setAttribute("href", url);
      bindNavigation(element, cakesLink, () => ({
        kind: "category",
        category: "cakes",
        url,
        flavor: selectedFlavor
      }));
    }

    if (flavorsLink) {
      const url = hostValue(element, "flavors-url", flavorsLink.getAttribute("href"));
      flavorsLink.setAttribute("href", url);
      bindNavigation(element, flavorsLink, () => ({
        kind: "category",
        category: "flavors",
        url,
        flavor: selectedFlavor
      }));
    }

    const dropLink = root.querySelector(".drop-choice");
    if (dropLink) {
      const url = hostValue(element, "drop-url", dropLink.getAttribute("href"));
      dropLink.setAttribute("href", url);
      bindNavigation(element, dropLink, () => ({
        kind: "drop",
        url,
        flavor: selectedFlavor,
        productId: hostValue(element, "drop-product-id"),
        productName: hostValue(element, "drop-product-name", "Flavor of the Month")
      }));
    }

    root.querySelectorAll(".format-link").forEach((link, index) => {
      const slot = index + 1;
      const baseUrl = hostValue(
        element,
        `format-${slot}-url`,
        link.getAttribute("href")
      );
      const url = withFlavor(baseUrl, selectedFlavor);

      link.setAttribute("href", url);
      bindNavigation(element, link, () => ({
        kind: "format",
        index,
        slot,
        url: withFlavor(
          hostValue(element, `format-${slot}-url`, baseUrl),
          clean(element.selectedFlavor || selectedFlavor).toLowerCase()
        ),
        flavor: clean(element.selectedFlavor || selectedFlavor).toLowerCase(),
        productId: hostValue(element, `format-${slot}-product-id`),
        productName: hostValue(element, `format-${slot}-product-name`)
      }));
    });

    if (!rootObservers.has(root)) {
      const observer = new MutationObserver(() => {
        queueMicrotask(() => patchElement(element));
      });

      observer.observe(root, {
        childList: true,
        subtree: true
      });

      rootObservers.set(root, observer);
    }

    if (!attributeObservers.has(element)) {
      const observer = new MutationObserver(() => {
        queueMicrotask(() => patchElement(element));
      });

      observer.observe(element, {
        attributes: true
      });

      attributeObservers.set(element, observer);
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
      console.error("Could not load the Queso flavor formats source.");
    },
    { once: true }
  );

  document.head.appendChild(script);
})();
