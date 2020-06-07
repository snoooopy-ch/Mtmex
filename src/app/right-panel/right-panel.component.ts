import { ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {ResService} from '../res.service';

@Component({
  selector: 'app-right-panel',
  templateUrl: './right-panel.component.html',
  styleUrls: ['./right-panel.component.css']
})
export class RightPanelComponent implements OnInit {
  txtUrl = '';
  isResSort = false;
  isMultiAnchor = false;
  isReplaceRes = false;
  hiddenIds: string[];
  tabIndex: number;
  selectCount = 0;
  candi1Count = 0;
  candi2Count = 0;
  totalCount = 0;
  selectCommand = '';
  settings;

  constructor(private resService: ResService, private cdRef: ChangeDetectorRef) {
    this.hiddenIds = [];
  }

  ngOnInit(): void {
    this.resService.LoadHiddenIds.subscribe((hiddenIds) => {
      this.hiddenIds = hiddenIds;
      this.cdRef.detectChanges();
    });

    this.resService.settings.subscribe((value) => {
      this.settings = value;
      this.txtUrl = this.settings.dataPath;
      this.isReplaceRes = this.settings.isReplaceRes;
      this.isMultiAnchor = this.settings.isMultiAnchor;
      this.isResSort = this.settings.isResSort;
      this.cdRef.detectChanges();
    });

    this.resService.selectedTab.subscribe((value ) => {
      this.tabIndex = value.tabIndex;
      this.selectCount = value.select;
      this.candi1Count = value.candi1;
      this.candi2Count = value.candi2;
      this.totalCount = value.totalCount;
    });

    this.resService.selectedRes.subscribe(value => {
      if (this.tabIndex === value.tabIndex) {
        this.selectCount = value.select;
        this.candi1Count = value.candi1;
        this.candi2Count = value.candi2;
        this.cdRef.detectChanges();
      }
    });

    this.resService.totalRes.subscribe(value => {
      if (this.tabIndex === value.tabIndex){
        this.totalCount = value.totalCount;
      }
    });
  }

  onLoadUrl(txtUrl: string, isResSort: boolean, isMultiAnchor: boolean, isReplaceRes: boolean) {
    this.resService.loadRes(txtUrl, isResSort, isMultiAnchor, isReplaceRes);
  }

  ShowIdHandler(id: string) {
    let exists = false;
    for (let i = 0; i < this.hiddenIds.length; i++){
      if (this.hiddenIds[i] === id){
        this.hiddenIds.splice(i, 1);
        exists = true;
        break;
      }
    }
    if (exists){
      this.cdRef.detectChanges();
      this.resService.setHiddenIds(this.hiddenIds);
    }
  }

  moveResHandler(value: string) {
    this.resService.setMoveRes({
      tabIndex: this.tabIndex,
      moveKind: value
    });
  }

  selectResHandler() {
    this.resService.setSelectCommand({
      tabIndex: this.tabIndex,
      command: this.selectCommand
    });
    this.selectCommand = '';
  }

  setDefaultPathHandler($event: MouseEvent) {
    this.txtUrl = this.settings.defaultPath;
  }
}
