import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import {CdkDragDrop, CdkDragStart, moveItemInArray} from '@angular/cdk/drag-drop';
import {ResItem} from '../../models/res-item';
import {ResService} from '../../res.service';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentComponent implements OnInit, AfterViewInit {
  @Input() tabName = 'New Tab';
  @Input() resList: ResItem[];
  @Input() tabIndex;
  hiddenIds: string [];
  private selectedIndex;
  @ViewChild('resListContainer') virtualScroller: CdkVirtualScrollViewport;

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

    this.resService.scrollPos.subscribe((scrollPos) => {
        console.log('-----------set scroll----------');
        console.log(scrollPos);
        console.log(this.tabIndex);
        if (scrollPos.index === this.tabIndex){
          this.virtualScroller.scrollToOffset(scrollPos.pos);
        }

    });
  }


  ngAfterViewInit(): void{
    this.virtualScroller.elementScrolled()
      .subscribe(event => {
        this.resService.setScrollPos({index: this.tabIndex, pos: this.virtualScroller.measureScrollOffset('top')});
      });
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.resList, this.selectedIndex,
      this.selectedIndex + (event.currentIndex - event.previousIndex));
    this.resList = [...this.resList];
  }

  duplicateRes(index: number) {
    this.resList.splice(index + 1, 0, this.resList[index]);
    this.resList = [...this.resList];
    // this.cdRef.detectChanges();
  }

  hideRes(resId: string) {
    this.hiddenIds = [...this.hiddenIds, resId];
    this.resService.setHiddenIds(this.hiddenIds);
  }

  upRes(index: number) {
    moveItemInArray(this.resList, index, index - 1);
    this.resList = [...this.resList];
  }

  downRes(index: number) {
    moveItemInArray(this.resList, index, index + 1);
    this.resList = [...this.resList];
  }

  toTopRes(index: number) {
    const tmpRes = Object.assign({}, this.resList[index]);
    this.resList.splice(index, 1);
    this.resList.splice(0, 0, tmpRes);
    this.resList = [...this.resList];
    this.virtualScroller.scrollToIndex(0);
  }

  toBottomRes(index: number) {
    const tmpRes = Object.assign({}, this.resList[index]);
    this.resList.splice(index, 1);
    this.resList.push(tmpRes);
    this.resList = [...this.resList];
    this.virtualScroller.scrollToIndex(this.resList.length);
  }

  dragStarted($event: CdkDragStart, index: number) {
    this.selectedIndex = index;
  }

}
