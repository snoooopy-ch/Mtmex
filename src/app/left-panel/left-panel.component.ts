import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {ResService} from '../res.service';
import {MatTabChangeEvent} from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrls: ['./left-panel.component.css'],
})
export class LeftPanelComponent implements OnInit {
  resLists: [any[]];
  tabs = ['New Tab'];
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
  constructor(private resService: ResService, private cdr: ChangeDetectorRef, private titleService: Title) {
    this.resLists = [[]];
  }

  ngOnInit(): void {

    this.resService.settings.subscribe((value) => {

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

    this.resService.resData.subscribe((value) => {

      this.resLists[this.selectedTabIndex] = value.resList;
      this.cdr.detectChanges();
      if (value.resList.length > 0 ) {
        this.tabs[this.selectedTabIndex] = value.sreTitle;
        this.titleService.setTitle(`${this.tabs[this.selectedTabIndex]} - スレ編集`);
        this.resService.setTotalRes({
          tabIndex: this.selectedTabIndex,
          totalCount: value.resList.length
        });
      }

    });
    this.resService.scrollPos.subscribe((value) => {
      if (this.selectedTabIndex === value.index) {
        this.scrollPos[this.selectedTabIndex] = value.pos;
      }
    });
  }

  addTab() {
    this.tabs.push('New Tab');
    this.resLists.push([]);
    this.scrollPos.push(0);
    this.isFiltered.push(false);
    this.selectedTabIndex = this.tabs.length - 1;
  }

  removeTab(index: number) {
    this.resLists.splice(index, 1);
    this.tabs.splice(index, 1);
    this.scrollPos.splice(index, 1);
    this.isFiltered.splice(index, 1);
  }

  tabChangedHandler($event: MatTabChangeEvent) {
    this.selectedTabIndex = $event.index;
    this.titleService.setTitle(`${this.tabs[this.selectedTabIndex]} - スレ編集`);
    this.resService.setSelectedTab({
      select: this.resLists[$event.index].filter(item => item.select).length,
      candi1: this.resLists[$event.index].filter(item => item.candi1).length,
      candi2: this.resLists[$event.index].filter(item => item.candi2).length,
      totalCount: this.resLists[$event.index].length,
      tabIndex: $event.index
    });
    const pos = {
      index: $event.index,
      pos: this.scrollPos[$event.index],
      isTab: true
    };
    this.cdr.detectChanges();
    // @ts-ignore
    this.resService.setScrollPos(pos);
  }

  filteredHandler(index: number, $event: any) {
    this.isFiltered[index] = $event;
  }
}
