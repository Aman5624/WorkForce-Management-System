import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../shared/material.module';
import { EmployeeListComponent } from './employee-list.component';
import { EmployeeFormComponent } from './employee-form.component';

@NgModule({
  declarations: [
    EmployeeListComponent,
    EmployeeFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MaterialModule
  ],
  exports: [
    EmployeeListComponent,
    EmployeeFormComponent
  ]
})
export class EmployeesModule {}
