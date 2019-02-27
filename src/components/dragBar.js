import * as d3 from 'd3';

const checkRange = (val, min, max) => {
  if(val < min) return min;
  if(val > max) return max;
  return val
}

class DragBar {
  constructor(element, update, processVal = 0.5) {
    this.element = element;
    this.update = update;

    this.dragBtn = document.createElement('div');
    this.dragBtnIcon = document.createElement('i');
    this.processBar = document.createElement('div');
    this.processBG = document.createElement('div');

    this.limitWidth = this.element.getBoundingClientRect().width;
    this.disable = false;

    this.set = this.set.bind(this);
    this.disableToggle = this.disableToggle.bind(this);

    //assign class name to each components
    this.dragBtn.classList.add('drag-btn');
    this.dragBtnIcon.classList.add('fa', 'fa-sort-asc');
    this.processBar.classList.add('value-bar');
    this.processBG.classList.add('value-bg');

    //clear the element child node, and assemble the related components
    this.processBG.appendChild(this.processBar);
    this.dragBtn.appendChild(this.dragBtnIcon);
    this.element.innerHTML = '';
    this.element.appendChild(this.processBG);
    this.element.appendChild(this.dragBtn);

    const dragstarted = function(d) {
    };

    const dragged = function(d) {
      if(!this.disable){
        this.limitWidth = this.element.getBoundingClientRect().width;
        d.x = checkRange(d3.event.x, 0, this.limitWidth)
        const progressVal = (d.x / this.limitWidth);
        this.set(progressVal);        
      }
    }.bind(this)

    const dragended = function(d) {
      if(!this.disable){
        this.limitWidth = this.element.getBoundingClientRect().width;
        d.x = checkRange(d3.event.x, 0, this.limitWidth)
        const progressVal = (d.x / this.limitWidth);
        this.set(progressVal, true, true);
      }
    }.bind(this)

    const dragEvent = d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);

    d3.select(this.dragBtn).datum({x: processVal * this.limitWidth, y: 0}).call(dragEvent);
    this.set(processVal);
  }

  set(val, needUpdate = true, needRecord = false) {
    this.limitWidth = this.element.getBoundingClientRect().width;
    const xVal = this.limitWidth * val;
    d3.select(this.dragBtn).datum({x: xVal, y: 0})

    this.dragBtn.setAttribute('style', `transform: translate(${xVal}px,0px)`);
    this.processBar.setAttribute('style', `width:${val * 100}%;`);

    if(needUpdate) this.update(val, needRecord);
  }

  disableToggle(toggle){
    this.disable = toggle;
    if(toggle){
      this.element.classList.add('is-disable');
    }else{
      this.element.classList.remove('is-disable');      
    }
  }

}

export default DragBar;