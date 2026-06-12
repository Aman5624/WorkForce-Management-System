import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnnouncementService, Announcement, CreateAnnouncementDto } from '../shared/announcement.service';
import { AuthService } from '../shared/auth.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-announcements',
  template: `
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title gradient-text">Announcements</h1>
        <p class="page-subtitle">Manage system-wide announcements</p>
      </div>
      <button mat-raised-button color="primary" class="primary-btn pulse-btn" (click)="toggleForm()">
        {{ showForm ? 'Cancel' : 'New Announcement' }}
      </button>
    </div>

    <!-- Create/Edit Announcement Form -->
    <mat-card class="app-card slide-up" *ngIf="showForm" style="margin-bottom: 24px;">
      <mat-card-header>
        <mat-card-title>{{ editingAnnouncementId ? 'Edit Announcement' : 'Create New Announcement' }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="announcementForm" (ngSubmit)="onSubmit()" class="form-grid">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" placeholder="Enter announcement title">
            <mat-error *ngIf="announcementForm.get('title')?.hasError('required')">Title is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Message</mat-label>
            <textarea matInput formControlName="message" rows="4" placeholder="Enter announcement content"></textarea>
            <mat-error *ngIf="announcementForm.get('message')?.hasError('required')">Message is required</mat-error>
          </mat-form-field>

          <div class="form-actions">
            <button mat-button type="button" (click)="toggleForm()">Cancel</button>
            <button mat-raised-button color="primary" class="primary-btn" type="submit" [disabled]="announcementForm.invalid || submitting">
              <mat-progress-bar mode="indeterminate" *ngIf="submitting" style="margin-right: 8px; width: 40px;"></mat-progress-bar>
              {{ submitting ? (editingAnnouncementId ? 'Updating...' : 'Publishing...') : (editingAnnouncementId ? 'Update Announcement' : 'Publish Announcement') }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>

    <!-- Announcements List -->
    <mat-card class="app-card table-card slide-up">
      <div class="table-container">
        <table mat-table [dataSource]="announcements" class="app-table">
          
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>Title</th>
            <td mat-cell *matCellDef="let announcement">
              <div class="primary-text" style="font-weight: 500;">{{ announcement.title }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="message">
            <th mat-header-cell *matHeaderCellDef>Message</th>
            <td mat-cell *matCellDef="let announcement" class="secondary-text">
              <div style="max-width: 400px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                {{ announcement.message }}
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="createdOn">
            <th mat-header-cell *matHeaderCellDef>Created On</th>
            <td mat-cell *matCellDef="let announcement">{{ announcement.createdOn | date:'mediumDate' }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let announcement">
              <span class="badge" [ngClass]="announcement.isActive ? 'badge-active' : 'badge-rejected'">
                {{ announcement.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let announcement">
              <div class="action-buttons">
                <button mat-button color="primary" (click)="editAnnouncement(announcement)">Edit</button>
                <button mat-button color="warn" (click)="deleteAnnouncement(announcement.announcementId)">Delete</button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
        </table>

        <div class="empty-state fade-in" *ngIf="announcements.length === 0 && !loading">
          <h3>No announcements yet</h3>
          <p>Create an announcement to communicate with the workforce.</p>
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
export class AnnouncementsComponent implements OnInit {
  announcements: Announcement[] = [];
  displayedColumns: string[] = ['title', 'message', 'createdOn', 'status', 'actions'];
  loading = true;
  showForm = false;
  submitting = false;
  editingAnnouncementId: number | null = null;
  announcementForm: FormGroup;

  constructor(
    private announcementService: AnnouncementService,
    private authService: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.announcementForm = this.fb.group({
      title: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    this.loading = true;
    this.announcementService.getAnnouncements().subscribe({
      next: (data) => {
        this.announcements = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load announcements', err);
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
    this.editingAnnouncementId = null;
    this.announcementForm.reset();
  }

  onSubmit(): void {
    if (this.announcementForm.invalid) return;

    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return;

    this.submitting = true;
    const dto: CreateAnnouncementDto = {
      title: this.announcementForm.value.title,
      message: this.announcementForm.value.message,
      createdBy: currentUser.userId
    };

    if (this.editingAnnouncementId) {
      this.announcementService.updateAnnouncement(this.editingAnnouncementId, dto).subscribe({
        next: () => {
          this.submitting = false;
          this.toggleForm();
          this.loadAnnouncements();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to update announcement', err);
          this.submitting = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.announcementService.createAnnouncement(dto).subscribe({
        next: () => {
          this.submitting = false;
          this.toggleForm();
          this.loadAnnouncements();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to create announcement', err);
          this.submitting = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  editAnnouncement(announcement: Announcement): void {
    this.editingAnnouncementId = announcement.announcementId;
    this.showForm = true;
    this.announcementForm.patchValue({
      title: announcement.title,
      message: announcement.message
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteAnnouncement(id: number): void {
    if (confirm('Are you sure you want to delete this announcement?')) {
      this.loading = true;
      this.announcementService.deleteAnnouncement(id).subscribe({
        next: () => {
          this.loadAnnouncements();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to delete announcement', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
