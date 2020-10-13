import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ResService} from '../../res.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit, OnDestroy {

  totalCount;
  settings;
  @Input() tabIndex;
  selectCount = 0;
  candi1Count = 0;
  candi2Count = 0;
  candi3Count = 0;
  candi4Count = 0;
  isSurroundImage: boolean = false;
  isReplaceName: boolean = true;
  isOutputCandiBelow: boolean = false;
  tabTitle;
  public subscribers: any = {};
  constructor(private resService: ResService, private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.subscribers.settings = this.resService.settings.subscribe((value) => {
      this.settings = value;
      if (this.settings.yobi_kabu_shuturyoku !== undefined){
        this.isOutputCandiBelow = this.settings.yobi_kabu_shuturyoku;
      }
    });

    this.subscribers.selectedRes = this.resService.selectedRes.subscribe(value => {
      if (this.tabIndex === value.tabIndex && value.statusToken) {
        this.selectCount = value.select;
        this.candi1Count = value.candi1;
        this.candi2Count = value.candi2;
        this.candi3Count = value.candi3;
        this.candi4Count = value.candi4;
        this.cdRef.detectChanges();
        value.statusToken = false;
      }
    });
    this.subscribers.totalRes = this.resService.totalRes.subscribe(value => {
      if (this.tabIndex === value.tabIndex && value.statusToken){
        this.totalCount = value.totalCount;
        this.tabTitle = value.title;
        value.statusToken = false;
      }
    });
    this.subscribers.surroundImage = this.resService.surroundImage.subscribe(value => {
      if (typeof value === "boolean"){
        this.isSurroundImage = value;
      }
        
    });
    this.subscribers.replaceName = this.resService.replaceName.subscribe(value => {
      if (typeof value === "boolean")
        this.isReplaceName = value;
    });
    this.subscribers.outputCandiBelow = this.resService.outputCandiBelow.subscribe(value => {
      if (typeof value === "boolean")
        this.isOutputCandiBelow = value;
    });
    this.subscribers.status = this.resService.status.subscribe((value) => {
      if (this.tabIndex === value.tabIndex) {
        this.selectCount = value.data.selectCount;
        this.totalCount = value.data.totalCount;
        this.candi1Count = value.data.candi1Count;
        this.candi2Count = value.data.candi2Count;
        this.candi3Count = value.data.candi3Count;
        this.candi4Count = value.data.candi4Count;
      }
    });

  }

  ngOnDestroy(){
    this.subscribers.totalRes.unsubscribe();
    this.subscribers.selectedRes.unsubscribe();
    this.subscribers.surroundImage.unsubscribe();
    this.subscribers.replaceName.unsubscribe();
    this.subscribers.outputCandiBelow.unsubscribe();
    this.subscribers.settings.unsubscribe();
  }

  printHtmlTagHandler() {
    this.resService.setPrintCommand({
      tabIndex: this.tabIndex, 
      isReplaceName: this.isReplaceName,
      isSurroundImage: this.isSurroundImage,
      token: true});
  }

  printAllHtmlTagHandler() {
    this.resService.setPrintAllCommand({ 
      isOutputCandiBelow: this.isOutputCandiBelow,
      isReplaceName: this.isReplaceName,
      isSurroundImage: this.isSurroundImage,
      token: true});
  }
}
