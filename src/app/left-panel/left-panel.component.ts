import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ResService} from '../res.service';
import {FormControl} from '@angular/forms';
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
  selectedTabIndex = 1;
  constructor(private resService: ResService, private cdr: ChangeDetectorRef) {
    this.resLists = [[]];
  }

  ngOnInit(): void {
    this.resService.resList.subscribe((value) => {
      this.resLists[this.selectedTabIndex - 1] = value;
      // this.tabs[this.selected.value - 1] = 'テストタイトル';
      this.cdr.detectChanges();
    });
    this.resService.scrollPos.subscribe((value) => {
      console.log('-----------get scroll array----------');
      console.log(this.selectedTabIndex - 1);
      if (this.selectedTabIndex - 1 === value.index) {
        this.scrollPos[this.selectedTabIndex - 1] = value.pos;
      }
      console.log(this.scrollPos);
    });
  }

  addTab() {
    this.tabs.push('テストタイトル');
    this.resLists.push([]);
    this.scrollPos.push(0);
    this.selectedTabIndex = this.tabs.length;
  }

  removeTab(index: number) {
    this.resLists.splice(index, 1);
    this.tabs.splice(index, 1);
    this.scrollPos.splice(index, 1);
  }

  tabChangedHandler($event: MatTabChangeEvent) {
    console.log('-----------tabchange----------');
    console.log($event.index);
    console.log(this.scrollPos[$event.index - 1]);
    this.selectedTabIndex = $event.index;
    const pos = {
      index: $event.index,
      pos: this.scrollPos[$event.index - 1]
    };

    // @ts-ignore
    this.resService.setScrollPos(pos);
  }
}
