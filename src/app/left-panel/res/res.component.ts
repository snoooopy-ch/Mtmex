import {Component, Input, OnInit, } from '@angular/core';
import {Item} from '../../models/item';
import {RES_FONT_SIZE} from '../../models/res-size-data';
declare  var jQuery:  any;
declare  var $:  any;

@Component({
  selector: 'app-res',
  templateUrl: './res.component.html',
  styleUrls: ['./res.component.css']
})
export class ResComponent implements OnInit {
  @Input() item;
  resSelect = 'select';
  resSizeList: Item[] = RES_FONT_SIZE;
  resFontSize = '19px';
  constructor() {
    this.resSizeList = RES_FONT_SIZE;
  }

  ngOnInit(): void {
    $(document).ready(function(){
      var xOffset = 150;
      var yOffset = 40;
      var imgPop = $('#preview img');
      $('a.res-img-link').hover(function(e){
        this.t = this.href;
        this.title = "";
        imgPop.attr("src", this.href);
        var c = (this.t != "") ? "<br/>" + this.t : "";
        $("#preview").css("display", "block");
        $("#preview")
            .css("top",(e.pageY - xOffset) + "px")
            .css("left",(e.pageX + yOffset) + "px")
            .fadeIn("slow");
      }, function(){
        this.title = this.t;
        $("#preview").css("display", "none");
      });
    });
  }
  sizeChangeHandler(selectedItem) {
    this.resFontSize = selectedItem.value;
    console.log(this.resFontSize);
  }

}
