import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container fade-in">
      <div class="glass-card login-card">
        <div class="login-header">
          <h1 class="gradient-text">WMS Enterprise</h1>
          <p>Sign in to your dashboard</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="fill">
            <mat-label>Username</mat-label>
            <input matInput formControlName="username" placeholder="Enter username" autocomplete="username">

            <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
              Username is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Enter password" autocomplete="current-password">
            <button mat-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              {{ hidePassword ? 'Show' : 'Hide' }}
            </button>
            <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
              Password is required
            </mat-error>
          </mat-form-field>

          <div class="form-actions">
            <button mat-raised-button class="btn-primary w-full" type="submit" [disabled]="loading || !viewReady || loginForm.invalid">
              <span *ngIf="!loading">Sign In</span>
              <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>
            </button>
          </div>
        </form>

        <div class="login-footer">
          <p>Don't have an account? <a routerLink="/auth/register" class="register-link">Register here</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      width: 100vw;
      padding: 20px;
    }
    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 40px 30px;
    }
    .login-header {
      text-align: center;
      margin-bottom: 30px;
    }
    .login-header h1 {
      font-size: 2.2rem;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .login-header p {
      color: var(--text-muted);
      font-size: 0.95rem;
    }
    .form-actions {
      margin-top: 24px;
    }
    .w-full {
      width: 100%;
    }
    .login-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .register-link {
      color: var(--secondary-color);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;
    }
    .register-link:hover {
      color: var(--primary-color);
      text-decoration: underline;
    }
  `],
  standalone: false
})
export class LoginComponent implements OnInit, AfterViewInit {
  loginForm!: FormGroup;
  loading = false;
  viewReady = false;
  hidePassword = true;
  returnUrl = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  ngAfterViewInit(): void {
    // Avoid first-pass expression mismatch caused by autofill/form status settling.
    queueMicrotask(() => {
      this.viewReady = true;
      this.cdr.detectChanges();
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.cdr.detectChanges();
    const credentials = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.snackBar.open('Logged in successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });
        this.router.navigateByUrl(this.returnUrl);
      },
      error: err => {
        this.loading = false;
        this.cdr.detectChanges();
        const errMsg = err.error || 'Invalid username or password';
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
