import "@babel/polyfill";

import React from 'react';
import ReactDOM from 'react-dom';

import * as d3 from 'd3';
import 'd3-selection-multi';

import './styles/main.scss';

import ColorPicker from './components/colorPicker.jsx';

import {
  getBlockRect,
  getURLVariables,
  copyToClipboard,
  browserDetect,
} from './utilities/other'

import {
  themes,
  getSettingFromUrl,
  getStyleUrlString,
} from './utilities/themeSetting'

import FontHandler from './utilities/fontHandler';
import KeyEventHandler from './utilities/keyEventHandler';
import IMGHandler from './utilities/imgHandler';

import DropdownMenu from './components/dropdownMenu.jsx';
import ConfirmModal from './components/confirmModal.jsx';
import ThemeSelector from './components/themeSelector.jsx';

import Block from './components/block';
import DragBar from './components/dragBar';
import Indicator from './components/indicator';
import ToggleButton from './components/toggleButton';

const keyEventHandler = new KeyEventHandler();

const textEditArea = document.querySelector('.text-edit-area');

const mainContentElement = document.querySelector('.main-content');
const contentElement = document.querySelector('.main-content .content');

const scaleControler = document.querySelector('.scale-controler');
const rotateControler = document.querySelector('.rotate-controler');

const btnSend = document.querySelector('.btn-send');
const btnTheme = document.querySelector('.btn-theme');
const btnErrorConfirm = document.querySelector('.notice-error-section .btn-confirm');

const btnPreviewSend = document.querySelector('.check-section .btn-confirm');
const btnPreviewCancel = document.querySelector('.check-section .btn-cancel');
const btnPreviewClose = document.querySelector('.check-section .btn-close');

const btnPNGDownload = document.querySelector('.btn-download');

const shareUrlElement = document.querySelector('.share-url-col .url');
const shareUrlBtn = document.querySelector('.share-url-col .btn-copy');

const imgUrlCol = document.querySelector('.img-url-col');
const imgUrlElement = document.querySelector('.img-url-col .url');
const imgUrlBtn = document.querySelector('.img-url-col .btn-copy');

const colorPicker = document.querySelector('.color-picker');
let colorPickerComponent;

const fontFamilySelector = document.querySelector('.font-family-selector');
let fontFamilySelectorComponent;

const rModal = document.querySelector('.js-r-modal');
let rModalComponent;

const imgHandler = new IMGHandler();

/*
const WIDTH = 320;
const HEIGHT = 480;
*/

let browser = {
  isFirefox: false,
  isSafari: false,
  isIOS: false,
}

const settings = {
  theme: 'classical',
  renderScale: 2,
  view: {
    width: 0,
    height: 0,
  },
  edit : {
    width: 0,
    height: 0,
  },
  center : {
    x: 0,
    y: 0,
  },
}

const fontFamilyOptions = [
  { value: 'font-hdzb', label: '篆體'},
  { value: 'font-kouzansousho', label: '青柳草書'},
  { value: 'font-aoyagireisho', label: '青柳隷書'},
]

const fontData = {
  'font-hdzb': {
    name: 'font-hdzb',
    url: 'font/zhuanti.woff',
  },
  'font-kouzansousho': {
    name: 'font-kouzansousho',
    url: 'font/KouzanBrushFontSousyo.woff',
  },
  'font-aoyagireisho': {
    name: 'font-aoyagireisho',
    url: 'font/aoyagireisyosimo_ttf_2_01.woff',
  },
};

const fontHandler = new FontHandler();
const svgContainer = d3.select('.svg-container svg').datum(settings);

const bgBlock = svgContainer.append('g').attrs({ class: 'svg-block' });
const canvasContainer = svgContainer.append('g').attrs({ class: 'canvas-container' });
const indicatorContainer = svgContainer.append('g').attr('class', 'indicator-container');

bgBlock.insert('use').attrs({ transform: 'translate(0,0)' });

const enableTextEdit = () => {
  mainContentElement.classList.add('text-edit-mode');
}
const disableTextEdit = () => {
  mainContentElement.classList.remove('text-edit-mode');
}

const valPostiveNegativeTrans = (val, ref, sync) => {
  if(sync){
    if(ref >= 0) return Math.abs(val);
    if(ref < 0) return -Math.abs(val);
  }else{
    if(ref >= 0) return -Math.abs(val);
    if(ref < 0) return Math.abs(val);    
  }
}

const zoomSelectedBlock = (scale, dx, dy, type) => {
  if(selectedBlock){
    const dr = Math.pow((Math.pow(dx, 2) + Math.pow(dy, 2)), 0.5);
    const drAngle = Math.atan( Math.abs(dx) / Math.abs(dy) );

    let fixedX = 0;
    let fixedY = 0;

    let rotateVal = 0;
    let fixedRotateVal = 0;
    let fixedAngle = 0

    rotateVal = 90 - selectedBlock.style.rotate

    switch(type){
      case 'lt':
        rotateVal = 90 - selectedBlock.style.rotate
        break;
      case 'rt':
        rotateVal = 90 + selectedBlock.style.rotate
        break;
      case 'rb':
        rotateVal = 90 - selectedBlock.style.rotate
        break;
      case 'lb':
        rotateVal = 90 + selectedBlock.style.rotate
        break;
    }


    fixedRotateVal = drAngle + rotateVal * Math.PI / 180;
    fixedAngle = (drAngle * 180 / Math.PI + rotateVal) % 360;

    fixedX = dr * Math.cos(fixedRotateVal) || 0;
    fixedY = dr * Math.sin(fixedRotateVal) || 0;

    if(fixedAngle > 90 && fixedAngle <= 180){
      fixedX = valPostiveNegativeTrans(fixedX, dx, true);
      fixedY = valPostiveNegativeTrans(fixedY, dy, true);
    }else if((fixedAngle > 0 && fixedAngle <= 90)){
      fixedX = valPostiveNegativeTrans(fixedX, dx);
      fixedY = valPostiveNegativeTrans(fixedY, dy, true);
    }else if((fixedAngle > -90 && fixedAngle <= 0) || (fixedAngle > 270 && fixedAngle <= 360)){
      fixedX = valPostiveNegativeTrans(fixedX, dx);
      fixedY = valPostiveNegativeTrans(fixedY, dy);
    }else{
      fixedX = valPostiveNegativeTrans(fixedX, dx, true);
      fixedY = valPostiveNegativeTrans(fixedY, dy);
    }

    const newPos = {
      x: selectedBlock.style.x + fixedX,
      y: selectedBlock.style.y + fixedY,
      scale,
    }

    if(scaleControlerComponent) scaleControlerComponent.set( (scale - 0.5) / 9.5, false);
    if(fixedX) selectedBlock.update(newPos, 'zoom', true, true);
  }
}

const rotateSelectedBlock = (rotate) => {
  if(selectedBlock){
    if(rotateControlerComponent) rotateControlerComponent.set( rotate / 360, false);
    selectedBlock.update({rotate}, 'rotate', true, true);
  }
}

const removeBlock = (targetBlock, needRecord) => {
  if(targetBlock){
    if(selectedBlock === targetBlock) deSelectBlock();
    const blockIndex = blocksArray.indexOf(targetBlock)
    targetBlock.remove();
    blocksArray.splice(blockIndex, 1);
    if(needRecord) recordHistory('remove');
  }
}

const copyBlock = () => {
  if(selectedBlock){
    const newStyle = Object.assign({}, selectedBlock.style, {x: selectedBlock.style.x + 10, y: selectedBlock.style.y + 10});
    const newBlock = new Block(svgContainer, canvasContainer, newStyle , selectBlock, setIndicatorStyle, recordHistory, enableTextEdit);
    addNewBlock(newBlock);
  }
}

let blocksArray = [];
let historyStep = 0;
let historyStyle = [{action: 'initial', list: []}];

const recordHistory = (action) => {
  const remainHistoryStyle = historyStyle.slice(0, historyStep + 1);

  const newRecord = {
    action,
    list: [],    
  };

  blocksArray.forEach(d => {
    const blockSetting = {
      style: d.style,
      type: d.type,
    }
    newRecord.list.push(blockSetting);
  })

  remainHistoryStyle.push(newRecord);
  historyStyle = remainHistoryStyle;

  historyStep += 1;
}

const setRecord = layerRecord => {
  const layerLength = blocksArray.length > layerRecord.length ? blocksArray.length : layerRecord.length;
  const removedList = [];

  for(let i = 0; i < layerLength; i += 1){
    let currentBlock = blocksArray[i];
    const blockRecord = layerRecord[i];

    if(blockRecord){
      if(!currentBlock){
        currentBlock = new Block(svgContainer, canvasContainer, blockRecord.style, selectBlock, setIndicatorStyle, recordHistory, enableTextEdit);
        blocksArray.push(currentBlock);
      }
      if(currentBlock.style !== blockRecord.style){
        currentBlock.update(blockRecord.style, 'undo', blockRecord.style.isSelected);
      }
      if(blockRecord.style.isSelected) syncButtonStatus(currentBlock);
    }else{
      removedList.push(currentBlock);
    }
  }

  removedList.forEach( d => { removeBlock(d) })
}

const undo = () => {
  historyStep -= 1;
  if(historyStep < 1) historyStep = 1;
  setRecord(historyStyle[historyStep].list);  
}

const redo = () => {
  historyStep += 1;
  if(historyStep > historyStyle.length - 1) historyStep = historyStyle.length - 1;
  setRecord(historyStyle[historyStep].list);    
}

const indicator = new Indicator(indicatorContainer, {}, zoomSelectedBlock, rotateSelectedBlock,);

let selectedBlock;
let scaleControlerComponent;
let rotateControlerComponent;
let shareUrl = '';
let imgUrl = '';

const setTextContent = () => { 
  if(selectedBlock) selectedBlock.update({text: textEditArea.value}, 'change text', true, true);
};

const syncText = (text) => {
  if(selectedBlock){
    textEditArea.value = text;
    selectedBlock.update({text}, 'change text', false, true);
    setIndicatorStyle(false);
  }
}

const setTextMode = (textMode, needUpdate = true) => {
  const btnArray = [btnTextStamp, btnTextNormal];
  let activeBtn;

  switch(textMode) {
    case 'normal':
      activeBtn = btnTextNormal;
      break;
    case 'stamp':
      activeBtn = btnTextStamp;
      break;
  }

  btnArray.forEach( btn => {
    if(btn === activeBtn){
      btn.active();
    }else{
      btn.deActive();
    }
  })

  if(needUpdate && selectedBlock){
    selectedBlock.update({textMode}, `change: text mode`, true, true);    
  }
}

const btnTextStamp = new ToggleButton('.btn-text-left', ['stamp', 'stamp'], 'stamp', setTextMode, false);
const btnTextNormal = new ToggleButton('.btn-text-right', ['normal', 'normal'], 'normal', setTextMode, false);

const setScale = (val, needRecord = false) => {
  if(selectedBlock){
    const scale = 1 + val * 5;
    selectedBlock.update({ scale }, 'change scale', true, needRecord);
  }
}

const setRotate = (val, needRecord = false) => {
  if(selectedBlock){
    const rotate = val * 360;
    selectedBlock.update({ rotate }, 'change rotate', true, needRecord);
  }
}

const setIndicatorStyle = () => {
  if(selectedBlock){
    let {
      x,
      y,
      scale,
      rotate,
    } = selectedBlock.style;

    const {
      width,
      height,
    } = selectedBlock.textInstance.node().getBBox();

    indicator.setOpacity().setSize({width, height, scale}).setPosition({x, y, rotate});
  }
}

const syncDragBarStatus = style => {
  const {
    opacity,
    pattern,
    scale,
    rotate,
  } = style;

  if(scaleControlerComponent) scaleControlerComponent.set( (scale - 1) / 5, false);
  if(rotateControlerComponent) rotateControlerComponent.set( rotate / 360, false);
}

const syncButtonStatus = (targetBlock) => {

  const {
    fill,
    fontFamily,
    fontSize,
    scale,
    text,
    textMode,
  } = targetBlock.style;

  colorPickerComponent.enable();
  colorPickerComponent.setColor(fill);

  fontFamilySelectorComponent.enable();
  fontFamilySelectorComponent.setSelectedLabel(fontFamily);

  textEditArea.value = text;
  textEditArea.disabled = false;
  textEditArea.focus();

  scaleControlerComponent.disableToggle(false);
  rotateControlerComponent.disableToggle(false);

  setTextMode(textMode, false);
  syncDragBarStatus(targetBlock.style)
}

const selectBlock = (target) => {
  if(selectedBlock !== target){
    if(selectedBlock) deSelectBlock();
    selectedBlock = target;
    syncButtonStatus(target);
  }
}

const deSelectBlock = (needRecord = false) => {
  disableTextEdit();

  textEditArea.disabled = true;
  scaleControlerComponent.disableToggle(true);
  rotateControlerComponent.disableToggle(true);

  if(colorPickerComponent){
    colorPickerComponent.closeMenu();
    colorPickerComponent.disable();
  }

  if(fontFamilySelectorComponent){
    fontFamilySelectorComponent.menuToogle();
    fontFamilySelectorComponent.disable();
  }

  indicator.setOpacity(0).setSize({width: 0, height: 0}).setPosition({x: 0, y: 0});
  if(selectedBlock) selectedBlock.update({ isSelected: false}, 'unselect', false, needRecord);
  selectedBlock = null;
}

const addNewBlock = (newBlock, needSelect = true, needRecord = true) => {
  blocksArray.push(newBlock);
  newBlock.update({isSelected: needSelect}, 'add Block', needSelect, needRecord);
}

const addBlock = (style, needSelect = true, needRecord = true)  => {
  const newStyle = Object.assign({}, {x: settings.center.x, y: settings.center.y}, style);
  const newBlock = new Block(svgContainer, canvasContainer, newStyle, selectBlock, setIndicatorStyle, recordHistory, enableTextEdit, browser);
  addNewBlock(newBlock, needSelect, needRecord);
}

const setColor = color => { if(selectedBlock) selectedBlock.update({fill: color}, 'change color', false, true); };
const setFontFamily = fontFamily => { 
  if(selectedBlock) selectedBlock.update({fontFamily}, 'change: fontFamily', true, true);
}

const setImageDownloadSize = (type, scale) => {
  const canvas = document.querySelector('.check-section canvas');
  canvas.toBlob( blob => {
    const url = URL.createObjectURL(blob);
    imgHandler.downLoadEvent(url, 'NiMaPaChi-rune-paper', type);
  }, `image/${type}`, 1);
}

const pageStartLoading = text => {
  document.body.classList.add('page-loading');
  document.querySelector('.loading-panel .loading-info').innerText = text;
}

const pageStopLoading = () => {
  document.body.classList.remove('page-loading');
  document.querySelector('.loading-panel .loading-info').innerText = '';
}

const previewAndDraw = async () => {
  const urlVar = getStyleUrlString(blocksArray[0].style);
  shareUrl = `${location.origin}${location.pathname}?${urlVar}`;

  shareUrlElement.value = shareUrl;

  let drawElement = d3.select(svgContainer.node().cloneNode(true));
  const {
    width,
    height,
  } = settings.view;

  const drawWidth = width * settings.renderScale;
  const drawHeight = height * settings.renderScale;

  const embedFontData = [];
  const embedFontList = [];

  drawElement.attrs({
    viewBox: `0 0 ${width} ${height}`,
    width: width,
    height: height,
  })
  drawElement.select('.indicator-container').remove();

  pageStartLoading('合成圖片中 ...');

  drawElement.selectAll('.text').nodes().forEach(d => {
    const fontFamily = d.getAttribute('font-family');
    if(fontData[fontFamily] && fontData[fontFamily].url && !embedFontList.includes(fontFamily)){
      embedFontData.push(fontData[fontFamily]);
      embedFontList.push(fontFamily);
    }
  })

  drawElement = await fontHandler.embedFont(embedFontData, drawElement);

  const svgNode = await imgHandler.handleSVGNode(drawElement.node());
  const imgURL = imgHandler.getSVGUrl(svgNode);

  pageStopLoading();

  const canvas = document.querySelector('.check-section canvas');
  const ctx = canvas.getContext('2d');
  const image = new Image();

  canvas.setAttribute('data-url', imgURL);
  document.body.classList.add('page-check');

  image.onload = () => {
    ctx.canvas.width = width * settings.renderScale;
    ctx.canvas.height = height * settings.renderScale;
    ctx.drawImage(image, 0, 0,width * settings.renderScale, height * settings.renderScale);
  }

  image.src = imgURL;
}

const sendImage = async () => {
  const {
    width,
    height,
  } = settings.view;

  const canvas = document.querySelector('.check-section canvas');
  const imgURL = canvas.getAttribute('data-url');
  const base64String = await imgHandler.getBase64String(imgURL, width * settings.renderScale, height * settings.renderScale);

  const url = 'https://api.imgur.com/3/image'
  const headers = new Headers({
    'Authorization': `Client-ID 41e9570f0218f10`,
  })

  let formData = new FormData();

  formData.append('image', base64String.replace('data:image/png;base64,', ''));
  formData.append('title', `NiMaPaChi-rune-paper-${new Date().getTime()}`);  

  const requestOption = {
    headers: headers,
    body: formData,
    method: 'POST',
    mode: 'cors',
  }

  pageStartLoading('上傳圖片中 ...');

  try {
    const {
      data,
      status,
      success,
    } = await fetch(url, requestOption).then( rsp => rsp.json() );

    if(success){
      pageStopLoading();
      const {
        link,
      } = data;

      imgUrl = link;
      imgUrlElement.value = imgUrl;
      imgUrlCol.classList.remove('d-none');

    }else{
      showFetchError();
    }

  } catch(err) {
    showFetchError();
    console.log(err);
  }
}

const clearAll = () => {
  deSelectBlock();
  for(let i = 0; i < blocksArray.length; i += 1){
    blocksArray[i].remove();
  }
  blocksArray = [];
}

const moveBlock = posVal => () => {
  if(selectedBlock){
    const newPos = {
      x: selectedBlock.style.x + posVal[0],
      y: selectedBlock.style.y + posVal[1],
    }
    selectedBlock.update(newPos, 'slight move', true, true);
  }
}

const setSVGViewBox = () => {
  const mainWidth = mainContentElement.offsetWidth;
  const mainHeight = mainContentElement.offsetHeight;
  const {
    width,
    height,
  } = settings.view;

  svgContainer.attrs({
    viewBox: `${(width - mainWidth) / 2} ${(height - mainHeight) / 2 } ${mainWidth} ${mainHeight}`
  });
}

const resize = () => { setSVGViewBox(); }

const showFetchError = () => {
  document.body.classList.remove('page-loading');
  document.body.classList.add('page-error');
}

const setSVGByTheme = theme => {

  const urlSetting = getSettingFromUrl();
  const selectedTheme = theme || urlSetting.theme || 'classical';

  const {
    name,
    bg,
    mask,
    width,
    height,
    style,
  } = themes[selectedTheme] || themes['classical'];

  settings.view = { width, height };
  settings.edit = { width, height };
  settings.center = { x: width / 2, y: height /2 };

  mainContentElement.style.minHeight = `${height}px`;

  bgBlock.select('use').attrs({ 'xlink:href': bg });
  canvasContainer.attrs({ 'mask': `url(${mask})`, 'data-mask': mask});

  btnTheme.innerText = `選擇樣式：${name}`

  if(blocksArray.length === 0){
    addBlock(Object.assign({}, style, urlSetting));
    setTimeout(() => { moveBlock([-1,0])(); moveBlock([1,0])();}, 300)
  }

  setSVGViewBox();
}

const selectTheme = theme => {
  if(rModalComponent) rModalComponent.close();
  setSVGByTheme(theme);
}

btnSend.onclick = () => { previewAndDraw();}
btnPreviewSend.onclick = () => { sendImage(); }

textEditArea.onkeyup = setTextContent;
textEditArea.onfocus = () => { keyEventHandler.disable();}
textEditArea.onblur = () => { keyEventHandler.enable();}

btnPNGDownload.onclick = () => { setImageDownloadSize('png', 2); };

d3.select('.main-content').on('click', () => { 
  const tagNames = ['tspan', 'text'];
  if(!tagNames.includes(d3.event.target.tagName) 
      && !d3.event.target.classList.contains('text-container')
      && !d3.event.target.classList.contains('sticker')){
    deSelectBlock(true);
  }
});

keyEventHandler.bindEvents(90, undo, true);
keyEventHandler.bindEvents(90, redo, true, true);

btnErrorConfirm.onclick = () => { document.body.classList.remove('page-error'); }
btnPreviewCancel.onclick = () => { document.body.classList.remove('page-check'); }
btnPreviewClose.onclick = () => { document.body.classList.remove('page-check'); }

shareUrlBtn.onclick = () => { copyToClipboard(shareUrl); }
imgUrlBtn.onclick = () => { copyToClipboard(imgUrl); }

colorPickerComponent = ReactDOM.render(<ColorPicker onChange={setColor}></ColorPicker>, colorPicker);

scaleControlerComponent = new DragBar(scaleControler, setScale, 0.5/9.5);
rotateControlerComponent = new DragBar(rotateControler, setRotate, 0);

btnTheme.onclick = () => { rModalComponent.open(); }

fontFamilySelectorComponent = ReactDOM.render(
  <DropdownMenu 
    isFont={true}
    options={fontFamilyOptions}
    onChangeFn={(fontFamily) => { setFontFamily(fontFamily) }}
  ></DropdownMenu>, 
  fontFamilySelector
);

rModalComponent = ReactDOM.render(
  <ConfirmModal 
    title={'選擇一個樣式'}
    confirm={() => { setSVGByTheme(); }}
    childComponent = {<ThemeSelector selectTheme={selectTheme} />}
  ></ConfirmModal>, 
  rModal
);

window.onload = () => {
  browser = browserDetect();

  if(browser.isEdge || browser.isIE){
    document.body.classList.add('page-disable-notice'); 
  }else{
    document.body.classList.remove('page-initial'); 
    window.addEventListener('resize', e => { resize();});
    clearAll();

    const {
      theme
    } = getSettingFromUrl();

    if(theme && themes[theme]){
      setSVGByTheme(theme);
    }else{
      rModalComponent.open();
    }
  }
}