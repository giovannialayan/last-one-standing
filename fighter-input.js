const template = document.createElement('template');
template.innerHTML = `
<style>
div {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    background-color: #444;
    padding: 5px 15px 15px 15px;
    margin: 20px 10px 20px 10px;
}
</style>
<div>
    <p id="number"></p>
    <p>name: </p>
    <input id="nameInput" type="text" autocomplete="chrome-off"></input>
    <p>player: </p>
    <input id="playerInput" type="text" autocomplete="chrome-off"></input>
    <p>image link:</p>
    <input id="imageInput" type="text" autocomplete="chrome-off"></input>
    <br>
    <img width="150" height="150" src=noimage.png>
</div>
`;

class FighterInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.number = this.shadowRoot.querySelector('#number');
    this.image = this.shadowRoot.querySelector('img');
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {}

  attributeChangedCallback(attributeName, oldVal, newVal) {
    //console.log(attributeName, oldVal, newVal);
    this.render;
  }

  static get observedAttributes() {
    return ['data-number', 'data-image'];
  }

  render() {
    this.number.innerHTML = `fighter ${this.getAttribute('data-number') ? this.getAttribute('data-number') : 0}`;
    this.image.src = this.getAttribute('data-image') ? this.getAttribute('data-image') : 'noimage.png';
  }
}

customElements.define('fighter-input', FighterInput);
