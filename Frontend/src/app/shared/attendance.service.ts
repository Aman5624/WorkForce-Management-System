import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Attendance {
  attendanceId: number;
  empId: number;
  checkIn: string;
  checkOut: string | null;
  totalHours: number | null;
  workMode: string;
  attendanceDate: string;
  employee?: {
    firstName: string;
    lastName: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Attendance[]> {
    return this.http.get<Attendance[]>('/api/Attendance');
  }

  checkIn(empId: number, workMode: string): Observable<any> {
    return this.http.post('/api/Attendance/checkin', { empId, workMode }, { responseType: 'text' });
  }

  checkOut(attendanceId: number): Observable<any> {
    return this.http.post('/api/Attendance/checkout', { attendanceId }, { responseType: 'text' });
  }
}
