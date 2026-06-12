import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/auth.guard';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmployeeListComponent } from './employees/employee-list.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { LeaveComponent } from './leaves/leave.component';
import { DepartmentComponent } from './departments/department.component';
import { ProjectsComponent } from './projects/projects.component';
import { AuditLogsComponent } from './audit-logs/audit-logs.component';
import { AnnouncementsComponent } from './announcements/announcements.component';
import { RolesComponent } from './roles/roles.component';

const routes: Routes = [
  // Auth routes (public)
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },

  // Protected routes
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'employees',
    component: EmployeeListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Admin', 'Manager'] }
  },
  {
    path: 'attendance',
    component: AttendanceComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'leaves',
    component: LeaveComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'departments',
    component: DepartmentComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Admin', 'Manager'] }
  },
  {
    path: 'projects',
    component: ProjectsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'audit-logs',
    component: AuditLogsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'announcements',
    component: AnnouncementsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'roles',
    component: RolesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] }
  },

  // Default redirects
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
