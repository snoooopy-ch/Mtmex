import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {
  @Input() tabName = 'New Tab';
  @Input() resList: [];
  @Input() tabIndex;

  constructor(private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {

  }
  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.resList, event.previousIndex, event.currentIndex);
  }

  duplicateRes($event: any) {
    this.resList.splice($event + 1, 0, this.resList[$event]);
    this.cdRef.detectChanges();
  }
}
