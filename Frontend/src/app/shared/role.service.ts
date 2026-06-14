import { environment } from '../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Role {
  roleId: number;
  roleName: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/Role`;

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  createRole(role: { roleName: string }): Observable<any> {
    return this.http.post(this.apiUrl, role, { responseType: 'text' });
  }

  updateRole(id: number, role: { roleId?: number, roleName: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, role, { responseType: 'text' });
  }

  deleteRole(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}
