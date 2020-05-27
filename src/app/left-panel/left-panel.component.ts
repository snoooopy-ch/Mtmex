import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ResService} from '../res.service';

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrls: ['./left-panel.component.css']
})
export class LeftPanelComponent implements OnInit {
  resList: [];
  constructor(private resService: ResService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.resService.resList.subscribe((value) => {
      this.resList = value;
      this.cdr.detectChanges();
    });
  }

}
