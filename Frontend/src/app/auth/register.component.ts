import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  template: `
    <div class="register-container fade-in">
      <div class="glass-card register-card">
        <div class="register-header">
          <h1 class="gradient-text">Register Account</h1>
          <p>Create credentials for WMS Enterprise</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="fill">
            <mat-label>Username</mat-label>
            <input matInput formControlName="username" placeholder="Choose username" autocomplete="username">

            <mat-error *ngIf="registerForm.get('username')?.hasError('required')">
              Username is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Choose password" autocomplete="new-password">
            <button mat-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              {{ hidePassword ? 'Show' : 'Hide' }}
            </button>
            <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
              Password is required
            </mat-error>
            <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
              Password must be at least 6 characters long
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Confirm Password</mat-label>
            <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" formControlName="confirmPassword" placeholder="Confirm password" autocomplete="new-password">
            <button mat-button matSuffix (click)="hideConfirmPassword = !hideConfirmPassword" type="button">
              {{ hideConfirmPassword ? 'Show' : 'Hide' }}
            </button>
            <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
              Confirm password is required
            </mat-error>
            <mat-error *ngIf="registerForm.hasError('passwordsMismatch')">
              Passwords do not match
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Role</mat-label>
            <mat-select formControlName="roleId">
              <mat-option [value]="1">Admin</mat-option>
              <mat-option [value]="2">Manager</mat-option>
              <mat-option [value]="3">Employee</mat-option>
            </mat-select>
            <mat-error *ngIf="registerForm.get('roleId')?.hasError('required')">
              Role is required
            </mat-error>
          </mat-form-field>

          <div class="form-actions">
            <button mat-raised-button class="btn-primary w-full" type="submit" [disabled]="loading || registerForm.invalid">
              <span *ngIf="!loading">Register</span>
              <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>
            </button>
          </div>
        </form>

        <div class="register-footer">
          <p>Already have an account? <a routerLink="/auth/login" class="login-link">Sign in here</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      width: 100vw;
      padding: 20px;
    }
    .register-card {
      width: 100%;
      max-width: 420px;
      padding: 40px 30px;
    }
    .register-header {
      text-align: center;
      margin-bottom: 30px;
    }
    .register-header h1 {
      font-size: 2.2rem;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .register-header p {
      color: var(--text-muted);
      font-size: 0.95rem;
    }
    .form-actions {
      margin-top: 24px;
    }
    .w-full {
      width: 100%;
    }
    .register-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .login-link {
      color: var(--secondary-color);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;
    }
    .login-link:hover {
      color: var(--primary-color);
      text-decoration: underline;
    }
  `],
  standalone: false
})
export class RegisterComponent implements OnInit, AfterViewInit {
  registerForm!: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      roleId: [3, Validators.required] // Default to Employee (RoleId=3)
    }, { validators: this.passwordMatchValidator });
  }

  ngAfterViewInit(): void {
    // Material form controls can settle state after initial check in dev mode.
    this.cdr.detectChanges();
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { passwordsMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.cdr.detectChanges();
    const registrationData = {
      username: this.registerForm.value.username,
      password: this.registerForm.value.password,
      roleId: this.registerForm.value.roleId
    };

    this.authService.register(registrationData).subscribe({
      next: () => {
        this.snackBar.open('Registration completed! You can now log in.', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });
        this.router.navigate(['/auth/login']);
      },
      error: err => {
        this.loading = false;
        this.cdr.detectChanges();
        const errMsg = err.error || 'Registration failed. Try a different username.';
        this.snackBar.open(errMsg, 'Close', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
    });
  }
}
