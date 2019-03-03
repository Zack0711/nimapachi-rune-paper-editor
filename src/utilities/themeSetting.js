import {
  getURLVariables,
} from './other'

export const themes = {
  classical: {
    bg: '#theme-bg-01',
    mask: '#mask-01',
    width: 320,
    height: 480,
    style: {
      mode: 'text',
      textMode: 'stamp',
      rotate: 0,
      fontFamily: 'font-hdzb',
      scale: 2.5,
      text: '泥馬霸氣\n符咒\n製成器',
      fill: '#c35e02',
      x: 165,
      y: 343,
    },
  },
  yoda: {
    bg: '#theme-bg-02',
    mask: '#mask-02',
    width: 320,
    height: 490,
    style: {
      mode: 'text',
      textMode: 'stamp',
      rotate: 3,
      fontFamily: 'font-hdzb',
      scale: 2.5,
      text: '蔡英文\n尤\n達大師',
      fill: '#c35e02',
      x: 158,
      y: 360,
    },
  },
}

const keyArray = ['x', 'y', 'scale', 'rotate', 'fill', 'textMode', 'fontFamily', 'theme', 'text'];
const intKeyList = [ 'x', 'y', 'scale', 'rotate' ];

export const getSettingFromUrl = () => {
  const setting = {};
  const varList = getURLVariables(location.href);

  varList.forEach( d => {
    if(d.val && keyArray.indexOf(d.key) > -1){
      setting[d.key] = intKeyList.indexOf(d.key) > -1 ? parseInt(d.val) : d.val;
    }
  });

  return setting;
}

export const getStyleUrlString = ( style={} ) => {
  return keyArray.map( d => `${d}=${encodeURIComponent(style[d])}`).join('&');
}
