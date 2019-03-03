import React from 'react';

const ThemeSelector = props => (
  <div className="text-center py-4 row no-gutters">
  	<div className="col-6 theme-card theme-card-01" onClick={ () => { props.selectTheme('classical'); } }>
  		<div className="thumbnail"></div>
  		<button className="btn btn-select">經典款</button>
  	</div>
  	<div className="col-6 theme-card theme-card-02" onClick={ () => { props.selectTheme('yoda'); } }>
  		<div className="thumbnail"></div>
	    <button className="btn btn-select">大師款</button>
  	</div>    
  </div>  
)

export default ThemeSelector;