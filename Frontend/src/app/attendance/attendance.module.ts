import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../shared/material.module';
import { AttendanceComponent } from './attendance.component';

@NgModule({
  declarations: [
    AttendanceComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MaterialModule
  ],
  exports: [
    AttendanceComponent
  ]
})
export class AttendanceModule {}
