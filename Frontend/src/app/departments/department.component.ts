import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DepartmentService, Department } from '../shared/department.service';

@Component({
  selector: 'app-department',
  template: `
    <div class="department-container fade-in">
      <div class="header-section">
        <h1 class="gradient-text">Department Management</h1>
        <p>View existing departments and establish new operational divisions</p>
      </div>

      <div class="department-grid">
        <!-- Add Department Form -->
        <!-- Add/Edit Department Form -->
        <div class="glass-card form-card">
          <h3>{{ editingDepartmentId ? 'Edit Department' : 'Create Department' }}</h3>
          <form [formGroup]="deptForm" (ngSubmit)="onSubmit()" class="dept-form">
            <mat-form-field appearance="fill">
              <mat-label>Department Name</mat-label>
              <input matInput formControlName="departmentName" placeholder="e.g. Engineering, HR, Finance">
              <mat-error *ngIf="deptForm.get('departmentName')?.hasError('required')">Name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="fill">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="4" placeholder="Briefly describe the department role..."></textarea>
            </mat-form-field>

            <button mat-raised-button class="btn-primary w-full" type="submit" [disabled]="deptForm.invalid || loading">
              {{ editingDepartmentId ? 'Update Department' : 'Save Department' }}
            </button>
            <button mat-button class="w-full" type="button" *ngIf="editingDepartmentId" (click)="cancelEdit()">
              Cancel Edit
            </button>
          </form>
        </div>

        <!-- Department Listing -->
        <div class="glass-card list-card flex-1">
          <h3>Active Departments</h3>
          
          <div class="loading-state" *ngIf="loadingList">
            <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          </div>

          <div class="departments-list" *ngIf="!loadingList">
            <div class="dept-item-card" *ngFor="let dept of departments">
              <div class="dept-info">
                <h4>{{ dept.departmentName }}</h4>
                <p>{{ dept.description || 'No description provided.' }}</p>
              </div>
              <div class="dept-meta">
                <div class="action-buttons">
                  <button mat-button color="primary" (click)="editDepartment(dept)">Edit</button>
                  <button mat-button color="warn" (click)="deleteDepartment(dept.departmentId!)">Delete</button>
                </div>
                <div class="status-date-group">
                  <span class="badge badge-active">Active</span>
                  <span class="created-date" *ngIf="dept.createdOn">Created: {{ dept.createdOn | date:'shortDate' }}</span>
                </div>
              </div>
            </div>

            <div class="empty-state" *ngIf="departments.length === 0">

              <p>No departments found. Create one on the left!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .department-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .header-section h1 {
      font-size: 2.2rem;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .header-section p {
      color: var(--text-muted);
    }
    .department-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 24px;
      align-items: start;
    }
    @media (max-width: 992px) {
      .department-grid {
        grid-template-columns: 1fr;
      }
    }
    .form-card h3, .list-card h3 {
      font-weight: 600;
      margin-bottom: 20px;
      color: var(--text-main);
    }
    .dept-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .w-full {
      width: 100%;
    }
    .departments-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-height: 500px;
      overflow-y: auto;
      padding-right: 8px;
    }
    .dept-item-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-card);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      transition: all 0.2s ease;
    }
    .dept-item-card:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: var(--border-hover);
    }
    .dept-info h4 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 4px;
      color: var(--text-main);
    }
    .dept-info p {
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .dept-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
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
    .status-date-group {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
    .created-date {
      font-size: 0.75rem;
      color: var(--text-dim);
    }
    .loading-state, .empty-state {
      text-align: center;
      padding: 40px 0;
      color: var(--text-muted);
    }

  `],
  standalone: false
})
export class DepartmentComponent implements OnInit {
  deptForm!: FormGroup;
  loading = false;
  loadingList = true;
  departments: Department[] = [];
  editingDepartmentId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadDepartments();
  }

  private initForm(): void {
    this.deptForm = this.fb.group({
      departmentName: ['', Validators.required],
      description: ['']
    });
  }

  loadDepartments(): void {
    this.loadingList = true;
    this.departmentService.getDepartments().subscribe({
      next: data => {
        this.departments = data;
        this.loadingList = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingList = false;
        this.cdr.detectChanges();
        this.snackBar.open('Failed to load departments', 'Close', { duration: 4000 });
      }
    });
  }

  onSubmit(): void {
    if (this.deptForm.invalid) return;
    this.loading = true;

    const newDept: Department = {
      departmentName: this.deptForm.value.departmentName,
      description: this.deptForm.value.description
    };

    if (this.editingDepartmentId) {
      newDept.departmentId = this.editingDepartmentId;
      this.departmentService.updateDepartment(this.editingDepartmentId, newDept).subscribe({
        next: () => {
          this.snackBar.open('Department updated successfully!', 'Close', { duration: 3000 });
          this.cancelEdit();
          this.loadDepartments();
          this.cdr.detectChanges();
        },
        error: err => {
          this.loading = false;
          this.cdr.detectChanges();
          this.snackBar.open(err.error || 'Failed to update department', 'Close', { duration: 4000 });
        }
      });
    } else {
      this.departmentService.createDepartment(newDept).subscribe({
        next: () => {
          this.snackBar.open('Department created successfully!', 'Close', { duration: 3000 });
          this.deptForm.reset();
          this.loading = false;
          this.loadDepartments();
          this.cdr.detectChanges();
        },
        error: err => {
          this.loading = false;
          this.cdr.detectChanges();
          this.snackBar.open(err.error || 'Failed to create department', 'Close', { duration: 4000 });
        }
      });
    }
  }

  editDepartment(dept: Department): void {
    this.editingDepartmentId = dept.departmentId!;
    this.deptForm.patchValue({
      departmentName: dept.departmentName,
      description: dept.description
    });
  }

  cancelEdit(): void {
    this.editingDepartmentId = null;
    this.deptForm.reset();
    this.loading = false;
  }

  deleteDepartment(id: number): void {
    if (confirm('Are you sure you want to delete this department?')) {
      this.loadingList = true;
      this.departmentService.deleteDepartment(id).subscribe({
        next: () => {
          this.snackBar.open('Department deleted successfully!', 'Close', { duration: 3000 });
          this.loadDepartments();
          this.cdr.detectChanges();
        },
        error: err => {
          this.loadingList = false;
          this.cdr.detectChanges();
          this.snackBar.open(err.error || 'Failed to delete department', 'Close', { duration: 4000 });
        }
      });
    }
  }
}
