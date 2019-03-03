import * as d3 from 'd3';
import 'd3-selection-multi';

const defaultStyle = {
  width: 0,
  height: 0,
  stroke: '#0FF',
  scale: 1,
  previewScale: 1,
  rotate: 0,
  previewRotate: 0,
  scaleMax: 10,
  scaleMin: 0.5,
  opacity: 1,
  text: '',
  dx: 0,
  dy: 0,
  x: 0,
  y: 0,
  isEditable: true,
}

class Indicator {
  constructor(container, style, zoomCallBack, rotateCallBack){
    this.container = container;
    this.zoomCallBack = zoomCallBack;
    this.rotateCallBack = rotateCallBack;

    this.style = Object.assign({}, defaultStyle, style);
    this.instance = this.container.append('g');

    this.previewPath = this.instance.append('path');
    this.rectPath = this.instance.append('path');

    const rotatePath = `M0,3.4c-1.9,0-3.4-1.5-3.4-3.4c0-1.9,1.5-3.4,3.4-3.4c0.8,0,1.5,0.3,2.1,0.8L0.5-1.2l4.5,0.7l0-4.5L3.4-3.6 C2.5-4.4,1.3-4.9,0-4.9c-2.7,0-5,2.2-5,5c0,2.7,2.2,5,5,5c2.1,0,4-1.4,4.7-3.3L3.1,1.5C2.6,2.6,1.4,3.4,0,3.4z`;

    this.rotateBtn = this.instance.append('g').attr('class', 'rotate-btn');
    this.rotateBtn.append('rect')
                  .attr('x', -6).attr('y', -6)
                  .attr('width', 12).attr('height', 12)
                  .attr('fill', 'rgba(0,0,0,0)')
    this.rotateBtn.append('path').attr('d', rotatePath).attr('fill', '#fff')

    const zoomDragEvent = d3.drag().on('start', () => { 
                                if(this.style.isEditable) this.showPreviewPath(); 
                              }).on('drag', (d) => {
                                if(this.style.isEditable){
                                  const eventPos = {x: d3.event.x, y: d3.event.y};
                                  this.setPreviewPath(eventPos, d.type);                                  
                                }
                              }).on('end', (d) => {
                                if(this.style.isEditable){
                                  this.hidePreviewPath();
                                  this.zoomCallBack(this.style.previewScale, this.style.dx, this.style.dy, d.type)
                                }
                              });

    const rotateDragEvent = d3.drag().on('start', () => { 
                                if(this.style.isEditable) this.showPreviewPath();
                              }).on('drag', (d) => {
                                if(this.style.isEditable){
                                  const eventPos = {x: d3.event.x, y: d3.event.y};
                                  this.rotatePreviewPath(eventPos);
                                }
                              }).on('end', (d) => {
                                if(this.style.isEditable){
                                  const rotate = (this.style.previewRotate + this.style.rotate) % 360;
                                  this.hidePreviewPath();
                                  this.rotateCallBack(rotate);
                                }
                              });

    this.circleLT = this.instance.append('circle').datum({type: 'lt'}).attr('class', 'resize-circle circle-lt');
    this.circleLB = this.instance.append('circle').datum({type: 'lb'}).attr('class', 'resize-circle circle-lb');
    this.circleRT = this.instance.append('circle').datum({type: 'rt'}).attr('class', 'resize-circle circle-rt');
    this.circleRB = this.instance.append('circle').datum({type: 'rb'}).attr('class', 'resize-circle circle-rb');

    this.setPosition = this.setPosition.bind(this);
    this.setSize = this.setSize.bind(this);
    this.setOpacity = this.setOpacity.bind(this)

    this.previewPath.attr('fill', 'none').attr('stroke', '#f00');
    this.rectPath.attr('fill', 'none').attr('stroke', this.style.stroke);

    this.rotateBtn.call(rotateDragEvent.bind(this));
    this.instance.selectAll('circle')
        .attr('r', 3)
        .attr('fill', '#fff')
        .attr('stroke', this.style.stroke)
        .call(zoomDragEvent.bind(this));

    this.setOpacity().setPosition().setSize();
  }

  setPreviewPath(pos, type) {
    const {
      width,
      height,
      scale,
      scaleMax,
      scaleMin,
    } = this.style;

    const posArray = [
      {x: -width / 2 - 1, y: -height / 2 -1}, 
      {x: width / 2 + 1, y: height / 2 + 1}
      //{x: -width * scale / 2 - 1, y: -height * scale / 2 -1}, 
      //{x: width * scale / 2 + 1, y: height * scale / 2 + 1}
    ];

    let result = {x: 0, y: 0};

    const scaleCompare = (posM, posR) => {
      const scaleX = Math.abs(posM.x - posR.x) / (width/scale);
      const scaleY = Math.abs(posM.y - posR.y) / (height/scale);
      const result = { x: 0, y: 0, scale: scaleX > scaleY ? scaleY : scaleX };

      if(result.scale > scaleMax) result.scale = scaleMax;
      if(result.scale < scaleMin) result.scale = scaleMin;

      result.x = posM.x - posR.x > 0 ? posR.x + (width/scale) * result.scale + 1 : posR.x - (width/scale) * result.scale - 1;
      result.y = posM.y - posR.y > 0 ? posR.y + (height/scale) * result.scale + 1 : posR.y - (height/scale) * result.scale - 1;
      //result.x = posM.x - posR.x > 0 ? posR.x + width * result.scale + 1 : posR.x - width * result.scale - 1;
      //result.y = posM.y - posR.y > 0 ? posR.y + height * result.scale + 1 : posR.y - height * result.scale - 1;
      return result;
    }

    switch(type){
      case 'lt':
        result = scaleCompare(pos, {x: posArray[1].x, y: posArray[1].y});
        posArray[0].x = result.x - 1;
        posArray[0].y = result.y - 1;
        break;
      case 'lb':
        result = scaleCompare(pos, {x: posArray[1].x, y: posArray[0].y});
        posArray[0].x = result.x - 1;
        posArray[1].y = result.y + 1;
        break;
      case 'rt':
        result = scaleCompare(pos, {x: posArray[0].x, y: posArray[1].y});
        posArray[1].x = result.x + 1;
        posArray[0].y = result.y - 1;
        break;
      case 'rb':
        result = scaleCompare(pos, {x: posArray[0].x, y: posArray[0].y});
        posArray[1].x = result.x + 1;
        posArray[1].y = result.y + 1;
        break;
    }

    this.style.previewScale = result.scale;
    this.style.dx = (posArray[0].x + posArray[1].x) / 2;
    this.style.dy = (posArray[0].y + posArray[1].y) / 2;

    const pathData = [
      `M ${posArray[0].x} ${posArray[0].y}`,
      `L ${posArray[1].x} ${posArray[0].y}`,
      `L ${posArray[1].x} ${posArray[1].y}`,
      `L ${posArray[0].x} ${posArray[1].y}`,
      `L ${posArray[0].x} ${posArray[0].y}`,
    ]

    this.previewPath.attr('d', pathData.join(' '));
  }

  rotatePreviewPath(pos) {
    const angle = Math.atan(Math.abs(pos.x) / Math.abs(pos.y));
    let deltaDegree = angle / Math.PI * 180 - 45;

    if(pos.x > 0 && pos.y > 0){ deltaDegree = 90 - deltaDegree;}
    if(pos.x <= 0 && pos.y > 0){ deltaDegree = 180 + deltaDegree;}
    if(pos.x <= 0 && pos.y <= 0){ deltaDegree = 270 - deltaDegree;}

    this.style.previewRotate = deltaDegree;
    this.previewPath.attr('transform', `rotate(${deltaDegree})`);
  }

  showPreviewPath() {
    const {
      width,
      height,
      scale,
    } = this.style;

    const posArray = [
      {x: -width / 2 - 1, y: -height / 2 -1}, 
      {x: width / 2 + 1, y: height / 2 + 1}
      //{x: -width * scale / 2 - 1, y: -height * scale / 2 -1}, 
      //{x: width * scale / 2 + 1, y: height * scale / 2 + 1}
    ];

    const pathData = [
      `M ${posArray[0].x} ${posArray[0].y}`,
      `L ${posArray[1].x} ${posArray[0].y}`,
      `L ${posArray[1].x} ${posArray[1].y}`,
      `L ${posArray[0].x} ${posArray[1].y}`,
      `L ${posArray[0].x} ${posArray[0].y}`,
    ]

    this.previewPath.attr('d', pathData.join(' '))
                    .attr('transform', `rotate(0)`)
                    .attr('opacity', 1);
  }

  hidePreviewPath() {
    this.previewPath.attr('opacity', 0);
  }

  setSize(size) {
    const {
      width,
      height,
      scale,
      isEditable,
    } = this.style = Object.assign({}, this.style, size);

    const posArray = [
      {x: -width / 2 - 1, y: -height / 2 -1}, 
      {x: width / 2 + 1, y: height / 2 + 1}
    ];
    const pathData = [
      `M ${posArray[0].x} ${posArray[0].y}`,
      `L ${posArray[1].x} ${posArray[0].y}`,
      `L ${posArray[1].x} ${posArray[1].y}`,
      `L ${posArray[0].x} ${posArray[1].y}`,
      `L ${posArray[0].x} ${posArray[0].y}`,
    ]

    this.rectPath.attr('d', pathData.join(' '));

    this.circleLT.attr('cx', posArray[0].x).attr('cy', posArray[0].y);
    this.circleLB.attr('cx', posArray[0].x).attr('cy', posArray[1].y);
    this.circleRT.attr('cx', posArray[1].x).attr('cy', posArray[0].y);
    this.circleRB.attr('cx', posArray[1].x).attr('cy', posArray[1].y);
    this.rotateBtn.attr('transform', `translate(${posArray[1].x + 8}, ${posArray[0].y - 8})`);

    return this;
  }

  setOpacity(opacity = 1){
    this.style.opacity = opacity;
    this.instance.attr('opacity', this.style.opacity);

    return this;
  }

  setPosition(pos) {
    const {
      x,
      y,
      rotate,
      text,
      isEditable,
    } = this.style = Object.assign({isEditable: false}, this.style, pos);

    this.instance.attrs({
      class: isEditable && 'is-editable',
      transform: `translate(${x} ${y}) rotate(${rotate})`,
    });

    return this;
  }
}

export default Indicator;