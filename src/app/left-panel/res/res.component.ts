import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Pipe,
  PipeTransform, ViewChild,
} from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// import Image from '@ckeditor/ckeditor5-image/src/image';
// import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
// import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
// import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
// import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';
import {DomSanitizer} from '@angular/platform-browser';
import {ResItem} from '../../models/res-item';

declare var jQuery: any;
declare var $: any;
declare var Freezeframe: any;

@Pipe({ name: 'safeHtml'})
export class SafeHtmlPipe implements PipeTransform  {
  constructor(private sanitized: DomSanitizer) {}
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}

@Component({
  selector: 'app-res',
  templateUrl: './res.component.html',
  styleUrls: ['./res.component.css']
})
export class ResComponent implements OnInit {
  public Editor = ClassicEditor;
  @Input() item: ResItem;
  @Input() resIndex;
  @Input() tabIndex;
  @Output() duplicateResEmitter = new EventEmitter();
  @Output() hideResEmitter = new EventEmitter();
  @Output() upResEmitter = new EventEmitter();
  @Output() downResEmitter = new EventEmitter();
  @Output() toTopResEmitter = new EventEmitter();
  @Output() toBottomResEmitter = new EventEmitter();
  @Output() selectedResEmitter = new EventEmitter();
  @Output() cancelSelectedIdEmitter = new EventEmitter();
  @Output() selectedIdEmitter = new EventEmitter();
  @Output() selectedTreeResEmitter = new EventEmitter();
  @Output() setDraggableEmitter = new EventEmitter();
  @Output() selectedNumEmitter = new EventEmitter();
  @Output() deleteResEmitter = new EventEmitter();
  @Output() cancelAllStatusEmitter = new EventEmitter();

  @Input() backgroundColors;
  @Input() idStyles;
  @Input() idRed;
  @Input() noticeCount;
  @Input() resSizeList;
  @Input() btnBackgroundColors;
  @Input() leftHightlight;
  @Input() resMouseClick;
  @Input() txtRemarkRes;
  @Input() imageWidth;
  @Input() cancelAllColor;
  resContent = '';
  @Input() characterColors;

  constructor(private cdRef: ChangeDetectorRef, private ref: ElementRef) {

  }

  ngOnInit(): void {
    this.resContent = this.item.content;
    if (this.item.resFontSize === undefined){
      this.item.resFontSize = `${this.resSizeList[0].value}px`;
    }
    if (this.item.resColor === undefined){
      this.item.resColor = '#000';
    }

    $(document).ready(function() {

      const xOffset = 150;
      const yOffset = 40;
      const imgPop = $('#preview img');
      $('a.res-img-link').hover(function(e) {
        this.t = this.href;
        this.title = '';
        imgPop.attr('src', this.href);
        const c = (this.t !== '') ? '<br/>' + this.t : '';
        $('#preview').css('display', 'block');
        $('#preview')
          .css('top', (e.pageY - xOffset) + 'px')
          .css('left', (e.pageX + yOffset) + 'px')
          .fadeIn('slow');
      }, function() {
        this.title = this.t;
        $('#preview').css('display', 'none');
      });

      $('a.res-link').click(function(event) {
        event.stopPropagation();
      });

      $('a.res-img-link').click((event) => {
        event.stopPropagation();
      });

      $('.res-container label').click(function(event){
        event.stopPropagation();
      });

      $('.res-container .row-4').on('mousedown touchstart', function(event) {
        event.stopPropagation();
      });

      $('.res-container .row-4').on('mousemove touchmove', function(event) {
        event.stopPropagation();
      });
      $(window.document).on('mouseup touchend', function(event) {
        // Capture this event anywhere in the document, since the mouse may leave our element while mouse is down and then the 'up' event will not fire within the element.
      });
    });
  }

  clickResContainer(event) {
    if (this.resMouseClick) {
     this.selectClickHandler(event);
    }
  }

  sizeChangeHandler($event) {
    $event.stopPropagation();
    $event.target.blur();
    this.selectClickHandler($event);
    this.cdRef.detectChanges();
  }

  colorChangeHandler($event) {
    this.item.resSelect = 'select';

    this.item.resBackgroundColor = this.backgroundColors[1];
    this.ref.nativeElement.style.backgroundColor = this.backgroundColors[1];
    this.selectedResEmitter.emit({
        selected: 'select'
      });
    $event.target.blur();
    this.cdRef.detectChanges();
  }

  editShowHandler(event) {
    event.stopPropagation();
    this.item.isEdit = !this.item.isEdit;
    if (this.item.isEdit) {
      this.resContent = this.item.content;
    }
    this.cdRef.detectChanges();
  }

  saveResHandler(event) {
    event.stopPropagation();
    this.resContent = this.resContent.replace(/<\/p><p>/gi, '<br>');
    this.resContent = this.resContent.replace(/&nbsp;<\/p>/gi, '<br>');
    this.resContent = this.resContent.replace(/(<img[^<]+>)|(<a[^<]+>)|(<\/a>)/ig, '');
    this.resContent = this.resContent.replace(/(<p>)|(<\/p>)|(<h3>)|(<\/h3>)/ig, '');
    this.resContent = this.resContent.replace(/(<figure[^<]+>)|(<\/figure>)/ig, '');
    this.resContent = this.resContent.replace(/&nbsp;/ig, '');
    let index = 0;
    const tmpItems = this.resContent.split(/<br>\s|<br>/ig);
    const expUrl = /((https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    const expGifUrl = /((https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|].gif)/ig;
    const expImgUrl = /((https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|].(jpg|jpeg|png|bmp))/ig;
    this.resContent = '';
    for (let tmpItem of tmpItems) {
      if (index > 0) {
        this.resContent += '<br>';
      }
      if (new RegExp(expUrl).test(tmpItem)) {
        if (new RegExp(expGifUrl).test(tmpItem)) {
          // if(settings.gif_stop){
          //   tmp_item = tmp_item.replace(expGifUrl,
          //   `<img src="$1" class="res-img-thumb gif-pause" alt="" width="${settings.pict_hyouji}px">
          //   <a href="$1" class="res-img-link res-gif-link" class="res-img-link res-gif-link">$1</a>`);
          // } else{
          tmpItem = tmpItem.replace(expGifUrl, `<img src="$1" class="res-img-thumb" alt="" width="${this.imageWidth}"><a href="$1" class="res-img-link res-gif-link">$1</a>`);
          // }
          this.item.hasImage = true;
        } else if (new RegExp(expImgUrl).test(tmpItem)) {
          tmpItem = tmpItem.replace(expImgUrl, `<img src="$1" class="res-img-thumb" alt="" width="${this.imageWidth}"><a href="$1" class="res-img-link">$1</a>`);
          this.item.hasImage = true;
        } else {
          tmpItem = tmpItem.replace(expUrl, `<a class="res-link" href="$1">$1</a>`);
        }
      }
      this.resContent += tmpItem;
      index++;
    }

    let remarkRes = this.txtRemarkRes;
    if (remarkRes.endsWith(';')){
      remarkRes = remarkRes.substr(0, remarkRes.length - 1);
    }
    remarkRes = remarkRes.replace(/;/gi, '|');
    this.item.content = this.resContent;
    if (remarkRes !== undefined && remarkRes.length > 0){
      const re = new RegExp(remarkRes, 'gi');
      if (re.test(this.item.content)) {
        this.item.isRemark = true;
      }
    }
    this.item.isEdit = false;
    this.cdRef.detectChanges();
  }

  cancelEditHandler(event) {
    event.stopPropagation();
    this.item.isEdit = false;
    this.cdRef.detectChanges();
  }

  clickResMenuKaihei(event) {
    event.stopPropagation();
    if (this.item.resMenu === 3) { return; }

    this.item.isMenuOpen = !this.item.isMenuOpen;
    this.cdRef.detectChanges();
  }

  duplicateHandler(event) {
    event.stopPropagation();
    this.duplicateResEmitter.emit();
  }

  hideHandler(event) {
    event.stopPropagation();
    this.hideResEmitter.emit();
  }

  upOneHandler(event) {
    event.stopPropagation();
    this.upResEmitter.emit();
  }

  downOneHandler(event) {
    event.stopPropagation();
    this.downResEmitter.emit();
  }

  toTopHandler(event) {
    event.stopPropagation();
    this.toTopResEmitter.emit();
  }

  toBottomHandler(event) {
    event.stopPropagation();
    this.toBottomResEmitter.emit();
  }

  setResStyle(colorIndex){
    this.item.resBackgroundColor = this.backgroundColors[colorIndex];
    this.ref.nativeElement.style.backgroundColor = this.backgroundColors[colorIndex];
    this.selectedResEmitter.emit({
      selected: this.item.resSelect
    });
  }

  selectClickHandler(event) {
    event.stopPropagation();
    let colorIndex = 0;
    if (this.item.resSelect !== 'none') {
      this.item.resSelect = 'none';
    } else {
      this.item.resSelect = 'select';
      colorIndex = 1;
    }
    this.setResStyle(colorIndex);
    event.target.blur();
    this.cdRef.detectChanges();
  }

  candi1ClickHandler(event) {
    event.stopPropagation();
    let colorIndex = 0;
    if (this.item.resSelect === 'candi1') {
      this.item.resSelect = 'select';
      colorIndex = 1;
    } else {
      this.item.resSelect = 'candi1';
      colorIndex = 2;
    }
    this.setResStyle(colorIndex);
    event.target.blur();
    this.cdRef.detectChanges();
  }

  candi2ClickHandler(event) {
    event.stopPropagation();
    let colorIndex = 0;
    if (this.item.resSelect === 'candi2') {
      this.item.resSelect = 'select';
      colorIndex = 1;
    } else {
      this.item.resSelect = 'candi2';
      colorIndex = 3;
    }
    this.setResStyle(colorIndex);
    event.target.blur();
    this.cdRef.detectChanges();
  }

  candi3ClickHandler(event) {
    event.stopPropagation();
    let colorIndex = 0;
    if (this.item.resSelect === 'candi3') {
      this.item.resSelect = 'select';
      colorIndex = 1;
    } else {
      this.item.resSelect = 'candi3';
      colorIndex = 4;
    }
    this.setResStyle(colorIndex);
    event.target.blur();
    this.cdRef.detectChanges();
  }

  candi4ClickHandler(event) {
    event.stopPropagation();
    let colorIndex = 0;
    if (this.item.resSelect === 'candi4') {
      this.item.resSelect = 'select';
      colorIndex = 1;
    } else {
      this.item.resSelect = 'candi4';
      colorIndex = 5;
    }
    this.setResStyle(colorIndex);
    event.target.blur();
    this.cdRef.detectChanges();
  }

  catchIdHandler(event, buttonIndex: number) {
    event.stopPropagation();
    this.item.idBackgroundColor = this.idStyles[buttonIndex].background;
    this.item.idColor = this.idStyles[buttonIndex].color;
    this.item.idClassNoSelect = this.idStyles[buttonIndex].classNoSelect;
    this.selectedIdEmitter.emit({
      isSelect: true,
      idBackgroundColor: this.idStyles[buttonIndex].background,
      idColor: this.idStyles[buttonIndex].color,
      resBackgroundColor: this.backgroundColors[1],
      idClassNoSelect: this.idStyles[buttonIndex].classNoSelect
    });
  }

  cancelSelectedIdHandler(event) {
    event.stopPropagation();
    if (this.item.resSelect === 'select') {
      this.cancelSelectedId();
    }
  }

  cancelSelectedId(){
    this.item.resSelect = 'none';
    this.item.resBackgroundColor = this.backgroundColors[0];
    this.ref.nativeElement.style.backgroundColor = this.backgroundColors[0];
    this.cancelSelectedIdEmitter.emit({
      isSelect: false,
      selected: 'none'
    });
  }

  cancelOnlyCatchIdHandler(event) {
    event.stopPropagation();
    this.selectedIdEmitter.emit({
      isSelect: false,
      idBackgroundColor: this.idStyles[0].background,
      idColor: this.idStyles[0].color,
      resBackgroundColor: this.backgroundColors[0]
    });
  }

  cancelSelectAndCatchIdHandler(event) {
    event.stopPropagation();
    if (this.item.resSelect === 'select') {
      this.cancelSelectedId();
    }
    this.selectedIdEmitter.emit({
      isSelect: false,
      idBackgroundColor: this.idStyles[0].background,
      idColor: this.idStyles[0].color,
    });
  }

  treeSelectHandler(event, selectKind: number) {
    event.stopPropagation();
    this.selectedTreeResEmitter.emit({
      select: selectKind,
      resBackgroundColor: this.backgroundColors[selectKind]
    });
  }

  setDraggable(value: boolean) {
    this.setDraggableEmitter.emit(value);
  }

  selectedNumHandler() {
    this.selectedNumEmitter.emit();
  }

  clickCKEditor(event) {
    event.stopPropagation();
  }

  btnDeleteHandler(event) {
    event.stopPropagation();
    this.deleteResEmitter.emit();
  }

  btnChangeIdColorHandler(event, buttonIndex: number) {
    event.stopPropagation();
    this.item.idBackgroundColor = this.idStyles[buttonIndex].background;
    this.item.idColor = this.idStyles[buttonIndex].color;
    this.item.idClassNoSelect = this.idStyles[buttonIndex].classNoSelect;
    this.selectedIdEmitter.emit({
      isSelect: false,
      idBackgroundColor: this.idStyles[buttonIndex].background,
      idColor: this.idStyles[buttonIndex].color,
      idClassNoSelect: this.idStyles[buttonIndex].classNoSelect
    });
  }

  btnCancelAllStatus(event) {
    event.stopPropagation();
    this.cancelAllStatusEmitter.emit();
  }

  lblResFontHandler($event: MouseEvent) {
    $event.stopPropagation();
  }
}
