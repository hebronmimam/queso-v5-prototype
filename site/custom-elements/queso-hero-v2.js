const QUESO_HERO_ASSET_BASE = "https://cdn.jsdelivr.net/gh/hebronmimam/queso-v5-prototype@7581791";

class QuesoHeroV2 extends HTMLElement {
  static get observedAttributes() {
    return [
      "autoplay",
      "interval",
      "autoplay-delay",
      "initial-slide",
      "sticker",
      "show-sticker",
      "show-dots",
      "slide-1-eyebrow",
      "slide-1-title",
      "slide-1-copy",
      "slide-1-image",
      "slide-1-image-alt",
      "slide-1-image-position",
      "slide-1-primary-label",
      "slide-1-primary-url",
      "slide-1-secondary-label",
      "slide-1-secondary-url",
      "slide-2-eyebrow",
      "slide-2-title",
      "slide-2-copy",
      "slide-2-image",
      "slide-2-image-alt",
      "slide-2-image-position",
      "slide-2-primary-label",
      "slide-2-primary-url",
      "slide-3-eyebrow",
      "slide-3-title",
      "slide-3-copy",
      "slide-3-image",
      "slide-3-image-alt",
      "slide-3-image-position",
      "slide-3-primary-label",
      "slide-3-primary-url"
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.activeSlide = 0;
    this.slideTimer = null;
    this.startTimer = null;
    this.touchStartX = 0;
    this.touchEndX = 0;
  }

  connectedCallback() {
    this.preloadCriticalAssets();
    this.activeSlide = this.initialSlide;
    this.render();
    this.bindEvents();
    this.showSlide(this.activeSlide, false);
    this.startAutoplay();
  }

  disconnectedCallback() {
    this.stopAutoplay();
  }

  attributeChangedCallback() {
    if (!this.isConnected) return;
    this.stopAutoplay();
    this.activeSlide = this.initialSlide;
    this.render();
    this.bindEvents();
    this.showSlide(this.activeSlide, false);
    this.startAutoplay();
  }

  getSetting(name, fallback = "") {
    const value = this.getAttribute(name);
    return value === null || value.trim() === "" ? fallback : value.trim();
  }

  getBoolean(name, fallback = true) {
    const value = this.getAttribute(name);
    if (value === null) return fallback;
    return !["false", "0", "off", "no"].includes(value.toLowerCase());
  }

  getNumber(name, fallback, minimum = 0) {
    const value = Number(this.getAttribute(name));
    return Number.isFinite(value) && value >= minimum ? value : fallback;
  }

  get initialSlide() {
    const value = Math.round(this.getNumber("initial-slide", 0, 0));
    return Math.min(value, 2);
  }

  get slides() {
    return [
      {
        eyebrow: this.getSetting("slide-1-eyebrow", "Hong Kong • online only • popups"),
        title: this.getSetting("slide-1-title", "Freshly baked. Delivered."),
        copy: this.getSetting("slide-1-copy", "Small-batch cheesecakes for birthdays, big news, tiny wins and everything in between."),
        image: this.getSetting("slide-1-image", `${QUESO_HERO_ASSET_BASE}/site/assets/v4-originals/hero-rose-wide.png`),
        alt: this.getSetting("slide-1-image-alt", "Square rose cheesecake on red draped fabric"),
        position: this.getSetting("slide-1-image-position", "center center"),
        primaryLabel: this.getSetting("slide-1-primary-label", "Shop the menu"),
        primaryUrl: this.getSetting("slide-1-primary-url", "/cakes"),
        secondaryLabel: this.getSetting("slide-1-secondary-label", "Find a popup"),
        secondaryUrl: this.getSetting("slide-1-secondary-url", "#popups")
      },
      {
        eyebrow: this.getSetting("slide-2-eyebrow", "Hong Kong • online only • popups"),
        title: this.getSetting("slide-2-title", "The birthday cake, upgraded."),
        copy: this.getSetting("slide-2-copy", "Celebration-first cheesecake with playful color and a polished finish."),
        image: this.getSetting("slide-2-image", `${QUESO_HERO_ASSET_BASE}/site/assets/v4-originals/hero-canvas-wide.png`),
        alt: this.getSetting("slide-2-image-alt", "Square Canvas cheesecake on a hot pink backdrop"),
        position: this.getSetting("slide-2-image-position", "center center"),
        primaryLabel: this.getSetting("slide-2-primary-label", "Meet Birthday Suit"),
        primaryUrl: this.getSetting("slide-2-primary-url", "/cakes/birthday-suit"),
        secondaryLabel: "",
        secondaryUrl: ""
      },
      {
        eyebrow: this.getSetting("slide-3-eyebrow", "Hong Kong • online only • popups"),
        title: this.getSetting("slide-3-title", "Bring the good cake."),
        copy: this.getSetting("slide-3-copy", "Freshly made in Hong Kong and ready to be the center of the table."),
        image: this.getSetting("slide-3-image", `${QUESO_HERO_ASSET_BASE}/site/assets/v4-originals/hero-artisan-wide.png`),
        alt: this.getSetting("slide-3-image-alt", "Square caramel meringue cheesecake on a mustard backdrop"),
        position: this.getSetting("slide-3-image-position", "center center"),
        primaryLabel: this.getSetting("slide-3-primary-label", "Choose your cake"),
        primaryUrl: this.getSetting("slide-3-primary-url", "/cakes"),
        secondaryLabel: "",
        secondaryUrl: ""
      }
    ];
  }

  preloadCriticalAssets() {
    const assets = [
      `${QUESO_HERO_ASSET_BASE}/Lovelo_Black.otf`,
      `${QUESO_HERO_ASSET_BASE}/Quicksand-VariableFont_wght.ttf`,
      this.getSetting("slide-1-image", `${QUESO_HERO_ASSET_BASE}/site/assets/v4-originals/hero-rose-wide.png`)
    ];

    assets.forEach((href, index) => {
      if (document.head.querySelector(`link[data-queso-hero-preload="${index}"]`)) return;
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = href;
      link.setAttribute("data-queso-hero-preload", String(index));
      link.as = index === 2 ? "image" : "font";
      if (index < 2) {
        link.crossOrigin = "anonymous";
        link.type = index === 0 ? "font/otf" : "font/ttf";
      }
      document.head.appendChild(link);
    });
  }

  escape(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  renderButton(label, url, modifier = "primary") {
    if (!label || !url) return "";
    return `<a class="button button--${modifier}" href="${this.escape(url)}">${this.escape(label)}</a>`;
  }

  render() {
    const sticker = this.getSetting("sticker", "NOT YOUR EVERYDAY CHEESECAKE");
    const slides = this.slides;

    const slideMarkup = slides.map((slide, index) => `
      <article class="slide${index === this.activeSlide ? " is-active" : ""}" data-slide="${index}" aria-hidden="${index === this.activeSlide ? "false" : "true"}">
        <img
          class="slide__image"
          src="${this.escape(slide.image)}"
          alt="${this.escape(slide.alt)}"
          style="object-position:${this.escape(slide.position)}"
          ${index === this.activeSlide ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'}
          decoding="async"
        >
        <div class="slide__overlay" aria-hidden="true"></div>
        <div class="slide__copy">
          <p class="eyebrow">${this.escape(slide.eyebrow)}</p>
          ${index === 0 ? `<h1 class="display">${this.escape(slide.title)}</h1>` : `<h2 class="display">${this.escape(slide.title)}</h2>`}
          <p class="lead">${this.escape(slide.copy)}</p>
          <div class="actions">
            ${this.renderButton(slide.primaryLabel, slide.primaryUrl, "primary")}
            ${this.renderButton(slide.secondaryLabel, slide.secondaryUrl, "cream")}
          </div>
        </div>
      </article>
    `).join("");

    const dots = slides.map((_, index) => `
      <button class="dot${index === this.activeSlide ? " is-active" : ""}" type="button" data-dot="${index}" aria-label="Show hero slide ${index + 1}" aria-pressed="${index === this.activeSlide ? "true" : "false"}"></button>
    `).join("");

    this.shadowRoot.innerHTML = `
      <style>
        @font-face{font-family:"Queso Lovelo";src:url("${QUESO_HERO_ASSET_BASE}/Lovelo_Black.otf") format("opentype");font-weight:900;font-display:swap}
        @font-face{font-family:"Queso Quicksand";src:url("${QUESO_HERO_ASSET_BASE}/Quicksand-VariableFont_wght.ttf") format("truetype");font-weight:300 700;font-display:swap}
        :host{--orange:#ed6011;--cream:#fdf3e6;--yellow:#f4c24a;--brown:#3d2416;--pink:#efa3b5;--pad:clamp(20px,4.45vw,72px);display:block;width:100%;height:100%;min-height:650px;background:var(--cream);color:var(--brown);font-family:"Queso Quicksand",Arial,sans-serif;font-weight:550}
        *,*::before,*::after{box-sizing:border-box}
        a{color:inherit;text-decoration:none}
        button{font:inherit}
        .hero{position:relative;width:100%;height:100%;min-height:650px;overflow:hidden;background:var(--cream);border-block:2px solid var(--brown);isolation:isolate}
        .slide{position:absolute;inset:0;opacity:0;visibility:hidden;pointer-events:none}
        .hero.is-mounted .slide{transition:opacity 650ms ease,visibility 650ms ease}
        .slide.is-active{opacity:1;visibility:visible;pointer-events:auto}
        .slide__image{position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:cover;background:var(--cream)}
        .slide__overlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(253,243,230,.99) 0%,rgba(253,243,230,.96) 29%,rgba(253,243,230,.82) 40%,rgba(253,243,230,.08) 67%)}
        .slide__copy{position:absolute;z-index:2;left:var(--pad);top:50%;width:min(535px,42vw);transform:translateY(-50%)}
        .eyebrow{margin:0 0 20px;color:#a84c09;font-size:11px;font-weight:850;letter-spacing:.14em;text-transform:uppercase}
        .display{margin:0;font-family:"Queso Lovelo",Arial,sans-serif;font-size:clamp(68px,6.2vw,102px);font-weight:900;line-height:.98;letter-spacing:0;text-transform:uppercase}
        .lead{max-width:510px;margin:28px 0 24px;font-size:clamp(16px,1.25vw,19px);line-height:1.55}
        .actions{display:flex;flex-wrap:wrap;gap:10px}
        .button{min-height:46px;padding:0 20px;display:inline-flex;align-items:center;justify-content:center;border:2px solid var(--brown);border-radius:10px;text-transform:uppercase;font-size:10px;font-weight:850;letter-spacing:.05em;transition:transform 150ms ease,background-color 150ms ease}
        .button:hover,.button:focus-visible{transform:translateY(-2px)}
        .button:focus-visible,.dot:focus-visible{outline:3px solid var(--yellow);outline-offset:3px}
        .button--primary{background:var(--orange);color:#fff}
        .button--cream{background:var(--cream)}
        .sticker{position:absolute;z-index:4;top:23px;right:var(--pad);max-width:min(290px,34vw);padding:12px 20px;background:var(--pink);border:2px solid var(--brown);border-radius:999px;font-size:9px;font-weight:900;line-height:1.2;letter-spacing:.05em;text-align:center;transform:rotate(2deg)}
        .controls{position:absolute;z-index:5;right:var(--pad);bottom:27px;display:flex;gap:8px}
        .dot{width:14px;height:14px;padding:0;border:2px solid #fff;border-radius:50%;background:transparent;cursor:pointer}
        .dot.is-active{background:var(--yellow)}
        @media(max-width:980px){.slide__copy{width:min(570px,58vw)}.display{font-size:clamp(62px,8vw,90px)}}
        @media(max-width:680px){:host,.hero{min-height:620px}.slide__overlay{background:linear-gradient(180deg,rgba(253,243,230,.99) 0%,rgba(253,243,230,.9) 40%,rgba(253,243,230,.12) 78%)}.slide__image{object-position:62% center!important}.slide__copy{top:43%;right:20px;left:20px;width:auto}.eyebrow{margin-bottom:13px;font-size:9px}.display{font-size:clamp(44px,13vw,56px);line-height:1}.lead{margin:18px 0;font-size:15px}.button{min-height:46px;padding:0 16px;font-size:9px}.sticker{top:18px;right:18px;max-width:230px;padding:10px 14px;font-size:8px}.controls{right:20px;bottom:25px}}
        @media(prefers-reduced-motion:reduce){.hero.is-mounted .slide,.button{transition:none}}
      </style>
      <section class="hero" aria-roledescription="carousel" aria-label="Featured Queso cheesecakes">
        <div class="slides" aria-live="polite">${slideMarkup}</div>
        ${this.getBoolean("show-sticker", true) ? `<div class="sticker">${this.escape(sticker)}</div>` : ""}
        ${this.getBoolean("show-dots", true) ? `<div class="controls" aria-label="Choose a hero slide">${dots}</div>` : ""}
      </section>
    `;

    requestAnimationFrame(() => {
      this.shadowRoot.querySelector(".hero")?.classList.add("is-mounted");
    });
  }

  bindEvents() {
    this.shadowRoot.querySelectorAll("[data-dot]").forEach((dot) => {
      dot.addEventListener("click", () => {
        this.showSlide(Number(dot.dataset.dot));
        this.restartAutoplay();
      });
    });

    const hero = this.shadowRoot.querySelector(".hero");
    if (!hero) return;

    hero.addEventListener("mouseenter", () => this.stopAutoplay());
    hero.addEventListener("mouseleave", () => this.startAutoplay());
    hero.addEventListener("focusin", () => this.stopAutoplay());
    hero.addEventListener("focusout", () => this.startAutoplay());
    hero.addEventListener("touchstart", (event) => {
      this.touchStartX = event.changedTouches[0]?.screenX || 0;
    }, { passive: true });
    hero.addEventListener("touchend", (event) => {
      this.touchEndX = event.changedTouches[0]?.screenX || 0;
      const distance = this.touchEndX - this.touchStartX;
      if (Math.abs(distance) < 45) return;
      this.showSlide(this.activeSlide + (distance < 0 ? 1 : -1));
      this.restartAutoplay();
    }, { passive: true });
  }

  showSlide(index, animate = true) {
    const slides = [...this.shadowRoot.querySelectorAll("[data-slide]")];
    const dots = [...this.shadowRoot.querySelectorAll("[data-dot]")];
    if (!slides.length) return;

    if (!animate) this.shadowRoot.querySelector(".hero")?.classList.remove("is-mounted");
    this.activeSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === this.activeSlide;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
      const image = slide.querySelector("img");
      if (image && active) {
        image.loading = "eager";
        image.fetchPriority = "high";
      }
    });

    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === this.activeSlide;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-pressed", String(active));
    });

    if (!animate) requestAnimationFrame(() => this.shadowRoot.querySelector(".hero")?.classList.add("is-mounted"));
  }

  startAutoplay() {
    if (!this.getBoolean("autoplay", true) || this.slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (this.slideTimer || this.startTimer) return;

    const delay = this.getNumber("autoplay-delay", 0, 0);
    const interval = this.getNumber("interval", 5200, 2500);
    const begin = () => {
      this.startTimer = null;
      if (this.slideTimer) return;
      this.slideTimer = window.setInterval(() => this.showSlide(this.activeSlide + 1), interval);
    };

    if (delay > 0) this.startTimer = window.setTimeout(begin, delay);
    else begin();
  }

  stopAutoplay() {
    if (this.startTimer) window.clearTimeout(this.startTimer);
    if (this.slideTimer) window.clearInterval(this.slideTimer);
    this.startTimer = null;
    this.slideTimer = null;
  }

  restartAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  }
}

if (!customElements.get("queso-hero-v2")) {
  customElements.define("queso-hero-v2", QuesoHeroV2);
}
