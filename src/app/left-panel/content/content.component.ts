import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, ElementRef, EventEmitter,
  Input, OnDestroy,
  OnInit, Output, QueryList,
  ViewChild, ViewChildren
} from '@angular/core';
import {CdkDragDrop, CdkDragStart, moveItemInArray} from '@angular/cdk/drag-drop';
import {ResItem} from '../../models/res-item';
import {ResService} from '../../res.service';
import {VirtualScrollerComponent} from 'ngx-virtual-scroller';
import {MatButtonToggle} from '@angular/material/button-toggle';
import {Hotkey, HotkeysService} from 'angular2-hotkeys';
import {TypeaheadMatch} from 'ngx-bootstrap/typeahead';



declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() tabName = 'New Tab';
  @Input() resList: ResItem[];
  @Input() tabIndex;
  @Input() hiddenIds: string[];
  private selectedResIndex;
  @ViewChild('resListContainer') virtualScroller: VirtualScrollerComponent;
  @ViewChild('btnNotice') btnNotice: MatButtonToggle;
  @ViewChild('txtSearch') txtSearch: ElementRef;
  @ViewChild('btnTreeSearch') btnTreeSearch: ElementRef;
  @ViewChild('btnSearch') btnSearch: ElementRef;
  @ViewChildren('resViews')
  public resViews: QueryList<any>;

  hovered: number;
  draggable: number;
  @Input() backgroundColors;
  @Input() hovergroundColors;
  @Input() characterColors;
  @Input() leftBorder;
  @Input() resLeftMargin;
  @Input() topBorder;
  @Input() idStyles;
  @Input() resSizeList;
  @Input() hitColor;
  @Input() idRed;
  @Input() noticeCount;
  @Input() shuturyoku;
  @Input() resMouseClick;
  @Input() youtube;
  @Input() twitter;
  @Input() subHotKeys;
  @Input() btnBackgroundColors;
  @Input() leftHightlight;
  @Input()
  public allTabCount: any;
  @Output() filteredEmitter = new EventEmitter();
  @Output() searchStatusEmitter = new EventEmitter();
  @Output() scrollIndexEmitter = new EventEmitter();
  @Output() searchListEmitter = new EventEmitter();
  @Output() changeListEmitter = new EventEmitter();
  @Output() changeListStatusEmitter = new EventEmitter();
  @Output() changeUrlEmitter = new EventEmitter();
  @Output() selectAllEmitter = new EventEmitter();
  @Output() searchAllEmitter = new EventEmitter();
  @Output() changeResCountEmitter = new EventEmitter();
  @Output() finishedRenderEmitter = new EventEmitter();
  @Input() searchOption;
  @Input() searchKeyword = '';
  @Input() moveOption;
  @Input() txtRemarkRes;
  @Input() resTopBar;
  @Input() imageWidth;
  @Input() startAbbreviations;
  @Input() endAbbreviations;
  @Input() searchWordMax;
  @Input() searchList = [];
  @Input() cancelAllColor;
  @Input() isTwitterUrl: boolean;
  @Input() isYoutubeUrl: boolean;
  @Input() txtURL: string;
  @Input() replaceName: string;
  @Input() replacedName: string;
  @Input() selectCommandWithHeader: string;
  @Input() isReplaceStatusFile: boolean;
  @Input() statusFilePath: string;
  @Input() insertPrefix: string;
  @Input() insertSuffix: string;
  @Input() suffixNumber: string;
  @Input() titleUrl: any;
  @Input()
  public isCancelAllAction: boolean;
  @Input()
  public isSelectAllAction: boolean;


  public subscribers: any = {};
  private isChangedSearch: boolean;
  private searchedRes: number;
  private startInRes: number;
  highLightColor = '#ff9632';
  selectCount: number;
  candi1Count: number;
  candi2Count: number;
  candi3Count: number;
  candi4Count: number;
  candi5Count: number;
  candi6Count: number;
  candi7Count: number;
  candi8Count: number;
  currentScrollIndex: number;
  originalResList: ResItem[];
  isTreeSearch: boolean;
  isSelectRes: boolean;
  private isKeyPressed: boolean;
  private searchedFiled: number;
  private isBackup: boolean;
  isSaveStatus: boolean;
  public isSearched: boolean;
  public isSearchChecked: boolean;
  public searchAllStatus;
  private isCancelOtherAction: boolean;

  constructor(private cdRef: ChangeDetectorRef, private resService: ResService, private hotkeysService: HotkeysService) {
    this.hiddenIds = [];
    this.hovered = -1;
    this.subHotKeys = [];
    this.isChangedSearch = true;
    this.searchedRes = 0;
    this.searchedFiled = 0;
    this.selectCount = 0;
    this.candi1Count = 0;
    this.candi2Count = 0;
    this.candi3Count = 0;
    this.candi4Count = 0;
    this.candi5Count = 0;
    this.candi6Count = 0;
    this.candi7Count = 0;
    this.candi8Count = 0;
    this.currentScrollIndex = 0;
    this.isBackup = true;
    this.isSaveStatus = false;
    this.isSearchChecked = false;
    this.isSelectRes = false;
  }

  ngOnInit(): void {
    this.isTreeSearch = true;
    this.isSearched = false;
    this.originalResList = [];
    this.searchAllStatus = 0;
    this.isCancelOtherAction = false;

    setTimeout(this.setSaveStatus.bind(this), 2000);

    this.subscribers.LoadHiddenIds = this.resService.loadRemoveHideIds.subscribe((value) => {
      if (value.token === true && this.tabIndex === value.tabIndex) {
        this.hiddenIds = value.hiddenIds;
        this.hideResList();
        value.token = false;
      }
      this.cdRef.detectChanges();
    });

    this.subscribers.selectedRes = this.resService.selectedRes.subscribe((value) => {
      if (this.tabIndex === value.tabIndex) {
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
      }
    });

    this.subscribers.moveRes = this.resService.moveRes.subscribe((value) => {
      if (value.tabIndex === this.tabIndex) {
        this.moveScroller(value.moveKind);
      }
    });

    this.subscribers.selectCommand = this.resService.selectCommand.subscribe((value) => {
      if (value.tabIndex === this.tabIndex && value.token) {
        this.multiSelection(value.command);
        value.token = false;
      }
    });

    this.subscribers.selectedTab = this.resService.selectedTab.subscribe((value) => {
      if (value.tabIndex === this.tabIndex) {
        this.tabIndex = value.tabIndex;
        // this.resList = value.resList;
        this.setHotKeys();
      }
    });

    this.subscribers.printCommand = this.resService.printCommand.subscribe((value) => {
      if (value.tabIndex === this.tabIndex && value.token) {
        this.printHtmlTag(value.isReplaceName, value.isSurroundImage, value.gazouReplaceUrl);
      }
    });

    this.subscribers.saveResStatus = this.resService.saveResStatus.subscribe((value) => {

      if ((value.tabIndex === this.tabIndex || value.isAllTabSave) && this.resList.length > 0 && value.token && this.isSaveStatus) {
        const saveData = value;
        saveData.resList = [];

        if (!value.isSaveOfLoadFile) {
          return;
        }

        if (value.isAllTabSave) {
          const fileName = this.tabName.replace(/[\\\/:*?"<>|]/gm, '');
          saveData.filePath = `${value.autoFilePath}${fileName}.txt`;
        }
        if (this.isReplaceStatusFile && this.statusFilePath.length > 0) {
          saveData.filePath = this.statusFilePath;
        }
        let saveResList = [];
        if (this.isSearchChecked || this.btnNotice.checked || this.isSelectRes) {
          saveResList = this.originalResList;
        } else {
          saveResList = this.resList;
        }

        if (saveResList.filter(i => i.resSelect === 'select'
            || i.resSelect === 'candi1'
            || i.resSelect === 'candi2'
            || i.resSelect === 'candi3'
            || i.resSelect === 'candi4'
            || i.resSelect === 'candi5'
            || i.resSelect === 'candi6'
            || i.resSelect === 'candi7'
            || i.resSelect === 'candi8').length < 1) {
          return;
        }
        for (const res of saveResList) {
          const resItem = Object.assign({}, res);
          resItem.resColor = this.characterColors.indexOf(res.resColor) === -1 ? 0 : this.characterColors.indexOf(res.resColor) + 1;

          if (this.resSizeList[0].value === res.resFontSize) {
            resItem.resFontSize = '1';
          } else if (this.resSizeList[1].value === res.resFontSize) {
            resItem.resFontSize = '2';
          } else if (this.resSizeList[2].value === res.resFontSize) {
            resItem.resFontSize = '3';
          }
          resItem.resBackgroundColor = this.backgroundColors.indexOf(res.resBackgroundColor) === -1 ? 0 :
            this.backgroundColors.indexOf(res.resBackgroundColor);
          resItem.resHovergroundColor = this.hovergroundColors.indexOf(res.resHovergroundColor) === -1 ? 0 :
            this.hovergroundColors.indexOf(res.resHovergroundColor);
          if (this.idStyles[0].color === res.idColor) {
            resItem.idColor = '0';
            resItem.idBackgroundColor = '0';
          } else if (this.idStyles[1].color === res.idColor) {
            resItem.idColor = '1';
            resItem.idBackgroundColor = '1';
          } else if (this.idStyles[2].color === res.idColor) {
            resItem.idColor = '2';
            resItem.idBackgroundColor = '2';
          } else if (this.idStyles[3].color === res.idColor) {
            resItem.idColor = '3';
            resItem.idBackgroundColor = '3';
          }

          saveData.resList.push(resItem);
        }
        saveData.title = this.tabName;
        saveData.txtUrl = this.txtURL;
        saveData.scrollIndex = this.virtualScroller.viewPortInfo.startIndex;
        this.resService.saveStatus(saveData);
        if (!value.isAllTabSave) {
          value.token = false;
        }
      }
    });

    this.subscribers.status = this.resService.status.subscribe((value) => {
      if (this.tabIndex === value.tabIndex) {
        this.selectCount = value.data.selectCount;
        this.candi1Count = value.data.candi1Count;
        this.candi2Count = value.data.candi2Count;
        this.candi3Count = value.data.candi3Count;
        this.candi4Count = value.data.candi4Count;
        this.candi5Count = value.data.candi5Count;
        this.candi6Count = value.data.candi6Count;
        this.candi7Count = value.data.candi7Count;
        this.candi8Count = value.data.candi8Count;
      }
    });

    this.subscribers.resMenu = this.resService.resMenu.subscribe((value) => {
      if (this.tabIndex === value.tabIndex && value.token) {
        this.setResMenu(value.resMenu);
        value.token = false;
      }
    });

    this.subscribers.sortRes = this.resService.sortRes.subscribe((value) => {
      if (this.tabIndex === value.tabIndex && value.token) {
        this.resList.sort((a, b) => {
          return a.num - b.num;
        });
        this.cdRef.detectChanges();
        value.token = false;
      }
    });

    this.subscribers.cancelSinshuku = this.resService.cancelSinshuku.subscribe((value) => {
      if (this.tabIndex === value.tabIndex && value.token) {
        this.resList.forEach(res => {
          res.isCollapsed = false;
        });
        this.cdRef.detectChanges();
        value.token = false;
      }
    });

  }

  /**
   * Unsubscribe the completed service subscribers
   */
  ngOnDestroy() {
    this.subscribers.LoadHiddenIds.unsubscribe();
    this.subscribers.moveRes.unsubscribe();
    this.subscribers.selectCommand.unsubscribe();
    this.subscribers.selectedTab.unsubscribe();
    this.subscribers.printCommand.unsubscribe();
    this.subscribers.saveResStatus.unsubscribe();
    this.subscribers.status.unsubscribe();
    this.subscribers.resMenu.unsubscribe();
    this.subscribers.sortRes.unsubscribe();
    this.subscribers.cancelSinshuku.unsubscribe();
    this.resList.length = 0;

    if (this.originalResList !== undefined) {
      this.originalResList.length = 0;
    }
  }

  ngAfterViewInit() {

    this.resViews.changes.subscribe(t => {
      if (!this.originalResList.length) {
        this.originalResList = [...this.resList];
      }
      this.finishedRenderEmitter.emit();
    });
  }

  setSaveStatus() {
    this.isSaveStatus = true;
    this.cdRef.detectChanges();
  }

  /**
   * ショートカットキー値を設定します。
   */
  setHotKeys() {
    // 選択ボタン
    if (this.subHotKeys.hasOwnProperty('sentaku_no1')) {
      this.hotkeysService.add(new Hotkey([this.subHotKeys.sentaku_no1,
        this.subHotKeys.sentaku_no2, this.subHotKeys.sentaku_no3], (event: KeyboardEvent): boolean => {
        this.reverseHoveredRes(true);
        return false;
      }));

      this.hotkeysService.add(new Hotkey([this.subHotKeys.sentaku_off1, this.subHotKeys.sentaku_off2], (event: KeyboardEvent): boolean => {
        this.deSelectHoveredRes(true);
        return false;
      }));

      // 予備選択ボタン1
      this.hotkeysService.add(new Hotkey(this.subHotKeys.yobi1, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          if (this.resList[this.hovered].resSelect === 'candi1') {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[0];
            this.selectedRes(this.resList[this.hovered],
              {selected: 'none'});
          } else {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[2];
            this.selectedRes(this.resList[this.hovered],
              {selected: 'candi1'});
          }
        }
        return false;
      }));

      // 予備選択ボタン2
      this.hotkeysService.add(new Hotkey(this.subHotKeys.yobi2, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          if (this.resList[this.hovered].resSelect === 'candi2') {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[0];
            this.selectedRes(this.resList[this.hovered],
              {selected: 'none'});
          } else {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[3];
            this.selectedRes(this.resList[this.hovered],
              {selected: 'candi2'});
          }
        }
        return false;
      }));

      // 予備選択ボタン3
      this.hotkeysService.add(new Hotkey(this.subHotKeys.yobi3, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          if (this.resList[this.hovered].resSelect === 'candi3') {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[0];
            this.selectedRes(this.resList[this.hovered],
              {selected: 'none'});
          } else {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[4];
            this.selectedRes(this.resList[this.hovered],
              {selected: 'candi3'});
          }
        }
        return false;
      }));

      // 予備選択ボタン4
      this.hotkeysService.add(new Hotkey(this.subHotKeys.yobi4, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          if (this.resList[this.hovered].resSelect === 'candi4') {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[0];
            this.selectedRes(this.resList[this.hovered],
              {selected: 'none'});
          } else {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[5];
            this.selectedRes(this.resList[this.hovered],
              {selected: 'candi4'});
          }
        }
        return false;
      }));

      // 予備選択ボタン5
      this.hotkeysService.add(new Hotkey(this.subHotKeys.yobi5, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          if (this.resList[this.hovered].resSelect === 'candi5') {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[0];
            this.selectedRes(this.resList[this.hovered],
              {selected: 'none'});
          } else {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[6];
            this.selectedRes(this.resList[this.hovered],
              {selected: 'candi5'});
          }
        }
        return false;
      }));

      // 予備選択ボタン6
      this.hotkeysService.add(new Hotkey(this.subHotKeys.yobi6, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          if (this.resList[this.hovered].resSelect === 'candi6') {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[0];
            this.selectedRes(this.resList[this.hovered],
              {selected: 'none'});
          } else {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[7];
            this.selectedRes(this.resList[this.hovered],
              {selected: 'candi6'});
          }
        }
        return false;
      }));

      // 予備選択ボタン7
      this.hotkeysService.add(new Hotkey(this.subHotKeys.yobi7, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          if (this.resList[this.hovered].resSelect === 'candi7') {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[0];
            this.selectedRes(this.resList[this.hovered],
              {selected: 'none'});
          } else {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[8];
            this.selectedRes(this.resList[this.hovered],
              {selected: 'candi7'});
          }
        }
        return false;
      }));

      // 予備選択ボタン8
      this.hotkeysService.add(new Hotkey(this.subHotKeys.yobi8, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          if (this.resList[this.hovered].resSelect === 'candi8') {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[0];
            this.selectedRes(this.resList[this.hovered],
              {selected: 'none'});
          } else {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[9];
            this.selectedRes(this.resList[this.hovered],
              {selected: 'candi8'});
          }
        }
        return false;
      }));

      // ↑ ボタン
      this.hotkeysService.add(new Hotkey(this.subHotKeys.up, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.moveUpRes(this.resList[this.hovered]);
          this.cdRef.detectChanges();
        }
        return false;
      }));

      // ↓ ボタン
      this.hotkeysService.add(new Hotkey(this.subHotKeys.down, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.moveDownRes(this.resList[this.hovered]);
          this.cdRef.detectChanges();
        }
        return false;
      }));

      // 小
      this.hotkeysService.add(new Hotkey(this.subHotKeys.big0, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resFontSize = this.resSizeList[0].value;
          this.cdRef.detectChanges();
        }
        return false;
      }));

      // 中
      this.hotkeysService.add(new Hotkey(this.subHotKeys.big1, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resFontSize = this.resSizeList[1].value;
          this.cdRef.detectChanges();
        }
        return false;
      }));

      // 大
      this.hotkeysService.add(new Hotkey(this.subHotKeys.big2, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resFontSize = this.resSizeList[2].value;
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      // なし
      this.hotkeysService.add(new Hotkey(this.subHotKeys.nasi, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resColor = '#000';
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      // 色1
      this.hotkeysService.add(new Hotkey(this.subHotKeys.color1, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resColor = this.characterColors[0];
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      // 色2
      this.hotkeysService.add(new Hotkey(this.subHotKeys.color2, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resColor = this.characterColors[1];
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      // 色3
      this.hotkeysService.add(new Hotkey(this.subHotKeys.color3, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resColor = this.characterColors[2];
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      // 色4
      this.hotkeysService.add(new Hotkey(this.subHotKeys.color4, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resColor = this.characterColors[3];
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      // 色5
      this.hotkeysService.add(new Hotkey(this.subHotKeys.color5, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resColor = this.characterColors[4];
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      // 色6
      this.hotkeysService.add(new Hotkey(this.subHotKeys.color6, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resColor = this.characterColors[5];
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      // 色7
      this.hotkeysService.add(new Hotkey(this.subHotKeys.color7, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resColor = this.characterColors[6];
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      // 色8
      this.hotkeysService.add(new Hotkey(this.subHotKeys.color8, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resColor = this.characterColors[7];
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      // 色9
      this.hotkeysService.add(new Hotkey(this.subHotKeys.color9, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resColor = this.characterColors[8];
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      // 色10
      this.hotkeysService.add(new Hotkey(this.subHotKeys.color10, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resColor = this.characterColors[9];
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      // ツリー選択（T選択）
      this.hotkeysService.add(new Hotkey(this.subHotKeys.tree_sentaku, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedTreeRes(this.hovered, {select: 1, resBackgroundColor: this.backgroundColors[1]});
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      // ツリー予備選択1（T1）
      this.hotkeysService.add(new Hotkey(this.subHotKeys.tree_yobi1, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedTreeRes(this.hovered, {select: 2, resBackgroundColor: this.backgroundColors[2]});
          this.cdRef.detectChanges();
        }
        return false;
      }));

      // ツリー予備選択2（T2）
      this.hotkeysService.add(new Hotkey(this.subHotKeys.tree_yobi2, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedTreeRes(this.hovered, {select: 3, resBackgroundColor: this.backgroundColors[3]});
          this.cdRef.detectChanges();
        }
        return false;
      }));

      // ツリー予備選択3（T3）
      this.hotkeysService.add(new Hotkey(this.subHotKeys.tree_yobi3, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedTreeRes(this.hovered, {select: 4, resBackgroundColor: this.backgroundColors[4]});
          this.cdRef.detectChanges();
        }
        return false;
      }));

      // ツリー予備選択4（T4）
      this.hotkeysService.add(new Hotkey(this.subHotKeys.tree_yobi4, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedTreeRes(this.hovered, {select: 5, resBackgroundColor: this.backgroundColors[5]});
          this.cdRef.detectChanges();
        }
        return false;
      }));

      // ツリー予備選択5（T5）
      this.hotkeysService.add(new Hotkey(this.subHotKeys.tree_yobi5, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedTreeRes(this.hovered, {select: 6, resBackgroundColor: this.backgroundColors[6]});
          this.cdRef.detectChanges();
        }
        return false;
      }));

      // ツリー予備選択6（T6）
      this.hotkeysService.add(new Hotkey(this.subHotKeys.tree_yobi6, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedTreeRes(this.hovered, {select: 7, resBackgroundColor: this.backgroundColors[7]});
          this.cdRef.detectChanges();
        }
        return false;
      }));

      // ツリー予備選択7（T7）
      this.hotkeysService.add(new Hotkey(this.subHotKeys.tree_yobi7, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedTreeRes(this.hovered, {select: 8, resBackgroundColor: this.backgroundColors[8]});
          this.cdRef.detectChanges();
        }
        return false;
      }));

      // ツリー予備選択8（T4）
      this.hotkeysService.add(new Hotkey(this.subHotKeys.tree_yobi8, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedTreeRes(this.hovered, {select: 9, resBackgroundColor: this.backgroundColors[9]});
          this.cdRef.detectChanges();
        }
        return false;
      }));

      // ツリー解除（T解除）
      this.hotkeysService.add(new Hotkey(this.subHotKeys.tree_kaijo, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedTreeRes(this.hovered, {select: 0, resBackgroundColor: this.backgroundColors[0]});
          this.cdRef.detectChanges();
        }
        return false;
      }));

      // ID選択1
      this.hotkeysService.add(new Hotkey(this.subHotKeys.id1, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedId(this.resList[this.hovered].id,
            {
              isSelect: true,
              idColor: this.idStyles[1].color,
              idBackgroundColor: this.idStyles[1].background,
              resBackgroundColor: this.backgroundColors[1],
              idClassNoSelect: this.idStyles[1].classNoSelect
            });
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      // ID選択2
      this.hotkeysService.add(new Hotkey(this.subHotKeys.id2, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedId(this.resList[this.hovered].id,
            {
              isSelect: true,
              idColor: this.idStyles[2].color,
              idBackgroundColor: this.idStyles[2].background,
              resBackgroundColor: this.backgroundColors[1],
              idClassNoSelect: this.idStyles[2].classNoSelect
            });
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      // ID選択3
      this.hotkeysService.add(new Hotkey(this.subHotKeys.id3, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedId(this.resList[this.hovered].id,
            {
              isSelect: true,
              idColor: this.idStyles[3].color,
              idBackgroundColor: this.idStyles[3].background,
              resBackgroundColor: this.backgroundColors[1],
              idClassNoSelect: this.idStyles[3].classNoSelect
            });
          this.cdRef.detectChanges();
        }
        return false;
      }));

      // ID選択4
      this.hotkeysService.add(new Hotkey(this.subHotKeys.id4, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedId(this.resList[this.hovered].id,
            {
              isSelect: true,
              idColor: this.idStyles[4].color,
              idBackgroundColor: this.idStyles[4].background,
              resBackgroundColor: this.backgroundColors[1],
              idClassNoSelect: this.idStyles[4].classNoSelect
            });
          this.cdRef.detectChanges();
        }
        return false;
      }));

      // ID色選択1
      this.hotkeysService.add(new Hotkey(this.subHotKeys.id_iro1, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedId(this.resList[this.hovered].id,
            {
              isSelect: false,
              idColor: this.idStyles[1].color,
              idBackgroundColor: this.idStyles[1].background,
              idClassNoSelect: this.idStyles[1].classNoSelect
            });
          this.cdRef.detectChanges();
        }
        return false;
      }));

      // ID色選択2
      this.hotkeysService.add(new Hotkey(this.subHotKeys.id_iro2, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedId(this.resList[this.hovered].id,
            {
              isSelect: false,
              idColor: this.idStyles[2].color,
              idBackgroundColor: this.idStyles[2].background,
              idClassNoSelect: this.idStyles[2].classNoSelect
            });
          this.cdRef.detectChanges();
        }
        return false;
      }));

      // ID色選択3
      this.hotkeysService.add(new Hotkey(this.subHotKeys.id_iro3, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedId(this.resList[this.hovered].id,
            {
              isSelect: false,
              idColor: this.idStyles[3].color,
              idBackgroundColor: this.idStyles[3].background,
              idClassNoSelect: this.idStyles[3].classNoSelect
            });
          this.cdRef.detectChanges();
        }
        return false;
      }));

      // ID色選択4
      this.hotkeysService.add(new Hotkey(this.subHotKeys.id_iro4, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedId(this.resList[this.hovered].id,
            {
              isSelect: false,
              idColor: this.idStyles[4].color,
              idBackgroundColor: this.idStyles[4].background,
              idClassNoSelect: this.idStyles[4].classNoSelect
            });
          this.cdRef.detectChanges();
        }
        return false;
      }));

      // ID解除
      this.hotkeysService.add(new Hotkey(this.subHotKeys.id_kaijo, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.cancelSelectedIdRes(this.resList[this.hovered].id, event);
        }
        return false;
      }));

      // ID色消
      this.hotkeysService.add(new Hotkey(this.subHotKeys.id_irokesi, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedId(this.resList[this.hovered].id,
            {
              isSelect: false,
              idColor: this.idStyles[0].color,
              idBackgroundColor: this.idStyles[0].background,
              resBackgroundColor: this.backgroundColors[0],
              idClassNoSelect: this.idStyles[0].classNoSelect
            });
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      // ID解除＆ID色消
      this.hotkeysService.add(new Hotkey(this.subHotKeys.id_kaijo_irokesi, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.cancelSelectedIdRes(this.resList[this.hovered].id, event);
          this.selectedId(this.resList[this.hovered].id,
            {
              isSelect: false,
              idColor: this.idStyles[0].color,
              idBackgroundColor: this.idStyles[0].background,
              resBackgroundColor: this.backgroundColors[0],
              idClassNoSelect: this.idStyles[0].classNoSelect
            });
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      // 非表示（ID非表示）
      this.hotkeysService.add(new Hotkey(this.subHotKeys.id_hihyouji, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.hideRes(this.resList[this.hovered].id);
        }
        return false; // Prevent bubbling
      }));

      // 編集
      this.hotkeysService.add(new Hotkey(this.subHotKeys.henshuu, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].isEdit = !this.resList[this.hovered].isEdit;
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      // 削除
      this.hotkeysService.add(new Hotkey(this.subHotKeys.sakujo, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.deleteRes(this.resList[this.hovered]);
        }
        return false; // Prevent bubbling
      }));

      // メニューの開閉
      this.hotkeysService.add(new Hotkey(this.subHotKeys.menu_kaihei, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          if (this.resList[this.hovered].isMenuOpen === undefined) {
            this.resList[this.hovered].isMenuOpen = true;
          } else {
            this.resList[this.hovered].isMenuOpen = !this.resList[this.hovered].isMenuOpen;
          }
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      // レスの一番上に移動
      this.hotkeysService.add(new Hotkey(this.subHotKeys.res_most_up, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          const item = this.resList[this.hovered];
          this.moveResToTop(item);
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      // レスの一番下に移動
      this.hotkeysService.add(new Hotkey(this.subHotKeys.res_most_down, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          const item = this.resList[this.hovered];
          this.moveResToBottom(item);
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      // 注目レス ON/OFF
      this.hotkeysService.add(new Hotkey(this.subHotKeys.chuumoku, (event: KeyboardEvent): boolean => {
        this.btnNotice.checked = !this.btnNotice.checked;
        this.btnNoticeChangeHandler();
        return false; // Prevent bubbling
      }));

      // 抽出解除
      this.hotkeysService.add(new Hotkey(this.subHotKeys.chuushutu_kaijo, (event: KeyboardEvent): boolean => {
        if (this.isSearchChecked) {
          this.isSearchChecked = false;
          this.searchChangeStatus();
        }
        return false; // Prevent bubbling
      }));

      // 選択レス表示
      this.hotkeysService.add(new Hotkey(this.subHotKeys.sentaku_res_gamen, (event: KeyboardEvent): boolean => {
        this.isSelectRes = !this.isSelectRes;
        this.btnShowSelectHandler();
        return false; // Prevent bubbling
      }));

      // 抽出
      this.hotkeysService.add(new Hotkey('ctrl+enter', (event: KeyboardEvent): boolean => {
        if (!this.isSearchChecked) {
          this.isSearchChecked = true;
          this.searchChangeStatus();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.chuushutu, (event: KeyboardEvent): boolean => {
          this.btnAbstractHandler();
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.chuushutu_chuushutukaijo, (event: KeyboardEvent): boolean => {
        this.btnAbstractAndCancelHandler();
        return false; // Prevent bubbling
      }));

      // 検索バーにフォーカス移動
      this.hotkeysService.add(new Hotkey('ctrl+f', (event: KeyboardEvent): boolean => {
        this.txtSearch.nativeElement.focus();
        this.txtSearch.nativeElement.select();
        return false; // Prevent bubbling
      }));

      // レス描写エリアの一番上に移動
      this.hotkeysService.add(new Hotkey(['ctrl+home', this.subHotKeys.res_area_move_top],
        (event: KeyboardEvent): boolean => {
          this.moveScroller('top');
          return false; // Prevent bubbling
        }));

      // レス描写エリアの一番下に移動
      this.hotkeysService.add(new Hotkey(['ctrl+end', this.subHotKeys.res_area_move_bottom], (event: KeyboardEvent): boolean => {
        this.moveScroller('bottom');
        return false; // Prevent bubbling
      }));

      // レス描写エリアの一番上に移動
      this.hotkeysService.add(new Hotkey(this.subHotKeys.res_area_move2a, (event: KeyboardEvent): boolean => {
        this.moveScroller('selected-top');
        return false; // Prevent bubbling
      }));

      // レス描写エリアの一番下に移動
      this.hotkeysService.add(new Hotkey(this.subHotKeys.res_area_move2b, (event: KeyboardEvent): boolean => {
        this.moveScroller('selected-bottom');
        return false; // Prevent bubbling
      }));

      // ↑選択
      this.hotkeysService.add(new Hotkey(this.subHotKeys.res_area_move1a, (event: KeyboardEvent): boolean => {
        this.moveScroller('selected-prev');
        return false; // Prevent bubbling
      }));

      // ↓選択
      this.hotkeysService.add(new Hotkey(this.subHotKeys.res_area_move1b, (event: KeyboardEvent): boolean => {
        this.moveScroller('selected-next');
        return false; // Prevent bubbling
      }));

      // 描写エリアを下に移動
      this.hotkeysService.add(new Hotkey('space', (event: KeyboardEvent): boolean => {
        this.virtualScroller.scrollToPosition(this.virtualScroller.viewPortInfo.scrollEndPosition);
        return false; // Prevent bubbling
      }));

      // 描写エリアを上に移動
      this.hotkeysService.add(new Hotkey('shift+space', (event: KeyboardEvent): boolean => {
        if (this.virtualScroller.viewPortInfo.scrollStartPosition !== 0) {
          this.virtualScroller.scrollToPosition(this.virtualScroller.viewPortInfo.scrollStartPosition -
            (this.virtualScroller.viewPortInfo.scrollEndPosition - this.virtualScroller.viewPortInfo.scrollStartPosition));
        }
        return false; // Prevent bubbling
      }));

      //
      this.hotkeysService.add(new Hotkey(this.subHotKeys.menu1, (event: KeyboardEvent): boolean => {
        this.setResMenu(1);
        return false; // Prevent bubbling
      }));

      //
      this.hotkeysService.add(new Hotkey(this.subHotKeys.menu2, (event: KeyboardEvent): boolean => {
        this.setResMenu(2);
        return false; // Prevent bubbling
      }));

      //
      this.hotkeysService.add(new Hotkey(this.subHotKeys.menu3, (event: KeyboardEvent): boolean => {
        this.setResMenu(3);
        return false; // Prevent bubbling
      }));

      // 挿入
      this.hotkeysService.add(new Hotkey(this.subHotKeys.sounyuu, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          const item = this.resList[this.hovered];
          this.insertRes(item);
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      //
      this.hotkeysService.add(new Hotkey(this.subHotKeys.res_sinshuku, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.setTreeMenuStatus();
        }
        return false;
      }));
    }
  }

  /**
   * Move the scroll of res list
   * @param moveKind: 'top', 'bottom', 'selected-top', 'selected-bottom'
   */
  moveScroller(moveKind: string) {

    switch (moveKind) {
      case 'top':
        this.virtualScroller.scrollToIndex(0);
        this.currentScrollIndex = 0;
        break;
      case 'bottom':
        this.virtualScroller.scrollToIndex(this.resList.length);
        this.currentScrollIndex = this.resList.length - 1;
        break;
      case 'selected-top':
        let index = 0;
        for (const item of this.resList) {
          if (item.resSelect === 'select'
            || (item.resSelect === 'candi1' && this.moveOption.sentaku_idou1)
            || (item.resSelect === 'candi2' && this.moveOption.sentaku_idou2)
            || (item.resSelect === 'candi3' && this.moveOption.sentaku_idou3)
            || (item.resSelect === 'candi4' && this.moveOption.sentaku_idou4)
            || (item.resSelect === 'candi5' && this.moveOption.sentaku_idou5)
            || (item.resSelect === 'candi6' && this.moveOption.sentaku_idou6)
            || (item.resSelect === 'candi7' && this.moveOption.sentaku_idou7)
            || (item.resSelect === 'candi8' && this.moveOption.sentaku_idou8)) {
            this.virtualScroller.scrollToIndex(index);
            this.currentScrollIndex = index;
            break;
          }
          index++;
        }

        break;
      case 'selected-bottom':
        if (this.resList.length > 0) {
          for (let i = this.resList.length - 1; i > 0; i--) {
            if (this.resList[i].resSelect === 'select'
              || (this.resList[i].resSelect === 'candi1' && this.moveOption.sentaku_idou1)
              || (this.resList[i].resSelect === 'candi2' && this.moveOption.sentaku_idou2)
              || (this.resList[i].resSelect === 'candi3' && this.moveOption.sentaku_idou3)
              || (this.resList[i].resSelect === 'candi4' && this.moveOption.sentaku_idou4)
              || (this.resList[i].resSelect === 'candi5' && this.moveOption.sentaku_idou5)
              || (this.resList[i].resSelect === 'candi6' && this.moveOption.sentaku_idou6)
              || (this.resList[i].resSelect === 'candi7' && this.moveOption.sentaku_idou7)
              || (this.resList[i].resSelect === 'candi8' && this.moveOption.sentaku_idou8)) {
              this.currentScrollIndex = i;
              this.virtualScroller.scrollToIndex(i);
              break;
            }
          }
        }
        break;
      case 'selected-prev':
        if (this.virtualScroller.viewPortInfo.startIndex >= 0) {
          for (let i = this.virtualScroller.viewPortInfo.startIndex - 1; i >= 0; i--) {
            if (this.resList[i].resSelect === 'select'
              || (this.resList[i].resSelect === 'candi1' && this.moveOption.sentaku_idou1)
              || (this.resList[i].resSelect === 'candi2' && this.moveOption.sentaku_idou2)
              || (this.resList[i].resSelect === 'candi3' && this.moveOption.sentaku_idou3)
              || (this.resList[i].resSelect === 'candi4' && this.moveOption.sentaku_idou4)
              || (this.resList[i].resSelect === 'candi5' && this.moveOption.sentaku_idou5)
              || (this.resList[i].resSelect === 'candi6' && this.moveOption.sentaku_idou6)
              || (this.resList[i].resSelect === 'candi7' && this.moveOption.sentaku_idou7)
              || (this.resList[i].resSelect === 'candi8' && this.moveOption.sentaku_idou8)) {
              this.virtualScroller.scrollToIndex(i);
              this.currentScrollIndex = i;
              break;
            }
          }
        }
        break;
      case 'selected-next':
        let curIndex;
        if (this.currentScrollIndex - 1 === this.virtualScroller.viewPortInfo.startIndex) {
          curIndex = this.currentScrollIndex + 1;
        } else {
          curIndex = this.virtualScroller.viewPortInfo.startIndex + 1;
        }

        for (let i = curIndex; i < this.resList.length; i++) {
          if (this.resList[i].resSelect === 'select'
            || (this.resList[i].resSelect === 'candi1' && this.moveOption.sentaku_idou1)
            || (this.resList[i].resSelect === 'candi2' && this.moveOption.sentaku_idou2)
            || (this.resList[i].resSelect === 'candi3' && this.moveOption.sentaku_idou3)
            || (this.resList[i].resSelect === 'candi4' && this.moveOption.sentaku_idou4)
            || (this.resList[i].resSelect === 'candi5' && this.moveOption.sentaku_idou5)
            || (this.resList[i].resSelect === 'candi6' && this.moveOption.sentaku_idou6)
            || (this.resList[i].resSelect === 'candi7' && this.moveOption.sentaku_idou7)
            || (this.resList[i].resSelect === 'candi8' && this.moveOption.sentaku_idou8)) {
            this.currentScrollIndex = i;
            this.virtualScroller.scrollToIndex(i);
            break;
          }
        }
        break;
    }
  }

  /**
   * drop event for moving res
   * @param event: cdkdragdrop
   */
  resDropHandler(event: CdkDragDrop<any[]>) {
    if (this.originalResList !== undefined) {
      const fromRes = this.resList[this.selectedResIndex];
      const fromIndex = this.originalResList.indexOf(fromRes);
      const toIndex = this.originalResList.indexOf(this.resList[this.selectedResIndex + (event.currentIndex - event.previousIndex)]);
      moveItemInArray(this.originalResList, fromIndex, toIndex);
    }
    moveItemInArray(this.resList, this.selectedResIndex,
      this.selectedResIndex + (event.currentIndex - event.previousIndex));
  }

  /**
   * store drag started res index
   * @param $event: event
   * @param item: started res
   */
  resDragStartedHandler($event: CdkDragStart, item) {
    this.selectedResIndex = this.resList.indexOf(item);
  }

  /**
   * レスを複製します。
   * @param item: 複製レス
   */
  duplicateRes(item: any) {
    const index = this.resList.indexOf(item);
    const cloneItem = Object.assign({}, item);
    this.insertResToList(index, cloneItem);
  }

  /**
   * IDを非表示します。
   * @param resId:非表示ID
   */
  hideRes(resId: string) {
    this.hiddenIds = [...this.hiddenIds, resId];
    this.hideResList();
    this.resService.setHiddenIds(this.hiddenIds);
  }

  hideResList() {
    if (this.originalResList.length === 0) {
      this.originalResList = [...this.resList];
    }
    for (const res of this.originalResList) {
      res.isShow = this.hiddenIds.indexOf(res.id) === -1;
    }

    this.resList = [...this.originalResList.filter(item => item.isShow)];
    this.changeListStatusEmitter.emit({
      tabIndex: this.tabIndex,
      resList: this.resList,
      hiddenIds: this.hiddenIds
    });

    this.resService.setTotalRes({
      tabIndex: this.tabIndex,
      totalCount: this.resList.length,
      title: this.tabName,
      rightToken: true,
      statusToken: true
    });
    this.cdRef.detectChanges();
  }

  /**
   * 上に移動します。
   * @param item: 移動レス
   */
  moveUpRes(item: any) {
    const index = this.resList.indexOf(item);
    moveItemInArray(this.resList, index, index - 1);
    if (this.originalResList !== undefined) {
      const indexOrigin = this.originalResList.indexOf(item);
      moveItemInArray(this.originalResList, indexOrigin, indexOrigin - 1);
    }
  }

  /**
   * 下に移動します。
   * @param item: 移動レス
   */
  moveDownRes(item: any) {
    const index = this.resList.indexOf(item);
    moveItemInArray(this.resList, index, index + 1);
    if (this.originalResList !== undefined) {
      const indexOrigin = this.originalResList.indexOf(item);
      moveItemInArray(this.originalResList, indexOrigin, indexOrigin + 1);
    }
  }

  /**
   * レスを一番上に移動
   * @param item: 移動レス
   */
  moveResToTop(item: any) {
    const index = this.resList.indexOf(item);
    const startIndex = this.virtualScroller.viewPortInfo.startIndex + 1;
    moveItemInArray(this.resList, index, 0);
    if (this.originalResList !== undefined) {
      const indexOrigin = this.originalResList.indexOf(item);
      moveItemInArray(this.originalResList, indexOrigin, 0);
    }
    this.virtualScroller.scrollToIndex(startIndex);
  }

  /**
   * レスを一番下に移動
   * @param item: 移動レス
   */
  moveResToBottom(item: any) {
    const index = this.resList.indexOf(item);
    const tmpRes = Object.assign({}, item);
    const startIndex = this.virtualScroller.viewPortInfo.startIndex;
    this.resList.splice(index, 1);
    this.resList.push(tmpRes);
    if (this.btnNotice.checked || this.isSearchChecked || this.isSelectRes) {
      const indexOrigin = this.originalResList.indexOf(item);
      this.originalResList.splice(indexOrigin, 1);
      this.originalResList = [...this.originalResList, tmpRes];
      this.changeListEmitter.emit({
        tabIndex: this.tabIndex,
        resList: this.originalResList,
      });
    }
    this.virtualScroller.scrollToIndex(startIndex);
  }

  /**
   * レスを選択
   * @param item: 選択レス
   * @param $event: event
   */
  selectedRes(item: any, $event: any) {
    item.resSelect = $event.selected;
    this.changeStatus();
    this.cdRef.detectChanges();
  }

  cancelSelectedIdRes(id: any, $event: any) {
    for (const res of this.resList) {
      if (res.id === id && res.resSelect !== 'none') {
        res.resBackgroundColor = this.backgroundColors[0];
        res.resSelect = 'none';
      }
    }
    if (this.btnNotice.checked || this.isSearchChecked || this.isSelectRes) {
      for (const res of this.originalResList) {
        if (res.id === id && res.resSelect !== 'none') {
          res.resBackgroundColor = this.backgroundColors[0];
          res.resSelect = 'none';
        }
      }
    }
    this.changeStatus();
  }

  private changeStatus() {
    this.selectCount = this.originalResList.filter(item => item.resSelect === 'select').length;
    this.candi1Count = this.originalResList.filter(item => item.resSelect === 'candi1').length;
    this.candi2Count = this.originalResList.filter(item => item.resSelect === 'candi2').length;
    this.candi3Count = this.originalResList.filter(item => item.resSelect === 'candi3').length;
    this.candi4Count = this.originalResList.filter(item => item.resSelect === 'candi4').length;
    this.candi5Count = this.originalResList.filter(item => item.resSelect === 'candi5').length;
    this.candi6Count = this.originalResList.filter(item => item.resSelect === 'candi6').length;
    this.candi7Count = this.originalResList.filter(item => item.resSelect === 'candi7').length;
    this.candi8Count = this.originalResList.filter(item => item.resSelect === 'candi8').length;

    this.cdRef.detectChanges();
    this.changeResCountEmitter.emit();

    this.resService.setSelectedRes({
      select: this.selectCount,
      candi1: this.candi1Count,
      candi2: this.candi2Count,
      candi3: this.candi3Count,
      candi4: this.candi4Count,
      candi5: this.candi5Count,
      candi6: this.candi6Count,
      candi7: this.candi7Count,
      candi8: this.candi8Count,
      tabIndex: this.tabIndex,
      title: this.tabName,
      rightToken: true,
      statusToken: true
    });

  }

  selectedId(id: any, $event: any) {
    for (const res of this.resList) {
      if (res.id === id) {
        res.idBackgroundColor = $event.idBackgroundColor;
        res.idColor = $event.idColor;
        res.idClassNoSelect = $event.idClassNoSelect;
        if ($event.isSelect) {
          res.resBackgroundColor = $event.resBackgroundColor;
          res.resSelect = 'select';
        }
      }
    }
    if (this.btnNotice.checked || this.isSearchChecked || this.isSelectRes) {
      for (const res of this.originalResList) {
        if (res.id === id) {
          res.idBackgroundColor = $event.idBackgroundColor;
          res.idColor = $event.idColor;
          res.idClassNoSelect = $event.idClassNoSelect;
          if ($event.isSelect) {
            res.resBackgroundColor = $event.resBackgroundColor;
            res.resSelect = 'select';
          }
        }
      }
    }
    this.changeStatus();
  }

  selectedTreeRes(index: number, $event: any) {
    const selectKeys = ['none', 'select', 'candi1', 'candi2', 'candi3', 'candi4', 'candi5', 'candi6', 'candi7', 'candi8'];
    if (index < this.resList.length && (this.resList[index + 1]?.isAdded || this.resList[index]?.isAdded)) {
      this.resList[index].resSelect = selectKeys[$event.select];
      this.resList[index].resBackgroundColor = $event.resBackgroundColor;
      // this.calcSelectedRes($event.select, this.resList[index]);
      if (this.resList[index].isAdded) {
        let i = index;
        do {
          i--;
          this.resList[i].resSelect = selectKeys[$event.select];
          this.resList[i].resBackgroundColor = $event.resBackgroundColor;
          // this.calcSelectedRes($event.select, this.resList[i]);
        }
        while (this.resList[i]?.isAdded && i > -1);
        i = index + 1;
        while (this.resList[i]?.isAdded && i < this.resList.length) {
          this.resList[i].resSelect = selectKeys[$event.select];
          this.resList[i].resBackgroundColor = $event.resBackgroundColor;
          // this.calcSelectedRes($event.select, this.resList[i]);
          i++;
        }
      } else if (this.resList[index + 1]) {
        for (let i = index + 1; i < this.resList.length; i++) {
          if (!this.resList[i]?.isAdded) {
            break;
          }
          this.resList[i].resSelect = selectKeys[$event.select];
          this.resList[i].resBackgroundColor = $event.resBackgroundColor;
          // this.calcSelectedRes($event.select, this.resList[i]);
        }
      }

    } else {
      this.resList[index].resSelect = selectKeys[$event.select];
      this.resList[index].resBackgroundColor = $event.resBackgroundColor;
    }
    this.changeStatus();
  }

  private setTreeMenuStatus() {

    if (this.hovered < this.resList.length && (this.resList[this.hovered + 1]?.isAdded || this.resList[this.hovered]?.isAdded)) {
      this.resList[this.hovered].isCollapsed = !this.resList[this.hovered].isCollapsed;
      if (this.resList[this.hovered].isAdded) {
        let i = this.hovered;
        do {
          i--;
          this.resList[i].isCollapsed = !this.resList[i].isCollapsed;
        }
        while (this.resList[i]?.isAdded && i > -1);
        i = this.hovered + 1;
        while (this.resList[i]?.isAdded && i < this.resList.length) {
          this.resList[i].isCollapsed = !this.resList[i].isCollapsed;
          i++;
        }
      } else if (this.resList[this.hovered + 1]) {
        for (let i = this.hovered + 1; i < this.resList.length; i++) {
          if (!this.resList[i]?.isAdded) {
            break;
          }
          this.resList[i].isCollapsed = !this.resList[i].isCollapsed;
        }
      }

    } else {
      this.resList[this.hovered].isCollapsed = !this.resList[this.hovered].isCollapsed;
    }
    this.cdRef.detectChanges();
  }

  mouseEnterHandler(item: ResItem) {
    this.hovered = this.resList.indexOf(item);
  }

  getHoverColor(resBackgroundColor: string) {
    if (resBackgroundColor === '#fff' || resBackgroundColor === '#ffffff') {
      return this.hovergroundColors[0];
    } else {
      return this.hovergroundColors[this.backgroundColors.indexOf(resBackgroundColor)];
    }
  }

  mouseLeaveHandler() {
    this.hovered = -1;
  }

  mouseClickHandler() {
    if (this.resMouseClick) {
      // this.selectHoveredRes(false);
    }
  }

  getDraggable(index: number) {
    return this.draggable !== index;
  }

  setDraggable(index: number, $event: any) {
    if ($event) {
      this.draggable = index;
    } else {
      this.draggable = -1;
    }
  }

  multiSelection(command: string) {
    for (const res of this.resList) {
      if (res.isShow) {
        switch (command) {
          case 'select':
            res.resSelect = 'select';
            res.resBackgroundColor = this.backgroundColors[1];
            break;
          case 'candi1':
            res.resSelect = 'candi1';
            res.resBackgroundColor = this.backgroundColors[2];
            break;
          case 'candi2':
            res.resSelect = 'candi2';
            res.resBackgroundColor = this.backgroundColors[3];
            break;
          case 'candi3':
            res.resSelect = 'candi3';
            res.resBackgroundColor = this.backgroundColors[4];
            break;
          case 'candi4':
            res.resSelect = 'candi4';
            res.resBackgroundColor = this.backgroundColors[5];
            break;
          case 'candi5':
            res.resSelect = 'candi5';
            res.resBackgroundColor = this.backgroundColors[6];
            break;
          case 'candi6':
            res.resSelect = 'candi6';
            res.resBackgroundColor = this.backgroundColors[7];
            break;
          case 'candi7':
            res.resSelect = 'candi7';
            res.resBackgroundColor = this.backgroundColors[8];
            break;
          case 'candi8':
            res.resSelect = 'candi8';
            res.resBackgroundColor = this.backgroundColors[9];
            break;
          case 'select-image':
            if (res.hasImage) {
              res.resSelect = 'select';
              res.resBackgroundColor = this.backgroundColors[1];
            }
            break;
          case 'candi1-image':
            if (res.hasImage) {
              res.resSelect = 'candi1';
              res.resBackgroundColor = this.backgroundColors[2];
            }
            break;
          case 'candi2-image':
            if (res.hasImage) {
              res.resSelect = 'candi2';
              res.resBackgroundColor = this.backgroundColors[3];
            }
            break;
          case 'candi3-image':
            if (res.hasImage) {
              res.resSelect = 'candi3';
              res.resBackgroundColor = this.backgroundColors[4];
            }
            break;
          case 'candi4-image':
            if (res.hasImage) {
              res.resSelect = 'candi4';
              res.resBackgroundColor = this.backgroundColors[5];
            }
            break;
          case 'candi5-image':
            if (res.hasImage) {
              res.resSelect = 'candi5';
              res.resBackgroundColor = this.backgroundColors[6];
            }
            break;
          case 'candi6-image':
            if (res.hasImage) {
              res.resSelect = 'candi6';
              res.resBackgroundColor = this.backgroundColors[7];
            }
            break;
          case 'candi7-image':
            if (res.hasImage) {
              res.resSelect = 'candi7';
              res.resBackgroundColor = this.backgroundColors[8];
            }
            break;
          case 'candi8-image':
            if (res.hasImage) {
              res.resSelect = 'candi8';
              res.resBackgroundColor = this.backgroundColors[9];
            }
            break;
          case 'cancel-select':
            if (res.resSelect === 'select') {
              res.resSelect = 'none';
              res.resBackgroundColor = this.backgroundColors[0];
            }
            break;
          case 'cancel-candi1':
            if (res.resSelect === 'candi1') {
              res.resSelect = 'none';
              res.resBackgroundColor = this.backgroundColors[0];
            }
            break;
          case 'cancel-candi2':
            if (res.resSelect === 'candi2') {
              res.resSelect = 'none';
              res.resBackgroundColor = this.backgroundColors[0];
            }
            break;
          case 'cancel-candi3':
            if (res.resSelect === 'candi3') {
              res.resSelect = 'none';
              res.resBackgroundColor = this.backgroundColors[0];
            }
            break;
          case 'cancel-candi4':
            if (res.resSelect === 'candi4') {
              res.resSelect = 'none';
              res.resBackgroundColor = this.backgroundColors[0];
            }
            break;
          case 'cancel-candi5':
            if (res.resSelect === 'candi5') {
              res.resSelect = 'none';
              res.resBackgroundColor = this.backgroundColors[0];
            }
            break;
          case 'cancel-candi6':
            if (res.resSelect === 'candi6') {
              res.resSelect = 'none';
              res.resBackgroundColor = this.backgroundColors[0];
            }
            break;
          case 'cancel-candi7':
            if (res.resSelect === 'candi7') {
              res.resSelect = 'none';
              res.resBackgroundColor = this.backgroundColors[0];
            }
            break;
          case 'cancel-candi8':
            if (res.resSelect === 'candi8') {
              res.resSelect = 'none';
              res.resBackgroundColor = this.backgroundColors[0];
            }
            break;
          case 'cancel-allselect':
            res.resSelect = 'none';
            res.resBackgroundColor = this.backgroundColors[0];
            break;
        }
      }
    }
    this.cdRef.detectChanges();
    this.changeStatus();
  }

  vsResContainerUpdateHandler($event: any[]) {
    this.scrollIndexEmitter.emit(this.virtualScroller.viewPortInfo.startIndex);
    // this.resService.setScrollPos({index: this.tabIndex,
    //   pos: this.virtualScroller.viewPortInfo.startIndex,
    //   isTab: false
    // });
  }

  clearSearchStatus(resList: ResItem[]) {
    for (const res of resList) {
      res.content = res.content.replace(/(<span[^<]+>)/ig, '');
      res.content = res.content.replace(/<\/span>/ig, '');
      res.numBackground = 'transparent';
      res.id = res.id.replace(/(<span[^<]+>)/ig, '');
      res.id = res.id.replace(/<\/span>/ig, '');
      res.name = res.name.replace(/(<span[^<]+>)/ig, '');
      res.name = res.name.replace(/<\/span>/ig, '');
      res.isFiltered = false;
      res.isSearched = false;
    }
  }

  cancelSearchResText() {
    this.clearSearchStatus(this.resList);
    this.clearSearchStatus(this.originalResList);
    this.startInRes = 0;
    this.searchedRes = 0;
    // this.isChangedSearch = true;
  }

  private saveSearchList(){
    if (this.searchList.indexOf(this.searchKeyword.trim()) === -1) {
      if (this.searchList.length >= this.searchWordMax) {
        this.searchList.splice(this.searchList.length - 1, 1);
      }
      this.searchList.splice(0, 0, this.searchKeyword.trim());
    } else {
      const searchIndex = this.searchList.indexOf(this.searchKeyword.trim());
      moveItemInArray(this.searchList, searchIndex, 0);
    }

    this.searchListEmitter.emit({
      searchList: this.searchList
    });
  }

  private getSearchRegexp(keyword){
    let re;
    if (keyword === 'sta' || keyword === 'twi' || keyword === 'twit'){
      re = new RegExp(`(?<!<[^>]*)${keyword}`, 'gi');
    } else {
      re = new RegExp(`(?![^<>]*>)(${keyword})(?![&gt;])`, 'gi');
    }
    return re;
  }

  private setSearchWordStyle(re, tmpResList: ResItem[]){
    for (let i = 0; i < tmpResList.length; i++) {
      tmpResList[i].originalIndex = i;
      if (this.searchOption === 'num') {
        if (re.test(String(tmpResList[i].num))) {
          // this.resList[i].num = this.resList[i].num.replace(re, `<span style="background-color: ${this.hitColor};">$&</span>`);
          tmpResList[i].isSearched = true;
          tmpResList[i].numBackground = this.hitColor;
        }
      } else {
        if (tmpResList[i].content.match(re) !== null) {
          tmpResList[i].content = tmpResList[i].content.replace(re, `<span style="background-color: ${this.hitColor};">$&</span>`);
          tmpResList[i].isSearched = true;
        }
        if (this.searchOption === 'all') {
          if (tmpResList[i].name.match(re) || tmpResList[i].id.match(re)) {
            tmpResList[i].id = tmpResList[i].id.replace(re, `<span style="background-color: ${this.hitColor};">$&</span>`);
            tmpResList[i].name = tmpResList[i].name.replace(re, `<span style="background-color: ${this.hitColor};">$&</span>`);
            tmpResList[i].isSearched = true;
          }
        }
      }
    }
  }

  searchResText(isOnlySearch) {
    const keyword = this.searchKeyword.trim().replace(/\s+/gi, '|');
    this.saveSearchList();

    let re = this.getSearchRegexp(keyword);

    let tmpResList = [];

    if (!isOnlySearch && this.originalResList !== undefined && this.originalResList.length > 0
      && this.resList.length !== this.originalResList.length) {
      tmpResList = [...this.originalResList];
    } else{
      tmpResList = this.resList;
    }

    if (this.btnNotice.checked) {
      tmpResList = this.getNoticeRes(this.resList);
    }

    if (this.isSelectRes) {
      tmpResList = this.getSelectedRes(this.resList);
    }

    this.setSearchWordStyle(re, tmpResList);
    this.resList = tmpResList;
    this.startInRes = 0;
    this.searchedRes = 0;
    this.isChangedSearch = false;
  }

  getAbstractRes(tmpResList: ResItem[]) {
    let result = [];

    for (let i = 0; i < tmpResList.length; i++) {
      if (tmpResList[i]?.isSearched) {
        tmpResList[i].isFiltered = true;
        if (this.isTreeSearch) {
          if (tmpResList[i].isAdded) {
            let j = i - 1;
            if (j > -1) {
              while (j > -1 && tmpResList[j].isAdded) {
                tmpResList[j].isFiltered = true;
                j--;
              }
              tmpResList[j].isFiltered = true;
            }
            j = i + 1;
            if (j < this.resList.length) {
              while (j < tmpResList.length && tmpResList[j].isAdded) {
                tmpResList[j].isFiltered = true;
                j++;
              }
            }
            i = j;
            if (tmpResList[i]?.isSearched) {
              tmpResList[i].isFiltered = true;
            }
          } else if (i < tmpResList.length - 1 && tmpResList[i + 1]) {
            let j = i + 1;
            while (j < tmpResList.length && tmpResList[j].isAdded) {
              tmpResList[j].isFiltered = true;
              j++;
            }
          }
        }
      }
    }
    for (const res of tmpResList) {
      if (res.isFiltered) {
        result = [...result, res];
      }
    }
    return result;
  }

  abstractRes() {

    const keyword = this.searchKeyword.trim().replace(/\s+/gi, '|');
    this.saveSearchList();

    let re = this.getSearchRegexp(keyword);

    if ((!this.btnNotice.checked && !this.isSelectRes && this.isBackup) || this.originalResList === undefined) {
      this.originalResList = [...this.resList];
      this.changeListEmitter.emit({
        tabIndex: this.tabIndex,
        resList: this.originalResList,
      });
      this.isBackup = false;
    }
    let tmpResList = [...this.originalResList];

    this.clearSearchStatus(tmpResList);
    this.startInRes = 0;
    this.searchedRes = 0;

    if (this.btnNotice.checked) {
      tmpResList = this.getNoticeRes(this.resList);
    }

    if (this.isSelectRes) {
      tmpResList = this.getSelectedRes(this.resList);
    }

    this.setSearchWordStyle(re, tmpResList);

    this.startInRes = 0;
    this.searchedRes = 0;
    this.isChangedSearch = false;

    tmpResList = this.getAbstractRes(tmpResList);

    this.resList = tmpResList;
    this.changeListStatusEmitter.emit({
      tabIndex: this.tabIndex,
      resList: this.resList,
      hiddenIds: this.hiddenIds
    });
    this.changeStatus();

    this.resService.setTotalRes({
      tabIndex: this.tabIndex,
      totalCount: this.resList.length,
      title: this.tabName,
      rightToken: true,
      statusToken: true
    });
  }

  btnCancelAbstractHandler(){
    this.isSearched = false;
    if (this.isSearchChecked) {
      this.isSearchChecked = false;
      this.searchChangeStatus();
    }
  }

  private searchChangeStatus() {

    if (this.isSearchChecked) {

      if (this.searchKeyword === undefined || this.searchKeyword.length === 0 || this.searchKeyword.match(/^\s+$/) !== null) {
        this.isSearchChecked = false;
      } else {
        // this.cancelSearchResText();
        // this.searchResText(false);
        this.abstractRes();
      }
    } else {
      this.isBackup = true;
      let tmpResList = [...this.originalResList];
      if (this.btnNotice.checked) {
        tmpResList = this.getNoticeRes(tmpResList);
      }

      if (this.isSelectRes) {
        tmpResList = this.getSelectedRes(tmpResList);
      }
      this.resList = [];
      this.resList = tmpResList;
      this.changeListStatusEmitter.emit({
        tabIndex: this.tabIndex,
        resList: this.resList,
        hiddenIds: this.hiddenIds
      });
      this.cancelSearchResText();
      this.changeStatus();
      this.isChangedSearch = true;
      this.resService.setTotalRes({
        tabIndex: this.tabIndex,
        totalCount: this.resList.length,
        title: this.tabName,
        rightToken: true,
        statusToken: true
      });
    }
    this.filteredEmitter.emit(this.isSearchChecked);
  }

  selectedNum(resItem: ResItem) {
    if (resItem !== undefined) {
      const fromIndex = this.originalResList.indexOf(resItem);
      moveItemInArray(this.originalResList, fromIndex, 0);
    }
    this.isSearchChecked = false;
    this.searchChangeStatus();
    this.virtualScroller.scrollToIndex(0);
  }

  btnBottomNoticeChange($event){
    this.btnNotice.checked = $event;
    this.btnNoticeChangeHandler();
  }

  btnNoticeChangeHandler() {
    if (this.btnNotice.checked) {
      if ((!this.isSearchChecked && !this.isSelectRes) || this.originalResList === undefined) {
        this.originalResList = [...this.resList];
        this.changeListEmitter.emit({
          tabIndex: this.tabIndex,
          resList: this.originalResList,
        });
      }
      let tmpResList = [...this.originalResList];

      if (this.isSearchChecked) {
        tmpResList = this.getAbstractRes(tmpResList);
      }

      if (this.isSelectRes) {
        tmpResList = this.getSelectedRes(tmpResList);
      }

      tmpResList = this.getNoticeRes(tmpResList);

      this.resList = [];
      this.resList = tmpResList;
      this.changeListStatusEmitter.emit({
        tabIndex: this.tabIndex,
        resList: this.resList,
        hiddenIds: this.hiddenIds
      });
      this.changeStatus();
      this.resService.setTotalRes({
        tabIndex: this.tabIndex,
        totalCount: this.resList.length,
        title: this.tabName,
        rightToken: true,
        statusToken: true
      });

    } else {

      let tmpResList = [...this.originalResList];
      if (this.isSearchChecked) {
        tmpResList = this.getAbstractRes(tmpResList);
      }
      if (this.isSelectRes) {
        tmpResList = this.getSelectedRes(tmpResList);
      }

      this.resList = tmpResList;
      this.changeListStatusEmitter.emit({
        tabIndex: this.tabIndex,
        resList: this.resList,
        hiddenIds: this.hiddenIds
      });
      this.changeStatus();
      this.resService.setTotalRes({
        tabIndex: this.tabIndex,
        totalCount: this.resList.length,
        title: this.tabName,
        rightToken: true,
        statusToken: true
      });
    }
  }

  getNoticeRes(tmpResList: ResItem[]) {
    let result = [];
    for (const res of tmpResList) {
      if (res.isNotice) {
        result = [...result, res];
      }
    }
    tmpResList.length = 0;
    return result;
  }

  txtSearchKeyUpHandler($event: KeyboardEvent) {

    if (this.searchOption === undefined) {
      return;
    }
    if (this.isKeyPressed && $event.shiftKey && $event.code === 'Tab') {
      this.isKeyPressed = false;
      this.btnSearch.nativeElement.focus();
      return;
    } else if (this.isKeyPressed && $event.code === 'Tab') {
      this.isKeyPressed = false;
      this.btnTreeSearch.nativeElement.focus();
      return;
    } else if ($event.ctrlKey && $event.shiftKey && $event.code === 'Enter') {
      this.isSearchChecked = !this.isSearchChecked;
      this.searchChangeStatus();
    } else if ($event.shiftKey && $event.code === 'Enter') {
      this.isChangedSearch = false;

      if (this.searchOption === 'num') {
        let currentHit = 0;
        let isExist = false;
        for (let i = 0; i < this.resList.length; i++) {
          if (this.resList[i].numBackground === this.highLightColor) {
            currentHit = i - 1;
            break;
          }
        }
        for (let i = currentHit; i >= 0; i--) {
          if (this.resList[i].numBackground === this.hitColor) {
            this.searchedRes = i;
            isExist = true;
            break;
          }
        }
        if (isExist) {
          for (const res of this.resList) {
            if (res.numBackground === this.highLightColor) {
              res.numBackground = this.hitColor;
              break;
            }
          }
          this.resList[this.searchedRes].numBackground = this.highLightColor;
          this.virtualScroller.scrollToIndex(this.searchedRes);
        }
      } else if (this.searchOption === 'context') {
        let isExist = false;
        while (true) {
          if (this.searchedRes > this.resList.length - 1) {
            this.searchedRes = this.resList.length - 1;
          }
          if (this.searchedRes < 0) {
            break;
          }
          this.startInRes = this.resList[this.searchedRes].content.lastIndexOf(`<span style="background-color: ${this.hitColor};">`,
            this.startInRes);
          if (this.startInRes !== -1) {
            isExist = true;
            break;
          }
          this.startInRes--;
          if (this.startInRes < 0) {
            this.searchedRes--;
            if (this.searchedRes >= 0) {
              this.startInRes = this.resList[this.searchedRes].content.length - 1;
            }
          }
        }
        if (isExist) {
          for (const res of this.resList) {
            res.content = res.content.replace(`<span style="background-color: ${this.highLightColor};">`, `<span style="background-color: ${this.hitColor};">`);
          }
          const re = new RegExp(`<span style="background-color: ${this.hitColor};">`, 'gi');
          this.resList[this.searchedRes].content = this.resList[this.searchedRes].content.replace(re, (match, offset) => {
            let result = match;
            if (this.startInRes === offset) {
              result = `<span style="background-color: ${this.highLightColor};">`;
            }
            return result;
          });
          // this.startInRes -= `<span style="background-color: ${this.highLightColor};">`.length;
          this.virtualScroller.scrollToIndex(this.searchedRes);
        }
      } else {
        let isExist = false;
        while (true) {
          if (this.searchedRes > this.resList.length - 1) {
            this.searchedRes = this.resList.length - 1;
          }
          if (this.searchedRes < 0) {
            break;
          }

          if (this.searchedFiled === 0) {
            this.startInRes = this.resList[this.searchedRes].name.lastIndexOf(`<span style="background-color: ${this.hitColor};">`,
              this.startInRes);
          } else if (this.searchedFiled === 1) {
            this.startInRes = this.resList[this.searchedRes].id.lastIndexOf(`<span style="background-color: ${this.hitColor};">`,
              this.startInRes);
          } else {
            this.startInRes = this.resList[this.searchedRes].content.lastIndexOf(`<span style="background-color: ${this.hitColor};">`,
              this.startInRes);
          }
          if (this.startInRes !== -1) {
            isExist = true;
            break;
          }
          this.startInRes--;
          if (this.startInRes < 0) {
            this.searchedFiled--;
            if (this.searchedFiled < 0) {
              this.searchedFiled = 2;
              this.searchedRes--;
            }
            if (this.searchedRes >= 0) {
              if (this.searchedFiled === 0) {
                this.startInRes = this.resList[this.searchedRes].name.length - 1;
              } else if (this.searchedFiled === 1) {
                this.startInRes = this.resList[this.searchedRes].id.length - 1;
              } else {
                this.startInRes = this.resList[this.searchedRes].content.length - 1;
              }
            }
          }
        }

        if (isExist) {
          for (const res of this.resList) {
            res.name = res.name.replace(`<span style="background-color: ${this.highLightColor};">`, `<span style="background-color: ${this.hitColor};">`);
            res.id = res.id.replace(`<span style="background-color: ${this.highLightColor};">`, `<span style="background-color: ${this.hitColor};">`);
            res.content = res.content.replace(`<span style="background-color: ${this.highLightColor};">`, `<span style="background-color: ${this.hitColor};">`);
          }
          if (this.searchedFiled === 0) {
            this.resList[this.searchedRes].name = this.getHitContent(this.resList[this.searchedRes].name);
          } else if (this.searchedFiled === 1) {
            this.resList[this.searchedRes].id = this.getHitContent(this.resList[this.searchedRes].id);
          } else {
            this.resList[this.searchedRes].content = this.getHitContent(this.resList[this.searchedRes].content);
          }
          // this.startInRes -= `<span style="background-color: ${this.highLightColor};">`.length;
          this.virtualScroller.scrollToIndex(this.searchedRes);
        }
      }
    } else if ($event.code === 'Enter') {
      if (this.isChangedSearch) {
        if (this.searchKeyword === undefined) {
          return;
        }
        if (this.searchKeyword.match(/^\s+$/g) !== null || this.searchKeyword.length === 0) {
          this.cancelSearchResText();
        } else {
          this.cancelSearchResText();
          this.searchResText(true);
        }
      } else {
        if (this.searchOption === 'num') {
          let currentHit = 0;
          let isExist = false;
          for (let i = 0; i < this.resList.length; i++) {
            if (this.resList[i].numBackground === this.highLightColor) {
              currentHit = i + 1;
              break;
            }
          }
          for (let i = currentHit; i < this.resList.length; i++) {
            if (this.resList[i].numBackground === this.hitColor) {
              this.searchedRes = i;
              isExist = true;
              break;
            }
          }
          if (isExist) {
            for (const res of this.resList) {
              if (res.numBackground === this.highLightColor) {
                res.numBackground = this.hitColor;
                break;
              }
            }
            this.resList[this.searchedRes].numBackground = this.highLightColor;
            this.virtualScroller.scrollToIndex(this.searchedRes);
          }
        } else if (this.searchOption === 'context') {
          let isExist = false;
          while (true) {
            if (this.searchedRes < 0) {
              this.searchedRes = 0;
            }
            if (this.searchedRes < this.virtualScroller.viewPortInfo.startIndex) {
              this.searchedRes = this.virtualScroller.viewPortInfo.startIndex;
            }
            if (this.searchedRes > this.resList.length - 1) {
              break;
            }

            this.startInRes = this.resList[this.searchedRes].content.indexOf(`<span style="background-color: ${this.hitColor};">`,
              this.startInRes);
            if (this.startInRes !== -1) {
              isExist = true;
              break;
            }
            // this.startInRes++;
            if (this.startInRes === -1) {
              this.startInRes = 0;
              this.searchedRes++;
            }
          }
          if (isExist) {
            for (const res of this.resList) {
              res.content = res.content.replace(`<span style="background-color: ${this.highLightColor};">`, `<span style="background-color: ${this.hitColor};">`);
            }
            const re = new RegExp(`<span style="background-color: ${this.hitColor};">`, 'gi');
            this.resList[this.searchedRes].content = this.resList[this.searchedRes].content.replace(re, (match, offset) => {
              let result = match;
              if (this.startInRes === offset) {
                result = `<span style="background-color: ${this.highLightColor};">`;
              }
              return result;
            });
            this.startInRes += `<span style="background-color: ${this.highLightColor};">`.length;
            this.virtualScroller.scrollToIndex(this.searchedRes);
          }
        } else {
          let isExist = false;
          while (true) {
            if (this.searchedRes < 0) {
              this.searchedRes = 0;
            }
            if (this.searchedRes < this.virtualScroller.viewPortInfo.startIndex) {
              this.searchedRes = this.virtualScroller.viewPortInfo.startIndex;
              this.searchedFiled = 0;
            }

            if (this.searchedRes > this.resList.length - 1) {
              break;
            }

            if (this.searchedFiled === 0) {
              this.startInRes = this.resList[this.searchedRes].name.indexOf(`<span style="background-color: ${this.hitColor};">`,
                this.startInRes);
            } else if (this.searchedFiled === 1) {
              this.startInRes = this.resList[this.searchedRes].id.indexOf(`<span style="background-color: ${this.hitColor};">`,
                this.startInRes);
            } else {
              this.startInRes = this.resList[this.searchedRes].content.indexOf(`<span style="background-color: ${this.hitColor};">`,
                this.startInRes);
            }

            if (this.startInRes !== -1) {
              isExist = true;
              break;
            }

            if (this.startInRes === -1) {
              this.startInRes = 0;
              this.searchedFiled++;
              if (this.searchedFiled > 2) {
                this.searchedFiled = 0;
                this.searchedRes++;
              }
            }
          }
          if (isExist) {
            for (const res of this.resList) {
              res.name = res.name.replace(`<span style="background-color: ${this.highLightColor};">`, `<span style="background-color: ${this.hitColor};">`);
              res.id = res.id.replace(`<span style="background-color: ${this.highLightColor};">`, `<span style="background-color: ${this.hitColor};">`);
              res.content = res.content.replace(`<span style="background-color: ${this.highLightColor};">`, `<span style="background-color: ${this.hitColor};">`);
            }
            if (this.searchedFiled === 0) {
              this.resList[this.searchedRes].name = this.getHitContent(this.resList[this.searchedRes].name);
            } else if (this.searchedFiled === 1) {
              this.resList[this.searchedRes].id = this.getHitContent(this.resList[this.searchedRes].id);
            } else {
              this.resList[this.searchedRes].content = this.getHitContent(this.resList[this.searchedRes].content);
            }

            this.startInRes += `<span style="background-color: ${this.highLightColor};">`.length;
            this.virtualScroller.scrollToIndex(this.searchedRes);
          }
        }
      }
    } else {
    }
  }

  private getHitContent(content: string) {
    const re = new RegExp(`<span style="background-color: ${this.hitColor};">`, 'gi');
    content = content.replace(re, (match, offset) => {
      let result = match;
      if (this.startInRes === offset) {
        result = `<span style="background-color: ${this.highLightColor};">`;
      }
      return result;
    });
    return content;
  }

  private async printHtmlTag(pIsReplaceName, pSurroundImage, pGazouReplaceUrl) {
    $.LoadingOverlay('show', {
      imageColor: '#ffa07a',
    });
    let printResList = [];
    if (this.btnNotice.checked || this.isSearchChecked) {
      printResList = this.originalResList;
    } else {
      printResList = this.resList;
    }
    const htmlTag = await this.resService.printHtmlTag(printResList, {
      tabName: this.tabName,
      txtURL: this.txtURL,
      twitter: this.twitter,
      youtube: this.youtube,
      twitterUrl: this.isTwitterUrl,
      youtubeUrl: this.isYoutubeUrl,
      shuturyoku: this.shuturyoku,
      resSizeList: this.resSizeList,
      characterColors: this.characterColors,
      startAbbreviations: this.startAbbreviations,
      endAbbreviations: this.endAbbreviations,
      isAll: false,
      isOutputCandiBelow: false,
      isReplaceName: pIsReplaceName,
      replaceName: this.replaceName,
      replacedName: this.replacedName,
      isSurroundImage: pSurroundImage,
      gazouReplaceUrl: pGazouReplaceUrl,
      insertPrefix: this.insertPrefix,
      insertSuffix: this.insertSuffix
    });

    this.resService.setPrintHtml({
      tabIndex: this.tabIndex,
      html: htmlTag.allHtml
    });
    $.LoadingOverlay('hide');
  }

  tglSearchChangeHandler() {
    this.isChangedSearch = true;
    this.searchStatusEmitter.emit({
      searchKeyword: this.searchKeyword,
      searchOption: this.searchOption
    });
  }

  txtSearchChangeHandler($event: any) {
    this.isChangedSearch = true;
    this.searchStatusEmitter.emit({
      searchKeyword: this.searchKeyword,
      searchOption: this.searchOption
    });
  }

  reverseHoveredRes(canUnselect) {
    if (this.hovered >= 0) {
      if (this.resList[this.hovered].resSelect === 'select' && canUnselect) {
        this.resList[this.hovered].resBackgroundColor = this.backgroundColors[0];
        this.selectedRes(this.resList[this.hovered],
          {selected: 'none'});

      } else {
        this.resList[this.hovered].resBackgroundColor = this.backgroundColors[1];
        this.selectedRes(this.resList[this.hovered],
          {selected: 'select'});
      }
    }
  }

  deSelectHoveredRes(canUnselect) {
    if (this.hovered >= 0) {
      if (this.resList[this.hovered].resSelect === 'select' && canUnselect) {
        this.resList[this.hovered].resBackgroundColor = this.backgroundColors[0];
        this.selectedRes(this.resList[this.hovered],
          {selected: 'none'});
      }
    }
  }

  deleteRes(item: any) {
    const index = this.resList.indexOf(item);
    this.resList.splice(index, 1);
    this.cdRef.detectChanges();
    this.changeStatus();
    this.resService.setTotalRes({
      tabIndex: this.tabIndex,
      totalCount: this.resList.length,
      title: this.tabName,
      rightToken: true,
      statusToken: true
    });

    if (this.originalResList !== undefined) {
      const indexOrigin = this.originalResList.indexOf(item);
      this.originalResList.splice(indexOrigin, 1);
    }
  }

  getSelectedRes(tmpResList: ResItem[]) {
    let result = [];
    for (const resItem of tmpResList) {
      if (resItem.resSelect !== 'none') {
        result = [...result, resItem];
      }
    }
    tmpResList.length = 0;
    return result;
  }

  btnBottomShowSelectHandler($event){
    this.isSelectRes = $event;
    this.btnShowSelectHandler()
  }

  btnShowSelectHandler() {
    if (this.isSelectRes) {
      if ((!this.isSearchChecked && !this.btnNotice.checked) || this.originalResList === undefined) {
        this.originalResList = [...this.resList];
        this.changeListEmitter.emit({
          tabIndex: this.tabIndex,
          resList: this.originalResList,
        });
      }
      let tmpResList = [...this.originalResList];

      if (this.isSelectAllAction) {
        this.isSearchChecked = false;
        this.isSearched = false;
        this.btnNotice.checked = false;
        this.clearSearchStatus(tmpResList);
        this.filteredEmitter.emit(false);
      } else {
        if (this.isSearchChecked) {
          tmpResList = this.getAbstractRes(tmpResList);
        }

        if (this.btnNotice.checked) {
          tmpResList = this.getNoticeRes(tmpResList);
        }
      }

      tmpResList = this.getSelectedRes(tmpResList);

      this.resList = tmpResList;

    } else {
      if (this.originalResList?.length > 0) {

        let tmpResList = [...this.originalResList];
        if (this.isCancelAllAction) {
          this.isSearchChecked = false;
          this.isSearched = false;
          this.btnNotice.checked = false;
          this.clearSearchStatus(tmpResList);
          this.filteredEmitter.emit(false);
        }else {
          if (this.isSearchChecked) {
            tmpResList = this.getAbstractRes(tmpResList);
          }

          if (this.btnNotice.checked) {
            tmpResList = this.getNoticeRes(tmpResList);
          }
        }

        this.resList = tmpResList;
        this.changeListEmitter.emit({
          tabIndex: this.tabIndex,
          resList: this.resList,
        });
      }
    }
    this.resService.setTotalRes({
      tabIndex: this.tabIndex,
      totalCount: this.resList.length,
      title: this.tabName,
      rightToken: true,
      statusToken: true
    });
    this.changeStatus();
    this.cdRef.detectChanges();
  }

  btnAbstractHandler() {

    if (this.isSearchChecked) {
      this.isSearchChecked = false;
      this.searchChangeStatus();
      this.isSearched = !this.isSearched;
    }
    this.isSearchChecked = true;
    this.searchChangeStatus();
  }

  public searchAll(){
    this.btnAbstractHandler();
  }

  public cancelSearchAll(): void{
    this.btnCancelAbstractHandler();
  }

  cancelAllStatus(item: ResItem) {
    if (this.isSearchChecked || this.isSearched) {
      this.isSearchChecked = false;
      this.isSearched = false;
    }
    if (this.btnNotice.checked) {
      this.btnNotice.checked = false;
    }
    if (this.isSelectRes) {
      this.isSelectRes = false;
    }
    if (this.originalResList !== undefined && this.originalResList.length > 0 && this.resList.length !== this.originalResList.length) {
      this.clearSearchStatus(this.originalResList);
      this.resList = [...this.originalResList];
    }
    this.filteredEmitter.emit(this.isSearchChecked);
    if (item !== null) {
      const index = this.resList.indexOf(item);

      this.virtualScroller.scrollToIndex(index);
    }
  }

  txtSearchKeyPressHandler($event: KeyboardEvent){
    this.isKeyPressed = true;
  }

  setResMenu(value) {
    for (const res of this.resList) {
      res.resMenu = value;
      res.isMenuOpen = false;
    }
    this.cdRef.detectChanges();
  }

  txtUrlChangeHandler() {
    this.changeUrlEmitter.emit({
      tabIndex: this.tabIndex,
      txtURL: this.txtURL,
    });
  }

  selectAllChangeHandler() {
    this.selectAllEmitter.emit({
      tabIndex: this.tabIndex,
      selectAllOption: this.selectCommandWithHeader,
    });
  }

  btnImageSearchHandler() {
    this.searchKeyword = 'jpg|png|gif';
    this.searchStatusEmitter.emit({
      searchKeyword: this.searchKeyword,
      searchOption: this.searchOption
    });
  }

  btnAllSelHeaderClickHandler() {

    this.resService.setAllSelHeaderCommand(this.selectCommandWithHeader);
    this.selectCommandWithHeader = '';

    this.selectAllEmitter.emit({
      tabIndex: this.tabIndex,
      selectAllOption: this.selectCommandWithHeader,
    });
    this.cdRef.detectChanges();
  }

  printHtmlTagHandler() {
    this.resService.setPrintHtmlOnStatus(0);
  }

  printAllHtmlTagHandler() {
    this.resService.setPrintAllHtmlOnStatusSource(0);
  }

  private insertResToList(index, item) {
    this.resList.splice(index + 1, 0, item);
    this.cdRef.detectChanges();
    this.changeStatus();

    this.resService.setTotalRes({
      tabIndex: this.tabIndex,
      totalCount: this.resList.length,
      title: this.tabName,
      rightToken: true,
      statusToken: true
    });

    if (this.originalResList !== undefined) {
      const indexOrigin = this.originalResList.indexOf(item);
      const cloneOriginItem = Object.assign({}, item);
      this.originalResList.splice(indexOrigin + 1, 0, cloneOriginItem);
    }
  }

  insertRes(item: any) {
    item.isInserted = !item.isInserted;
  }

  txtSearchSelectHander($event: TypeaheadMatch) {
    this.txtSearch.nativeElement.focus();
    this.txtSearch.nativeElement.selectionStart = this.searchKeyword.length;
    this.txtSearch.nativeElement.selectionEnd = this.searchKeyword.length;
  }

  btnSearchFocusInHandler() {
    this.isKeyPressed = false;
  }

  btnTreeSearchFocusInHandler() {
    this.isKeyPressed = false;
  }

  btnSearchAllChangeHandler() {
    this.searchAllEmitter.emit({
      isSearch: false
    });
  }

  btnSearchAllHandler() {
    this.searchAllEmitter.emit({
      isSearch: true
    });
  }

  public showSelectedRes(display: boolean){
    if (display){
      this.setResMenu(1);
      if (display !== this.isSelectRes) {
        this.isSelectRes = true;
        this.btnShowSelectHandler();
      } else {
        this.isSelectRes = false;
        this.btnShowSelectHandler();
        this.isSelectRes = true;
        this.btnShowSelectHandler();
      }

    } else{
      // if (display !== this.isSelectRes) {
      //   this.isSelectRes = false;
      //   this.btnShowSelectHandler();
      // }
      this.cancelAllStatus(null);
    }

  }

  btnAbstractAndCancelHandler() {
    if (this.isSearched || this.isSearchChecked){
      this.btnCancelAbstractHandler();
    } else{
      this.btnAbstractHandler();
    }
  }
}
