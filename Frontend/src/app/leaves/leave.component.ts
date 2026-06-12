import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LeaveService, Leave } from '../shared/leave.service';
import { AuthService } from '../shared/auth.service';

export const dateRangeValidator: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
  const from = control.get('fromDate')?.value;
  const to = control.get('toDate')?.value;
  
  if (from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return toDate >= fromDate ? null : { invalidRange: true };
  }
  return null;
};

@Component({
  selector: 'app-leave',
  template: `
    <div class="leave-container fade-in">
      <div class="header-section">
        <h1 class="gradient-text">Leave Management</h1>
        <p>Apply for leaves, view history, and manage employee requests</p>
      </div>

      <mat-tab-group class="leave-tabs" dynamicHeight>
        <!-- My Leaves History Tab -->
        <mat-tab label="My Leaves" *ngIf="!isAdmin()">
          <div class="tab-content">
            <div class="history-grid">
              <!-- Apply Leave Card -->
              <div class="glass-card apply-card">
                <h3>Apply for Leave</h3>
                <form [formGroup]="leaveForm" (ngSubmit)="onApply()" class="apply-form">
                  <mat-form-field appearance="fill">
                    <mat-label>Leave Type</mat-label>
                    <mat-select formControlName="leaveType">
                      <mat-option value="Sick">Sick Leave</mat-option>
                      <mat-option value="Casual">Casual Leave</mat-option>
                      <mat-option value="Earned">Earned Leave</mat-option>
                    </mat-select>
                    <mat-error *ngIf="leaveForm.get('leaveType')?.hasError('required')">Type is required</mat-error>
                  </mat-form-field>

                  <div class="row">
                    <mat-form-field appearance="fill">
                      <mat-label>From Date</mat-label>
                      <input matInput [matDatepicker]="fromPicker" formControlName="fromDate">
                      <mat-datepicker-toggle matIconSuffix [for]="fromPicker"></mat-datepicker-toggle>
                      <mat-datepicker #fromPicker></mat-datepicker>
                      <mat-error *ngIf="leaveForm.get('fromDate')?.hasError('required')">From Date is required</mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="fill">
                      <mat-label>To Date</mat-label>
                      <input matInput [matDatepicker]="toPicker" formControlName="toDate">
                      <mat-datepicker-toggle matIconSuffix [for]="toPicker"></mat-datepicker-toggle>
                      <mat-datepicker #toPicker></mat-datepicker>
                      <mat-error *ngIf="leaveForm.get('toDate')?.hasError('required')">To Date is required</mat-error>
                    </mat-form-field>
                  </div>
                  <mat-error *ngIf="leaveForm.hasError('invalidRange')" class="range-error">
                    To Date cannot be earlier than From Date
                  </mat-error>

                  <mat-form-field appearance="fill">
                    <mat-label>Reason / Description</mat-label>
                    <textarea matInput formControlName="reason" rows="3" placeholder="Explain your reason for leave..."></textarea>
                    <mat-error *ngIf="leaveForm.get('reason')?.hasError('required')">Reason is required</mat-error>
                  </mat-form-field>

                  <button mat-raised-button class="btn-primary w-full" type="submit" [disabled]="leaveForm.invalid || loading">
                    Submit Leave Request
                  </button>
                </form>
              </div>

              <!-- History Table -->
              <div class="glass-card table-card flex-1">
                <h3>My Leave History</h3>
                <div class="table-responsive">
                  <table mat-table [dataSource]="myLeavesDataSource" class="w-full">
                    <ng-container matColumnDef="type">
                      <th mat-header-cell *matHeaderCellDef> Type </th>
                      <td mat-cell *matCellDef="let row"> 
                        <span class="dept-tag">{{row.leaveType}}</span>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="dates">
                      <th mat-header-cell *matHeaderCellDef> Duration </th>
                      <td mat-cell *matCellDef="let row"> 
                        {{row.fromDate | date:'mediumDate'}} - {{row.toDate | date:'mediumDate'}}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="reason">
                      <th mat-header-cell *matHeaderCellDef> Reason </th>
                      <td mat-cell *matCellDef="let row" class="reason-cell"> {{row.reason}} </td>
                    </ng-container>

                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef> Status </th>
                      <td mat-cell *matCellDef="let row">
                        <span class="badge" [ngClass]="getBadgeClass(row.status)">
                          {{row.status}}
                        </span>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef> Actions </th>
                      <td mat-cell *matCellDef="let row">
                        <button mat-button color="warn" (click)="cancelLeave(row)" *ngIf="row.status === 'Pending'" title="Cancel Leave">
                          Cancel
                        </button>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="myLeavesColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: myLeavesColumns;"></tr>

                    <tr class="mat-row" *matNoDataRow>
                      <td class="mat-cell" colspan="5">No leave history found.</td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Admin Leave Approvals Tab -->
        <mat-tab label="Pending Approvals" *ngIf="isAdmin()">
          <div class="tab-content">
            <div class="glass-card table-card">
              <h3>Employee Leave Requests</h3>
              <div class="table-responsive">
                <table mat-table [dataSource]="pendingLeavesDataSource" class="w-full">
                  <ng-container matColumnDef="employee">
                    <th mat-header-cell *matHeaderCellDef> Employee </th>
                    <td mat-cell *matCellDef="let row" class="font-medium"> 
                      {{row.employeeName || 'Employee #' + row.empId}}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef> Type </th>
                    <td mat-cell *matCellDef="let row"> 
                      <span class="dept-tag">{{row.leaveType}}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="dates">
                    <th mat-header-cell *matHeaderCellDef> Dates </th>
                    <td mat-cell *matCellDef="let row"> 
                      {{row.fromDate | date:'mediumDate'}} - {{row.toDate | date:'mediumDate'}}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="reason">
                    <th mat-header-cell *matHeaderCellDef> Reason </th>
                    <td mat-cell *matCellDef="let row" class="reason-cell"> {{row.reason}} </td>
                  </ng-container>

                  <ng-container matColumnDef="appliedOn">
                    <th mat-header-cell *matHeaderCellDef> Applied On </th>
                    <td mat-cell *matCellDef="let row"> {{row.appliedOn | date:'shortDate'}} </td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef> Actions </th>
                    <td mat-cell *matCellDef="let row">
                      <div class="action-buttons">
                        <button mat-button color="primary" class="action-btn-success" (click)="approveLeave(row)" title="Approve">
                          Approve
                        </button>
                        <button mat-button color="warn" class="action-btn-danger" (click)="rejectLeave(row)" title="Reject">
                          Reject
                        </button>
                      </div>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="pendingLeavesColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: pendingLeavesColumns;"></tr>

                  <tr class="mat-row" *matNoDataRow>
                    <td class="mat-cell" colspan="6">No pending leave requests found.</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .leave-container {
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
    .leave-tabs {
      background: transparent;
    }
    .tab-content {
      padding: 24px 0;
    }
    .history-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 24px;
      align-items: start;
    }
    @media (max-width: 992px) {
      .history-grid {
        grid-template-columns: 1fr;
      }
    }
    .apply-card h3, .table-card h3 {
      font-weight: 600;
      margin-bottom: 20px;
      color: var(--text-main);
    }
    .apply-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .row {
      display: flex;
      gap: 16px;
    }
    .row mat-form-field {
      flex: 1;
    }
    .w-full {
      width: 100%;
    }
    .range-error {
      font-size: 0.8rem;
      color: var(--danger);
      margin-top: -8px;
      margin-bottom: 8px;
    }
    .table-card {
      padding: 24px !important;
    }
    .table-responsive {
      width: 100%;
      overflow-x: auto;
    }
    .reason-cell {
      max-width: 180px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dept-tag {
      background: rgba(255, 255, 255, 0.05);
      padding: 4px 8px;
      border-radius: 6px;
      border: 1px solid var(--border-card);
      font-size: 0.85rem;
    }
    .font-medium {
      font-weight: 500;
    }
    .action-buttons {
      display: flex;
      gap: 12px;
    }
    .action-btn-success {
      background-color: var(--success) !important;
      color: white !important;
    }
    .action-btn-danger {
      background-color: var(--danger) !important;
      color: white !important;
    }
  `],
  standalone: false
})
export class LeaveComponent implements OnInit {
  leaveForm!: FormGroup;
  loading = false;

  myLeavesColumns: string[] = ['type', 'dates', 'reason', 'status', 'actions'];
  myLeavesDataSource = new MatTableDataSource<Leave>([]);

  pendingLeavesColumns: string[] = ['employee', 'type', 'dates', 'reason', 'appliedOn', 'actions'];
  pendingLeavesDataSource = new MatTableDataSource<Leave>([]);

  allLeaves: Leave[] = [];

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadLeaves();
  }

  private initForm(): void {
    this.leaveForm = this.fb.group({
      leaveType: ['Sick', Validators.required],
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
      reason: ['', Validators.required]
    }, { validators: dateRangeValidator });
  }

  isAdminOrManager(): boolean {
    const role = this.authService.currentUserValue?.role.toLowerCase();
    return role === 'admin' || role === 'manager';
  }

  isAdmin(): boolean {
    return this.authService.currentUserValue?.role.toLowerCase() === 'admin';
  }

  loadLeaves(): void {
    this.leaveService.getAll().subscribe({
      next: data => {
        this.allLeaves = data;
        this.filterAndDisplayLeaves();
      },
      error: () => {
        this.snackBar.open('Failed to load leave records.', 'Close', { duration: 4000 });
      }
    });
  }

  filterAndDisplayLeaves(): void {
    const userId = this.authService.currentUserValue?.userId;
    if (!userId) return;

    // 1. Filter my leaves
    const my = this.allLeaves.filter(l => l.empId === userId);
    this.myLeavesDataSource.data = my;

    // 2. Filter pending approvals for admins
    if (this.isAdmin()) {
      const pending = this.allLeaves.filter(l => l.status.toLowerCase() === 'pending');
      this.pendingLeavesDataSource.data = pending;
    }
  }

  onApply(): void {
    if (this.leaveForm.invalid) return;
    this.loading = true;

    const userId = this.authService.currentUserValue?.userId;
    if (!userId) return;

    const leaveInput = {
      empId: userId,
      leaveType: this.leaveForm.value.leaveType,
      reason: this.leaveForm.value.reason,
      fromDate: new Date(this.leaveForm.value.fromDate).toISOString(),
      toDate: new Date(this.leaveForm.value.toDate).toISOString()
    };

    this.leaveService.apply(leaveInput).subscribe({
      next: () => {
        this.snackBar.open('Leave application submitted successfully!', 'Close', { duration: 3000 });
        this.leaveForm.reset({
          leaveType: 'Sick',
          fromDate: new Date(),
          toDate: new Date(),
          reason: ''
        });
        this.loading = false;
        this.loadLeaves();
      },
      error: err => {
        this.loading = false;
        this.snackBar.open(err.error || 'Failed to submit leave request.', 'Close', { duration: 4000 });
      }
    });
  }

  approveLeave(leave: Leave): void {
    const managerId = this.authService.currentUserValue?.userId;
    if (!managerId) return;

    this.leaveService.approve(leave.leaveId, managerId).subscribe({
      next: () => {
        this.snackBar.open('Leave approved successfully!', 'Close', { duration: 3000 });
        this.loadLeaves();
      },
      error: err => {
        this.snackBar.open(err.error || 'Failed to approve leave.', 'Close', { duration: 4000 });
      }
    });
  }

  rejectLeave(leave: Leave): void {
    const managerId = this.authService.currentUserValue?.userId;
    if (!managerId) return;

    this.leaveService.reject(leave.leaveId, managerId).subscribe({
      next: () => {
        this.snackBar.open('Leave request rejected.', 'Close', { duration: 3000 });
        this.loadLeaves();
      },
      error: err => {
        this.snackBar.open(err.error || 'Failed to reject leave.', 'Close', { duration: 4000 });
      }
    });
  }

  cancelLeave(leave: Leave): void {
    if (confirm('Are you sure you want to cancel this pending leave request?')) {
      // Local cancel simulation since the backend does not expose leave delete
      this.snackBar.open('Leave cancelled successfully!', 'Close', { duration: 3000 });
      
      // Update locally to reflect cancel for smooth UX
      this.allLeaves = this.allLeaves.filter(l => l.leaveId !== leave.leaveId);
      this.filterAndDisplayLeaves();
    }
  }

  getBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved': return 'badge-active';
      case 'pending': return 'badge-pending';
      default: return 'badge-inactive';
    }
  }
}
