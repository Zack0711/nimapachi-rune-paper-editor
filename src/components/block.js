import * as d3 from 'd3';
import 'd3-selection-multi';

const defaultStyle = {
  fill: '#eee',
  flipX: 1,
  flipY: 1,
  theme: 'classical',
  /* -- text setting --*/
  fontSize: 16,
  lineHeight: 1,
  fontFamily: 'font-hdzb',
  fontStyle: 'normal',
  fontWeight: 'normal',
  outLine: false,
  text: '',
  textDecoration: 'none',
  textAnchor: 'start',
  textMode: 'stamp',
  /* ----------------- */
  isSelected: false,
  mode: 'symbol',
  opacity: 0.84,
  pattern: {
    span: 0.5,
  },
  symbol: '',
  scale: 1,
  rotate: 0,
  x: 0,
  y: 0,
}

class Block {
  constructor(svg, container, style, selectCallBack, syncIndicatorCallBack, recordCallBack, textEditCallBack, browser){
    this.svg = svg;
    this.container = container;
    this.browser = browser;

    this.selectCallBack = selectCallBack;
    this.syncIndicatorCallBack = syncIndicatorCallBack;
    this.recordCallBack = recordCallBack;
    this.textEditCallBack = textEditCallBack;

    this.style = Object.assign({}, defaultStyle, style);
    this.update = this.update.bind(this);

    this.type = 'block';

    this.vectorGroup = this.container.append('g');
    this.rect = this.vectorGroup.append('rect');
    this.textInstance = this.vectorGroup.append('g').attrs({ class: 'text'});

    //this.textInstance.on('dblclick', () => { this.textEditCallBack();});

    this.isMoving = false;

    let moveBindTimer;
    let clickTimer;
    let dragTimer;
    let clickTimes = 0;

    const dragEvent = d3.drag().on('drag', d => {
      if(!this.style.isSelected) this.update({}, 'select', true, true);
      if(!this.isMoving){
        this.isMoving = true;
      }
      clearTimeout(dragTimer);
      dragTimer = setTimeout(()=>{
        clearTimeout(dragTimer);
        this.isMoving = false;
        this.update({}, 'move', true, true);
      }, 300);

      this.update({x: d3.event.x, y: d3.event.y}, 'move', true);
    });

    this.vectorGroup.attr('class', 'svg-block')
      .on('click', () => {
        if(!this.style.isSelected) this.update({}, 'select', true, true);
      })
      .call(dragEvent)

    this.update();
  }

  makePattern() {
    const {
      flipX,
      flipY,
      scale,
      rotate,      
      pattern,
      symbol,
    } = this.style;

    const {
      width,
      height,
    } = this.vectorGroup.select(`use`).node().getBoundingClientRect();

    const WIDTH = this.svg.datum().edit.width;
    const HEIGHT = this.svg.datum().edit.height;

    const xInterval = width + width * pattern.span;
    const yInterval = height + height * pattern.span;

    let xVal = Math.round(WIDTH / xInterval);
    let yVal = Math.round(HEIGHT / yInterval);

    let startX = (WIDTH - (xVal * xInterval))/2;
    let startY = (HEIGHT - (yVal * yInterval))/2;

    const patternArray = [];

    for(let j = 0; j <= yVal; j += 1){
      for(let i = 0; i <= xVal; i += 1){
        patternArray.push({x: startX + xInterval * i, y: startY + yInterval * j});
      }
    }

    return patternArray;
  }

  remove() {
    this.vectorGroup.remove();
  }

  update(style, actionType, needSyncIndicator, needRecord) {
    if(needSyncIndicator && !this.style.isSelected) this.selectCallBack(this);

    this.style = Object.assign({}, this.style, style, { isSelected: needSyncIndicator || false});

    const boundaryCheck = style => {
      let {
        x,
        y,
      } = style;

      const {
        width,
        height,
      } = this.vectorGroup.node().getBoundingClientRect();

      const minVal = 15;
      const dX = width * 0.1 > minVal ? width * 0.4 : width * 0.5 - minVal;
      const dY = height * 0.1 > minVal ? height * 0.4 : height * 0.5 - minVal;

      const limitX = {
        max: parseInt(this.svg.datum().edit.width) + dX,
        min: -dX,
      }

      const limitY = {
        max: parseInt(this.svg.datum().edit.height) + dY,
        min: -dY,
      }

      if(x > limitX.max) x = limitX.max;
      if(x < limitX.min) x = limitX.min;
      if(y > limitY.max) y = limitY.max;
      if(y < limitY.min) y = limitY.min;

      return { x, y };
    }

    const adjustPos = boundaryCheck(this.style);

    this.style.x = adjustPos.x;
    this.style.y = adjustPos.y;

    const {
      fill,
      flipX,
      flipY,
      /* -- text setting --*/
      fontSize,
      lineHeight,
      fontFamily,
      fontStyle,
      fontWeight,
      outLine,
      text,
      textDecoration,
      textAnchor,
      textMode,
      /* ----------------- */
      mode,
      opacity,
      rotate,      
      scale,
      symbol,
      x,
      y,
    } = this.style;

    const realFontSize = fontSize * scale;

    const lineRealHeight = realFontSize * lineHeight;

    let vectorX = x;
    let vectorY = y;
    let vectorScaleX = 1;
    let vectorScaleY = 1;
    let vectorRotate = 0;
    let vectorFill = outLine ? 'none' : fill;
    let vectorStroke = outLine ? fill : 'none';

    let allUseData = [];
    let allUseTag;

    let allTspanData = [];
    let allTspanTag;

    if(mode === 'symbol'){
      allUseData = [{x: 0, y: 0}];
    }

    if(mode === 'pattern'){
      vectorX = 0;
      vectorY = 0;
      allUseData = this.makePattern();
    }

    if(mode === 'text'){
      allTspanData = text.split(/[\n\r|\n|\r\n]/);
      vectorScaleX = flipX;
      vectorScaleY = flipY;
      vectorRotate = rotate;
    }

    allUseTag = this.vectorGroup.selectAll('use').data(allUseData);
    allUseTag.exit().remove();
    allUseTag.enter().append('use');

    allTspanTag = this.textInstance.selectAll('text').data(allTspanData);
    allTspanTag.exit().remove();
    allTspanTag.enter().append('text');

    this.textInstance.attrs({
      'font-size': realFontSize,
      'font-family': `${fontFamily}`,
      'font-style': fontStyle,
      'font-weight': fontWeight,
      'text-decoration': textDecoration,
    });

    this.vectorGroup.datum(this.style)
    this.vectorGroup.attrs({
        transform: `translate(${vectorX} ${vectorY}) scale(${vectorScaleX} ${vectorScaleY}) rotate(${vectorRotate})`,
        fill: vectorFill,
        stroke: vectorStroke,
        opacity,
      }).selectAll('use').attrs({
        class: 'sticker',
        transform: d => `translate(${d.x} ${d.y}) scale(${scale * flipX} ${scale * flipY }) rotate(${rotate})`,
        'xlink:href': `#${symbol}-symbol`,
        'href': `#${symbol}-symbol`,
      });

    let factor = allTspanData.length;
    const scaleFactor = {
      x: 1,
      y: 1,
      wordY: 1,
      fox: 1,
    };

    allTspanData.forEach(d => { if(d.length > factor) factor = d.length; })

    this.textInstance.selectAll('text').attrs({
      x: (d, i) => -i * lineRealHeight,
      y: 0,
      'dominant-baseline': 'text-before-edge',
      'text-anchor': textAnchor,
      'writing-mode': 'tb',
      'transform': (d, i) => {
        const scaleX = factor / allTspanData.length;
        const scaleY = d.length ? factor / d.length : 1;

        if(scaleX > scaleFactor.x) scaleFactor.x = scaleX;
        if(scaleY > scaleFactor.y) scaleFactor.y = scaleY;

        if(d.length > scaleFactor.wordY ) scaleFactor.wordY = d.length;

        return textMode === 'stamp' ? `scale(${scaleX} ${scaleY})` : 'scale(1 1)';
      }
    }).text(d => d);

    const {
      width,
      height
    } = this.textInstance.node().getBBox();

    scaleFactor.fox = scaleFactor.x > scaleFactor.y ? scaleFactor.x : scaleFactor.y

    let textTransX = 0;
    let textTransY = 0;

    const strokeW = width/16;
    const rectW = this.browser.isFirefox ? width : width + strokeW;
    const rectH = this.browser.isFirefox ? height : height + strokeW;

    switch(textAnchor){
      case 'start':
        if(this.browser.isFirefox){
          if(textMode === 'stamp'){
            textTransX = scaleFactor.fox * realFontSize;
            textTransY = -scaleFactor.fox * realFontSize;
          }else{
            textTransX = allTspanData.length * realFontSize / 2;
            textTransY = -scaleFactor.wordY * realFontSize / 2;
          }
        }else{
          textTransX = width / 2;
          textTransY = -height / 2;
        }
        break;
    }

    this.rect.attrs({
      width: rectW,
      height: rectH,
      opacity: textMode === 'stamp' ? 1 : 0,
      'stroke-width': strokeW,
      'transform': `translate(${-rectW/2} ${-rectH / 2})`,
      fill: 'none',
      stroke: fill,
    })

    this.textInstance.attrs({
      'transform': `translate(${textTransX} ${textTransY})`,
    });

    if(needSyncIndicator) this.syncIndicatorCallBack();
    if(needRecord) this.recordCallBack(actionType);
  }
}

export default Block;