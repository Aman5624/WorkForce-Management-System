import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/material.module';
import { AnnouncementsComponent } from './announcements.component';

@NgModule({
  declarations: [
    AnnouncementsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule
  ],
  exports: [
    AnnouncementsComponent
  ]
})
export class AnnouncementsModule { }
