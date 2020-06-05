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
import { normal } from 'color-blend';


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
  private selectedResIndex;
  @ViewChild('resListContainer') virtualScroller: CdkVirtualScrollViewport;
  hovered: number;
  hoveredColor = '#cecece';

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
         if (scrollPos.index === this.tabIndex && scrollPos.isTab){
          this.virtualScroller.scrollToOffset(scrollPos.pos);
        }
    });

    this.resService.moveRes.subscribe((value) => {
      if (value.tabIndex === this.tabIndex){
        this.moveScroller(value.moveKind);
      }
    });
  }


  ngAfterViewInit(): void{
    this.virtualScroller.elementScrolled()
      .subscribe(event => {
        this.resService.setScrollPos({index: this.tabIndex,
          pos: this.virtualScroller.measureScrollOffset('top'),
          isTab: false});
      });
  }

  moveScroller(moveKind: string){

    switch (moveKind) {
      case 'top':
        this.virtualScroller.scrollToIndex(0);
        break;
      case 'bottom':
        this.virtualScroller.elementRef.nativeElement.scrollTop = this.virtualScroller.elementRef.nativeElement.scrollHeight;
        break;
      case 'selected-top':
        let index = 0;
        for (const item of this.resList){
          if (item.resSelect === 'select'){
            this.virtualScroller.scrollToIndex(index);
            break;
          }
          index++;
        }

        break;
      case 'selected-bottom':
        let i = this.resList.length - 1;
        for (i > 0; i--;){
            if (this.resList[i].resSelect === 'select') {
              this.virtualScroller.scrollToIndex(i);
              break;
            }
        }
        break;
    }
  }
  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.resList, this.selectedResIndex,
      this.selectedResIndex + (event.currentIndex - event.previousIndex));
    this.resList = [...this.resList];
  }

  duplicateRes(index: number) {
    this.resList.splice(index + 1, 0, this.resList[index]);
    this.resList = [...this.resList];
    this.resService.setTotalRes({
      tabIndex: this.tabIndex,
      totalCount: this.resList.length
    });
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
    this.selectedResIndex = index;
  }

  selectedRes(index: number, $event: any) {
    this.resList[index].select = $event.select;
    this.resList[index].candi1 = $event.candi1;
    this.resList[index].candi2 = $event.candi2;
    this.resList[index].resSelect = $event.selected;
    this.resList = [...this.resList];
    this.resService.setSelectedRes({
      select: this.resList.filter(item => item.select).length,
      candi1: this.resList.filter(item => item.candi1).length,
      candi2: this.resList.filter(item => item.candi2).length,
      tabIndex: this.tabIndex
    });
  }

  selectedId(id: any, $event: any) {
    for (const res of this.resList){
      if (res.id === id){
        res.idBackgroundColor = $event.idBackgroundColor;
        if ($event.isSelect) {
          res.resBackgroundColor = $event.resBackgroundColor;
          res.resSelect = 'select';
          res.select = true;
          res.candi1 = false;
          res.candi2 = false;
        }
      }
    }
    this.resService.setSelectedRes({
      select: this.resList.filter(item => item.select).length,
      candi1: this.resList.filter(item => item.candi1).length,
      candi2: this.resList.filter(item => item.candi2).length,
      tabIndex: this.tabIndex
    });
  }

  selectedTreeRes(index: number, $event: any) {

    if (index < this.resList.length - 1) {
      if (this.resList[index + 1].isAdded &&
        this.resList[index + 1].anchors.indexOf(this.resList[index].num) !== -1){
        this.resList[index].resSelect = $event.select.toString();
        this.resList[index].resBackgroundColor = $event.resBackgroundColor;
        this.calcSelectedRes($event.select, this.resList[index]);
        if (this.resList[index].isAdded){
          for (let i = index - 1; i > 0; i--){
            this.resList[i].resSelect = $event.select.toString();
            this.resList[i].resBackgroundColor = $event.resBackgroundColor;
            this.calcSelectedRes($event.select, this.resList[i]);
            if (!this.resList[i].isAdded) { break; }
          }
        }
        for (let i = index + 1; i < this.resList.length; i++){
          if (!this.resList[i].isAdded) { break; }
          this.resList[i].resSelect = $event.select.toString();
          this.resList[i].resBackgroundColor = $event.resBackgroundColor;
          this.calcSelectedRes($event.select, this.resList[i]);
        }
      }
    }
    this.resService.setSelectedRes({
      select: this.resList.filter(item => item.select).length,
      candi1: this.resList.filter(item => item.candi1).length,
      candi2: this.resList.filter(item => item.candi2).length,
      tabIndex: this.tabIndex
    });
  }

  calcSelectedRes(selectKind: number, item: ResItem){
    switch (selectKind) {
      case 0:
        item.select = false;
        item.candi1 = false;
        item.candi2 = false;
        break;
      case 1:
        item.select = true;
        item.candi1 = false;
        item.candi2 = false;
        break;
      case 2:
        item.select = false;
        item.candi1 = true;
        item.candi2 = false;
        break;
      case 3:
        item.select = false;
        item.candi1 = false;
        item.candi2 = true;
        break;
    }
  }

  mouseEnterHandler(index: number) {
    this.hovered = index;
  }

  getHoverColor(resBackgroundColor: string) {
    if (resBackgroundColor === '#fff' || resBackgroundColor === '#ffffff') {
      return this.hoveredColor;
    }
    let rgbs = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(resBackgroundColor);
    const backgroundRGB = rgbs ? {
      r: parseInt(rgbs[1], 16),
      g: parseInt(rgbs[2], 16),
      b: parseInt(rgbs[3], 16),
      a: 1
    } : {
      r: 255,
      g: 255,
      b: 255,
      a: 1
    };
    rgbs = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this.hoveredColor);
    const hoveredRGB = {
      r: parseInt(rgbs[1], 16),
      g: parseInt(rgbs[2], 16),
      b: parseInt(rgbs[3], 16),
      a: 0.3
    };
    const mixedColor = normal(backgroundRGB, hoveredRGB);
    return `#${mixedColor.r.toString(16)}${mixedColor.g.toString(16)}${mixedColor.b.toString(16)}`;
  }

  mouseLeaveHandler() {
    this.hovered = -1;
  }
}
