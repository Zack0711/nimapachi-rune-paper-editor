import * as d3 from 'd3';
import 'd3-selection-multi';

const defaultStyle = {
  fill: '#fff',
  flipX: 1,
  flipY: 1,
  /* -- text setting --*/
  fontSize: 14,
  lineHeight: 1.2,
  fontFamily: 'Helvetica',
  fontStyle: 'normal',
  fontWeight: 'normal',
  outLine: false,
  text: '',
  textDecoration: 'none',
  textAnchor: 'start',
  /* ----------------- */
  scale: 1,
  rotate: 0,
  x: 0,
  y: 0,
}

class TextEditor {
  constructor(selector, style, syncText){
    this.instance = selector;
    this.syncText = syncText;

    this.textContainer = document.createElement("div");

    this.style = Object.assign({}, defaultStyle, style);

    this.textContainer.setAttribute('contenteditable', 'true');
    this.textContainer.setAttribute('class', 'text-container');
    this.textContainer.addEventListener('keyup', e => {
      this.syncText(this.textContainer.innerText);
    });
    this.instance.appendChild(this.textContainer);
  }

  enableEdit() {
    this.instance.setAttribute('contenteditable', 'true');    
  }
  disableEdit() {
    this.instance.setAttribute('contenteditable', 'false');
  }

  update(style) {
    const {
      text,
      fontSize,
      lineHeight,
      fontFamily,
      fontStyle,
      fontWeight,
      textDecoration,
      textAnchor,
      scale,
      rotate,
      flipX,
      flipY,
      x,
      y,
    } = this.style = Object.assign({}, this.style, style);

    let textAlign;

    switch(textAnchor){
      case 'start':
        textAlign = 'left';
        break;
      case 'middle':
        textAlign = 'center';
        break;
      case 'end':
        textAlign = 'right';
        break;
    }    

    this.textContainer.innerHTML = text.split(/[\n\r|\n|\r\n]/).join('<br>');
    this.textContainer.style = `transform: translate(-50%, -50%) rotate(${rotate}deg) scale(${flipX}, ${flipY});`;

    this.instance.style = `
      font-size: ${fontSize * scale}px;
      font-family: ${fontFamily};
      font-weight: ${fontWeight};
      font-style: ${fontStyle};
      text-align: ${textAlign};
      text-decoration: ${textDecoration};
      line-height: ${lineHeight};
      transform: translate(${x}px, ${y}px);
    `
  }
}

export default TextEditor;