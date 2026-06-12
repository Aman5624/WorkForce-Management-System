import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Announcement {
  announcementId: number;
  title: string;
  message: string;
  createdBy: number;
  createdOn: string;
  isActive: boolean;
}

export interface CreateAnnouncementDto {
  title: string;
  message: string;
  createdBy: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private apiUrl = '/api/Announcement';

  constructor(private http: HttpClient) {}

  getAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(this.apiUrl);
  }

  createAnnouncement(announcement: CreateAnnouncementDto): Observable<any> {
    return this.http.post(this.apiUrl, announcement, { responseType: 'text' });
  }

  updateAnnouncement(id: number, announcement: CreateAnnouncementDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, announcement, { responseType: 'text' });
  }

  deleteAnnouncement(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}
