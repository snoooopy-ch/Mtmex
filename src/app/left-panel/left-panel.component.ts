import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ResService} from '../res.service';
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrls: ['./left-panel.component.css']
})
export class LeftPanelComponent implements OnInit {
  resLists: [][];
  tabs = ['New '];
  selected = new FormControl(1);
  constructor(private resService: ResService, private cdr: ChangeDetectorRef) {
    this.resLists = [[], []];
  }

  ngOnInit(): void {
    this.resService.resList.subscribe((value) => {
      this.resLists[this.selected.value - 1] = value;
      this.cdr.detectChanges();
    });
  }

  addTab() {
    this.tabs.push('New');
    this.resLists.push([]);
    this.selected.setValue(this.tabs.length);
  }

  removeTab(index: number) {
    this.tabs.splice(index, 1);
  }
}
