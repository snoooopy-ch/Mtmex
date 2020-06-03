import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output,} from '@angular/core';
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
  @Output() duplicateResEmitter = new EventEmitter();
  @Output() hideResEmitter = new EventEmitter();
  @Output() upResEmitter = new EventEmitter();
  @Output() downResEmitter = new EventEmitter();
  @Output() toTopResEmitter = new EventEmitter();
  @Output() toBottomResEmitter = new EventEmitter();
  @Output() selectedResEmitter = new EventEmitter();
  @Output() selectedIdEmitter = new EventEmitter();
  private backgroundColors = ['#fff', '#ffecd9', '#e0ffff', '#ffb6c1'];
  private idBackgroundColors = ['#fff', '#dddddd', '#1e64bd', '#ff00ff'];
  resSizeList: Item[] = RES_FONT_SIZE;
  resColorList: Item[] = RES_COLOR;
  isEdit = false;
  resContent = '';

  constructor(private cdRef: ChangeDetectorRef, private ref: ElementRef) {

  }

  sizeChangeHandler() {
    this.cdRef.detectChanges();
  }

  colorChangeHandler() {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.resContent = this.item.content;
    this.item.resColor = '#f00';
    this.item.resFontSize = '19px';
    this.item.resSelect = '0';
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
    this.duplicateResEmitter.emit();
  }

  hideHandler() {
    this.hideResEmitter.emit();
  }

  upOneHandler() {
    this.upResEmitter.emit();
  }

  downOneHandler() {
    this.downResEmitter.emit();
  }

  toTopHandler() {
    this.toTopResEmitter.emit();
  }

  toBottomHandler() {
    this.toBottomResEmitter.emit();
  }

  selectClickHandler() {
    if (this.item.resSelect === '1') {
      this.item.resSelect = '0';
    } else {
      this.item.resSelect = '1';
    }
    this.item.resBackgroundColor = this.backgroundColors[this.item.resSelect];
    this.ref.nativeElement.style.backgroundColor = this.backgroundColors[this.item.resSelect];
    this.selectedResEmitter.emit({
        select: this.item.resSelect !== '0',
        candi1: false,
        candi2: false
      });
    this.cdRef.detectChanges();
  }

  candi1ClickHandler() {
    if (this.item.resSelect === '2') {
      this.item.resSelect = '0';
    } else {
      this.item.resSelect = '2';
    }
    this.item.resBackgroundColor = this.backgroundColors[this.item.resSelect];
    this.ref.nativeElement.style.backgroundColor = this.backgroundColors[this.item.resSelect];
    this.selectedResEmitter.emit({
      select: false,
      candi1: this.item.resSelect !== '0',
      candi2: false
    });
    this.cdRef.detectChanges();
  }

  candi2ClickHandler() {
    if (this.item.resSelect === '3') {
      this.item.resSelect = '0';
    } else {
      this.item.resSelect = '3';
    }
    this.item.resBackgroundColor = this.backgroundColors[this.item.resSelect];
    this.ref.nativeElement.style.backgroundColor = this.backgroundColors[this.item.resSelect];
    this.selectedResEmitter.emit({
      select: false,
      candi1: false,
      candi2: this.item.resSelect !== '0',
    });
    this.cdRef.detectChanges();
  }

  catchIdHandler(buttonIndex: number) {
    this.item.idBackgroundColor = this.idBackgroundColors[buttonIndex];
    this.selectedIdEmitter.emit({
      isSelect: true,
      idBackgroundColor: this.idBackgroundColors[buttonIndex],
      resBackgroundColor: this.backgroundColors[1]
    });
  }

  cancelSelectedIdHandler() {
    if (this.item.resSelect === '1') {
      this.cancelSelectedId();
    }
  }

  cancelSelectedId(){
    this.item.resSelect = '0';
    this.item.resBackgroundColor = this.backgroundColors[0];
    this.ref.nativeElement.style.backgroundColor = this.backgroundColors[0];
    this.selectedResEmitter.emit({
      select: false,
      candi1: false,
      candi2: false
    });
  }

  cancelOnlyCatchIdHandler() {
    this.selectedIdEmitter.emit({
      isSelect: false,
      idBackgroundColor: this.idBackgroundColors[0],
      resBackgroundColor: this.backgroundColors[0]
    });
  }

  cancelSelectAndCatchIdHandler() {
    if (this.item.resSelect === '1') {
      this.cancelSelectedId();
    }
    this.selectedIdEmitter.emit({
      isSelect: false,
      idBackgroundColor: this.idBackgroundColors[0],
    });
  }

  treeSelectHandler(selectKind: number) {

  }
}
