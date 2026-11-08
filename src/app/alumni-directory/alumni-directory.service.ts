import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface AlumniEntry {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  graduationYear: number;
  currentCompany: string;
  currentJob: string;
  speciality: string;
  sector: string;
  skills: string[];
  openToMentoring: boolean;
  willingToRefer: boolean;
  openToCareerAdvice: boolean;
  expertise: string;
  avatarUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class AlumniDirectoryService {
  private http = inject(HttpClient);
  private apiUrl = '/api/alumni/directory';

  getAll(): Observable<AlumniEntry[]> {
    return this.http.get<AlumniEntry[]>(this.apiUrl).pipe(
      catchError(() => of([]))
    );
  }

  search(filters: {
    query?: string;
    sector?: string;
    company?: string;
    graduationYear?: number;
    skill?: string;
  }): Observable<AlumniEntry[]> {
    let params = new HttpParams();
    if (filters.query) params = params.set('query', filters.query);
    if (filters.sector) params = params.set('sector', filters.sector);
    if (filters.company) params = params.set('company', filters.company);
    if (filters.graduationYear) params = params.set('graduationYear', filters.graduationYear.toString());
    if (filters.skill) params = params.set('skill', filters.skill);

    return this.http.get<AlumniEntry[]>(`${this.apiUrl}/search`, { params }).pipe(
      catchError(() => of([]))
    );
  }

  getById(id: number): Observable<AlumniEntry> {
    return this.http.get<AlumniEntry>(`${this.apiUrl}/${id}`);
  }
}
