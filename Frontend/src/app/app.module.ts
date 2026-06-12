import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { App } from './app.component';
import { MaterialModule } from './shared/material.module';
import { LayoutComponent } from './shared/layout.component';
import { AuthInterceptor } from './shared/auth.interceptor';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EmployeesModule } from './employees/employees.module';
import { AttendanceModule } from './attendance/attendance.module';
import { LeavesModule } from './leaves/leaves.module';
import { DepartmentsModule } from './departments/departments.module';
import { ProjectsModule } from './projects/projects.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { RolesModule } from './roles/roles.module';

@NgModule({
  declarations: [
    App,
    LayoutComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    AuthModule,
    DashboardModule,
    EmployeesModule,
    AttendanceModule,
    LeavesModule,
    DepartmentsModule,
    ProjectsModule,
    AuditLogsModule,
    AnnouncementsModule,
    RolesModule
  ],
  providers: [
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [App]
})
export class AppModule {}
