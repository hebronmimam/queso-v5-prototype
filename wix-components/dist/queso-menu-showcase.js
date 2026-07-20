(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const repoAsset = (path) => new URL(path, REPO_ROOT).href;

  const DEFAULT_ITEMS = [
    {
      tag: "Celebration",
      tagClass: "",
      title: "Birthday Suit",
      copy: "Our playful party-ready cheesecake.",
      price: "From HKD 368",
      image: repoAsset("assets/generated-campaign/02-birthday-suit.png"),
      imageAlt: "Birthday Suit cheesecake",
      hoverImage: repoAsset("site/assets/v3-originals/birthday-slice-detail.png"),
      hoverAlt: "Birthday Suit cheesecake slice",
      primaryLabel: "Add to cart",
      primaryUrl: "/checkout",
      secondaryLabel: "See details",
      secondaryUrl: "/cakes/birthday-suit",
      productName: "Birthday Suit",
      productPrice: "368"
    },
    {
      tag: "Polished",
      tagClass: "pink",
      title: "Artisan",
      copy: "A refined centerpiece with a caramelized finish.",
      price: "From HKD 378",
      image: repoAsset("assets/generated-campaign/03-artisan.png"),
      imageAlt: "Artisan cheesecake",
      hoverImage: repoAsset("site/assets/v3-originals/artisan-chocolate-detail.png"),
      hoverAlt: "Chocolate Artisan cheesecake slice",
      primaryLabel: "Add to cart",
      primaryUrl: "/checkout",
      secondaryLabel: "See details",
      secondaryUrl: "/cakes/artisan",
      productName: "Artisan",
      productPrice: "378"
    },
    {
      tag: "Personalized",
      tagClass: "orange",
      title: "Canvas",
      copy: "Upload an image and add your own message.",
      price: "HKD 498",
      image: repoAsset("assets/generated-campaign/04-canvas.png"),
      imageAlt: "Canvas personalized cheesecake",
      hoverImage: repoAsset("site/assets/v3-originals/canvas-graphic-top.png"),
      hoverAlt: "Canvas graphic cheesecake top",
      primaryLabel: "Customize",
      primaryUrl: "/cakes/canvas#customize",
      secondaryLabel: "See details",
      secondaryUrl: "/cakes/canvas",
      productName: "Canvas",
      productPrice: "498"
    },
    {
      tag: "Leaving soon",
      tagClass: "dark",
      title: "This Month's Flavor Drop",
      copy: "Lotus Biscoff cheesecake, freshly made and available for a limited time.",
      price: "HKD 528",
      image: repoAsset("site/assets/current-site/lotus-biscoff-main.png"),
      imageAlt: "Lotus Biscoff flavor drop cheesecake",
      hoverImage: repoAsset("site/assets/current-site/lotus-biscoff-detail.jpg"),
      hoverAlt: "Lotus Biscoff cheesecake detail",
      primaryLabel: "Add to cart",
      primaryUrl: "/checkout",
      secondaryLabel: "See details",
      secondaryUrl: "/cakes/flavor-drop",
      productName: "Lotus Biscoff Cheesecake",
      productPrice: "528"
    }
  ];

  class QuesoMenuShowcase extends HTMLElement {
    static get observedAttributes() {
      const attributes = ["eyebrow", "title", "link-label", "link-url"];
      for (let index = 1; index <= 4; index += 1) {
        attributes.push(
          `item-${index}-tag`,
          `item-${index}-title`,
          `item-${index}-copy`,
          `item-${index}-price`,
          `item-${index}-image`,
          `item-${index}-image-alt`,
          `item-${index}-hover-image`,
          `item-${index}-hover-alt`,
          `item-${index}-primary-label`,
          `item-${index}-primary-url`,
          `item-${index}-secondary-label`,
          `item-${index}-secondary-url`
        );
      }
      return attributes;
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
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

    get items() {
      return DEFAULT_ITEMS.map((fallback, index) => {
        const number = index + 1;
        return {
          ...fallback,
          tag: this.value(`item-${number}-tag`, fallback.tag),
          title: this.value(`item-${number}-title`, fallback.title),
          copy: this.value(`item-${number}-copy`, fallback.copy),
          price: this.value(`item-${number}-price`, fallback.price),
          image: this.value(`item-${number}-image`, fallback.image),
          imageAlt: this.value(`item-${number}-image-alt`, fallback.imageAlt),
          hoverImage: this.value(`item-${number}-hover-image`, fallback.hoverImage),
          hoverAlt: this.value(`item-${number}-hover-alt`, fallback.hoverAlt),
          primaryLabel: this.value(`item-${number}-primary-label`, fallback.primaryLabel),
          primaryUrl: this.value(`item-${number}-primary-url`, fallback.primaryUrl),
          secondaryLabel: this.value(`item-${number}-secondary-label`, fallback.secondaryLabel),
          secondaryUrl: this.value(`item-${number}-secondary-url`, fallback.secondaryUrl)
        };
      });
    }

    render() {
      const cards = this.items.map((item, index) => `
        <article class="menu-card">
          <div class="menu-card__media">
            <img src="${this.escape(item.image)}" alt="${this.escape(item.imageAlt)}" loading="lazy" decoding="async">
            <img class="menu-card__alt" src="${this.escape(item.hoverImage)}" alt="${this.escape(item.hoverAlt)}" loading="lazy" decoding="async">
          </div>
          <div class="menu-card__body">
            <span class="tag tag--${item.tagClass}">${this.escape(item.tag)}</span>
            <h3>${this.escape(item.title)}</h3>
            <p>${this.escape(item.copy)}</p>
            <span class="price">${this.escape(item.price)}</span>
            <div class="card-actions">
              <a
                class="button button--primary"
                href="${this.escape(item.primaryUrl)}"
                data-primary-action="${index}"
              >${this.escape(item.primaryLabel)}</a>
              <a class="button" href="${this.escape(item.secondaryUrl)}">${this.escape(item.secondaryLabel)}</a>
            </div>
          </div>
        </article>
      `).join("");

      this.shadowRoot.innerHTML = `
        <style>
          @font-face { font-family:"Queso Lovelo"; src:url("${FONT_LOVELO}") format("opentype"); font-weight:900; font-display:block; }
          @font-face { font-family:"Queso Quicksand"; src:url("${FONT_QUICKSAND}") format("truetype"); font-weight:300 700; font-display:swap; }

          :host {
            --orange:#ed6011;
            --cream:#fdf3e6;
            --yellow:#f4c24a;
            --brown:#3d2416;
            --pink:#efa3b5;
            --pad:clamp(20px,5vw,76px);
            display:block;
            width:100%;
            height:100%;
            min-height:860px;
            background:var(--cream);
            color:var(--brown);
            font-family:"Queso Quicksand",Arial,sans-serif;
            font-weight:550;
          }

          *,*::before,*::after { box-sizing:border-box; }
          a { color:inherit; text-decoration:none; }
          img { display:block; max-width:100%; }

          .section {
            min-height:inherit;
            height:100%;
            padding:clamp(76px,9vw,130px) var(--pad);
            background:var(--cream);
            border-bottom:2px solid var(--brown);
          }

          .section-heading {
            display:flex;
            justify-content:space-between;
            align-items:flex-end;
            gap:30px;
            margin-bottom:42px;
          }

          .eyebrow {
            margin:0 0 17px;
            color:#a84c09;
            font-size:12px;
            font-weight:850;
            letter-spacing:.13em;
            text-transform:uppercase;
          }

          h2 {
            margin:0;
            font-family:"Queso Lovelo",Arial,sans-serif;
            font-size:clamp(48px,6vw,88px);
            font-weight:900;
            line-height:1;
            text-transform:uppercase;
          }

          .text-link {
            padding-bottom:4px;
            border-bottom:2px solid var(--brown);
            font-size:11px;
            font-weight:850;
            text-transform:uppercase;
          }

          .menu-track {
            display:grid;
            grid-template-columns:repeat(4,minmax(0,1fr));
            gap:18px;
          }

          .menu-card {
            display:flex;
            flex-direction:column;
            min-width:0;
            overflow:hidden;
            background:#fff;
            border:2px solid var(--brown);
            border-radius:18px;
          }

          .menu-card__media {
            position:relative;
            aspect-ratio:.9;
            overflow:hidden;
            border-bottom:2px solid var(--brown);
            background:var(--yellow);
          }

          .menu-card__media img {
            width:100%;
            height:100%;
            object-fit:cover;
            transition:opacity 300ms ease,transform 350ms ease;
          }

          .menu-card__alt {
            position:absolute;
            inset:0;
            opacity:0;
          }

          .menu-card:hover .menu-card__media img:first-child,
          .menu-card:focus-within .menu-card__media img:first-child { opacity:0; }

          .menu-card:hover .menu-card__alt,
          .menu-card:focus-within .menu-card__alt { opacity:1; transform:scale(1.025); }

          .menu-card__body {
            display:flex;
            flex:1;
            flex-direction:column;
            padding:20px;
          }

          .tag {
            align-self:flex-start;
            padding:6px 9px;
            border:1.5px solid var(--brown);
            border-radius:999px;
            background:var(--yellow);
            font-size:8px;
            font-weight:900;
            letter-spacing:.08em;
            text-transform:uppercase;
          }

          .tag--pink { background:var(--pink); }
          .tag--orange { background:var(--orange); color:#fff; }
          .tag--dark { background:var(--brown); color:#fff; }

          h3 {
            margin:16px 0 9px;
            font-family:"Queso Lovelo",Arial,sans-serif;
            font-size:clamp(23px,2.2vw,32px);
            font-weight:900;
            line-height:1.03;
            text-transform:uppercase;
          }

          .menu-card p { margin:0 0 20px; font-size:13px; line-height:1.5; }
          .price { margin-top:auto; font-size:13px; font-weight:850; }

          .card-actions {
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:7px;
            margin-top:17px;
          }

          .button {
            min-height:42px;
            padding:0 15px;
            display:inline-flex;
            align-items:center;
            justify-content:center;
            border:2px solid var(--brown);
            border-radius:10px;
            background:#fff;
            font-size:9px;
            font-weight:850;
            letter-spacing:.05em;
            text-align:center;
            text-transform:uppercase;
            transition:transform 150ms ease,background-color 150ms ease;
          }

          .button:hover,.button:focus-visible { transform:translateY(-2px); }
          .button:focus-visible,.text-link:focus-visible { outline:3px solid var(--yellow); outline-offset:3px; }
          .button--primary { background:var(--orange); color:#fff; }

          @media(max-width:1100px) {
            :host { min-height:auto; }
            .menu-track { grid-template-columns:repeat(2,minmax(0,1fr)); }
          }

          @media(max-width:620px) {
            .section { padding:70px 20px; }
            .section-heading { align-items:flex-start; flex-direction:column; gap:18px; }
            .menu-track { grid-template-columns:1fr; }
            .menu-card__media { aspect-ratio:1.15; }
          }

          @media(prefers-reduced-motion:reduce) {
            .menu-card__media img,.button { transition:none; }
          }
        </style>

        <section class="section" aria-labelledby="queso-menu-title">
          <header class="section-heading">
            <div>
              <p class="eyebrow">${this.escape(this.value("eyebrow", "Choose your mood"))}</p>
              <h2 id="queso-menu-title">${this.escape(this.value("title", "The menu."))}</h2>
            </div>
            <a class="text-link" href="${this.escape(this.value("link-url", "/cakes"))}">${this.escape(this.value("link-label", "See all cake types →"))}</a>
          </header>
          <div class="menu-track">${cards}</div>
        </section>
      `;
    }

    bindEvents() {
      this.shadowRoot.querySelectorAll("[data-primary-action]").forEach((link) => {
        link.addEventListener("click", (event) => {
          const index = Number(link.dataset.primaryAction);
          const item = this.items[index];
          if (!item || !item.primaryLabel.toLowerCase().includes("add")) return;

          this.dispatchEvent(new CustomEvent("queso-add-to-cart", {
            bubbles:true,
            composed:true,
            cancelable:true,
            detail:{
              index,
              productName:item.productName,
              price:item.productPrice,
              image:item.image,
              fallbackUrl:item.primaryUrl
            }
          }));

          if (event.defaultPrevented) event.preventDefault();
        });
      });
    }
  }

  if (!customElements.get("queso-menu-showcase")) {
    customElements.define("queso-menu-showcase", QuesoMenuShowcase);
  }
})();
