class KeyEventHandler {
  constructor(){
    this.keyEvents = [];
    this.canTriggerEvent = true;
    this.triggerTimer;

    const triggerEvent = cb => {
      this.canTriggerEvent = false;
      this.triggerTimer = setTimeout(() => { this.canTriggerEvent = true; }, 200);
      cb();
    };

    document.addEventListener('keydown', e => {
      //e.preventDefault();
      if(this.canTriggerEvent){
        //console.log(e.keyCode);
        for(let i = 0; i < this.keyEvents.length; i += 1){
          const {
            code,
            ctrKey,
            shiftKey,
            cb,
          } = this.keyEvents[i];

          if(code === e.keyCode && ctrKey === e.metaKey && shiftKey == e.shiftKey){
            triggerEvent(cb);
            break;
          }
        }
      }
    })
  }

  disable() {
    clearTimeout(this.triggerTimer);
    this.canTriggerEvent = false;
  }

  enable() {
    clearTimeout(this.triggerTimer);
    this.canTriggerEvent = true;
  }

  bindEvents(code, cb, ctrKey = false, shiftKey = false) {
    if(typeof cb === 'function') this.keyEvents.push({code, cb, ctrKey, shiftKey});
  }
}

export default KeyEventHandler;