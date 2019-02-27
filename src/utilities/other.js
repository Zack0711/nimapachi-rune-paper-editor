import _ from 'lodash'

export const getURLVariables = (url) => {
  const urlVariables = url.split('?')[1]
  return urlVariables ? urlVariables.split('&').map((data) => {
    const varData = data.split('=')
    return { key: varData[0], val: decodeURIComponent(varData[1])}
  }) : []
}

export const hasClass = (element, className) => element.getAttribute('class').indexOf(className) > -1

export const addClass = (element, className) => {
  const classNameList = _.union(element.getAttribute('class').split(' '), className)
  element.setAttribute('class', classNameList.join(' '))
}

export const removeClass = (element, className) => {
  const classNameList = _.difference(element.getAttribute('class').split(' '), className)
  element.setAttribute('class', classNameList.join(' '))
}

export const toggleClass = (element, className) => {
  if(hasClass(element, className)){
    removeClass(element, [className])    
  }else{
    addClass(element, [className])
  }
}

export const defaultTranslate = (setting = {}) => {
  return key => setting[key] ? setting[key] : key
}

export const collectDataAttribute = (element) => {
  const elementAttr = element.attributes
  const attrData = {}
  _.forEach(elementAttr, (attr) => {
    if(attr.name.indexOf('data-') > -1){ 
      const attrName = attr.name.replace('data-', '').split('-').map((d, i) => i ? d.replace(d[0], d[0].toUpperCase()) : d ).join('')
      attrData[attrName] = attr.value
    }
  })
  return  attrData
}

export const isHumanClick = e => e.isTrusted || (e.screenX && e.screenY)

export const getBlockRect = (block, relativeNode) => {
  const blockRect = block.getBoundingClientRect();

  if(relativeNode){
    const nodeRect = relativeNode.getBoundingClientRect();
    blockRect.x = blockRect.x - nodeRect.x;
    blockRect.y = blockRect.y - nodeRect.y;
  }

  return blockRect;
}

export const copyToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  confirm("網址已複製");
};