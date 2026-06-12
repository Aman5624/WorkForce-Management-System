import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Department {
  departmentId?: number;
  departmentName: string;
  description?: string;
  createdOn?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  constructor(private http: HttpClient) {}

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>('/api/Department');
  }

  createDepartment(department: Department): Observable<any> {
    return this.http.post('/api/Department', department, { responseType: 'text' });
  }

  updateDepartment(id: number, department: Department): Observable<any> {
    return this.http.put(`/api/Department/${id}`, department, { responseType: 'text' });
  }

  deleteDepartment(id: number): Observable<any> {
    return this.http.delete(`/api/Department/${id}`, { responseType: 'text' });
  }
}
