import React from 'react'
import PropTypes from 'prop-types'

class DropdownMenu extends React.PureComponent{
  constructor(props) {
    super(props)
    this.state = {
      isDisabled: false,
      isOpen: false,
      selectedLabel: this.props.options[0].label,
    }
    this.mouseOnMenu = false;
    this.menuToogle = this.menuToogle.bind(this)
    this.menuMouseOverToogle = this.menuMouseOverToogle.bind(this)
    this.clickTrigger = this.clickTrigger.bind(this)
    this.listItem = this.listItem.bind(this)
    this.setSelectedLabel = this.setSelectedLabel.bind(this);
  }

  componentDidMount() {
    document.addEventListener("click", this.clickTrigger)
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.clickTrigger)
  }

  disable() {
    this.setState({ isDisabled: true})
  }

  enable() {
    this.setState({ isDisabled: false})
  }

  clickTrigger() {
    if(!this.mouseOnMenu) this.menuToogle()
  }

  menuToogle(isOpen=false) {
    this.setState({isOpen})
  }

  menuMouseOverToogle(isOver) {
    this.mouseOnMenu = isOver
  }

  setSelectedLabel(selectedLabel) {
    const selectedOption = this.props.options.filter( data => data.value === selectedLabel);
    const label = selectedOption.length > 0 ? selectedOption[0].label : selectedLabel;
    this.setState({selectedLabel: label});
  }

  listItem(listData) {
    let fontStyle = {};
    if(this.props.isFont){
      fontStyle = {'fontFamily': listData.value};
    }

    return(
      <li key={listData.value} className="dropdown-item">
        <div 
          onClick={(e) => {
            e.preventDefault();
            this.setSelectedLabel(listData.label);
            this.props.onChangeFn(listData.value);
            this.menuToogle();
          }}
          style = {fontStyle}
        >
          { listData.label }
        </div>
      </li>
    )
  }

  render() {
    const {
      options,
      onChangeFn,
      iconClass,
    } = this.props

    const {
      isOpen,
      isDisabled,
      selectedLabel,
    } = this.state

    const dropdownClass = `dropdown ${ isOpen ? `show` : `` }`
    const dropdownMenuClass = `dropdown-menu ${ isOpen ? `show` : `` }`

    return (
      <div
        className={dropdownClass}
        onMouseOver={(e)=>{ this.menuMouseOverToogle(true) }}
        onMouseOut={(e)=>{ this.menuMouseOverToogle(false) }}
      >
        <button 
          type="button" 
          className="btn btn-light dropdown-toggle" 
          onClick={(e) => { 
            e.preventDefault();
            this.menuToogle(!isOpen);
          }}
          disabled={isDisabled}>
          { iconClass && <i className={iconClass} aria-hidden="true"></i> }
          {` ${selectedLabel} `} 
        </button>
        <ul className={dropdownMenuClass}>
          {
            options.map(data => this.listItem(data))
          }
        </ul>
      </div>
    )
  }
}

DropdownMenu.defaultProps = {
  isDisabled: false,
  isFont: false,
}

DropdownMenu.propTypes = {
}

export default DropdownMenu
