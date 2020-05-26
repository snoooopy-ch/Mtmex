import { Component } from '@angular/core';
import {ResService} from './res.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Mtmex';
  constructor(private resService: ResService) {}
}
