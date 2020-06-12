import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, EventEmitter,
  Input,
  OnInit, Output, Pipe, PipeTransform,
  ViewChild
} from '@angular/core';
import {CdkDragDrop, CdkDragStart, moveItemInArray} from '@angular/cdk/drag-drop';
import {ResItem} from '../../models/res-item';
import {ResService} from '../../res.service';
import { normal } from 'color-blend';
import {VirtualScrollerComponent} from 'ngx-virtual-scroller';
import {MatButtonToggle, MatButtonToggleChange} from '@angular/material/button-toggle';
import {Hotkey, HotkeysService} from 'angular2-hotkeys';



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
  private selectedResIndex;
  @ViewChild('resListContainer') virtualScroller: VirtualScrollerComponent;
  @ViewChild('btnSearch') btnSearch: MatButtonToggle;
  @ViewChild('btnNotice') btnImportant: MatButtonToggle;
  hovered: number;
  draggable: number;
  @Input() hoveredColor;
  @Input() backgroundColors;
  @Input() characterColors;
  @Input() leftBorder;
  @Input() idStyles;
  @Input() resSizeList;
  @Input() hitColor;
  @Input() idRed;
  @Input() noticeCount;
  @Input() subHotKeys;
  @Output() filteredEmitter = new EventEmitter();
  searchOption = 'context';
  searchKeyword = '';
  search = '';
  important: '';
  backupResList;
  noticeBackupResList;

  constructor(private cdRef: ChangeDetectorRef, private resService: ResService, private hotkeysService: HotkeysService) {
    this.hiddenIds = [];
    this.hovered = -1;
    this.subHotKeys = [];
  }

  ngOnInit(): void {
    // console.log(this.subHotKeys);
    this.resService.LoadHiddenIds.subscribe((hiddenIds) => {
      this.hiddenIds = hiddenIds;
      for (let i = 0; i < this.resList.length; i++){
        this.resList[i].show = this.hiddenIds.indexOf(this.resList[i].id) === -1;
      }
      this.cdRef.detectChanges();
    });

    this.resService.scrollPos.subscribe((scrollPos) => {
         if (scrollPos.index === this.tabIndex && scrollPos.isTab){
          this.virtualScroller.scrollToIndex(scrollPos.pos);
        }
    });

    this.resService.moveRes.subscribe((value) => {
      if (value.tabIndex === this.tabIndex){
        this.moveScroller(value.moveKind);
      }
    });

    this.resService.selectCommand.subscribe((value) => {
      if (value.tabIndex === this.tabIndex){
         this.multiSelection(value.command);
      }
    });

    this.resService.selectedTab.subscribe((value) => {
      if (value.tabIndex === this.tabIndex){
        this.setHotKeys();
      }
    });

    this.setHotKeys();

  }

  setHotKeys(){
    if (this.subHotKeys.hasOwnProperty('sentaku_no1')) {
      this.hotkeysService.add(new Hotkey([this.subHotKeys.sentaku_no1,
        this.subHotKeys.sentaku_no2, this.subHotKeys.sentaku_no3], (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          if (this.resList[this.hovered].resSelect === 'select') {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[0];
            this.selectedRes(this.resList[this.hovered],
              {select: false, candi1: false, candi2: false, selected: 'none'});

          } else {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[1];
            this.selectedRes(this.resList[this.hovered],
              {select: true, candi1: false, candi2: false, selected: 'select'});
          }
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.yobi1, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          if (this.resList[this.hovered].resSelect === 'candi1') {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[0];
            this.selectedRes(this.resList[this.hovered],
              {select: false, candi1: false, candi2: false, selected: 'none'});
          } else {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[2];
            this.selectedRes(this.resList[this.hovered],
              {select: false, candi1: true, candi2: false, selected: 'candi1'});
          }
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.yobi2, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          if (this.resList[this.hovered].resSelect === 'candi2') {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[0];
            this.selectedRes(this.resList[this.hovered],
              {select: false, candi1: false, candi2: false, selected: 'none'});
          } else {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[3];
            this.selectedRes(this.resList[this.hovered],
              {select: false, candi1: false, candi2: true, selected: 'candi2'});
          }
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.up, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.upRes(this.resList[this.hovered]);
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.down, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.downRes(this.resList[this.hovered]);
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.big1, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resFontSize = this.resSizeList[1].value;
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.big2, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resFontSize = this.resSizeList[2].value;
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.nasi, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resColor = '#f00';
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.color1, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resColor = this.characterColors[0];
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.color2, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resColor = this.characterColors[1];
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));
      this.hotkeysService.add(new Hotkey(this.subHotKeys.color3, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resColor = this.characterColors[2];
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.color4, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resColor = this.characterColors[3];
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.color5, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resColor = this.characterColors[4];
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.color6, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resColor = this.characterColors[5];
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.color7, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resColor = this.characterColors[6];
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.color8, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resColor = this.characterColors[7];
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.color9, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resColor = this.characterColors[8];
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.color10, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.resList[this.hovered].resColor = this.characterColors[9];
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.tree_sentaku, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedTreeRes(this.hovered, {select: 1, resBackgroundColor: this.backgroundColors[1]});
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.tree_yobi1, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedTreeRes(this.hovered, {select: 2, resBackgroundColor: this.backgroundColors[2]});
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.tree_yobi2, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedTreeRes(this.hovered, {select: 3, resBackgroundColor: this.backgroundColors[3]});
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.tree_kaijo, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedTreeRes(this.hovered, {select: 0, resBackgroundColor: this.backgroundColors[0]});
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.id1, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedId(this.resList[this.hovered].id,
            { isSelect: true,
              idColor: this.idStyles[1].color,
              idBackgroundColor: this.idStyles[1].background,
              resBackgroundColor: this.backgroundColors[1]
            });
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.id2, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedId(this.resList[this.hovered].id,
            { isSelect: true,
              idColor: this.idStyles[2].color,
              idBackgroundColor: this.idStyles[2].background,
              resBackgroundColor: this.backgroundColors[1]
            });
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.id3, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedId(this.resList[this.hovered].id,
            { isSelect: true,
              idColor: this.idStyles[3].color,
              idBackgroundColor: this.idStyles[3].background,
              resBackgroundColor: this.backgroundColors[1]
            });
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.id_kaijo, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          if (this.resList[this.hovered].resSelect === 'select') {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[0];
            this.selectedRes(this.resList[this.hovered], {
              selected: 'none',
              select: false,
              candi1: false,
              candi2: false
            });
          }
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.id_irokesi, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          this.selectedId(this.resList[this.hovered].id,
            { isSelect: false,
              idColor: this.idStyles[0].color,
              idBackgroundColor: this.idStyles[0].background,
              resBackgroundColor: this.backgroundColors[0]
            });
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

      this.hotkeysService.add(new Hotkey(this.subHotKeys.id_kaijo_irokesi, (event: KeyboardEvent): boolean => {
        if (this.hovered >= 0) {
          if (this.resList[this.hovered].resSelect === 'select') {
            this.resList[this.hovered].resBackgroundColor = this.backgroundColors[0];
            this.selectedRes(this.resList[this.hovered], {
              selected: 'none',
              select: false,
              candi1: false,
              candi2: false
            });
          }
          this.selectedId(this.resList[this.hovered].id,
            { isSelect: false,
              idColor: this.idStyles[0].color,
              idBackgroundColor: this.idStyles[0].background,
              resBackgroundColor: this.backgroundColors[0]
            });
          this.cdRef.detectChanges();
        }
        return false; // Prevent bubbling
      }));

    }
  }

  /**
   * Move the scroll of res list
   * @param moveKind: 'top', 'bottom', 'selected-top', 'selected-bottom'
   */
  moveScroller(moveKind: string){

    switch (moveKind) {
      case 'top':
        this.virtualScroller.scrollToIndex(0);
        break;
      case 'bottom':
        this.virtualScroller.scrollToIndex(this.resList.length);
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
        if (this.resList.length > 0) {
          for (let i = this.resList.length - 1; i > 0; i--) {
            if (this.resList[i].resSelect === 'select') {
              this.virtualScroller.scrollToIndex(i);
              break;
            }
          }
        }
        break;
    }
  }

  /**
   * drop event for moving res
   * @param event: cdkdragdrop
   */
  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.resList, this.selectedResIndex,
      this.selectedResIndex + (event.currentIndex - event.previousIndex));
    this.resList = [...this.resList];
  }

  dragStarted($event: CdkDragStart, item) {
    this.selectedResIndex = this.resList.indexOf(item);
  }

  duplicateRes(item: any) {
    const index = this.resList.indexOf(item);
    this.resList.splice(index + 1, 0, item);
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

  upRes(item: any) {
    const index = this.resList.indexOf(item);
    moveItemInArray(this.resList, index, index - 1);
    this.resList = [...this.resList];
  }

  downRes(item: any) {
    const index = this.resList.indexOf(item);
    moveItemInArray(this.resList, index, index + 1);
    this.resList = [...this.resList];
  }

  toTopRes(item: any) {
    const index = this.resList.indexOf(item);
    const tmpRes = Object.assign({}, item);
    this.resList.splice(index, 1);
    this.resList.splice(0, 0, tmpRes);
    this.resList = [...this.resList];
    this.virtualScroller.scrollToIndex(0);
  }

  toBottomRes(item: any) {
    const index = this.resList.indexOf(item);
    const tmpRes = Object.assign({}, item);
    this.resList.splice(index, 1);
    this.resList.push(tmpRes);
    this.resList = [...this.resList];
    this.virtualScroller.scrollToIndex(this.resList.length);
  }

  selectedRes(item: any, $event: any) {
    item.select = $event.select;
    item.candi1 = $event.candi1;
    item.candi2 = $event.candi2;
    item.resSelect = $event.selected;
    this.resList = [...this.resList];
    this.changeStatus();
    this.cdRef.detectChanges();
  }

  changeStatus(){
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
        res.idColor = $event.idColor;
        if ($event.isSelect) {
          res.resBackgroundColor = $event.resBackgroundColor;
          res.resSelect = 'select';
          res.select = true;
          res.candi1 = false;
          res.candi2 = false;
        }
      }
    }
    this.changeStatus();
  }

  selectedTreeRes(index: number, $event: any) {
    const selecteKeys = ['none', 'select', 'candi1', 'candi2'];
    if (index < this.resList.length - 1) {
      if (this.resList[index + 1].isAdded &&
        this.resList[index + 1].anchors.indexOf(this.resList[index].num) !== -1){
        this.resList[index].resSelect = selecteKeys[$event.select];
        this.resList[index].resBackgroundColor = $event.resBackgroundColor;
        this.calcSelectedRes($event.select, this.resList[index]);
        if (this.resList[index].isAdded){
          for (let i = index - 1; i > 0; i--){
            this.resList[i].resSelect = selecteKeys[$event.select];
            this.resList[i].resBackgroundColor = $event.resBackgroundColor;
            this.calcSelectedRes($event.select, this.resList[i]);
            if (!this.resList[i].isAdded) { break; }
          }
        }
        for (let i = index + 1; i < this.resList.length; i++){
          if (!this.resList[i].isAdded) { break; }
          this.resList[i].resSelect = selecteKeys[$event.select];
          this.resList[i].resBackgroundColor = $event.resBackgroundColor;
          this.calcSelectedRes($event.select, this.resList[i]);
        }
      }
    }
    this.changeStatus();
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

  getDraggable(index: number) {
    return this.draggable !== index;
  }

  setDraggable(index: number, $event: any) {
    if ($event){
      this.draggable = index;
    }else{
      this.draggable = -1;
    }
  }

  multiSelection(command: string){
    for (let i = this.virtualScroller.viewPortInfo.startIndex; i <= this.virtualScroller.viewPortInfo.endIndex; i++){
      switch (command) {
        case 'select':
          this.resList[i].resSelect = 'select';
          this.resList[i].select = true;
          this.resList[i].candi1 = false;
          this.resList[i].candi2 = false;
          this.resList[i].resBackgroundColor = this.backgroundColors[1];
          break;
        case 'candi1':
          this.resList[i].resSelect = 'candi1';
          this.resList[i].select = false;
          this.resList[i].candi1 = true;
          this.resList[i].candi2 = false;
          this.resList[i].resBackgroundColor = this.backgroundColors[2];
          break;
        case 'candi2':
          this.resList[i].resSelect = 'candi2';
          this.resList[i].select = false;
          this.resList[i].candi1 = false;
          this.resList[i].candi2 = true;
          this.resList[i].resBackgroundColor = this.backgroundColors[3];
          break;
        case 'select-image':
          if (this.resList[i].hasImage) {
            this.resList[i].resSelect = 'select';
            this.resList[i].select = true;
            this.resList[i].candi1 = false;
            this.resList[i].candi2 = false;
            this.resList[i].resBackgroundColor = this.backgroundColors[1];
          }
          break;
        case 'candi1-image':
          if (this.resList[i].hasImage) {
            this.resList[i].resSelect = 'candi1';
            this.resList[i].select = false;
            this.resList[i].candi1 = true;
            this.resList[i].candi2 = false;
            this.resList[i].resBackgroundColor = this.backgroundColors[2];
          }
          break;
        case 'candi2-image':
          if (this.resList[i].hasImage) {
            this.resList[i].resSelect = 'candi2';
            this.resList[i].select = false;
            this.resList[i].candi1 = false;
            this.resList[i].candi2 = true;
            this.resList[i].resBackgroundColor = this.backgroundColors[3];
          }
          break;
        case 'cancel-select':
          if (this.resList[i].resSelect === 'select') {
            this.resList[i].resSelect = 'none';
            this.resList[i].select = false;
            this.resList[i].resBackgroundColor = this.backgroundColors[0];
          }
          break;
        case 'cancel-candi1':
          if (this.resList[i].resSelect === 'candi1') {
            this.resList[i].resSelect = 'none';
            this.resList[i].candi1 = false;
            this.resList[i].resBackgroundColor = this.backgroundColors[0];
          }
          break;
        case 'cancel-candi2':
          if (this.resList[i].resSelect === 'candi2') {
            this.resList[i].resSelect = 'none';
            this.resList[i].candi2 = false;
            this.resList[i].resBackgroundColor = this.backgroundColors[0];
          }
          break;
      }
    }
    this.cdRef.detectChanges();
    this.changeStatus();
  }

  usUpdateHandler($event: any[]) {
    this.resService.setScrollPos({index: this.tabIndex,
      pos: this.virtualScroller.viewPortInfo.startIndex,
      isTab: false
    });
  }

  searchTextHandler() {
    if (this.btnSearch.checked){
      if (this.searchKeyword.length === 0) {
        this.btnSearch.checked = false;
      }else{
        this.backupResList = Object.assign([], this.resList);
        let tmpResList = [];
        const re = new RegExp(this.searchKeyword, 'gi');
        const replacers = this.searchKeyword.split('|');
        let index = 0;
        for (const res of this.resList){
          if (this.searchOption === 'context'){
            if (res.content.match(re)){
              for (const replace of replacers){
                const regExp = new RegExp(replace, 'gi');
                res.content = res.content.replace(regExp, `<span style="background-color: ${this.hitColor};">${replace}</span>`);
              }
              res.isFiltered = true;
              res.originalIndex = index;
              tmpResList = [...tmpResList, res];
            }
          }else{
            if (res.content.match(re) || res.name.match(re) || res.id.match(re)){

              for (const replace of replacers){
                const regExp = new RegExp(replace, 'gi');
                res.content = res.content.replace(regExp, `<span style="background-color: ${this.hitColor};">${replace}</span>`);
                res.id = res.id.replace(replace, `<span style="background-color: ${this.hitColor};">${replace}</span>`);
                res.name = res.name.replace(replace, `<span style="background-color: ${this.hitColor};">${replace}</span>`);
              }
              res.isFiltered = true;
              res.originalIndex = index;
              tmpResList = [...tmpResList, res];
            }
          }
          index++;
        }
        this.resList = [];
        this.resList = tmpResList;
        this.changeStatus();
        this.resService.setTotalRes({
          tabIndex: this.tabIndex,
          totalCount: this.resList.length
        });
      }
    }else{
      for (const res of this.resList){
        res.content = res.content.replace(/(<span[^<]+>)/ig, '');
        res.content = res.content.replace(/<\/span>/ig, '');
        if (this.searchOption === 'all'){
          res.id = res.id.replace(/(<span[^<]+>)/ig, '');
          res.id = res.id.replace(/<\/span>/ig, '');
          res.name = res.name.replace(/(<span[^<]+>)/ig, '');
          res.name = res.name.replace(/<\/span>/ig, '');
        }
      }
      this.resList = Object.assign([], this.backupResList);
      this.changeStatus();
      this.resService.setTotalRes({
        tabIndex: this.tabIndex,
        totalCount: this.resList.length
      });
    }
    this.filteredEmitter.emit(this.btnSearch.checked);
  }

  selectedNum(resItem: ResItem) {
    if (resItem.originalIndex !== null) {
      moveItemInArray(this.backupResList, resItem.originalIndex, 0);
    }
    this.btnSearch.checked = false;
    this.searchTextHandler();
    this.virtualScroller.scrollToIndex(0);
  }

  filterNoticeHandler() {
    if (this.btnImportant.checked){
      this.noticeBackupResList = Object.assign([], this.resList);
      let tmpResList = [];
      let parentRes = [];
      for (const res of this.resList){
        if (!res.isAdded && res.anchorCount > this.noticeCount){
          tmpResList = [...tmpResList, res];
          parentRes = [...parentRes, res.num];
        }else{
          if (res.isAdded){
            for (const parent of parentRes){
              if (res.anchors.indexOf(parent) !== -1){
                tmpResList = [...tmpResList, res];
                parentRes = [...parentRes, res.num];
                break;
              }
            }
          }
        }
      }
      this.resList = [];
      this.resList = tmpResList;
      this.changeStatus();
      this.resService.setTotalRes({
        tabIndex: this.tabIndex,
        totalCount: this.resList.length
      });
    }else{
      this.resList = Object.assign([], this.noticeBackupResList);
      this.changeStatus();
      this.resService.setTotalRes({
        tabIndex: this.tabIndex,
        totalCount: this.resList.length
      });
    }
  }
}
