import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import {ResService} from '../res.service';
import {Observable, Subject, timer} from 'rxjs';
import {switchMap, takeUntil, repeatWhen} from 'rxjs/operators';
const electron = (window as any).require('electron');

@Component({
  selector: 'app-right-panel',
  templateUrl: './right-panel.component.html',
  styleUrls: ['./right-panel.component.css']
})
export class RightPanelComponent implements OnInit, OnDestroy {
  txtDataFilePath = '';
  isResSort = false;
  isMultiAnchor = false;
  isReplaceRes = false;
  hiddenIds: string[];
  tabIndex: number;
  selectCount = 0;
  candi1Count = 0;
  candi2Count = 0;
  candi3Count = 0;
  candi4Count = 0;
  totalCount = 0;
  selectCommand = '';
  settings;
  htmlTag: string;
  private timer;
  public subscribers: any = {};
  private title: any;
  txtRemarkRes: string;
  txtHideRes: string;
  isContinuousAnchor: any;
  notMoveFutureAnchor: any;
  sortCommand: any;
  loadDatPath: string;
  loadStatusPath: string;
  isReplaceName: boolean;
  isOutputCandiBelow: boolean;
  private readonly stopTimer = new Subject<void>();
  private readonly startTimer = new Subject<void>();

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
        this.timer = timer(30000, min * 60000);
        // subscribing to a observable returns a subscription object
        this.subscribers.statusTimer =  this.timer.pipe(
          takeUntil(this.stopTimer),
          repeatWhen(() => this.startTimer)
        ).subscribe(t => {
          if (this.title !== undefined) {
            this.saveAppStatus(null, false);
          }
        });
      }
      this.txtDataFilePath = this.settings.dataPath;
      this.isReplaceRes = this.settings.isReplaceRes;
      this.isMultiAnchor = this.settings.isMultiAnchor;
      this.isContinuousAnchor = this.settings.isContinuousAnchor;
      this.notMoveFutureAnchor = this.settings.notMoveFutureAnchor;
      this.isResSort = this.settings.isResSort;
      if (this.settings.chuui !== undefined) {
        this.txtRemarkRes = this.settings.chuui;
        this.txtHideRes = this.settings.hihyouji;
      }

      if (this.settings.default_dat_folder_path !== undefined){
        this.loadDatPath = this.settings.default_dat_folder_path;
      }

      if (this.settings.default_status_folder_path !== undefined){
        this.loadStatusPath = this.settings.default_status_folder_path;
      }

      if (this.settings.yobi_kabu_shuturyoku !== undefined){
        this.isOutputCandiBelow = this.settings.yobi_kabu_shuturyoku;
      }

      this.cdRef.detectChanges();
    });

    this.subscribers.selectedTab = this.resService.selectedTab.subscribe((value ) => {
      this.tabIndex = value.tabIndex;
      this.selectCount = value.select;
      this.candi1Count = value.candi1;
      this.candi2Count = value.candi2;
      this.candi3Count = value.candi3;
      this.candi4Count = value.candi4;
      this.totalCount = value.totalCount;
      this.title = value.title;
    });

    this.subscribers.selectedRes = this.resService.selectedRes.subscribe((value) => {
      if (this.tabIndex === value.tabIndex && value.rightToken) {
        this.selectCount = value.select;
        this.candi1Count = value.candi1;
        this.candi2Count = value.candi2;
        this.candi3Count = value.candi3;
        this.candi4Count = value.candi4;
        this.cdRef.detectChanges();
        value.rightToken = false;
      }
    });

    this.subscribers.totalRes = this.resService.totalRes.subscribe((value) => {
      if (this.tabIndex === value.tabIndex && value.rightToken){
        this.totalCount = value.totalCount;
        if (value.title !== undefined){
          this.title = value.title;
        }
        this.cdRef.detectChanges();
        value.rightToken = false;
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
        this.txtDataFilePath = value.data.txtPath;
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

  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHandler(event) {
    this.resService.saveSettings({dataFilePath: this.txtDataFilePath,
      remarkRes: this.txtRemarkRes,
      hideRes: this.txtHideRes,
      isResSort: this.isResSort,
      isMultiAnchor: this.isMultiAnchor,
      isReplaceRes: this.isReplaceRes,
      isContinuousAnchor: this.isContinuousAnchor,
      notMoveFutureAnchor: this.notMoveFutureAnchor,
      defaultDatFolderPath: this.loadDatPath,
      defaultStatusFolderPath: this.loadStatusPath
    });
  }
  start(): void {
    this.startTimer.next();
  }
  stop(): void {
    this.stopTimer.next();
  }

  btnLoadSingleFile(filePath) {

    const remarkRes = this.getRemarkRes();
    const hideRes = this.getHideRes();
    this.stop();
    this.resService.loadRes(filePath, this.isResSort, this.isMultiAnchor && this.isResSort, this.isReplaceRes,
      this.isContinuousAnchor && this.isMultiAnchor && this.isResSort, this.notMoveFutureAnchor, remarkRes, hideRes);
    this.start();
  }

  getRemarkRes(){
    let remarkRes = this.txtRemarkRes;
    if (remarkRes.endsWith(';')){
      remarkRes = remarkRes.substr(0, remarkRes.length - 1);
    }
    remarkRes = remarkRes.replace(/;/gi, '|');
    return remarkRes;
  }

  getHideRes(){
    let hideRes = this.txtHideRes;
    if (hideRes.endsWith(';')){
      hideRes = hideRes.substr(0, hideRes.length - 1);
    }
    hideRes = hideRes.replace(/;/gi, '|');
    return hideRes;
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

  btnSelectResHandler() {
    this.resService.setSelectCommand({
      tabIndex: this.tabIndex,
      command: this.selectCommand,
      token: true,
    });
    this.selectCommand = '';
  }

  setDefaultPathHandler(dataIndex) {
    this.txtDataFilePath = this.settings.defaultPath[dataIndex];
  }

  printHtmlTagHandler() {
    this.resService.setPrintCommand({
      tabIndex: this.tabIndex,
      isReplaceName: this.isReplaceName,
      token: true});
  }

  printAllHtmlTagHandler() {
    this.resService.setPrintAllCommand({
      isOutputCandiBelow: this.isOutputCandiBelow,
      isReplaceName: this.isReplaceName,
      token: true});
  }

  saveCurrentRes() {
    electron.remote.dialog.showSaveDialog(null, {title: 'レス状態保存',
      filters: [{ name: '状態保存パイル', extensions: ['txt'] }]}).then(result => {
      if (!result.canceled){
        let filePath;
        if (!result.filePath.endsWith('.txt')){
          filePath = result.filePath + '.txt';
        }else{
          filePath = result.filePath;
        }
        this.saveAppStatus(filePath, true);
      }
    }).catch(err => {
      console.log(err);
    });
  }

  saveAppStatus(selectedPath, isMessage){
    this.resService.setSaveResStatus({
      tabIndex: this.tabIndex,
      filePath: selectedPath,
      autoFilePath: this.settings.autoSavePath,
      isAllTabSave: selectedPath === null ? this.settings.all_tab_save : false,
      isResSort: this.isResSort,
      isMultiAnchor: this.isMultiAnchor,
      isReplaceRes: this.isReplaceRes,
      txtPath: this.txtDataFilePath,
      remarkRes: this.txtRemarkRes,
      hideRes: this.txtHideRes,
      token: true,
      showMessage: isMessage
    });
  }


  loadCurrentRes() {
    electron.remote.dialog.showOpenDialog(null, {title: 'レス状態復元',
      properties: ['openFile', 'multiSelections'],
      defaultPath: this.loadStatusPath,
      filters: [{ name: '復元パイル', extensions: ['txt'] }]}).then(result => {
      if (!result.canceled){
        if (result.filePaths.length > 0) {
          this.stop();
          this.loadStatusPath = result.filePaths[0].substr(0, result.filePaths[0].lastIndexOf('\\'));
          this.resService.loadStatus(result.filePaths);
          this.start();
        }
      }
    });
  }

  btnLoadMultiFiles() {
    electron.remote.dialog.showOpenDialog(null,
      {
        title: 'dat直接読み込み',
        properties: ['openFile', 'multiSelections'],
        defaultPath: this.loadDatPath,
        filters: [
          {
            name: 'すべてのファイル', extensions: ['dat', '*']
          },
          {
            name: 'Datファイル', extensions: ['dat']
          }
        ]
      }).then(async result => {
      if (!result.canceled){
        const remarkRes = this.getHideRes();
        const hideRes = this.getHideRes();
        if (result.filePaths.length > 0) {
          this.stop();
          this.loadDatPath = result.filePaths[0].substr(0, result.filePaths[0].lastIndexOf('\\'));
          this.resService.loadMultiRes(result.filePaths, this.isResSort, this.isMultiAnchor && this.isResSort,
            this.isReplaceRes, this.isContinuousAnchor && this.isMultiAnchor && this.isResSort,
            this.notMoveFutureAnchor, remarkRes, hideRes);
          this.start();
        }
      }
    });
  }

  btnSetResMenuHandler(value: number) {
    this.resService.setResMenu({
      tabIndex: this.tabIndex,
      token: true,
      resMenu: value
    });
  }

  btnSortResHandler() {
    if (this.sortCommand === 'num-sort') {
      this.resService.setSort({
        tabIndex: this.tabIndex,
        token: true
      });
    }
    this.sortCommand = '';
  }
}
