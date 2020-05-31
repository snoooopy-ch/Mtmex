import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LeftPanelComponent } from './left-panel/left-panel.component';
import { RightPanelComponent } from './right-panel/right-panel.component';
import { HeaderComponent } from './left-panel/header/header.component';
import { ContentComponent } from './left-panel/content/content.component';
import { StatusComponent } from './left-panel/status/status.component';
import { ResComponent } from './left-panel/res/res.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

@NgModule({
  declarations: [
    AppComponent,

    LeftPanelComponent,
    RightPanelComponent,
    HeaderComponent,
    ContentComponent,
    StatusComponent,
    ResComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    DragDropModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatIconModule,
    CKEditorModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
