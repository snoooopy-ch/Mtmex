import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit
} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';
import {ResService} from '../res.service';
import {Subject, timer} from 'rxjs';
import {takeUntil, repeatWhen} from 'rxjs/operators';
import {Hotkey, HotkeysService} from 'angular2-hotkeys';

const electron = (window as any).require('electron');

@Component({
  selector: 'app-right-panel',
  templateUrl: './right-panel.component.html',
  styleUrls: ['./right-panel.component.scss']
})
export class RightPanelComponent implements OnInit, OnDestroy {
  txtDataFilePath = '';
  txtSpecialFileReadPath = '';
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
  candi5Count = 0;
  candi6Count = 0;
  candi7Count = 0;
  candi8Count = 0;
  totalCount = 0;
  selectCommand = '';
  selectCommandWithButton = '';
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
  sinshukuCancelCommand: any;
  loadDatPath: string;
  loadStatusPath: string;
  isReplaceName: boolean;
  isSurroundImage: boolean;
  isOutputCandiBelow: boolean;
  gazouReplaceUrl = '';
  private readonly stopTimer = new Subject<void>();
  private readonly startTimer = new Subject<void>();
  isSaveOfLoadFile: boolean;
  public allTabCount: any;
  private isIgnoreDivInclude = false;

  constructor(private resService: ResService,
              private cdRef: ChangeDetectorRef,
              private clipboard: Clipboard,
              private hotkeysService: HotkeysService) {
    this.hiddenIds = [];
    this.isReplaceName = true;
    this.isSurroundImage = false;
    this.allTabCount = {
      select: 0,
      candi1: 0,
      candi2: 0,
      candi3: 0,
      candi4: 0,
      candi5: 0,
      candi6: 0,
      candi7: 0,
      candi8: 0
    };
  }

  ngOnInit(): void {

    this.isSaveOfLoadFile = true;
    this.subscribers.LoadHiddenIds = this.resService.LoadHiddenIds.subscribe((hiddenIds) => {
      this.hiddenIds = hiddenIds;
      this.cdRef.detectChanges();
    });

    this.subscribers.settings = this.resService.settings.subscribe((value) => {
      this.settings = value;

      if (this.settings.AutoSave) {
        const min = Number(this.settings.min);
        this.timer = timer(30000, min * 60000);
        this.subscribers.statusTimer = this.timer.pipe(
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

      if (this.settings.default_dat_folder_path !== undefined) {
        this.loadDatPath = this.settings.default_dat_folder_path;
      }

      if (this.settings.default_status_folder_path !== undefined) {
        this.loadStatusPath = this.settings.default_status_folder_path;
      }

      if (this.settings.t_media2_mtm_URL !== undefined) {
        this.gazouReplaceUrl = this.settings.t_media2_mtm_URL;
      }

      if (this.settings.yobi_kabu_shuturyoku !== undefined) {
        this.isOutputCandiBelow = this.settings.yobi_kabu_shuturyoku;
      }

      this.cdRef.detectChanges();
      this.setHotKeys();
    });

    this.subscribers.selectedTab = this.resService.selectedTab.subscribe((value) => {
      this.tabIndex = value.tabIndex;
      this.selectCount = value.select;
      this.candi1Count = value.candi1;
      this.candi2Count = value.candi2;
      this.candi3Count = value.candi3;
      this.candi4Count = value.candi4;
      this.candi5Count = value.candi5;
      this.candi6Count = value.candi6;
      this.candi7Count = value.candi7;
      this.candi8Count = value.candi8;
      this.totalCount = value.totalCount;
      this.title = value.title;
      this.hiddenIds = value.hiddenIds;
    });

    this.subscribers.selectedRes = this.resService.selectedRes.subscribe((value) => {
      if (this.tabIndex === value.tabIndex && value.rightToken) {

        this.selectCount = value.select;
        this.candi1Count = value.candi1;
        this.candi2Count = value.candi2;
        this.candi3Count = value.candi3;
        this.candi4Count = value.candi4;
        this.candi5Count = value.candi5;
        this.candi6Count = value.candi6;
        this.candi7Count = value.candi7;
        this.candi8Count = value.candi8;
        this.cdRef.detectChanges();
        value.rightToken = false;
      }
    });

    this.subscribers.changeResCount = this.resService.changeResCount.subscribe((value) => {

      if (value?.rightToken) {
        this.allTabCount = value.allTabCount;
        this.cdRef.detectChanges();
        value.rightToken = false;
      }
    });

    this.subscribers.totalRes = this.resService.totalRes.subscribe((value) => {
      if (this.tabIndex === value.tabIndex && value.rightToken) {
        this.totalCount = value.totalCount;
        if (value.title !== undefined) {
          this.title = value.title;
        }
        this.cdRef.detectChanges();
        value.rightToken = false;
      }
    });

    this.subscribers.printHtml = this.resService.printHtml.subscribe((value) => {
      if (this.tabIndex === value.tabIndex) {
        this.htmlTag = value.html;
        this.clipboard.copy(this.htmlTag);
      }
    });

    this.subscribers.printHtmlOnStatus = this.resService.printHtmlOnStatus.subscribe((value) => {
      if (value !== undefined && value === 0) {
        this.printHtmlTagHandler();
      }
    });

    this.subscribers.printAllHtmlOnStatus = this.resService.printAllHtmlOnStatus.subscribe((value) => {
      if (value !== undefined && value === 0) {
        this.printAllHtmlTagHandler();
      }
    });

    this.subscribers.status = this.resService.status.subscribe((value) => {
      if (this.tabIndex === value.tabIndex) {
        this.isResSort = value.data.isResSort;
        this.isReplaceRes = value.data.isReplaceRes;
        this.isMultiAnchor = value.data.isMultiAnchor;
        this.txtDataFilePath = value.data.txtPath;
        this.selectCount = value.data.selectCount;
        this.totalCount = value.data.totalCount;
        this.candi1Count = value.data.candi1Count;
        this.candi2Count = value.data.candi2Count;
        this.candi3Count = value.data.candi3Count;
        this.candi4Count = value.data.candi4Count;
      }
    });

    this.subscribers.btnAllSelCommand = this.resService.btnAllSelCommand.subscribe((value) => {
      if (value !== undefined && value === 'select') {
        this.resService.setSelectCommand({
          tabIndex: this.tabIndex,
          command: value,
          token: true,
        });
      }
    });

    electron.ipcRenderer.on('printAllHtmlMenuClick', (event) => {
      this.isIgnoreDivInclude = true;
      this.printAllHtmlTagHandler();
      this.isIgnoreDivInclude = false;
    });

    electron.ipcRenderer.on('printHtmlMenuClick', (event) => {
      this.isIgnoreDivInclude = true;
      this.printHtmlTagHandler();
      this.isIgnoreDivInclude = false;
    });
  }

  private setHotKeys() {
    // 全タブの出力
    if (this.settings.all_tab_shuturyoku !== undefined) {
      this.hotkeysService.add(new Hotkey(this.settings.all_tab_shuturyoku.toLowerCase(), (event: KeyboardEvent): boolean => {
        this.printAllHtmlTagHandler();
        return false;
      }));
    }
    // タブ出力
    if (this.settings.tab_shuturyoku !== undefined) {
      this.hotkeysService.add(new Hotkey(this.settings.tab_shuturyoku.toLowerCase(), (event: KeyboardEvent): boolean => {
        this.printHtmlTagHandler();
        return false;
      }));
    }

    // メンニュ1全タブ選択画面ON
    if (this.settings.all_tab_sentaku_on !== undefined) {
      this.hotkeysService.add(new Hotkey(this.settings.all_tab_sentaku_on.toLowerCase(), (event: KeyboardEvent): boolean => {
        this.btnSetAllSelectedHandler(null);
        return false;
      }));
    }

    // 全タブ選択画面OFF
    if (this.settings.zengamen_off !== undefined) {
      this.hotkeysService.add(new Hotkey(this.settings.zengamen_off.toLowerCase(), (event: KeyboardEvent): boolean => {
        this.btnSetAllUnselectedHandler(null);
        return false;
      }));
    }
  }

  /**
   * Unsubscribe the completed service subscribers
   */
  ngOnDestroy() {
    this.subscribers.LoadHiddenIds.unsubscribe();
    this.subscribers.settings.unsubscribe();
    this.subscribers.selectedTab.unsubscribe();
    this.subscribers.selectedRes.unsubscribe();
    this.subscribers.totalRes.unsubscribe();
    this.subscribers.printHtml.unsubscribe();
    this.subscribers.status.unsubscribe();
    this.subscribers.statusTimer.unsubscribe();
    this.subscribers.printHtmlOnStatus.unsubscribe();
    this.subscribers.printAllHtmlOnStatus.unsubscribe();
    this.subscribers.btnAllSelCommandSource.unsubscribe();
    this.subscribers.changeResCount.unsubscribe();
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event) {
    this.resService.saveSettings({
      dataFilePath: this.txtDataFilePath,
      remarkRes: this.txtRemarkRes,
      hideRes: this.txtHideRes,
      isResSort: this.isResSort,
      isMultiAnchor: this.isMultiAnchor,
      isReplaceRes: this.isReplaceRes,
      isContinuousAnchor: this.isContinuousAnchor,
      notMoveFutureAnchor: this.notMoveFutureAnchor,
      defaultDatFolderPath: this.loadDatPath,
      defaultStatusFolderPath: this.loadStatusPath,
      tMedia2MtmURL: this.gazouReplaceUrl
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

  loadResFromSpecialFile(txtSpecialFileReadPath) {
    if (txtSpecialFileReadPath.length > 0) {
      this.stop();
      this.resService.loadStatusFromSpecialFile(txtSpecialFileReadPath);
      this.start();
    }
  }

  getRemarkRes() {
    let remarkRes = this.txtRemarkRes;
    if (remarkRes.endsWith(';')) {
      remarkRes = remarkRes.substr(0, remarkRes.length - 1);
    }
    remarkRes = remarkRes.replace(/;/gi, '|');
    return remarkRes;
  }

  getHideRes() {
    let hideRes = this.txtHideRes;
    if (hideRes.endsWith(';')) {
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
    for (let i = 0; i < this.hiddenIds.length; i++) {
      if (this.hiddenIds[i] === id) {
        this.hiddenIds.splice(i, 1);
        exists = true;
        break;
      }
    }
    if (exists) {
      this.cdRef.detectChanges();
      this.resService.removeHiddenIds({
        hiddenIds: this.hiddenIds,
        tabIndex: this.tabIndex,
        token: true
      });
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
      command: this.selectCommand === 'cancel-allselect-1' ? 'cancel-allselect' : this.selectCommand,
      token: true,
    });
    this.selectCommand = '';
  }

  btnAllSelSideBarClickHandler() {
    this.resService.setSelectCommand({
      tabIndex: this.tabIndex,
      command: this.selectCommandWithButton,
      token: true,
    });
    this.selectCommandWithButton = '';
  }

  setDefaultPathHandler(dataIndex) {
    this.txtDataFilePath = this.settings.defaultPath[dataIndex];
  }

  printHtmlTagHandler() {
    this.resService.setPrintCommand({
      tabIndex: this.tabIndex,
      isReplaceName: this.isReplaceName,
      isSurroundImage: this.isSurroundImage && !this.isIgnoreDivInclude,
      gazouReplaceUrl: this.gazouReplaceUrl,
      token: true
    });
  }

  printAllHtmlTagHandler() {
    this.resService.setPrintAllCommand({
      isOutputCandiBelow: this.isOutputCandiBelow,
      isReplaceName: this.isReplaceName,
      isSurroundImage: this.isSurroundImage && !this.isIgnoreDivInclude,
      gazouReplaceUrl: this.gazouReplaceUrl,
      token: true
    });
  }

  saveCurrentRes() {
    electron.remote.dialog.showSaveDialog(null, {
      title: 'レス状態保存',
      filters: [{name: '状態保存パイル', extensions: ['txt']}]
    }).then(result => {
      if (!result.canceled) {
        let filePath;
        if (!result.filePath.endsWith('.txt')) {
          filePath = result.filePath + '.txt';
        } else {
          filePath = result.filePath;
        }
        this.saveAppStatus(filePath, true);
      }
    }).catch(err => {
      console.log(err);
    });
  }

  saveAppStatus(selectedPath, isMessage) {
    if (this.isSaveOfLoadFile) {
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
        showMessage: isMessage,
        selectCount: this.selectCount,
        totalCount: this.totalCount,
        candi1Count: this.candi1Count,
        candi2Count: this.candi2Count,
        candi3Count: this.candi3Count,
        candi4Count: this.candi4Count,
        candi5Count: this.candi5Count,
        candi6Count: this.candi6Count,
        candi7Count: this.candi7Count,
        candi8Count: this.candi8Count,
        isSaveOfLoadFile: this.isSaveOfLoadFile
      });
    }
  }


  loadCurrentRes() {
    electron.remote.dialog.showOpenDialog(null, {
      title: 'レス状態復元',
      properties: ['openFile', 'multiSelections'],
      defaultPath: this.loadStatusPath,
      filters: [{name: '復元パイル', extensions: ['txt']}]
    }).then(result => {
      if (!result.canceled) {
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
      if (!result.canceled) {
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
    this.resService.setAllResMenu({
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

  btnSinshukuCancelResHandler() {
    if (this.sinshukuCancelCommand === 'num-cancel-shinshuku') {
      this.resService.setCancelSinshuku({
        tabIndex: this.tabIndex,
        token: true
      });
    }
    this.sinshukuCancelCommand = '';
  }

  btnSetAllSelectedHandler($event) {
    this.resService.setDisplayAllSelectedRes({
      display: true,
      token: true
    });
  }

  btnSetAllUnselectedHandler($event) {
    this.resService.setDisplayAllSelectedRes({
      display: false,
      token: true
    });
  }

  btnLoadDefaultFiles() {
    const remarkRes = this.getHideRes();
    const hideRes = this.getHideRes();
    this.loadDatPath = this.settings.defaultPath[0];
    this.stop();
    this.resService.loadMultiRes(this.settings.defaultPath, this.isResSort, this.isMultiAnchor && this.isResSort,
      this.isReplaceRes, this.isContinuousAnchor && this.isMultiAnchor && this.isResSort,
      this.notMoveFutureAnchor, remarkRes, hideRes);
    this.start();
  }
}
