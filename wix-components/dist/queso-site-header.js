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
        "announcement-1",
        "announcement-2",
        "announcement-3",
        "announcement-4",
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
        "cart-bridge",
        "active-page"
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
      this.mobileMenuOpen = false;
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

    get announcements() {
      return [
        this.value("announcement-1", "Free pickup at Tsim Sha Tsui MTR"),
        this.value("announcement-2", "This month's flavor drop"),
        this.value("announcement-3", "Upcoming pop-ups"),
        this.value("announcement-4", "Hong Kong • online only")
      ];
    }

    get activePage() {
      const explicit = this.value("active-page", "").toLowerCase();
      if (explicit) return explicit;

      let pathname = "";
      try {
        pathname = new URL(document.referrer || window.location.href).pathname.toLowerCase();
      } catch {
        pathname = "";
      }

      if (pathname.includes("flavor")) return "flavors";
      if (pathname.includes("about") || pathname.includes("story")) return "story";
      if (pathname.includes("connect") || pathname.includes("contact")) return "connect";
      if (pathname.includes("cake") || pathname.includes("menu") || pathname.includes("product")) return "menu";
      return "";
    }

    render() {
      const items = this.menuItems;
      const active = items[this.activeMenu] || items[0];
      const activePage = this.activePage;
      const menuLabel = this.value("cakes-label", "Menu");
      const menuUrl = this.value("cakes-url", "/cakes");
      const flavorsLabel = this.value("flavors-label", "Flavors");
      const flavorsUrl = this.value("flavors-url", "/flavors");
      const storyLabel = this.value("story-label", "Our story");
      const storyUrl = this.value("story-url", "/about");
      const connectLabel = this.value("connect-label", "Connect");
      const connectUrl = this.value("connect-url", "/connect");
      const cartLabel = this.value("cart-label", "Cart");
      const cartCount = this.value("cart-count", "0");
      const cartUrl = this.value("cart-url", "/cart");

      const navLink = (page, url, label) => `
        <a${activePage === page ? ' aria-current="page"' : ""} href="${this.escape(url)}">${this.escape(label)}</a>
      `;

      const menuLinks = items.map((item, index) => `
        <a
          class="cake-menu-link${index === this.activeMenu ? " is-active" : ""}"
          href="${this.escape(item.url)}"
          data-menu-index="${index}"
        >${this.escape(item.title)}</a>
      `).join("");

      const categoryLinks = items.map((item) => `
        <a href="${this.escape(item.url)}">${this.escape(item.title)}</a>
      `).join("");

      const announcementRow = this.announcements
        .map((item) => `<span>${this.escape(item)}</span><b>✦</b>`)
        .join("");

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

          :host([data-wix-frame]) { height: auto; }
          *, *::before, *::after { box-sizing: border-box; }
          a { color: inherit; text-decoration: none; }
          button { color: inherit; font: inherit; }
          img { display: block; max-width: 100%; }

          .header {
            position: relative;
            z-index: 20;
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

          .marquee:hover { animation-play-state: paused; }

          .marquee-row {
            display: flex;
            align-items: center;
            white-space: nowrap;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.11em;
            text-transform: uppercase;
          }

          .marquee-row span { padding: 0 20px; }
          .marquee-row b { color: var(--yellow); font-size: 17px; }

          @keyframes header-marquee {
            to { transform: translateX(-50%); }
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
          .desktop-nav a:focus-visible,
          .desktop-nav a[aria-current="page"] {
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

          .menu-toggle {
            display: none;
            padding: 8px;
            border: 0;
            background: transparent;
            cursor: pointer;
          }

          .cart-link:focus-visible,
          .menu-toggle:focus-visible,
          a:focus-visible {
            outline: 3px solid var(--yellow);
            outline-offset: 3px;
          }

          .category-strip,
          .mobile-menu { display: none; }

          .desktop-cake-menu {
            display: grid;
            grid-template-columns: minmax(370px, 0.78fr) 1.22fr;
            background: var(--yellow);
            border-top: 2px solid var(--brown);
          }

          .cake-menu-links {
            display: grid;
            grid-template-columns: 1fr 1fr;
            border-right: 2px solid var(--brown);
          }

          .cake-menu-link {
            min-height: 64px;
            padding: 15px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            border-right: 1px solid rgba(61, 36, 22, 0.35);
            border-bottom: 1px solid rgba(61, 36, 22, 0.35);
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 14px;
            text-transform: uppercase;
          }

          .cake-menu-link:nth-child(2n) { border-right: 0; }
          .cake-menu-link:nth-last-child(-n + 2) { border-bottom: 0; }

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

          .cake-menu-preview-copy {
            padding: 22px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .cake-menu-preview-copy strong {
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 24px;
            text-transform: uppercase;
          }

          .cake-menu-preview-copy p {
            margin: 8px 0 0;
            font-size: 12px;
            line-height: 1.5;
          }

          @media (max-width: 1100px) {
            .desktop-cake-menu,
            .desktop-nav { display: none; }

            .menu-toggle { display: block; }

            .category-strip {
              display: flex;
              overflow-x: auto;
              scrollbar-width: none;
              border-top: 1px solid rgba(61, 36, 22, 0.25);
            }

            .category-strip::-webkit-scrollbar { display: none; }

            .category-strip a {
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

            .mobile-menu.is-open { display: block; }

            .mobile-menu a {
              display: block;
              padding: 15px 0;
              border-bottom: 1px solid rgba(61, 36, 22, 0.25);
              font-family: "Lovelo", Arial, sans-serif;
              font-size: 22px;
              text-transform: uppercase;
            }
          }

          @media (max-width: 580px) {
            .nav { padding: 0 20px; gap: 18px; }
            .logo { width: 122px; }
            .cart-link { font-size: 10px; }
          }

          @media (prefers-reduced-motion: reduce) {
            .marquee { animation: none; }
          }
        </style>

        <header class="header">
          <div class="announcement" aria-label="Site announcements">
            <div class="marquee">
              <div class="marquee-row">${announcementRow}</div>
              <div class="marquee-row" aria-hidden="true">${announcementRow}</div>
            </div>
          </div>

          <div class="nav">
            <a href="${this.escape(this.value("home-url", "/"))}" aria-label="Queso Bakehouse home">
              <img class="logo" src="${LOGO}" alt="Queso Bakehouse" loading="eager" decoding="async">
            </a>

            <nav class="desktop-nav" aria-label="Main navigation">
              ${navLink("menu", menuUrl, menuLabel)}
              ${navLink("flavors", flavorsUrl, flavorsLabel)}
              ${navLink("story", storyUrl, storyLabel)}
              ${navLink("connect", connectUrl, connectLabel)}
            </nav>

            <div class="nav-tools">
              <a class="cart-link" href="${this.escape(cartUrl)}" data-cart-link>${this.escape(cartLabel)} (${this.escape(cartCount)})</a>
              <button class="menu-toggle" type="button" aria-expanded="${String(this.mobileMenuOpen)}" aria-controls="queso-mobile-menu">Menu</button>
            </div>
          </div>

          <div class="category-strip" aria-label="Cake categories">${categoryLinks}</div>

          <nav class="mobile-menu${this.mobileMenuOpen ? " is-open" : ""}" id="queso-mobile-menu" aria-label="Mobile navigation">
            ${navLink("menu", menuUrl, menuLabel)}
            ${navLink("flavors", flavorsUrl, flavorsLabel)}
            ${navLink("story", storyUrl, storyLabel)}
            ${navLink("connect", connectUrl, connectLabel)}
          </nav>

          <div class="desktop-cake-menu" aria-label="Preview cake types">
            <nav class="cake-menu-links">${menuLinks}</nav>
            <div class="cake-menu-preview">
              <img src="${this.escape(active.image)}" alt="${this.escape(active.title)} cheesecake" loading="eager" decoding="async">
              <img src="${this.escape(active.detail)}" alt="${this.escape(active.title)} cheesecake detail" loading="eager" decoding="async">
              <div class="cake-menu-preview-copy">
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
      toggle?.addEventListener("click", () => {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        this.render();
        this.bindEvents();
      });

      const cartLink = this.shadowRoot.querySelector("[data-cart-link]");
      cartLink?.addEventListener("click", (clickEvent) => {
        const bridgeEnabled = ["true", "1", "on", "yes"].includes(
          (this.getAttribute("cart-bridge") || "").toLowerCase()
        );

        if (bridgeEnabled) clickEvent.preventDefault();

        const customEvent = new CustomEvent("queso-cart-open", {
          bubbles: true,
          composed: true,
          cancelable: true,
          detail: { fallbackUrl: cartLink.getAttribute("href") }
        });

        this.dispatchEvent(customEvent);
        if (customEvent.defaultPrevented) clickEvent.preventDefault();
      });
    }
  }

  if (!customElements.get("queso-site-header")) {
    customElements.define("queso-site-header", QuesoSiteHeader);
  }
})();
