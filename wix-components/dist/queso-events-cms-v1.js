(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const baseUrl = scriptUrl
    ? new URL("queso-events.js", scriptUrl).href
    : "";

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function readPressItems(element) {
    try {
      const raw = element.getAttribute("press-items") || "[]";
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter((item) => item && item.logo)
        .map((item) => ({
          title: String(item.title || "Featured publication"),
          logo: String(item.logo || ""),
          altText: String(item.altText || item.title || "Featured publication logo"),
          link: String(item.link || "")
        }));
    } catch (error) {
      console.error("Queso events press-items JSON error:", error);
      return [];
    }
  }

  function ensureLogoStyles(element) {
    const style = element.shadowRoot?.querySelector("style");
    if (!style || style.dataset.quesoPressLogoStyles === "true") return;

    style.dataset.quesoPressLogoStyles = "true";
    style.textContent += `
      .press-link--logo {
        min-width: 170px;
        min-height: 78px;
        padding: 14px 20px;
      }

      .press-link--logo img {
        display: block;
        width: auto;
        max-width: 145px;
        height: auto;
        max-height: 42px;
        object-fit: contain;
        object-position: center;
        filter: brightness(0) saturate(100%);
      }

      @media (max-width: 680px) {
        .press-link--logo img {
          max-width: 128px;
          max-height: 38px;
        }
      }
    `;
  }

  function applyPressItems(element) {
    const container = element.shadowRoot?.querySelector(".press-logos");
    if (!container) return;

    const items = readPressItems(element);
    if (!items.length) return;

    ensureLogoStyles(element);

    container.innerHTML = items
      .map((item) => {
        const content = `<img src="${escapeHtml(item.logo)}" alt="${escapeHtml(item.altText)}" loading="lazy" decoding="async">`;

        if (!item.link) {
          return `<span class="press-link press-link--logo" aria-label="${escapeHtml(item.title)}">${content}</span>`;
        }

        return `<a class="press-link press-link--logo" href="${escapeHtml(item.link)}" target="_blank" rel="noopener" aria-label="${escapeHtml(item.title)}">${content}</a>`;
      })
      .join("");
  }

  function observePressItems(element) {
    if (element.__quesoPressItemsObserver) return;

    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.attributeName === "press-items")) {
        applyPressItems(element);
      }
    });

    observer.observe(element, {
      attributes: true,
      attributeFilter: ["press-items"]
    });

    element.__quesoPressItemsObserver = observer;
  }

  function patch(EventsClass) {
    const prototype = EventsClass?.prototype;
    if (!prototype || prototype.__quesoPressCmsPatched) return;

    const originalRender = prototype.render;
    const originalConnectedCallback = prototype.connectedCallback;
    const originalDisconnectedCallback = prototype.disconnectedCallback;

    prototype.render = function render() {
      originalRender.call(this);
      applyPressItems(this);
    };

    prototype.connectedCallback = function connectedCallback() {
      originalConnectedCallback.call(this);
      observePressItems(this);
      applyPressItems(this);
    };

    prototype.disconnectedCallback = function disconnectedCallback() {
      this.__quesoPressItemsObserver?.disconnect();
      this.__quesoPressItemsObserver = null;
      originalDisconnectedCallback?.call(this);
    };

    prototype.__quesoPressCmsPatched = true;

    document.querySelectorAll("queso-events").forEach((element) => {
      observePressItems(element);
      element.render();
    });
  }

  if (!baseUrl) {
    console.error("Queso events CMS: unable to resolve base component URL.");
    return;
  }

  const script = document.createElement("script");
  script.src = `${baseUrl}?cms=press-v1`;
  script.async = false;
  script.onload = async () => {
    await customElements.whenDefined("queso-events");
    patch(customElements.get("queso-events"));
  };
  script.onerror = () => {
    console.error("Queso events CMS: base component failed to load.");
  };

  document.head.appendChild(script);
})();
