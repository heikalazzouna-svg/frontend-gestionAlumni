import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationService, Application } from '../../shared/services/application.service';

@Component({
  selector: 'app-recruiter-applications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Candidatures reçues</h1>
        <p class="subtitle">Consultez et gérez les candidatures des étudiants</p>
      </div>
      <div class="filters">
        <button class="filter-btn" [class.active]="activeFilter === 'all'" (click)="filter('all')">
          Toutes <span class="badge">{{ allApps.length }}</span>
        </button>
        <button class="filter-btn pending" [class.active]="activeFilter === 'pending'" (click)="filter('pending')">
          En attente <span class="badge">{{ pendingCount }}</span>
        </button>
        <button class="filter-btn accepted" [class.active]="activeFilter === 'accepted'" (click)="filter('accepted')">
          Acceptées <span class="badge">{{ acceptedCount }}</span>
        </button>
        <button class="filter-btn rejected" [class.active]="activeFilter === 'rejected'" (click)="filter('rejected')">
          Refusées <span class="badge">{{ rejectedCount }}</span>
        </button>
      </div>
    </div>

    <div class="apps-list" *ngIf="filteredApps.length > 0">
      <div class="app-card" *ngFor="let app of filteredApps" [class.accepted]="app.status === 'accepted'" [class.rejected]="app.status === 'rejected'">
        <div class="app-left">
          <div class="avatar">
            <img *ngIf="app.studentAvatarUrl" [src]="app.studentAvatarUrl" [alt]="app.studentName" class="avatar-img" />
            <span *ngIf="!app.studentAvatarUrl">{{ app.studentName.charAt(0) }}</span>
          </div>
          <div class="app-info">
            <div class="student-name">{{ app.studentName }}</div>
            <div class="student-email">{{ app.studentEmail }}</div>
            <div class="offer-ref">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              {{ app.offerTitle }} &mdash; {{ app.offerCompany }}
            </div>
            <div class="app-details">
              <button class="btn-cv" (click)="viewCv(app)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Voir CV &mdash; {{ app.cvFileName }} ({{ formatSize(app.cvFileSize) }})
              </button>
              <span class="detail">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {{ formatDate(app.appliedAt) }}
              </span>
            </div>
            <div class="app-message" *ngIf="app.message">
              <em>&laquo; {{ app.message }} &raquo;</em>
            </div>
          </div>
        </div>

        <div class="app-right">
          <div class="status-badge" [ngClass]="app.status">
            {{ app.status === 'pending' ? 'En attente' : app.status === 'accepted' ? 'Acceptée' : 'Refusée' }}
          </div>

          <div class="action-buttons" *ngIf="app.status === 'pending'">
            <button class="btn-accept" (click)="accept(app)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Accepter
            </button>
            <button class="btn-reject" (click)="reject(app)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Refuser
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="filteredApps.length === 0">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#b2bec3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
      <h3>Aucune candidature</h3>
      <p>{{ activeFilter === 'all' ? 'Aucune candidature reçue pour le moment.' : 'Aucune candidature dans cette catégorie.' }}</p>
    </div>

    <!-- Toast -->
    <div class="toast" *ngIf="toast" [ngClass]="toastType">
      {{ toast }}
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 28px; }
    .page-header h1 { font-size: 1.8rem; font-weight: 800; color: #2d3436; margin: 0 0 4px; }
    .subtitle { color: #636e72; font-size: 0.95rem; margin: 0 0 20px; }
    .filters { display: flex; gap: 10px; flex-wrap: wrap; }
    .filter-btn {
      background: #f5f6fa; border: 1px solid #e8ecf1; color: #636e72;
      padding: 8px 16px; border-radius: 10px; cursor: pointer;
      font-weight: 600; font-size: 0.85rem; transition: all 0.2s;
      display: flex; align-items: center; gap: 6px;
    }
    .filter-btn.active { background: #6C5CE7; color: #fff; border-color: #6C5CE7; }
    .filter-btn.pending.active { background: #f39c12; border-color: #f39c12; }
    .filter-btn.accepted.active { background: #27ae60; border-color: #27ae60; }
    .filter-btn.rejected.active { background: #e74c3c; border-color: #e74c3c; }
    .badge {
      background: rgba(255,255,255,0.25); padding: 1px 8px;
      border-radius: 10px; font-size: 0.75rem;
    }

    .apps-list { display: flex; flex-direction: column; gap: 16px; }

    .app-card {
      background: #fff; border: 1px solid #e8ecf1; border-radius: 16px;
      padding: 20px 24px; display: flex; justify-content: space-between;
      align-items: flex-start; gap: 20px; transition: all 0.2s;
    }
    .app-card:hover { box-shadow: 0 4px 20px rgba(108, 92, 231, 0.06); }
    .app-card.accepted { border-left: 4px solid #27ae60; }
    .app-card.rejected { border-left: 4px solid #e74c3c; }

    .app-left { display: flex; gap: 16px; flex: 1; }

    .avatar {
      width: 48px; height: 48px; border-radius: 14px;
      background: linear-gradient(135deg, #6C5CE7, #a29bfe);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 1.2rem; flex-shrink: 0;
      overflow: hidden;
    }
    .avatar-img {
      width: 100%; height: 100%; object-fit: cover;
    }

    .app-info { flex: 1; }
    .student-name { font-weight: 700; font-size: 1rem; color: #2d3436; margin-bottom: 2px; }
    .student-email { font-size: 0.8rem; color: #b2bec3; margin-bottom: 8px; }

    .offer-ref {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.85rem; font-weight: 600; color: #6C5CE7;
      margin-bottom: 6px;
    }

    .app-details {
      display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 6px;
    }
    .btn-cv {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.8rem; color: #6C5CE7; font-weight: 600;
      background: #f0efff; border: 1px solid #e0dbff;
      padding: 6px 14px; border-radius: 8px;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-cv:hover { background: #e0dbff; }
    .detail {
      display: flex; align-items: center; gap: 4px;
      font-size: 0.8rem; color: #636e72;
    }

    .app-message {
      font-size: 0.85rem; color: #636e72;
      background: #f8f9fa; padding: 8px 12px; border-radius: 8px;
      margin-top: 8px; line-height: 1.4;
    }

    .app-right {
      display: flex; flex-direction: column; align-items: flex-end;
      gap: 12px; flex-shrink: 0;
    }

    .status-badge {
      padding: 6px 14px; border-radius: 8px; font-weight: 700;
      font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.3px;
    }
    .status-badge.pending { background: #fff3e0; color: #f39c12; }
    .status-badge.accepted { background: #e8f5e9; color: #27ae60; }
    .status-badge.rejected { background: #fce4ec; color: #e74c3c; }

    .action-buttons { display: flex; gap: 8px; }
    .btn-accept {
      display: flex; align-items: center; gap: 6px;
      background: #27ae60; color: #fff; border: none;
      padding: 8px 16px; border-radius: 10px; font-weight: 700;
      font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
    }
    .btn-accept:hover { background: #219a52; transform: translateY(-1px); }
    .btn-reject {
      display: flex; align-items: center; gap: 6px;
      background: transparent; color: #e74c3c; border: 1px solid #e74c3c;
      padding: 8px 16px; border-radius: 10px; font-weight: 700;
      font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
    }
    .btn-reject:hover { background: #e74c3c; color: #fff; }

    .empty-state {
      text-align: center; padding: 60px 20px; color: #636e72;
    }
    .empty-state h3 { color: #2d3436; margin: 16px 0 8px; }
    .empty-state p { margin: 0; }

    .toast {
      position: fixed; bottom: 24px; right: 24px; z-index: 2000;
      padding: 14px 24px; border-radius: 14px; font-weight: 700;
      font-size: 0.9rem; color: #fff;
      animation: slideUp 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }
    .toast.success { background: #27ae60; }
    .toast.error { background: #e74c3c; }

    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
  `]
})
export class RecruiterApplicationsComponent implements OnInit {

  private appService = inject(ApplicationService);

  allApps: Application[] = [];
  filteredApps: Application[] = [];
  activeFilter = 'all';
  toast = '';
  toastType = 'success';

  get pendingCount(): number { return this.allApps.filter(a => a.status === 'pending').length; }
  get acceptedCount(): number { return this.allApps.filter(a => a.status === 'accepted').length; }
  get rejectedCount(): number { return this.allApps.filter(a => a.status === 'rejected').length; }

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.allApps = this.appService.getApplications().sort(
      (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
    );
    this.applyFilter();
  }

  filter(status: string): void {
    this.activeFilter = status;
    this.applyFilter();
  }

  private applyFilter(): void {
    this.filteredApps = this.activeFilter === 'all'
      ? [...this.allApps]
      : this.allApps.filter(a => a.status === this.activeFilter);
  }

  accept(app: Application): void {
    this.appService.updateStatus(app.id, 'accepted');
    this.loadApplications();
    this.showToast('Candidature acceptée !', 'success');
  }

  reject(app: Application): void {
    this.appService.updateStatus(app.id, 'rejected');
    this.loadApplications();
    this.showToast('Candidature refusée.', 'error');
  }

  viewCv(app: Application): void {
    if (!app.cvFileData) {
      this.showToast('Aucun CV disponible. L\'étudiant doit re-postuler pour joindre son CV.', 'error');
      return;
    }

    // Convert base64 data URL to Blob
    const parts = app.cvFileData.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mime });
    const blobUrl = URL.createObjectURL(blob);

    if (mime === 'application/pdf') {
      window.open(blobUrl, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = app.cvFileName;
      link.click();
      URL.revokeObjectURL(blobUrl);
    }
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  private showToast(msg: string, type: string): void {
    this.toast = msg;
    this.toastType = type;
    setTimeout(() => { this.toast = ''; }, 3000);
  }
}
