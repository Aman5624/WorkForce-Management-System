import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../shared/material.module';
import { LeaveComponent } from './leave.component';

@NgModule({
  declarations: [
    LeaveComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MaterialModule
  ],
  exports: [
    LeaveComponent
  ]
})
export class LeavesModule {}
