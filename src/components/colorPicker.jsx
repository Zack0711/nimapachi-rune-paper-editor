import React from 'react';
import { BlockPicker } from 'react-color';

class ColorPicker extends React.Component {
  constructor(props){
    super(props);
    this.state = {      
      color: '#000',
      isOpen: false,
      isDisabled: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.setColor = this.setColor.bind(this);

    this.mouseOnMenu = false;
    this.menuToogle = this.menuToogle.bind(this);
    this.menuMouseOverToogle = this.menuMouseOverToogle.bind(this);
    this.clickTrigger = this.clickTrigger.bind(this);
  }

  componentDidMount() {
    document.addEventListener("click", this.clickTrigger)
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.clickTrigger)
  }

  setColor(color) {
    this.setState({color});
  }

  menuToogle(isOpen=false) {
    this.setState({isOpen})
  }

  menuMouseOverToogle(isOver) {
    this.mouseOnMenu = isOver
  }

  disable() {
    this.setState({ isDisabled: true, isOpen: false})
  }

  enable() {
    this.setState({ isDisabled: false})
  }

  clickTrigger() {
    if(!this.mouseOnMenu){ this.menuToogle() }
  }

  closeMenu() {
    this.setState({ isOpen: false});    
  }

  handleChange(color, event) {
    let hex = color.hex;

    this.setState({color: hex});
    this.props.onChange(hex);
  }

  render() {
    const {
      color,
      isOpen,
      isDisabled,
    } = this.state;

    const iconStyle = `color:${color};`;
    const dropdownClass = `dropdown color-picker-dropdown${ isOpen ? ' show' : '' }`;
    const btnClass = `btn btn-light${ isOpen ? ' active' : '' }`;
    const menuClass = `dropdown-menu${ isOpen ? ' show' : '' }`;

    return (
      <div className={dropdownClass}
        onMouseOver={(e)=>{ this.menuMouseOverToogle(true) }}
        onMouseOut={(e)=>{ this.menuMouseOverToogle(false) }}
      >
        <button className={btnClass} onClick={ () => { 
          this.menuToogle(!isOpen);
        }} disabled={isDisabled}>
          <div className="color-block" style={{backgroundColor: color}}> </div>
        </button>
        <div className={menuClass}>
          <BlockPicker color={color} onChangeComplete = {this.handleChange} />
        </div>
      </div>
    );
  }
}

export default ColorPicker;