from pathlib import Path

path = Path("wix-components/dist/queso-site-footer.js")
source = path.read_text(encoding="utf-8")

replacements = [
    (
        '''        "brand-copy",
        "copyright",
        "location-copy"
''',
        '''        "brand-copy",
        "copyright",
        "location-copy",
        "newsletter-bridge",
        "newsletter-state",
        "newsletter-message"
''',
    ),
    (
        '''    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }
''',
        '''    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.newsletterEmail = "";
    }
''',
    ),
    (
        '''    attributeChangedCallback() {
      if (!this.isConnected) return;
      this.render();
      this.bindEvents();
    }
''',
        '''    attributeChangedCallback(name, oldValue, newValue) {
      if (!this.isConnected || oldValue === newValue) return;

      if (name === "newsletter-state" && newValue === "success") {
        this.newsletterEmail = "";
      }

      this.render();
      this.bindEvents();
    }
''',
    ),
    (
        '''      const marquee = this.value(
        "marquee",
        "FRESHLY BAKED ✦ HONG KONG ✦ ONLINE ONLY ✦ POPUPS ✦ FREE TST MTR PICKUP ✦"
      );

      this.shadowRoot.innerHTML = `
''',
        '''      const marquee = this.value(
        "marquee",
        "FRESHLY BAKED ✦ HONG KONG ✦ ONLINE ONLY ✦ POPUPS ✦ FREE TST MTR PICKUP ✦"
      );
      const newsletterState = this.value("newsletter-state", "idle").toLowerCase();
      const newsletterDisabled = newsletterState === "submitting";
      const newsletterMessage = this.value(
        "newsletter-message",
        newsletterState === "success"
          ? "You're on the list. Check your inbox soon."
          : newsletterState === "error"
            ? "Something went wrong. Please try again."
            : newsletterDisabled
              ? "Adding you to the list..."
              : ""
      );

      this.shadowRoot.innerHTML = `
''',
    ),
    (
        '''          .footer-form .button {
            height: 54px;
            border-radius: 0;
            background: var(--orange);
            color: #fff;
          }

          .form-status {
''',
        '''          .footer-form .button {
            height: 54px;
            border-radius: 0;
            background: var(--orange);
            color: #fff;
          }

          .footer-form .button:disabled {
            opacity: 0.65;
            cursor: wait;
            transform: none;
          }

          .form-status {
''',
    ),
    (
        '''              <form class="footer-form" novalidate>
                <label for="queso-footer-email">Email address</label>
                <input id="queso-footer-email" required type="email" autocomplete="email" placeholder="${this.escape(this.value("signup-placeholder", "you@example.com"))}">
                <button class="button" type="submit">${this.escape(this.value("signup-button-label", "Sign me up"))}</button>
              </form>
              <div class="form-status" role="status" aria-live="polite"></div>
''',
        '''              <form class="footer-form" novalidate aria-busy="${newsletterDisabled ? "true" : "false"}">
                <label for="queso-footer-email">Email address</label>
                <input id="queso-footer-email" required type="email" autocomplete="email" value="${this.escape(this.newsletterEmail)}" placeholder="${this.escape(this.value("signup-placeholder", "you@example.com"))}">
                <button class="button" type="submit"${newsletterDisabled ? " disabled" : ""}>${this.escape(newsletterDisabled ? "Signing you up..." : this.value("signup-button-label", "Sign me up"))}</button>
              </form>
              <div class="form-status" role="status" aria-live="polite">${this.escape(newsletterMessage)}</div>
''',
    ),
    (
        '''    bindEvents() {
      const form = this.shadowRoot.querySelector(".footer-form");
      const input = this.shadowRoot.querySelector("#queso-footer-email");
      const status = this.shadowRoot.querySelector(".form-status");
      if (!form || !input || !status) return;

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const email = input.value.trim();

        if (!email || !input.checkValidity()) {
          status.textContent = "Enter a valid email address.";
          input.focus();
          return;
        }

        const customEvent = new CustomEvent("queso-newsletter-submit", {
          bubbles: true,
          composed: true,
          cancelable: true,
          detail: { email }
        });

        this.dispatchEvent(customEvent);
        status.textContent = customEvent.defaultPrevented
          ? "You're on the list."
          : "Form received. Connect this event to Wix before launch.";
      });
    }
''',
        '''    bindEvents() {
      const form = this.shadowRoot.querySelector(".footer-form");
      const input = this.shadowRoot.querySelector("#queso-footer-email");
      const button = this.shadowRoot.querySelector(".footer-form .button");
      const status = this.shadowRoot.querySelector(".form-status");
      if (!form || !input || !button || !status) return;

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (form.dataset.submitting === "true") return;

        const email = input.value.trim();

        if (!email || !input.checkValidity()) {
          status.textContent = "Enter a valid email address.";
          input.focus();
          return;
        }

        this.newsletterEmail = email;
        const bridgeEnabled = ["true", "1", "on", "yes"].includes(
          (this.getAttribute("newsletter-bridge") || "").toLowerCase()
        );

        if (!bridgeEnabled) {
          status.textContent = "Form received. Connect this event to Wix before launch.";
          return;
        }

        form.dataset.submitting = "true";
        form.setAttribute("aria-busy", "true");
        button.disabled = true;
        button.textContent = "Signing you up...";
        status.textContent = "Adding you to the list...";

        this.dispatchEvent(new CustomEvent("queso-newsletter-submit", {
          bubbles: true,
          composed: true,
          detail: { email }
        }));
      });
    }
''',
    ),
]

for old, new in replacements:
    if old not in source:
        raise RuntimeError(f"Expected footer snippet was not found:\n{old[:180]}")
    source = source.replace(old, new, 1)

path.write_text(source, encoding="utf-8")
print("Upgraded footer newsletter bridge states and feedback.")
