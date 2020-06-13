import { ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import {ResService} from '../res.service';
const electron = (window as any).require('electron');

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
  htmlTag: string;

  constructor(private resService: ResService, private cdRef: ChangeDetectorRef, private clipboard: Clipboard) {
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

    this.resService.selectedRes.subscribe((value) => {
      if (this.tabIndex === value.tabIndex) {
        this.selectCount = value.select;
        this.candi1Count = value.candi1;
        this.candi2Count = value.candi2;
        this.cdRef.detectChanges();
      }
    });

    this.resService.totalRes.subscribe((value) => {
      if (this.tabIndex === value.tabIndex){
        this.totalCount = value.totalCount;
      }
    });

    this.resService.printHtml.subscribe( (value) => {
      if (this.tabIndex === value.tabIndex){
        this.htmlTag = value.html;
        this.clipboard.copy(this.htmlTag);
      }
    });
  }


  onLoadUrl(txtUrl: string, isResSort: boolean, isMultiAnchor: boolean, isReplaceRes: boolean) {
    this.resService.loadRes(txtUrl, isResSort, isMultiAnchor, isReplaceRes);
  }

  /**
   * IDを非表示のID欄から削除し、そのIDのレスを、レス描写エリアに表示します
   * @param id: 非表示のID
   */
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

  /**
   * レス描写エリアを移動します
   * @param value: 移動種類
   */
  moveResViewHandler(value: string) {
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

  setDefaultPathHandler() {
    this.txtUrl = this.settings.defaultPath;
  }

  printHtmlTagHandler() {
    this.resService.setPrintCommand({tabIndex: this.tabIndex});
  }

  saveCurrentLes() {
    electron.remote.dialog.showSaveDialog(null, {title: 'レス状態保存'}).then(result => {
      if (!result.canceled){
        console.log('rightpanel');
        this.resService.setSaveResStatus({
          tabIndex: this.tabIndex,
          filePath: result.filePath,
          isResSort: this.isResSort,
          isMultiAnchor: this.isMultiAnchor,
          isReplaceRes: this.isReplaceRes,
          txtPath: this.txtUrl
        });
      }

    }).catch(err => {
      console.log(err);
    });
  }
}
