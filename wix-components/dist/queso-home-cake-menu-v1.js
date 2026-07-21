(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const repoAsset = (path) => new URL(path, REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

  const DEFAULT_ITEMS = [
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
      copy: "Your image or message, previewed before ordering.",
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
    if (document.head.querySelector("style[data-queso-home-cake-menu-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoHomeCakeMenuFonts = "true";
    style.textContent = `
      @font-face {
        font-family:"Lovelo";
        src:url("${FONT_LOVELO}") format("opentype");
        font-weight:900;
        font-style:normal;
        font-display:swap;
      }
      @font-face {
        font-family:"Quicksand";
        src:url("${FONT_QUICKSAND}") format("truetype");
        font-weight:300 700;
        font-style:normal;
        font-display:swap;
      }
    `;
    document.head.appendChild(style);
  }

  class QuesoHomeCakeMenu extends HTMLElement {
    static get observedAttributes() {
      const names = [];
      for (let index = 1; index <= 4; index += 1) {
        names.push(
          `item-${index}-title`,
          `item-${index}-copy`,
          `item-${index}-url`,
          `item-${index}-image`,
          `item-${index}-detail-image`
        );
      }
      return names;
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.activeIndex = 0;
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
      return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    get items() {
      return DEFAULT_ITEMS.map((fallback, index) => {
        const number = index + 1;
        return {
          title: this.value(`item-${number}-title`, fallback.title),
          copy: this.value(`item-${number}-copy`, fallback.copy),
          url: this.value(`item-${number}-url`, fallback.url),
          image: this.value(`item-${number}-image`, fallback.image),
          detail: this.value(`item-${number}-detail-image`, fallback.detail)
        };
      });
    }

    render() {
      const items = this.items;
      const active = items[this.activeIndex] || items[0];
      const links = items.map((item, index) => `
        <a
          class="cake-menu-link${index === this.activeIndex ? " is-active" : ""}"
          href="${this.escape(item.url)}"
          data-menu-index="${index}"
        >${this.escape(item.title)}</a>
      `).join("");

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            --orange:#ed6011;
            --yellow:#f4c24a;
            --brown:#3d2416;
            display:block;
            width:100%;
            height:100%;
            min-height:0;
            overflow:hidden;
            background:var(--yellow);
            color:var(--brown);
            font-family:"Quicksand",Arial,sans-serif;
            font-weight:550;
          }
          :host([data-wix-frame]) { height:auto; }
          :host([data-wix-frame]) .cake-menu {
            position:fixed;
            inset:0;
            width:auto;
            height:auto;
          }
          *,*::before,*::after { box-sizing:border-box; }
          a { color:inherit; text-decoration:none; }
          img { display:block; max-width:100%; }
          .cake-menu {
            display:grid;
            grid-template-columns:minmax(370px,.78fr) 1.22fr;
            width:100%;
            height:100%;
            min-height:170px;
            background:var(--yellow);
            border-block:2px solid var(--brown);
          }
          .cake-menu-links {
            display:grid;
            grid-template-columns:1fr 1fr;
            border-right:2px solid var(--brown);
          }
          .cake-menu-link {
            min-height:84px;
            padding:15px 24px;
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:20px;
            border-right:1px solid rgba(61,36,22,.35);
            border-bottom:1px solid rgba(61,36,22,.35);
            font-family:"Lovelo",Arial,sans-serif;
            font-size:14px;
            text-transform:uppercase;
          }
          .cake-menu-link:nth-child(2n) { border-right:0; }
          .cake-menu-link:nth-last-child(-n + 2) { border-bottom:0; }
          .cake-menu-link::after {
            content:"↗";
            font-family:"Quicksand",Arial,sans-serif;
            font-size:14px;
          }
          .cake-menu-link.is-active,
          .cake-menu-link:hover,
          .cake-menu-link:focus-visible {
            background:var(--orange);
            color:#fff;
          }
          .cake-menu-preview {
            display:grid;
            grid-template-columns:1fr 1fr 1.05fr;
            min-height:170px;
            background:#fff;
          }
          .cake-menu-preview img {
            width:100%;
            height:100%;
            min-height:170px;
            object-fit:cover;
            border-right:2px solid var(--brown);
          }
          .cake-menu-preview-copy {
            padding:22px;
            display:flex;
            flex-direction:column;
            justify-content:center;
          }
          .cake-menu-preview-copy strong {
            font-family:"Lovelo",Arial,sans-serif;
            font-size:24px;
            text-transform:uppercase;
          }
          .cake-menu-preview-copy p {
            margin:8px 0 0;
            font-size:12px;
            line-height:1.5;
          }
          @media(max-width:1100px) {
            .cake-menu { grid-template-columns:1fr; }
            .cake-menu-links { border-right:0; border-bottom:2px solid var(--brown); }
            .cake-menu-preview { min-height:220px; }
          }
          @media(max-width:680px) {
            .cake-menu-links { grid-template-columns:1fr; }
            .cake-menu-link {
              min-height:58px;
              border-right:0;
              border-bottom:1px solid rgba(61,36,22,.35);
            }
            .cake-menu-link:last-child { border-bottom:0; }
            .cake-menu-preview { grid-template-columns:1fr 1fr; }
            .cake-menu-preview-copy { grid-column:1/-1; border-top:2px solid var(--brown); }
            .cake-menu-preview img { min-height:190px; }
          }
        </style>

        <section class="cake-menu" aria-label="Choose a cake type">
          <nav class="cake-menu-links">${links}</nav>
          <div class="cake-menu-preview">
            <img src="${this.escape(active.image)}" alt="${this.escape(active.title)} cheesecake" loading="eager" decoding="async">
            <img src="${this.escape(active.detail)}" alt="${this.escape(active.title)} cheesecake detail" loading="eager" decoding="async">
            <div class="cake-menu-preview-copy">
              <strong>${this.escape(active.title)}</strong>
              <p>${this.escape(active.copy)}</p>
            </div>
          </div>
        </section>
      `;
    }

    bindEvents() {
      this.shadowRoot.querySelectorAll("[data-menu-index]").forEach((link) => {
        const activate = () => {
          const index = Number(link.dataset.menuIndex);
          if (!Number.isFinite(index) || index === this.activeIndex) return;
          this.activeIndex = index;
          this.render();
          this.bindEvents();
        };

        link.addEventListener("mouseenter", activate);
        link.addEventListener("focus", activate);
      });
    }
  }

  if (!customElements.get("queso-home-cake-menu")) {
    customElements.define("queso-home-cake-menu", QuesoHomeCakeMenu);
  }
})();
