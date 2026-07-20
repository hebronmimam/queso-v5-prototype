(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;

  const DEFAULT_ITEMS = [
    { symbol: "✦", title: "Baked fresh", copy: "Made fresh for your order." },
    { symbol: "●", title: "Premium ingredients", copy: "New Zealand milk and cream." },
    { symbol: "✓", title: "Halal", copy: "Prepared with Halal ingredients." },
    { symbol: "♥", title: "Extra love", copy: "Playful by design, carefully finished." }
  ];

  class QuesoProofGrid extends HTMLElement {
    static get observedAttributes() {
      const attrs = ["eyebrow", "title"];
      for (let i = 1; i <= 4; i += 1) attrs.push(`item-${i}-title`, `item-${i}-copy`);
      return attrs;
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    connectedCallback() { this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }

    value(name, fallback) {
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

    render() {
      const items = DEFAULT_ITEMS.map((item, index) => ({
        ...item,
        title: this.value(`item-${index + 1}-title`, item.title),
        copy: this.value(`item-${index + 1}-copy`, item.copy)
      }));

      this.shadowRoot.innerHTML = `
        <style>
          @font-face { font-family:"Queso Lovelo"; src:url("${FONT_LOVELO}") format("opentype"); font-weight:900; font-display:block; }
          @font-face { font-family:"Queso Quicksand"; src:url("${FONT_QUICKSAND}") format("truetype"); font-weight:300 700; font-display:swap; }
          :host { --cream:#fdf3e6; --yellow:#f4c24a; --brown:#3d2416; --orange:#ed6011; --pad:clamp(20px,5vw,76px); display:block; width:100%; height:100%; min-height:520px; background:var(--cream); color:var(--brown); font-family:"Queso Quicksand",Arial,sans-serif; font-weight:550; }
          * { box-sizing:border-box; }
          .section { min-height:inherit; height:100%; padding:clamp(76px,9vw,130px) var(--pad); display:flex; flex-direction:column; justify-content:center; background:var(--cream); border-bottom:2px solid var(--brown); }
          .eyebrow { margin:0 0 17px; color:#a84c09; font-size:12px; font-weight:850; letter-spacing:.13em; text-transform:uppercase; }
          h2 { margin:0 0 42px; font-family:"Queso Lovelo",Arial,sans-serif; font-size:clamp(48px,6vw,88px); font-weight:900; line-height:1; text-transform:uppercase; }
          .grid { display:grid; grid-template-columns:repeat(4,1fr); border:2px solid var(--brown); border-radius:18px; overflow:hidden; }
          article { min-height:225px; padding:28px 24px; display:flex; flex-direction:column; align-items:flex-start; justify-content:flex-end; background:#fff; border-right:2px solid var(--brown); }
          article:last-child { border-right:0; }
          .symbol { margin-bottom:auto; width:58px; height:58px; display:grid; place-items:center; border:2px solid var(--brown); border-radius:50%; background:var(--yellow); color:var(--orange); font-size:27px; font-weight:900; }
          strong { margin:24px 0 7px; font-family:"Queso Lovelo",Arial,sans-serif; font-size:clamp(20px,2vw,28px); line-height:1; text-transform:uppercase; }
          span:last-child { font-size:13px; line-height:1.5; }
          @media(max-width:900px) { .grid { grid-template-columns:repeat(2,1fr); } article:nth-child(2) { border-right:0; } article:nth-child(-n+2) { border-bottom:2px solid var(--brown); } }
          @media(max-width:560px) { :host { min-height:auto; } .section { padding:70px 20px; } .grid { grid-template-columns:1fr; } article,article:nth-child(2) { min-height:190px; border-right:0; border-bottom:2px solid var(--brown); } article:last-child { border-bottom:0; } }
        </style>
        <section class="section" aria-labelledby="queso-proof-title">
          <p class="eyebrow">${this.escape(this.value("eyebrow", "Why choose Queso"))}</p>
          <h2 id="queso-proof-title">${this.escape(this.value("title", "Small batch. Big care."))}</h2>
          <div class="grid">
            ${items.map((item) => `<article><span class="symbol" aria-hidden="true">${item.symbol}</span><strong>${this.escape(item.title)}</strong><span>${this.escape(item.copy)}</span></article>`).join("")}
          </div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-proof-grid")) {
    customElements.define("queso-proof-grid", QuesoProofGrid);
  }
})();
