import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {ResItem} from '../../models/res-item';
import {ResService} from '../../res.service';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
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
        if (this.hiddenIds.indexOf(this.resList[i].id) !== -1){
          this.resList[i].show = false;
        }else{
          this.resList[i].show = true;
        }
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
}
