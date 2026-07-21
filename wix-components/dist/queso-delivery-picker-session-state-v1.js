(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const baseUrl = scriptUrl
    ? new URL("queso-delivery-picker-build.js", scriptUrl)
    : null;
  const SESSION_KEY = "queso-selected-delivery-date";

  function writeSelectedDate(value) {
    try {
      const cleanValue = String(value || "").trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleanValue)) {
        sessionStorage.setItem(SESSION_KEY, cleanValue);
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch (error) {
      console.log("Queso delivery picker session state unavailable:", error);
    }
  }

  function patch(DeliveryPicker) {
    const prototype = DeliveryPicker?.prototype;
    if (!prototype || prototype.__quesoSessionDatePatchedV1) return;

    const originalRender = prototype.render;

    prototype.syncQuesoSelectedDateSession = function syncQuesoSelectedDateSession() {
      writeSelectedDate(this.selectedDate);
    };

    prototype.render = function render() {
      originalRender.call(this);
      this.syncQuesoSelectedDateSession();
    };

    prototype.__quesoSessionDatePatchedV1 = true;

    document.querySelectorAll("queso-delivery-picker").forEach((element) => {
      element.syncQuesoSelectedDateSession?.();
    });
  }

  if (!baseUrl) {
    console.error("Queso delivery picker session state: unable to resolve build URL.");
    return;
  }

  baseUrl.searchParams.set("session-state", "v1");
  baseUrl.searchParams.set("cache", String(Date.now()));

  const script = document.createElement("script");
  script.src = baseUrl.href;
  script.async = false;
  script.onload = async () => {
    await customElements.whenDefined("queso-delivery-picker");
    patch(customElements.get("queso-delivery-picker"));
  };
  script.onerror = () => {
    console.error("Queso delivery picker session state: build failed to load.");
  };

  document.head.appendChild(script);
})();
