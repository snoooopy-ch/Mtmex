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
  status = new BehaviorSubject<any>({});
  hideIdSource = new BehaviorSubject<string[]>([]);
  LoadHiddenIds = this.hideIdSource.asObservable();
  scrollPosSource = new BehaviorSubject<any>({index: 1, pos: 0, isTab: false});
  scrollPos = this.scrollPosSource.asObservable();
  selectedResSource = new BehaviorSubject<any>({select: 0, candi1: 0, candi2: 0, tabIndex: 0});
  selectedRes = this.selectedResSource.asObservable();
  selectedTabSource = new BehaviorSubject<any>({select: 0, candi1: 0, candi2: 0, totalCount: 0, tabIndex: 0});
  selectedTab = this.selectedTabSource.asObservable();
  moveResSource = new BehaviorSubject<any>({tabIndex: 0, moveKind: ''});
  moveRes = this.moveResSource.asObservable();
  totalResSource = new BehaviorSubject<any>({tabIndex: 0, totalCount: 0});
  totalRes = this.totalResSource.asObservable();
  selectCommandSource = new BehaviorSubject<any>({tabIndex: 0, command: ''});
  selectCommand = this.selectCommandSource.asObservable();
  printCommandSource = new BehaviorSubject<any>({tabIndex: 0});
  printCommand = this.printCommandSource.asObservable();
  printHtmlSource = new BehaviorSubject<any>({tabIndex: 0, html: ''});
  printHtml = this.printHtmlSource.asObservable();
  printAllCommandSource = new BehaviorSubject<any>({});
  printAllCommand = this.printAllCommandSource.asObservable();
  saveResStatusSource = new BehaviorSubject<any>({});
  saveResStatus = this.saveResStatusSource.asObservable();


  constructor() {
    electron.ipcRenderer.on('getResResponse', (event, value) => {
      this.resData.next(value);
    });
    electron.ipcRenderer.on('getSettings', (event, value) => {
      this.settings.next(value);
    });
    electron.ipcRenderer.on('getStatus', (event, value) => {
      this.status.next(value);
    });

  }

  loadRes(url, isResSort: boolean, isMultiAnchor: boolean, isReplaceRes: boolean, remarkRes, hideRes) {
    electron.ipcRenderer.send('loadRes', url, isResSort, isMultiAnchor, isReplaceRes, remarkRes, hideRes);
  }

  loadSettings(){
    electron.ipcRenderer.send('loadSettings');
  }

  saveStatus(saveData: any){
    electron.ipcRenderer.send('saveStatus', saveData);
  }

  loadStatus(filePath, tabIndex){
    electron.ipcRenderer.send('loadStatus', filePath, tabIndex);
  }

  saveSettings(dataFilePath, remarkRes, hiddenRes){
    electron.ipcRenderer.send('saveSettings', dataFilePath, remarkRes, hiddenRes);
  }

  setHiddenIds(value: string[]) {
    this.hideIdSource.next(value);
  }

  setScrollPos(value: any){
    this.scrollPosSource.next(value);
  }

  setSelectedRes(value: any){
    this.selectedResSource.next(value);
  }

  setSelectedTab(value: any){
    this.selectedTabSource.next(value);
  }

  setMoveRes(value: any){
    this.moveResSource.next(value);
  }

  setTotalRes(value: any){
    this.totalResSource.next(value);
  }

  setSelectCommand(value: any){
    this.selectCommandSource.next(value);
  }

  setPrintCommand(value: any){
    this.printCommandSource.next(value);
  }

  setPrintAllCommand(value: any){
    this.printAllCommandSource.next(value);
  }

  setPrintHtml(value: any){
    this.printHtmlSource.next(value);
  }

  setSaveResStatus(value: any){
    this.saveResStatusSource.next(value);
  }

  async printHtmlTag(resList: ResItem[], options) {

    let htmlTag = `★■●${options.tabName}●■★\n`;
    htmlTag += `URL入力欄：${options.txtURL}\n`;
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
      htmlTag += `<div style="yobi1">予備選択1</div>\n${yobi1}`;
    }

    let yobi2 = ``;
    for (const res of resList){
      if (res.resSelect === 'candi2'){
        exists = true;
        yobi2 += await this.printRes(res, options);
      }
    }

    if (yobi2.length > 0){
      htmlTag += `<div style="yobi2">予備選択2</div>\n${yobi2}`;
    }

    if (!exists){
      htmlTag = '';
    }else{
      htmlTag = htmlTag.substr(0, htmlTag.length - 1);
    }
    return htmlTag;
  }

  async printRes(res: ResItem, options){
    let htmlTag = '';
    let content = res.content;
    content = content.replace(/(<img[^<]+>)/ig, '');
    content = content.replace(/(<span[^<]+>)/ig, '');
    content = content.replace(/(<\/span>)/ig, '');
    content = content.replace(/(&gt;&gt;\d*[0-9]\d*)/ig, `<span class="anchor">$1</span>`);
    content = content.replace(/( class="res-img-link"| class="res-link")/ig, ``);
    content = content.replace(/(\.jpg"|\.gif"|\.jpeg"|\.png"|\.bmp")(>https:)/ig,
      `$1 target="_blank" class="image"$2`);
    content = content.replace(/(\.[^jpg]+"|\.[^gif]+"|\.[^jpeg]+"|\.[^png]+"|\.[^bmp]+")(>https:)/ig,
      `$1 target="_blank"$2`);
    // content = content.replace(/(<br><br>)/ig, '<br>');
    // content = content.replace(/(<br><br>)/ig, '<br>');
    content = content.replace(/(<br>)/ig, '<br />');

    // Twitter embed code
    if (options.twitter) {
      const twitters = content.match(/"(https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+))"/ig);
      if (Array.isArray(twitters) && twitters.length) {
        for (const twitter of twitters) {
          const twitterURL = twitter.slice(1, -1);
          const response = await fetch('https://publish.twitter.com/oembed?url=' + twitterURL);
          const data = await response.json();
          const replace = `<a href="${twitterURL}" target="_blank">${twitterURL}</a><br />`;
          content = content.replace(replace, replace + data.html);
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
          const data = await response.json();
          const replace = `<a href="${youtubeURL}" target="_blank">${youtubeURL}</a><br />`;
          content = content.replace(replace, replace + data.html);
        }
      }
    }

    if (res.isAdded) {
      htmlTag += `<div class="t_h t_i">`;
    } else {
      htmlTag += `<div class="t_h">`;
    }
    htmlTag += `${res.num}: <span class="name">${res.name}</span>`;
    htmlTag += ` <span style="color: gray;"> ${res.date}`;

    if ( options.shuturyoku) {
      if (res.id.length > 0 ) {
        if (res.idColor !== '#000') {
          htmlTag += `<em style="color:${res.idColor}; background-color: ${res.idBackgroundColor}; font-weight: bold;" class="specified"> ID:${res.id}</em>`;
        } else {
          htmlTag += ` ID:${res.id}`;
        }
      }
    } else {
      if (res.id.length > 0 ) {
        if (res.idColor !== '#000') {
          htmlTag += `<span class="${res.idClassNoSelect}"> ID:${res.id}</span>`;
        } else {
          htmlTag += ` ID:${res.id}`;
        }
      }
    }
    htmlTag += `</span></div>\n`;

    if ( options.shuturyoku) {
      htmlTag += `<div class="t_b`;
      if (res.isAdded) {
        htmlTag += ` t_i`;
      }
      htmlTag += `"><!-- res_s -->`;
      let suffix = '';
      if (res.resFontSize === options.resSizeList[1].value || res.resFontSize === options.resSizeList[2].value ){
        htmlTag += `<span style="font-size:${res.resFontSize};">`;
        suffix = `</span>`;
      }

      if (options.characterColors.indexOf(res.resColor) !== -1){
        htmlTag += `<span style="color:${res.resColor};">`;
        suffix = `</span>` + suffix;
      }

      htmlTag += `${content}${suffix}<!-- res_e -->`;

    } else {

      htmlTag += `<div class="t_b`;
      if (res.isAdded) {
        htmlTag += ` t_i`;
      }
      htmlTag += `"><!-- res_s -->`;
      let suffix = '';
      if (res.resFontSize === options.resSizeList[1].value){
        htmlTag += `<tt>`;
        suffix = `</tt>` + suffix;
      }else if (res.resFontSize === options.resSizeList[2].value){
        htmlTag += `<code>`;
        suffix = `</code>` + suffix;
      }

      if (res.resColor === options.characterColors[0]){
        htmlTag += `<s>`;
        suffix = `</s>` + suffix;
      } else if (res.resColor === options.characterColors[1]){
        htmlTag += `<em>`;
        suffix = `</em>` + suffix;
      }else if (res.resColor === options.characterColors[2]){
        htmlTag += `<ins>`;
        suffix = `</ins>` + suffix;
      } else if (res.resColor === options.characterColors[3]){
        htmlTag += `<samp>`;
        suffix = `</samp>` + suffix;
      } else if (res.resColor === options.characterColors[4]){
        htmlTag += `<del>`;
        suffix = `</del>` + suffix;
      }else if (res.resColor === options.characterColors[5]){
        htmlTag += `<dfn>`;
        suffix = `</dfn>` + suffix;
      } else if (res.resColor === options.characterColors[6]){
        htmlTag += `<var>`;
        suffix = `</var>` + suffix;
      } else if (res.resColor === options.characterColors[7]){
        htmlTag += `<cite>`;
        suffix = `</cite>` + suffix;
      } else if (res.resColor === options.characterColors[8]){
        htmlTag += `<u>`;
        suffix = `</u>` + suffix;
      } else if (res.resColor === options.characterColors[9]){
        htmlTag += `<kbd>`;
        suffix = `</kbd>` + suffix;
      }
      htmlTag += `${content}${suffix}<!-- res_e -->`;

    }
    htmlTag += `</div>\n`;
    return htmlTag;
  }
}
