import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output,} from '@angular/core';
import {Item} from '../../models/item';
import {RES_FONT_SIZE} from '../../models/res-size-data';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {RES_COLOR} from '../../models/res-color-data';

declare var jQuery: any;
declare var $: any;

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
  @Output() duplicateResEmitter = new EventEmitter<string>();
  @Output() hideResEmitter = new EventEmitter<string>();
  @Output() upResEmitter = new EventEmitter<number>();
  @Output() downResEmitter = new EventEmitter<number>();
  @Output() toTopResEmitter = new EventEmitter<number>();
  @Output() toBottomResEmitter = new EventEmitter<number>();
  resSelect = '';
  resSizeList: Item[] = RES_FONT_SIZE;
  resFontSize = '19px';
  resColor = '#f00';
  resColorList: Item[] = RES_COLOR;
  isEdit = false;
  resContent = '';

  constructor(private cdRef: ChangeDetectorRef) {
  }

  sizeChangeHandler() {
    this.cdRef.detectChanges();
  }

  colorChangeHandler() {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.resContent = this.item.content;
    $(document).ready(function () {
      const xOffset = 150;
      const yOffset = 40;
      const imgPop = $('#preview img');
      $('a.res-img-link').hover(function (e) {
        this.t = this.href;
        this.title = '';
        imgPop.attr('src', this.href);
        const c = (this.t != '') ? '<br/>' + this.t : '';
        $('#preview').css('display', 'block');
        $('#preview')
          .css('top', (e.pageY - xOffset) + 'px')
          .css('left', (e.pageX + yOffset) + 'px')
          .fadeIn('slow');
      }, function () {
        this.title = this.t;
        $('#preview').css('display', 'none');
      });
    });

  }

  editShowHandler() {
    this.isEdit = !this.isEdit;
    if (this.isEdit) {
      this.resContent = this.item.content;
    }
    this.cdRef.detectChanges();
  }

  saveResHandler() {
    this.resContent = this.resContent.replace(/(<p>)/ig, '');
    this.resContent = this.resContent.replace(/(<\/p>)/ig, '');
    this.resContent = this.resContent.replace(/(<figure[^<]+>)/ig, '');
    this.resContent = this.resContent.replace(/<\/figure>/ig, '');
    this.resContent = this.resContent.replace(/&nbsp;/ig, '');
    this.item.content = this.resContent;
    this.isEdit = false;
    this.cdRef.detectChanges();
  }

  cancelEditHandler() {
    this.isEdit = false;
    this.cdRef.detectChanges();
  }

  duplicateHandler() {
    this.duplicateResEmitter.emit(this.resIndex);
  }

  hideHandler() {
    this.hideResEmitter.emit(this.item.id);
  }

  upOneHandler() {
    this.upResEmitter.emit(this.resIndex);
  }

  downOneHandler() {
    this.downResEmitter.emit(this.resIndex);
  }

  toTopHandler() {
    this.toTopResEmitter.emit(this.resIndex);
  }

  toBottomHandler() {
    this.toBottomResEmitter.emit(this.resIndex);
  }

  selectClickHandler() {
    if (this.resSelect === 'select') {
      this.resSelect = '';
    } else {
      this.resSelect = 'select';
    }
    this.cdRef.detectChanges();
  }

  candi1ClickHandler() {
    if (this.resSelect === 'candi1') {
      this.resSelect = '';
    } else {
      this.resSelect = 'candi1';
    }
    this.cdRef.detectChanges();
  }

  candi2ClickHandler() {
    if (this.resSelect === 'candi2') {
      this.resSelect = '';
    } else {
      this.resSelect = 'candi2';
    }
    this.cdRef.detectChanges();
  }
}
