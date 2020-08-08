import {ChangeDetectorRef, Component, HostListener, Input, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ResService} from '../res.service';
import { Title } from '@angular/platform-browser';
import {TabDirective, TabsetComponent} from 'ngx-bootstrap/tabs';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {Hotkey, HotkeysService} from 'angular2-hotkeys';
import {ResItem} from '../models/res-item';
// import {appendHtmlElementToHead} from '@angular/cdk/schematics';
const electron = (window as any).require('electron');
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrls: ['./left-panel.component.css'],
})
export class LeftPanelComponent implements OnInit, OnDestroy {
  @ViewChild('tabGroup') tabGroup: TabsetComponent;

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

  constructor(private resService: ResService, private cdr: ChangeDetectorRef, private titleService: Title,
              private hotkeysService: HotkeysService, private zone: NgZone) {

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
        this.settings.YobiSentaku4_back];
      this.hovergroundColors = [this.settings.Mouseover,
        this.settings.Sentaku_MouseOver,
        this.settings.Yobi1_MouseOver,
        this.settings.Yobi2_MouseOver,
        this.settings.Yobi3_MouseOver,
        this.settings.Yobi4_MouseOver];
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
      this.resMouseClick = this.settings.res_mouse_click;
      this.leftHightlight = this.settings.Left_highlight;
      this.subHotKeys = [];
      if (value.hasOwnProperty('sentaku_no1')) {
        const arrayKeys = ['sentaku_no1', 'sentaku_no2', 'sentaku_no3', 'yobi1', 'yobi2', 'yobi3', 'yobi4', 'up', 'down'
          , 'big0', 'big1', 'big2', 'nasi', 'color1', 'color2', 'color3', 'color4', 'color5', 'color6', 'color7', 'color8'
          , 'color9', 'color10', 'tree_sentaku', 'tree_yobi1', 'tree_yobi2', 'tree_yobi3', 'tree_yobi4', 'tree_kaijo'
          , 'id1', 'id2', 'id3', 'id4', 'id_iro1', 'id_iro2', 'id_iro3', 'id_iro4', 'id_kaijo', 'id_irokesi', 'id_kaijo_irokesi'
          , 'id_hihyouji', 'henshuu', 'sakujo', 'menu_kaihei', 'chuumoku', 'chuushutu_kaijo', 'res_area_move_top', 'res_area_move_bottom'
          , 'res_area_move1a', 'res_area_move1b', 'res_area_move2a', 'res_area_move2b', 'sentaku_res_gamen'];
        for (const key of arrayKeys) {
          if (this.settings[key].toLowerCase() === 'insert'){
            this.subHotKeys[key] = 'ins';
          }else if (this.settings[key].toLowerCase() === 'delete'){
            this.subHotKeys[key] = 'del';
          }else{
            this.subHotKeys[key] = this.settings[key].toLowerCase();
          }
        }
      }
      this.btnBackgroundColors = [];
      if (value.hasOwnProperty('color_tree_sentaku')){
        const colorKeys = ['color_tree_sentaku', 'color_tree_yobi_sentaku1', 'color_tree_yobi_sentaku2', 'color_tree_yobi_sentaku3',
          'color_tree_yobi_sentaku4', 'color_tree_kaijo', 'color_id_sentaku1', 'color_id_sentaku2', 'color_id_sentaku3',
          'color_id_sentaku4', 'color_id_iro1', 'color_id_iro2', 'color_id_iro3', 'color_id_iro4', 'color_id_kaijo',
          'color_id_iro_delete', 'color_id_kaijo_iro_delete', 'color_id_hihyouji', 'color_copy', 'color_edit'];
        for (const key of colorKeys){
          this.btnBackgroundColors[key] = this.settings[key];
        }
      }
      this.startAbbreviations = [];
      if (value.hasOwnProperty('moji_color_start1')){
        const startAbbrKeys = ['moji_color_start1', 'moji_color_start2', 'moji_color_start3', 'moji_color_start4',
          'moji_color_start5', 'moji_color_start6', 'moji_color_start7', 'moji_color_start8', 'moji_color_start9',
          'moji_color_start10'];
        for (const key of startAbbrKeys){
          this.startAbbreviations.push(this.settings[key]);
        }
      }
      this.endAbbreviations = [];
      if (value.hasOwnProperty('moji_color_end1')){
        const endAbbrKeys = ['moji_color_end1', 'moji_color_end2', 'moji_color_end3', 'moji_color_end4',
          'moji_color_end5', 'moji_color_end6', 'moji_color_end7', 'moji_color_end8', 'moji_color_end9',
          'moji_color_end10'];
        for (const key of endAbbrKeys){
          this.endAbbreviations.push(this.settings[key]);
        }
      }
      this.moveOption = {
        sentaku_idou1: this.settings.sentaku_idou1,
        sentaku_idou2: this.settings.sentaku_idou2,
      };

      if (this.settings.chuui !== undefined) {
        this.txtRemarkRes = this.settings.chuui;
      }

      if (this.settings.top_bar !== undefined) {
        this.resTopBar = `1px solid ${this.settings.top_bar}`;
      }

      if (this.settings.pict_hyouji !== undefined){
        this.imageWidth = '150px';
      } else {
        this.imageWidth = `${this.settings.pict_hyouji}px`;
      }

      this.setHotKeys();
    });

    this.subscribers.resData = this.resService.resData.subscribe( (value) => {
      if (this.tabGroup === undefined) { return; }
      this.zone.run(() => {
        this.addTab(value.sreTitle, value.resList, value.originSreTitle);
        this.selectedTabIndex = this.tabs.length - 1;
        this.titleService.setTitle(`${this.tabs[this.selectedTabIndex].title} - スレ編集`);
        this.resService.setTotalRes({
          tabIndex: this.selectedTabIndex,
          totalCount: value.resList.length,
          title: this.tabs[this.selectedTabIndex].title,
        });
      });
    });

    // this.subscribers.scrollPos = this.resService.scrollPos.subscribe((value) => {
    //   if (this.tabGroup === undefined) { return; }
    //   if (this.selectedTabIndex === value.index) {
    //     this.tabs[this.selectedTabIndex].scrollPos = value.pos;
    //   }
    // });

    this.subscribers.status = this.resService.status.subscribe((value) => {
      if (this.tabGroup === undefined) { return; }
      if (value.data.resList !== undefined) {
        this.zone.run(() => {
          const loadResList = [];
          for (const res of value.data.resList){
            const resItem = Object.assign({}, res);
            if (!Number.isInteger(res.resColor)){
              continue;
            }
            if (Number(res.resColor) === 0){
              resItem.resColor = '#000';
            }else{
              resItem.resColor = this.settings.characterColors[Number(res.resColor) - 1];
            }

            resItem.resFontSize = this.resSizeList[Number(res.resFontSize) - 1].value;
            resItem.resBackgroundColor = this.backgroundColors[res.resBackgroundColor];
            resItem.resHovergroundColor = this.hovergroundColors[res.resHovergroundColor];
            resItem.idColor = this.idStyles[Number(res.idColor)].color;
            resItem.idBackgroundColor = this.idStyles[Number(res.idColor)].background;
            loadResList.push(resItem);
          }
          if (loadResList.length > 0) {
            this.addTab(value.data.title, loadResList);
            this.selectedTabIndex = this.tabs.length - 1;
            this.titleService.setTitle(`${this.tabs[this.selectedTabIndex].title} - スレ編集`);
            this.resService.setTotalRes({
              tabIndex: this.selectedTabIndex,
              totalCount: value.data.resList.length,
              title: this.tabs[this.selectedTabIndex].title,
            });
          }
        });
      }
    });

    this.subscribers.allPrint = this.resService.printAllCommand.subscribe((value) => {
      if (value.token){
        this.printAllHtmlTag();
      }
    });

    electron.ipcRenderer.on('closeMenu', (event) => {
      this.removeTab(this.selectedTabIndex);
    });

    if (this.searchList === undefined){
      this.searchList = [];
    }
  }

  /**
   * Unsubscribe the completed service subscribers
   */
  ngOnDestroy(){
    this.subscribers.settings.unsubscribe();
    this.subscribers.resData.unsubscribe();
    // this.subscribers.scrollPos.unsubscribe();
    this.subscribers.status.unsubscribe();
    this.subscribers.allPrint.unsubscribe();
  }

  setHotKeys() {
    // 前のタブ
    if (this.settings.tab_prev !== undefined) {
      this.hotkeysService.add(new Hotkey(this.settings.tab_prev.toLowerCase(), (event: KeyboardEvent): boolean => {
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
      this.hotkeysService.add(new Hotkey(this.settings.tab_next.toLowerCase(), (event: KeyboardEvent): boolean => {
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
  }

  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHandler(event) {
    this.resService.saveSearchList(this.searchList);
  }

  addTab(pTitle, pResList: ResItem[], pOriginSreTitle= '') {
    this.tabs = [...this.tabs, {
      title: pTitle,
      active: true,
      resList: pResList,
      scrollPos: 0,
      isFiltered: false,
      url: '',
      originSreTitle: pOriginSreTitle
    }];
    // this.tabs.push();
  }

  removeTab(index: number) {
    const originSreTitle = this.tabs[index].originSreTitle;
    this.resService.removeTab(originSreTitle);
    this.tabs[index].resList.length = 0;
    this.tabs.splice(index, 1);
    if (this.tabs.length - 1 < index){
      index = this.tabs.length - 1;
    }
    this.cdr.detectChanges();
    if (this.tabs.length > index && this.tabs.length > 0){
      this.tabChangedHandler(index);
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
      totalCount: this.tabs[this.selectedTabIndex].resList.length,
      tabIndex: this.selectedTabIndex,
      title: this.tabs[this.selectedTabIndex].title,
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
    // const tabListItems = this.tabs;
    moveItemInArray(this.tabs, fromIndex, toIndex);
    moveItemInArray(this.tabGroup.tabs, fromIndex, toIndex);
    let index = 0;
    for (const tab of this.tabs){
      if (tab.active) {
        this.resService.setSelectedTab({
          select: this.tabs[index].resList.filter(item => item.resSelect === 'select').length,
          candi1: this.tabs[index].resList.filter(item => item.resSelect === 'candi1').length,
          candi2: this.tabs[index].resList.filter(item => item.resSelect === 'candi2').length,
          candi3: this.tabs[index].resList.filter(item => item.resSelect === 'candi3').length,
          candi4: this.tabs[index].resList.filter(item => item.resSelect === 'candi4').length,
          totalCount: this.tabs[index].resList.length,
          tabIndex: index,
          title: this.tabs[index].title,
        });
        this.selectedTabIndex = index;
        break;
      }
      index++;
    }
    // this.tabs[fromIndex].active = false;
  }

  onDragover($event: DragEvent) {
    this.previousTabId = $event.target['id'];
  }

  private async printAllHtmlTag() {
    $.LoadingOverlay('show', {
      imageColor: '#ffa07a',
    });
    let htmlTag = '';
    let index = 0;
    let currentTab = 0;
    let allCount = 0;
    for (const tabItem of this.tabs) {
      if (tabItem.resList.length > 0) {
        const oneHtmlTag = await this.resService.printHtmlTag(tabItem.resList, {
          tabName: tabItem.title,
          txtURL: tabItem.url,
          twitter: this.twitter,
          youtube: this.youtube,
          shuturyoku: this.shuturyoku,
          resSizeList: this.resSizeList,
          characterColors: this.settings.characterColors,
          startAbbreviations: this.startAbbreviations,
          endAbbreviations: this.endAbbreviations,
          isAll: true
        });

        if (index !== 0 && oneHtmlTag.length > 0) {
          htmlTag += '\n';
        }
        htmlTag += oneHtmlTag;
      }
      if (tabItem.active){
        currentTab = index;
      }
      index++;
      allCount += tabItem.resList.filter(item => item.resSelect !== 'none').length;;
    }

    htmlTag = `\n★●レス数: ${allCount}\n\n${htmlTag}\n●★レス数: ${allCount}`;

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
}
