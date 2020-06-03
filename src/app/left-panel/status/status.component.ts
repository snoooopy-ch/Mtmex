import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {ResService} from '../../res.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {

  @Input() resTotal;
  selectCount = 0;
  candi1Count = 0;
  candi2Count = 0;
  constructor(private resService: ResService, private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.resService.selectedRes.subscribe(value => {
      this.selectCount = value.select;
      this.candi1Count = value.candi1;
      this.candi2Count = value.candi2;
      this.cdRef.detectChanges();
    });
  }

}
