import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Leave {
  leaveId: number;
  empId: number;
  leaveType: string; // Sick / Casual / Earned
  reason: string;
  fromDate: string;
  toDate: string;
  status: string; // Pending / Approved / Rejected
  appliedOn: string;
  approvedBy: number | null;
  approvedOn: string | null;
  employee?: {
    firstName: string;
    lastName: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Leave[]> {
    return this.http.get<Leave[]>('/api/Leave');
  }

  apply(leave: { empId: number; leaveType: string; reason: string; fromDate: string; toDate: string }): Observable<any> {
    return this.http.post('/api/Leave/apply', leave, { responseType: 'text' });
  }

  approve(leaveId: number, approvedBy: number): Observable<any> {
    return this.http.post('/api/Leave/approve', { leaveId, approvedBy }, { responseType: 'text' });
  }

  reject(leaveId: number, approvedBy: number): Observable<any> {
    return this.http.post('/api/Leave/reject', { leaveId, approvedBy }, { responseType: 'text' });
  }
}
