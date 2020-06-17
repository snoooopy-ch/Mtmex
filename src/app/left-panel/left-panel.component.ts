import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ResService} from '../res.service';
// import {MatTabChangeEvent, MatTabGroup} from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
// import {MatButtonToggle} from '@angular/material/button-toggle';
import {TabDirective, TabsetComponent} from 'ngx-bootstrap/tabs';
import {moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrls: ['./left-panel.component.css'],
})
export class LeftPanelComponent implements OnInit, OnDestroy {
  @ViewChild('tabGroup') tabGroup: TabsetComponent;
  resLists: [any[]];
  tabs = [{title: 'New Tab', active: true}];
  draggable = {
    data: 'myDragData',
    effectAllowed: 'all',
    disable: false,
    handle: false
  };
  scrollPos = [0];
  selectedTabIndex = 0;
  settings;
  backgroundColors;
  leftBorder;
  idStyles;
  resSizeList;
  tabWidth;
  hitColor;
  idRed;
  isFiltered = [false];
  // chuumoku: number;
  noticeCount: number;
  subHotKeys = [];
  public subscribers: any = {};
  shuturyoku: true;
  searchKeyword: string;
  searchOption: 'context';
  private previousTabId: number;
  private currentTabId: number;
  constructor(private resService: ResService, private cdr: ChangeDetectorRef, private titleService: Title) {
    this.resLists = [[]];
  }

  ngOnInit(): void {

    this.subscribers.settings = this.resService.settings.subscribe((value) => {

      this.settings = value;
      this.backgroundColors = [this.settings.Back_color,
        this.settings.Sentaku_back,
        this.settings.YobiSentaku1_back,
        this.settings.YobiSentaku2_back];
      this.leftBorder = `6px solid ${this.settings.Left_border}`;
      this.idStyles = [{color: '#000', background: 'transparent'},
          {color: this.settings.ID1_moji, background: this.settings.ID1_back},
          {color: this.settings.ID2_moji, background: this.settings.ID2_back},
          {color: this.settings.ID3_moji, background: this.settings.ID3_back}];
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
    });

    this.subscribers.resData = this.resService.resData.subscribe((value) => {
      if (this.tabGroup === undefined) { return; }
      this.resLists[this.selectedTabIndex] = value.resList;
      this.cdr.detectChanges();
      if (value.resList.length > 0 ) {
        this.tabs[this.selectedTabIndex].title = value.sreTitle;
        this.titleService.setTitle(`${this.tabs[this.selectedTabIndex].title} - スレ編集`);
        this.resService.setTotalRes({
          tabIndex: this.selectedTabIndex,
          totalCount: value.resList.length
        });
      }

    });
    this.subscribers.scrollPos = this.resService.scrollPos.subscribe((value) => {
      if (this.tabGroup === undefined) { return; }
      if (this.selectedTabIndex === value.index) {
        this.scrollPos[this.selectedTabIndex] = value.pos;
      }
    });

    this.subscribers.status = this.resService.status.subscribe((value) => {
      if (this.tabGroup === undefined) { return; }
      if (this.selectedTabIndex === value.tabIndex && value.data.resList !== undefined) {
        this.resLists[this.selectedTabIndex] = value.data.resList;
        this.cdr.detectChanges();
        this.tabs[this.selectedTabIndex].title = value.data.title;
        this.titleService.setTitle(`${this.tabs[this.selectedTabIndex].title} - スレ編集`);
        this.resService.setTotalRes({
          tabIndex: this.selectedTabIndex,
          totalCount: value.data.resList.length
        });
      }
    });
  }

  /**
   * Unsubscribe the completed service subscribers
   */
  ngOnDestroy(){
    this.subscribers.settings.unsubscribe();
    // this.subscribers.resData.unsubscribe();
    this.subscribers.scrollPos.unsubscribe();
    this.subscribers.status.unsubscribe();
  }

  addTab() {
    this.tabs.push({title: 'New Tab' + this.tabs.length.toString(), active: true});
    this.resLists.push([]);
    this.scrollPos.push(0);
    this.isFiltered.push(false);
    // this.tabGroup.tabs[this.tabs.length - 1].active = true;
  }

  removeTab(index: number) {
    this.resLists.splice(index, 1);
    this.tabs.splice(index, 1);
    this.scrollPos.splice(index, 1);
    this.isFiltered.splice(index, 1);
  }

  tabChangedHandler(index: number) {
    this.selectedTabIndex = index;
    this.tabs[this.selectedTabIndex].active = true;
    this.titleService.setTitle(`${this.tabs[this.selectedTabIndex].title} - スレ編集`);
    this.resService.setSelectedTab({
      select: this.resLists[this.selectedTabIndex].filter(item => item.select).length,
      candi1: this.resLists[this.selectedTabIndex].filter(item => item.candi1).length,
      candi2: this.resLists[this.selectedTabIndex].filter(item => item.candi2).length,
      totalCount: this.resLists[this.selectedTabIndex].length,
      tabIndex: this.selectedTabIndex
    });
    const pos = {
      index: this.selectedTabIndex,
      pos: this.scrollPos[this.selectedTabIndex],
      isTab: true
    };
    this.cdr.detectChanges();
    // @ts-ignore
    this.resService.setScrollPos(pos);
  }

  filteredHandler(index: number, $event: any) {
    this.isFiltered[index] = $event;
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
    console.log($event.target['id']);

    // console.log('--------moved------');
    // console.log(this.currentTabId);
    // console.log(index);
    // console.log($event.target['id']);
    // const toIndex = index;
    // const fromIndex = this.currentTabId;
    // // moveItemInArray(this.tabs, fromIndex, toIndex);

  }

  onDragEnd($event: DragEvent) {
    const toIndex = this.previousTabId;
    const fromIndex = this.currentTabId;
    let tabListItems = this.tabs;
    // tabListItems.splice(toIndex, 0, tabListItems.splice(fromIndex, 1)[0]);
    // this.tabGroup.tabs.splice(toIndex, 0, this.tabGroup.tabs.splice(fromIndex, 1)[0]);
    // console.log('--------end------');
    moveItemInArray(this.tabs, fromIndex, toIndex);
    moveItemInArray(this.tabGroup.tabs, fromIndex, toIndex);
    // this.tabs = [...this.tabs];
    console.log('--------end------');
    // this.currentTabId = index;
    // console.log(index);
    // console.log($event.target['data-id']);
  }

  onDragover($event: DragEvent) {
    console.log('----------over-------');
    console.log($event.target);
    console.log($event.target['data-id']);
    this.previousTabId = $event.target['id'];
    // this.previousTabId = selectedTabIndex;
    // console.log('--------over------')
    // console.log(selectedTabIndex);
  }

}
