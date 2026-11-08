import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MentorshipService {
  private apiUrl = '/api/mentorship';
  private http = inject(HttpClient);

  // ── Requests ──────────────────────────────────────────

  submitRequest(request: Record<string, unknown>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/requests`, request);
  }

  getRequest(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/requests/${id}`);
  }

  getStudentRequests(studentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/requests/student/${studentId}`);
  }

  getAlumniRequests(alumniId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/requests/alumni/${alumniId}`);
  }

  updateRequestStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/requests/${id}/status`, null, { params: { status } });
  }

  cancelRequest(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/requests/${id}/cancel`, {});
  }

  completeRequest(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/requests/${id}/complete`, {});
  }

  // ── Sessions ──────────────────────────────────────────

  addSession(session: Record<string, unknown>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/sessions`, session);
  }

  getSessions(requestId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/requests/${requestId}/sessions`);
  }

  // ── Goals ─────────────────────────────────────────────

  createGoal(goal: Record<string, unknown>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/goals`, goal);
  }

  getGoals(requestId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/requests/${requestId}/goals`);
  }

  updateGoalStatus(goalId: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/goals/${goalId}/status`, { status });
  }

  // ── Evaluations ───────────────────────────────────────

  submitEvaluation(evaluation: Record<string, unknown>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/evaluations`, evaluation);
  }

  getEvaluations(requestId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/requests/${requestId}/evaluations`);
  }
}
