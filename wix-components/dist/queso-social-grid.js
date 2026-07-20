(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const repoAsset = (path) => new URL(path, REPO_ROOT).href;

  const DEFAULT_ITEMS = [
    { image:repoAsset("queso site media/SYC09535.jpg"), alt:"Three square Queso cheesecakes styled on red and yellow" },
    { image:repoAsset("queso site media/IMG_9171_edited.jpg"), alt:"Square meringue cheesecake photographed with direct flash" },
    { image:repoAsset("queso site media/cereal_milk_1_edited.jpg"), alt:"Close view of Queso cereal milk cheesecake" },
    { image:repoAsset("queso site media/Cinna_Banana_4.jpg"), alt:"Cinnamon banana cheesecake slice against an orange backdrop" }
  ];

  class QuesoSocialGrid extends HTMLElement {
    static get observedAttributes() {
      const attributes = ["eyebrow","title","link-label","link-url"];
      for (let index = 1; index <= 4; index += 1) {
        attributes.push(`item-${index}-image`,`item-${index}-image-alt`,`item-${index}-url`);
      }
      return attributes;
    }

    constructor() {
      super();
      this.attachShadow({ mode:"open" });
    }

    connectedCallback() { this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }

    value(name,fallback="") {
      const value = this.getAttribute(name);
      return value === null || value.trim() === "" ? fallback : value.trim();
    }

    escape(value) {
      return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
    }

    get items() {
      const defaultUrl = this.value("link-url","https://www.instagram.com/quesohk/");
      return DEFAULT_ITEMS.map((item,index) => ({
        image:this.value(`item-${index + 1}-image`,item.image),
        alt:this.value(`item-${index + 1}-image-alt`,item.alt),
        url:this.value(`item-${index + 1}-url`,defaultUrl)
      }));
    }

    render() {
      const tiles = this.items.map((item) => `
        <a class="social-tile" href="${this.escape(item.url)}" target="_blank" rel="noopener">
          <img src="${this.escape(item.image)}" alt="${this.escape(item.alt)}" loading="lazy" decoding="async">
          <span aria-hidden="true">↗</span>
        </a>
      `).join("");

      this.shadowRoot.innerHTML = `
        <style>
          @font-face { font-family:"Queso Lovelo"; src:url("${FONT_LOVELO}") format("opentype"); font-weight:900; font-display:block; }
          @font-face { font-family:"Queso Quicksand"; src:url("${FONT_QUICKSAND}") format("truetype"); font-weight:300 700; font-display:swap; }

          :host {
            --cream:#fdf3e6;
            --yellow:#f4c24a;
            --brown:#3d2416;
            --pad:clamp(20px,5vw,76px);
            display:block;
            width:100%;
            height:100%;
            min-height:760px;
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

          .social-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:13px; }

          .social-tile {
            position:relative;
            aspect-ratio:1;
            overflow:hidden;
            background:#fff;
            border:2px solid var(--brown);
          }

          .social-tile img {
            width:100%;
            height:100%;
            object-fit:cover;
            transition:transform 350ms ease;
          }

          .social-tile > span {
            position:absolute;
            right:10px;
            top:10px;
            width:32px;
            height:32px;
            display:grid;
            place-items:center;
            background:var(--yellow);
            border:2px solid var(--brown);
            border-radius:50%;
            font-weight:900;
          }

          .social-tile:hover img,.social-tile:focus-visible img { transform:scale(1.035); }
          .social-tile:focus-visible,.text-link:focus-visible { outline:3px solid var(--yellow); outline-offset:4px; }

          @media(max-width:900px) {
            :host { min-height:auto; }
            .social-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
          }

          @media(max-width:560px) {
            .section { padding:70px 20px; }
            .section-heading { align-items:flex-start; flex-direction:column; gap:18px; }
            .social-grid { grid-template-columns:1fr; }
          }

          @media(prefers-reduced-motion:reduce) { .social-tile img { transition:none; } }
        </style>

        <section class="section" aria-labelledby="queso-social-title">
          <header class="section-heading">
            <div>
              <p class="eyebrow">${this.escape(this.value("eyebrow","@quesohk"))}</p>
              <h2 id="queso-social-title">${this.escape(this.value("title","From the feed."))}</h2>
            </div>
            <a class="text-link" href="${this.escape(this.value("link-url","https://www.instagram.com/quesohk/"))}" target="_blank" rel="noopener">${this.escape(this.value("link-label","Follow on Instagram ↗"))}</a>
          </header>
          <div class="social-grid">${tiles}</div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-social-grid")) {
    customElements.define("queso-social-grid",QuesoSocialGrid);
  }
})();
