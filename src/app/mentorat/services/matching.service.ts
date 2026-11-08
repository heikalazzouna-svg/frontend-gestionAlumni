import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MatchingService {
  private apiUrl = '/api/alumni';
  private http = inject(HttpClient);

  searchAlumni(filters: Record<string, string>): Observable<any[]> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      const normalized = (value ?? '').trim();
      if (normalized) {
        params = params.set(key, normalized);
      }
    });

    return this.http.get<any[]>(`${this.apiUrl}/mentors/search`, { params }).pipe(
      catchError(() => of([]))
    );
  }

  getTopMentors(limit = 6): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mentors/top-rated`, { params: { limit } }).pipe(
      catchError(() => of([]))
    );
  }

  getAlumniProfile(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/directory/${id}`);
  }
}
