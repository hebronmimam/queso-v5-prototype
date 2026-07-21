(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || "";
  const rootUrl = scriptUrl ? new URL("../../", scriptUrl).href : "";
  const loveloUrl = rootUrl ? new URL("Lovelo_Black.otf", rootUrl).href : "";
  const quicksandUrl = rootUrl
    ? new URL("Quicksand-VariableFont_wght.ttf", rootUrl).href
    : "";

  const pad = (value) => String(value).padStart(2, "0");
  const isoFromParts = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;

  function parseIsoDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const date = new Date(year, month, day, 12, 0, 0, 0);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  class QuesoDeliveryPicker extends HTMLElement {
    static get observedAttributes() {
      return ["available-dates", "selected-date", "picker-busy", "picker-message"];
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.activeMonth = null;
      this.localSelectedDate = "";
    }

    connectedCallback() {
      this.initializeState();
      this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (!this.isConnected || oldValue === newValue) return;

      if (name === "picker-busy" || name === "picker-message") {
        this.updateFeedback();
        return;
      }

      this.initializeState();
      this.render();
    }

    value(name, fallback = "") {
      const value = this.getAttribute(name);
      return value === null || !String(value).trim() ? fallback : String(value).trim();
    }

    json(name, fallback) {
      try {
        const value = this.value(name, "");
        return value ? JSON.parse(value) : fallback;
      } catch (error) {
        console.error(`Queso delivery picker: invalid ${name}.`, error);
        return fallback;
      }
    }

    escape(value) {
      return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    get availableDates() {
      const values = this.json("available-dates", []);
      if (!Array.isArray(values)) return [];

      return [...new Set(values.map((value) => String(value || "").trim()))]
        .filter((value) => parseIsoDate(value))
        .sort();
    }

    get selectedDate() {
      return this.localSelectedDate || this.value("selected-date", "");
    }

    get busy() {
      return ["1", "true", "yes", "on"].includes(
        this.value("picker-busy", "false").toLowerCase()
      );
    }

    initializeState() {
      const selected = this.value("selected-date", "");
      if (parseIsoDate(selected)) {
        this.localSelectedDate = selected;
      } else if (!parseIsoDate(this.localSelectedDate)) {
        this.localSelectedDate = "";
      }

      const anchor =
        parseIsoDate(this.localSelectedDate) ||
        parseIsoDate(this.availableDates[0]) ||
        new Date();

      if (!this.activeMonth) {
        this.activeMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12);
      }
    }

    monthKey(date) {
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
    }

    monthHasAvailableDate(date) {
      const key = this.monthKey(date);
      return this.availableDates.some((value) => value.startsWith(`${key}-`));
    }

    adjacentAvailableMonth(direction) {
      if (!this.availableDates.length) return null;

      const currentKey = this.monthKey(this.activeMonth);
      const months = [...new Set(this.availableDates.map((value) => value.slice(0, 7)))];
      const currentIndex = months.indexOf(currentKey);

      if (currentIndex >= 0) {
        const nextKey = months[currentIndex + direction];
        return nextKey ? parseIsoDate(`${nextKey}-01`) : null;
      }

      const currentNumber = this.activeMonth.getFullYear() * 12 + this.activeMonth.getMonth();
      const candidates = months
        .map((key) => {
          const date = parseIsoDate(`${key}-01`);
          return {
            date,
            number: date.getFullYear() * 12 + date.getMonth()
          };
        })
        .filter((item) => (direction > 0 ? item.number > currentNumber : item.number < currentNumber));

      candidates.sort((a, b) => direction > 0 ? a.number - b.number : b.number - a.number);
      return candidates[0]?.date || null;
    }

    buildCalendarDays() {
      const year = this.activeMonth.getFullYear();
      const month = this.activeMonth.getMonth();
      const firstWeekday = new Date(year, month, 1, 12).getDay();
      const daysInMonth = new Date(year, month + 1, 0, 12).getDate();
      const cells = [];

      for (let index = 0; index < firstWeekday; index += 1) {
        cells.push(`<span class="day spacer" aria-hidden="true"></span>`);
      }

      const available = new Set(this.availableDates);

      for (let day = 1; day <= daysInMonth; day += 1) {
        const isoDate = isoFromParts(year, month, day);
        const enabled = available.has(isoDate);
        const selected = isoDate === this.selectedDate;
        const date = new Date(year, month, day, 12);
        const label = new Intl.DateTimeFormat("en-HK", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        }).format(date);

        cells.push(`
          <button
            class="day${enabled ? " available" : ""}${selected ? " selected" : ""}"
            type="button"
            data-date="${isoDate}"
            aria-label="${this.escape(label)}"
            aria-pressed="${selected ? "true" : "false"}"
            ${enabled && !this.busy ? "" : "disabled"}
          >${day}</button>
        `);
      }

      return cells.join("");
    }

    formatSelectedDate() {
      const date = parseIsoDate(this.selectedDate);
      if (!date) return "No date selected";

      return new Intl.DateTimeFormat("en-HK", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(date);
    }

    render() {
      const monthLabel = new Intl.DateTimeFormat("en-HK", {
        month: "long",
        year: "numeric"
      }).format(this.activeMonth);

      const previousMonth = this.adjacentAvailableMonth(-1);
      const nextMonth = this.adjacentAvailableMonth(1);
      const message = this.value("picker-message", "");

      this.shadowRoot.innerHTML = `
        <style>
          @font-face {
            font-family: Lovelo;
            src: url("${loveloUrl}") format("opentype");
            font-weight: 900;
            font-display: swap;
          }

          @font-face {
            font-family: Quicksand;
            src: url("${quicksandUrl}") format("truetype");
            font-weight: 300 700;
            font-display: swap;
          }

          :host {
            --orange: #ed6011;
            --cream: #fdf3e6;
            --yellow: #f4c24a;
            --brown: #3d2416;
            --pink: #efa3b5;
            display: block;
            width: 100%;
            height: 100%;
            min-height: 0;
            overflow: hidden;
            color: var(--brown);
            background: var(--cream);
            font-family: Quicksand, Arial, sans-serif;
            font-weight: 550;
          }

          *,
          *::before,
          *::after {
            box-sizing: border-box;
          }

          button {
            color: inherit;
            font: inherit;
          }

          .picker {
            min-height: 100%;
            display: grid;
            grid-template-columns: minmax(0, 0.9fr) minmax(420px, 1.1fr);
            border-block: 2px solid var(--brown);
            background: var(--cream);
          }

          .intro {
            padding: clamp(32px, 5vw, 74px);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 32px;
            border-right: 2px solid var(--brown);
            background: var(--pink);
          }

          .eyebrow {
            margin: 0 0 10px;
            color: #8d3907;
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.15em;
            text-transform: uppercase;
          }

          h2 {
            margin: 0;
            max-width: 760px;
            font-family: Lovelo, Arial, sans-serif;
            font-size: clamp(42px, 5.5vw, 82px);
            line-height: 0.95;
            text-transform: uppercase;
          }

          .intro-copy {
            max-width: 540px;
            margin: 18px 0 0;
            font-size: 14px;
            line-height: 1.6;
          }

          .selection {
            padding-top: 20px;
            border-top: 1px solid rgba(61, 36, 22, 0.45);
          }

          .selection span {
            display: block;
            margin-bottom: 7px;
            font-size: 10px;
            font-weight: 850;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }

          .selection strong {
            font-family: Lovelo, Arial, sans-serif;
            font-size: clamp(20px, 2.4vw, 30px);
            line-height: 1.1;
            text-transform: uppercase;
          }

          .calendar-panel {
            padding: clamp(28px, 4vw, 56px);
            background: var(--cream);
          }

          .calendar {
            max-width: 700px;
            margin: 0 auto;
            border: 2px solid var(--brown);
            background: #fff;
          }

          .calendar-header {
            min-height: 76px;
            display: grid;
            grid-template-columns: 52px minmax(0, 1fr) 52px;
            align-items: center;
            border-bottom: 2px solid var(--brown);
            background: var(--yellow);
          }

          .calendar-header strong {
            text-align: center;
            font-family: Lovelo, Arial, sans-serif;
            font-size: clamp(20px, 3vw, 30px);
            text-transform: uppercase;
          }

          .month-nav {
            width: 40px;
            height: 40px;
            margin: auto;
            border: 2px solid var(--brown);
            border-radius: 50%;
            background: var(--cream);
            cursor: pointer;
            font-size: 24px;
            font-weight: 800;
            line-height: 1;
          }

          .month-nav:disabled {
            opacity: 0.28;
            cursor: not-allowed;
          }

          .weekdays,
          .days {
            display: grid;
            grid-template-columns: repeat(7, minmax(0, 1fr));
          }

          .weekdays {
            padding: 14px 14px 5px;
          }

          .weekdays span {
            padding: 7px 2px;
            text-align: center;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }

          .days {
            gap: 6px;
            padding: 7px 14px 18px;
          }

          .day {
            aspect-ratio: 1;
            min-width: 0;
            display: grid;
            place-items: center;
            border: 1px solid transparent;
            border-radius: 50%;
            background: transparent;
            font-size: 13px;
            font-weight: 750;
          }

          .day:disabled:not(.spacer) {
            opacity: 0.25;
          }

          .day.available {
            border-color: var(--brown);
            background: var(--cream);
            cursor: pointer;
          }

          .day.available:hover,
          .day.available:focus-visible {
            background: var(--pink);
            outline: none;
          }

          .day.selected {
            border-color: var(--brown);
            background: var(--orange);
            color: #fff;
          }

          .status {
            min-height: 20px;
            margin: 15px auto 0;
            max-width: 700px;
            color: #a52a23;
            font-size: 11px;
            font-weight: 800;
          }

          .status.success {
            color: #256c37;
          }

          @media (max-width: 900px) {
            .picker {
              grid-template-columns: 1fr;
            }

            .intro {
              border-right: 0;
              border-bottom: 2px solid var(--brown);
            }
          }

          @media (max-width: 560px) {
            .intro {
              padding: 34px 20px;
            }

            h2 {
              font-size: 48px;
            }

            .calendar-panel {
              padding: 24px 14px 30px;
            }

            .calendar-header {
              min-height: 66px;
              grid-template-columns: 46px minmax(0, 1fr) 46px;
            }

            .calendar-header strong {
              font-size: 20px;
            }

            .month-nav {
              width: 34px;
              height: 34px;
              font-size: 20px;
            }

            .weekdays {
              padding-inline: 8px;
            }

            .days {
              gap: 4px;
              padding: 6px 8px 14px;
            }

            .day {
              font-size: 12px;
            }
          }
        </style>

        <section class="picker" aria-labelledby="queso-delivery-picker-title">
          <div class="intro">
            <div>
              <p class="eyebrow">Before checkout</p>
              <h2 id="queso-delivery-picker-title">Choose your date.</h2>
              <p class="intro-copy">
                Pick an available Friday, Saturday or Sunday for delivery or pickup.
                Your order is only confirmed after checkout.
              </p>
            </div>

            <div class="selection" aria-live="polite">
              <span>Selected date</span>
              <strong data-selected-label>${this.escape(this.formatSelectedDate())}</strong>
            </div>
          </div>

          <div class="calendar-panel">
            <div class="calendar">
              <div class="calendar-header">
                <button
                  class="month-nav"
                  type="button"
                  data-month-direction="-1"
                  aria-label="Previous available month"
                  ${previousMonth && !this.busy ? "" : "disabled"}
                >‹</button>

                <strong>${this.escape(monthLabel)}</strong>

                <button
                  class="month-nav"
                  type="button"
                  data-month-direction="1"
                  aria-label="Next available month"
                  ${nextMonth && !this.busy ? "" : "disabled"}
                >›</button>
              </div>

              <div class="weekdays" aria-hidden="true">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span>
                <span>Thu</span><span>Fri</span><span>Sat</span>
              </div>

              <div class="days">
                ${this.buildCalendarDays()}
              </div>
            </div>

            <p class="status${message ? " error" : ""}" data-picker-status aria-live="polite">
              ${this.escape(message)}
            </p>
          </div>
        </section>
      `;

      this.bindEvents();
    }

    bindEvents() {
      this.shadowRoot.querySelectorAll("[data-month-direction]").forEach((button) => {
        button.addEventListener("click", () => {
          const direction = Number(button.dataset.monthDirection || 0);
          const target = this.adjacentAvailableMonth(direction);
          if (!target) return;

          this.activeMonth = new Date(target.getFullYear(), target.getMonth(), 1, 12);
          this.render();
        });
      });

      this.shadowRoot.querySelectorAll("[data-date]").forEach((button) => {
        button.addEventListener("click", () => {
          const isoDate = String(button.dataset.date || "");
          if (!this.availableDates.includes(isoDate) || this.busy) return;

          this.localSelectedDate = isoDate;
          this.render();

          const parsedDate = parseIsoDate(isoDate);
          const displayDate = new Intl.DateTimeFormat("en-HK", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
          }).format(parsedDate);

          this.dispatchEvent(
            new CustomEvent("queso-delivery-date-change", {
              bubbles: true,
              composed: true,
              detail: {
                date: isoDate,
                isoDate,
                displayDate
              }
            })
          );
        });
      });
    }

    updateFeedback() {
      const status = this.shadowRoot?.querySelector("[data-picker-status]");
      if (status) {
        status.textContent = this.value("picker-message", "");
      }

      const disabled = this.busy;
      this.shadowRoot?.querySelectorAll("button").forEach((button) => {
        if (button.dataset.date) {
          button.disabled = disabled || !this.availableDates.includes(button.dataset.date);
        }
      });
    }
  }

  if (!customElements.get("queso-delivery-picker")) {
    customElements.define("queso-delivery-picker", QuesoDeliveryPicker);
  }
})();
