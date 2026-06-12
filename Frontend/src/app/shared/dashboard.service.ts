import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalEmployees: number;
  totalDepartments: number;
  totalProjects: number;
  pendingLeaves: number;
  presentToday: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>('/api/Dashboard');
  }
}
