import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

/** Aligné sur AlumniAdminSummaryDTO (Spring). */
export interface AlumniAdminSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  graduationYear: number | null;
  speciality: string | null;
  verified: boolean;
  avatarUrl?: string;
}

/** Aligné sur StudentAdminSummaryDTO (Spring). */
export interface StudentAdminSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  speciality: string | null;
  predictedGradYear: number | null;
  avatarUrl?: string;
}

export interface AdminUsersListsPayload {
  pending: AlumniAdminSummary[];
  verified: AlumniAdminSummary[];
  students: StudentAdminSummary[];
}

@Injectable({ providedIn: 'root' })
export class AdminUsersApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/admin';

  loadAll(): Observable<AdminUsersListsPayload> {
    return forkJoin({
      pending: this.http.get<AlumniAdminSummary[]>(`${this.base}/alumni/pending`),
      verified: this.http.get<AlumniAdminSummary[]>(`${this.base}/alumni/verified`),
      students: this.http.get<StudentAdminSummary[]>(`${this.base}/students`)
    });
  }

  approveAlumni(id: number): Observable<unknown> {
    return this.http.put(`${this.base}/approve/${id}`, {});
  }

  rejectAlumni(id: number): Observable<string> {
    return this.http.delete(`${this.base}/reject/${id}`, { responseType: 'text' });
  }
}
