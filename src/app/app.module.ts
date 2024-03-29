import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LeftPanelComponent } from './left-panel/left-panel.component';
import { RightPanelComponent } from './right-panel/right-panel.component';
import {ContentComponent, } from './left-panel/content/content.component';
import { StatusComponent } from './left-panel/status/status.component';
import { ResComponent, SafeHtmlPipe} from './left-panel/res/res.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatIconModule} from '@angular/material/icon';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {HotkeyModule} from 'angular2-hotkeys';
import { ClipboardModule } from '@angular/cdk/clipboard';
import {TabsModule} from 'ngx-bootstrap/tabs';
import {DndModule} from 'ngx-drag-drop';
import {ButtonsModule} from 'ngx-bootstrap/buttons';
import {TypeaheadModule} from 'ngx-bootstrap/typeahead';



@NgModule({
  declarations: [
    AppComponent,

    LeftPanelComponent,
    RightPanelComponent,
    ContentComponent,
    StatusComponent,
    ResComponent,
    SafeHtmlPipe
  ],
  imports: [
    BrowserModule,
    ClipboardModule,
    FormsModule,
    DragDropModule,
    BrowserAnimationsModule,

    // MatTabsModule,
    MatIconModule,
    CKEditorModule,
    ReactiveFormsModule,
    VirtualScrollerModule,
    MatButtonToggleModule,
    HotkeyModule.forRoot(),
    TabsModule.forRoot(),
    DndModule,
    ButtonsModule,
    TypeaheadModule.forRoot(),

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
