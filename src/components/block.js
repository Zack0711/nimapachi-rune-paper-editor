import * as d3 from 'd3';
import 'd3-selection-multi';

const defaultStyle = {
  fill: '#eee',
  flipX: 1,
  flipY: 1,
  /* -- text setting --*/
  fontSize: 12,
  lineHeight: 1,
  fontFamily: 'font-hdzb',
  fontStyle: 'normal',
  fontWeight: 'normal',
  outLine: false,
  text: '',
  textDecoration: 'none',
  textAnchor: 'start',
  /* ----------------- */
  isSelected: false,
  mode: 'symbol',
  opacity: 0.72,
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
  constructor(svg, container, style, selectCallBack, syncIndicatorCallBack, recordCallBack, textEditCallBack){
    this.svg = svg;
    this.container = container;

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

    /*
    const mouseUp = () => {
      if(this.isMoving) this.update({}, 'move', true, true);
      this.isMoving = false
      d3.select(window).on('mousemove', null);
      d3.select(window).on('mouseup', null);

      clearTimeout(moveBindTimer);
      clickTimer = setTimeout(()=>{
        clickTimes = 0;
        clearTimeout(clickTimer);
      }, 250);
    }

    const mouseMove = () => {
      if(!this.style.isSelected) this.update({}, 'select', true, true);
      const mousePos = d3.mouse(this.container.node());
      this.isMoving = true;
      this.update({x: mousePos[0], y: mousePos[1]}, 'move', true);
    }
    */

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
      /* ----------------- */
      mode,
      opacity,
      rotate,      
      scale,
      symbol,
      x,
      y,
    } = this.style;

    const lineRealHeight = scale * fontSize * lineHeight;

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
      'dominant-baseline': 'text-before-edge',
      'text-anchor': textAnchor,
      'font-size': fontSize * scale,
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
    allTspanData.forEach(d => { if(d.length > factor) factor = d.length; })

    this.textInstance.selectAll('text').attrs({
      x: (d, i) => -i * lineRealHeight,
      y: 0,
      'writing-mode': 'tb',
      'transform': (d, i) => {
        const scaleX = factor / allTspanData.length;
        const scaleY = d.length ? factor / d.length : 0;
        return `scale(${scaleX} ${scaleY})`;
      }
    }).text(d => d);

    const {
      width,
      height
    } = this.textInstance.node().getBBox();

    let textTransX;

    switch(textAnchor){
      case 'start':
        //textTransX = lineRealHeight / 2 * (2 - allTspanData.length);
        textTransX = width / 2;
        break;
      case 'middle':
        textTransX = 0;
        break;
      case 'end':
        textTransX = width / 2;
        break;
    }

    const strokeW = width/16;
    const rectW = width + strokeW*0.8;
    const rectH = height + strokeW*0.8;

    this.rect.attrs({
      width: rectW,
      height: rectH,
      'stroke-width': strokeW,
      'transform': `translate(${-rectW/2} ${-rectH / 2})`,
      fill: 'none',
      stroke: fill,
    })

    this.textInstance.attrs({
      'transform': `translate(${textTransX} ${-height / 2})`,
    });

    if(needSyncIndicator) this.syncIndicatorCallBack();
    if(needRecord) this.recordCallBack(actionType);
  }
}

export default Block;