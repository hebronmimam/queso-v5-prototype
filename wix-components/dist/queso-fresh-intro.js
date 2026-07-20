(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;

  class QuesoFreshIntro extends HTMLElement {
    static get observedAttributes() {
      return ["eyebrow", "title", "copy"];
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
      const eyebrow = this.value("eyebrow", "Fresh out the kitchen");
      const title = this.value("title", "we make them freshhhhh");
      const copy = this.value("copy", "with premium cream cheese made from fresh New Zealand milk and cream. Delivered straight to your door from our licensed kitchen.");

      this.shadowRoot.innerHTML = `
        <style>
          @font-face { font-family:"Queso Lovelo"; src:url("${FONT_LOVELO}") format("opentype"); font-weight:900; font-display:block; }
          @font-face { font-family:"Queso Quicksand"; src:url("${FONT_QUICKSAND}") format("truetype"); font-weight:300 700; font-display:swap; }
          :host { --yellow:#f4c24a; --brown:#3d2416; display:block; width:100%; height:100%; min-height:390px; background:var(--yellow); color:var(--brown); font-family:"Queso Quicksand",Arial,sans-serif; font-weight:550; }
          * { box-sizing:border-box; }
          .intro { min-height:inherit; height:100%; padding:clamp(76px,9vw,130px) clamp(20px,5vw,76px); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; background:var(--yellow); border-bottom:2px solid var(--brown); }
          .eyebrow { margin:0 0 17px; color:#a84c09; font-size:12px; font-weight:850; letter-spacing:.13em; text-transform:uppercase; }
          h2 { max-width:1150px; margin:0; font-family:"Queso Lovelo",Arial,sans-serif; font-size:clamp(54px,7vw,104px); font-weight:900; line-height:1.04; text-transform:uppercase; }
          .copy { max-width:810px; margin:26px auto 0; font-size:clamp(16px,1.8vw,21px); line-height:1.6; }
          @media(max-width:680px) { :host { min-height:360px; } .intro { padding:70px 20px; } h2 { font-size:clamp(42px,13vw,60px); } .copy { font-size:16px; } }
        </style>
        <section class="intro" aria-labelledby="queso-fresh-intro-title">
          <p class="eyebrow">${this.escape(eyebrow)}</p>
          <h2 id="queso-fresh-intro-title">${this.escape(title)}</h2>
          <p class="copy">${this.escape(copy)}</p>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-fresh-intro")) {
    customElements.define("queso-fresh-intro", QuesoFreshIntro);
  }
})();
