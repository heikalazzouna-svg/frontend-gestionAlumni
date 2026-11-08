import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from './event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = '/api/events';

  constructor(private http: HttpClient) {}

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl);
  }

  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/all`);
  }

  getEvent(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  createEvent(event: Partial<Event>): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, event);
  }

  updateEvent(id: number, event: Partial<Event>): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  registerParticipant(eventId: number, userId: number): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/${eventId}/register/${userId}`, {});
  }

  unregisterParticipant(eventId: number, userId: number): Observable<Event> {
    return this.http.delete<Event>(`${this.apiUrl}/${eventId}/unregister/${userId}`);
  }

  approveEvent(id: number): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectEvent(id: number): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}/reject`, {});
  }

  getPendingEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/pending`);
  }

  getUpcomingEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/upcoming`);
  }

  getEventsByParticipant(userId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/participant/${userId}`);
  }
}
