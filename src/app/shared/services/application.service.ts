import { Injectable } from '@angular/core';

export interface Application {
  id: number;
  offerId?: number;
  offerTitle: string;
  offerCompany: string;
  offerLocation: string;
  offerType: string;
  studentName: string;
  studentEmail: string;
  cvFileName: string;
  cvFileSize: number;
  cvFileData: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
  studentAvatarUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {

  private readonly STORAGE_KEY = 'alumni_applications';

  getApplications(): Application[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  addApplication(app: Omit<Application, 'id' | 'status' | 'appliedAt'>): Application {
    const apps = this.getApplications();
    const newApp: Application = {
      ...app,
      id: Date.now(),
      status: 'pending',
      appliedAt: new Date().toISOString()
    };
    apps.push(newApp);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(apps));
    return newApp;
  }

  updateStatus(id: number, status: 'accepted' | 'rejected'): void {
    const apps = this.getApplications();
    const app = apps.find(a => a.id === id);
    if (app) {
      app.status = status;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(apps));
    }
  }

  getApplicationsByStudent(email: string): Application[] {
    return this.getApplications().filter(a => a.studentEmail === email);
  }

  getApplicationsByOffer(offerTitle: string, offerCompany: string): Application[] {
    return this.getApplications().filter(a => a.offerTitle === offerTitle && a.offerCompany === offerCompany);
  }

  getApplicationsByOfferId(offerId: number): Application[] {
    return this.getApplications().filter(a => a.offerId === offerId);
  }

  getApplicationCountByOfferId(offerId: number): number {
    return this.getApplicationsByOfferId(offerId).length;
  }

  hasApplied(email: string, offerTitle: string, offerCompany: string): Application | undefined {
    return this.getApplications().find(
      a => a.studentEmail === email && a.offerTitle === offerTitle && a.offerCompany === offerCompany
    );
  }

  hasAppliedById(email: string, offerId: number): Application | undefined {
    return this.getApplications().find(
      a => a.studentEmail === email && a.offerId === offerId
    );
  }
}
