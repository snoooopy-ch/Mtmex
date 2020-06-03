import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const electron = (window as any).require('electron');

@Injectable({
  providedIn: 'root'
})
export class ResService {
  resList = new BehaviorSubject<[]>([]);
  hideIdSource = new BehaviorSubject<string[]>([]);
  LoadHiddenIds = this.hideIdSource.asObservable();
  scrollPosSource = new BehaviorSubject<any>({index: 1, pos: 0, isTab: false});
  scrollPos = this.scrollPosSource.asObservable();
  selectedResSource = new BehaviorSubject<any>({select: 0, candi1: 0, candi2: 0});
  selectedRes = this.selectedResSource.asObservable();
  constructor() {
    electron.ipcRenderer.on('getResResponse', (event, resList) => {
      this.resList.next(resList);
    });
  }

  loadRes(url, isResSort: boolean, isMultiAnchor: boolean, isReplaceRes: boolean) {
    electron.ipcRenderer.send('loadRes', url, isResSort, isMultiAnchor, isReplaceRes);
  }

  setHiddenIds(hiddenIds: string[]) {
    this.hideIdSource.next(hiddenIds);
  }

  setScrollPos(scrollPos: any){
    this.scrollPosSource.next(scrollPos);
  }

  setSelectedRes(selectedRes: any){
    this.selectedResSource.next(selectedRes);
  }

}
