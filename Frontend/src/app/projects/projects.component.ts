import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ProjectService, Project, Client, Allocation } from '../shared/project.service';
import { EmployeeService, Employee } from '../shared/employee.service';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-projects',
  template: `
    <div class="projects-container fade-in">
      <div class="header-section">
        <h1 class="gradient-text">Projects & Clients</h1>
        <p>Track active projects, manage clients, and allocate employees</p>
      </div>

      <mat-tab-group class="project-tabs" dynamicHeight>

        <!-- Projects Tab -->
        <mat-tab label="Projects">
          <div class="tab-content">
            <div class="two-col-grid">
              <!-- Add Project Form -->
              <div class="glass-card form-card" *ngIf="isAdminOrManager()">
                <h3>{{ editingProject ? 'Edit Project' : 'New Project' }}</h3>
                <form [formGroup]="projectForm" (ngSubmit)="onSaveProject()" class="project-form">
                  <mat-form-field appearance="fill">
                    <mat-label>Project Name</mat-label>
                    <input matInput formControlName="projectName" placeholder="e.g. WMS Portal V2">
                    <mat-error *ngIf="projectForm.get('projectName')?.hasError('required')">Name is required</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="fill">
                    <mat-label>Client</mat-label>
                    <mat-select formControlName="clientId">
                      <mat-option *ngFor="let client of clients" [value]="client.clientId">
                        {{ client.clientName }}
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="projectForm.get('clientId')?.hasError('required')">Client is required</mat-error>
                  </mat-form-field>

                  <div class="row">
                    <mat-form-field appearance="fill">
                      <mat-label>Start Date</mat-label>
                      <input matInput [matDatepicker]="startPicker" formControlName="startDate">
                      <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
                      <mat-datepicker #startPicker></mat-datepicker>
                    </mat-form-field>
                    <mat-form-field appearance="fill">
                      <mat-label>End Date</mat-label>
                      <input matInput [matDatepicker]="endPicker" formControlName="endDate">
                      <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
                      <mat-datepicker #endPicker></mat-datepicker>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="fill" *ngIf="editingProject">
                    <mat-label>Status</mat-label>
                    <mat-select formControlName="status">
                      <mat-option value="Active">Active</mat-option>
                      <mat-option value="Completed">Completed</mat-option>
                      <mat-option value="On Hold">On Hold</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <div class="form-actions-row">
                    <button mat-raised-button class="btn-primary" type="submit" [disabled]="projectForm.invalid || loading">
                      {{ editingProject ? 'Update' : 'Create Project' }}
                    </button>
                    <button mat-button class="btn-secondary" type="button" *ngIf="editingProject" (click)="cancelEdit()">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              <!-- Projects Table -->
              <div class="glass-card table-card" [class.full-width]="!isAdminOrManager()">
                <h3>All Projects</h3>
                <div class="table-responsive">
                  <table mat-table [dataSource]="projectsDataSource" matSort class="w-full">
                    <ng-container matColumnDef="projectName">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header> Project </th>
                      <td mat-cell *matCellDef="let row" class="font-medium"> {{ row.projectName }} </td>
                    </ng-container>
                    <ng-container matColumnDef="clientName">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header> Client </th>
                      <td mat-cell *matCellDef="let row"> {{ row.clientName || '-' }} </td>
                    </ng-container>
                    <ng-container matColumnDef="startDate">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header> Start </th>
                      <td mat-cell *matCellDef="let row"> {{ row.startDate | date:'mediumDate' }} </td>
                    </ng-container>
                    <ng-container matColumnDef="endDate">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header> End </th>
                      <td mat-cell *matCellDef="let row"> {{ row.endDate | date:'mediumDate' }} </td>
                    </ng-container>
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
                      <td mat-cell *matCellDef="let row">
                        <span class="badge" [ngClass]="getProjectBadge(row.status)">{{ row.status }}</span>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef> Actions </th>
                      <td mat-cell *matCellDef="let row">
                        <div class="action-buttons" *ngIf="isAdminOrManager()">
                          <button mat-button class="edit-btn" (click)="editProject(row)" title="Edit">
                            Edit
                          </button>
                          <button mat-button class="delete-btn" (click)="deleteProject(row)" title="Delete">
                            Delete
                          </button>
                        </div>
                      </td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="projectColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: projectColumns;"></tr>
                    <tr class="mat-row" *matNoDataRow>
                      <td class="mat-cell" colspan="6">No projects found.</td>
                    </tr>
                  </table>
                </div>
                <mat-paginator #projectPaginator [pageSizeOptions]="[5,10,25]" class="app-paginator"></mat-paginator>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Clients Tab -->
        <mat-tab label="Clients">
          <div class="tab-content">
            <div class="two-col-grid">
              <!-- Add/Edit Client Form -->
              <div class="glass-card form-card" *ngIf="isAdminOrManager()">
                <h3>{{ editingClient ? 'Edit Client' : 'Add New Client' }}</h3>
                <form [formGroup]="clientForm" (ngSubmit)="onSaveClient()" class="project-form">
                  <mat-form-field appearance="fill">
                    <mat-label>Client Name</mat-label>
                    <input matInput formControlName="clientName" placeholder="Company name">
                    <mat-error *ngIf="clientForm.get('clientName')?.hasError('required')">Name is required</mat-error>
                  </mat-form-field>
                  <mat-form-field appearance="fill">
                    <mat-label>Location</mat-label>
                    <input matInput formControlName="clientLocation" placeholder="City, Country">
                  </mat-form-field>
                  <mat-form-field appearance="fill">
                    <mat-label>Phone Number</mat-label>
                    <input matInput formControlName="clientPhoneNumber" type="tel" placeholder="Contact number">
                  </mat-form-field>
                  <mat-form-field appearance="fill">
                    <mat-label>Address</mat-label>
                    <textarea matInput formControlName="clientAddress" rows="3"></textarea>
                  </mat-form-field>
                  <div class="form-actions-row">
                    <button mat-raised-button class="btn-primary" type="submit" [disabled]="clientForm.invalid || loading">
                      {{ editingClient ? 'Update' : 'Add Client' }}
                    </button>
                    <button mat-button class="btn-secondary" type="button" *ngIf="editingClient" (click)="cancelClientEdit()">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              <!-- Clients Table -->
              <div class="glass-card table-card" [class.full-width]="!isAdminOrManager()">
                <h3>All Clients</h3>
                <div class="table-responsive">
                  <table mat-table [dataSource]="clientsDataSource" class="w-full">
                    <ng-container matColumnDef="clientName">
                      <th mat-header-cell *matHeaderCellDef> Client Name </th>
                      <td mat-cell *matCellDef="let row" class="font-medium"> {{ row.clientName }} </td>
                    </ng-container>
                    <ng-container matColumnDef="clientLocation">
                      <th mat-header-cell *matHeaderCellDef> Location </th>
                      <td mat-cell *matCellDef="let row"> {{ row.clientLocation || '-' }} </td>
                    </ng-container>
                    <ng-container matColumnDef="clientPhoneNumber">
                      <th mat-header-cell *matHeaderCellDef> Phone </th>
                      <td mat-cell *matCellDef="let row"> {{ row.clientPhoneNumber || '-' }} </td>
                    </ng-container>
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef> Actions </th>
                      <td mat-cell *matCellDef="let row">
                        <div class="action-buttons" *ngIf="isAdminOrManager()">
                          <button mat-button class="edit-btn" (click)="editClient(row)" title="Edit">Edit</button>
                          <button mat-button class="delete-btn" (click)="deleteClient(row)" title="Delete">Delete</button>
                        </div>
                      </td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="clientColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: clientColumns;"></tr>
                    <tr class="mat-row" *matNoDataRow>
                      <td class="mat-cell" colspan="3">No clients found.</td>
                    </tr>
                  </table>
                </div>
                <mat-paginator #clientPaginator [pageSizeOptions]="[5,10,25]" class="app-paginator"></mat-paginator>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Allocations Tab -->
        <mat-tab label="Allocations" *ngIf="isAdminOrManager()">
          <div class="tab-content">
            <div class="two-col-grid">
              <!-- Allocate/Edit Form -->
              <div class="glass-card form-card">
                <h3>{{ editingAllocation ? 'Edit Allocation' : 'Allocate Employee' }}</h3>
                <form [formGroup]="allocationForm" (ngSubmit)="onAllocate()" class="project-form">
                  <mat-form-field appearance="fill">
                    <mat-label>Select Employee</mat-label>
                    <mat-select formControlName="empId">
                      <mat-option *ngFor="let emp of employees" [value]="emp.employeeId">
                        {{ emp.firstName }} {{ emp.lastName }}
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="allocationForm.get('empId')?.hasError('required')">Employee is required</mat-error>
                  </mat-form-field>
                  <mat-form-field appearance="fill">
                    <mat-label>Select Project</mat-label>
                    <mat-select formControlName="projectId">
                      <mat-option *ngFor="let proj of projects" [value]="proj.projectId">
                        {{ proj.projectName }}
                      </mat-option>
                    </mat-select>
                    <mat-error *ngIf="allocationForm.get('projectId')?.hasError('required')">Project is required</mat-error>
                  </mat-form-field>
                  
                  <mat-form-field appearance="fill" *ngIf="editingAllocation">
                    <mat-label>Status</mat-label>
                    <mat-select formControlName="status">
                      <mat-option [value]="true">Active</mat-option>
                      <mat-option [value]="false">Inactive</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <div class="form-actions-row">
                    <button mat-raised-button class="btn-primary" type="submit" [disabled]="allocationForm.invalid || loading">
                      {{ editingAllocation ? 'Update' : 'Allocate' }}
                    </button>
                    <button mat-button class="btn-secondary" type="button" *ngIf="editingAllocation" (click)="cancelAllocationEdit()">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              <!-- Allocations Table -->
              <div class="glass-card table-card">
                <h3>Current Allocations</h3>
                <div class="table-responsive">
                  <table mat-table [dataSource]="allocationsDataSource" class="w-full">
                    <ng-container matColumnDef="empId">
                      <th mat-header-cell *matHeaderCellDef> Employee </th>
                      <td mat-cell *matCellDef="let row"> Employee #{{ row.empId }} </td>
                    </ng-container>
                    <ng-container matColumnDef="projectId">
                      <th mat-header-cell *matHeaderCellDef> Project </th>
                      <td mat-cell *matCellDef="let row"> Project #{{ row.projectId }} </td>
                    </ng-container>
                    <ng-container matColumnDef="assignedOn">
                      <th mat-header-cell *matHeaderCellDef> Assigned On </th>
                      <td mat-cell *matCellDef="let row"> {{ row.assignedOn | date:'mediumDate' }} </td>
                    </ng-container>
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef> Status </th>
                      <td mat-cell *matCellDef="let row">
                        <span class="badge" [ngClass]="row.status ? 'badge-active' : 'badge-inactive'">
                          {{ row.status ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef> Actions </th>
                      <td mat-cell *matCellDef="let row">
                        <div class="action-buttons">
                          <button mat-button class="edit-btn" (click)="editAllocation(row)" title="Edit">Edit</button>
                          <button mat-button class="delete-btn" (click)="deleteAllocation(row)" title="Delete">Delete</button>
                        </div>
                      </td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="allocationColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: allocationColumns;"></tr>
                    <tr class="mat-row" *matNoDataRow>
                      <td class="mat-cell" colspan="4">No allocations found.</td>
                    </tr>
                  </table>
                </div>
                <mat-paginator #allocationPaginator [pageSizeOptions]="[5,10,25]" class="app-paginator"></mat-paginator>
              </div>
            </div>
          </div>
        </mat-tab>

      </mat-tab-group>
    </div>
  `,
  styles: [`
    .projects-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .header-section h1 {
      font-size: 2.2rem;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .header-section p { color: var(--text-muted); }
    .project-tabs { background: transparent; }
    .tab-content { padding: 24px 0; }
    .two-col-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 24px;
      align-items: start;
    }
    @media (max-width: 992px) {
      .two-col-grid { grid-template-columns: 1fr; }
    }
    .form-card h3, .table-card h3 {
      font-weight: 600;
      margin-bottom: 20px;
    }
    .project-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .row { display: flex; gap: 16px; }
    .row mat-form-field { flex: 1; }
    .w-full { width: 100%; }
    .full-width { grid-column: 1 / -1; }
    .form-actions-row {
      display: flex;
      gap: 12px;
    }
    .table-card { padding: 24px !important; }
    .table-responsive { width: 100%; overflow-x: auto; }
    .font-medium { font-weight: 500; }
    .action-buttons { display: flex; gap: 4px; }
    .edit-btn { color: var(--secondary-color); }
    .delete-btn { color: var(--danger); }
    .app-paginator {
      background: transparent !important;
      color: var(--text-muted) !important;
      border-top: 1px solid var(--border-card);
    }
  `],
  standalone: false
})
export class ProjectsComponent implements OnInit {
  // Forms
  projectForm!: FormGroup;
  clientForm!: FormGroup;
  allocationForm!: FormGroup;

  loading = false;
  editingProject: Project | null = null;
  editingAllocation: Allocation | null = null;
  editingClient: Client | null = null;

  // Data
  projects: Project[] = [];
  clients: Client[] = [];
  employees: Employee[] = [];

  // Tables
  projectColumns = ['projectName', 'clientName', 'startDate', 'endDate', 'status', 'actions'];
  projectsDataSource = new MatTableDataSource<Project>([]);

  clientColumns = ['clientName', 'clientLocation', 'clientPhoneNumber', 'actions'];
  clientsDataSource = new MatTableDataSource<Client>([]);

  allocationColumns = ['empId', 'projectId', 'assignedOn', 'status', 'actions'];
  allocationsDataSource = new MatTableDataSource<Allocation>([]);

  @ViewChild('projectPaginator') projectPaginator!: MatPaginator;
  @ViewChild('clientPaginator') clientPaginator!: MatPaginator;
  @ViewChild('allocationPaginator') allocationPaginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadAll();
  }

  private initForms(): void {
    this.projectForm = this.fb.group({
      projectName: ['', Validators.required],
      clientId: [null, Validators.required],
      startDate: [new Date(), Validators.required],
      endDate: [new Date(), Validators.required],
      status: ['Active']
    });

    this.clientForm = this.fb.group({
      clientName: ['', Validators.required],
      clientLocation: [''],
      clientPhoneNumber: [null],
      clientAddress: ['']
    });

    this.allocationForm = this.fb.group({
      empId: [null, Validators.required],
      projectId: [null, Validators.required],
      status: [true]
    });
  }

  private loadAll(): void {
    this.projectService.getProjects().subscribe({
      next: data => {
        queueMicrotask(() => {
          this.projects = data;
          this.projectsDataSource.data = data;
          this.projectsDataSource.paginator = this.projectPaginator;
          this.cdr.detectChanges();
        });
      }
    });

    this.projectService.getClients().subscribe({
      next: data => {
        queueMicrotask(() => {
          this.clients = data;
          this.clientsDataSource.data = data;
          this.clientsDataSource.paginator = this.clientPaginator;
          this.cdr.detectChanges();
        });
      }
    });

    this.employeeService.getAll().subscribe({
      next: data => {
        queueMicrotask(() => {
          this.employees = data;
          this.cdr.detectChanges();
        });
      }
    });

    this.projectService.getAllocations().subscribe({
      next: data => {
        queueMicrotask(() => {
          this.allocationsDataSource.data = data;
          this.allocationsDataSource.paginator = this.allocationPaginator;
          this.cdr.detectChanges();
        });
      }
    });
  }

  isAdminOrManager(): boolean {
    const role = this.authService.currentUserValue?.role.toLowerCase();
    return role === 'admin' || role === 'manager';
  }

  getProjectBadge(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'badge-active';
      case 'completed': return 'badge-approved';
      default: return 'badge-pending';
    }
  }

  onSaveProject(): void {
    if (this.projectForm.invalid) return;
    this.loading = true;

    const payload = {
      projectName: this.projectForm.value.projectName,
      clientId: this.projectForm.value.clientId,
      startDate: new Date(this.projectForm.value.startDate).toISOString(),
      endDate: new Date(this.projectForm.value.endDate).toISOString(),
      status: this.projectForm.value.status || 'Active'
    };

    const obs = this.editingProject
      ? this.projectService.updateProject(this.editingProject.projectId, payload)
      : this.projectService.createProject(payload);

    obs.subscribe({
      next: () => {
        this.snackBar.open(this.editingProject ? 'Project updated!' : 'Project created!', 'Close', { duration: 3000 });
        this.projectForm.reset({ status: 'Active', startDate: new Date(), endDate: new Date() });
        this.editingProject = null;
        this.loading = false;
        this.loadAll();
      },
      error: err => {
        this.loading = false;
        this.snackBar.open(err.error || 'Operation failed', 'Close', { duration: 4000 });
      }
    });
  }

  editProject(project: Project): void {
    this.editingProject = project;
    this.projectForm.patchValue({
      projectName: project.projectName,
      clientId: project.clientId,
      startDate: new Date(project.startDate),
      endDate: new Date(project.endDate),
      status: project.status
    });
  }

  cancelEdit(): void {
    this.editingProject = null;
    this.projectForm.reset({ status: 'Active', startDate: new Date(), endDate: new Date() });
  }

  deleteProject(project: Project): void {
    if (confirm(`Delete project "${project.projectName}"?`)) {
      this.projectService.deleteProject(project.projectId).subscribe({
        next: () => {
          this.snackBar.open('Project deleted!', 'Close', { duration: 3000 });
          this.loadAll();
        },
        error: err => this.snackBar.open(err.error || 'Delete failed', 'Close', { duration: 4000 })
      });
    }
  }

  onSaveClient(): void {
    if (this.clientForm.invalid) return;
    this.loading = true;

    if (this.editingClient) {
      this.projectService.updateClient(this.editingClient.clientId, this.clientForm.value).subscribe({
        next: () => {
          this.snackBar.open('Client updated!', 'Close', { duration: 3000 });
          this.cancelClientEdit();
          this.loadAll();
        },
        error: err => {
          this.loading = false;
          this.snackBar.open(err.error || 'Failed to update client', 'Close', { duration: 4000 });
        }
      });
    } else {
      this.projectService.createClient(this.clientForm.value).subscribe({
        next: () => {
          this.snackBar.open('Client added!', 'Close', { duration: 3000 });
          this.clientForm.reset();
          this.loading = false;
          this.loadAll();
        },
        error: err => {
          this.loading = false;
          this.snackBar.open(err.error || 'Failed to add client', 'Close', { duration: 4000 });
        }
      });
    }
  }

  editClient(client: Client): void {
    this.editingClient = client;
    this.clientForm.patchValue({
      clientName: client.clientName,
      clientLocation: client.clientLocation,
      clientPhoneNumber: client.clientPhoneNumber,
      clientAddress: client.clientAddress
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelClientEdit(): void {
    this.editingClient = null;
    this.clientForm.reset();
    this.loading = false;
  }

  deleteClient(client: Client): void {
    if (confirm(`Delete client "${client.clientName}"?`)) {
      this.projectService.deleteClient(client.clientId).subscribe({
        next: () => {
          this.snackBar.open('Client deleted!', 'Close', { duration: 3000 });
          this.loadAll();
        },
        error: err => this.snackBar.open(err.error || 'Delete failed', 'Close', { duration: 4000 })
      });
    }
  }

  onAllocate(): void {
    if (this.allocationForm.invalid) return;
    this.loading = true;
    const userId = this.authService.currentUserValue?.username || 'Admin';

    if (this.editingAllocation) {
      const payload = {
        empId: this.allocationForm.value.empId,
        projectId: this.allocationForm.value.projectId,
        status: this.allocationForm.value.status
      };
      this.projectService.updateAllocation(this.editingAllocation.allocationId, payload).subscribe({
        next: () => {
          this.snackBar.open('Allocation updated successfully!', 'Close', { duration: 3000 });
          this.cancelAllocationEdit();
          this.loadAll();
        },
        error: err => {
          this.loading = false;
          this.snackBar.open(err.error || 'Update failed', 'Close', { duration: 4000 });
        }
      });
    } else {
      const payload = { ...this.allocationForm.value, createdBy: userId };
      this.projectService.allocateEmployee(payload).subscribe({
        next: () => {
          this.snackBar.open('Employee allocated successfully!', 'Close', { duration: 3000 });
          this.allocationForm.reset({ status: true });
          this.loading = false;
          this.loadAll();
        },
        error: err => {
          this.loading = false;
          this.snackBar.open(err.error || 'Allocation failed', 'Close', { duration: 4000 });
        }
      });
    }
  }

  editAllocation(alloc: Allocation): void {
    this.editingAllocation = alloc;
    this.allocationForm.patchValue({
      empId: alloc.empId,
      projectId: alloc.projectId,
      status: alloc.status
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelAllocationEdit(): void {
    this.editingAllocation = null;
    this.allocationForm.reset({ status: true });
    this.loading = false;
  }

  deleteAllocation(alloc: Allocation): void {
    if (confirm('Delete this allocation?')) {
      this.projectService.deleteAllocation(alloc.allocationId).subscribe({
        next: () => {
          this.snackBar.open('Allocation deleted!', 'Close', { duration: 3000 });
          this.loadAll();
        },
        error: err => this.snackBar.open(err.error || 'Delete failed', 'Close', { duration: 4000 })
      });
    }
  }
}
