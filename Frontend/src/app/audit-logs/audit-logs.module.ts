import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/material.module';
import { AuditLogsComponent } from './audit-logs.component';

@NgModule({
  declarations: [
    AuditLogsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule
  ],
  exports: [
    AuditLogsComponent
  ]
})
export class AuditLogsModule { }
