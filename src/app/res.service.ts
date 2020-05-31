import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const electron = (<any>window).require('electron');

@Injectable({
  providedIn: 'root'
})
export class ResService {
  resList = new BehaviorSubject<[]>([]);
  hideIdSource = new BehaviorSubject<string[]>([]);
  LoadHiddenIds = this.hideIdSource.asObservable();
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
}
