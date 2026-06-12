import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface UserState {
  userId: number;
  username: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'wms_token';
  private currentUserSubject = new BehaviorSubject<UserState | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadToken();
  }

  public get currentUserValue(): UserState | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<any>('/api/Auth/login', credentials).pipe(
      tap(response => {
        const token = response?.token ?? response?.Token;
        if (token) {
          this.setToken(token);
        }
      })
    );
  }

  register(user: { username: string; password: string; roleId: number }): Observable<any> {
    return this.http.post<any>('/api/Auth/register', user);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  public isLoggedIn(): boolean {
    return this.token !== null && !this.isTokenExpired();
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    const decoded = this.decodeToken(token);
    this.currentUserSubject.next(decoded);
  }

  private loadToken(): void {
    const token = this.token;
    if (token) {
      if (this.isTokenExpired()) {
        this.logout();
      } else {
        const decoded = this.decodeToken(token);
        this.currentUserSubject.next(decoded);
      }
    }
  }

  private decodeToken(token: string): UserState | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const decodedPayload = JSON.parse(atob(parts[1]));

      const userIdKey = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
      const usernameKey = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
      const roleKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

      return {
        userId: parseInt(decodedPayload[userIdKey] || decodedPayload['nameid'] || '0', 10),
        username: decodedPayload[usernameKey] || decodedPayload['unique_name'] || '',
        role: decodedPayload[roleKey] || decodedPayload['role'] || ''
      };
    } catch (e) {
      return null;
    }
  }

  private isTokenExpired(): boolean {
    const token = this.token;
    if (!token) return true;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const decodedPayload = JSON.parse(atob(parts[1]));
      if (!decodedPayload.exp) return false;
      const date = new Date(0);
      date.setUTCSeconds(decodedPayload.exp);
      return date.valueOf() < new Date().valueOf();
    } catch (e) {
      return true;
    }
  }
}
