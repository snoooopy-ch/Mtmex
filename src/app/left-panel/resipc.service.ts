import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
const electron = (<any>window).require('electron');
@Injectable({
  providedIn: 'root'
})
export class ResipcService {
  resList = new BehaviorSubject<string[]>([]);
  constructor() {
    electron.ipcRenderer.on('getResResponse', (event, resList) => {
      this.resList.next(resList);
    });
  }
}
