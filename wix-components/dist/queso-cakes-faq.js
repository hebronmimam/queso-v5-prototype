(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

  const DEFAULT_ITEMS = [
    {
      question: "How early should I order?",
      answer:
        "Queso cakes are made in limited batches. Ordering early gives you the best chance of securing the date and cake you need."
    },
    {
      question: "Do you offer delivery and pickup?",
      answer:
        "Available Hong Kong delivery and TST MTR pickup options are shown during ordering. Choose the option that works for your date and location."
    },
    {
      question: "Can I personalize a cake?",
      answer:
        "Yes. Canvas is the personalized option for adding your own image and message. Follow the product-page instructions when placing the order."
    },
    {
      question: "What if I have an allergy question?",
      answer:
        "Contact Queso before ordering so the team can confirm the current ingredients and preparation details for the cake you are considering."
    },
    {
      question: "Where can I ask something else?",
      answer:
        "Use the Connect page for order questions, date checks and anything that is not covered here."
    }
  ];

  function installFonts() {
    if (document.head.querySelector("style[data-queso-cakes-faq-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoCakesFaqFonts = "true";
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

  class QuesoCakesFaq extends HTMLElement {
    static get observedAttributes() {
      const attributes = [
        "eyebrow",
        "title",
        "copy",
        "cta-label",
        "cta-url"
      ];

      for (let index = 1; index <= 5; index += 1) {
        attributes.push(
          `item-${index}-question`,
          `item-${index}-answer`
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
      if (!this.isConnected) return;
      this.render();
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

    get items() {
      return DEFAULT_ITEMS.map((fallback, index) => {
        const number = index + 1;
        return {
          question: this.value(`item-${number}-question`, fallback.question),
          answer: this.value(`item-${number}-answer`, fallback.answer)
        };
      });
    }

    render() {
      const eyebrow = this.value("eyebrow", "Before the candles");
      const title = this.value("title", "Good questions. Straight answers.");
      const copy = this.value(
        "copy",
        "The practical things worth knowing before choosing your cake."
      );
      const ctaLabel = this.value("cta-label", "Ask Queso");
      const ctaUrl = this.value("cta-url", "/connect");

      const faqMarkup = this.items.map((item, index) => `
        <details class="faq-item"${index === 0 ? " open" : ""}>
          <summary>
            <span class="faq-item__number" aria-hidden="true">0${index + 1}</span>
            <span class="faq-item__question">${this.escape(item.question)}</span>
            <span class="faq-item__icon" aria-hidden="true"></span>
          </summary>
          <div class="faq-item__answer">
            <p>${this.escape(item.answer)}</p>
          </div>
        </details>
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
            background: var(--cream);
            color: var(--brown);
            font-family: "Quicksand", Arial, sans-serif;
            font-weight: 550;
            font-synthesis: none;
            text-rendering: geometricPrecision;
          }

          :host([data-wix-frame]) {
            height: auto;
          }

          *,
          *::before,
          *::after {
            box-sizing: border-box;
          }

          a {
            color: inherit;
            text-decoration: none;
          }

          .faq {
            width: 100%;
            height: 100%;
            min-height: 0;
            padding: clamp(74px, 8vw, 118px) var(--pad);
            overflow: hidden;
            background: var(--cream);
            border-top: 2px solid var(--brown);
            border-bottom: 2px solid var(--brown);
          }

          :host([data-wix-frame]) .faq {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
          }

          .faq__grid {
            height: 100%;
            display: grid;
            grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.28fr);
            gap: clamp(48px, 7vw, 112px);
            align-items: start;
          }

          .eyebrow {
            margin: 0 0 18px;
            color: #a84c09;
            font-size: 12px;
            font-weight: 850;
            letter-spacing: 0.13em;
            text-transform: uppercase;
          }

          h2 {
            max-width: 660px;
            margin: 0;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(54px, 6vw, 92px);
            font-weight: 900;
            line-height: 0.96;
            text-transform: uppercase;
          }

          .intro__copy {
            max-width: 520px;
            margin: 26px 0 0;
            font-size: clamp(16px, 1.5vw, 20px);
            line-height: 1.6;
          }

          .cta {
            min-height: 50px;
            margin-top: 32px;
            padding: 0 22px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 2px solid var(--brown);
            border-radius: 10px;
            background: var(--orange);
            color: #fff;
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            transition: transform 150ms ease;
          }

          .cta:hover,
          .cta:focus-visible {
            transform: translateY(-2px);
          }

          .cta:focus-visible,
          summary:focus-visible {
            outline: 3px solid var(--yellow);
            outline-offset: 3px;
          }

          .faq-list {
            min-width: 0;
            border-top: 2px solid var(--brown);
          }

          .faq-item {
            border-bottom: 2px solid var(--brown);
          }

          .faq-item summary {
            position: relative;
            min-height: 92px;
            padding: 24px 62px 24px 72px;
            display: flex;
            align-items: center;
            cursor: pointer;
            list-style: none;
          }

          .faq-item summary::-webkit-details-marker {
            display: none;
          }

          .faq-item__number {
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 24px;
            font-weight: 900;
          }

          .faq-item__question {
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(22px, 2.2vw, 32px);
            font-weight: 900;
            line-height: 1.06;
            text-transform: uppercase;
          }

          .faq-item__icon {
            position: absolute;
            right: 0;
            top: 50%;
            width: 34px;
            height: 34px;
            transform: translateY(-50%);
            border: 2px solid var(--brown);
            border-radius: 50%;
            background: var(--yellow);
          }

          .faq-item__icon::before,
          .faq-item__icon::after {
            content: "";
            position: absolute;
            left: 50%;
            top: 50%;
            width: 12px;
            height: 2px;
            background: var(--brown);
            transform: translate(-50%, -50%);
            transition: transform 180ms ease;
          }

          .faq-item__icon::after {
            transform: translate(-50%, -50%) rotate(90deg);
          }

          .faq-item[open] .faq-item__icon::after {
            transform: translate(-50%, -50%) rotate(0deg);
          }

          .faq-item__answer {
            padding: 0 62px 28px 72px;
          }

          .faq-item__answer p {
            max-width: 760px;
            margin: 0;
            font-size: 15px;
            line-height: 1.65;
          }

          @media (max-width: 900px) {
            .faq__grid {
              grid-template-columns: 1fr;
              gap: 54px;
            }

            .intro__copy {
              max-width: 700px;
            }
          }

          @media (max-width: 680px) {
            .faq {
              padding: 54px 20px;
            }

            .faq__grid {
              display: block;
            }

            .eyebrow {
              margin-bottom: 14px;
              font-size: 10px;
            }

            h2 {
              font-size: clamp(46px, 13vw, 62px);
            }

            .intro__copy {
              margin-top: 18px;
              font-size: 15px;
              line-height: 1.5;
            }

            .faq-list {
              margin-top: 44px;
            }

            .faq-item summary {
              min-height: 82px;
              padding: 20px 48px 20px 46px;
            }

            .faq-item__number {
              font-size: 18px;
            }

            .faq-item__question {
              font-size: 22px;
            }

            .faq-item__icon {
              width: 30px;
              height: 30px;
            }

            .faq-item__answer {
              padding: 0 48px 24px 46px;
            }

            .faq-item__answer p {
              font-size: 14px;
            }
          }

          @media (max-width: 390px) {
            h2 {
              font-size: 43px;
            }

            .faq-item__question {
              font-size: 20px;
            }
          }
        </style>

        <section class="faq" aria-labelledby="queso-cakes-faq-title">
          <div class="faq__grid">
            <div class="intro">
              <p class="eyebrow">${this.escape(eyebrow)}</p>
              <h2 id="queso-cakes-faq-title">${this.escape(title)}</h2>
              <p class="intro__copy">${this.escape(copy)}</p>
              <a class="cta" href="${this.escape(ctaUrl)}">${this.escape(ctaLabel)}</a>
            </div>

            <div class="faq-list">
              ${faqMarkup}
            </div>
          </div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-cakes-faq")) {
    customElements.define("queso-cakes-faq", QuesoCakesFaq);
  }
})();