import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ResService} from '../res.service';
import { Title } from '@angular/platform-browser';
import {TabDirective, TabsetComponent} from 'ngx-bootstrap/tabs';
import {moveItemInArray} from '@angular/cdk/drag-drop';
const electron = (window as any).require('electron');

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrls: ['./left-panel.component.css'],
})
export class LeftPanelComponent implements OnInit, OnDestroy {
  @ViewChild('tabGroup') tabGroup: TabsetComponent;

  tabs = [{title: 'New Tab', active: true, resList: [], scrollPos: 0, isFiltered: false}];
  draggable = {
    data: 'myDragData',
    effectAllowed: 'all',
    disable: false,
    handle: false
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
  searchKeyword: string;
  searchOption = 'context';
  private previousTabId: number;
  private currentTabId: number;
  topBorder: string;
  btnBackgroundColors: any[];
  leftHightlight: true;

  constructor(private resService: ResService, private cdr: ChangeDetectorRef, private titleService: Title) {

  }

  ngOnInit(): void {

    this.subscribers.settings = this.resService.settings.subscribe((value) => {
      this.settings = value;
      this.backgroundColors = [this.settings.Back_color,
        this.settings.Sentaku_back,
        this.settings.YobiSentaku1_back,
        this.settings.YobiSentaku2_back];
      this.hovergroundColors = [this.settings.Mouseover,
        this.settings.Sentaku_MouseOver,
        this.settings.Yobi1_MouseOver,
        this.settings.Yobi2_MouseOver];
      this.leftBorder = `6px solid ${this.settings.Left_border}`;
      this.idStyles = [{color: '#000', background: 'transparent', classNoSelect: ''},
        {color: this.settings.ID1_moji, background: this.settings.ID1_back, classNoSelect: 'same_id1'},
        {color: this.settings.ID2_moji, background: this.settings.ID2_back, classNoSelect: 'same_id2'},
        {color: this.settings.ID3_moji, background: this.settings.ID3_back, classNoSelect: 'same_id3'}];
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
      this.tabWidth = `${this.settings.tab_haba - 37}px`;
      this.hitColor = this.settings.hit_back_color;
      this.idRed = this.settings.id_red;
      this.noticeCount = this.settings.noticeCount;
      this.shuturyoku = this.settings.shuturyoku;
      this.leftHightlight = this.settings.Left_highlight;
      this.subHotKeys = [];
      if (value.hasOwnProperty('sentaku_no1')) {
        const arrayKeys = ['sentaku_no1', 'sentaku_no2', 'sentaku_no3', 'yobi1', 'yobi2', 'up', 'down', 'big1', 'big2', 'nasi'
          , 'color1', 'color2', 'color3', 'color4', 'color5', 'color6', 'color7', 'color8', 'color9', 'color10', 'tree_sentaku'
          , 'tree_yobi1', 'tree_yobi2', 'tree_kaijo', 'id1', 'id2', 'id3', 'id_kaijo', 'id_irokesi', 'id_kaijo_irokesi'
          , 'id_hihyouji', 'henshuu', 'chuumoku', 'chuushutu_kaijo'];
        for (const key of arrayKeys) {
          this.subHotKeys[key] = this.settings[key].toLowerCase();
        }
      }
      this.btnBackgroundColors = [];
      if (value.hasOwnProperty('tree_sentaku_back')){
        const colorKeys = ['tree_sentaku_back', 'tree_yobi_sentaku1', 'tree_yobi_sentaku2', 'tree_kaijo_back', 'id_sentaku1',
          'id_sentaku2', 'id_sentaku3', 'id_kaijo_back', 'id_iro_delete', 'id_kaijo_iro_delete', 'id_hihyouji', 'copy', 'edit'];
        for (const key of colorKeys){
          this.btnBackgroundColors[key] = this.settings[key];
        }
      }
    });

    this.subscribers.resData = this.resService.resData.subscribe((value) => {
      if (this.tabGroup === undefined) { return; }
      this.tabs[this.selectedTabIndex].resList = value.resList;
      this.cdr.detectChanges();
      if (value.resList.length > 0 ) {
        this.tabs[this.selectedTabIndex].title = value.sreTitle;
        this.titleService.setTitle(`${this.tabs[this.selectedTabIndex].title} - スレ編集`);
        this.resService.setTotalRes({
          tabIndex: this.selectedTabIndex,
          totalCount: value.resList.length,
          title: this.tabs[this.selectedTabIndex].title,
        });
      }
    });

    this.subscribers.scrollPos = this.resService.scrollPos.subscribe((value) => {
      if (this.tabGroup === undefined) { return; }
      if (this.selectedTabIndex === value.index) {
        this.tabs[this.selectedTabIndex].scrollPos = value.pos;
      }
    });

    this.subscribers.status = this.resService.status.subscribe((value) => {
      if (this.tabGroup === undefined) { return; }
      if (this.selectedTabIndex === value.tabIndex && value.data.resList !== undefined) {
        this.tabs[this.selectedTabIndex].resList = value.data.resList;
        this.cdr.detectChanges();
        this.tabs[this.selectedTabIndex].title = value.data.title;
        this.titleService.setTitle(`${this.tabs[this.selectedTabIndex].title} - スレ編集`);
        this.resService.setTotalRes({
          tabIndex: this.selectedTabIndex,
          totalCount: value.data.resList.length
        });
      }
    });

    electron.ipcRenderer.on('closeMenu', (event) => {
      this.removeTab(this.selectedTabIndex);

    });
  }

  /**
   * Unsubscribe the completed service subscribers
   */
  ngOnDestroy(){
    this.subscribers.settings.unsubscribe();
    this.subscribers.resData.unsubscribe();
    this.subscribers.scrollPos.unsubscribe();
    this.subscribers.status.unsubscribe();
  }

  addTab() {
    this.tabs.push({
      title: 'New Tab',
      active: true,
      resList: [],
      scrollPos: 0,
      isFiltered: false
    });
  }

  removeTab(index: number) {
    this.tabs.splice(index, 1);
    if (this.tabs.length - 1 < index){
      index = this.tabs.length - 1;
    }
    if (this.tabs.length > index && this.tabs.length > 0){
      this.tabChangedHandler(index);
    }else{
      this.cdr.detectChanges();
    }
  }

  tabChangedHandler(index: number) {
    this.selectedTabIndex = index;
    this.tabs[this.selectedTabIndex].active = true;
    this.titleService.setTitle(`${this.tabs[this.selectedTabIndex].title} - スレ編集`);
    this.resService.setSelectedTab({
      select: this.tabs[this.selectedTabIndex].resList.filter(item => item.select).length,
      candi1: this.tabs[this.selectedTabIndex].resList.filter(item => item.candi1).length,
      candi2: this.tabs[this.selectedTabIndex].resList.filter(item => item.candi2).length,
      totalCount: this.tabs[this.selectedTabIndex].resList.length,
      tabIndex: this.selectedTabIndex,
      title: this.tabs[this.selectedTabIndex].title
    });
    const pos = {
      index: this.selectedTabIndex,
      pos: this.tabs[this.selectedTabIndex].scrollPos,
      isTab: true
    };
    this.cdr.detectChanges();
    // @ts-ignore
    this.resService.setScrollPos(pos);
  }

  filteredHandler(index: number, $event: any) {
    this.tabs[this.selectedTabIndex].isFiltered = $event;
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
    const tabListItems = this.tabs;
    moveItemInArray(this.tabs, fromIndex, toIndex);
    moveItemInArray(this.tabGroup.tabs, fromIndex, toIndex);
    this.tabs[fromIndex].active = false;
  }

  onDragover($event: DragEvent) {
    this.previousTabId = $event.target['id'];
  }

}
