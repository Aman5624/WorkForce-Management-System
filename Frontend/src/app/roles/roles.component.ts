import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoleService, Role } from '../shared/role.service';

@Component({
  selector: 'app-roles',
  template: `
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title gradient-text">Role Management</h1>
        <p class="page-subtitle">Manage system access roles</p>
      </div>
      <button mat-raised-button color="primary" class="primary-btn pulse-btn" (click)="toggleForm()">
        {{ showForm ? 'Cancel' : 'New Role' }}
      </button>
    </div>

    <!-- Create/Edit Role Form -->
    <mat-card class="app-card slide-up" *ngIf="showForm" style="margin-bottom: 24px;">
      <mat-card-header>
        <mat-card-title>{{ editingRoleId ? 'Edit Role' : 'Create New Role' }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="roleForm" (ngSubmit)="onSubmit()" class="form-grid">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Role Name</mat-label>
            <input matInput formControlName="roleName" placeholder="Enter role name (e.g., HR, QA)">
            <mat-error *ngIf="roleForm.get('roleName')?.hasError('required')">Role name is required</mat-error>
          </mat-form-field>

          <div class="form-actions">
            <button mat-button type="button" (click)="toggleForm()">Cancel</button>
            <button mat-raised-button color="primary" class="primary-btn" type="submit" [disabled]="roleForm.invalid || submitting">
              <mat-progress-bar mode="indeterminate" *ngIf="submitting" style="margin-right: 8px; width: 40px;"></mat-progress-bar>
              {{ submitting ? (editingRoleId ? 'Updating...' : 'Saving...') : (editingRoleId ? 'Update Role' : 'Save Role') }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>

    <!-- Roles List -->
    <mat-card class="app-card table-card slide-up">
      <div class="table-container">
        <table mat-table [dataSource]="roles" class="app-table">
          
          <ng-container matColumnDef="roleId">
            <th mat-header-cell *matHeaderCellDef>Role ID</th>
            <td mat-cell *matCellDef="let role">{{ role.roleId }}</td>
          </ng-container>

          <ng-container matColumnDef="roleName">
            <th mat-header-cell *matHeaderCellDef>Role Name</th>
            <td mat-cell *matCellDef="let role">
              <div class="primary-text" style="font-weight: 500;">{{ role.roleName }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let role">
              <div class="action-buttons">
                <button mat-button color="primary" *ngIf="canEdit(role)" (click)="editRole(role)">Edit</button>
                <button mat-button color="warn" *ngIf="canDelete(role)" (click)="deleteRole(role.roleId)">Delete</button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
        </table>

        <div class="empty-state fade-in" *ngIf="roles.length === 0 && !loading">
          <h3>No roles found</h3>
          <p>Add roles to grant system access levels to employees.</p>
        </div>

        <div class="loading-spinner" *ngIf="loading">
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        </div>
      </div>
    </mat-card>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .header-content {
      display: flex;
      flex-direction: column;
    }
    .full-width {
      width: 100%;
    }
    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 8px;
    }
    .action-buttons {
      display: flex;
      gap: 4px;
    }
    .action-buttons button {
      min-width: 0;
      padding: 0 8px;
      line-height: 24px;
    }
    .table-container {
      position: relative;
      min-height: 200px;
      overflow-x: auto;
    }
    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-muted);
    }
  `],
  standalone: false
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  displayedColumns: string[] = ['roleId', 'roleName', 'actions'];
  loading = true;
  showForm = false;
  submitting = false;
  editingRoleId: number | null = null;
  roleForm: FormGroup;

  constructor(
    private roleService: RoleService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.roleForm = this.fb.group({
      roleName: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.roleService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load roles', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.cancelEdit();
    }
  }

  cancelEdit(): void {
    this.editingRoleId = null;
    this.roleForm.reset();
  }

  onSubmit(): void {
    if (this.roleForm.invalid) return;

    this.submitting = true;
    const dto = {
      roleId: this.editingRoleId ? this.editingRoleId : undefined,
      roleName: this.roleForm.value.roleName
    };

    if (this.editingRoleId) {
      this.roleService.updateRole(this.editingRoleId, dto).subscribe({
        next: () => {
          this.submitting = false;
          this.toggleForm();
          this.loadRoles();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to update role', err);
          this.submitting = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.roleService.createRole(dto).subscribe({
        next: () => {
          this.submitting = false;
          this.toggleForm();
          this.loadRoles();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to create role', err);
          this.submitting = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  editRole(role: Role): void {
    this.editingRoleId = role.roleId;
    this.showForm = true;
    this.roleForm.patchValue({
      roleName: role.roleName
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  canEdit(role: Role): boolean {
    return this.canDelete(role);
  }

  canDelete(role: Role): boolean {
    const name = role.roleName.toLowerCase();
    return !['admin', 'manager', 'employee'].includes(name);
  }

  deleteRole(id: number): void {
    if (confirm('Are you sure you want to delete this role?')) {
      this.loading = true;
      this.roleService.deleteRole(id).subscribe({
        next: () => {
          this.loadRoles();
        },
        error: (err) => {
          console.error('Failed to delete role', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
