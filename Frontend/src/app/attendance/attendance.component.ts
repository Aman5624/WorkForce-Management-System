import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AttendanceService, Attendance } from '../shared/attendance.service';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-attendance',
  template: `
    <div class="attendance-container fade-in">
      <div class="header-section">
        <div>
          <h1 class="gradient-text">Attendance Management</h1>
          <p>Clock in, choose work mode, and view timesheet records</p>
        </div>
        <button mat-raised-button class="btn-secondary" (click)="exportTimesheet()">
          Export Timesheet (CSV)
        </button>
      </div>

      <div class="attendance-grid">
        <!-- Clock Panel -->
        <div class="glass-card clock-card">
          <div class="clock-icon-wrapper" [ngClass]="{'glowing-success': isCheckedIn}">
            <span class="pulse-icon" *ngIf="isCheckedIn">ON</span>
            <span *ngIf="!isCheckedIn">OFF</span>
          </div>

          <div class="clock-time">
            <h2>{{ currentTime | date:'hh:mm:ss a' }}</h2>
            <p>{{ currentTime | date:'EEEE, MMMM d, y' }}</p>
          </div>

          <div class="status-panel">
            <span class="status-text">
              Status: 
              <span class="badge" [ngClass]="isCheckedIn ? 'badge-active' : 'badge-inactive'">
                {{ isCheckedIn ? 'Checked In' : 'Checked Out' }}
              </span>
            </span>
            <span class="work-mode-text" *ngIf="isCheckedIn">
              Mode: <span class="dept-tag">{{ activeAttendance?.workMode }}</span>
            </span>
          </div>

          <div class="action-form" *ngIf="!isCheckedIn">
            <mat-form-field appearance="fill">
              <mat-label>Work Mode</mat-label>
              <mat-select [(value)]="selectedWorkMode">
                <mat-option value="WFO">Office (WFO)</mat-option>
                <mat-option value="WFH">Home (WFH)</mat-option>
                <mat-option value="Hybrid">Hybrid</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button class="btn-primary clock-btn" (click)="onCheckIn()">
              Clock In
            </button>
          </div>

          <div class="action-form" *ngIf="isCheckedIn">
            <div class="checkin-details">
              <p>Checked In at: <strong>{{ activeAttendance?.checkIn | date:'hh:mm a' }}</strong></p>
              <p *ngIf="elapsedTime">Duration: <strong>{{ elapsedTime }}</strong></p>
            </div>
            <button mat-raised-button color="warn" class="clock-btn checkout-btn" (click)="onCheckOut()">
              Clock Out
            </button>
          </div>
        </div>

        <!-- Attendance Logs Table -->
        <div class="glass-card logs-card">
          <div class="logs-header">
            <h3>Attendance History</h3>
            <mat-checkbox *ngIf="isAdminOrManager()" [(ngModel)]="viewAllLogs" (change)="toggleLogsView()">
              View All Employee Logs
            </mat-checkbox>
          </div>

          <div class="table-responsive">
            <table mat-table [dataSource]="dataSource" matSort class="w-full">
              <!-- Date Column -->
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Date </th>
                <td mat-cell *matCellDef="let row"> {{ row.attendanceDate | date:'mediumDate' }} </td>
              </ng-container>

              <!-- Employee Column (Only in Admin/Manager View) -->
              <ng-container matColumnDef="employee">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Employee </th>
                <td mat-cell *matCellDef="let row"> 
                  {{ row.employeeName || 'Employee #' + row.empId }}
                </td>
              </ng-container>

              <!-- Check In Column -->
              <ng-container matColumnDef="checkIn">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Check In </th>
                <td mat-cell *matCellDef="let row"> {{ row.checkIn | date:'hh:mm a' }} </td>
              </ng-container>

              <!-- Check Out Column -->
              <ng-container matColumnDef="checkOut">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Check Out </th>
                <td mat-cell *matCellDef="let row"> 
                  {{ row.checkOut ? (row.checkOut | date:'hh:mm a') : 'Working...' }} 
                </td>
              </ng-container>

              <!-- Work Mode Column -->
              <ng-container matColumnDef="workMode">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Work Mode </th>
                <td mat-cell *matCellDef="let row"> 
                  <span class="dept-tag">{{ row.workMode }}</span>
                </td>
              </ng-container>

              <!-- Hours Column -->
              <ng-container matColumnDef="hours">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Hours </th>
                <td mat-cell *matCellDef="let row"> 
                  {{ row.totalHours ? (row.totalHours | number:'1.1-2') + ' hrs' : '-' }} 
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" colspan="6">No attendance records found.</td>
              </tr>
            </table>
          </div>
          <mat-paginator [pageSizeOptions]="[5, 10, 20]" aria-label="Select page of attendance" class="app-paginator"></mat-paginator>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .attendance-container {
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
    .attendance-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 24px;
    }
    @media (max-width: 992px) {
      .attendance-grid {
        grid-template-columns: 1fr;
      }
    }
    .clock-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 35px 24px !important;
      gap: 24px;
      justify-content: center;
    }
    .clock-icon-wrapper {
      width: 90px;
      height: 90px;
      background: rgba(255, 255, 255, 0.03);
      border: 2px solid var(--border-card);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
    .clock-icon-wrapper span {
      font-size: 24px;
      font-weight: bold;
      color: var(--text-muted);
    }
    .glowing-success {
      border-color: var(--success);
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
      background: rgba(16, 185, 129, 0.05);
    }
    .glowing-success span {
      color: var(--success);
    }
    .pulse-icon {
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.08); }
      100% { transform: scale(1); }
    }
    .clock-time h2 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 4px;
    }
    .clock-time p {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .status-panel {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 0.95rem;
    }
    .action-form {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .clock-btn {
      width: 100%;
      padding: 12px !important;
      font-size: 1rem !important;
      font-weight: 600 !important;
      border-radius: 8px !important;
    }
    .checkout-btn {
      background-color: var(--danger) !important;
      color: white !important;
      box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3) !important;
    }
    .checkin-details {
      color: var(--text-muted);
      font-size: 0.9rem;
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 8px;
    }
    .logs-card {
      display: flex;
      flex-direction: column;
      padding: 24px 0 0 0 !important;
    }
    .logs-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px 16px 24px;
      border-bottom: 1px solid var(--border-card);
    }
    .logs-header h3 {
      font-weight: 600;
      margin: 0;
    }
    .table-responsive {
      width: 100%;
      overflow-x: auto;
    }
    .w-full {
      width: 100%;
    }
    .dept-tag {
      background: rgba(255, 255, 255, 0.05);
      padding: 4px 8px;
      border-radius: 6px;
      border: 1px solid var(--border-card);
      font-size: 0.8rem;
    }
    .app-paginator {
      background: transparent !important;
      color: var(--text-muted) !important;
      border-top: 1px solid var(--border-card);
    }
  `],
  standalone: false
})
export class AttendanceComponent implements OnInit {
  currentTime = new Date();
  isCheckedIn = false;
  selectedWorkMode = 'WFO';
  activeAttendance: Attendance | null = null;
  elapsedTime = '';
  viewAllLogs = false;
  timerInterval: any;

  displayedColumns: string[] = ['date', 'checkIn', 'checkOut', 'workMode', 'hours'];
  dataSource = new MatTableDataSource<Attendance>([]);
  allAttendanceRecords: Attendance[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Clock tick
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);

    this.loadLogs();
  }

  isAdminOrManager(): boolean {
    const role = this.authService.currentUserValue?.role.toLowerCase();
    return role === 'admin' || role === 'manager';
  }

  loadLogs(): void {
    this.attendanceService.getAll().subscribe({
      next: data => {
        this.allAttendanceRecords = data;
        this.checkTodayStatus();
        this.filterAndDisplayLogs();
      },
      error: () => {
        this.snackBar.open('Failed to load attendance logs.', 'Close', { duration: 4000 });
      }
    });
  }

  checkTodayStatus(): void {
    const userId = this.authService.currentUserValue?.userId;
    if (!userId) return;

    // Find if user has a record today with no checkout
    const todayStr = new Date().toISOString().split('T')[0];
    const active = this.allAttendanceRecords.find(a => 
      a.empId === userId && 
      a.attendanceDate.startsWith(todayStr) && 
      a.checkOut === null
    );

    if (active) {
      this.isCheckedIn = true;
      this.activeAttendance = active;
      this.startDurationTimer(new Date(active.checkIn));
    } else {
      this.isCheckedIn = false;
      this.activeAttendance = null;
      this.elapsedTime = '';
      if (this.timerInterval) clearInterval(this.timerInterval);
    }
  }

  filterAndDisplayLogs(): void {
    const userId = this.authService.currentUserValue?.userId;
    if (!userId) return;

    let filtered: Attendance[] = [];
    if (this.viewAllLogs && this.isAdminOrManager()) {
      filtered = this.allAttendanceRecords;
      this.displayedColumns = ['date', 'employee', 'checkIn', 'checkOut', 'workMode', 'hours'];
    } else {
      filtered = this.allAttendanceRecords.filter(a => a.empId === userId);
      this.displayedColumns = ['date', 'checkIn', 'checkOut', 'workMode', 'hours'];
    }

    this.dataSource.data = filtered;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  toggleLogsView(): void {
    this.filterAndDisplayLogs();
  }

  startDurationTimer(checkInTime: Date): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    const update = () => {
      const diff = new Date().getTime() - checkInTime.getTime();
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      this.elapsedTime = `${hrs}h ${mins}m`;
    };

    update();
    this.timerInterval = setInterval(update, 60000);
  }

  onCheckIn(): void {
    const userId = this.authService.currentUserValue?.userId;
    if (!userId) return;

    this.attendanceService.checkIn(userId, this.selectedWorkMode).subscribe({
      next: () => {
        this.snackBar.open('Checked in successfully!', 'Close', { duration: 3000 });
        this.loadLogs();
      },
      error: err => {
        this.snackBar.open(err.error || 'Failed to check in.', 'Close', { duration: 4000 });
      }
    });
  }

  onCheckOut(): void {
    if (!this.activeAttendance) return;

    this.attendanceService.checkOut(this.activeAttendance.attendanceId).subscribe({
      next: () => {
        this.snackBar.open('Checked out successfully!', 'Close', { duration: 3000 });
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.loadLogs();
      },
      error: err => {
        this.snackBar.open(err.error || 'Failed to check out.', 'Close', { duration: 4000 });
      }
    });
  }

  exportTimesheet(): void {
    const data = this.dataSource.data;
    if (data.length === 0) {
      this.snackBar.open('No logs to export', 'Close', { duration: 3000 });
      return;
    }

    // Convert data to CSV format
    const headers = ['Date', 'Employee ID', 'Check In', 'Check Out', 'Work Mode', 'Hours'];
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const date = new Date(row.attendanceDate).toLocaleDateString();
      const checkIn = new Date(row.checkIn).toLocaleTimeString();
      const checkOut = row.checkOut ? new Date(row.checkOut).toLocaleTimeString() : 'Working...';
      const workMode = row.workMode;
      const hours = row.totalHours ? row.totalHours.toFixed(2) : '0';

      const line = [
        `"${date}"`,
        `"${row.empId}"`,
        `"${checkIn}"`,
        `"${checkOut}"`,
        `"${workMode}"`,
        `"${hours}"`
      ];
      csvRows.push(line.join(','));
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WMS_Timesheet_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.snackBar.open('Timesheet exported successfully!', 'Close', { duration: 3000 });
  }
}
