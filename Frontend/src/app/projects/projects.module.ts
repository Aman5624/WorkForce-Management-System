import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../shared/material.module';
import { ProjectsComponent } from './projects.component';

@NgModule({
  declarations: [ProjectsComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, MaterialModule],
  exports: [ProjectsComponent]
})
export class ProjectsModule {}
