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

  @Input() backgroundColors;
  @Input() idStyles;
  @Input() idRed;
  @Input() noticeCount;
  @Input() resSizeList;
  @Input() btnBackgroundColors;
  @Input() leftHightlight;
  @Input() resMouseClick;
  @Input() txtRemarkRes;
  resContent = '';
  @Input() characterColors;
  @ViewChild('optResSelect') optResSelect: ElementRef;
  @ViewChild('optResCandi1') optResCandi1: ElementRef;
  @ViewChild('optResCandi2') optResCandi2: ElementRef;

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

      // const imgGif = new Freezeframe('.gif-pause', {
      //   trigger: false,
      //   responsive: false,
      // });

      // $("img.res-img-thumb").one("load", function() {
      //   [].slice.apply(document.images).filter(is_gif_image).map(freeze_gif);
      // });

      function is_gif_image(i) {
          return /^(?!data:).*\.gif/i.test(i.src);
      }

      function freeze_gif(i) {
          const c = document.createElement('canvas');
          const w = c.width = i.width;
          const h = c.height = i.height;
          c.getContext('2d').drawImage(i, 0, 0, w, h);
          try {
              i.src = c.toDataURL('image/gif');         // if possible, retain all css aspects
          } catch (e) {                                  // cross-domain -- mimic original with all its tag attributes
              for (let j = 0, a; a = i.attributes[j]; j++) {
                  c.setAttribute(a.name, a.value);
              }
              i.parentNode.replaceChild(c, i);
          }
      }
    });
  }

  clickResContainer(event) {
    console.log('clickResContainer');
    if (this.resMouseClick) {
	    this.selectClickHandler(event);
    }
    return false;
  }

  sizeChangeHandler($event) {
    $event.target.blur();
    this.cdRef.detectChanges();
  }

  colorChangeHandler($event) {
    console.log('colorChangeHandler');
    this.item.resSelect = 'select';

    this.item.resBackgroundColor = this.backgroundColors[1];
    this.ref.nativeElement.style.backgroundColor = this.backgroundColors[1];
    this.selectedResEmitter.emit({
        select: this.item.resSelect !== 'none',
        candi1: false,
        candi2: false,
        selected: 'select'
      });
    //$event.target.blur();
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
    this.resContent = this.resContent.replace(/<p>&nbsp;<\/p>/gi, '<br>');
    this.resContent = this.resContent.replace(/(<p>)|(<h3>)/ig, '');
    this.resContent = this.resContent.replace(/(<\/p>)|(<\/h3>)/ig, '');
    this.resContent = this.resContent.replace(/(<figure[^<]+>)/ig, '');
    this.resContent = this.resContent.replace(/<\/figure>/ig, '');
    this.resContent = this.resContent.replace(/&nbsp;/ig, '');
    let remarkRes = this.txtRemarkRes;
    if (remarkRes.endsWith(';')){
      remarkRes = remarkRes.substr(0, remarkRes.length - 1);
    }
    remarkRes = remarkRes.replace(/;/gi, '|');
    this.item.content = this.resContent;
    if (remarkRes !== undefined && remarkRes.length > 0){
      const re = new RegExp(remarkRes, 'gi');
      if (this.item.content.match(re)) {
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

  selectClickHandler(event) {
    event.stopPropagation();
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
    this.optResSelect.nativeElement.blur();
    this.cdRef.detectChanges();
  }

  candi1ClickHandler(event) {
    event.stopPropagation();
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
    this.optResCandi1.nativeElement.blur();
    this.cdRef.detectChanges();
  }

  candi2ClickHandler(event) {
    event.stopPropagation();
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
    this.optResCandi2.nativeElement.blur();
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
      select: false,
      candi1: false,
      candi2: false
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
}
