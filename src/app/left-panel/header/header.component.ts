import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {

    // const TabGroup = (<any>window).require('electron-tabs');
    // const tabGroup = new TabGroup({
    //   newTab: {
    //     title: 'New Tab'
    //   }
    // });
  }

}
