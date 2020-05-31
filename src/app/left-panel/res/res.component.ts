import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, } from '@angular/core';
import {Item} from '../../models/item';
import {RES_FONT_SIZE} from '../../models/res-size-data';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {RES_COLOR} from "../../models/res-color-data";
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
  @Output() duplicateIndex = new EventEmitter<string>();
  resSelect = 'select';
  resSizeList: Item[] = RES_FONT_SIZE;
  resFontSize = '19px';
  resColor = '#f00';
  resColorList: Item[] = RES_COLOR;
  isEdit = false;
  resContent = '';

  constructor(private cdRef: ChangeDetectorRef) {
    this.resSizeList = RES_FONT_SIZE;
  }

  sizeChangeHandler() {
    this.cdRef.detectChanges();
  }

  colorChangeHandler() {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.resContent = this.item.content;
    $(document).ready(function(){
      const xOffset = 150;
      const yOffset = 40;
      const imgPop = $('#preview img');
      $('a.res-img-link').hover(function(e){
        this.t = this.href;
        this.title = '';
        imgPop.attr('src', this.href);
        const c = (this.t != '') ? '<br/>' + this.t : '';
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
  editShowHandler() {
    this.isEdit = !this.isEdit;
    if (this.isEdit){
      this.resContent = this.item.content;
    }
    this.cdRef.detectChanges();
  }

  saveResHandler() {
    this.resContent = this.resContent.replace( /(<p>)/ig, '');
    this.resContent = this.resContent.replace( /(<\/p>)/ig, '');
    this.resContent = this.resContent.replace( /(<figure[^<]+>)/ig, '');
    this.resContent = this.resContent.replace( /<\/figure>/ig, '');
    this.resContent = this.resContent.replace( /&nbsp;/ig, '');
    this.item.content = this.resContent;
    this.isEdit = false;
    this.cdRef.detectChanges();
  }

  cancelEditHandler() {
    this.isEdit = false;
    this.cdRef.detectChanges();
  }

  duplicateHandler() {
    this.duplicateIndex.emit(this.resIndex);
  }
}
