import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
  private apiUrl = '/api/experience';
  private http = inject(HttpClient);

  postReview(review: Record<string, unknown>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reviews`, review);
  }

  getCompanyReviews(companyName: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reviews/company/${encodeURIComponent(companyName)}`).pipe(
      catchError(() => of([]))
    );
  }

  getAllCompanyReviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reviews/all`).pipe(
      catchError(() => of([]))
    );
  }

  postKnowledge(kb: Record<string, unknown>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/knowledge`, kb);
  }

  getKnowledgeByCategory(category: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/knowledge/category/${encodeURIComponent(category)}`).pipe(
      catchError(() => of([]))
    );
  }

  getKnowledgeByCompany(companyName: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/knowledge/company/${encodeURIComponent(companyName)}`).pipe(
      catchError(() => of([]))
    );
  }

  getAllKnowledgeBase(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/knowledge/all`).pipe(
      catchError(() => of([]))
    );
  }
}
