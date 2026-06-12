import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, UserState } from './auth.service';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-layout',
  template: `
    <div class="app-container" *ngIf="currentUser">
      <mat-toolbar class="app-toolbar">
        <button mat-button (click)="sidenav.toggle()">
          Menu
        </button>
        <span class="app-title gradient-text">WMS Enterprise</span>
        
        <span class="spacer"></span>
        
        <button mat-button class="theme-toggle-btn" (click)="toggleTheme()" title="Toggle Theme">
          {{ isDarkMode ? '☀️ Light' : '🌙 Dark' }}
        </button>

        <div class="user-profile">

          <div class="user-details">
            <span class="username">{{ currentUser.username }}</span>
            <span class="user-role badge" [ngClass]="getRoleBadgeClass(currentUser.role)">{{ currentUser.role }}</span>
          </div>
        </div>
        
        <button mat-button class="logout-btn" (click)="logout()" title="Logout">
          Logout
        </button>
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="side" opened class="app-sidenav">
          <mat-nav-list>
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">

              <span matListItemTitle>Dashboard</span>
            </a>
            
            <a mat-list-item routerLink="/employees" routerLinkActive="active-link" *ngIf="isAdminOrManager()">

              <span matListItemTitle>Employees</span>
            </a>
            
            <a mat-list-item routerLink="/attendance" routerLinkActive="active-link">

              <span matListItemTitle>Attendance</span>
            </a>
            
            <a mat-list-item routerLink="/leaves" routerLinkActive="active-link">

              <span matListItemTitle>Leaves</span>
            </a>

            <a mat-list-item routerLink="/departments" routerLinkActive="active-link" *ngIf="isAdminOrManager()">

              <span matListItemTitle>Departments</span>
            </a>

            <a mat-list-item routerLink="/projects" routerLinkActive="active-link">

              <span matListItemTitle>Projects</span>
            </a>

            <a mat-list-item routerLink="/announcements" routerLinkActive="active-link" *ngIf="isAdmin()">

              <span matListItemTitle>Announcements</span>
            </a>

            <a mat-list-item routerLink="/roles" routerLinkActive="active-link" *ngIf="isAdmin()">

              <span matListItemTitle>Roles</span>
            </a>

            <a mat-list-item routerLink="/audit-logs" routerLinkActive="active-link" *ngIf="isAdmin()">

              <span matListItemTitle>Audit Logs</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="main-content">
          <div class="container-wrapper fade-in">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
    
    <div class="login-wrapper" *ngIf="!currentUser">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .app-toolbar {
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-card);
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: space-between;
      backdrop-filter: var(--glass-blur);
      z-index: 10;
    }
    .app-title {
      font-size: 1.4rem;
      font-weight: 700;
      margin-left: 8px;
      letter-spacing: 0.5px;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .user-profile {
      display: flex;
      align-items: center;
      margin-right: 16px;
      padding: 4px 12px;
      background: var(--hover-bg);
      border-radius: 30px;
      border: 1px solid var(--border-card);
    }
    .user-icon {
      font-size: 28px;
      height: 28px;
      width: 28px;
      color: var(--primary-color);
      margin-right: 8px;
    }
    .user-details {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.2;
    }
    .username {
      font-size: 0.85rem;
      font-weight: 600;
    }
    .user-role {
      font-size: 0.65rem !important;
      padding: 0px 6px !important;
      margin-top: 2px;
    }
    .logout-btn {
      color: var(--text-muted);
      transition: color 0.2s ease;
    }
    .logout-btn:hover {
      color: var(--danger);
    }
    .theme-toggle-btn {
      color: var(--text-main);
      margin-right: 16px;
    }
    .sidenav-container {
      flex: 1;
      background: transparent !important;
    }
    .app-sidenav {
      width: 240px;
      background: var(--bg-card) !important;
      border-right: 1px solid var(--border-card) !important;
      backdrop-filter: var(--glass-blur);
    }
    .main-content {
      background: transparent !important;
      overflow-y: auto;
    }
    .container-wrapper {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .mat-nav-list {
      padding-top: 16px !important;
    }
    .mat-nav-list a {
      margin: 4px 12px !important;
      border-radius: 8px !important;
      color: var(--text-main) !important;
      transition: all 0.2s ease !important;
    }
    .mat-nav-list a:hover {
      background: var(--hover-bg) !important;
      color: var(--primary-color) !important;
    }
    .active-link {
      background: var(--active-bg) !important;
      color: var(--primary-color) !important;
      font-weight: 600 !important;
      border: 1px solid var(--active-border) !important;
    }

    .login-wrapper {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `],
  standalone: false
})
export class LayoutComponent {
  currentUser: UserState | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  get isDarkMode(): boolean {
    return this.themeService.getTheme() === 'dark';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isAdminOrManager(): boolean {
    if (!this.currentUser) return false;
    const role = this.currentUser.role.toLowerCase();
    return role === 'admin' || role === 'manager';
  }

  isAdmin(): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.role.toLowerCase() === 'admin';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  getRoleBadgeClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin': return 'badge-active';
      case 'manager': return 'badge-pending';
      default: return 'badge-approved';
    }
  }
}
