import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      const user = this.authService.currentUserValue;
      
      // Check if route is restricted by role
      if (route.data && route.data['roles']) {
        const requiredRoles: string[] = route.data['roles'];
        const userRole = user?.role || '';
        
        // Check if user has at least one of the required roles
        const hasRole = requiredRoles.some(role => role.toLowerCase() === userRole.toLowerCase());
        
        if (!hasRole) {
          // Role not authorized, redirect to dashboard
          this.router.navigate(['/dashboard']);
          return false;
        }
      }
      
      // Authorized
      return true;
    }

    // Not logged in, redirect to login page with returnUrl
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
