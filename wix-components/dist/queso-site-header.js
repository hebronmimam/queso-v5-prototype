(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const LOGO = new URL("logo/Quesco Logo.svg", REPO_ROOT).href;
  const repoAsset = (path) => new URL(path, REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

  const DEFAULT_MENU = [
    {
      title: "Birthday Suit",
      copy: "Naked, playful and ready for the candles.",
      url: "/cakes/birthday-suit",
      image: repoAsset("assets/generated-campaign/02-birthday-suit.png"),
      detail: repoAsset("site/assets/v3-originals/birthday-slice-detail.png")
    },
    {
      title: "Artisan",
      copy: "A polished centerpiece with an elevated finish.",
      url: "/cakes/artisan",
      image: repoAsset("assets/generated-campaign/03-artisan.png"),
      detail: repoAsset("site/assets/v3-originals/artisan-chocolate-detail.png")
    },
    {
      title: "Canvas",
      copy: "Your image and message, finished on the cake.",
      url: "/cakes/canvas",
      image: repoAsset("assets/generated-campaign/04-canvas.png"),
      detail: repoAsset("site/assets/v3-originals/canvas-graphic-top.png")
    },
    {
      title: "Flavor Drop",
      copy: "One rotating flavor, available for a limited time.",
      url: "/cakes/flavor-drop",
      image: repoAsset("site/assets/current-site/lotus-biscoff-main.png"),
      detail: repoAsset("site/assets/current-site/lotus-biscoff-detail.jpg")
    }
  ];

  function installFonts() {
    if (document.head.querySelector("style[data-queso-header-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoHeaderFonts = "true";
    style.textContent = `
      @font-face {
        font-family: "Lovelo";
        src: url("${FONT_LOVELO}") format("opentype");
        font-weight: 900;
        font-style: normal;
        font-display: swap;
      }

      @font-face {
        font-family: "Quicksand";
        src: url("${FONT_QUICKSAND}") format("truetype");
        font-weight: 300 700;
        font-style: normal;
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }

  class QuesoSiteHeader extends HTMLElement {
    static get observedAttributes() {
      const attributes = [
        "announcement",
        "home-url",
        "cakes-label",
        "cakes-url",
        "flavors-label",
        "flavors-url",
        "story-label",
        "story-url",
        "connect-label",
        "connect-url",
        "cart-label",
        "cart-url",
        "cart-count",
        "cart-bridge"
      ];

      for (let index = 1; index <= 4; index += 1) {
        attributes.push(
          `menu-${index}-title`,
          `menu-${index}-copy`,
          `menu-${index}-url`,
          `menu-${index}-image`,
          `menu-${index}-detail-image`
        );
      }

      return attributes;
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.activeMenu = 0;
    }

    connectedCallback() {
      installFonts();
      this.toggleAttribute("data-wix-frame", IS_WIX_FRAME);
      this.render();
      this.bindEvents();
    }

    attributeChangedCallback() {
      if (!this.isConnected) return;
      this.render();
      this.bindEvents();
    }

    value(name, fallback = "") {
      const value = this.getAttribute(name);
      return value === null || value.trim() === "" ? fallback : value.trim();
    }

    escape(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    get menuItems() {
      return DEFAULT_MENU.map((fallback, index) => {
        const number = index + 1;

        return {
          title: this.value(`menu-${number}-title`, fallback.title),
          copy: this.value(`menu-${number}-copy`, fallback.copy),
          url: this.value(`menu-${number}-url`, fallback.url),
          image: this.value(`menu-${number}-image`, fallback.image),
          detail: this.value(`menu-${number}-detail-image`, fallback.detail)
        };
      });
    }

    render() {
      const announcement = this.value(
        "announcement",
        "Free island-wide delivery on orders over HKD 600"
      );
      const items = this.menuItems;
      const active = items[this.activeMenu] || items[0];
      const menuLinks = items.map((item, index) => `
        <a class="cake-menu-link${index === this.activeMenu ? " is-active" : ""}" href="${this.escape(item.url)}" data-menu-index="${index}">${this.escape(item.title)}</a>
      `).join("");
      const mobileLinks = items.map((item) => `
        <a href="${this.escape(item.url)}">${this.escape(item.title)}</a>
      `).join("");
      const marqueeRow = `${this.escape(announcement)} <b>✦</b> ${this.escape(announcement)} <b>✦</b> ${this.escape(announcement)} <b>✦</b>`;

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            --orange: #ed6011;
            --cream: #fdf3e6;
            --yellow: #f4c24a;
            --brown: #3d2416;
            --pad: clamp(20px, 5vw, 76px);
            display: block;
            width: 100%;
            height: 100%;
            min-height: 0;
            overflow: visible;
            background: var(--cream);
            color: var(--brown);
            font-family: "Quicksand", Arial, sans-serif;
            font-weight: 550;
            font-synthesis: none;
            text-rendering: geometricPrecision;
          }

          :host([data-wix-frame]) {
            height: auto;
          }

          *, *::before, *::after {
            box-sizing: border-box;
          }

          a {
            color: inherit;
            text-decoration: none;
          }

          button {
            color: inherit;
            font: inherit;
          }

          img {
            display: block;
            max-width: 100%;
          }

          .header {
            position: relative;
            z-index: 10;
            width: 100%;
            height: 100%;
            min-height: 0;
            overflow: visible;
            background: var(--cream);
            border-bottom: 2px solid var(--brown);
          }

          :host([data-wix-frame]) .header {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
          }

          .announcement {
            height: 38px;
            overflow: hidden;
            display: flex;
            align-items: center;
            background: var(--orange);
            color: #fff;
            border-bottom: 2px solid var(--brown);
          }

          .marquee {
            display: flex;
            width: max-content;
            animation: header-marquee 28s linear infinite;
            will-change: transform;
          }

          .marquee:hover {
            animation-play-state: paused;
          }

          .marquee-row {
            display: flex;
            align-items: center;
            white-space: nowrap;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.02em;
          }

          .marquee-row span {
            padding: 0 20px;
          }

          .marquee-row b {
            margin: 0 18px;
            color: var(--yellow);
            font-size: 17px;
          }

          @keyframes header-marquee {
            to {
              transform: translateX(-50%);
            }
          }

          .nav {
            height: 88px;
            padding: 0 var(--pad);
            display: flex;
            align-items: center;
            gap: 42px;
            background: var(--cream);
          }

          .logo {
            width: 148px;
            height: 58px;
            object-fit: contain;
          }

          .desktop-nav {
            display: flex;
            gap: 30px;
            margin-left: 8px;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }

          .desktop-nav a {
            padding: 9px 0;
            border-bottom: 2px solid transparent;
          }

          .desktop-nav a:hover,
          .desktop-nav a:focus-visible {
            color: var(--orange);
            border-color: var(--orange);
          }

          .nav-tools {
            margin-left: auto;
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .cart-link,
          .menu-toggle {
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }

          .cart-link:focus-visible,
          .menu-toggle:focus-visible,
          a:focus-visible {
            outline: 3px solid var(--yellow);
            outline-offset: 3px;
          }

          .menu-toggle {
            display: none;
            padding: 8px;
            border: 0;
            background: transparent;
            cursor: pointer;
          }

          .desktop-cake-menu {
            display: grid;
            grid-template-columns: minmax(370px, 0.78fr) 1.22fr;
            min-height: 170px;
            background: var(--yellow);
            border-top: 2px solid var(--brown);
          }

          .cake-menu-links {
            display: grid;
            grid-template-columns: 1fr 1fr;
            border-right: 2px solid var(--brown);
          }

          .cake-menu-link {
            min-height: 84px;
            padding: 15px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            border-right: 1px solid rgba(61, 36, 22, 0.35);
            border-bottom: 1px solid rgba(61, 36, 22, 0.35);
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 14px;
            font-weight: 900;
            text-transform: uppercase;
          }

          .cake-menu-link:nth-child(2n) {
            border-right: 0;
          }

          .cake-menu-link:nth-last-child(-n + 2) {
            border-bottom: 0;
          }

          .cake-menu-link::after {
            content: "↗";
            font-family: "Quicksand", Arial, sans-serif;
            font-size: 14px;
          }

          .cake-menu-link.is-active,
          .cake-menu-link:hover,
          .cake-menu-link:focus-visible {
            background: var(--orange);
            color: #fff;
          }

          .cake-menu-preview {
            display: grid;
            grid-template-columns: 1fr 1fr 1.05fr;
            min-height: 170px;
            background: #fff;
          }

          .cake-menu-preview img {
            width: 100%;
            height: 170px;
            object-fit: cover;
            border-right: 2px solid var(--brown);
          }

          .cake-menu-preview__copy {
            padding: 22px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .cake-menu-preview__copy strong {
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 24px;
            font-weight: 900;
            text-transform: uppercase;
          }

          .cake-menu-preview__copy p {
            margin: 8px 0 0;
            font-size: 12px;
            line-height: 1.5;
          }

          .mobile-category-strip,
          .mobile-menu {
            display: none;
          }

          @media (max-width: 1100px) {
            .desktop-cake-menu,
            .desktop-nav {
              display: none;
            }

            .menu-toggle {
              display: block;
            }

            .mobile-category-strip {
              display: flex;
              overflow-x: auto;
              scrollbar-width: none;
              border-top: 1px solid rgba(61, 36, 22, 0.25);
            }

            .mobile-category-strip::-webkit-scrollbar {
              display: none;
            }

            .mobile-category-strip a {
              flex: 0 0 auto;
              padding: 12px 17px;
              border-right: 1px solid rgba(61, 36, 22, 0.25);
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
            }

            .mobile-menu {
              position: absolute;
              inset: 126px 0 auto;
              z-index: 30;
              padding: 20px var(--pad);
              background: var(--cream);
              border-bottom: 2px solid var(--brown);
            }

            .mobile-menu.is-open {
              display: block;
            }

            .mobile-menu a {
              display: block;
              padding: 15px 0;
              border-bottom: 1px solid rgba(61, 36, 22, 0.25);
              font-family: "Lovelo", Arial, sans-serif;
              font-size: 22px;
              font-weight: 900;
              text-transform: uppercase;
            }
          }

          @media (max-width: 580px) {
            .nav {
              padding: 0 20px;
              gap: 18px;
            }

            .logo {
              width: 122px;
            }

            .cart-link {
              font-size: 10px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .marquee {
              animation: none;
            }
          }
        </style>

        <header class="header">
          <div class="announcement" aria-label="Site announcement">
            <div class="marquee">
              <div class="marquee-row"><span>${marqueeRow}</span></div>
              <div class="marquee-row" aria-hidden="true"><span>${marqueeRow}</span></div>
            </div>
          </div>

          <div class="nav">
            <a href="${this.escape(this.value("home-url", "/"))}" aria-label="Queso Bakehouse home">
              <img class="logo" src="${LOGO}" alt="Queso Bakehouse" loading="eager" decoding="async">
            </a>
            <nav class="desktop-nav" aria-label="Main navigation">
              <a href="${this.escape(this.value("cakes-url", "/cakes"))}">${this.escape(this.value("cakes-label", "Cakes"))}</a>
              <a href="${this.escape(this.value("flavors-url", "/flavors"))}">${this.escape(this.value("flavors-label", "Flavors"))}</a>
            </nav>
            <div class="nav-tools">
              <nav class="desktop-nav" aria-label="Secondary navigation">
                <a href="${this.escape(this.value("story-url", "/about"))}">${this.escape(this.value("story-label", "Our Story"))}</a>
                <a href="${this.escape(this.value("connect-url", "/connect"))}">${this.escape(this.value("connect-label", "Connect"))}</a>
              </nav>
              <a class="cart-link" href="${this.escape(this.value("cart-url", "/cart"))}" data-cart-link>${this.escape(this.value("cart-label", "Cart"))} ${this.escape(this.value("cart-count", "0"))}</a>
              <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="queso-mobile-menu">Menu</button>
            </div>
          </div>

          <nav class="mobile-category-strip" aria-label="Cake categories">${mobileLinks}</nav>
          <nav class="mobile-menu" id="queso-mobile-menu" aria-label="Mobile navigation">
            <a href="${this.escape(this.value("cakes-url", "/cakes"))}">${this.escape(this.value("cakes-label", "Cakes"))}</a>
            <a href="${this.escape(this.value("flavors-url", "/flavors"))}">${this.escape(this.value("flavors-label", "Flavors"))}</a>
            <a href="${this.escape(this.value("story-url", "/about"))}">${this.escape(this.value("story-label", "Our Story"))}</a>
            <a href="${this.escape(this.value("connect-url", "/connect"))}">${this.escape(this.value("connect-label", "Connect"))}</a>
          </nav>

          <div class="desktop-cake-menu" aria-label="Preview cake types">
            <nav class="cake-menu-links">${menuLinks}</nav>
            <div class="cake-menu-preview">
              <img src="${this.escape(active.image)}" alt="${this.escape(active.title)} cheesecake" loading="eager" decoding="async">
              <img src="${this.escape(active.detail)}" alt="${this.escape(active.title)} cheesecake detail" loading="eager" decoding="async">
              <div class="cake-menu-preview__copy">
                <strong>${this.escape(active.title)}</strong>
                <p>${this.escape(active.copy)}</p>
              </div>
            </div>
          </div>
        </header>
      `;
    }

    bindEvents() {
      this.shadowRoot.querySelectorAll("[data-menu-index]").forEach((link) => {
        const activate = () => {
          const index = Number(link.dataset.menuIndex);
          if (!Number.isFinite(index) || index === this.activeMenu) return;
          this.activeMenu = index;
          this.render();
          this.bindEvents();
        };

        link.addEventListener("mouseenter", activate);
        link.addEventListener("focus", activate);
      });

      const toggle = this.shadowRoot.querySelector(".menu-toggle");
      const menu = this.shadowRoot.querySelector(".mobile-menu");

      toggle?.addEventListener("click", () => {
        const open = menu?.classList.toggle("is-open") || false;
        toggle.setAttribute("aria-expanded", String(open));
      });

      const cartLink = this.shadowRoot.querySelector("[data-cart-link]");

      cartLink?.addEventListener("click", (clickEvent) => {
        const bridgeEnabled = ["true", "1", "on", "yes"].includes(
          (this.getAttribute("cart-bridge") || "").toLowerCase()
        );

        if (bridgeEnabled) {
          clickEvent.preventDefault();
        }

        const customEvent = new CustomEvent("queso-cart-open", {
          bubbles: true,
          composed: true,
          cancelable: true,
          detail: { fallbackUrl: cartLink.getAttribute("href") }
        });

        this.dispatchEvent(customEvent);

        if (customEvent.defaultPrevented) {
          clickEvent.preventDefault();
        }
      });
    }
  }

  if (!customElements.get("queso-site-header")) {
    customElements.define("queso-site-header", QuesoSiteHeader);
  }
})();
