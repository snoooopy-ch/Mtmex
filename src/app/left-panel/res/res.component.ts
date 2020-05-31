import {ChangeDetectorRef, Component, Input, OnInit, } from '@angular/core';
import {Item} from '../../models/item';
import {RES_FONT_SIZE} from '../../models/res-size-data';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
declare  var jQuery: any;
declare  var $: any;

@Component({
  selector: 'app-res',
  templateUrl: './res.component.html',
  styleUrls: ['./res.component.css']
})
export class ResComponent implements OnInit {
  public Editor = ClassicEditor;
  @Input() item;
  @Input() resIndex;
  @Input() tabIndex;
  resSelect = 'select';
  resSizeList: Item[] = RES_FONT_SIZE;
  resFontSize = '19px';
  isEdit = false;
  resContent = '';

  constructor(private cdRef: ChangeDetectorRef) {
    this.resSizeList = RES_FONT_SIZE;
  }

  // sizeChangeHandler(selectedItem) {
  //   this.resFontSize = selectedItem.value;
  //   console.log(this.resFontSize);
  // }



  ngOnInit(): void {
    this.resContent = this.item.content;
    $(document).ready(function(){
      let xOffset = 150;
      let yOffset = 40;
      let imgPop = $('#preview img');
      $('a.res-img-link').hover(function(e){
        this.t = this.href;
        this.title = '';
        imgPop.attr('src', this.href);
        let c = (this.t != '') ? '<br/>' + this.t : '';
        $('#preview').css('display', 'block');
        $('#preview')
            .css('top', (e.pageY - xOffset) + 'px')
            .css('left', (e.pageX + yOffset) + 'px')
            .fadeIn('slow');
      }, function(){
        this.title = this.t;
        $('#preview').css('display', 'none');
      });
    });

  }
  handleEditShow() {
    this.isEdit = !this.isEdit;
    if(this.isEdit){
      this.resContent = this.item.content;
    }
    this.cdRef.detectChanges();
  }

  handleSaveRes() {
    this.resContent = this.resContent.replace( /(<p>)/ig, '');
    this.resContent = this.resContent.replace( /(<\/p>)/ig, '');
    this.resContent = this.resContent.replace( /(<figure[^<]+>)/ig, '');
    this.resContent = this.resContent.replace( /<\/figure>/ig, '');
    this.resContent = this.resContent.replace( /&nbsp;/ig, '');
    console.log(this.resContent);
    this.item.content = this.resContent;
    this.isEdit = false;
    this.cdRef.detectChanges();
  }

  handleCancelEdit() {
    this.isEdit = false;
    this.cdRef.detectChanges();
  }
}
