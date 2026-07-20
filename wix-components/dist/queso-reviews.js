(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const repoAsset = (path) => new URL(path, REPO_ROOT).href;

  const DEFAULT_REVIEWS = [
    {
      image:repoAsset("site/assets/current-site/EDIT BARKADA.png"),
      alt:"Queso and Barkada collaboration",
      quote:"“The limited cheesecake series spotlights distinctive Filipino ingredients like ube.”",
      source:"Tatler Asia",
      label:"Read feature ↗",
      url:"https://www.tatlerasia.com/dining/food/dining-news-hong-kong-apr-24"
    },
    {
      image:repoAsset("site/assets/current-site/IMG_4145_edited.jpg"),
      alt:"Queso cheesecake detail on orange",
      quote:"“Customisable formats, upping the cheesecake game in the city.”",
      source:"Foodie",
      label:"Read feature ↗",
      url:"https://www.afoodieworld.com/blog/2026/05/28/best-cheesecake-hong-kong/"
    },
    {
      image:repoAsset("site/assets/current-site/4BZCMnL7_edited.jpg"),
      alt:"Caramel cheesecake slice",
      quote:"“Customisable luxurious sweets” from a Hong Kong online cheesecake shop.",
      source:"Foodie",
      label:"Read launch note ↗",
      url:"https://www.afoodieworld.com/blog/2025/02/11/queso-bakehouse-hk/"
    }
  ];

  class QuesoReviews extends HTMLElement {
    static get observedAttributes() {
      const attributes = ["eyebrow","title","copy","speed","pause-on-hover"];
      for (let index = 1; index <= 3; index += 1) {
        attributes.push(
          `review-${index}-image`,`review-${index}-image-alt`,`review-${index}-quote`,
          `review-${index}-source`,`review-${index}-label`,`review-${index}-url`
        );
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

    bool(name,fallback=true) {
      const value = this.getAttribute(name);
      if (value === null) return fallback;
      return !["false","0","off","no"].includes(value.toLowerCase());
    }

    escape(value) {
      return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
    }

    get reviews() {
      return DEFAULT_REVIEWS.map((fallback,index) => {
        const number = index + 1;
        return {
          image:this.value(`review-${number}-image`,fallback.image),
          alt:this.value(`review-${number}-image-alt`,fallback.alt),
          quote:this.value(`review-${number}-quote`,fallback.quote),
          source:this.value(`review-${number}-source`,fallback.source),
          label:this.value(`review-${number}-label`,fallback.label),
          url:this.value(`review-${number}-url`,fallback.url)
        };
      });
    }

    card(review,duplicate=false) {
      return `
        <article class="review-card" ${duplicate ? 'aria-hidden="true"' : ""}>
          <img src="${this.escape(review.image)}" alt="${duplicate ? "" : this.escape(review.alt)}" loading="lazy" decoding="async">
          <div class="review-card__copy">
            <div class="stars" aria-label="Press feature">✦ ✦ ✦</div>
            <p class="quote">${this.escape(review.quote)}</p>
            <div class="reviewer">
              <strong>${this.escape(review.source)}</strong>
              ${duplicate ? "" : `<a href="${this.escape(review.url)}" target="_blank" rel="noopener">${this.escape(review.label)}</a>`}
            </div>
          </div>
        </article>
      `;
    }

    render() {
      const speed = Math.max(20,Number(this.value("speed","45")) || 45);
      const cards = this.reviews.map((review) => this.card(review)).join("");
      const duplicateCards = this.reviews.map((review) => this.card(review,true)).join("");
      const pauseClass = this.bool("pause-on-hover",true) ? " review-window--pausable" : "";

      this.shadowRoot.innerHTML = `
        <style>
          @font-face { font-family:"Queso Lovelo"; src:url("${FONT_LOVELO}") format("opentype"); font-weight:900; font-display:block; }
          @font-face { font-family:"Queso Quicksand"; src:url("${FONT_QUICKSAND}") format("truetype"); font-weight:300 700; font-display:swap; }

          :host {
            --orange:#ed6011;
            --cream:#fdf3e6;
            --yellow:#f4c24a;
            --brown:#3d2416;
            --pad:clamp(20px,5vw,76px);
            display:block;
            width:100%;
            height:100%;
            min-height:620px;
            overflow:hidden;
            background:var(--yellow);
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
            padding:clamp(76px,9vw,130px) 0;
            overflow:hidden;
            background:var(--yellow);
            border-bottom:2px solid var(--brown);
          }

          .section-heading {
            padding:0 var(--pad);
            display:flex;
            justify-content:space-between;
            align-items:flex-end;
            gap:30px;
            margin-bottom:42px;
          }

          .eyebrow {
            margin:0 0 8px;
            color:var(--brown);
            font-family:"Queso Lovelo",Arial,sans-serif;
            font-size:clamp(22px,2.8vw,38px);
            font-weight:900;
            letter-spacing:0;
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

          .section-heading > p { max-width:420px; margin:0; font-size:15px; line-height:1.6; }
          .review-window { overflow:hidden; }
          .review-track {
            display:flex;
            width:max-content;
            gap:18px;
            padding:0 9px;
            animation:queso-review-marquee ${speed}s linear infinite;
            will-change:transform;
          }

          .review-window--pausable:hover .review-track,
          .review-window--pausable:focus-within .review-track { animation-play-state:paused; }

          @keyframes queso-review-marquee { to { transform:translateX(-50%); } }

          .review-card {
            width:min(520px,86vw);
            min-height:300px;
            display:grid;
            grid-template-columns:180px 1fr;
            overflow:hidden;
            background:var(--cream);
            border:2px solid var(--brown);
          }

          .review-card > img { width:100%; height:100%; min-height:300px; object-fit:cover; border-right:2px solid var(--brown); }
          .review-card__copy { min-width:0; padding:27px; display:flex; flex-direction:column; }
          .stars { color:var(--orange); letter-spacing:.15em; }
          .quote { margin:20px 0; font-size:18px; line-height:1.55; }
          .reviewer { margin-top:auto; display:flex; align-items:flex-end; justify-content:space-between; gap:18px; font-size:11px; font-weight:800; }
          .reviewer strong { font-family:"Queso Lovelo",Arial,sans-serif; font-size:17px; text-transform:uppercase; }
          .reviewer a { border-bottom:2px solid var(--brown); padding-bottom:3px; text-transform:uppercase; }
          .reviewer a:focus-visible { outline:3px solid var(--orange); outline-offset:4px; }

          @media(max-width:680px) {
            :host { min-height:660px; }
            .section { padding:70px 0; }
            .section-heading { padding:0 20px; align-items:flex-start; flex-direction:column; gap:18px; }
            .review-card { width:82vw; min-height:440px; grid-template-columns:1fr; grid-template-rows:190px 1fr; }
            .review-card > img { min-height:190px; border-right:0; border-bottom:2px solid var(--brown); }
            .review-card__copy { padding:22px; }
            .quote { font-size:16px; }
          }

          @media(prefers-reduced-motion:reduce) {
            .review-track { animation:none; width:auto; overflow-x:auto; scroll-snap-type:x mandatory; }
            .review-card { flex:0 0 auto; scroll-snap-align:start; }
          }
        </style>

        <section class="section" aria-labelledby="queso-reviews-title">
          <header class="section-heading">
            <div>
              <p class="eyebrow">${this.escape(this.value("eyebrow","The word on the street"))}</p>
              <h2 id="queso-reviews-title">${this.escape(this.value("title","Love notes."))}</h2>
            </div>
            <p>${this.escape(this.value("copy","Press coverage from around Hong Kong."))}</p>
          </header>
          <div class="review-window${pauseClass}">
            <div class="review-track">${cards}${duplicateCards}</div>
          </div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-reviews")) {
    customElements.define("queso-reviews",QuesoReviews);
  }
})();
