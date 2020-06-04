import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ResService} from '../res.service';
import {MatTabChangeEvent} from '@angular/material/tabs';

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrls: ['./left-panel.component.css']
})
export class LeftPanelComponent implements OnInit {
  resLists: [any[]];
  tabs = ['New Tab'];
  scrollPos = [0];
  selectedTabIndex = 0;

  constructor(private resService: ResService, private cdr: ChangeDetectorRef) {
    this.resLists = [[]];
  }

  ngOnInit(): void {

    this.resService.resList.subscribe((value) => {

      this.resLists[this.selectedTabIndex] = value;
      if (value.length > 0 ) {
        this.tabs[this.selectedTabIndex] = 'テストタイトル';
      }
      this.cdr.detectChanges();
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
    this.resService.setSelectedTab($event.index);
    const pos = {
      index: $event.index,
      pos: this.scrollPos[$event.index],
      isTab: true
    };

    // @ts-ignore
    this.resService.setScrollPos(pos);
  }
}
