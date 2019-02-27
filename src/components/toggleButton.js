class ToggleButton {
  constructor(className, toggleOption, selectedValue, clickCallBack, clickToggle = true){
    this.toggleOption = toggleOption;
    this.selectedValue = selectedValue;

    this.instance = document.querySelector(className);

    this.isActive = this.selectedValue === this.toggleOption[1];

    this.active = this.active.bind(this);
    this.deActive = this.deActive.bind(this);

    this.disable = this.disable.bind(this);
    this.enable = this.enable.bind(this);

    this.instance.onclick = () => {
      if(clickToggle){
        if(this.isActive){
          this.deActive();
        }else{
          this.active();
        }        
      }

      if( typeof clickCallBack === 'function'){
        clickCallBack(this.selectedValue);
      }
    }
  }

  active(){
    this.isActive = true;
    this.selectedValue = this.toggleOption[1];
    this.instance.classList.add('active');
  }

  deActive() {
    this.isActive = false;
    this.selectedValue = this.toggleOption[0];
    this.instance.classList.remove('active');
  }

  disable(){
    this.instance.disabled = true;
    this.deActive();
  }

  enable(){
    this.instance.disabled = false;
  }

}

export default ToggleButton;