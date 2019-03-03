export const getURLVariables = (url) => {
  const urlVariables = url.split('?')[1]
  return urlVariables ? urlVariables.split('&').map((data) => {
    const varData = data.split('=')
    return { key: varData[0], val: decodeURIComponent(varData[1])}
  }) : []
}

export const collectDataAttribute = (element) => {
  const elementAttr = element.attributes
  const attrData = {}
  for(let i = 0; i < elementAttr.length; i += 1){
    const attr = elementAttr[i];
    if(attr.name.indexOf('data-') > -1){ 
      const attrName = attr.name.replace('data-', '').split('-').map((d, i) => i ? d.replace(d[0], d[0].toUpperCase()) : d ).join('')
      attrData[attrName] = attr.value
    }
  }
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

export const browserDetect = () => ({ 
  isFirefox: document.documentMode || /Firefox/.test(navigator.userAgent),
  isEdge: document.documentMode || /Edge/.test(navigator.userAgent),
  isIE: /MSIE/.test(navigator.userAgent) || /Trident/.test(navigator.userAgent),
  isIOS: !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform),
  isSafari: !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/),
});
