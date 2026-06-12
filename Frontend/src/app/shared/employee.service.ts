import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Employee {
  employeeId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  dob: string;
  doj: string;
  departmentName: string;
  roleName: string;
  status: string;
}

export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string; // M, F, O
  dob: string;
  doj: string;
  departmentId: number;
  roleId: number;
}

export interface UpdateEmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  departmentId: number;
  roleId: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Employee[]> {
    return this.http.get<Employee[]>('/api/Employee');
  }

  getById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`/api/Employee/${id}`);
  }

  create(employee: CreateEmployeeInput): Observable<any> {
    return this.http.post('/api/Employee', employee, { responseType: 'text' });
  }

  update(id: number, employee: UpdateEmployeeInput): Observable<any> {
    return this.http.put(`/api/Employee/${id}`, employee, { responseType: 'text' });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`/api/Employee/${id}`, { responseType: 'text' });
  }
}
