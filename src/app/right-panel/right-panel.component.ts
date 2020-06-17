import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import {ResService} from '../res.service';
import { Observable, timer } from 'rxjs';
const electron = (window as any).require('electron');

@Component({
  selector: 'app-right-panel',
  templateUrl: './right-panel.component.html',
  styleUrls: ['./right-panel.component.css']
})
export class RightPanelComponent implements OnInit, OnDestroy {
  txtUrl = '';
  isResSort = false;
  isMultiAnchor = false;
  isReplaceRes = false;
  hiddenIds: string[];
  tabIndex: number;
  selectCount = 0;
  candi1Count = 0;
  candi2Count = 0;
  totalCount = 0;
  selectCommand = '';
  settings;
  htmlTag: string;
  private timer;
  public subscribers: any = {};
  private title: any;


  constructor(private resService: ResService, private cdRef: ChangeDetectorRef, private clipboard: Clipboard) {
    this.hiddenIds = [];
  }

  ngOnInit(): void {
    this.subscribers.LoadHiddenIds = this.resService.LoadHiddenIds.subscribe((hiddenIds) => {
      this.hiddenIds = hiddenIds;
      this.cdRef.detectChanges();
    });

    this.subscribers.settings = this.resService.settings.subscribe((value) => {
      this.settings = value;

      if (this.settings.AutoSave){
        const min = Number(this.settings.min);
        this.timer = timer(2000, min * 60000);
        // subscribing to a observable returns a subscription object
        this.subscribers.statusTimer =  this.timer.subscribe(t => {
          if (this.title !== undefined) {
            this.saveAppStatus(`${this.settings.autoSavePath}${this.title}.txt`, false);
          }
        });
      }
      this.txtUrl = this.settings.dataPath;
      this.isReplaceRes = this.settings.isReplaceRes;
      this.isMultiAnchor = this.settings.isMultiAnchor;
      this.isResSort = this.settings.isResSort;
      this.cdRef.detectChanges();
    });

    this.subscribers.selectedTab = this.resService.selectedTab.subscribe((value ) => {
      this.tabIndex = value.tabIndex;
      this.selectCount = value.select;
      this.candi1Count = value.candi1;
      this.candi2Count = value.candi2;
      this.totalCount = value.totalCount;
      this.title = value.title;
    });

    this.subscribers.selectedRes = this.resService.selectedRes.subscribe((value) => {
      if (this.tabIndex === value.tabIndex) {
        this.selectCount = value.select;
        this.candi1Count = value.candi1;
        this.candi2Count = value.candi2;
        this.cdRef.detectChanges();
      }
    });

    this.subscribers.totalRes = this.resService.totalRes.subscribe((value) => {
      if (this.tabIndex === value.tabIndex){
        this.totalCount = value.totalCount;
        console.log(value.title);
        if (value.title !== undefined){
          this.title = value.title;
        }
      }
    });

    this.subscribers.printHtml = this.resService.printHtml.subscribe( (value) => {
      if (this.tabIndex === value.tabIndex){
        this.htmlTag = value.html;
        this.clipboard.copy(this.htmlTag);
      }
    });

    this.subscribers.status = this.resService.status.subscribe((value) => {
      if (this.tabIndex === value.tabIndex) {
        this.isResSort = value.data.isResSort;
        this.isReplaceRes = value.data.isReplaceRes;
        this.isMultiAnchor = value.data.isMultiAnchor;
        this.txtUrl = value.data.txtPath;
      }
    });
  }

  /**
   * Unsubscribe the completed service subscribers
   */
  ngOnDestroy(){
    this.subscribers.LoadHiddenIds.unsubscribe();
    this.subscribers.settings.unsubscribe();
    this.subscribers.selectedTab.unsubscribe();
    this.subscribers.selectedRes.unsubscribe();
    this.subscribers.totalRes.unsubscribe();
    this.subscribers.printHtml.unsubscribe();
    this.subscribers.status.unsubscribe();
    this.subscribers.statusTimer.unsubscribe();
  }

  onLoadUrl(txtUrl: string, isResSort: boolean, isMultiAnchor: boolean, isReplaceRes: boolean) {
    this.resService.loadRes(txtUrl, isResSort, isMultiAnchor, isReplaceRes);
  }

  /**
   * IDを非表示のID欄から削除し、そのIDのレスを、レス描写エリアに表示します
   * @param id: 非表示のID
   */
  ShowIdHandler(id: string) {
    let exists = false;
    for (let i = 0; i < this.hiddenIds.length; i++){
      if (this.hiddenIds[i] === id){
        this.hiddenIds.splice(i, 1);
        exists = true;
        break;
      }
    }
    if (exists){
      this.cdRef.detectChanges();
      this.resService.setHiddenIds(this.hiddenIds);
    }
  }

  /**
   * レス描写エリアを移動します
   * @param value: 移動種類
   */
  moveResViewHandler(value: string) {
    this.resService.setMoveRes({
      tabIndex: this.tabIndex,
      moveKind: value
    });
  }

  selectResHandler() {
    this.resService.setSelectCommand({
      tabIndex: this.tabIndex,
      command: this.selectCommand
    });
    this.selectCommand = '';
  }

  setDefaultPathHandler() {
    this.txtUrl = this.settings.defaultPath;
  }

  printHtmlTagHandler() {
    this.resService.setPrintCommand({tabIndex: this.tabIndex, token: true});
  }

  saveCurrentRes() {
    electron.remote.dialog.showSaveDialog(null, {title: 'レス状態保存'}).then(result => {
      if (!result.canceled){
        this.saveAppStatus(result.filePath, true);
      }
    }).catch(err => {
      console.log(err);
    });
  }

  saveAppStatus(path, isMessage){
    this.resService.setSaveResStatus({
      tabIndex: this.tabIndex,
      filePath: path,
      isResSort: this.isResSort,
      isMultiAnchor: this.isMultiAnchor,
      isReplaceRes: this.isReplaceRes,
      txtPath: this.txtUrl,
      token: true,
      showMessage: isMessage
    });
  }


  loadCurrentRes() {
    electron.remote.dialog.showOpenDialog(null, {title: 'レス状態保存'}).then(result => {
      if (!result.canceled){
        this.resService.loadStatus(result.filePaths[0], this.tabIndex);
      }
    });
  }
}
