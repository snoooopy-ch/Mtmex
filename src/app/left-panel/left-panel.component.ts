import { ChangeDetectorRef, Component, OnInit} from '@angular/core';
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

  constructor(private resService: ResService, private cdr: ChangeDetectorRef, private titleService: Title) {
    this.resLists = [[]];
  }

  ngOnInit(): void {

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
    this.selectedTabIndex = this.tabs.length - 1;
  }

  removeTab(index: number) {
    this.resLists.splice(index, 1);
    this.tabs.splice(index, 1);
    this.scrollPos.splice(index, 1);
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

}
