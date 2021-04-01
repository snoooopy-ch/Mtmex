import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ResService} from '../../res.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {

  @Input()
  public tabIndex;
  @Input()
  public tabInfo: any = {};
  @Output()
  public abstractAndCancelEmitter = new EventEmitter();
  @Output()
  public searchAllEmitter = new EventEmitter();
  @Output()
  public searchAllCancelEmitter = new EventEmitter();
  @Output()
  public noticeChangeEmitter = new EventEmitter();
  @Output()
  public showSelectEmitter = new EventEmitter();
  public allTabCount: any;
  public subscribers: any = {};

  constructor(private resService: ResService, private cdRef: ChangeDetectorRef) {
    this.tabInfo = {
      tabTitle: '',
      selectCount: 0,
      candi1Count: 0,
      candi2Count: 0,
      candi3Count: 0,
      candi4Count: 0,
      totalCount: 0
    };
    this.allTabCount = {
      select: 0,
      candi1: 0,
      candi2: 0,
      candi3: 0,
      candi4: 0
    };
  }

  ngOnInit(): void {
    this.subscribers.changeResCount = this.resService.changeResCount.subscribe((value) => {

      if (value?.statusToken) {
        this.allTabCount = value.allTabCount;
        this.cdRef.detectChanges();
        value.statusToken = false;
      }
    });
  }


  printHtmlTagHandler() {
    this.resService.setPrintHtmlOnStatus(0);
  }

  printAllHtmlTagHandler() {
    this.resService.setPrintAllHtmlOnStatusSource(0);
  }

  btnAbstractAndCancelHandler() {
    this.abstractAndCancelEmitter.emit();
  }

  btnSearchAllHandler() {
    this.searchAllEmitter.emit();
  }

  btnSearchAllChangeHandler() {
    this.searchAllCancelEmitter.emit();
  }

  btnNoticeChangeHandler() {
    this.noticeChangeEmitter.emit();
  }

  btnShowSelectHandler() {
    this.showSelectEmitter.emit();
  }

  btnSetAllUnselectedHandler() {
    this.resService.setDisplayAllSelectedRes({
      display: false,
      token: true
    });
  }
}
