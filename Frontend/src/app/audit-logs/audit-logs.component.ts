import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuditService, AuditLog } from '../shared/audit.service';

@Component({
  selector: 'app-audit-logs',
  template: `
    <div class="page-header">
      <h1 class="page-title gradient-text">Audit Logs</h1>
      <p class="page-subtitle">Track system activities and changes</p>
    </div>

    <mat-card class="app-card table-card slide-up">
      <div class="table-container">
        <table mat-table [dataSource]="logs" class="app-table">
          <ng-container matColumnDef="auditId">
            <th mat-header-cell *matHeaderCellDef>Audit ID</th>
            <td mat-cell *matCellDef="let log">{{ log.auditId }}</td>
          </ng-container>

          <ng-container matColumnDef="entityName">
            <th mat-header-cell *matHeaderCellDef>Entity Name</th>
            <td mat-cell *matCellDef="let log">{{ log.entityName }}</td>
          </ng-container>

          <ng-container matColumnDef="recordId">
            <th mat-header-cell *matHeaderCellDef>Record ID</th>
            <td mat-cell *matCellDef="let log">{{ log.recordId }}</td>
          </ng-container>

          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef>Action</th>
            <td mat-cell *matCellDef="let log">
              <span class="badge" [ngClass]="getActionBadgeClass(log.action)">{{ log.action }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="createdBy">
            <th mat-header-cell *matHeaderCellDef>Created By</th>
            <td mat-cell *matCellDef="let log">{{ log.createdBy }}</td>
          </ng-container>

          <ng-container matColumnDef="createdOn">
            <th mat-header-cell *matHeaderCellDef>Created On</th>
            <td mat-cell *matCellDef="let log">
              <div class="primary-text">{{ log.createdOn | date:'medium' }}</div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
        </table>

        <div class="empty-state fade-in" *ngIf="logs.length === 0 && !loading">
          <h3>No logs found</h3>
          <p>System activities will be recorded here.</p>
        </div>

        <div class="loading-spinner" *ngIf="loading">
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        </div>
      </div>
    </mat-card>
  `,
  styles: [`
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
    .empty-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: var(--border-color);
      margin-bottom: 16px;
    }
  `],
  standalone: false
})
export class AuditLogsComponent implements OnInit {
  logs: AuditLog[] = [];
  displayedColumns: string[] = ['auditId', 'entityName', 'recordId', 'action', 'createdBy', 'createdOn'];
  loading = true;

  constructor(private auditService: AuditService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading = true;
    this.auditService.getLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load audit logs', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getActionBadgeClass(action: string): string {
    switch (action?.toLowerCase()) {
      case 'create': return 'badge-approved';
      case 'update': return 'badge-pending';
      case 'delete': return 'badge-rejected';
      default: return 'badge-active';
    }
  }
}
