import { environment } from '../environments/environment';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DepartmentService, Department } from '../shared/department.service';
import { EmployeeService, Employee } from '../shared/employee.service';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

export function ageValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) return null;
    const today = new Date();
    const birthDate = new Date(control.value);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= minAge ? null : { underAge: { value: age } };
  };
}

@Component({
  selector: 'app-employee-form',
  template: `
    <h2 mat-dialog-title class="gradient-text">{{ isEditMode ? 'Edit Employee' : 'Add New Employee' }}</h2>
    <mat-dialog-content class="dialog-content">
      <form [formGroup]="employeeForm" class="form-grid">
        <div class="row">
          <mat-form-field appearance="fill">
            <mat-label>First Name</mat-label>
            <input matInput formControlName="firstName">
            <mat-error *ngIf="employeeForm.get('firstName')?.hasError('required')">First Name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Last Name</mat-label>
            <input matInput formControlName="lastName">
            <mat-error *ngIf="employeeForm.get('lastName')?.hasError('required')">Last Name is required</mat-error>
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="fill">
            <mat-label>Email Address</mat-label>
            <input matInput type="email" formControlName="email">
            <mat-error *ngIf="employeeForm.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="employeeForm.get('email')?.hasError('email')">Please enter a valid email</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Phone Number</mat-label>
            <input matInput formControlName="phoneNumber">
            <mat-error *ngIf="employeeForm.get('phoneNumber')?.hasError('required')">Phone is required</mat-error>
          </mat-form-field>
        </div>

        <div class="row" *ngIf="!isEditMode">
          <mat-form-field appearance="fill">
            <mat-label>Gender</mat-label>
            <mat-select formControlName="gender">
              <mat-option value="M">Male</mat-option>
              <mat-option value="F">Female</mat-option>
              <mat-option value="O">Other</mat-option>
            </mat-select>
            <mat-error *ngIf="employeeForm.get('gender')?.hasError('required')">Gender is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Date of Birth</mat-label>
            <input matInput [matDatepicker]="dobPicker" formControlName="dob">
            <mat-datepicker-toggle matIconSuffix [for]="dobPicker"></mat-datepicker-toggle>
            <mat-datepicker #dobPicker></mat-datepicker>
            <mat-error *ngIf="employeeForm.get('dob')?.hasError('required')">DOB is required</mat-error>
            <mat-error *ngIf="employeeForm.get('dob')?.hasError('underAge')">Employee must be at least 18 years old</mat-error>
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="fill" *ngIf="!isEditMode">
            <mat-label>Date of Joining</mat-label>
            <input matInput [matDatepicker]="dojPicker" formControlName="doj">
            <mat-datepicker-toggle matIconSuffix [for]="dojPicker"></mat-datepicker-toggle>
            <mat-datepicker #dojPicker></mat-datepicker>
            <mat-error *ngIf="employeeForm.get('doj')?.hasError('required')">DOJ is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" [ngClass]="{'full-width': isEditMode}">
            <mat-label>Department</mat-label>
            <mat-select formControlName="departmentId">
              <mat-option *ngFor="let dept of departments" [value]="dept.departmentId">
                {{ dept.departmentName }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="employeeForm.get('departmentId')?.hasError('required')">Department is required</mat-error>
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="fill">
            <mat-label>Role</mat-label>
            <mat-select formControlName="roleId">
              <mat-option *ngFor="let role of roles" [value]="role.roleId">
                {{ role.roleName }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="employeeForm.get('roleId')?.hasError('required')">Role is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" *ngIf="isEditMode">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="Active">Active</mat-option>
              <mat-option value="Inactive">Inactive</mat-option>
            </mat-select>
            <mat-error *ngIf="employeeForm.get('status')?.hasError('required')">Status is required</mat-error>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button class="btn-secondary" (click)="onCancel()">Cancel</button>
      <button mat-raised-button class="btn-primary" [disabled]="employeeForm.invalid || loading" (click)="onSave()">
        {{ isEditMode ? 'Update' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-content {
      padding-top: 16px !important;
      min-width: 500px;
    }
    @media (max-width: 600px) {
      .dialog-content {
        min-width: 100%;
      }
    }
    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .row {
      display: flex;
      gap: 16px;
    }
    .row mat-form-field {
      flex: 1;
    }
    .full-width {
      flex: 1 1 100% !important;
    }
    .dialog-actions {
      padding: 16px 24px !important;
      border-top: 1px solid var(--border-card);
      background: #1e293b;
      margin-top: 16px;
    }
  `],
  standalone: false
})
export class EmployeeFormComponent implements OnInit {
  employeeForm!: FormGroup;
  isEditMode = false;
  loading = false;
  departments: Department[] = [];
  roles: any[] = [];

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EmployeeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { employee: Employee | null }
  ) {
    this.isEditMode = !!data.employee;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadDropdowns();
  }

  private initForm(): void {
    if (this.isEditMode && this.data.employee) {
      const emp = this.data.employee;
      this.employeeForm = this.fb.group({
        firstName: [emp.firstName, Validators.required],
        lastName: [emp.lastName, Validators.required],
        email: [emp.email, [Validators.required, Validators.email]],
        phoneNumber: [emp.phoneNumber, Validators.required],
        departmentId: [null, Validators.required], // Loaded from lists matching name
        roleId: [null, Validators.required], // Loaded from lists matching name
        status: [emp.status, Validators.required]
      });
    } else {
      this.employeeForm = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', Validators.required],
        gender: ['M', Validators.required],
        dob: ['', [Validators.required, ageValidator(18)]],
        doj: [new Date(), Validators.required],
        departmentId: [null, Validators.required],
        roleId: [null, Validators.required]
      });
    }
  }

  private loadDropdowns(): void {
    this.departmentService.getDepartments().subscribe({
      next: list => {
        this.departments = list;
        if (this.isEditMode && this.data.employee) {
          const matched = list.find(d => d.departmentName.toLowerCase() === this.data.employee?.departmentName.toLowerCase());
          if (matched) {
            this.employeeForm.patchValue({ departmentId: matched.departmentId });
          }
        }
      }
    });

    this.http.get<any[]>(`${environment.apiUrl}/Role`).subscribe({
      next: list => {
        this.roles = list;
        if (this.isEditMode && this.data.employee) {
          const matched = list.find(r => r.roleName.toLowerCase() === this.data.employee?.roleName.toLowerCase());
          if (matched) {
            this.employeeForm.patchValue({ roleId: matched.roleId });
          }
        }
      }
    });
  }

  onSave(): void {
    if (this.employeeForm.invalid) return;
    this.loading = true;

    if (this.isEditMode && this.data.employee) {
      const id = this.data.employee.employeeId;
      const updateData = {
        firstName: this.employeeForm.value.firstName,
        lastName: this.employeeForm.value.lastName,
        email: this.employeeForm.value.email,
        phoneNumber: this.employeeForm.value.phoneNumber,
        departmentId: this.employeeForm.value.departmentId,
        roleId: this.employeeForm.value.roleId,
        status: this.employeeForm.value.status
      };

      this.employeeService.update(id, updateData).subscribe({
        next: () => {
          this.snackBar.open('Employee updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: err => {
          this.loading = false;
          this.snackBar.open(err.error || 'Failed to update employee', 'Close', { duration: 4000 });
        }
      });
    } else {
      const createData = {
        firstName: this.employeeForm.value.firstName,
        lastName: this.employeeForm.value.lastName,
        email: this.employeeForm.value.email,
        phoneNumber: this.employeeForm.value.phoneNumber,
        gender: this.employeeForm.value.gender,
        dob: new Date(this.employeeForm.value.dob).toISOString(),
        doj: new Date(this.employeeForm.value.doj).toISOString(),
        departmentId: this.employeeForm.value.departmentId,
        roleId: this.employeeForm.value.roleId
      };

      this.employeeService.create(createData).subscribe({
        next: () => {
          this.snackBar.open('Employee created successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: err => {
          this.loading = false;
          this.snackBar.open(err.error || 'Failed to create employee', 'Close', { duration: 4000 });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
