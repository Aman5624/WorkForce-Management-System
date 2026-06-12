import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeService, Employee } from '../shared/employee.service';
import { AuthService } from '../shared/auth.service';
import { EmployeeFormComponent } from './employee-form.component';

@Component({
  selector: 'app-employee-list',
  template: `
    <div class="employee-list-container fade-in">
      <div class="header-section">
        <div>
          <h1 class="gradient-text">Employees Directory</h1>
          <p>Manage employee records, roles, and status</p>
        </div>
        <button mat-raised-button class="btn-primary" (click)="openAddDialog()" *ngIf="canAddOrEdit()">
          Add Employee
        </button>
      </div>

      <!-- Search & Filters -->
      <div class="glass-card filter-card">
        <mat-form-field appearance="fill" class="search-field">
          <mat-label>Search Employees</mat-label>
          <input matInput (keyup)="applyFilter($event)" placeholder="Search by name, ID, email, department, or role..." #input>

        </mat-form-field>
      </div>

      <!-- Table Section -->
      <div class="glass-card table-card">
        <div class="table-responsive">
          <table mat-table [dataSource]="dataSource" matSort class="w-full">
            <!-- ID Column -->
            <ng-container matColumnDef="employeeId">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> ID </th>
              <td mat-cell *matCellDef="let row"> #{{row.employeeId}} </td>
            </ng-container>

            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Name </th>
              <td mat-cell *matCellDef="let row" class="font-medium"> {{row.firstName}} {{row.lastName}} </td>
            </ng-container>

            <!-- Email Column -->
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Email </th>
              <td mat-cell *matCellDef="let row"> {{row.email}} </td>
            </ng-container>

            <!-- Phone Column -->
            <ng-container matColumnDef="phoneNumber">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Phone </th>
              <td mat-cell *matCellDef="let row"> {{row.phoneNumber}} </td>
            </ng-container>

            <!-- Department Column -->
            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Department </th>
              <td mat-cell *matCellDef="let row"> 
                <span class="dept-tag">{{row.departmentName || 'N/A'}}</span>
              </td>
            </ng-container>

            <!-- Role Column -->
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Role </th>
              <td mat-cell *matCellDef="let row"> {{row.roleName}} </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
              <td mat-cell *matCellDef="let row"> 
                <span class="badge" [ngClass]="row.status.toLowerCase() === 'active' ? 'badge-active' : 'badge-inactive'">
                  {{row.status}}
                </span>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef> Actions </th>
              <td mat-cell *matCellDef="let row">
                <div class="action-buttons">
                  <button mat-button class="edit-btn" (click)="openEditDialog(row)" *ngIf="canAddOrEdit()" title="Edit">
                    Edit
                  </button>
                  <button mat-button class="delete-btn" (click)="deleteEmployee(row)" *ngIf="canDelete()" title="Delete">
                    Delete
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <!-- Row shown when there is no matching data. -->
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="8">No employees matching the search "{{input.value}}"</td>
            </tr>
          </table>
        </div>

        <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of employees" class="app-paginator"></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .employee-list-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .header-section h1 {
      font-size: 2.2rem;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .header-section p {
      color: var(--text-muted);
    }
    .filter-card {
      padding: 16px 24px !important;
    }
    .search-field {
      width: 100%;
      margin-bottom: 0;
    }
    .table-card {
      padding: 0 !important;
      overflow: hidden;
    }
    .table-responsive {
      width: 100%;
      overflow-x: auto;
    }
    .w-full {
      width: 100%;
    }
    .font-medium {
      font-weight: 500;
    }
    .dept-tag {
      background: rgba(255, 255, 255, 0.05);
      padding: 4px 8px;
      border-radius: 6px;
      border: 1px solid var(--border-card);
      font-size: 0.85rem;
    }
    .action-buttons {
      display: flex;
      gap: 8px;
    }
    .edit-btn {
      color: var(--secondary-color);
    }
    .delete-btn {
      color: var(--danger);
    }
    .app-paginator {
      background: transparent !important;
      color: var(--text-muted) !important;
      border-top: 1px solid var(--border-card);
    }
  `],
  standalone: false
})
export class EmployeeListComponent implements OnInit {
  displayedColumns: string[] = ['employeeId', 'name', 'email', 'phoneNumber', 'department', 'role', 'status', 'actions'];
  dataSource!: MatTableDataSource<Employee>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Employee>([]);
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getAll().subscribe({
      next: data => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: () => {
        this.snackBar.open('Failed to load employees.', 'Close', { duration: 4000 });
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  canAddOrEdit(): boolean {
    const role = this.authService.currentUserValue?.role.toLowerCase();
    return role === 'admin' || role === 'manager';
  }

  canDelete(): boolean {
    const role = this.authService.currentUserValue?.role.toLowerCase();
    return role === 'admin';
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(EmployeeFormComponent, {
      data: { employee: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEmployees();
      }
    });
  }

  openEditDialog(employee: Employee): void {
    const dialogRef = this.dialog.open(EmployeeFormComponent, {
      data: { employee }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEmployees();
      }
    });
  }

  deleteEmployee(employee: Employee): void {
    if (confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
      this.employeeService.delete(employee.employeeId).subscribe({
        next: () => {
          this.snackBar.open('Employee deleted successfully', 'Close', { duration: 3000 });
          this.loadEmployees();
        },
        error: err => {
          this.snackBar.open(err.error || 'Failed to delete employee', 'Close', { duration: 4000 });
        }
      });
    }
  }
}
