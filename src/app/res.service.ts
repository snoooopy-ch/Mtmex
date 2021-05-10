import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {ResItem} from './models/res-item';

const electron = (window as any).require('electron');

@Injectable({
  providedIn: 'root'
})
export class ResService {
  resData = new BehaviorSubject<any>({resList: [], sreTitle: ''});
  settings = new BehaviorSubject<any>({});
  searchListSource = new BehaviorSubject<any>({});
  status = new BehaviorSubject<any>({});
  loadResStatuses = new BehaviorSubject<any>({});
  hideIdSource = new BehaviorSubject<string[]>([]);
  LoadHiddenIds = this.hideIdSource.asObservable();
  removeHideIdSource = new BehaviorSubject<any>({});
  loadRemoveHideIds = this.removeHideIdSource.asObservable();
  scrollPosSource = new BehaviorSubject<any>({index: 1, pos: 0, isTab: false});
  scrollPos = this.scrollPosSource.asObservable();
  public selectedResSource = new BehaviorSubject<any>({
    select: 0,
    candi1: 0,
    candi2: 0,
    candi3: 0,
    candi4: 0,
    tabIndex: 0});
  public selectedRes = this.selectedResSource.asObservable();
  public bsSelectedTab = new BehaviorSubject<any>({
    select: 0,
    candi1: 0,
    candi2: 0,
    candi3: 0,
    candi4: 0,
    totalCount: 0,
    tabIndex: 0});
  selectedTab = this.bsSelectedTab.asObservable();
  bsMoveRes = new BehaviorSubject<any>({tabIndex: 0, moveKind: ''});
  moveRes = this.bsMoveRes.asObservable();
  bsTotalRes = new BehaviorSubject<any>({tabIndex: 0, totalCount: 0});
  totalRes = this.bsTotalRes.asObservable();
  bsSelectCommand = new BehaviorSubject<any>({tabIndex: 0, command: ''});
  selectCommand = this.bsSelectCommand.asObservable();
  bsPrintCommand = new BehaviorSubject<any>({tabIndex: 0});
  printCommand = this.bsPrintCommand.asObservable();
  bsPrintHtml = new BehaviorSubject<any>({tabIndex: 0, html: ''});
  printHtml = this.bsPrintHtml.asObservable();
  bsPrintAllCommand = new BehaviorSubject<any>({});
  printAllCommand = this.bsPrintAllCommand.asObservable();
  saveResStatusSource = new BehaviorSubject<any>({});
  saveResStatus = this.saveResStatusSource.asObservable();
  bsResMenu = new BehaviorSubject<any>({});
  resMenu = this.bsResMenu.asObservable();
  bsAllResMenu = new BehaviorSubject<any>({});
  allResMenu = this.bsAllResMenu.asObservable();
  resSortSource = new BehaviorSubject<any>({});
  sortRes = this.resSortSource.asObservable();
  surroundImageSource = new BehaviorSubject<any>({});
  surroundImage = this.surroundImageSource.asObservable();
  replaceNameSource = new BehaviorSubject<any>({});
  replaceName = this.replaceNameSource.asObservable();
  outputCandiBelowSource = new BehaviorSubject<any>({});
  outputCandiBelow = this.outputCandiBelowSource.asObservable();
  printHtmlOnStatusSource = new BehaviorSubject<any>({});
  printHtmlOnStatus = this.printHtmlOnStatusSource.asObservable();
  printAllHtmlOnStatusSource = new BehaviorSubject<any>({});
  printAllHtmlOnStatus = this.printAllHtmlOnStatusSource.asObservable();
  btnAllSelCommandSource = new BehaviorSubject<any>({});
  btnAllSelCommand = this.btnAllSelCommandSource.asObservable();
  bsDisplayAllSelectedRes = new BehaviorSubject<any>({});
  displayAllSelectRes = this.bsDisplayAllSelectedRes.asObservable();
  public bsChangeResCount = new BehaviorSubject<any>({});
  public changeResCount = this.bsChangeResCount.asObservable();


  constructor() {
    electron.ipcRenderer.on('getResResponse', (event, value) => {
      this.resData.next(value);
    });
    electron.ipcRenderer.on('getSettings', (event, value) => {
      this.settings.next(value);
    });
    electron.ipcRenderer.on('getSearchList', (event, value) => {
      this.searchListSource.next(value);
    });

    electron.ipcRenderer.on('getStatuses', (event, value) => {
      this.loadResStatuses.next(value);
    });
  }

  loadRes(url, isResSort: boolean, isMultiAnchor: boolean, isReplaceRes: boolean, isContinuousAnchor: boolean,
          notMoveFutureAnchor: boolean, remarkRes, hideRes) {
    electron.ipcRenderer.send('loadRes', url, isResSort, isMultiAnchor, isReplaceRes, isContinuousAnchor, notMoveFutureAnchor,
      remarkRes, hideRes);
  }

  loadMultiRes(filePaths, isResSort: boolean, isMultiAnchor: boolean, isReplaceRes: boolean, isContinuousAnchor: boolean,
               notMoveFutureAnchor: boolean, remarkRes, hideRes) {
    electron.ipcRenderer.send('loadMultiRes', filePaths, isResSort, isMultiAnchor, isReplaceRes, isContinuousAnchor, notMoveFutureAnchor,
      remarkRes, hideRes);
  }

  loadSettings(){
    electron.ipcRenderer.send('loadSettings');
  }

  saveStatus(saveData: any){
    electron.ipcRenderer.send('saveStatus', saveData);
  }

  loadStatus(filePaths){
    electron.ipcRenderer.send('loadStatus', filePaths);
  }

  saveSettings(params){
    electron.ipcRenderer.send('saveSettings', params);
  }

  saveSearchList(searchList){
    electron.ipcRenderer.send('saveSearchList', searchList);
  }

  removeTab(originSreTitle){
    electron.ipcRenderer.send('removeTab', originSreTitle);
  }

  setHiddenIds(value: string[]) {
    this.hideIdSource.next(value);
  }

  removeHiddenIds(value: any) {
    this.removeHideIdSource.next(value);
  }
  setScrollPos(value: any){
    this.scrollPosSource.next(value);
  }

  setSelectedRes(value: any){
    this.selectedResSource.next(value);
  }

  setSelectedTab(value: any){
    this.bsSelectedTab.next(value);
  }

  setMoveRes(value: any){
    this.bsMoveRes.next(value);
  }

  setTotalRes(value: any){
    this.bsTotalRes.next(value);
  }

  setSelectCommand(value: any){
    this.bsSelectCommand.next(value);
  }

  setAllSelHeaderCommand(value: any) {
    this.btnAllSelCommandSource.next(value);
  }

  setPrintCommand(value: any){
    this.bsPrintCommand.next(value);
  }

  setPrintAllCommand(value: any){
    this.bsPrintAllCommand.next(value);
  }

  setPrintHtml(value: any){
    this.bsPrintHtml.next(value);
  }

  setSaveResStatus(value: any){
    this.saveResStatusSource.next(value);
  }

  setResMenu(value: any){
    this.bsResMenu.next(value);
  }

  setAllResMenu(value: any){
    this.bsAllResMenu.next(value);
  }

  setSort(value: any){
    this.resSortSource.next(value);
  }

  setPrintHtmlOnStatus(value: any) {
    this.printHtmlOnStatusSource.next(value);
  }

  setPrintAllHtmlOnStatusSource(value: any) {
    this.printAllHtmlOnStatusSource.next(value);
  }


  setDisplayAllSelectedRes(value: any) {
    this.bsDisplayAllSelectedRes.next(value);
  }

  public setChangeResCount(value: any){
    this.bsChangeResCount.next(value);
  }

  async printHtmlTag(resList: ResItem[], options) {

    let htmlTag = `★■●${options.tabName}●■★\n`;

    if (options.txtURL !== '') {
      htmlTag += `URL入力欄：${options.txtURL}\n`;
    }

    let yobi = ``;

    let exists = false;
    for (const res of resList){
      if (res.resSelect === 'select'){
        exists = true;
        htmlTag += await this.printRes(res, options);
      }
    }

    let yobi1 = ``;
    for (const res of resList){
      if (res.resSelect === 'candi1'){
        exists = true;
        yobi1 += await this.printRes(res, options);
      }
    }
    if (yobi1.length > 0){
      yobi += `<div class="yobi1">予備選択1</div>\n${yobi1}`;
    }

    let yobi2 = ``;
    for (const res of resList){
      if (res.resSelect === 'candi2'){
        exists = true;
        yobi2 += await this.printRes(res, options);
      }
    }

    if (yobi2.length > 0){
      yobi += `<div class="yobi2">予備選択2</div>\n${yobi2}`;
    }

    let yobi3 = ``;
    for (const res of resList){
      if (res.resSelect === 'candi3'){
        exists = true;
        yobi3 += await this.printRes(res, options);
      }
    }

    if (yobi3.length > 0){
      yobi += `<div class="yobi3">予備選択3</div>\n${yobi3}`;
    }

    let yobi4 = ``;
    for (const res of resList){
      if (res.resSelect === 'candi4'){
        exists = true;
        yobi4 += await this.printRes(res, options);
      }
    }

    if (yobi4.length > 0){
      yobi += `<div class="yobi4">予備選択4</div>\n${yobi4}`;
    }

    if (!exists){
      htmlTag = '';
    }

    if (yobi.length > 0) {
      htmlTag += yobi;
      yobi = '';
    }

    return {allHtml: htmlTag, yobiHtml: yobi};
  }

  async printAllHtmlTag(resList: ResItem[], options) {
    let htmlTag = ``;

    const tabName = `★■●${options.tabName}●■★\n`;
    let tabUrl = ``;
    if (options.txtURL !== '') {
      tabUrl = `URL入力欄：${options.txtURL}\n`;
    }

    let exists = false;
    for (const res of resList){
      if (res.resSelect === 'select'){
        exists = true;
        htmlTag += await this.printRes(res, options);
      }
    }

    let yobi1 = ``;
    for (const res of resList){
      if (res.resSelect === 'candi1'){
        exists = true;
        yobi1 += await this.printRes(res, options);
      }
    }

    let yobi2 = ``;
    for (const res of resList){
      if (res.resSelect === 'candi2'){
        exists = true;
        yobi2 += await this.printRes(res, options);
      }
    }

    let yobi3 = ``;
    for (const res of resList){
      if (res.resSelect === 'candi3'){
        exists = true;
        yobi3 += await this.printRes(res, options);
      }
    }

    let yobi4 = ``;
    for (const res of resList){
      if (res.resSelect === 'candi4'){
        exists = true;
        yobi4 += await this.printRes(res, options);
      }
    }

    if (!exists){
      htmlTag = '';
    }

    return {allHtml: htmlTag, yobi1Html: yobi1, yobi2Html: yobi2, yobi3Html: yobi3, yobi4Html: yobi4, tabName: tabName,  tabUrl: tabUrl};
  }

  async printRes(res: ResItem, options){
    let htmlTag = '';
    let content = res.content;

    // remove img tag
    content = content.replace(/(<img[^<]+>)/ig, '');
    content = content.replace(/(<span[^<]+>)/ig, '');
    content = content.replace(/(<\/span>)/ig, '');
    content = content.replace(/(&gt;&gt;\d*[0-9]\d*)/ig, `<span class="anchor">$1</span>`);

    // remove res-img-link, res-gif-link, res-img-link, res-gif-link
    content = content.replace(/(\s+class="res-img-link"|\s+class="res-link"| class="res-img-link res-gif-link")/ig, ``);

    const imgUrls = content.match(/(\.jpg"|\.gif"|\.jpeg"|\.png"|\.bmp")(>https?:)/ig);
    if (options.isSurroundImage && imgUrls !== null && imgUrls.length > 1) {
      content = content.replace(/<a href="https?:?\/\/[^"']*\.(?:png|jpg|jpeg|gif)">https?:?\/\/[^"']*\.(?:png|jpg|jpeg|gif)<\/a>/ig,
      (match) => {
        return `<div>` + match + `</div><!-- div end -->`;
      });

      const rel = this.generateRelValue(res.num);

      content = content.replace(/(\.jpg"|\.gif"|\.jpeg"|\.png"|\.bmp")(>https?:)/ig,
      `$1 class="swipe" rel="${rel}" title="" target="_blank"$2`);

      content = content.replace(/<div><a href="https?:?\/\/[^>]*\.(?:png|jpg|jpeg|gif)" class="swipe" rel="[^"]*" title="" target="_blank">https?:?\/\/[^>]*\.(?:png|jpg|jpeg|gif)<\/a><\/div><!-- div end -->((<br>)*<div><a href="https?:?\/\/[^>]*\.(?:png|jpg|jpeg|gif)" class="swipe" rel="[^"]*" title="" target="_blank">https?:?\/\/[^>]*\.(?:png|jpg|jpeg|gif)<\/a><\/div><!-- div end -->)*/ig,
      (match) => {
        return `<div class="t_media2_mtm">` + match + `</div><!-- t_media2_mtm end -->`;
      });

      if (options.gazouReplaceUrl !== undefined && options.gazouReplaceUrl !== '') {
        content = content.replace(/(https?:\/\/[^"><]*)(\/[^"<>]*(\.jpg|\.gif|\.jpeg|\.png|\.bmp))/ig, `${options.gazouReplaceUrl}$2`);
      }

    } else {
      content = content.replace(/(\.jpg"|\.gif"|\.jpeg"|\.png"|\.bmp")(>https?:)/ig,
      `$1 target="_blank" class="image"$2`);

    }

    const tmpContent = content.split('<br>');
    let row = 0;
    content = '';
    for (const tmpline of tmpContent){
      if (row > 0) {
        content += '<br />';
      }
      content += tmpline.replace(/(http(?!.*?(\.jpg|\.gif|\.jpeg|\.bmp|\.png)).*")(>https:)/ig,
        `$1 target="_blank"$3`);
      row++;
    }

     // Twitter embed code
    if (options.twitter) {
      const twitters = content.match(/"(https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+))"/ig);
      if (Array.isArray(twitters) && twitters.length) {
        for (const twitter of twitters) {
          const twitterURL = twitter.slice(1, -1);
          const response = await fetch('https://publish.twitter.com/oembed?url=' + twitterURL);
          if (response.ok) {
            const data = await response.json();
            const targetT = new RegExp(`<a href="` + twitterURL + `" target="_blank">` + twitterURL + `</a>(<br \/>|)`, 'ig');
            let replacementT = `<!-- -->${data.html}<!-- -->`;
            if (options.twitterUrl){
              replacementT = `<a href="${twitterURL}" target="_blank">${twitterURL}</a><br />${replacementT}`;
            }
            content = content.replace(targetT, replacementT);
            content = content.replace(/<script async src="https:\/\/platform\.twitter\.com\/widgets\.js" charset="utf-8"><\/script>\n+/gi, '');
          }
        }
      }
    }

    // Youtube embed code
    if (options.youtube) {
      const youtubes = content.match(/"(https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)"/ig);
      if (Array.isArray(youtubes) && youtubes.length) {
        for (const youtube of youtubes) {
          const youtubeURL = youtube.slice(1, -1);
          const response = await fetch('http://www.youtube.com/oembed?url=' + youtubeURL);
          if (response.ok) {
            const data = await response.json();
            const youtubeTemp = youtubeURL.replace('?', '\\?');
            const targetY = new RegExp(`<a href="` + youtubeTemp + `" target="_blank">` + youtubeTemp + `</a>(<br \/>|)`, 'ig');
            let replacementY = `<!-- -->${data.html}<!-- -->`;
            if (options.youtubeUrl) {
              replacementY = `<a href="${youtubeURL}" target="_blank">${youtubeURL}</a><br /><!-- -->${data.html}<!-- -->`;
            }
            content = content.replace(targetY, replacementY);
          }else{
            if (response.status === 401){
              const idTmp = youtubeURL.replace(/(https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/gi, `$2`);
              const youtubeTemp = youtubeURL.replace('?', '\\?');
              const targetY = new RegExp(`<a href="` + youtubeTemp + `" target="_blank">` + youtubeTemp + `</a>(<br \/>|)`, 'ig');
              let replacementY = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${idTmp}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
              if (options.youtubeUrl) {
                replacementY = `<a href="${youtubeURL}" target="_blank">${youtubeURL}</a><br /><!-- -->${replacementY}<!-- -->`;
              }
              content = content.replace(targetY, replacementY);
            } else if (response.status === 403) {
              const sslresponse = await fetch('https://www.youtube.com/oembed?url=' + youtubeURL);
              if (sslresponse.ok) {
                const data = await sslresponse.json();
                const youtubeTemp = youtubeURL.replace('?', '\\?');
                const targetY = new RegExp(`<a href="` + youtubeTemp + `" target="_blank">` + youtubeTemp + `</a>(<br \/>|)`, 'ig');
                let replacementY = `<!-- -->${data.html}<!-- -->`;
                if (options.youtubeUrl) {
                  replacementY = `<a href="${youtubeURL}" target="_blank">${youtubeURL}</a><br /><!-- -->${data.html}<!-- -->`;
                }
                content = content.replace(targetY, replacementY);
              }
            }
          }
        }
      }
    }
    content = content.replace(/\n/g, '');

    if (res.isAdded) {
      htmlTag += `<div class="t_h t_i`;
    } else {
      htmlTag += `<div class="t_h`;
    }
    if (res.anchorLevel > 0){
      htmlTag += ` left${res.anchorLevel}`;
    }
    htmlTag += '">';
    let resName = res.name.replace(/(<span[^<]+>)|(<\/span>)/ig, '');
    if (options.isReplaceName){
      const re = new RegExp(options.replaceName.replace(/,/g, '|'), 'gi');
      if (re.test(resName)) {
        resName = options.replacedName;
      }
    }
    const resDate = res.date.replace(/(<span[^<]+>)|(<\/span>)/ig, '');
    const resId = res.id.replace(/(<span[^<]+>)|(<\/span>)/ig, '');

    htmlTag += `${res.num}: <span class="name">${resName}</span>`;
    htmlTag += ` <span style="color: #808080;"> ${resDate}`;

    if (options.shuturyoku) {
      if (res.id.length > 0 ) {
        if (res.idColor !== '#000') {
          htmlTag += `<em style="color:${res.idColor}; background-color: ${res.idBackgroundColor}; font-weight: bold;" class="specified"> ID:${resId}</em>`;
        } else {
          htmlTag += ` ID:${resId}`;
        }
      }
    } else {
      if (res.id.length > 0 ) {
        if (res.idColor !== '#000') {
          htmlTag += `<span class="${res.idClassNoSelect}"> ID:${resId}</span>`;
        } else {
          htmlTag += ` ID:${resId}`;
        }
      }
    }
    htmlTag += `</span></div>\n`;

    if ( options.shuturyoku) {
      htmlTag += `<div class="t_b`;
      if (res.isAdded) {
        htmlTag += ` t_i`;
      }
      if (res.anchorLevel > 0){
        htmlTag += ` left${res.anchorLevel}`;
      }
      htmlTag += `"><!-- res_s -->`;
      if (res.isInserted) {
        if (options.insertPrefix) {
          htmlTag += options.insertPrefix;
        }
      }
      let suffix = '';
      if (res.resFontSize === options.resSizeList[1].value || res.resFontSize === options.resSizeList[2].value ){
        htmlTag += `<span style="font-size:${res.resFontSize};">`;
        suffix = `</span>`;
      }

      if (options.characterColors.indexOf(res.resColor) !== -1){
        htmlTag += `<span style="color:${res.resColor};">`;
        suffix = `</span>` + suffix;
      }
      if (res.isInserted) {
        suffix += options.insertSuffix;
      }
      htmlTag += `${content}${suffix}<!-- res_e -->`;

    } else {

      htmlTag += `<div class="t_b`;
      if (res.isAdded) {
        htmlTag += ` t_i`;
      }
      if (res.anchorLevel > 0){
        htmlTag += ` left${res.anchorLevel}`;
      }
      htmlTag += `"><!-- res_s -->`;
      if (res.isInserted) {
        if (options.insertPrefix) {
          htmlTag += options.insertPrefix;
        }
      }
      if (res.idColor !== '#000') {
        htmlTag += `<!-- ${res.idClassNoSelect}_s -->`;
      }
      let suffix = '';
      if (res.resFontSize === options.resSizeList[1].value){
        htmlTag += `<tt>`;
        suffix = `</tt>` + suffix;
      }else if (res.resFontSize === options.resSizeList[2].value){
        htmlTag += `<code>`;
        suffix = `</code>` + suffix;
      }
      for (let i = 0; i < options.characterColors.length; i++){
        if (res.resColor === options.characterColors[i]){
          htmlTag += options.startAbbreviations[i];
          suffix = options.endAbbreviations[i] + suffix;
        }
      }
      htmlTag += `${content}${suffix}`;
      if (res.idColor !== '#000') {
        htmlTag += `<!-- ${res.idClassNoSelect}_e -->`;
      }

      if (res.isInserted) {
        if (options.insertSuffix) {
          htmlTag += options.insertSuffix;
        }
      }
      htmlTag += `<!-- res_e -->`;

    }
    htmlTag += `</div>\n`;
    return htmlTag;
  }

  generateRelValue(resNum) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for ( let i = 0; i < 4; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return 'res_' + result + resNum;
 }
}
