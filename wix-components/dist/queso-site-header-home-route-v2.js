(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const baseHeaderUrl = scriptUrl
    ? new URL("queso-site-header.js", scriptUrl).href
    : "";

  function pathFrom(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";

    try {
      return new URL(raw, "https://queso.local").pathname.toLowerCase();
    } catch (_) {
      return raw.toLowerCase();
    }
  }

  function currentPagePath(element) {
    const supplied =
      element.getAttribute("current-path") ||
      element.getAttribute("page-url") ||
      "";

    if (supplied) return pathFrom(supplied);

    const candidates = [
      document.referrer,
      window.location.href
    ];

    for (const candidate of candidates) {
      const path = pathFrom(candidate);
      if (path) return path;
    }

    return "";
  }

  function isHomeRoute(path) {
    const normalized = String(path || "").toLowerCase();
    return normalized.includes("/home") || normalized.includes("/v5-home");
  }

  function applyHomeMenuVisibility(element) {
    const desktopMenu = element.shadowRoot?.querySelector(".desktop-cake-menu");
    if (!desktopMenu) return;

    const show = isHomeRoute(currentPagePath(element));
    desktopMenu.style.display = show ? "" : "none";
    desktopMenu.toggleAttribute("aria-hidden", !show);
  }

  function patch(HeaderClass) {
    const prototype = HeaderClass?.prototype;
    if (!prototype || prototype.__quesoHomeRouteMenuPatched) return;

    const originalRender = prototype.render;
    const originalConnected = prototype.connectedCallback;

    prototype.installQuesoRouteObserver = function installQuesoRouteObserver() {
      if (this.__quesoRouteObserver) return;

      this.__quesoRouteObserver = new MutationObserver((records) => {
        if (records.some((record) =>
          record.attributeName === "current-path" ||
          record.attributeName === "page-url"
        )) {
          applyHomeMenuVisibility(this);
        }
      });

      this.__quesoRouteObserver.observe(this, {
        attributes: true,
        attributeFilter: ["current-path", "page-url"]
      });
    };

    prototype.connectedCallback = function connectedCallback() {
      originalConnected.call(this);
      this.installQuesoRouteObserver();
      applyHomeMenuVisibility(this);
    };

    prototype.render = function render() {
      originalRender.call(this);
      applyHomeMenuVisibility(this);
    };

    prototype.__quesoHomeRouteMenuPatched = true;

    document.querySelectorAll("queso-site-header").forEach((element) => {
      element.installQuesoRouteObserver();
      element.render();
      element.bindEvents();
    });
  }

  if (!baseHeaderUrl) {
    console.error("Queso header route v2: unable to resolve base header URL.");
    return;
  }

  const script = document.createElement("script");
  script.src = `${baseHeaderUrl}?v=home-route-v2-1`;
  script.async = false;
  script.onload = async () => {
    await customElements.whenDefined("queso-site-header");
    patch(customElements.get("queso-site-header"));
  };
  script.onerror = () => {
    console.error("Queso header route v2: base header failed to load.");
  };
  document.head.appendChild(script);
})();
