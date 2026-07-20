class QuesoTest extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        min-height: 280px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        box-sizing: border-box;
        padding: 32px;
        background: #fdf3e6;
        border: 4px solid #ed6011;
        color: #ed6011;
        font-family: Arial, Helvetica, sans-serif;
        text-align: center;
      ">
        <h2 style="
          margin: 0 0 12px;
          font-size: clamp(32px, 6vw, 72px);
          line-height: 1;
          text-transform: uppercase;
        ">
          Queso is connected
        </h2>

        <p style="
          margin: 0;
          font-size: 18px;
          color: #af5309;
        ">
          This content is coming from our hosted custom element.
        </p>
      </div>
    `;
  }
}

if (!customElements.get("queso-test")) {
  customElements.define("queso-test", QuesoTest);
}
