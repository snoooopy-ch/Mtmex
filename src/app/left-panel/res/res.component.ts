import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Pipe,
  PipeTransform,
} from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {DomSanitizer} from '@angular/platform-browser';


declare var jQuery: any;
declare var $: any;

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
  @Output() selectedNumEmitter = new EventEmitter();

  @Input() backgroundColors;
  @Input() idStyles;
  @Input() idRed;
  @Input() noticeCount;
  @Input() resSizeList;
  @Input() btnBackgroundColors;
  resContent = '';
  @Input() characterColors;

  constructor(private cdRef: ChangeDetectorRef, private ref: ElementRef) {

  }

  ngOnInit(): void {
    this.resContent = this.item.content;
    this.item.resColor = '#f00';
    this.item.resFontSize = '19px';

    $(document).ready(function() {
      const xOffset = 150;
      const yOffset = 40;
      const imgPop = $('#preview img');
      $('a.res-img-link').hover(function(e) {
        this.t = this.href;
        this.title = '';
        imgPop.attr('src', this.href);
        const c = (this.t != '') ? '<br/>' + this.t : '';
        $('#preview').css('display', 'block');
        $('#preview')
          .css('top', (e.pageY - xOffset) + 'px')
          .css('left', (e.pageX + yOffset) + 'px')
          .fadeIn('slow');
      }, function() {
        this.title = this.t;
        $('#preview').css('display', 'none');
      });

      $("img.res-img-thumb").one("load", function() {
        [].slice.apply(document.images).filter(is_gif_image).map(freeze_gif);
      });

      function is_gif_image(i) {
          return /^(?!data:).*\.gif/i.test(i.src);
      }

      function freeze_gif(i) {
          var c = document.createElement('canvas');
          var w = c.width = i.width;
          var h = c.height = i.height;
          c.getContext('2d').drawImage(i, 0, 0, w, h);
          try {
              i.src = c.toDataURL("image/gif");         // if possible, retain all css aspects
          } catch(e) {                                  // cross-domain -- mimic original with all its tag attributes
              for (var j = 0, a; a = i.attributes[j]; j++)
                  c.setAttribute(a.name, a.value);
              i.parentNode.replaceChild(c, i);
          }
      }
    });
  }

  sizeChangeHandler() {
    this.cdRef.detectChanges();
  }

  colorChangeHandler() {
    this.item.resSelect = 'select';
    let colorIndex = 1;

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

  editShowHandler() {
    this.item.isEdit = !this.item.isEdit;
    if (this.item.isEdit) {
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
    this.item.isEdit = false;
    this.cdRef.detectChanges();
  }

  cancelEditHandler() {
    this.item.isEdit = false;
    this.cdRef.detectChanges();
  }

  clickResMenuKaihei() {
    this.item.isMenuOpen = !this.item.isMenuOpen;
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
    this.item.idClassNoSelect = this.idStyles[buttonIndex].classNoSelect;
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

  selectedNumHandler() {
    this.selectedNumEmitter.emit();
  }
}
