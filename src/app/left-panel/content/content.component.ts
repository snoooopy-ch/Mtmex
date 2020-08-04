import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, ElementRef, EventEmitter,
  Input, OnDestroy,
  OnInit, Output,
  ViewChild
} from '@angular/core';
import {CdkDragDrop, CdkDragStart, moveItemInArray} from '@angular/cdk/drag-drop';
import {ResItem} from '../../models/res-item';
import {ResService} from '../../res.service';
import { normal } from 'color-blend';
import {VirtualScrollerComponent} from 'ngx-virtual-scroller';
import {MatButtonToggle, MatButtonToggleChange} from '@angular/material/button-toggle';
import {Hotkey, HotkeysService} from 'angular2-hotkeys';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentComponent implements OnInit, OnDestroy {
  @Input() tabName = 'New Tab';
  @Input() resList: ResItem[];
  @Input() tabIndex;
  hiddenIds: string [];
  private selectedResIndex;
  @ViewChild('resListContainer') virtualScroller: VirtualScrollerComponent;
  @ViewChild('btnSearch') btnSearch: MatButtonToggle;
  @ViewChild('btnNotice') btnNotice: MatButtonToggle;
  @ViewChild('txtSearch') txtSearch: ElementRef ;
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
  @Output() filteredEmitter = new EventEmitter();
  @Output() searchStatusEmitter = new EventEmitter();
  @Output() scrollIndexEmitter = new EventEmitter();
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
  backupResList;
  noticeBackupResList;
  @Input() txtURL: string;
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
  currentScrollIndex: number;
  originalResList: ResItem[];
  isTreeSearch: number;

  constructor(private cdRef: ChangeDetectorRef, private resService: ResService, private hotkeysService: HotkeysService) {
    this.hiddenIds = [];
    this.hovered = -1;
    this.subHotKeys = [];
    this.isChangedSearch = true;
    this.searchedRes = 0;
    this.selectCount = 0;
    this.candi1Count = 0;
    this.candi2Count = 0;
    this.candi3Count = 0;
    this.candi4Count = 0;
    this.currentScrollIndex = 0;
  }

  ngOnInit(): void {
    this.originalResList = [];
    this.subscribers.LoadHiddenIds = this.resService.LoadHiddenIds.subscribe((hiddenIds) => {
      this.hiddenIds = hiddenIds;

      for (const res of this.resList){
        res.isShow = this.hiddenIds.indexOf(res.id) === -1;
      }
      this.cdRef.detectChanges();
    });

    // this.subscribers.scrollPos = this.resService.scrollPos.subscribe((scrollPos) => {
    //      if (scrollPos.index === this.tabIndex && scrollPos.isTab){
    //       this.virtualScroller.scrollToIndex(scrollPos.pos);
    //     }
    // });

    this.subscribers.moveRes = this.resService.moveRes.subscribe((value) => {
      if (value.tabIndex === this.tabIndex){
        this.moveScroller(value.moveKind);
      }
    });

    this.subscribers.selectCommand = this.resService.selectCommand.subscribe((value) => {
      if (value.tabIndex === this.tabIndex && value.token){
        this.multiSelection(value.command);
        value.token = false;
      }
    });

    this.subscribers.selectedTab = this.resService.selectedTab.subscribe((value) => {
      if (value.tabIndex === this.tabIndex){
        this.tabIndex = value.tabIndex;
        this.setHotKeys();
      }
    });

    this.subscribers.printCommand =  this.resService.printCommand.subscribe((value) => {
      if (value.tabIndex === this.tabIndex && value.token){
        this.printHtmlTag();
      }
    });

    this.subscribers.saveResStatus = this.resService.saveResStatus.subscribe((value) => {
      if ((value.tabIndex === this.tabIndex || value.isAllTabSave) && this.resList.length > 0 && value.token) {
        const saveData = value;
        saveData.resList = [];
        if (value.isAllTabSave) {
          saveData.filePath = `${value.autoFilePath}${this.tabName}.txt`;
        }
        let saveResList = [];
        if (this.btnSearch.checked || this.btnNotice.checked){
          saveResList = this.originalResList;
        }else{
          saveResList = this.resList;
        }
        for (const res of saveResList){
          const resItem = Object.assign({}, res);
          resItem.resColor = this.characterColors.indexOf(res.resColor) === -1 ? 0 : this.characterColors.indexOf(res.resColor) + 1;

          if (this.resSizeList[0].value === res.resFontSize){
            resItem.resFontSize = '1';
          }else if (this.resSizeList[1].value === res.resFontSize){
            resItem.resFontSize = '2';
          }else if (this.resSizeList[2].value === res.resFontSize){
            resItem.resFontSize = '3';
          }
          resItem.resBackgroundColor = this.backgroundColors.indexOf(res.resBackgroundColor) === -1 ? 0 :
            this.backgroundColors.indexOf(res.resBackgroundColor);
          resItem.resHovergroundColor = this.hovergroundColors.indexOf(res.resHovergroundColor) === -1 ? 0 :
            this.hovergroundColors.indexOf(res.resHovergroundColor);
          if (this.idStyles[0].color === res.idColor){
            resItem.idColor = '0';
            resItem.idBackgroundColor = '0';
          } else if (this.idStyles[1].color === res.idColor){
            resItem.idColor = '1';
            resItem.idBackgroundColor = '1';
          }else if (this.idStyles[2].color === res.idColor){
            resItem.idColor = '2';
            resItem.idBackgroundColor = '2';
          }else if (this.idStyles[3].color === res.idColor){
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
        this.txtURL = value.data.txtUrl;
        if (this.resList !== undefined) {
          this.virtualScroller.scrollToIndex(value.data.scrollIndex);
          this.changeStatus();
          this.cdRef.detectChanges();
        }
      }
    });

    this.subscribers.resMenu = this.resService.resMenu.subscribe((value) => {
      if (this.tabIndex === value.tabIndex) {
        for (const res of this.resList){
          res.resMenu = value.resMenu;
        }
        this.cdRef.detectChanges();
        value.token = false;
      }
    });

    this.subscribers.sortRes = this.resService.sortRes.subscribe((value) => {
      if (this.tabIndex === value.tabIndex) {
        this.resList.sort((a, b) => {
          return a.num - b.num;
        });
        this.cdRef.detectChanges();
        value.token = false;
      }
    });

  }

  /**
   * Unsubscribe the completed service subscribers
   */
  ngOnDestroy(){
    this.subscribers.LoadHiddenIds.unsubscribe();
    // this.subscribers.scrollPos.unsubscribe();
    this.subscribers.moveRes.unsubscribe();
    this.subscribers.selectCommand.unsubscribe();
    this.subscribers.selectedTab.unsubscribe();
    this.subscribers.printCommand.unsubscribe();
    this.subscribers.saveResStatus.unsubscribe();
    this.subscribers.status.unsubscribe();
    this.subscribers.resMenu.unsubscribe();
    this.subscribers.sortRes.unsubscribe();
    this.resList.length = 0;
    if (this.backupResList !== undefined){
      this.backupResList.length = 0;
    }
    if (this.originalResList !== undefined){
      this.originalResList.length = 0;
    }
  }

  /**
   * ショートカットキー値を設定します。
   */
  setHotKeys(){
    // 選択ボタン
    if (this.subHotKeys.hasOwnProperty('sentaku_no1')) {
      this.hotkeysService.add(new Hotkey([this.subHotKeys.sentaku_no1,
        this.subHotKeys.sentaku_no2, this.subHotKeys.sentaku_no3], (event: KeyboardEvent): boolean => {
        this.selectHoveredRes(true);
        return false;
      }));

      // 予備選択ボタン1
      this.hotkeysService.add(new Hotkey(this.subHotKeys.yobi1, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          if (this.resList[this.hovered].resSelect === 'candi1') {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[0];
            this.selectedRes(this.resList[this.hovered],
              {selected: 'select'});
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
              { selected: 'select'});
          } else {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[3];
            this.selectedRes(this.resList[this.hovered],
              { selected: 'candi2'});
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
              { selected: 'select'});
          } else {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[3];
            this.selectedRes(this.resList[this.hovered],
              { selected: 'candi3'});
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
              { selected: 'select'});
          } else {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[3];
            this.selectedRes(this.resList[this.hovered],
              { selected: 'candi4'});
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
          this.resList[this.hovered].resColor = '#f00';
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
            { isSelect: true,
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
            { isSelect: true,
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
            { isSelect: true,
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
            { isSelect: true,
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
            { isSelect: false,
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
            { isSelect: false,
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
            { isSelect: false,
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
            { isSelect: false,
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
          if (this.resList[this.hovered].resSelect === 'select') {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[0];
            this.selectedRes(this.resList[this.hovered], {
              selected: 'none'
            });
          }
        }
        return false;
      }));

      // ID色消
      this.hotkeysService.add(new Hotkey(this.subHotKeys.id_irokesi, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedId(this.resList[this.hovered].id,
            { isSelect: false,
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
          if (this.resList[this.hovered].resSelect === 'select') {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[0];
            this.selectedRes(this.resList[this.hovered], {
              selected: 'none'
            });
          }
          this.selectedId(this.resList[this.hovered].id,
            { isSelect: false,
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
          if (this.resList[this.hovered].isMenuOpen === undefined){
            this.resList[this.hovered].isMenuOpen = true;
          }else{
            this.resList[this.hovered].isMenuOpen = !this.resList[this.hovered].isMenuOpen;
          }
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
        if (this.btnSearch.checked) {
          this.btnSearch.checked = false;
          this.btnSearchChangeHandler();
        }
        return false; // Prevent bubbling
      }));

      // 抽出
      this.hotkeysService.add(new Hotkey('ctrl+enter', (event: KeyboardEvent): boolean => {
        if (!this.btnSearch.checked) {
          this.btnSearch.checked = true;
          this.btnSearchChangeHandler();
        }
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
    }
  }

  /**
   * Move the scroll of res list
   * @param moveKind: 'top', 'bottom', 'selected-top', 'selected-bottom'
   */
  moveScroller(moveKind: string){

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
        for (const item of this.resList){
          if (item.resSelect === 'select'
            || (item.resSelect === 'candi1' && this.moveOption.sentaku_idou1)
            || (item.resSelect === 'candi2' && this.moveOption.sentaku_idou2)){
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
              || (this.resList[i].resSelect === 'candi2' && this.moveOption.sentaku_idou2)) {
              this.currentScrollIndex = i;
              this.virtualScroller.scrollToIndex(i);
              break;
            }
          }
        }
        break;
      case 'selected-prev':
        if (this.virtualScroller.viewPortInfo.startIndex  >= 0) {
          for (let i = this.virtualScroller.viewPortInfo.startIndex - 1; i >= 0; i--) {
            if (this.resList[i].resSelect === 'select'
              || (this.resList[i].resSelect === 'candi1' && this.moveOption.sentaku_idou1)
              || (this.resList[i].resSelect === 'candi2' && this.moveOption.sentaku_idou2)) {
              this.virtualScroller.scrollToIndex(i);
              this.currentScrollIndex = i;
              break;
            }
          }
        }
        break;
      case 'selected-next':
        let curIndex;
        if (this.currentScrollIndex - 1 === this.virtualScroller.viewPortInfo.startIndex){
          curIndex = this.currentScrollIndex + 1;
        }else{
          curIndex = this.virtualScroller.viewPortInfo.startIndex + 1;
        }

        for (let i = curIndex; i < this.resList.length; i++) {
          if (this.resList[i].resSelect === 'select'
            || (this.resList[i].resSelect === 'candi1' && this.moveOption.sentaku_idou1)
            || (this.resList[i].resSelect === 'candi2' && this.moveOption.sentaku_idou2)) {
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
    moveItemInArray(this.resList, this.selectedResIndex,
      this.selectedResIndex + (event.currentIndex - event.previousIndex));
    this.resList = [...this.resList];
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
    this.resList.splice(index + 1, 0, cloneItem);
    this.cdRef.detectChanges();
    this.changeStatus();
    // this.resList = [...this.resList];
    this.resService.setTotalRes({
      tabIndex: this.tabIndex,
      totalCount: this.resList.length
    });
  }

  /**
   * IDを非表示します。
   * @param resId:非表示ID
   */
  hideRes(resId: string) {
    this.hiddenIds = [...this.hiddenIds, resId];
    this.resService.setHiddenIds(this.hiddenIds);
  }

  /**
   * 上に移動します。
   * @param item: 移動レス
   */
  moveUpRes(item: any) {
    const index = this.resList.indexOf(item);
    moveItemInArray(this.resList, index, index - 1);
    this.resList = [...this.resList];
  }

  /**
   * 下に移動します。
   * @param item: 移動レス
   */
  moveDownRes(item: any) {
    const index = this.resList.indexOf(item);
    moveItemInArray(this.resList, index, index + 1);
    this.resList = [...this.resList];
  }

  /**
   * レスを一番上に移動
   * @param item: 移動レス
   */
  moveResToTop(item: any) {
    const index = this.resList.indexOf(item);
    const tmpRes = Object.assign({}, item);
    this.resList.splice(index, 1);
    this.resList.splice(0, 0, tmpRes);
    this.resList = [...this.resList];
    // this.virtualScroller.scrollToIndex(0);
  }

  /**
   * レスを一番下に移動
   * @param item: 移動レス
   */
  moveResToBottom(item: any) {
    const index = this.resList.indexOf(item);
    const tmpRes = Object.assign({}, item);
    this.resList.splice(index, 1);
    this.resList.push(tmpRes);
    this.resList = [...this.resList];
    // this.virtualScroller.scrollToIndex(this.resList.length);
  }

  /**
   * レスを選択
   * @param item: 選択レス
   * @param $event: event
   */
  selectedRes(item: any, $event: any) {
    item.resSelect = $event.selected;
    this.resList = [...this.resList];
    this.changeStatus();
    this.cdRef.detectChanges();
  }

  cancelSelectedIdRes(id: any, $event: any) {
    for (const res of this.resList){
      if (res.id === id && res.resSelect === 'select'){
        res.resBackgroundColor = this.backgroundColors[0];
        res.resSelect = 'none';
      }
    }
    this.changeStatus();
  }

  changeStatus(){
    this.selectCount = this.resList.filter(item => item.resSelect === 'select').length;
    this.candi1Count = this.resList.filter(item => item.resSelect === 'candi1').length;
    this.candi2Count = this.resList.filter(item => item.resSelect === 'candi2').length;
    this.candi3Count = this.resList.filter(item => item.resSelect === 'candi3').length;
    this.candi4Count = this.resList.filter(item => item.resSelect === 'candi4').length;
    this.cdRef.detectChanges();
    this.resService.setSelectedRes({
      select: this.selectCount,
      candi1: this.candi1Count,
      candi2: this.candi2Count,
      candi3: this.candi3Count,
      candi4: this.candi4Count,
      tabIndex: this.tabIndex
    });
  }

  selectedId(id: any, $event: any) {
    for (const res of this.resList){
      if (res.id === id){
        res.idBackgroundColor = $event.idBackgroundColor;
        res.idColor = $event.idColor;
        res.idClassNoSelect = $event.idClassNoSelect;
        if ($event.isSelect) {
          res.resBackgroundColor = $event.resBackgroundColor;
          res.resSelect = 'select';
        }
      }
    }
    this.changeStatus();
  }

  selectedTreeRes(index: number, $event: any) {
    const selectKeys = ['none', 'select', 'candi1', 'candi2', 'candi3', 'candi4'];
    if (index < this.resList.length - 1 && (this.resList[index + 1].isAdded || this.resList[index].isAdded)) {
      this.resList[index].resSelect = selectKeys[$event.select];
      this.resList[index].resBackgroundColor = $event.resBackgroundColor;
      // this.calcSelectedRes($event.select, this.resList[index]);
      if (this.resList[index].isAdded){
        let i = index;
        do {
          i--;
          this.resList[i].resSelect = selectKeys[$event.select];
          this.resList[i].resBackgroundColor = $event.resBackgroundColor;
          // this.calcSelectedRes($event.select, this.resList[i]);
        }
        while (this.resList[i].isAdded && i > -1);
        i = index + 1;
        while (this.resList[i].isAdded && i < this.resList.length){
          this.resList[i].resSelect = selectKeys[$event.select];
          this.resList[i].resBackgroundColor = $event.resBackgroundColor;
          // this.calcSelectedRes($event.select, this.resList[i]);
          i++;
        }
      }else if (this.resList[index + 1]) {
        for (let i = index + 1; i < this.resList.length; i++) {
          if (!this.resList[i].isAdded) {
            break;
          }
          this.resList[i].resSelect = selectKeys[$event.select];
          this.resList[i].resBackgroundColor = $event.resBackgroundColor;
          // this.calcSelectedRes($event.select, this.resList[i]);
        }
      }

    }
    this.changeStatus();
  }

  // calcSelectedRes(selectKind: number, item: ResItem){
  //   switch (selectKind) {
  //     case 0:
  //       item.select = false;
  //       item.candi1 = false;
  //       item.candi2 = false;
  //       break;
  //     case 1:
  //       item.select = true;
  //       item.candi1 = false;
  //       item.candi2 = false;
  //       break;
  //     case 2:
  //       item.select = false;
  //       item.candi1 = true;
  //       item.candi2 = false;
  //       break;
  //     case 3:
  //       item.select = false;
  //       item.candi1 = false;
  //       item.candi2 = true;
  //       break;
  //   }
  // }


  mouseEnterHandler(index: number) {
    this.hovered = index;
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
    if ($event){
      this.draggable = index;
    }else{
      this.draggable = -1;
    }
  }

  multiSelection(command: string){

    // for (let i = this.virtualScroller.viewPortInfo.startIndex; i <= this.virtualScroller.viewPortInfo.endIndex; i++){
    for (const res of this.resList){
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

  cancelSearchResText(){
    for (const res of this.resList){
      res.content = res.content.replace(/(<span[^<]+>)/ig, '');
      res.content = res.content.replace(/<\/span>/ig, '');
      if (this.searchOption === 'all'){
        res.id = res.id.replace(/(<span[^<]+>)/ig, '');
        res.id = res.id.replace(/<\/span>/ig, '');
        res.name = res.name.replace(/(<span[^<]+>)/ig, '');
        res.name = res.name.replace(/<\/span>/ig, '');
      }
      res.isFiltered = false;
      res.isSearched = false;
    }
    this.startInRes = 0;
    this.searchedRes = 0;
    // this.isChangedSearch = true;
  }

  searchResText(){
    const keyword = this.searchKeyword.trim().replace(/\s+/gi, '|');
    if (this.searchList.indexOf(this.searchKeyword.trim()) === -1){
      if (this.searchList.length >= this.searchWordMax){
        this.searchList.splice(this.searchList.length - 1, 1);
      }
      this.searchList.splice(0, 0, this.searchKeyword.trim());
    }else{
      const searchIndex = this.searchList.indexOf(this.searchKeyword.trim());
      moveItemInArray(this.searchList, searchIndex, 0);
    }
    // const re = new RegExp(`(?<!<[^>]*)${keyword}`, 'gi');
    const re = new RegExp(`(?![^<>]*>)${keyword}(?![&gt;])`, 'gi');

    for (let i = 0; i < this.resList.length; i++){
      if (this.searchOption === 'num'){
        if (re.test(String(this.resList[i].num))){
          // this.resList[i].num = this.resList[i].num.replace(re, `<span style="background-color: ${this.hitColor};">$&</span>`);
          this.resList[i].isSearched = true;
          this.resList[i].originalIndex = i;
        }
      }else {
        if (this.resList[i].content.match(re) !== null) {
          this.resList[i].content = this.resList[i].content.replace(re, `<span style="background-color: ${this.hitColor};">$&</span>`);
          this.resList[i].isSearched = true;
          this.resList[i].originalIndex = i;
        }
        if (this.searchOption === 'all') {
          if (this.resList[i].name.match(re) || this.resList[i].id.match(re)) {
            this.resList[i].id = this.resList[i].id.replace(re, `<span style="background-color: ${this.hitColor};">$&</span>`);
            this.resList[i].name = this.resList[i].name.replace(re, `<span style="background-color: ${this.hitColor};">$&</span>`);
            this.resList[i].isSearched = true;
            this.resList[i].originalIndex = i;
          }
        }
      }
    }
    this.startInRes = 0;
    this.searchedRes = 0;
    this.isChangedSearch = false;
  }

  abstractRes(){
    this.backupResList = Object.assign([], this.resList);
    if (!this.btnNotice.checked){
      this.originalResList = Object.assign([], this.resList);
    }
    let tmpResList = [];
    // for (let i = 0; i < this.resList.length; i++){
    //   if (this.resList[i].isSearched) {
    //     this.resList[i].isFiltered = true;
    //     tmpResList = [...tmpResList, this.resList[i]];
    //   }else {
    //     if (i < this.resList.length - 1){
    //       if (this.resList[i + 1].isSearched && this.resList[i + 1].isAdded){
    //         this.resList[i].originalIndex = i;
    //         tmpResList = [...tmpResList, this.resList[i]];
    //         this.resList[i].isFiltered = true;
    //         continue;
    //       }
    //     }
    //     if (i > 0 && this.resList[i].isAdded && this.resList[i - 1].isFiltered){
    //       this.resList[i].originalIndex = i;
    //       tmpResList = [...tmpResList, this.resList[i]];
    //       this.resList[i].isFiltered = true;
    //     }
    //   }
    // }
    console.log(this.isTreeSearch);
    for (let i = 0; i < this.resList.length; i++) {
      if (this.resList[i].isSearched){
        this.resList[i].isFiltered = true;
        if (this.isTreeSearch) {
          if (this.resList[i].isAdded) {
            let j = i - 1;
            if (j > -1) {
              while (j > -1 && this.resList[j].isAdded) {
                this.resList[j].isFiltered = true;
                j--;
              }
              this.resList[j].isFiltered = true;
            }
            j = i + 1;
            if (j < this.resList.length) {
              while (j < this.resList.length && this.resList[j].isAdded) {
                this.resList[j].isFiltered = true;
                j++;
              }
            }
            i = j;
          } else if (i < this.resList.length - 1 && this.resList[i + 1]) {
            let j = i + 1;
            while (j < this.resList.length && this.resList[j].isAdded) {
              this.resList[j].isFiltered = true;
              j++;
            }
          }
        }
      }
    }
    for (const res of this.resList){
      if (res.isFiltered) {
        tmpResList = [...tmpResList, res];
      }
    }
    this.resList = [];
    this.resList = tmpResList;
    this.changeStatus();
    this.resService.setTotalRes({
      tabIndex: this.tabIndex,
      totalCount: this.resList.length
    });
  }

  btnSearchChangeHandler() {
    if (this.btnSearch.checked){
      if (this.searchKeyword === undefined || this.searchKeyword.length === 0 || this.searchKeyword.match(/^\s+$/) !== null) {
        this.btnSearch.checked = false;
      }else{
        this.cancelSearchResText();
        this.searchResText();
        this.abstractRes();
      }
    }else{
      this.resList = Object.assign([], this.backupResList);
      this.cancelSearchResText();
      this.changeStatus();
      this.isChangedSearch = true;
      this.resService.setTotalRes({
        tabIndex: this.tabIndex,
        totalCount: this.resList.length
      });
    }
    this.filteredEmitter.emit(this.btnSearch.checked);
  }

  selectedNum(resItem: ResItem) {
    if (resItem.originalIndex !== null) {
      moveItemInArray(this.backupResList, resItem.originalIndex, 0);
    }
    this.btnSearch.checked = false;
    this.btnSearchChangeHandler();
    this.virtualScroller.scrollToIndex(0);
  }

  btnNoticeChangeHandler() {
    if (this.btnNotice.checked){
      this.noticeBackupResList = Object.assign([], this.resList);
      if (!this.btnSearch.checked){
        this.originalResList = Object.assign([], this.resList);
      }
      let tmpResList = [];
      for (const res of this.resList){
        if (res.isNotice) {
          tmpResList = [...tmpResList, res];
        }
      }
      this.resList = [];
      this.resList = tmpResList;
      this.changeStatus();
      this.resService.setTotalRes({
        tabIndex: this.tabIndex,
        totalCount: this.resList.length
      });
    }else{
      this.resList = Object.assign([], this.noticeBackupResList);
      this.changeStatus();
      this.resService.setTotalRes({
        tabIndex: this.tabIndex,
        totalCount: this.resList.length
      });
    }
  }

  txtSearchKeyUpHandler($event: KeyboardEvent) {
    if (this.searchOption === undefined){
      return;
    }
    if ($event.ctrlKey && $event.shiftKey && $event.code === 'Enter'){
      this.btnSearch.checked = !this.btnSearch.checked;
      this.btnSearchChangeHandler();
    }else if ($event.shiftKey && $event.code === 'Enter'){
      this.isChangedSearch = false;
      if (this.searchOption !== undefined && this.searchOption.length > 0) {
        let isExist = false;
        while (true) {
          if (this.searchedRes > this.resList.length - 1){
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
            if (this.searchedRes >= 0){
              this.startInRes = this.resList[this.searchedRes].content.length - 1;
            }
          }
        }
        if (isExist){
          for (const res of this.resList){
            res.content = res.content.replace(`<span style="background-color: ${this.highLightColor};">`, `<span style="background-color: ${this.hitColor};">`);
          }
          const re = new RegExp(`<span style="background-color: ${this.hitColor};">`, 'gi');
          this.resList[this.searchedRes].content = this.resList[this.searchedRes].content.replace(re, (match, offset) => {
            let result = match;
            if (this.startInRes === offset){
              result = `<span style="background-color: ${this.highLightColor};">`;
            }
            return result;
          });
          // this.startInRes -= `<span style="background-color: ${this.highLightColor};">`.length;
          this.virtualScroller.scrollToIndex(this.searchedRes);
        }
      }
    } else if ($event.code === 'Enter'){
      if (this.isChangedSearch) {
        if (this.searchKeyword === undefined){
          return;
        }
        if (this.searchKeyword.match(/^\s+$/g) !== null || this.searchKeyword.length === 0) {
          this.cancelSearchResText();
        } else {
          this.cancelSearchResText();
          this.searchResText();
        }
      }else{
        if (this.searchOption !== undefined && this.searchOption.length > 0){
          let isExist = false;
          while (true){
            if (this.searchedRes < 0){
              this.searchedRes = 0;
            }
            if (this.searchedRes < this.virtualScroller.viewPortInfo.startIndex){
              this.searchedRes = this.virtualScroller.viewPortInfo.startIndex;
            }
            if (this.searchedRes > this.resList.length - 1){
              break;
            }

            this.startInRes = this.resList[this.searchedRes].content.indexOf(`<span style="background-color: ${this.hitColor};">`,
              this.startInRes);
            if (this.startInRes !== -1){
              isExist = true;
              break;
            }
            // this.startInRes++;
            if (this.startInRes === -1){
              this.startInRes = 0;
              this.searchedRes++;
            }
          }
          if (isExist){
            for (const res of this.resList){
              res.content = res.content.replace(`<span style="background-color: ${this.highLightColor};">`, `<span style="background-color: ${this.hitColor};">`);
            }
            const re = new RegExp(`<span style="background-color: ${this.hitColor};">`, 'gi');
            this.resList[this.searchedRes].content = this.resList[this.searchedRes].content.replace(re, (match, offset) => {
              let result = match;
              if (this.startInRes === offset){
                result = `<span style="background-color: ${this.highLightColor};">`;
              }
              return result;
            });
            this.startInRes += `<span style="background-color: ${this.highLightColor};">`.length;
            this.virtualScroller.scrollToIndex(this.searchedRes);
          }

        }
      }
    }else{
      // console.log(this.searchKeyword);
      // this.searchStatusEmitter.emit({
      //   searchKeyword: this.searchKeyword,
      //   searchOption: this.searchOption
      // });
    }
  }



  private async printHtmlTag() {
    $.LoadingOverlay('show', {
      imageColor: '#ffa07a',
    });
    let printResList = [];
    if (this.btnNotice.checked || this.btnSearch.checked){
      printResList = this.originalResList;
    }else{
      printResList = this.resList;
    }
    const htmlTag = await this.resService.printHtmlTag(printResList, {
      tabName: this.tabName,
      txtURL: this.txtURL,
      twitter: this.twitter,
      youtube: this.youtube,
      shuturyoku: this.shuturyoku,
      resSizeList: this.resSizeList,
      characterColors: this.characterColors,
      startAbbreviations: this.startAbbreviations,
      endAbbreviations: this.endAbbreviations,
      isAll: false
    });

    this.resService.setPrintHtml({tabIndex: this.tabIndex, html: htmlTag});
    $.LoadingOverlay('hide');
  }

  tglSearchChangeHandler() {
    this.searchStatusEmitter.emit({
      searchKeyword: this.searchKeyword,
      searchOption: this.searchOption,
      searchList: this.searchList,
    });
  }

  txtSearchChangeHandler($event: any) {
    this.isChangedSearch = true;
    this.searchStatusEmitter.emit({
      searchKeyword: this.searchKeyword,
      searchOption: this.searchOption,
      searchList: this.searchList,
    });
  }

  selectHoveredRes(canUnselect){
    if (this.hovered >= 0) {
      if (this.resList[this.hovered].resSelect === 'select' && canUnselect) {
        this.resList[this.hovered].resBackgroundColor = this.backgroundColors[0];
        this.selectedRes(this.resList[this.hovered],
          {select: false, candi1: false, candi2: false, selected: 'none'});

      } else {
        this.resList[this.hovered].resBackgroundColor = this.backgroundColors[1];
        this.selectedRes(this.resList[this.hovered],
          {select: true, candi1: false, candi2: false, selected: 'select'});
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
      totalCount: this.resList.length
    });
  }
}
