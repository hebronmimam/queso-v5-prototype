const QUESO_HERO_ASSET_BASE = "https://cdn.jsdelivr.net/gh/hebronmimam/queso-v5-prototype@7581791";

class QuesoHero extends HTMLElement {
  static get observedAttributes() {
    return [
      "autoplay",
      "interval",
      "sticker",
      "slide-1-eyebrow",
      "slide-1-title",
      "slide-1-copy",
      "slide-1-image",
      "slide-1-image-alt",
      "slide-1-primary-label",
      "slide-1-primary-url",
      "slide-1-secondary-label",
      "slide-1-secondary-url",
      "slide-2-eyebrow",
      "slide-2-title",
      "slide-2-copy",
      "slide-2-image",
      "slide-2-image-alt",
      "slide-2-primary-label",
      "slide-2-primary-url",
      "slide-3-eyebrow",
      "slide-3-title",
      "slide-3-copy",
      "slide-3-image",
      "slide-3-image-alt",
      "slide-3-primary-label",
      "slide-3-primary-url"
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.activeSlide = 0;
    this.slideTimer = null;
    this.touchStartX = 0;
    this.touchEndX = 0;
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
    this.showSlide(0);
    this.startAutoplay();
  }

  disconnectedCallback() {
    this.stopAutoplay();
  }

  attributeChangedCallback() {
    if (!this.isConnected) return;
    this.stopAutoplay();
    this.render();
    this.bindEvents();
    this.showSlide(Math.min(this.activeSlide, this.slides.length - 1));
    this.startAutoplay();
  }

  getSetting(name, fallback = "") {
    const value = this.getAttribute(name);
    return value === null || value.trim() === "" ? fallback : value.trim();
  }

  get autoplayEnabled() {
    const value = this.getAttribute("autoplay");
    return value === null || !["false", "0", "off", "no"].includes(value.toLowerCase());
  }

  get interval() {
    const parsed = Number(this.getAttribute("interval"));
    return Number.isFinite(parsed) && parsed >= 2500 ? parsed : 5200;
  }

  get slides() {
    return [
      {
        eyebrow: this.getSetting("slide-1-eyebrow", "Hong Kong • online only • popups"),
        title: this.getSetting("slide-1-title", "Freshly baked. Delivered."),
        copy: this.getSetting(
          "slide-1-copy",
          "Small-batch cheesecakes for birthdays, big news, tiny wins and everything in between."
        ),
        image: this.getSetting(
          "slide-1-image",
          `${QUESO_HERO_ASSET_BASE}/site/assets/v4-originals/hero-rose-wide.png`
        ),
        alt: this.getSetting("slide-1-image-alt", "Square rose cheesecake on red draped fabric"),
        primaryLabel: this.getSetting("slide-1-primary-label", "Shop the menu"),
        primaryUrl: this.getSetting("slide-1-primary-url", "/cakes"),
        secondaryLabel: this.getSetting("slide-1-secondary-label", "Find a popup"),
        secondaryUrl: this.getSetting("slide-1-secondary-url", "#popups")
      },
      {
        eyebrow: this.getSetting("slide-2-eyebrow", "Hong Kong • online only • popups"),
        title: this.getSetting("slide-2-title", "The birthday cake, upgraded."),
        copy: this.getSetting(
          "slide-2-copy",
          "Celebration-first cheesecake with playful color and a polished finish."
        ),
        image: this.getSetting(
          "slide-2-image",
          `${QUESO_HERO_ASSET_BASE}/site/assets/v4-originals/hero-canvas-wide.png`
        ),
        alt: this.getSetting("slide-2-image-alt", "Square Canvas cheesecake on a hot pink backdrop"),
        primaryLabel: this.getSetting("slide-2-primary-label", "Meet Birthday Suit"),
        primaryUrl: this.getSetting("slide-2-primary-url", "/cakes/birthday-suit")
      },
      {
        eyebrow: this.getSetting("slide-3-eyebrow", "Hong Kong • online only • popups"),
        title: this.getSetting("slide-3-title", "Bring the good cake."),
        copy: this.getSetting(
          "slide-3-copy",
          "Freshly made in Hong Kong and ready to be the center of the table."
        ),
        image: this.getSetting(
          "slide-3-image",
          `${QUESO_HERO_ASSET_BASE}/site/assets/v4-originals/hero-artisan-wide.png`
        ),
        alt: this.getSetting("slide-3-image-alt", "Square caramel meringue cheesecake on a mustard backdrop"),
        primaryLabel: this.getSetting("slide-3-primary-label", "Choose your cake"),
        primaryUrl: this.getSetting("slide-3-primary-url", "/cakes")
      }
    ];
  }

  escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  renderButton(label, url, variant = "primary") {
    if (!label || !url) return "";

    return `
      <a class="button button--${variant}" href="${this.escapeHtml(url)}">
        ${this.escapeHtml(label)}
      </a>
    `;
  }

  render() {
    const sticker = this.getSetting("sticker", "NOT YOUR EVERYDAY CHEESECAKE");
    const slidesMarkup = this.slides
      .map(
        (slide, index) => `
          <article class="slide${index === 0 ? " is-active" : ""}" data-slide="${index}" aria-hidden="${index === 0 ? "false" : "true"}">
            <img class="slide__image" src="${this.escapeHtml(slide.image)}" alt="${this.escapeHtml(slide.alt)}">
            <div class="slide__overlay" aria-hidden="true"></div>
            <div class="slide__copy">
              <p class="eyebrow">${this.escapeHtml(slide.eyebrow)}</p>
              ${index === 0
                ? `<h1 class="display">${this.escapeHtml(slide.title)}</h1>`
                : `<h2 class="display">${this.escapeHtml(slide.title)}</h2>`}
              <p class="lead">${this.escapeHtml(slide.copy)}</p>
              <div class="actions">
                ${this.renderButton(slide.primaryLabel, slide.primaryUrl, "primary")}
                ${this.renderButton(slide.secondaryLabel, slide.secondaryUrl, "cream")}
              </div>
            </div>
          </article>
        `
      )
      .join("");

    const dotsMarkup = this.slides
      .map(
        (_, index) => `
          <button
            class="dot${index === 0 ? " is-active" : ""}"
            type="button"
            data-dot="${index}"
            aria-label="Show hero slide ${index + 1}"
            aria-pressed="${index === 0 ? "true" : "false"}"
          ></button>
        `
      )
      .join("");

    this.shadowRoot.innerHTML = `
      <style>
        @font-face {
          font-family: "Queso Lovelo";
          src: url("${QUESO_HERO_ASSET_BASE}/Lovelo_Black.otf") format("opentype");
          font-weight: 900;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: "Queso Quicksand";
          src: url("${QUESO_HERO_ASSET_BASE}/Quicksand-VariableFont_wght.ttf") format("truetype");
          font-weight: 300 700;
          font-style: normal;
          font-display: swap;
        }

        :host {
          --orange: #ed6011;
          --cream: #fdf3e6;
          --yellow: #f4c24a;
          --brown: #3d2416;
          --pink: #efa3b5;
          --pad: clamp(20px, 5vw, 76px);
          display: block;
          width: 100%;
          height: 100%;
          min-height: 560px;
          color: var(--brown);
          font-family: "Queso Quicksand", Arial, sans-serif;
          font-weight: 550;
        }

        *, *::before, *::after {
          box-sizing: border-box;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        button {
          font: inherit;
        }

        .hero {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 560px;
          overflow: hidden;
          background: var(--brown);
          border-block: 2px solid var(--brown);
          isolation: isolate;
        }

        .slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 650ms ease, visibility 650ms ease;
        }

        .slide.is-active {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        .slide__image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .slide__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(253, 243, 230, 0.98) 0%,
            rgba(253, 243, 230, 0.88) 36%,
            rgba(253, 243, 230, 0.08) 67%
          );
        }

        .slide__copy {
          position: absolute;
          z-index: 2;
          left: var(--pad);
          top: 50%;
          width: min(640px, 48vw);
          transform: translateY(-50%);
        }

        .eyebrow {
          margin: 0 0 17px;
          color: #a84c09;
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .display {
          margin: 0;
          font-family: "Queso Lovelo", Arial, sans-serif;
          font-size: clamp(64px, 7.3vw, 112px);
          font-weight: 900;
          line-height: 1.03;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .lead {
          max-width: 560px;
          margin: 26px 0;
          font-size: clamp(16px, 1.5vw, 20px);
          line-height: 1.55;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .button {
          min-height: 50px;
          padding: 0 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--brown);
          border-radius: 10px;
          text-transform: uppercase;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 0.05em;
          transition: transform 150ms ease, background-color 150ms ease;
        }

        .button:hover,
        .button:focus-visible {
          transform: translateY(-2px);
        }

        .button:focus-visible,
        .dot:focus-visible {
          outline: 3px solid var(--yellow);
          outline-offset: 3px;
        }

        .button--primary {
          background: var(--orange);
          color: #fff;
        }

        .button--cream {
          background: var(--cream);
        }

        .sticker {
          position: absolute;
          z-index: 4;
          top: 28px;
          right: var(--pad);
          max-width: min(290px, 34vw);
          padding: 13px 21px;
          background: var(--pink);
          border: 2px solid var(--brown);
          border-radius: 999px;
          font-size: 10px;
          font-weight: 900;
          line-height: 1.2;
          letter-spacing: 0.05em;
          text-align: center;
          transform: rotate(2deg);
        }

        .controls {
          position: absolute;
          z-index: 5;
          right: var(--pad);
          bottom: 34px;
          display: flex;
          gap: 8px;
        }

        .dot {
          width: 14px;
          height: 14px;
          padding: 0;
          border: 2px solid #fff;
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
        }

        .dot.is-active {
          background: var(--yellow);
        }

        @media (max-width: 980px) {
          .slide__copy {
            width: min(600px, 62vw);
          }
        }

        @media (max-width: 680px) {
          :host,
          .hero {
            min-height: 620px;
          }

          .slide__overlay {
            background: linear-gradient(
              180deg,
              rgba(253, 243, 230, 0.98) 0%,
              rgba(253, 243, 230, 0.8) 46%,
              rgba(253, 243, 230, 0.05) 78%
            );
          }

          .slide__image {
            object-position: 62% center;
          }

          .slide__copy {
            top: 44%;
            right: 20px;
            left: 20px;
            width: auto;
          }

          .eyebrow {
            margin-bottom: 13px;
            font-size: 9px;
          }

          .display {
            font-size: clamp(43px, 13vw, 55px);
            line-height: 1.02;
          }

          .lead {
            margin: 18px 0;
            font-size: 15px;
          }

          .button {
            min-height: 46px;
            padding: 0 16px;
            font-size: 9px;
          }

          .sticker {
            top: 18px;
            right: 18px;
            max-width: 230px;
            padding: 10px 14px;
            font-size: 8px;
          }

          .controls {
            right: 20px;
            bottom: 25px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .slide,
          .button {
            transition: none;
          }
        }
      </style>

      <section class="hero" aria-roledescription="carousel" aria-label="Featured Queso cheesecakes">
        <div class="slides" aria-live="polite">
          ${slidesMarkup}
        </div>
        <div class="sticker">${this.escapeHtml(sticker)}</div>
        <div class="controls" aria-label="Choose a hero slide">
          ${dotsMarkup}
        </div>
      </section>
    `;
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

  showSlide(index) {
    const slides = [...this.shadowRoot.querySelectorAll("[data-slide]")];
    const dots = [...this.shadowRoot.querySelectorAll("[data-dot]")];
    if (!slides.length) return;

    this.activeSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === this.activeSlide;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });

    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === this.activeSlide;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-pressed", String(active));
    });
  }

  startAutoplay() {
    if (!this.autoplayEnabled || this.slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (this.slideTimer) return;

    this.slideTimer = window.setInterval(() => {
      this.showSlide(this.activeSlide + 1);
    }, this.interval);
  }

  stopAutoplay() {
    if (!this.slideTimer) return;
    window.clearInterval(this.slideTimer);
    this.slideTimer = null;
  }

  restartAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  }
}

if (!customElements.get("queso-hero")) {
  customElements.define("queso-hero", QuesoHero);
}
