(() => {
  "use strict";

  const SCRIPT_URL = document.currentScript?.src || "";
  const REPO_ROOT = new URL("../../", SCRIPT_URL).href;
  const FONT_LOVELO = new URL("Lovelo_Black.otf", REPO_ROOT).href;
  const FONT_QUICKSAND = new URL("Quicksand-VariableFont_wght.ttf", REPO_ROOT).href;
  const IS_WIX_FRAME = window.self !== window.top;

  function installFonts() {
    if (document.head.querySelector("style[data-queso-cakes-order-guide-fonts]")) return;

    const style = document.createElement("style");
    style.dataset.quesoCakesOrderGuideFonts = "true";
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

  class QuesoCakesOrderGuide extends HTMLElement {
    static get observedAttributes() {
      const attributes = [
        "eyebrow",
        "title",
        "copy",
        "note-title",
        "note-copy"
      ];

      for (let index = 1; index <= 3; index += 1) {
        attributes.push(
          `step-${index}-title`,
          `step-${index}-copy`
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

    render() {
      const eyebrow = this.value("eyebrow", "Made fresh, never rushed");
      const title = this.value("title", "From oven to occasion.");
      const copy = this.value(
        "copy",
        "Choose the cake, add the details and leave the baking to us. Every Queso cake is made fresh in Hong Kong in small batches."
      );

      const steps = [
        {
          title: this.value("step-1-title", "Choose your cake"),
          copy: this.value(
            "step-1-copy",
            "Go playful with Birthday Suit, polished with Artisan, personal with Canvas or seasonal with the Flavor Drop."
          )
        },
        {
          title: this.value("step-2-title", "Add the details"),
          copy: this.value(
            "step-2-copy",
            "Select the available options for your cake. Canvas orders can include your own image and message."
          )
        },
        {
          title: this.value("step-3-title", "Pick up or delivery"),
          copy: this.value(
            "step-3-copy",
            "Choose the available Hong Kong delivery or TST MTR pickup option during ordering."
          )
        }
      ];

      const noteTitle = this.value("note-title", "Small-batch note");
      const noteCopy = this.value(
        "note-copy",
        "Bake slots are limited, so ordering ahead gives you the best chance of getting the date you need."
      );

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
            background: var(--yellow);
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

          .guide {
            width: 100%;
            height: 100%;
            min-height: 0;
            padding: clamp(74px, 8vw, 118px) var(--pad);
            overflow: hidden;
            background: var(--yellow);
            border-top: 2px solid var(--brown);
            border-bottom: 2px solid var(--brown);
          }

          :host([data-wix-frame]) .guide {
            position: fixed;
            inset: 0;
            width: auto;
            height: auto;
          }

          .guide__grid {
            height: 100%;
            display: grid;
            grid-template-columns: minmax(0, 0.78fr) minmax(0, 1.22fr);
            gap: clamp(42px, 7vw, 110px);
            align-items: center;
          }

          .intro {
            min-width: 0;
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
            max-width: 720px;
            margin: 0;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(54px, 6.5vw, 96px);
            font-weight: 900;
            line-height: 0.96;
            text-transform: uppercase;
          }

          .intro__copy {
            max-width: 580px;
            margin: 26px 0 0;
            font-size: clamp(16px, 1.5vw, 20px);
            line-height: 1.6;
          }

          .note {
            max-width: 560px;
            margin-top: 40px;
            padding: 22px 24px;
            border: 2px solid var(--brown);
            border-radius: 18px;
            background: var(--cream);
            box-shadow: 7px 7px 0 var(--brown);
          }

          .note strong {
            display: block;
            margin-bottom: 8px;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 16px;
            text-transform: uppercase;
          }

          .note p {
            margin: 0;
            font-size: 14px;
            line-height: 1.55;
          }

          .steps {
            display: grid;
            gap: 16px;
            min-width: 0;
          }

          .step {
            position: relative;
            min-height: 150px;
            padding: 28px 30px 28px 120px;
            overflow: hidden;
            border: 2px solid var(--brown);
            border-radius: 22px;
            background: var(--cream);
          }

          .step:nth-child(2) {
            background: var(--pink);
            transform: rotate(-0.6deg);
          }

          .step:nth-child(3) {
            background: var(--orange);
            color: #fff;
            transform: rotate(0.4deg);
          }

          .step__number {
            position: absolute;
            left: 24px;
            top: 50%;
            width: 70px;
            transform: translateY(-50%);
            font-family: "Lovelo", Arial, sans-serif;
            font-size: 56px;
            font-weight: 900;
            line-height: 1;
          }

          .step h3 {
            margin: 0;
            font-family: "Lovelo", Arial, sans-serif;
            font-size: clamp(24px, 2.2vw, 34px);
            font-weight: 900;
            line-height: 1;
            text-transform: uppercase;
          }

          .step p {
            max-width: 720px;
            margin: 13px 0 0;
            font-size: 15px;
            line-height: 1.55;
          }

          @media (max-width: 900px) {
            .guide__grid {
              grid-template-columns: 1fr;
              gap: 50px;
              align-content: center;
            }

            .intro__copy,
            .note {
              max-width: 720px;
            }
          }

          @media (max-width: 680px) {
            .guide {
              padding: 54px 20px;
            }

            .guide__grid {
              display: block;
            }

            .eyebrow {
              margin-bottom: 14px;
              font-size: 10px;
            }

            h2 {
              font-size: clamp(48px, 14vw, 66px);
            }

            .intro__copy {
              margin-top: 18px;
              font-size: 15px;
              line-height: 1.5;
            }

            .note {
              margin-top: 28px;
              padding: 18px;
              box-shadow: 5px 5px 0 var(--brown);
            }

            .steps {
              margin-top: 42px;
              gap: 14px;
            }

            .step {
              min-height: 0;
              padding: 88px 20px 24px;
              border-radius: 18px;
            }

            .step__number {
              left: 20px;
              top: 22px;
              width: auto;
              transform: none;
              font-size: 46px;
            }

            .step h3 {
              font-size: 25px;
            }

            .step p {
              font-size: 14px;
            }
          }

          @media (max-width: 390px) {
            h2 {
              font-size: 44px;
            }
          }
        </style>

        <section class="guide" aria-labelledby="queso-cakes-order-guide-title">
          <div class="guide__grid">
            <div class="intro">
              <p class="eyebrow">${this.escape(eyebrow)}</p>
              <h2 id="queso-cakes-order-guide-title">${this.escape(title)}</h2>
              <p class="intro__copy">${this.escape(copy)}</p>

              <aside class="note">
                <strong>${this.escape(noteTitle)}</strong>
                <p>${this.escape(noteCopy)}</p>
              </aside>
            </div>

            <div class="steps">
              ${steps.map((step, index) => `
                <article class="step">
                  <span class="step__number" aria-hidden="true">0${index + 1}</span>
                  <h3>${this.escape(step.title)}</h3>
                  <p>${this.escape(step.copy)}</p>
                </article>
              `).join("")}
            </div>
          </div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-cakes-order-guide")) {
    customElements.define("queso-cakes-order-guide", QuesoCakesOrderGuide);
  }
})();