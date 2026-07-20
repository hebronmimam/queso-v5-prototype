(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const repoAsset = (path) => new URL(path, REPO_ROOT).href;

  const DEFAULT_FLAVORS = [
    { mark:"CL", className:"classic", title:"Classic", copy:"Clean & creamy", url:"/flavors?flavor=classic#choose-format", spark:"✦" },
    { mark:"CH", className:"chocolate", title:"Chocolate", copy:"Deep & fudgy", url:"/flavors?flavor=chocolate#choose-format", spark:"●" },
    { mark:"LE", className:"lemon", title:"Lemon", copy:"Bright & zesty", url:"/flavors?flavor=lemon#choose-format", spark:"✦" },
    { mark:"CA", className:"caramel", title:"Caramel", copy:"Toasty & rich", url:"/flavors?flavor=caramel#choose-format", spark:"●" },
    { mark:"UB", className:"ube", title:"Ube", copy:"Nutty & mellow", url:"/flavors?flavor=ube#choose-format", spark:"✦" },
    { mark:"DROP", className:"drop", title:"Monthly Drop", copy:"Here for a good time", url:"/cakes/flavor-drop", spark:"↗" }
  ];

  class QuesoFlavorShowcase extends HTMLElement {
    static get observedAttributes() {
      const attributes = ["eyebrow", "title", "copy", "image", "image-alt", "stamp", "button-label", "button-url"];
      for (let index = 1; index <= 6; index += 1) {
        attributes.push(`flavor-${index}-title`, `flavor-${index}-copy`, `flavor-${index}-url`);
      }
      return attributes;
    }

    constructor() {
      super();
      this.attachShadow({ mode:"open" });
    }

    connectedCallback() { this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }

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

    get flavors() {
      return DEFAULT_FLAVORS.map((item, index) => ({
        ...item,
        title:this.value(`flavor-${index + 1}-title`, item.title),
        copy:this.value(`flavor-${index + 1}-copy`, item.copy),
        url:this.value(`flavor-${index + 1}-url`, item.url)
      }));
    }

    render() {
      const flavorsMarkup = this.flavors.map((item) => `
        <a class="flavor-link" href="${this.escape(item.url)}">
          <span class="flavor-mark flavor-mark--${item.className}" aria-hidden="true">${this.escape(item.mark)}</span>
          <span class="flavor-link__copy"><strong>${this.escape(item.title)}</strong><small>${this.escape(item.copy)}</small></span>
          <span class="flavor-spark" aria-hidden="true">${this.escape(item.spark)}</span>
        </a>
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
            --purple:#76509a;
            display:block;
            width:100%;
            height:100%;
            min-height:720px;
            background:var(--orange);
            color:#fff;
            font-family:"Queso Quicksand",Arial,sans-serif;
            font-weight:550;
          }

          *,*::before,*::after { box-sizing:border-box; }
          a { color:inherit; text-decoration:none; }
          img { display:block; max-width:100%; }

          .showcase {
            min-height:inherit;
            height:100%;
            display:grid;
            grid-template-columns:1.1fr .9fr;
            background:var(--orange);
            border-block:2px solid var(--brown);
          }

          .media {
            position:relative;
            overflow:hidden;
            border-right:2px solid var(--brown);
          }

          .media img { width:100%; height:100%; object-fit:cover; }

          .stamp {
            position:absolute;
            top:28px;
            left:28px;
            width:110px;
            height:110px;
            display:grid;
            place-items:center;
            padding:14px;
            border:2px solid var(--brown);
            border-radius:50%;
            background:var(--yellow);
            color:var(--brown);
            font-family:"Queso Lovelo",Arial,sans-serif;
            font-size:16px;
            line-height:1.05;
            text-align:center;
            text-transform:uppercase;
            transform:rotate(-6deg);
          }

          .copy-panel {
            padding:clamp(55px,8vw,110px);
            display:flex;
            flex-direction:column;
            justify-content:center;
          }

          .eyebrow {
            margin:0 0 17px;
            color:var(--yellow);
            font-size:12px;
            font-weight:850;
            letter-spacing:.13em;
            text-transform:uppercase;
          }

          h2 {
            margin:0;
            font-family:"Queso Lovelo",Arial,sans-serif;
            font-size:clamp(58px,6.5vw,98px);
            font-weight:900;
            line-height:1.02;
            text-transform:uppercase;
          }

          .intro-copy { max-width:560px; margin:20px 0 0; font-size:18px; line-height:1.6; }

          .flavor-links {
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:10px;
            margin:25px 0 30px;
          }

          .flavor-link {
            min-width:0;
            padding:12px;
            display:flex;
            align-items:center;
            gap:10px;
            background:var(--cream);
            color:var(--brown);
            border:2px solid var(--brown);
            font-size:11px;
            font-weight:800;
            text-transform:uppercase;
            transition:background-color 150ms ease,transform 150ms ease;
          }

          .flavor-link:hover,.flavor-link:focus-visible { background:var(--yellow); transform:translateY(-2px); }
          .flavor-link:focus-visible,.button:focus-visible { outline:3px solid var(--cream); outline-offset:3px; }

          .flavor-mark {
            width:52px;
            height:52px;
            flex:0 0 52px;
            display:grid;
            place-items:center;
            border:2px solid var(--brown);
            background:var(--yellow);
            font-family:"Queso Lovelo",Arial,sans-serif;
            font-size:14px;
            line-height:1;
            text-align:center;
          }

          .flavor-mark--classic { border-radius:50%; background:var(--cream); }
          .flavor-mark--chocolate { border-radius:8px; background:var(--brown); color:var(--cream); }
          .flavor-mark--lemon { border-radius:50% 8px 50% 8px; background:var(--yellow); }
          .flavor-mark--caramel { border-radius:50% 50% 8px 50%; background:var(--orange); color:#fff; }
          .flavor-mark--ube { border-radius:50%; background:var(--purple); color:#fff; }
          .flavor-mark--drop { background:var(--pink); transform:rotate(3deg); }

          .flavor-link__copy { min-width:0; display:flex; flex-direction:column; gap:3px; }
          .flavor-link__copy strong { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
          .flavor-link__copy small { font-size:9px; font-weight:650; opacity:.75; }
          .flavor-spark { margin-left:auto; font-size:18px; }

          .button {
            align-self:flex-start;
            min-height:50px;
            padding:0 22px;
            display:inline-flex;
            align-items:center;
            justify-content:center;
            border:2px solid var(--brown);
            border-radius:10px;
            background:var(--yellow);
            color:var(--brown);
            font-size:11px;
            font-weight:850;
            letter-spacing:.05em;
            text-transform:uppercase;
            transition:transform 150ms ease;
          }

          .button:hover,.button:focus-visible { transform:translateY(-2px); }

          @media(max-width:900px) {
            :host { min-height:auto; }
            .showcase { grid-template-columns:1fr; }
            .media { min-height:520px; border-right:0; border-bottom:2px solid var(--brown); }
          }

          @media(max-width:580px) {
            .media { min-height:420px; }
            .copy-panel { padding:70px 20px; }
            .flavor-links { grid-template-columns:1fr; }
            .stamp { top:18px; left:18px; width:92px; height:92px; font-size:13px; }
          }

          @media(prefers-reduced-motion:reduce) { .flavor-link,.button { transition:none; } }
        </style>

        <section class="showcase" aria-labelledby="queso-flavor-title">
          <div class="media">
            <img
              src="${this.escape(this.value("image", repoAsset("site/assets/v3-originals/flavor-five-overhead.png")))}"
              alt="${this.escape(this.value("image-alt", "Five Queso cheesecake flavors"))}"
              loading="lazy"
              decoding="async"
            >
            <div class="stamp">${this.escape(this.value("stamp", "Pick your flavor ✦"))}</div>
          </div>
          <div class="copy-panel">
            <p class="eyebrow">${this.escape(this.value("eyebrow", "Find your favorite"))}</p>
            <h2 id="queso-flavor-title">${this.escape(this.value("title", "Same formats. Different mood."))}</h2>
            <p class="intro-copy">${this.escape(this.value("copy", "Start with a flavor, then choose the cake type that fits the occasion."))}</p>
            <div class="flavor-links">${flavorsMarkup}</div>
            <a class="button" href="${this.escape(this.value("button-url", "/flavors"))}">${this.escape(this.value("button-label", "Browse by flavor"))}</a>
          </div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-flavor-showcase")) {
    customElements.define("queso-flavor-showcase", QuesoFlavorShowcase);
  }
})();
