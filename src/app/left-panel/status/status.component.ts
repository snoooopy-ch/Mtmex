import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {ResService} from '../../res.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {

  totalCount;
  @Input() tabIndex;
  selectCount = 0;
  candi1Count = 0;
  candi2Count = 0;
  candi3Count = 0;
  candi4Count = 0;
  constructor(private resService: ResService, private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.resService.selectedRes.subscribe(value => {
      if (this.tabIndex === value.tabIndex) {
        this.selectCount = value.select;
        this.candi1Count = value.candi1;
        this.candi2Count = value.candi2;
        this.candi3Count = value.candi3;
        this.candi4Count = value.candi4;
        this.cdRef.detectChanges();
      }
    });
    this.resService.totalRes.subscribe(value => {
      if (this.tabIndex === value.tabIndex){
        this.totalCount = value.totalCount;
      }
    });
  }

  printHtmlTagHandler() {
    this.resService.setPrintCommand({tabIndex: this.tabIndex, token: true});
  }

  printAllHtmlTagHandler() {
    this.resService.setPrintAllCommand({ token: true});
  }
}
