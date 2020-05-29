import {Component, Input, OnInit} from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {
  @Input() tabName = 'New Tab';
  @Input() resList: [];
  constructor() { }

  ngOnInit(): void {

  }
  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.resList, event.previousIndex, event.currentIndex);
  }

}
