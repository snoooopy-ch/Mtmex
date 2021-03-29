import {Component, Input, OnInit} from '@angular/core';
import {ResService} from '../../res.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {

  @Input()
  public tabIndex;
  @Input()
  public tabInfo: any = {};
  constructor(private resService: ResService) {
    this.tabInfo = {
      tabTitle: '',
      selectCount: 0,
      candi1Count: 0,
      candi2Count: 0,
      candi3Count: 0,
      candi4Count: 0,
      totalCount: 0
    };
  }

  ngOnInit(): void {
  }


  printHtmlTagHandler() {
    this.resService.setPrintHtmlOnStatus(0);
  }

  printAllHtmlTagHandler() {
    this.resService.setPrintAllHtmlOnStatusSource(0);
  }
}
