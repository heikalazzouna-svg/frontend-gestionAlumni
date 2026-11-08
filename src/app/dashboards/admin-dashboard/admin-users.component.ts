import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import {
  AdminUsersApiService,
  AlumniAdminSummary,
  StudentAdminSummary
} from '../../shared/services/admin-users-api.service';

type AdminTab = 'pending' | 'verified' | 'students';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1>Gestion des Utilisateurs</h1>
      <div class="tabs" role="tablist">
        <button
          type="button"
          role="tab"
          class="tab-btn"
          [disabled]="isLoading"
          [class.active]="activeTab === 'pending'"
          (click)="setTab('pending')">
          Attente d'approbation
          <span class="tab-count">{{ pendingAlumni.length }}</span>
        </button>
        <button
          type="button"
          role="tab"
          class="tab-btn"
          [disabled]="isLoading"
          [class.active]="activeTab === 'verified'"
          (click)="setTab('verified')">
          Alumni vérifiés
          <span class="tab-count verified">{{ verifiedAlumni.length }}</span>
        </button>
        <button
          type="button"
          role="tab"
          class="tab-btn"
          [disabled]="isLoading"
          [class.active]="activeTab === 'students'"
          (click)="setTab('students')">
          Étudiants
          <span class="tab-count">{{ students.length }}</span>
        </button>
      </div>
    </div>

    <div class="flash" *ngIf="flashMessage" [class.error]="flashIsError">
      {{ flashMessage }}
    </div>

    <div class="loading-bar" *ngIf="isLoading">
      <span class="spinner"></span> Chargement depuis le serveur…
    </div>

    <p class="api-hint" *ngIf="!isLoading && !listLoadError">
      Données synchronisées avec l’API <code>/api/admin</code> (backend Java).
    </p>

    <!-- Pending alumni -->
    <ng-container *ngIf="activeTab === 'pending'">
      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Type / Promo</th>
              <th>Spécialité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of pendingAlumni">
              <td>
                <div class="user-cell">
                  <div class="avatar">
                    <img *ngIf="user.avatarUrl" [src]="user.avatarUrl" [alt]="user.firstName" class="avatar-img" />
                    <span *ngIf="!user.avatarUrl">{{ user.firstName.charAt(0) }}</span>
                  </div>
                  <div class="info">
                    <p class="name">{{ user.firstName }} {{ user.lastName }}</p>
                    <p class="email">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td>Alumni ({{ user.graduationYear ?? '—' }})</td>
              <td>{{ user.speciality || '—' }}</td>
              <td>
                <div class="actions">
                  <button
                    type="button"
                    class="approve-btn"
                    [disabled]="actionPending"
                    (click)="approve(user)">Approuver</button>
                  <button
                    type="button"
                    class="reject-btn"
                    [disabled]="actionPending"
                    (click)="reject(user)">Rejeter</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="!isLoading && !listLoadError && pendingAlumni.length === 0">
              <td colspan="4" class="empty-state">Aucun alumni en attente d'approbation.</td>
            </tr>
            <tr *ngIf="listLoadError && !isLoading">
              <td colspan="4" class="empty-state error-state">{{ listLoadError }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </ng-container>

    <!-- Verified alumni -->
    <ng-container *ngIf="activeTab === 'verified'">
      <div class="data-table-container">
        <p class="tab-hint" *ngIf="verifiedAlumni.length > 0">
          Comptes alumni validés en base (champ <code>verified = true</code>).
        </p>
        <table class="data-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Promo</th>
              <th>Spécialité</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of verifiedAlumni">
              <td>
                <div class="user-cell">
                  <div class="avatar verified">
                    <img *ngIf="user.avatarUrl" [src]="user.avatarUrl" [alt]="user.firstName" class="avatar-img" />
                    <span *ngIf="!user.avatarUrl">{{ user.firstName.charAt(0) }}</span>
                  </div>
                  <div class="info">
                    <p class="name">{{ user.firstName }} {{ user.lastName }}</p>
                    <p class="email">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td>{{ user.graduationYear ?? '—' }}</td>
              <td>{{ user.speciality || '—' }}</td>
              <td><span class="status-pill">Compte actif</span></td>
            </tr>
            <tr *ngIf="!isLoading && !listLoadError && verifiedAlumni.length === 0">
              <td colspan="4" class="empty-state">Aucun alumni vérifié pour le moment. Approuvez une demande dans l'onglet « Attente ».</td>
            </tr>
            <tr *ngIf="listLoadError && !isLoading">
              <td colspan="4" class="empty-state error-state">{{ listLoadError }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </ng-container>

    <!-- Students -->
    <ng-container *ngIf="activeTab === 'students'">
      <div class="data-table-container">
        <p class="tab-hint">Étudiants enregistrés dans la base (API).</p>
        <table class="data-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Spécialité</th>
              <th>Promo prévue</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of students">
              <td>
                <div class="user-cell">
                  <div class="avatar student">
                    <img *ngIf="s.avatarUrl" [src]="s.avatarUrl" [alt]="s.firstName" class="avatar-img" />
                    <span *ngIf="!s.avatarUrl">{{ s.firstName.charAt(0) }}</span>
                  </div>
                  <div class="info">
                    <p class="name">{{ s.firstName }} {{ s.lastName }}</p>
                  </div>
                </div>
              </td>
              <td>{{ s.email }}</td>
              <td>{{ s.speciality || '—' }}</td>
              <td class="muted">{{ s.predictedGradYear ?? '—' }}</td>
            </tr>
            <tr *ngIf="!isLoading && !listLoadError && students.length === 0">
              <td colspan="4" class="empty-state">Aucun étudiant en base.</td>
            </tr>
            <tr *ngIf="listLoadError && !isLoading">
              <td colspan="4" class="empty-state error-state">{{ listLoadError }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </ng-container>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 1.75rem; font-weight: 800; margin-bottom: 16px; }
    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .tab-btn {
      background: transparent;
      border: none;
      color: #718096;
      padding: 12px 4px;
      font-weight: 600;
      cursor: pointer;
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .tab-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .tab-btn.active { color: #fff; }
    .tab-btn.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 100%;
      height: 2px;
      background: #FF6B2D;
    }
    .tab-count {
      font-size: 0.75rem;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.08);
      color: #a0aec0;
      padding: 2px 8px;
      border-radius: 999px;
    }
    .tab-count.verified { background: rgba(72, 187, 120, 0.15); color: #48BB78; }
    .loading-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      color: #a0aec0;
      font-size: 0.9rem;
    }
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.15);
      border-top-color: #FF6B2D;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .api-hint {
      font-size: 0.8rem;
      color: #718096;
      margin: 0 0 16px;
    }
    .api-hint code { font-size: 0.75rem; background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; }
    .flash {
      margin-bottom: 16px;
      padding: 12px 16px;
      border-radius: 12px;
      background: rgba(72, 187, 120, 0.12);
      border: 1px solid rgba(72, 187, 120, 0.25);
      color: #48BB78;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .flash.error {
      background: rgba(245, 101, 101, 0.12);
      border-color: rgba(245, 101, 101, 0.25);
      color: #F56565;
    }
    .tab-hint { margin: 0 0 12px; font-size: 0.85rem; color: #718096; padding: 0 4px; }
    .tab-hint code { font-size: 0.78rem; }

    .data-table-container {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      overflow: hidden;
    }

    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th { padding: 16px 24px; background: rgba(255, 255, 255, 0.03); font-size: 0.85rem; color: #718096; font-weight: 600; text-transform: uppercase; }
    .data-table td { padding: 20px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.03); }
    .data-table td.muted { color: #718096; font-size: 0.9rem; }

    .status-pill {
      display: inline-block;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 999px;
      background: rgba(72, 187, 120, 0.15);
      color: #48BB78;
    }

    .user-cell { display: flex; align-items: center; gap: 12px; }
    .avatar {
      width: 36px;
      height: 36px;
      background: #4A90E2;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      overflow: hidden;
    }
    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .avatar.verified { background: linear-gradient(135deg, #48BB78, #2f855a); }
    .avatar.student { background: linear-gradient(135deg, #805ad5, #553c9a); }
    .name { margin: 0; font-weight: 600; font-size: 0.95rem; }
    .email { margin: 0; font-size: 0.8rem; color: #718096; }

    .actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .approve-btn, .reject-btn {
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .approve-btn:disabled, .reject-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .approve-btn { background: rgba(72, 187, 120, 0.1); border: 1px solid rgba(72, 187, 120, 0.2); color: #48BB78; }
    .approve-btn:hover:not(:disabled) { background: #48BB78; color: #fff; }
    .reject-btn { background: rgba(245, 101, 101, 0.1); border: 1px solid rgba(245, 101, 101, 0.2); color: #F56565; }
    .reject-btn:hover:not(:disabled) { background: #F56565; color: #fff; }

    .empty-state { text-align: center; color: #718096; padding: 40px !important; }
    .error-state { color: #F56565; }
  `]
})
export class AdminUserManagementComponent implements OnInit {
  activeTab: AdminTab = 'pending';
  pendingAlumni: AlumniAdminSummary[] = [];
  verifiedAlumni: AlumniAdminSummary[] = [];
  students: StudentAdminSummary[] = [];
  isLoading = false;
  actionPending = false;
  listLoadError = '';
  flashMessage = '';
  flashIsError = false;

  private adminApi = inject(AdminUsersApiService);
  private flashTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.reload();
  }

  setTab(tab: AdminTab): void {
    this.activeTab = tab;
  }

  approve(user: AlumniAdminSummary): void {
    this.actionPending = true;
    this.adminApi.approveAlumni(user.id).pipe(
      finalize(() => { this.actionPending = false; })
    ).subscribe({
      next: () => {
        this.showFlash(`« ${user.firstName} ${user.lastName} » est maintenant alumni vérifié.`, false);
        this.reload();
      },
      error: (err) => this.showFlash(this.errMsg(err), true)
    });
  }

  reject(user: AlumniAdminSummary): void {
    this.actionPending = true;
    this.adminApi.rejectAlumni(user.id).pipe(
      finalize(() => { this.actionPending = false; })
    ).subscribe({
      next: () => {
        this.showFlash(`Demande de « ${user.firstName} ${user.lastName} » rejetée (compte supprimé).`, false);
        this.reload();
      },
      error: (err) => this.showFlash(this.errMsg(err), true)
    });
  }

  private reload(): void {
    this.listLoadError = '';
    this.isLoading = true;
    this.adminApi.loadAll().pipe(
      finalize(() => { this.isLoading = false; })
    ).subscribe({
      next: (data) => {
        this.pendingAlumni = data.pending;
        this.verifiedAlumni = data.verified;
        this.students = data.students;
      },
      error: (err) => {
        this.pendingAlumni = [];
        this.verifiedAlumni = [];
        this.students = [];
        this.listLoadError = this.errMsg(err);
        this.showFlash(this.listLoadError, true);
      }
    });
  }

  private errMsg(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const e = (err as { error?: unknown }).error;
      if (typeof e === 'string' && e.trim()) return e;
    }
    return 'Impossible de joindre le serveur. Démarrez le backend Spring (port 8081) et utilisez « ng serve » avec le proxy.';
  }

  private showFlash(message: string, isError: boolean): void {
    if (this.flashTimer) {
      clearTimeout(this.flashTimer);
    }
    this.flashMessage = message;
    this.flashIsError = isError;
    this.flashTimer = setTimeout(() => {
      this.flashMessage = '';
      this.flashTimer = null;
    }, 5000);
  }
}
