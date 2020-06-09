import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output,} from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';


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
  @Output() selectedTreeResEmitter = new EventEmitter();
  @Output() setDraggableEmitter = new EventEmitter();


  @Input() backgroundColors;
  @Input() idStyles;
  @Input() resSizeList;
  isEdit = false;
  resContent = '';
  @Input() characterColors;

  constructor(private cdRef: ChangeDetectorRef, private ref: ElementRef) {

  }

  ngOnInit(): void {
    this.resContent = this.item.content;
    this.item.resColor = '#f00';
    this.item.resFontSize = '19px';

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

  sizeChangeHandler() {
    this.cdRef.detectChanges();
  }

  colorChangeHandler() {
    this.cdRef.detectChanges();
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

    let colorIndex = 0;
    if (this.item.resSelect === 'select') {
      this.item.resSelect = 'none';
    } else {
      this.item.resSelect = 'select';
      colorIndex = 1;
    }
    this.item.resBackgroundColor = this.backgroundColors[colorIndex];
    this.ref.nativeElement.style.backgroundColor = this.backgroundColors[colorIndex];
    this.selectedResEmitter.emit({
        select: this.item.resSelect !== 'none',
        candi1: false,
        candi2: false,
        selected: colorIndex === 0 ? 'none' : 'select'
      });
    this.cdRef.detectChanges();
  }

  candi1ClickHandler() {
    let colorIndex = 0;
    if (this.item.resSelect === 'candi1') {
      this.item.resSelect = 'none';
    } else {
      this.item.resSelect = 'candi1';
      colorIndex = 2;
    }
    this.item.resBackgroundColor = this.backgroundColors[colorIndex];
    this.ref.nativeElement.style.backgroundColor = this.backgroundColors[colorIndex];
    this.selectedResEmitter.emit({
      select: false,
      candi1: this.item.resSelect !== 'none',
      candi2: false,
      selected: colorIndex === 0 ? 'none' : 'candi1'
    });
    this.cdRef.detectChanges();
  }

  candi2ClickHandler() {
    let colorIndex = 0;
    if (this.item.resSelect === 'candi2') {
      this.item.resSelect = 'none';
    } else {
      this.item.resSelect = 'candi2';
      colorIndex = 3;
    }
    this.item.resBackgroundColor = this.backgroundColors[colorIndex];
    this.ref.nativeElement.style.backgroundColor = this.backgroundColors[colorIndex];
    this.selectedResEmitter.emit({
      select: false,
      candi1: false,
      candi2: this.item.resSelect !== 'none',
      selected: colorIndex === 0 ? 'none' : 'candi2'
    });
    this.cdRef.detectChanges();
  }

  catchIdHandler(buttonIndex: number) {
    this.item.idBackgroundColor = this.idStyles[buttonIndex].background;
    this.item.idColor = this.idStyles[buttonIndex].color;
    this.selectedIdEmitter.emit({
      isSelect: true,
      idBackgroundColor: this.idStyles[buttonIndex].background,
      idColor: this.idStyles[buttonIndex].color,
      resBackgroundColor: this.backgroundColors[1]
    });
  }

  cancelSelectedIdHandler() {
    if (this.item.resSelect === 'select') {
      this.cancelSelectedId();
    }
  }

  cancelSelectedId(){
    this.item.resSelect = 'none';
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
      idBackgroundColor: this.idStyles[0].background,
      idColor: this.idStyles[0].color,
      resBackgroundColor: this.backgroundColors[0]
    });
  }

  cancelSelectAndCatchIdHandler() {
    if (this.item.resSelect === 'select') {
      this.cancelSelectedId();
    }
    this.selectedIdEmitter.emit({
      isSelect: false,
      idBackgroundColor: this.idStyles[0].background,
      idColor: this.idStyles[0].color,
    });
  }

  treeSelectHandler(selectKind: number) {
    this.selectedTreeResEmitter.emit({
      select: selectKind,
      resBackgroundColor: this.backgroundColors[selectKind]
    });
  }

  setDraggable(value: boolean) {
    this.setDraggableEmitter.emit(value);
  }
}
