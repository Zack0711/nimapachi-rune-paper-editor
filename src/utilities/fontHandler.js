class FontHandler {
  constructor(fonts, svgContainer){
    //this.fonts = fonts;
    //this.svgContainer = svgContainer;

    this.blobToBase64 = this.blobToBase64.bind(this);
    this.loadFont = this.loadFont.bind(this);
    this.embedFont = this.embedFont.bind(this);

    //this.embedFont(this.fonts, this.svgContainer);
  }

  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(blob);
    })
  }

  loadFont(fontSetting, url) {
    return new Promise( async (resolve, reject) => {
      const blobData = await fetch(url).then(rsp => rsp.blob());
      const base64 = await this.blobToBase64(blobData);
      resolve({base64, fontSetting})      
    })
  }

  async embedFont(fonts=[], svgContainer) {
    return new Promise( async (resolve, reject) => {      
      const fontDataArray = [];
      const svgDefs = svgContainer.select('defs');

      let allStyleTags;

      const results = await Promise.all(fonts.map(d => this.loadFont(d, d.url)));
      results.forEach( d => {
        const fontURL = `data:application/font-woff;base64,${d.base64}`
        const newFontStyle = `
          @font-face {
            font-family: ${d.fontSetting.name};
            font-style: normal;
            font-weight: 400;
            src: url(${fontURL});
            unicode-range: ${d.fontSetting.unicodeRange};
          }
        `;
        fontDataArray.push({ fontStyle: newFontStyle })
      })

      allStyleTags = svgDefs.selectAll('style').data(fontDataArray);
      allStyleTags.enter().append('style').attr('type', 'text/css');
      allStyleTags.exit().remove();

      svgDefs.selectAll('style').html(d => d.fontStyle);
      resolve(svgContainer);
    })
  }
}

export default FontHandler;