(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const productionBuildUrl = scriptUrl
    ? new URL("queso-cart-drawer-production-build.js", scriptUrl)
    : null;

  function waitForProductionBuild(attempt = 0) {
    const CartDrawer = customElements.get("queso-cart-drawer");
    const prototype = CartDrawer?.prototype;

    if (prototype?.__quesoOptimisticCartPatchedV3) {
      patch(CartDrawer);
      return;
    }

    if (attempt >= 200) {
      console.error("Queso cart fixed footer: production build did not finish loading.");
      return;
    }

    setTimeout(() => waitForProductionBuild(attempt + 1), 25);
  }

  function patch(CartDrawer) {
    const prototype = CartDrawer?.prototype;
    if (!prototype || prototype.__quesoMobileFooterPinnedV1) return;

    const originalBindEvents = prototype.bindEvents;

    prototype.installQuesoPinnedMobileFooter = function installQuesoPinnedMobileFooter() {
      if (!this.shadowRoot) return;

      let style = this.shadowRoot.querySelector("style[data-queso-mobile-footer-pinned]");

      if (!style) {
        style = document.createElement("style");
        style.dataset.quesoMobileFooterPinned = "true";
        style.textContent = `
          @media (max-width: 650px) {
            :host,
            :host([data-wix-frame]) {
              position: fixed !important;
              inset: 0 !important;
              width: 100% !important;
              height: 100dvh !important;
              min-height: 100dvh !important;
              max-height: 100dvh !important;
              overflow: hidden !important;
            }

            .cart-shell {
              position: fixed !important;
              inset: 0 !important;
              width: 100% !important;
              height: 100dvh !important;
              min-height: 100dvh !important;
              max-height: 100dvh !important;
              display: block !important;
              overflow: hidden !important;
            }

            .drawer {
              position: fixed !important;
              inset: 0 !important;
              width: 100% !important;
              height: 100dvh !important;
              min-height: 0 !important;
              max-height: 100dvh !important;
              display: flex !important;
              flex-direction: column !important;
              overflow: hidden !important;
            }

            .drawer-header {
              position: relative !important;
              top: auto !important;
              flex: 0 0 auto !important;
            }

            .cart-content {
              position: relative !important;
              flex: 1 1 auto !important;
              min-height: 0 !important;
              overflow-x: hidden !important;
              overflow-y: auto !important;
              -webkit-overflow-scrolling: touch;
              touch-action: pan-y;
              overscroll-behavior-y: contain;
            }

            .drawer-footer {
              position: relative !important;
              right: auto !important;
              bottom: auto !important;
              left: auto !important;
              width: 100% !important;
              flex: 0 0 auto !important;
              margin-top: auto !important;
              z-index: 4 !important;
              box-shadow: 0 -10px 24px rgba(61, 36, 22, 0.08);
            }
          }
        `;

        this.shadowRoot.appendChild(style);
      }
    };

    prototype.bindEvents = function bindEvents() {
      originalBindEvents.call(this);
      this.installQuesoPinnedMobileFooter();
    };

    prototype.__quesoMobileFooterPinnedV1 = true;

    document.querySelectorAll("queso-cart-drawer").forEach((element) => {
      element.installQuesoPinnedMobileFooter?.();
    });
  }

  if (!productionBuildUrl) {
    console.error("Queso cart fixed footer: unable to resolve production build URL.");
    return;
  }

  productionBuildUrl.searchParams.set("build", "fixed-mobile-footer-1");
  productionBuildUrl.searchParams.set("cache", String(Date.now()));

  const script = document.createElement("script");
  script.src = productionBuildUrl.href;
  script.async = false;
  script.onload = () => waitForProductionBuild();
  script.onerror = () => {
    console.error("Queso cart fixed footer: production build failed to load.");
  };
  document.head.appendChild(script);
})();
