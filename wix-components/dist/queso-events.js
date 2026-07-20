(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const repoAsset = (path) => new URL(path, REPO_ROOT).href;

  const DEFAULT_DATES = [
    { day:"FRI", date:"10", time:"7:30 PM" },
    { day:"SAT", date:"11", time:"7:30 PM" },
    { day:"SUN", date:"12", time:"2:30 PM" },
    { day:"SUN", date:"19", time:"2:30 PM" },
    { day:"SAT", date:"25", time:"7:30 PM" },
    { day:"SUN", date:"26", time:"2:30 PM" }
  ];

  class QuesoEvents extends HTMLElement {
    static get observedAttributes() {
      const attributes = [
        "eyebrow","title","poster","poster-alt","month","year","venue-label",
        "event-name","event-address","event-schedule-copy","button-label","button-url",
        "press-1-label","press-1-subtitle","press-1-url","press-2-label","press-2-subtitle","press-2-url"
      ];
      for (let index = 1; index <= 6; index += 1) {
        attributes.push(`date-${index}-day`,`date-${index}-date`,`date-${index}-time`);
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

    get dates() {
      return DEFAULT_DATES.map((item,index) => ({
        day:this.value(`date-${index + 1}-day`,item.day),
        date:this.value(`date-${index + 1}-date`,item.date),
        time:this.value(`date-${index + 1}-time`,item.time)
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
            min-height:760px;
            background:var(--orange);
            color:#fff;
            font-family:"Queso Quicksand",Arial,sans-serif;
            font-weight:550;
          }

          *,*::before,*::after { box-sizing:border-box; }
          a { color:inherit; text-decoration:none; }
          img { display:block; max-width:100%; }

          .events {
            min-height:inherit;
            height:100%;
            display:grid;
            grid-template-columns:.85fr 1.15fr;
            background:var(--orange);
            border-block:2px solid var(--brown);
          }

          .poster {
            padding:clamp(28px,5vw,70px);
            display:flex;
            align-items:center;
            justify-content:center;
            border-right:2px solid var(--brown);
          }

          .poster img {
            width:min(100%,520px);
            max-height:640px;
            object-fit:cover;
            border:2px solid var(--brown);
          }

          .copy-panel {
            padding:clamp(55px,8vw,110px) var(--pad);
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
            font-size:clamp(62px,7vw,105px);
            font-weight:900;
            line-height:1.02;
            text-transform:uppercase;
          }

          .event-schedule { margin:28px 0 6px; }

          .event-month {
            display:flex;
            align-items:baseline;
            gap:10px;
            margin-bottom:16px;
            color:var(--yellow);
            font-family:"Queso Lovelo",Arial,sans-serif;
            text-transform:uppercase;
          }

          .event-month span { font-size:28px; }
          .event-month strong { font-size:18px; }
          .event-month em { margin-left:4px; font-family:"Queso Quicksand",Arial,sans-serif; font-size:12px; font-style:normal; font-weight:850; letter-spacing:.1em; }

          .event-dates { display:flex; flex-wrap:wrap; gap:8px; }

          .event-date {
            width:73px;
            min-height:88px;
            padding:8px 5px;
            display:grid;
            place-items:center;
            background:var(--yellow);
            color:var(--brown);
            border:2px solid var(--brown);
            text-align:center;
          }

          .event-date small { font-size:8px; font-weight:900; letter-spacing:.1em; }
          .event-date strong { font-family:"Queso Lovelo",Arial,sans-serif; font-size:26px; line-height:1; }
          .event-date em { font-size:8px; font-style:normal; font-weight:750; }

          .details { max-width:620px; margin:25px 0; font-size:15px; line-height:1.6; }
          .details strong { font-weight:850; }

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
          .button:focus-visible,.press-link:focus-visible { outline:3px solid var(--cream); outline-offset:3px; }

          .featured { margin-top:35px; padding-top:28px; border-top:2px solid rgba(255,255,255,.65); }
          .featured > span { font-size:10px; font-weight:850; letter-spacing:.14em; text-transform:uppercase; }
          .press-logos { display:flex; align-items:center; flex-wrap:wrap; gap:35px; margin-top:17px; }
          .press-link { display:flex; flex-direction:column; font-size:clamp(27px,3vw,43px); font-weight:800; line-height:.8; }
          .press-link small { margin-top:9px; font-family:"Queso Quicksand",Arial,sans-serif; font-size:9px; font-weight:850; letter-spacing:.12em; text-transform:uppercase; }
          .press-link--tatler { font-family:Georgia,serif; letter-spacing:.08em; }
          .press-link--foodie { font-style:italic; font-weight:650; }

          @media(max-width:900px) {
            :host { min-height:auto; }
            .events { grid-template-columns:1fr; }
            .poster { min-height:580px; border-right:0; border-bottom:2px solid var(--brown); }
          }

          @media(max-width:560px) {
            .poster { min-height:auto; padding:35px 20px; }
            .copy-panel { padding:70px 20px; }
            .event-date { width:calc(33.333% - 6px); min-width:82px; }
            .press-logos { gap:25px; }
          }

          @media(prefers-reduced-motion:reduce) { .button { transition:none; } }
        </style>

        <section class="events" id="popups" aria-labelledby="queso-events-title">
          <div class="poster">
            <img
              src="${this.escape(this.value("poster",repoAsset("Instagram/Bootstrap theatre.webp")))}"
              alt="${this.escape(this.value("poster-alt","JOB Fateful Fever Dream event poster"))}"
              loading="lazy"
              decoding="async"
            >
          </div>
          <div class="copy-panel">
            <p class="eyebrow">${this.escape(this.value("eyebrow","Catch us in person"))}</p>
            <h2 id="queso-events-title">${this.escape(this.value("title","Upcoming popups."))}</h2>
            <div class="event-schedule" aria-label="Popup schedule">
              <div class="event-month">
                <span>${this.escape(this.value("month","JUL"))}</span>
                <strong>${this.escape(this.value("year","2026"))}</strong>
                <em>${this.escape(this.value("venue-label","At The Hive"))}</em>
              </div>
              <div class="event-dates">${datesMarkup}</div>
            </div>
            <p class="details">
              <strong>${this.escape(this.value("event-name","JOB: Fateful Fever Dream"))}</strong><br>
              ${this.escape(this.value("event-address","The Hive Kennedy Town, 8/F, 12P Smithfield, Hong Kong."))}<br>
              ${this.escape(this.value("event-schedule-copy","Fridays & Saturdays at 7:30 PM • Sundays at 2:30 PM."))}
            </p>
            <a class="button" href="${this.escape(this.value("button-url","https://www.eventbrite.com/e/job-fateful-fever-dream-tickets-1983933323978"))}" target="_blank" rel="noopener">${this.escape(this.value("button-label","Event details ↗"))}</a>
            <div class="featured">
              <span>Featured in</span>
              <div class="press-logos" aria-label="Featured publications">
                <a class="press-link press-link--tatler" href="${this.escape(this.value("press-1-url","https://www.tatlerasia.com/dining/food/dining-news-hong-kong-apr-24"))}" target="_blank" rel="noopener">
                  ${this.escape(this.value("press-1-label","TATLER"))}<small>${this.escape(this.value("press-1-subtitle","Asia"))}</small>
                </a>
                <a class="press-link press-link--foodie" href="${this.escape(this.value("press-2-url","https://www.afoodieworld.com/blog/2026/05/28/best-cheesecake-hong-kong/"))}" target="_blank" rel="noopener">
                  ${this.escape(this.value("press-2-label","Foodie"))}<small>${this.escape(this.value("press-2-subtitle","Hong Kong"))}</small>
                </a>
              </div>
            </div>
          </div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-events")) {
    customElements.define("queso-events",QuesoEvents);
  }
})();
