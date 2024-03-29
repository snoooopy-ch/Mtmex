import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit, QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {ResService} from '../res.service';
import {Title} from '@angular/platform-browser';
import {TabDirective, TabsetComponent} from 'ngx-bootstrap/tabs';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {Hotkey, HotkeysService} from 'angular2-hotkeys';
import {ResItem} from '../models/res-item';
import {ContentComponent} from './content/content.component';
import {retry} from "rxjs/operators";

const electron = (window as any).require('electron');
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrls: ['./left-panel.component.scss'],
})
export class LeftPanelComponent implements OnInit, OnDestroy {
  @ViewChild('tabGroup') tabGroup: TabsetComponent;
  @ViewChildren(ContentComponent) contentComponent!: QueryList<ContentComponent>;

  tabs = [];
  draggable = {
    data: 'myDragData',
    effectAllowed: 'all',
    disable: false,
    handle: false,
  };
  selectedTabIndex = 0;
  settings;
  backgroundColors;
  hovergroundColors;
  leftBorder;
  idStyles;
  resSizeList;
  tabWidth;
  hitColor;
  idRed;
  // chuumoku: number;
  noticeCount: number;
  subHotKeys = [];
  public subscribers: any = {};
  shuturyoku: true;
  youtube: false;
  twitter: false;
  resMouseClick: false;
  searchKeyword: string;
  searchOption = 'context';
  private previousTabId: number;
  private currentTabId: number;
  topBorder: string;
  btnBackgroundColors: any[];
  leftHightlight: true;
  moveOption: any;
  txtRemarkRes: any;
  resTopBar: any;
  imageWidth: string;
  startAbbreviations;
  endAbbreviations;
  resLeftMargin: number;
  searchList: any[];
  isYoutubeUrl: boolean;
  isTwitterUrl: boolean;
  private isWait: boolean;
  public isAllTab: boolean;
  public allCount: { 
    select: number; 
    candi3: number; 
    candi4: number; 
    candi1: number; 
    candi2: number; 
    candi5: number; 
    candi6: number; 
    candi7: number; 
    candi8: number };

  constructor(private resService: ResService, private cdr: ChangeDetectorRef, private titleService: Title,
              private hotkeysService: HotkeysService, private zone: NgZone) {
    this.isAllTab = false;
    this.allCount = {
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

    this.subscribers.searchList = this.resService.searchListSource.subscribe((value) => {
      this.searchList = value;
    });

    this.subscribers.settings = this.resService.settings.subscribe((value) => {
      this.settings = value;
      this.backgroundColors = [this.settings.Back_color,
        this.settings.Sentaku_back,
        this.settings.YobiSentaku1_back,
        this.settings.YobiSentaku2_back,
        this.settings.YobiSentaku3_back,
        this.settings.YobiSentaku4_back,
        this.settings.YobiSentaku5_back,
        this.settings.YobiSentaku6_back,
        this.settings.YobiSentaku7_back,
        this.settings.YobiSentaku8_back,
      ];
      this.hovergroundColors = [this.settings.Mouseover,
        this.settings.Sentaku_MouseOver,
        this.settings.Yobi1_MouseOver,
        this.settings.Yobi2_MouseOver,
        this.settings.Yobi3_MouseOver,
        this.settings.Yobi4_MouseOver,
        this.settings.Yobi5_MouseOver,
        this.settings.Yobi6_MouseOver,
        this.settings.Yobi7_MouseOver,
        this.settings.Yobi8_MouseOver,
      ];
      this.leftBorder = `6px solid ${this.settings.Left_border}`;
      this.resLeftMargin = this.settings.anker_left;
      this.idStyles = [{color: '#000', background: 'transparent', classNoSelect: ''},
        {color: this.settings.ID1_moji, background: this.settings.ID1_back, classNoSelect: 'same_id1'},
        {color: this.settings.ID2_moji, background: this.settings.ID2_back, classNoSelect: 'same_id2'},
        {color: this.settings.ID3_moji, background: this.settings.ID3_back, classNoSelect: 'same_id3'},
        {color: this.settings.ID4_moji, background: this.settings.ID4_back, classNoSelect: 'same_id4'}];
      this.topBorder = `6px solid ${this.settings.Chuui_gatti_border}`;
      this.resSizeList = [
        {
          name: '小',
          value: `${this.settings['font-size1']}px`,
          selected: true
        },
        {
          name: '中',
          value: `${this.settings['font-size2']}px`,
          selected: false
        },
        {
          name: '大',
          value: `${this.settings['font-size3']}px`,
          selected: false
        }
      ];
      this.tabWidth = `${this.settings.tab_haba - 10}px`;
      this.hitColor = this.settings.hit_back_color;
      this.idRed = this.settings.id_red;
      this.noticeCount = this.settings.noticeCount;
      this.shuturyoku = this.settings.shuturyoku;
      this.youtube = this.settings.youtube;
      this.twitter = this.settings.twitter;
      this.isYoutubeUrl = this.settings.youtube_url;
      this.isTwitterUrl = this.settings.twitter_url;
      this.resMouseClick = this.settings.res_mouse_click;
      this.leftHightlight = this.settings.Left_highlight;
      this.subHotKeys = [];
      if (value.hasOwnProperty('sentaku_no1')) {
        const arrayKeys = ['sentaku_no1', 'sentaku_no2', 'sentaku_no3', 'yobi1', 'yobi2', 'yobi3', 'yobi4', 'yobi5', 'yobi6', 'yobi7', 'yobi8', 'up', 'down'
          , 'big0', 'big1', 'big2', 'nasi', 'color1', 'color2', 'color3', 'color4', 'color5', 'color6', 'color7', 'color8'
          , 'color9', 'color10', 'tree_sentaku', 'tree_yobi1', 'tree_yobi2', 'tree_yobi3', 'tree_yobi4'
          , 'tree_yobi5', 'tree_yobi6', 'tree_yobi7', 'tree_yobi8', 'tree_kaijo'
          , 'id1', 'id2', 'id3', 'id4', 'id_iro1', 'id_iro2', 'id_iro3', 'id_iro4', 'id_kaijo', 'id_irokesi', 'id_kaijo_irokesi'
          , 'id_hihyouji', 'henshuu', 'sakujo', 'menu_kaihei', 'chuumoku', 'chuushutu_kaijo', 'res_area_move_top', 'res_area_move_bottom'
          , 'res_area_move1a', 'res_area_move1b', 'res_area_move2a', 'res_area_move2b', 'sentaku_res_gamen'
          , 'menu1', 'menu2', 'menu3', 'res_most_up', 'res_most_down', 'sentaku_off1', 'sentaku_off2', 'sounyuu'
          , 'all_tab_chuushutu', 'all_tab_chuushutu_kaijo', 'res_sinshuku', 'chuushutu', 'chuushutu_chuushutukaijo'];
        for (const key of arrayKeys) {
          if (this.settings[key].toLowerCase() === 'insert') {
            this.subHotKeys[key] = 'ins';
          } else if (this.settings[key].toLowerCase() === 'delete') {
            this.subHotKeys[key] = 'del';
          } else {
            this.subHotKeys[key] = this.settings[key].toLowerCase();
          }
        }
      }
      this.btnBackgroundColors = [];
      if (value.hasOwnProperty('color_tree_sentaku')) {
        const colorKeys = ['color_tree_sentaku', 'color_tree_yobi_sentaku1', 'color_tree_yobi_sentaku2', 'color_tree_yobi_sentaku3',
          'color_tree_yobi_sentaku4', 'color_tree_yobi_sentaku5', 'color_tree_yobi_sentaku6', 'color_tree_yobi_sentaku7',
          'color_tree_yobi_sentaku8', 'color_tree_kaijo', 'color_id_sentaku1', 'color_id_sentaku2', 'color_id_sentaku3',
          'color_id_sentaku4', 'color_id_iro1', 'color_id_iro2', 'color_id_iro3', 'color_id_iro4', 'color_id_kaijo',
          'color_id_iro_delete', 'color_id_kaijo_iro_delete', 'color_id_hihyouji', 'color_copy', 'color_edit'];
        for (const key of colorKeys) {
          this.btnBackgroundColors[key] = this.settings[key];
        }
      }
      this.startAbbreviations = [];
      if (value.hasOwnProperty('moji_color_start1')) {
        const startAbbrKeys = ['moji_color_start1', 'moji_color_start2', 'moji_color_start3', 'moji_color_start4',
          'moji_color_start5', 'moji_color_start6', 'moji_color_start7', 'moji_color_start8', 'moji_color_start9',
          'moji_color_start10'];
        for (const key of startAbbrKeys) {
          this.startAbbreviations.push(this.settings[key]);
        }
      }
      this.endAbbreviations = [];
      if (value.hasOwnProperty('moji_color_end1')) {
        const endAbbrKeys = ['moji_color_end1', 'moji_color_end2', 'moji_color_end3', 'moji_color_end4',
          'moji_color_end5', 'moji_color_end6', 'moji_color_end7', 'moji_color_end8', 'moji_color_end9',
          'moji_color_end10'];
        for (const key of endAbbrKeys) {
          this.endAbbreviations.push(this.settings[key]);
        }
      }
      this.moveOption = {
        sentaku_idou1: this.settings.sentaku_idou1,
        sentaku_idou2: this.settings.sentaku_idou2,
        sentaku_idou3: this.settings.sentaku_idou3,
        sentaku_idou4: this.settings.sentaku_idou4,
        sentaku_idou5: this.settings.sentaku_idou5,
        sentaku_idou6: this.settings.sentaku_idou6,
        sentaku_idou7: this.settings.sentaku_idou7,
        sentaku_idou8: this.settings.sentaku_idou8
      };

      if (this.settings.chuui !== undefined) {
        this.txtRemarkRes = this.settings.chuui;
      }

      if (this.settings.top_bar !== undefined) {
        this.resTopBar = `1px solid ${this.settings.top_bar}`;
      }

      if (this.settings.pict_hyouji === undefined) {
        this.imageWidth = '150px';
      } else {
        this.imageWidth = `${this.settings.pict_hyouji}px`;
      }

      this.setHotKeys();
    });

    this.subscribers.resData = this.resService.resData.subscribe((value) => {
      if (this.tabGroup === undefined) {
        return;
      }
      this.zone.run(() => {
        $.LoadingOverlay('show', {
          imageColor: '#ffa07a',
        });
        // this.isAllTab = true;
        const numberSuffixes = value.originSreTitle.match(/(_|-)(\d+)/gi);
        let suffixNumber;
        if (numberSuffixes?.length > 0) {
          suffixNumber = numberSuffixes[0].replace(/(_|-)/i, '');
        }
        this.addTab(value.sreTitle, value.resList, value.originSreTitle, '', suffixNumber);
        this.selectedTabIndex = this.tabs.length - 1;
        this.titleService.setTitle(`${this.tabs[this.selectedTabIndex].title} - スレ編集`);

        this.resService.setTotalRes({
          tabIndex: this.selectedTabIndex,
          totalCount: value.resList.length,
          title: this.tabs[this.selectedTabIndex].title,
          rightToken: true,
          statusToken: true
        });

        const selectCount = value.resList.filter(item => item.resSelect === 'select').length;
        const candi1Count = value.resList.filter(item => item.resSelect === 'candi1').length;
        const candi2Count = value.resList.filter(item => item.resSelect === 'candi2').length;
        const candi3Count = value.resList.filter(item => item.resSelect === 'candi3').length;
        const candi4Count = value.resList.filter(item => item.resSelect === 'candi4').length;
        const candi5Count = value.resList.filter(item => item.resSelect === 'candi5').length;
        const candi6Count = value.resList.filter(item => item.resSelect === 'candi6').length;
        const candi7Count = value.resList.filter(item => item.resSelect === 'candi7').length;
        const candi8Count = value.resList.filter(item => item.resSelect === 'candi8').length;

        this.resService.setSelectedRes({
          select: selectCount,
          candi1: candi1Count,
          candi2: candi2Count,
          candi3: candi3Count,
          candi4: candi4Count,
          candi5: candi5Count,
          candi6: candi6Count,
          candi7: candi7Count,
          candi8: candi8Count,
          tabIndex: this.selectedTabIndex,
          title: this.tabs[this.selectedTabIndex].title,
          rightToken: true,
          statusToken: true
        });
        this.cancelInitialStyle();
        // setTimeout(this.cancelInitialStyle.bind(this), 2000);
      });

    });

    this.subscribers.loadStatus = this.resService.loadResStatuses.subscribe((value) => {
      if (this.tabGroup === undefined) {
        return;
      }
      if (value.data.length > 0) {
        this.zone.run(() => {
          $.LoadingOverlay('show', {
            imageColor: '#ffa07a',
          });
          // this.isAllTab = true;
          let index = 1;
          let allResCount = 1;
          for (const loadData of value.data) {
            this.loadStatusFile(loadData);
            allResCount += loadData.resList.length;
            index++;
          }

          this.cancelInitialStyle();
          // setTimeout(this.cancelInitialStyle.bind(this), allResCount * 2);
        });
      }
    });

    this.subscribers.allPrint = this.resService.printAllCommand.subscribe((value) => {
      if (value.token) {
        if (value.isOutputCandiBelow) {
          this.printIntegrateAllHtmlTag(value.isOutputCandiBelow, value.isReplaceName, value.isSurroundImage, value.gazouReplaceUrl);
        } else {
          this.printNormalAllHtmlTag(value.isOutputCandiBelow, value.isReplaceName, value.isSurroundImage, value.gazouReplaceUrl);
        }
      }
    });

    this.subscribers.displayAllSelectRes = this.resService.displayAllSelectRes.subscribe((value) => {

      if (value.token) {
        if(this.contentComponent.length > 1) {
          $.LoadingOverlay('show', {
            imageColor: '#ffa07a',
          });
          // this.isAllTab = true;
        }
        let count = 0;
        for (const item of this.contentComponent) {
          item.showSelectedRes(value.display);
          if (!value.display){
            this.tabs[count].isFiltered = false;
          }
          count++;
        }
        if(this.contentComponent.length > 1) {
          this.cancelInitialStyle();
          // setTimeout(this.cancelInitialStyle.bind(this), 2000);
        }
      }
      value.token = false;
    });

    this.subscribers.allResMenu = this.resService.allResMenu.subscribe((value) => {
      if (value.token) {
        for (let i = 0; i < this.tabs.length; i++) {
          this.resService.setResMenu({
            tabIndex: i,
            token: true,
            resMenu: value.resMenu
          });
        }
      }
      value.token = false;
    });

    electron.ipcRenderer.on('closeMenu', (event) => {
      this.removeTab(this.selectedTabIndex);
    });

    if (this.searchList === undefined) {
      this.searchList = [];
    }
  }

  /**
   * Unsubscribe the completed service subscribers
   */
  ngOnDestroy() {
    this.subscribers.settings.unsubscribe();
    this.subscribers.resData.unsubscribe();
    this.subscribers.displayAllSelectRes.unsubscribe();
    this.subscribers.status.unsubscribe();
    this.subscribers.loadStatus.unsubscribe();
    this.subscribers.allPrint.unsubscribe();
  }

  async waitFor() {
    while (true) {
      if (!this.isWait) {
        return;
      }
      await null;
    }
  }

  setHotKeys() {
    // 前のタブ
    if (this.settings.tab_prev !== undefined) {
      this.hotkeysService.add(new Hotkey(this.settings?.tab_prev.toLowerCase(), (event: KeyboardEvent): boolean => {
        let prevTabIndex = this.selectedTabIndex - 1;
        if (prevTabIndex < 0) {
          prevTabIndex = this.tabs.length - 1;
        }
        this.tabChangedHandler(prevTabIndex);
        return false;
      }));
    }
    // 次のタブ
    if (this.settings.tab_next !== undefined) {
      this.hotkeysService.add(new Hotkey(this.settings?.tab_next.toLowerCase(), (event: KeyboardEvent): boolean => {
        let prevTabIndex = this.selectedTabIndex + 1;
        if (prevTabIndex > this.tabs.length - 1) {
          prevTabIndex = 0;
        }
        this.tabChangedHandler(prevTabIndex);
        return false;
      }));
    }
    // アクティブのタブを閉じる
    this.hotkeysService.add(new Hotkey('ctrl+w', (event: KeyboardEvent): boolean => {
      this.removeTab(this.selectedTabIndex);
      return false;
    }));

    // 全タブ選択抽出
    if (this.settings.all_tab_chuushutu !== undefined) {
      this.hotkeysService.add(new Hotkey(this.settings?.all_tab_chuushutu.toLowerCase(), (event: KeyboardEvent): boolean => {
        this.changeSearchAll({
          isSearch: true
        });
        return false;
      }));
    }

    // // 全タブ選択抽出解除
    if (this.settings.all_tab_chuushutu_kaijo !== undefined) {
      this.hotkeysService.add(new Hotkey(this.settings?.all_tab_chuushutu_kaijo.toLowerCase(), (event: KeyboardEvent): boolean => {
        this.changeSearchAll({
          isSearch: false
        });
        return false;
      }));
    }
  }

  private loadStatusFile(loadData){
    console.log('loadStatusFile')
    const loadResList = [];
    for (const res of loadData.resList) {
      const resItem = Object.assign({}, res);
      if (!Number.isInteger(res.resColor)) {
        continue;
      }
      if (Number(res.resColor) === 0) {
        resItem.resColor = '#000';
      } else {
        resItem.resColor = this.settings.characterColors[Number(res.resColor) - 1];
      }

      resItem.resFontSize = this.resSizeList[Number(res.resFontSize) - 1].value;
      resItem.resBackgroundColor = this.backgroundColors[res.resBackgroundColor];
      resItem.resHovergroundColor = this.hovergroundColors[res.resHovergroundColor];
      resItem.idColor = this.idStyles[Number(res.idColor)].color;
      resItem.idBackgroundColor = this.idStyles[Number(res.idColor)].background;
      loadResList.push(resItem);
    }
    loadData.resList.length = 0;
    if (loadResList.length > 0) {
      const originSreTitle = loadData.title.replace(/(_|-)[\w,\s-]{10}/ig, '');
      const numberSuffixes = originSreTitle.match(/(_|-)(\d+)/gi);
      let suffixNumber;
      if (numberSuffixes?.length > 0) {
        suffixNumber = numberSuffixes[0].replace(/(_|-)/i, '');
      }
      this.addTab(loadData.title, loadResList, originSreTitle, loadData.filePath, suffixNumber);

      this.selectedTabIndex = this.tabs.length - 1;
      // value.tabIndex = this.selectedTabIndex;
      this.titleService.setTitle(`${this.tabs[this.selectedTabIndex].title} - スレ編集`);

      this.resService.setTotalRes({
        tabIndex: this.selectedTabIndex,
        totalCount: loadResList.length,
        title: this.tabs[this.selectedTabIndex].title,
        rightToken: true,
        statusToken: true
      });

      const selectCount = loadResList.filter(item => item.resSelect === 'select').length;
      const candi1Count = loadResList.filter(item => item.resSelect === 'candi1').length;
      const candi2Count = loadResList.filter(item => item.resSelect === 'candi2').length;
      const candi3Count = loadResList.filter(item => item.resSelect === 'candi3').length;
      const candi4Count = loadResList.filter(item => item.resSelect === 'candi4').length;
      const candi5Count = loadResList.filter(item => item.resSelect === 'candi5').length;
      const candi6Count = loadResList.filter(item => item.resSelect === 'candi6').length;
      const candi7Count = loadResList.filter(item => item.resSelect === 'candi7').length;
      const candi8Count = loadResList.filter(item => item.resSelect === 'candi8').length;

      this.resService.setSelectedRes({
        select: selectCount,
        candi1: candi1Count,
        candi2: candi2Count,
        candi3: candi3Count,
        candi4: candi4Count,
        candi5: candi5Count,
        candi6: candi6Count,
        candi7: candi7Count,
        candi8: candi8Count,
        tabIndex: this.selectedTabIndex,
        title: this.tabs[this.selectedTabIndex].title,
        rightToken: true,
        statusToken: true,
        isLoaded: true
      });


      this.changeResCount();
    }
    
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event) {
    this.resService.saveSearchList(this.searchList);
  }

  addTab(pTitle, pResList: ResItem[], pOriginSreTitle = '', pStatusFilePath = '', pSuffixNumber = '') {
    this.tabs = [...this.tabs, {
      title: pTitle,
      active: true,
      resList: pResList,
      scrollPos: 0,
      isFiltered: false,
      url: '',
      originSreTitle: pOriginSreTitle,
      originalResList: pResList,
      statusFilePath: pStatusFilePath,
      hiddenIds: [],
      suffixNumber: pSuffixNumber
    }];
  }

  removeTab(index: number) {
    if (this.tabs[index] === undefined) {
      return;
    }

    const originSreTitle = this.tabs[index].originSreTitle;
    this.resService.removeTab(originSreTitle);
    this.tabs[index].resList.length = 0;
    this.tabs[index].originalResList.length = 0;
    this.tabs.splice(index, 1);
    if (this.tabs.length - 1 < index) {
      index = this.tabs.length - 1;
    }
    this.cdr.detectChanges();
    this.changeResCount();
    if (this.tabs.length > index && this.tabs.length > 0) {
      this.tabChangedHandler(index);
    } else {
      this.resService.setSelectedRes({
        select: 0,
        candi1: 0,
        candi2: 0,
        candi3: 0,
        candi4: 0,
        candi5: 0,
        candi6: 0,
        candi7: 0,
        candi8: 0,
        tabIndex: 0,
        title: '',
        rightToken: true,
        statusToken: false
      });

      this.resService.setTotalRes({
        tabIndex: 0,
        totalCount: 0,
        title: '',
        rightToken: true,
        statusToken: false
      });
    }
  }

  tabChangedHandler(index: number) {
    this.selectedTabIndex = index;
    this.tabs[this.selectedTabIndex].active = true;
    this.titleService.setTitle(`${this.tabs[this.selectedTabIndex].title} - スレ編集`);
    this.resService.setSelectedTab({
      select: this.tabs[this.selectedTabIndex].resList.filter(item => item.resSelect === 'select').length,
      candi1: this.tabs[this.selectedTabIndex].resList.filter(item => item.resSelect === 'candi1').length,
      candi2: this.tabs[this.selectedTabIndex].resList.filter(item => item.resSelect === 'candi2').length,
      candi3: this.tabs[this.selectedTabIndex].resList.filter(item => item.resSelect === 'candi3').length,
      candi4: this.tabs[this.selectedTabIndex].resList.filter(item => item.resSelect === 'candi4').length,
      candi5: this.tabs[this.selectedTabIndex].resList.filter(item => item.resSelect === 'candi5').length,
      candi6: this.tabs[this.selectedTabIndex].resList.filter(item => item.resSelect === 'candi6').length,
      candi7: this.tabs[this.selectedTabIndex].resList.filter(item => item.resSelect === 'candi7').length,
      candi8: this.tabs[this.selectedTabIndex].resList.filter(item => item.resSelect === 'candi8').length,
      totalCount: this.tabs[this.selectedTabIndex].originalResList.length,
      tabIndex: this.selectedTabIndex,
      title: this.tabs[this.selectedTabIndex].title,
      hiddenIds: this.tabs[this.selectedTabIndex].hiddenIds,
      resList: this.tabs[this.selectedTabIndex].resList
    });
    const pos = {
      index: this.selectedTabIndex,
      pos: this.tabs[this.selectedTabIndex].scrollPos,
      isTab: true
    };
    this.cdr.detectChanges();
    // @ts-ignore
    if (this.tabs[this.selectedTabIndex].scrollPos > 0) {
      this.resService.setScrollPos(pos);
    }
  }

  filteredHandler(index: number, $event: boolean) {
    this.tabs[index].isFiltered = $event;
  }

  changeSearchStatus($event: any) {
    if ($event.searchOption !== undefined) {
      this.searchKeyword = $event.searchKeyword;
      this.searchOption = $event.searchOption;
      this.cdr.detectChanges();
    }
  }

  onDraggableMoved($event: DragEvent) {
    this.currentTabId = $event.target['id'];
  }

  onDragEnd($event: DragEvent) {
    const toIndex = this.previousTabId;
    const fromIndex = this.currentTabId;
    $.LoadingOverlay('show', {
      imageColor: '#ffa07a',
    });
    // this.isAllTab = true;
    // const tabListItems = this.tabs;
    moveItemInArray(this.tabs, fromIndex, toIndex);
    moveItemInArray(this.tabGroup.tabs, fromIndex, toIndex);
    let index = 0;
    for (const tab of this.tabs) {
      if (tab.active) {
        this.resService.setSelectedTab({
          select: this.tabs[index].resList.filter(item => item.resSelect === 'select').length,
          candi1: this.tabs[index].resList.filter(item => item.resSelect === 'candi1').length,
          candi2: this.tabs[index].resList.filter(item => item.resSelect === 'candi2').length,
          candi3: this.tabs[index].resList.filter(item => item.resSelect === 'candi3').length,
          candi4: this.tabs[index].resList.filter(item => item.resSelect === 'candi4').length,
          candi5: this.tabs[index].resList.filter(item => item.resSelect === 'candi5').length,
          candi6: this.tabs[index].resList.filter(item => item.resSelect === 'candi6').length,
          candi7: this.tabs[index].resList.filter(item => item.resSelect === 'candi7').length,
          candi8: this.tabs[index].resList.filter(item => item.resSelect === 'candi8').length,
          totalCount: this.tabs[index].resList.length,
          tabIndex: index,
          title: this.tabs[index].title
        });
        this.selectedTabIndex = index;
        break;
      }
      index++;
    }
    // this.tabs[fromIndex].active = false;
    this.cdr.detectChanges();
    const activeTab = this.contentComponent.find((e, i) => i === this.selectedTabIndex);
    activeTab.setHotKeys();
    this.cancelInitialStyle();
    // setTimeout(this.cancelInitialStyle.bind(this), 1000);
  }

  onDragover($event: DragEvent) {
    this.previousTabId = $event.target['id'];
  }

  private async printNormalAllHtmlTag(pIsOutputCandiBelow, pIsReplaceName, pSurroundImage, pGazouReplaceUrl) {
    $.LoadingOverlay('show', {
      imageColor: '#ffa07a',
    });
    let htmlTag = '';
    let yobiHtml = '';
    let index = 0;
    let currentTab = 0;
    let allCount = 0;
    let selectedCount = 0;
    let yobiCount = 0;
    for (const tabItem of this.tabs) {
      if (tabItem.originalResList.length > 0) {
        const oneHtmlTag = await this.resService.printHtmlTag(tabItem.originalResList, {
          tabName: tabItem.title,
          txtURL: tabItem.url,
          twitter: this.twitter,
          youtube: this.youtube,
          twitterUrl: this.isTwitterUrl,
          youtubeUrl: this.isYoutubeUrl,
          shuturyoku: this.shuturyoku,
          resSizeList: this.resSizeList,
          characterColors: this.settings.characterColors,
          startAbbreviations: this.startAbbreviations,
          endAbbreviations: this.endAbbreviations,
          isAll: true,
          isOutputCandiBelow: pIsOutputCandiBelow,
          isReplaceName: pIsReplaceName,
          replaceName: this.settings.namae_mae,
          replacedName: this.settings.namae_ato,
          isSurroundImage: pSurroundImage,
          gazouReplaceUrl: pGazouReplaceUrl,
          insertPrefix: this.settings.sounyuu_mae,
          insertSuffix: this.settings.sounyuu_usiro
        });

        if (index !== 0 && oneHtmlTag.allHtml.length > 0) {
          htmlTag += '\n';
        }

        if (index !== 0 && pIsOutputCandiBelow && oneHtmlTag.yobiHtml.length > 0) {
          yobiHtml += '\n';
        }

        htmlTag += oneHtmlTag.allHtml;

        if (pIsOutputCandiBelow) {
          yobiHtml += oneHtmlTag.yobiHtml;
        }
      }
      if (tabItem.active) {
        currentTab = index;
      }
      index++;
      allCount += tabItem.originalResList.filter(item => item.resSelect !== 'none').length;
      selectedCount += tabItem.originalResList.filter(item => item.resSelect === 'select').length;
    }
    yobiCount = allCount - selectedCount;

    if (pIsOutputCandiBelow) {
      htmlTag += `\n${yobiHtml}`;
    }

    htmlTag = `\n★●合計レス数: ${allCount}\n★●選択レス数: ${selectedCount}\n★●予備選択数: ${yobiCount}\n\n${htmlTag}\n★●合計レス数: ${allCount}\n★●選択レス数: ${selectedCount}\n★●予備選択数: ${yobiCount}`;

    this.resService.setPrintHtml({tabIndex: currentTab, html: htmlTag});
    $.LoadingOverlay('hide');
  }

  private async printIntegrateAllHtmlTag(pIsOutputCandiBelow, pIsReplaceName, pSurroundImage, pGazouReplaceUrl) {
    $.LoadingOverlay('show', {
      imageColor: '#ffa07a',
    });
    let htmlTag = '';
    let yobi1Html = '';
    let yobi2Html = '';
    let yobi3Html = '';
    let yobi4Html = '';
    let yobi5Html = '';
    let yobi6Html = '';
    let yobi7Html = '';
    let yobi8Html = '';
    let index = 0;
    let currentTab = 0;
    let allCount = 0;
    let selectedCount = 0;
    let yobiCount = 0;
    let tabName = '';
    let tabUrl = '';

    for (const tabItem of this.tabs) {
      if (tabItem.originalResList.length > 0) {
        const oneHtmlTag = await this.resService.printAllHtmlTag(tabItem.originalResList, {
          tabName: tabItem.title,
          txtURL: tabItem.url,
          twitter: this.twitter,
          youtube: this.youtube,
          twitterUrl: this.isTwitterUrl,
          youtubeUrl: this.isYoutubeUrl,
          shuturyoku: this.shuturyoku,
          resSizeList: this.resSizeList,
          characterColors: this.settings.characterColors,
          startAbbreviations: this.startAbbreviations,
          endAbbreviations: this.endAbbreviations,
          isAll: true,
          isOutputCandiBelow: pIsOutputCandiBelow,
          isReplaceName: pIsReplaceName,
          replaceName: this.settings.namae_mae,
          replacedName: this.settings.namae_ato,
          isSurroundImage: pSurroundImage,
          gazouReplaceUrl: pGazouReplaceUrl,
          insertPrefix: this.settings.sounyuu_mae,
          insertSuffix: this.settings.sounyuu_usiro
        });

        tabName = '';
        if (oneHtmlTag.allHtml.length > 0) {
          tabName = oneHtmlTag.tabName;
        }

        if (oneHtmlTag.allHtml.length > 0 || oneHtmlTag.yobi1Html.length > 0 || oneHtmlTag.yobi2Html.length > 0
          || oneHtmlTag.yobi3Html.length > 0 || oneHtmlTag.yobi4Html.length > 0 || oneHtmlTag.yobi5Html.length > 0 
          || oneHtmlTag.yobi6Html.length > 0|| oneHtmlTag.yobi7Html.length > 0 
          || oneHtmlTag.yobi8Html.length > 0 || oneHtmlTag.tabUrl !== '') {
          tabUrl += oneHtmlTag.tabUrl;
        }

        htmlTag += tabName;
        htmlTag += oneHtmlTag.allHtml;
        yobi1Html += oneHtmlTag.yobi1Html;
        yobi2Html += oneHtmlTag.yobi2Html;
        yobi3Html += oneHtmlTag.yobi3Html;
        yobi4Html += oneHtmlTag.yobi4Html;
        yobi5Html += oneHtmlTag.yobi5Html;
        yobi6Html += oneHtmlTag.yobi6Html;
        yobi7Html += oneHtmlTag.yobi7Html;
        yobi8Html += oneHtmlTag.yobi8Html;

      }
      if (tabItem.active) {
        currentTab = index;
      }
      index++;
      allCount += tabItem.originalResList.filter(item => item.resSelect !== 'none').length;
      selectedCount += tabItem.originalResList.filter(item => item.resSelect === 'select').length;
    }
    yobiCount = allCount - selectedCount;

    htmlTag += `\n`;

    if (yobi1Html.length > 0) {
      htmlTag += `<div class="yobi1">予備選択1</div>\n${yobi1Html}`;
    }

    if (yobi2Html.length > 0) {
      htmlTag += `<div class="yobi2">予備選択2</div>\n${yobi2Html}`;
    }

    if (yobi3Html.length > 0) {
      htmlTag += `<div class="yobi3">予備選択3</div>\n${yobi3Html}`;
    }

    if (yobi4Html.length > 0) {
      htmlTag += `<div class="yobi4">予備選択4</div>\n${yobi4Html}`;
    }

    if (yobi5Html.length > 0) {
      htmlTag += `<div class="yobi5">予備選択1</div>\n${yobi5Html}`;
    }

    if (yobi6Html.length > 0) {
      htmlTag += `<div class="yobi6">予備選択2</div>\n${yobi6Html}`;
    }

    if (yobi7Html.length > 0) {
      htmlTag += `<div class="yobi7">予備選択3</div>\n${yobi7Html}`;
    }

    if (yobi8Html.length > 0) {
      htmlTag += `<div class="yobi8">予備選択8</div>\n${yobi8Html}`;
    }

    if (tabUrl !== '') {
      htmlTag += `\n${tabUrl}`;
    }

    htmlTag = `\n★●合計レス数: ${allCount}\n★●選択レス数: ${selectedCount}\n★●予備選択数: ${yobiCount}\n\n${htmlTag}\n★●合計レス数: ${allCount}\n★●選択レス数: ${selectedCount}\n★●予備選択数: ${yobiCount}`;

    this.resService.setPrintHtml({tabIndex: currentTab, html: htmlTag});
    $.LoadingOverlay('hide');
  }

  changeScrollIndex(index: number, $event: any) {
    this.tabs[index].scrollPos = $event;
  }

  changeSearchList($event: any) {
    if ($event.searchList !== undefined) {
      this.searchList = $event.searchList;
      this.cdr.detectChanges();
    }
  }

  changeResList($event: any) {
    if ($event.tabIndex !== undefined) {
      this.tabs[$event.tabIndex].originalResList = $event.resList;
    }
  }

  changeResListStatus($event: any) {
    if ($event.tabIndex !== undefined) {
      this.tabs[$event.tabIndex].resList = $event.resList;
      this.tabs[$event.tabIndex].hiddenIds = $event.hiddenIds;
    }
  }

  changeUrl($event: any) {
    if ($event.tabIndex !== undefined) {
      this.tabs[$event.tabIndex].url = $event.txtURL;
    }
  }

  changeSelectAll($event: any) {
    if ($event.tabIndex !== undefined) {
      this.tabs[$event.tabIndex].selectAllOption = $event.selectAllOption;
    }
  }

  selectCommandHeaderValue(value: any) {
    return value === undefined ? '' : value;
  }

  changeSearchAll($event: any) {
    if (this.contentComponent.length > 1) {
      $.LoadingOverlay('show', {
        imageColor: '#ffa07a',
      });
    }
    let count = 0;
    if (this.contentComponent.length) {
      if ($event.isSearch) {
        if (this.contentComponent.length > 1) {
          // this.isAllTab = true;
        }
        for (const child of this.contentComponent) {
          child.searchAll();
          count++;
        }
      } else {
        // this.isAllTab = true;
        for (const child of this.contentComponent) {
          this.tabs[count].isFiltered = false;
          child.cancelSearchAll();
          count++;
        }
      }
    }
    if (this.contentComponent.length > 1) {
      this.cancelInitialStyle();
      // setTimeout(this.cancelInitialStyle.bind(this), count * 650);
    }
  }

  private cancelInitialStyle(){
    // this.isAllTab = false;
    $.LoadingOverlay('hide');
    if(!this.tabs[this.selectedTabIndex].active){
      this.tabs[this.selectedTabIndex].active = true;
      this.cdr.detectChanges();
    }
  }


  public changeResCount() {

    this.allCount = {
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
    for (const tab of this.tabs) {
      this.allCount.select += tab.originalResList.filter(item => item.resSelect === 'select').length;
      this.allCount.candi1 += tab.originalResList.filter(item => item.resSelect === 'candi1').length;
      this.allCount.candi2 += tab.originalResList.filter(item => item.resSelect === 'candi2').length;
      this.allCount.candi3 += tab.originalResList.filter(item => item.resSelect === 'candi3').length;
      this.allCount.candi4 += tab.originalResList.filter(item => item.resSelect === 'candi4').length;
      this.allCount.candi5 += tab.originalResList.filter(item => item.resSelect === 'candi5').length;
      this.allCount.candi6 += tab.originalResList.filter(item => item.resSelect === 'candi6').length;
      this.allCount.candi7 += tab.originalResList.filter(item => item.resSelect === 'candi7').length;
      this.allCount.candi8 += tab.originalResList.filter(item => item.resSelect === 'candi8').length;
    }

    this.resService.setChangeResCount({
      allTabCount: this.allCount,
      rightToken: true,
      statusToken: true
    });

  }

  finishedRender() {
    this.isWait = false;
   }
}
