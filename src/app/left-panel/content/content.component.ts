import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {ResItem} from '../../models/res-item';
import {ResService} from '../../res.service';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentComponent implements OnInit {
  @Input() tabName = 'New Tab';
  @Input() resList: ResItem[];
  @Input() tabIndex;
  hiddenIds: string [];

  constructor(private cdRef: ChangeDetectorRef, private resService: ResService) {
    this.hiddenIds = [];
  }

  ngOnInit(): void {
    this.resService.LoadHiddenIds.subscribe((hiddenIds) => {
      this.hiddenIds = hiddenIds;
      for (let i = 0; i < this.resList.length; i++){
        this.resList[i].show = this.hiddenIds.indexOf(this.resList[i].id) === -1;
      }
      this.cdRef.detectChanges();
    });
  }
  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.resList, event.previousIndex, event.currentIndex);
  }

  duplicateRes($event: any) {
    this.resList.splice($event + 1, 0, this.resList[$event]);
    this.cdRef.detectChanges();
  }

  hideRes($event: any) {
    this.hiddenIds.push($event);
    this.resService.setHiddenIds(this.hiddenIds);
  }

  upRes($event: number) {
    const tmpRes = Object.assign({}, this.resList[$event - 1]);
    this.resList[$event - 1] = this.resList[$event];
    this.resList[$event] = tmpRes;
    this.cdRef.detectChanges();
  }

  downRes($event: number) {
    const tmpRes = Object.assign({}, this.resList[$event + 1]);
    this.resList[$event + 1] = this.resList[$event];
    this.resList[$event] = tmpRes;
    this.cdRef.detectChanges();
  }

  toTopRes($event: number, el: HTMLDivElement) {
    const tmpRes = Object.assign({}, this.resList[$event]);
    this.resList.splice($event, 1);
    this.resList.splice(0, 0, tmpRes);
    this.cdRef.detectChanges();
    el.scrollTop = 0;
  }

  toBottomRes($event: number, el: HTMLDivElement) {
    const tmpRes = Object.assign({}, this.resList[$event]);
    this.resList.splice($event, 1);
    this.resList.push(tmpRes);
    this.cdRef.detectChanges();
    el.scrollTop = Math.max(0, el.scrollHeight - el.offsetHeight);
  }
}
