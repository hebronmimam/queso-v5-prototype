(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const repoAsset = (path) => new URL(path, REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

  const DEFAULT_SLIDES = [
    {
      eyebrow: "Hong Kong • online only • popups",
      title: "Freshly baked. Delivered.",
      copy: "Small-batch cheesecakes for birthdays, big news, tiny wins and everything in between.",
      image: repoAsset("site/assets/v4-originals/hero-rose-wide.png"),
      alt: "Square rose cheesecake on red draped fabric",
      position: "center center",
      primaryLabel: "Shop the menu",
      primaryUrl: "/cakes",
      secondaryLabel: "Find a popup",
      secondaryUrl: "#popups"
    },
    {
      eyebrow: "Hong Kong • online only • popups",
      title: "The birthday cake, upgraded.",
      copy: "Celebration-first cheesecake with playful color and a polished finish.",
      image: repoAsset("site/assets/v4-originals/hero-canvas-wide.png"),
      alt: "Square Canvas cheesecake on a hot pink backdrop",
      position: "center center",
      primaryLabel: "Meet Birthday Suit",
      primaryUrl: "/cakes/birthday-suit",
      secondaryLabel: "",
      secondaryUrl: ""
    },
    {
      eyebrow: "Hong Kong • online only • popups",
      title: "Bring the good cake.",
      copy: "Freshly made in Hong Kong and ready to be the center of the table.",
      image: repoAsset("site/assets/v4-originals/hero-artisan-wide.png"),
      alt: "Square caramel meringue cheesecake on a mustard backdrop",
      position: "center center",
      primaryLabel: "Choose your cake",
      primaryUrl: "/cakes",
      secondaryLabel: "",
      secondaryUrl: ""
    }
  ];

  function installQuesoFonts() {
    if (document.head.querySelector("style[data-queso-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoFonts = "true";
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

  class QuesoHero extends HTMLElement {
    static get observedAttributes() {
      const attributes = [
        "autoplay",
        "interval",
        "initial-slide",
        "sticker",
        "show-sticker",
        "show-dots"
      ];

      for (let index = 1; index <= 3; index += 1) {
        attributes.push(
          `slide-${index}-eyebrow`,
          `slide-${index}-title`,
          `slide-${index}-copy`,
          `slide-${index}-image`,
          `slide-${index}-image-alt`,
          `slide-${index}-image-position`,
          `slide-${index}-primary-label`,
          `slide-${index}-primary-url`,
          `slide-${index}-secondary-label`,
          `slide-${index}-secondary-url`
        );
      }

      return attributes;
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.activeSlide = 0;
      this.timer = null;
      this.touchStartX = 0;
      this.handleResize = this.syncFrameHeight.bind(this);
    }

    connectedCallback() {
      installQuesoFonts();
      this.toggleAttribute("data-wix-frame", IS_WIX_FRAME);
      this.syncFrameHeight();
      window.addEventListener("resize", this.handleResize);
      this.activeSlide = this.initialSlide;
      this.render();
      this.bindEvents();
      this.startAutoplay();
    }

    disconnectedCallback() {
      window.removeEventListener("resize", this.handleResize);
      this.stopAutoplay();
    }

    attributeChangedCallback() {
      if (!this.isConnected) return;
      this.stopAutoplay();
      this.activeSlide = this.initialSlide;
      this.render();
      this.bindEvents();
      this.startAutoplay();
    }

    syncFrameHeight() {
      if (!IS_WIX_FRAME) {
        this.style.removeProperty("--queso-frame-height");
        return;
      }

      this.style.setProperty("--queso-frame-height", `${Math.max(window.innerHeight, 1)}px`);
    }

    value(name, fallback = "") {
      const value = this.getAttribute(name);
      return value === null || value.trim() === "" ? fallback : value.trim();
    }

    bool(name, fallback = true) {
      const value = this.getAttribute(name);
      if (value === null) return fallback;
      return !["false", "0", "off", "no"].includes(value.toLowerCase());
    }

    get initialSlide() {
      const parsed = Number.parseInt(this.getAttribute("initial-slide") || "0", 10);
      return Number.isFinite(parsed) ? Math.max(0, Math.min(parsed, 2)) : 0;
    }

    get interval() {
      const parsed = Number(this.getAttribute("interval"));
      return Number.isFinite(parsed) && parsed >= 2500 ? parsed : 5200;
    }

    get slides() {
      return DEFAULT_SLIDES.map((fallback, index) => {
        const number = index + 1;
        return {
          eyebrow: this.value(`slide-${number}-eyebrow`, fallback.eyebrow),
          title: this.value(`slide-${number}-title`, fallback.title),
          copy: this.value(`slide-${number}-copy`, fallback.copy),
          image: this.value(`slide-${number}-image`, fallback.image),
          alt: this.value(`slide-${number}-image-alt`, fallback.alt),
          position: this.value(`slide-${number}-image-position`, fallback.position),
          primaryLabel: this.value(`slide-${number}-primary-label`, fallback.primaryLabel),
          primaryUrl: this.value(`slide-${number}-primary-url`, fallback.primaryUrl),
          secondaryLabel: this.value(`slide-${number}-secondary-label`, fallback.secondaryLabel),
          secondaryUrl: this.value(`slide-${number}-secondary-url`, fallback.secondaryUrl)
        };
      });
    }

    escape(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    renderButton(label, url, modifier) {
      if (!label || !url) return "";
      return `<a class="button button--${modifier}" href="${this.escape(url)}">${this.escape(label)}</a>`;
    }

    render() {
      const slides = this.slides;
      const slidesMarkup = slides.map((slide, index) => `
        <article class="hero-slide${index === this.activeSlide ? " is-active" : ""}" data-slide="${index}" aria-hidden="${index === this.activeSlide ? "false" : "true"}">
          <img
            class="hero-slide__image"
            src="${this.escape(slide.image)}"
            alt="${this.escape(slide.alt)}"
            style="object-position:${this.escape(slide.position)}"
            ${index === this.activeSlide ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'}
            decoding="async"
          >
          <div class="hero-slide__overlay" aria-hidden="true"></div>
          <div class="hero-copy">
            <p class="eyebrow">${this.escape(slide.eyebrow)}</p>
            ${index === 0
              ? `<h1 class="display">${this.escape(slide.title)}</h1>`
              : `<h2 class="display">${this.escape(slide.title)}</h2>`}
            <p class="lead">${this.escape(slide.copy)}</p>
            <div class="actions">
              ${this.renderButton(slide.primaryLabel, slide.primaryUrl, "primary")}
              ${this.renderButton(slide.secondaryLabel, slide.secondaryUrl, "cream")}
            </div>
          </div>
        </article>
      `).join("");

      const dotsMarkup = slides.map((_, index) => `
        <button
          class="hero-dot${index === this.activeSlide ? " is-active" : ""}"
          type="button"
          data-dot="${index}"
          aria-label="Show hero slide ${index + 1}"
          aria-pressed="${index === this.activeSlide ? "true" : "false"}"
        ></button>
      `).join("");

      this.shadowRoot.innerHTML = `
        <style>
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
            min-height: 0;
            overflow: hidden;
            background: var(--brown);
            color: var(--brown);
            font-family: "Quicksand", Arial, sans-serif;
            font-weight: 550;
            font-synthesis: none;
            text-rendering: geometricPrecision;
          }

          :host([data-wix-frame]) {
            height: var(--queso-frame-height, 100vh);
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
            min-height: 0;
            overflow: hidden;
            background: var(--brown);
            border-bottom: 2px solid var(--brown);
            isolation: isolate;
          }

          .hero-slide {
            position: absolute;
            inset: 0;
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transition: opacity 650ms ease, visibility 650ms ease;
          }

          .hero-slide.is-active {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
          }

          .hero-slide__image {
            position: absolute;
            inset: 0;
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
            background: var(--brown);
          }

          .hero-slide__overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              90deg,
              rgba(253, 243, 230, 0.98) 0%,
              rgba(253, 243, 230, 0.88) 36%,
              rgba(253, 243, 230, 0.08) 67%
            );
          }

          .hero-copy {
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
            font-family: "Lovelo", Arial, sans-serif;
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
            background: #fff;
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            transition: transform 150ms ease;
          }

          .button:hover,
          .button:focus-visible {
            transform: translateY(-2px);
          }

          .button:focus-visible,
          .hero-dot:focus-visible {
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

          .hero-sticker {
            position: absolute;
            z-index: 4;
            right: var(--pad);
            top: 28px;
            padding: 13px 21px;
            background: var(--pink);
            border: 2px solid var(--brown);
            border-radius: 999px;
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 0.05em;
            transform: rotate(2deg);
          }

          .hero-controls {
            position: absolute;
            z-index: 5;
            right: var(--pad);
            bottom: 34px;
            display: flex;
            gap: 8px;
          }

          .hero-dot {
            width: 14px;
            height: 14px;
            padding: 0;
            border: 2px solid #fff;
            border-radius: 50%;
            background: transparent;
            cursor: pointer;
          }

          .hero-dot.is-active {
            background: var(--yellow);
          }

          @media (max-width: 980px) {
            .hero-copy {
              width: min(600px, 62vw);
            }
          }

          @media (max-width: 680px) {
            .hero-slide__overlay {
              background: linear-gradient(
                180deg,
                rgba(253, 243, 230, 0.98) 0%,
                rgba(253, 243, 230, 0.8) 46%,
                rgba(253, 243, 230, 0.05) 78%
              );
            }

            .hero-slide__image {
              object-position: 62% center !important;
            }

            .hero-copy {
              left: 20px;
              right: 20px;
              top: 44%;
              width: auto;
            }

            .display {
              font-size: clamp(42px, 14vw, 55px);
              line-height: 1.02;
            }

            .lead {
              margin: 18px 0;
              font-size: 15px;
            }

            .hero-sticker {
              right: 18px;
              top: 18px;
              padding: 10px 14px;
              font-size: 8px;
            }

            .hero-controls {
              right: 20px;
              bottom: 25px;
            }
          }

          @media (max-width: 680px) and (max-height: 620px) {
            .hero-copy {
              top: 43%;
            }

            .eyebrow {
              margin-bottom: 11px;
              font-size: 10px;
            }

            .display {
              font-size: clamp(38px, 12.5vw, 48px);
            }

            .lead {
              max-width: 310px;
              margin: 13px 0;
              font-size: 13px;
              line-height: 1.45;
            }

            .button {
              min-height: 43px;
              padding-inline: 17px;
              font-size: 9px;
            }

            .hero-sticker {
              display: none;
            }

            .hero-controls {
              bottom: 16px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .hero-slide,
            .button {
              transition: none;
            }
          }
        </style>

        <section class="hero" aria-roledescription="carousel" aria-label="Featured Queso cheesecakes">
          ${slidesMarkup}
          ${this.bool("show-sticker", true)
            ? `<div class="hero-sticker">${this.escape(this.value("sticker", "NOT YOUR EVERYDAY CHEESECAKE"))}</div>`
            : ""}
          ${this.bool("show-dots", true)
            ? `<div class="hero-controls" aria-label="Choose a hero slide">${dotsMarkup}</div>`
            : ""}
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
        const touchEndX = event.changedTouches[0]?.screenX || 0;
        const distance = touchEndX - this.touchStartX;
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
      if (!this.bool("autoplay", true)) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (this.timer) return;

      this.timer = window.setInterval(() => {
        this.showSlide(this.activeSlide + 1);
      }, this.interval);
    }

    stopAutoplay() {
      if (!this.timer) return;
      window.clearInterval(this.timer);
      this.timer = null;
    }

    restartAutoplay() {
      this.stopAutoplay();
      this.startAutoplay();
    }
  }

  if (!customElements.get("queso-hero")) {
    customElements.define("queso-hero", QuesoHero);
  }
})();
