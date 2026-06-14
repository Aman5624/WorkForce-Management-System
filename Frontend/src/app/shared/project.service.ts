import { environment } from '../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Project {
  projectId: number;
  projectName: string;
  clientId?: number;
  clientName?: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface Client {
  clientId: number;
  clientName: string;
  clientAddress?: string;
  clientPhoneNumber?: string;
  clientLocation?: string;
  status?: boolean;
}

export interface Allocation {
  allocationId: number;
  empId: number;
  projectId: number;
  assignedOn: string;
  status: boolean;
  employeeName?: string;
  projectName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  constructor(private http: HttpClient) {}

  // Project Endpoints
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${environment.apiUrl}/Project`);
  }

  createProject(project: { projectName: string; clientId: number; startDate: string; endDate: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Project`, project, { responseType: 'text' });
  }

  updateProject(id: number, project: { projectName: string; clientId: number; startDate: string; endDate: string; status: string }): Observable<any> {
    return this.http.put(`${environment.apiUrl}/Project/${id}`, project, { responseType: 'text' });
  }

  deleteProject(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/Project/${id}`, { responseType: 'text' });
  }

  // Client Endpoints
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${environment.apiUrl}/Client`);
  }

  createClient(client: { clientName: string; clientAddress?: string; clientPhoneNumber?: string; clientLocation?: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Client`, client, { responseType: 'text' });
  }

  updateClient(id: number, client: { clientName: string; clientAddress?: string; clientPhoneNumber?: string; clientLocation?: string }): Observable<any> {
    return this.http.put(`${environment.apiUrl}/Client/${id}`, client, { responseType: 'text' });
  }

  deleteClient(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/Client/${id}`, { responseType: 'text' });
  }

  // Allocation Endpoints
  getAllocations(): Observable<Allocation[]> {
    return this.http.get<Allocation[]>(`${environment.apiUrl}/Allocation`);
  }

  allocateEmployee(allocation: { empId: number; projectId: number; createdBy: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Allocation`, allocation, { responseType: 'text' });
  }

  updateAllocation(id: number, allocation: { empId: number; projectId: number; status: boolean }): Observable<any> {
    return this.http.put(`${environment.apiUrl}/Allocation/${id}`, allocation, { responseType: 'text' });
  }

  deleteAllocation(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/Allocation/${id}`, { responseType: 'text' });
  }
}
