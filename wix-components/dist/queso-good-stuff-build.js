(() => {
  "use strict";

  class QuesoGoodStuff extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      this.render();
    }

    render() {
      this.shadowRoot.innerHTML = `
        <style>
          @font-face {
            font-family: Lovelo;
            src: url("../../Lovelo_Black.otf") format("opentype");
            font-weight: 900;
            font-display: swap;
          }

          @font-face {
            font-family: Quicksand;
            src: url("../../Quicksand-VariableFont_wght.ttf") format("truetype");
            font-weight: 300 700;
            font-display: swap;
          }

          :host {
            --orange: #ed6011;
            --cream: #fdf3e6;
            --yellow: #f4c24a;
            --brown: #3d2416;
            --pink: #efa3b5;
            --white: #ffffff;
            --line: 2px solid var(--brown);
            display: block;
            width: 100%;
            height: 100%;
            min-height: 0;
            overflow: hidden;
            background: var(--cream);
            color: var(--brown);
            font-family: Quicksand, Arial, sans-serif;
            font-weight: 550;
          }

          *,
          *::before,
          *::after {
            box-sizing: border-box;
          }

          .good-stuff {
            width: 100%;
            min-height: 100%;
            padding: clamp(34px, 4.2vw, 64px) clamp(20px, 4.5vw, 72px);
            background: var(--cream);
          }

          .eyebrow {
            margin: 0 0 10px;
            color: #a84c09;
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.15em;
            text-transform: uppercase;
          }

          h2 {
            margin: 0 0 clamp(28px, 3vw, 44px);
            font-family: Lovelo, Arial, sans-serif;
            font-size: clamp(52px, 6vw, 92px);
            font-weight: 900;
            line-height: 0.95;
            letter-spacing: 0;
            text-transform: uppercase;
          }

          .proof-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            border: var(--line);
            background: var(--white);
          }

          .proof {
            min-height: 196px;
            padding: 30px 28px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            border-right: var(--line);
          }

          .proof:last-child {
            border-right: 0;
          }

          .brand-icon {
            position: relative;
            display: block;
            width: 66px;
            height: 66px;
            margin-bottom: 18px;
            flex: 0 0 66px;
            overflow: hidden;
            border: var(--line);
            background: var(--yellow);
          }

          .brand-icon::before,
          .brand-icon::after {
            content: "";
            position: absolute;
            display: block;
          }

          .icon-fresh {
            border-radius: 50%;
            background: var(--orange);
          }

          .icon-fresh::before {
            inset: 15px;
            background: var(--cream);
            clip-path: polygon(
              50% 0,
              61% 36%,
              100% 50%,
              61% 64%,
              50% 100%,
              39% 64%,
              0 50%,
              39% 36%
            );
          }

          .icon-ingredient {
            border-radius: 48% 48% 12px 48%;
            background: var(--yellow);
            transform: rotate(-4deg);
          }

          .icon-ingredient::before {
            width: 23px;
            height: 31px;
            left: 20px;
            top: 14px;
            border: var(--line);
            border-radius: 55% 15% 55% 15%;
            transform: rotate(35deg);
            background: var(--cream);
          }

          .icon-ingredient::after {
            width: 8px;
            height: 8px;
            right: 10px;
            bottom: 10px;
            border-radius: 50%;
            background: var(--orange);
          }

          .icon-halal {
            border-radius: 50%;
            background: var(--brown);
          }

          .icon-halal::before {
            width: 39px;
            height: 39px;
            left: 11px;
            top: 11px;
            border-radius: 50%;
            background: var(--yellow);
          }

          .icon-halal::after {
            width: 39px;
            height: 39px;
            left: 22px;
            top: 6px;
            border-radius: 50%;
            background: var(--brown);
          }

          .icon-love {
            border-radius: 16px 16px 32px 32px;
            background: var(--pink);
            transform: rotate(3deg);
          }

          .icon-love::before {
            content: "♥";
            inset: 4px;
            display: grid;
            place-items: center;
            color: var(--brown);
            font-family: Arial, sans-serif;
            font-size: 42px;
          }

          strong {
            font-family: Lovelo, Arial, sans-serif;
            font-size: 20px;
            line-height: 1.05;
            text-transform: uppercase;
          }

          .proof p {
            margin: 9px 0 0;
            font-size: 12px;
            line-height: 1.5;
          }

          @media (max-width: 900px) {
            .proof-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .proof:nth-child(2) {
              border-right: 0;
            }

            .proof:nth-child(-n + 2) {
              border-bottom: var(--line);
            }
          }

          @media (max-width: 560px) {
            .good-stuff {
              padding: 38px 20px;
            }

            h2 {
              margin-bottom: 26px;
              font-size: 52px;
            }

            .proof-grid {
              grid-template-columns: 1fr;
            }

            .proof {
              min-height: 172px;
              padding: 25px 24px;
              border-right: 0;
              border-bottom: var(--line);
            }

            .proof:last-child {
              border-bottom: 0;
            }
          }
        </style>

        <section class="good-stuff" aria-labelledby="queso-good-stuff-title">
          <p class="eyebrow">The Queso standard</p>
          <h2 id="queso-good-stuff-title">The good stuff.</h2>

          <div class="proof-grid">
            <article class="proof">
              <span class="brand-icon icon-fresh" aria-hidden="true"></span>
              <strong>Baked fresh</strong>
              <p>Made fresh for your order.</p>
            </article>

            <article class="proof">
              <span class="brand-icon icon-ingredient" aria-hidden="true"></span>
              <strong>Premium ingredients</strong>
              <p>Valrhona chocolate in chocolate variations.</p>
            </article>

            <article class="proof">
              <span class="brand-icon icon-halal" aria-hidden="true"></span>
              <strong>Halal</strong>
              <p>Prepared with Halal ingredients.</p>
            </article>

            <article class="proof">
              <span class="brand-icon icon-love" aria-hidden="true"></span>
              <strong>Extra love</strong>
              <p>Handcrafted, so each cake is slightly unique.</p>
            </article>
          </div>
        </section>
      `;
    }
  }

  if (!customElements.get("queso-good-stuff")) {
    customElements.define("queso-good-stuff", QuesoGoodStuff);
  }
})();
