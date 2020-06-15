import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

  loadRes(url, isResSort: boolean, isMultiAnchor: boolean, isReplaceRes: boolean) {
    electron.ipcRenderer.send('loadRes', url, isResSort, isMultiAnchor, isReplaceRes);
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

  setPrintHtml(value: any){
    this.printHtmlSource.next(value);
  }

  setSaveResStatus(value: any){
    this.saveResStatusSource.next(value);
  }

}
