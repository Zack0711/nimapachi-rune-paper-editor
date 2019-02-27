class IMGHandler {
  constructor() {
  }

  blobToBase64(id, url) {
    return new Promise( async (resolve, reject) =>{
      const blob = await fetch(url).then(rsp => rsp.blob());
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => { resolve({id, data: reader.result});};
    })
  }

  handleSVGNode(svgNode){
    return new Promise( async (resolve, reject) => {
      const allBlockTag = svgNode.querySelectorAll('.svg-block');
      const imgArray = [];
      const imgDefs = {};

      allBlockTag.forEach( d => {
        const useTag = d.querySelector('use');
        if(useTag){
          const defId = useTag.getAttribute('href').replace('#', '');
          const defTag = svgNode.getElementById(defId);
          //d.removeChild(d.querySelector('text'));
          if(defTag.classList.contains('image-def') && !imgDefs[defId]){
            imgArray.push({id: defId, url: defTag.querySelector('image').getAttribute('href')})
            imgDefs[defId] = defTag;
          }
        } 
      })

      const base64Array = await Promise.all(imgArray.map(d => this.blobToBase64(d.id, d.url)));

      base64Array.forEach( d => {
        imgDefs[d.id].querySelector('image').setAttribute('href', d.data);
      })

      allBlockTag.forEach( d => {
        const allUseTag = d.querySelectorAll('use');
        allUseTag.forEach( useTag => {
          const transform = useTag.getAttribute('transform');
          const defId = useTag.getAttribute('href').replace('#', '');
          if(imgDefs[defId]){
            const newImage = imgDefs[defId].querySelector('image').cloneNode(true);
            const dataHref = newImage.getAttribute('href');

            newImage.setAttribute('transform', transform);
            newImage.setAttribute('xlink:href', dataHref);
            newImage.removeAttribute('href');

            d.appendChild(newImage);
            d.removeChild(useTag);            
          }
        })
      })

      const mask = svgNode.querySelector('#mask');
      const maskImgUrl = mask.querySelector('image').getAttribute('href');
      const maskBase64 = await this.blobToBase64('#mask', maskImgUrl);
      mask.querySelector('image').setAttribute('href', maskBase64.data);
      resolve(svgNode);
    })
  }

  getSVGUrl(svgNode) {
    let svgString = ''
    const serializer = new XMLSerializer();
    svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');

    svgString = new XMLSerializer().serializeToString(svgNode);
    svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
    svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    return URL.createObjectURL(svgBlob)
  }

  getBase64String(url, width, height) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const image = new Image();

      image.onload = () => {
        ctx.canvas.width = width;
        ctx.canvas.height = height;
        ctx.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL());
      }

      image.src = url;
    })
  }

  downLoadEvent(url, fileName, fileType) {
    const event = new MouseEvent('click', {
      'view': window,
      'bubbles': true,
      'cancelable': true
    });
    const creatTime = new Date();
    const a = document.createElement('a');
    a.setAttribute('download', `${fileName}-${creatTime.getTime()}.${fileType}`);
    a.setAttribute('href', url);
    a.setAttribute('target', '_blank');
    a.dispatchEvent(event);    
  }

  async donwloadImage(svgElement, imgWidth, imgHeight, imgType = 'jpeg'){
    const svgNode = await this.handleSVGNode(svgElement);
    const imgURL = this.getSVGUrl(svgNode);
    if(imgType === 'svg'){
      this.downLoadEvent(imgURL, 'image', imgType)
    }else{
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const image = new Image();

      image.onload = () => {
        ctx.canvas.width = imgWidth;
        ctx.canvas.height = imgHeight;

        ctx.drawImage(image, 0, 0,imgWidth, imgHeight);

        canvas.toBlob( blob => {
          const url = URL.createObjectURL(blob);
          this.downLoadEvent(url, 'image', imgType);
        }, `image/${imgType}`, 1);
      }
      image.src = imgURL;
    }
  }  
}

export default IMGHandler;