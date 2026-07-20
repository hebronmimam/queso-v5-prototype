(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const repoAsset = (path) => new URL(path, REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

  const DEFAULT_DATES = [
    { day: "FRI", date: "10", time: "7:30 PM" },
    { day: "SAT", date: "11", time: "7:30 PM" },
    { day: "SUN", date: "12", time: "2:30 PM" },
    { day: "SUN", date: "19", time: "2:30 PM" },
    { day: "SAT", date: "25", time: "7:30 PM" },
    { day: "SUN", date: "26", time: "2:30 PM" }
  ];

  function installFonts() {
    if (document.head.querySelector("style[data-queso-events-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoEventsFonts = "true";
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

  class QuesoEvents extends HTMLElement {
    static get observedAttributes() {
      const attributes = [
        "eyebrow",
        "title",
        "poster",
        "poster-alt",
        "poster-position",
        "month",
        "year",
        "venue-label",
        "event-name",
        "event-address",
        "event-schedule-copy",
        "button-label",
        "button-url",
        "press-1-label",
        "press-1-subtitle",
        "press-1-url",
        "press-2-label",
        "press-2-subtitle",
        "press-2-url"
      ];

      for (let index = 1; index <= 6; index += 1) {
        attributes.push(
          `date-${index}-day`,
          `date-${index}-date`,
          `date-${index}-time`
        );
      }

      return attributes;
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      installFonts();
      this.toggleAttribute("data-wix-frame", IS_WIX_FRAME);
      this.render();
    }

    attributeChangedCallback() {
      if (this.isConnected) this.render();
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

    get dates() {
      return DEFAULT_DATES.map((item, index) => ({
        day: this.value(`date-${index + 1}-day`, item.day),
        date: this.value(`date-${index + 1}-date`, item.date),
        time: this.value(`date-${index + 1}-time`, item.time)
      }));
    }

    render() {
      const datesMarkup = this.dates.map((item) => `
        <span class="event-date">
          <small>${this.escape(item.day)}</small>
          <strong>${this.escape(item.date)}</strong>
          <em>${this.escape(item.time)}</em>
        </span>
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
            background: var(--orange);
            color: #fff;
            font-family: "Quicksand", Arial, sans-serif;
            font-weight: 550;
            font-synthesis: none;
            text-rendering: geometricPrecision;
          }

          :host([data-wix-frame]) {
            height: auto;
          }

          *, *::before, *::after {
            box-sizing: border-box;
          }

          a {
            color: inherit;
            text-decoration: none;
          }

          img {
            display: block;
            max-width: 100%;
          }

          .events {
            width: 100%;
            height: 100%;
            min-height: 0;
            display: grid;
            grid-template-columns: 0.85fr 1.15fr;
            overflow: hidden;
            background: var(--orange);
            border-block: 2px solid var(--brown);
          }

          :host([data-wix-frame]) .events {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
          }

          .poster {
            min-width: 0;
            min-height: 0;
            padding: clamp(28px, 5vw, 70px);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border-right: 2px solid var(--brown);
          }

          .poster img {
            width: min(100%, 520px);
            height: 100%;
            max-height: 680px;
            object-fit: contain;
            object-position: center center;
            border: 2px solid var(--brown);
          }

          .copy-panel {
            min-width: 0;
            min-height: 0;
            padding: clamp(55px, 7vw, 105px) var(--pad);
            display: flex;
            flex-direction: column;
            justify-content: center;
            overflow: hidden;
          }

          .eyebrow {
            margin: 0 0 17px;
            color: var(--yellow);
            font-size: 12px;
            font-weight: 850;
            letter-spacing: 0.13em;
            text-transform: uppercase;
          }

          h2 {
            margin: 0;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(62px, 7vw, 105px);
            font-weight: 900;
            line-height: 1.02;
            letter-spacing: 0;
            text-transform: uppercase;
          }

          .event-schedule {
            max-width: 720px;
            margin: 30px 0 28px;
            display: grid;
            grid-template-columns: 116px 1fr;
            gap: 12px;
          }

          .event-month {
            min-height: 118px;
            padding: 17px 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: var(--brown);
            color: var(--cream);
            border: 2px solid var(--brown);
            text-align: center;
            transform: rotate(-1.5deg);
          }

          .event-month span {
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 30px;
            font-weight: 900;
            line-height: 1;
          }

          .event-month strong {
            margin-top: 7px;
            font-size: 12px;
            font-weight: 850;
            letter-spacing: 0.16em;
          }

          .event-month em {
            margin-top: 14px;
            font-size: 9px;
            font-style: normal;
            font-weight: 800;
            line-height: 1.2;
            text-transform: uppercase;
          }

          .event-dates {
            display: grid;
            grid-template-columns: repeat(3, minmax(84px, 1fr));
            gap: 9px;
          }

          .event-date {
            min-width: 0;
            min-height: 118px;
            padding: 11px 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: var(--yellow);
            color: var(--brown);
            border: 2px solid var(--brown);
            line-height: 1;
            text-align: center;
          }

          .event-date:nth-child(2n) {
            background: var(--pink);
            transform: rotate(0.7deg);
          }

          .event-date:nth-child(3n) {
            background: var(--cream);
            transform: rotate(-0.6deg);
          }

          .event-date small {
            font-size: 9px;
            font-weight: 900;
            letter-spacing: 0.18em;
          }

          .event-date strong {
            margin: 7px 0 6px;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 29px;
            font-weight: 900;
          }

          .event-date em {
            font-size: 9px;
            font-style: normal;
            font-weight: 750;
          }

          .details {
            max-width: 620px;
            margin: 0 0 25px;
            font-size: 15px;
            line-height: 1.6;
          }

          .details strong {
            font-weight: 850;
          }

          .button {
            align-self: flex-start;
            min-height: 50px;
            padding: 0 22px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: var(--yellow);
            color: var(--brown);
            border: 2px solid var(--brown);
            border-radius: 10px;
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
          .press-link:focus-visible {
            outline: 3px solid var(--cream);
            outline-offset: 3px;
          }

          .featured {
            margin-top: 35px;
            padding-top: 28px;
            border-top: 2px solid rgba(255, 255, 255, 0.65);
          }

          .featured > span {
            font-size: 10px;
            font-weight: 850;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }

          .press-logos {
            margin-top: 17px;
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 18px;
          }

          .press-link {
            min-width: 170px;
            min-height: 78px;
            padding: 15px;
            display: grid;
            place-items: center;
            align-content: center;
            background: var(--cream);
            color: var(--brown);
            border: 2px solid var(--brown);
            line-height: 1;
            text-align: center;
          }

          .press-link small {
            display: block;
            margin-top: 7px;
            font-family: "Quicksand", Arial, sans-serif;
            font-size: 8px;
            font-weight: 850;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }

          .press-link--tatler {
            font-family: Georgia, serif;
            font-size: 27px;
            letter-spacing: 0.14em;
          }

          .press-link--foodie {
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 29px;
            font-weight: 900;
            text-transform: none;
          }

          @media (max-width: 980px) {
            .events {
              grid-template-columns: 1fr;
              grid-template-rows: 580px minmax(0, 1fr);
              overflow-y: auto;
            }

            .poster {
              border-right: 0;
              border-bottom: 2px solid var(--brown);
            }

            .poster img {
              width: min(100%, 500px);
              max-height: 500px;
            }

            .copy-panel {
              padding: 64px 48px;
              justify-content: flex-start;
              overflow: visible;
            }
          }

          @media (max-width: 680px) {
            .events {
              grid-template-rows: 430px minmax(0, 1fr);
            }

            .poster {
              padding: 35px 20px;
            }

            .poster img {
              width: min(100%, 340px);
              max-height: 360px;
            }

            .copy-panel {
              padding: 64px 20px;
            }

            h2 {
              font-size: 57px;
            }

            .event-schedule {
              grid-template-columns: 1fr;
              gap: 12px;
            }

            .event-month {
              min-height: 94px;
              transform: none;
            }

            .event-month em {
              margin-top: 8px;
            }

            .event-dates {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .event-date {
              min-height: 104px;
            }

            .press-logos {
              gap: 14px;
            }

            .press-link {
              min-width: min(170px, calc(50% - 7px));
              flex: 1 1 145px;
            }
          }

          @media (max-width: 390px) {
            h2 {
              font-size: 50px;
            }

            .event-date strong {
              font-size: 26px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .button {
              transition: none;
            }
          }
        </style>

        <section class="events" id="popups" aria-labelledby="queso-events-title">
          <div class="poster">
            <img
              src="${this.escape(this.value("poster", repoAsset("Instagram/Bootstrap theatre.webp")))}"
              alt="${this.escape(this.value("poster-alt", "JOB Fateful Fever Dream event poster"))}"
              style="object-position:${this.escape(this.value("poster-position", "center center"))}"
              loading="lazy"
              decoding="async"
            >
          </div>

          <div class="copy-panel">
            <p class="eyebrow">${this.escape(this.value("eyebrow", "Catch us in person"))}</p>
            <h2 id="queso-events-title">${this.escape(this.value("title", "Upcoming popups."))}</h2>

            <div class="event-schedule" aria-label="Popup schedule">
              <div class="event-month">
                <span>${this.escape(this.value("month", "JUL"))}</span>
                <strong>${this.escape(this.value("year", "2026"))}</strong>
                <em>${this.escape(this.value("venue-label", "At The Hive"))}</em>
              </div>
              <div class="event-dates">${datesMarkup}</div>
            </div>

            <p class="details">
              <strong>${this.escape(this.value("event-name", "JOB: Fateful Fever Dream"))}</strong><br>
              ${this.escape(this.value("event-address", "The Hive Kennedy Town, 8/F, 12P Smithfield, Hong Kong."))}<br>
              ${this.escape(this.value("event-schedule-copy", "Fridays & Saturdays at 7:30 PM • Sundays at 2:30 PM."))}
            </p>

            <a
              class="button"
              href="${this.escape(this.value("button-url", "https://www.eventbrite.com/e/job-fateful-fever-dream-tickets-1983933323978"))}"
              target="_blank"
              rel="noopener"
            >${this.escape(this.value("button-label", "Event details ↗"))}</a>

            <div class="featured">
              <span>Featured in</span>
              <div class="press-logos" aria-label="Featured publications">
                <a
                  class="press-link press-link--tatler"
                  href="${this.escape(this.value("press-1-url", "https://www.tatlerasia.com/dining/food/dining-news-hong-kong-apr-24"))}"
                  target="_blank"
                  rel="noopener"
                >
                  ${this.escape(this.value("press-1-label", "TATLER"))}
                  <small>${this.escape(this.value("press-1-subtitle", "Asia"))}</small>
                </a>

                <a
                  class="press-link press-link--foodie"
                  href="${this.escape(this.value("press-2-url", "https://www.afoodieworld.com/blog/2026/05/28/best-cheesecake-hong-kong/"))}"
                  target="_blank"
                  rel="noopener"
                >
                  ${this.escape(this.value("press-2-label", "Foodie"))}
                  <small>${this.escape(this.value("press-2-subtitle", "Hong Kong"))}</small>
                </a>
              </div>
            </div>
          </div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-events")) {
    customElements.define("queso-events", QuesoEvents);
  }
})();
