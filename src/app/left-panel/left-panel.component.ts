import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ResService} from '../res.service';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrls: ['./left-panel.component.css']
})
export class LeftPanelComponent implements OnInit {
  resLists: [any[]];
  tabs = ['New Tab'];
  selected = new FormControl(1);
  constructor(private resService: ResService, private cdr: ChangeDetectorRef) {
    this.resLists = [[]];
  }

  ngOnInit(): void {
    this.resService.resList.subscribe((value) => {
      console.log(Date.now());
      this.resLists[this.selected.value - 1] = value;
      console.log(Date.now());
      // this.tabs[this.selected.value - 1] = 'テストタイトル';
      this.cdr.detectChanges();
      console.log(Date.now());
    });
  }

  addTab() {
    this.tabs.push('テストタイトル');
    this.resLists.push([]);
    this.selected.setValue(this.tabs.length);
  }

  removeTab(index: number) {
    this.resLists.splice(index, 1);
    this.tabs.splice(index, 1);
  }
}
