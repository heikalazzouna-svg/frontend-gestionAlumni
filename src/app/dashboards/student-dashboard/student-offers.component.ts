import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../shared/services/application.service';
import { AuthService } from '../../shared/services/auth.service';
import { OfferService } from '../../shared/services/offer.service';
import { Offer, OfferType } from '../../shared/models/offer.model';

interface StudentOffer extends Offer {
  applicationStatus?: 'pending' | 'accepted' | 'rejected';
}

@Component({
  selector: 'app-student-offers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Offres de Stage & Emploi</h1>
      <div class="filters">
        <button class="filter-btn" [class.active]="activeFilter === 'all'" (click)="filterOffers('all')">Tout</button>
        <button class="filter-btn" [class.active]="activeFilter === 'Stage'" (click)="filterOffers('Stage')">Stages</button>
        <button class="filter-btn" [class.active]="activeFilter === 'CDI'" (click)="filterOffers('CDI')">CDI</button>
        <button class="filter-btn" [class.active]="activeFilter === 'CDD'" (click)="filterOffers('CDD')">CDD</button>
        <button class="filter-btn" [class.active]="activeFilter === 'Alternance'" (click)="filterOffers('Alternance')">Alternance</button>
        <button class="filter-btn" [class.active]="activeFilter === 'Freelance'" (click)="filterOffers('Freelance')">Freelance</button>
      </div>
    </div>

    <div class="offers-grid" *ngIf="filteredOffers.length > 0">
      <div class="offer-card" *ngFor="let offer of filteredOffers">
        <div class="offer-badge">{{ offer.type }}</div>
        <div class="offer-main">
          <div class="company-logo">{{ offer.company.charAt(0) }}</div>
          <div class="offer-info">
            <h3>{{ offer.title }}</h3>
            <p class="company">{{ offer.company }} &bull; {{ offer.location }}</p>
          </div>
        </div>
        <p class="offer-desc">{{ offer.description }}</p>
        <div class="offer-tags">
          <span *ngFor="let skill of offer.skillsList">{{ skill }}</span>
        </div>
        <div class="offer-footer">
          <span class="date">{{ offerService.formatDate(offer.postedDate) }}</span>
          <button class="apply-btn" *ngIf="!offer.applicationStatus" (click)="openApplyModal(offer)">Postuler</button>
          <span class="status-pending" *ngIf="offer.applicationStatus === 'pending'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            En attente
          </span>
          <span class="status-accepted" *ngIf="offer.applicationStatus === 'accepted'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Acceptée
          </span>
          <span class="status-rejected" *ngIf="offer.applicationStatus === 'rejected'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Refusée
          </span>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="filteredOffers.length === 0">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4A90E2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
      </div>
      <h3>Aucune offre disponible</h3>
      <p *ngIf="activeFilter === 'all'">Les offres approuvées par l'administration apparaîtront ici.</p>
      <p *ngIf="activeFilter !== 'all'">Aucune offre de type {{ activeFilter }} pour le moment.</p>
    </div>

    <!-- APPLY MODAL -->
    <div class="modal-overlay" *ngIf="applyModal" (click)="closeApplyModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button class="modal-close" (click)="closeApplyModal()">&times;</button>

        <div class="modal-header">
          <div class="modal-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A90E2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <h2>Postuler à cette offre</h2>
        </div>

        <div class="apply-offer-summary" *ngIf="selectedOffer">
          <div class="aos-logo">{{ selectedOffer.company.charAt(0) }}</div>
          <div>
            <div class="aos-title">{{ selectedOffer.title }}</div>
            <div class="aos-company">{{ selectedOffer.company }} &bull; {{ selectedOffer.location }}</div>
          </div>
        </div>

        <!-- CV Upload zone -->
        <div class="upload-section">
          <label class="upload-label">
            <svg class="label-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.49"/></svg>
            Votre CV (PDF, DOC, DOCX)
          </label>

          <div class="upload-zone"
               [class.has-file]="cvFile"
               [class.drag-over]="isDragging"
               (dragover)="onDragOver($event)"
               (dragleave)="onDragLeave($event)"
               (drop)="onDrop($event)"
               (click)="fileInput.click()">

            <input #fileInput type="file" accept=".pdf,.doc,.docx" (change)="onFileSelected($event)" hidden>

            <ng-container *ngIf="!cvFile">
              <div class="upload-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4A90E2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/></svg>
              </div>
              <div class="upload-text">
                Glissez votre CV ici ou <span class="upload-link">parcourez</span>
              </div>
              <div class="upload-hint">PDF, DOC ou DOCX · Max 5 Mo</div>
            </ng-container>

            <ng-container *ngIf="cvFile">
              <div class="file-preview">
                <div class="file-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#48BB78" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <div class="file-info">
                  <div class="file-name">{{ cvFile.name }}</div>
                  <div class="file-size">{{ formatSize(cvFile.size) }}</div>
                </div>
                <button class="file-remove" (click)="removeCv($event)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </ng-container>
          </div>
          <div class="upload-error" *ngIf="uploadError">{{ uploadError }}</div>
        </div>

        <!-- Message -->
        <div class="message-section">
          <label class="upload-label">
            <svg class="label-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Message (optionnel)
          </label>
          <textarea class="apply-message" [(ngModel)]="applyMessage"
                    placeholder="Ajoutez un court message de motivation..." rows="3"></textarea>
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <button class="btn-cancel" (click)="closeApplyModal()">Annuler</button>
          <button class="btn-send" [disabled]="!cvFile || isSending" (click)="submitApplication()">
            <span *ngIf="!isSending">
              <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Envoyer ma candidature
            </span>
            <span *ngIf="isSending">Envoi en cours...</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div class="toast" *ngIf="toast" [class.show]="toast">
      <svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#48BB78" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      {{ toast }}
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
    .page-header h1 { font-size: 1.75rem; font-weight: 800; margin: 0; }
    .filters { display: flex; gap: 8px; flex-wrap: wrap; }
    .filter-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #718096;
      padding: 8px 16px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
      font-size: 0.85rem;
    }
    .filter-btn.active { background: #4A90E2; color: #fff; border-color: #4A90E2; }

    .offers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px; }
    .offer-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 24px;
      position: relative;
      transition: all 0.3s;
    }
    .offer-card:hover { transform: translateY(-5px); background: rgba(255, 255, 255, 0.05); border-color: rgba(74, 144, 226, 0.3); }

    .offer-badge {
      position: absolute; top: 24px; right: 24px;
      background: rgba(74, 144, 226, 0.1); color: #4A90E2;
      padding: 4px 12px; border-radius: 20px;
      font-size: 0.75rem; font-weight: 700;
    }

    .offer-main { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
    .company-logo {
      width: 50px; height: 50px;
      background: linear-gradient(135deg, #2D3748, #1A202C);
      color: #fff; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; font-weight: 800;
    }
    .offer-info h3 { margin: 0 0 4px 0; font-size: 1.1rem; }
    .offer-info .company { margin: 0; color: #718096; font-size: 0.9rem; }

    .offer-desc { font-size: 0.85rem; color: #A0AEC0; line-height: 1.6; margin: 0 0 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    .offer-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
    .offer-tags span {
      background: rgba(255, 255, 255, 0.04); padding: 4px 10px;
      border-radius: 6px; font-size: 0.75rem; color: #A0AEC0;
    }

    .offer-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 16px; }
    .offer-footer .date { font-size: 0.8rem; color: #718096; }
    .apply-btn {
      background: transparent; border: 1px solid #4A90E2; color: #4A90E2;
      padding: 8px 20px; border-radius: 10px; font-weight: 700;
      cursor: pointer; transition: all 0.2s;
    }
    .apply-btn:hover { background: #4A90E2; color: #fff; }

    .status-pending {
      color: #ECC94B; font-weight: 700; font-size: 0.85rem;
      display: flex; align-items: center; gap: 6px;
      background: rgba(236, 201, 75, 0.1); padding: 6px 14px; border-radius: 8px;
    }
    .status-accepted {
      color: #48BB78; font-weight: 700; font-size: 0.85rem;
      display: flex; align-items: center; gap: 6px;
      background: rgba(72, 187, 120, 0.1); padding: 6px 14px; border-radius: 8px;
    }
    .status-rejected {
      color: #FC8181; font-weight: 700; font-size: 0.85rem;
      display: flex; align-items: center; gap: 6px;
      background: rgba(252, 129, 129, 0.1); padding: 6px 14px; border-radius: 8px;
    }

    /* Empty State */
    .empty-state { text-align: center; padding: 60px 20px; color: #718096; }
    .empty-icon { margin-bottom: 16px; }
    .empty-state h3 { margin: 0 0 8px; font-size: 1.1rem; }
    .empty-state p { margin: 0; }

    /* ── MODAL ── */
    .modal-overlay {
      position: fixed; inset: 0; z-index: 1000;
      background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      animation: fadeIn 0.2s ease;
    }
    .modal-content {
      background: #1A202C; border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px; padding: 2rem; width: 520px; max-width: 95vw;
      max-height: 90vh; overflow-y: auto; position: relative;
      animation: slideUp 0.3s ease;
    }
    .modal-close {
      position: absolute; top: 16px; right: 16px;
      background: rgba(255,255,255,0.05); border: none; color: #A0AEC0;
      width: 32px; height: 32px; border-radius: 8px;
      font-size: 1.3rem; cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center;
    }
    .modal-close:hover { color: #E53E3E; background: rgba(229, 62, 62, 0.1); }

    .modal-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem;
    }
    .modal-icon {
      width: 48px; height: 48px; border-radius: 14px;
      background: rgba(74, 144, 226, 0.15);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem;
    }
    .modal-header h2 { margin: 0; font-size: 1.25rem; font-weight: 800; color: #E2E8F0; }

    .apply-offer-summary {
      display: flex; align-items: center; gap: 14px;
      background: rgba(255, 255, 255, 0.04); border-radius: 14px;
      padding: 14px 18px; margin-bottom: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .aos-logo {
      width: 42px; height: 42px; border-radius: 10px;
      background: linear-gradient(135deg, #4A90E2, #357ABD);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 1.2rem; flex-shrink: 0;
    }
    .aos-title { font-weight: 700; font-size: 0.95rem; margin-bottom: 2px; color: #E2E8F0; }
    .aos-company { font-size: 0.8rem; color: #A0AEC0; }

    /* Upload */
    .upload-section { margin-bottom: 1.25rem; }
    .upload-label {
      display: flex; align-items: center; gap: 6px;
      font-weight: 700; font-size: 0.9rem;
      margin-bottom: 10px; color: #E2E8F0;
    }
    .label-icon { flex-shrink: 0; }
    .upload-zone {
      border: 2px dashed rgba(74, 144, 226, 0.3);
      border-radius: 14px; padding: 2rem; text-align: center;
      cursor: pointer; transition: all 0.2s;
      background: rgba(74, 144, 226, 0.03);
    }
    .upload-zone:hover, .upload-zone.drag-over {
      border-color: #4A90E2; background: rgba(74, 144, 226, 0.08);
    }
    .upload-zone.has-file {
      border-style: solid; border-color: rgba(72, 187, 120, 0.4);
      background: rgba(72, 187, 120, 0.05); padding: 1rem;
    }
    .upload-icon { margin-bottom: 10px; }
    .upload-text { font-size: 0.95rem; color: #CBD5E0; margin-bottom: 6px; }
    .upload-link { color: #4A90E2; font-weight: 700; text-decoration: underline; }
    .upload-hint { font-size: 0.8rem; color: #A0AEC0; }

    .upload-error {
      color: #FC8181; font-size: 0.8rem; margin-top: 6px;
      padding: 6px 10px; background: rgba(252, 129, 129, 0.1);
      border-radius: 8px;
    }

    /* File preview */
    .file-preview { display: flex; align-items: center; gap: 12px; text-align: left; }
    .file-icon { display: flex; align-items: center; }
    .file-info { flex: 1; }
    .file-name { font-weight: 700; font-size: 0.9rem; word-break: break-all; color: #E2E8F0; }
    .file-size { font-size: 0.75rem; color: #718096; margin-top: 2px; }
    .file-remove {
      background: rgba(229, 62, 62, 0.15); border: none;
      color: #FC8181; width: 32px; height: 32px; border-radius: 8px;
      cursor: pointer; font-size: 0.9rem; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center;
    }
    .file-remove:hover { background: rgba(229, 62, 62, 0.3); color: #fff; }

    /* Message */
    .message-section { margin-bottom: 1.5rem; }
    .apply-message {
      width: 100%; border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.04); border-radius: 12px;
      padding: 12px; color: #E2E8F0; font-family: inherit;
      font-size: 0.9rem; resize: vertical; box-sizing: border-box;
    }
    .apply-message:focus { outline: none; border-color: #4A90E2; }
    .apply-message::placeholder { color: #4A5568; }

    /* Actions */
    .modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
    .btn-cancel {
      padding: 10px 20px; background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.1); color: #A0AEC0;
      border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s;
    }
    .btn-cancel:hover { background: rgba(255, 255, 255, 0.05); }
    .btn-send {
      padding: 10px 24px; background: #4A90E2; color: #fff;
      border: none; border-radius: 10px; font-weight: 700;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-send:hover:not(:disabled) { background: #357ABD; transform: translateY(-1px); }
    .btn-send:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Toast */
    .toast {
      position: fixed; bottom: 24px; right: 24px; z-index: 2000;
      background: #2D3748; border: 1px solid rgba(72, 187, 120, 0.3);
      color: #48BB78; padding: 14px 24px; border-radius: 14px;
      font-weight: 700; font-size: 0.9rem;
      display: flex; align-items: center; gap: 10px;
      animation: slideUp 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    .toast-icon { flex-shrink: 0; }
    .btn-icon { vertical-align: -3px; margin-right: 4px; }
    .btn-send span { display: flex; align-items: center; gap: 6px; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
  `]
})
export class StudentOffersComponent implements OnInit {

  private appService = inject(ApplicationService);
  private authService = inject(AuthService);
  offerService = inject(OfferService);

  offers: StudentOffer[] = [];
  activeFilter = 'all';
  filteredOffers: StudentOffer[] = [];

  ngOnInit(): void {
    this.loadOffers();
  }

  private loadOffers(): void {
    // Load only approved offers from the shared OfferService
    const approved = this.offerService.getApprovedOffers();
    this.offers = approved.map(o => ({ ...o } as StudentOffer));
    this.refreshStatuses();
  }

  private refreshStatuses(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;
    for (const offer of this.offers) {
      // Check by offer ID first, then fallback to title+company
      const appById = this.appService.hasAppliedById(user.email, offer.id);
      const appByName = this.appService.hasApplied(user.email, offer.title, offer.company);
      const app = appById || appByName;
      offer.applicationStatus = app?.status;
    }
    this.filterOffers(this.activeFilter);
  }

  /* Apply modal state */
  applyModal = false;
  selectedOffer: StudentOffer | null = null;
  cvFile: File | null = null;
  applyMessage = '';
  uploadError = '';
  isDragging = false;
  isSending = false;
  toast = '';

  private readonly MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  private readonly ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  filterOffers(type: string): void {
    this.activeFilter = type;
    this.filteredOffers = type === 'all'
      ? [...this.offers]
      : this.offers.filter(o => o.type === type);
  }

  openApplyModal(offer: StudentOffer): void {
    this.selectedOffer = offer;
    this.cvFile = null;
    this.applyMessage = '';
    this.uploadError = '';
    this.applyModal = true;
  }

  closeApplyModal(): void {
    this.applyModal = false;
    this.selectedOffer = null;
    this.cvFile = null;
    this.uploadError = '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.validateAndSetFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.validateAndSetFile(event.dataTransfer.files[0]);
    }
  }

  private validateAndSetFile(file: File): void {
    this.uploadError = '';

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.uploadError = 'Format non supporté. Veuillez choisir un fichier PDF, DOC ou DOCX.';
      return;
    }
    if (file.size > this.MAX_SIZE) {
      this.uploadError = 'Le fichier dépasse 5 Mo. Veuillez choisir un fichier plus petit.';
      return;
    }

    this.cvFile = file;
  }

  removeCv(event: Event): void {
    event.stopPropagation();
    this.cvFile = null;
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
  }

  submitApplication(): void {
    if (!this.cvFile || !this.selectedOffer || this.isSending) return;
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.isSending = true;
    const reader = new FileReader();
    const file = this.cvFile;
    const offer = this.selectedOffer;

    reader.onload = () => {
      this.appService.addApplication({
        offerId: offer.id,
        offerTitle: offer.title,
        offerCompany: offer.company,
        offerLocation: offer.location,
        offerType: offer.type,
        studentName: user.firstName + ' ' + user.lastName,
        studentEmail: user.email,
        cvFileName: file.name,
        cvFileSize: file.size,
        cvFileData: reader.result as string,
        message: this.applyMessage
      });
      offer.applicationStatus = 'pending';
      this.isSending = false;
      this.applyModal = false;
      this.showToast('Candidature envoyée avec succès !');
    };
    reader.readAsDataURL(file);
  }

  private showToast(msg: string): void {
    this.toast = msg;
    setTimeout(() => { this.toast = ''; }, 3000);
  }
}
