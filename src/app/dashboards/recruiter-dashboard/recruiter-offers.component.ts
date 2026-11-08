import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../shared/models/user.model';
import { Offer, OfferType, OfferModerationStatus } from '../../shared/models/offer.model';
import { OfferService } from '../../shared/services/offer.service';
import { ApplicationService } from '../../shared/services/application.service';

@Component({
  selector: 'app-recruiter-offers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Gérer mes Offres</h1>
        <p class="subtitle">Créez et gérez vos offres d'emploi et de stage</p>
      </div>
      <button class="btn-primary" (click)="openCreateForm()" *ngIf="!showForm">
        <i class="fas fa-plus"></i> Nouvelle Offre
      </button>
    </div>

    <!-- Status Filter Tabs -->
    <div class="filter-tabs">
      <button class="tab" [class.active]="activeTab === 'all'" (click)="setTab('all')">
        Toutes <span class="tab-count">{{ allOffers.length }}</span>
      </button>
      <button class="tab pending" [class.active]="activeTab === 'pending'" (click)="setTab('pending')">
        En attente <span class="tab-count">{{ countByStatus('pending') }}</span>
      </button>
      <button class="tab approved" [class.active]="activeTab === 'approved'" (click)="setTab('approved')">
        Approuvées <span class="tab-count">{{ countByStatus('approved') }}</span>
      </button>
      <button class="tab rejected" [class.active]="activeTab === 'rejected'" (click)="setTab('rejected')">
        Rejetées <span class="tab-count">{{ countByStatus('rejected') }}</span>
      </button>
    </div>

    <!-- Create/Edit Form -->
    <div class="form-card" *ngIf="showForm" @fadeSlide>
      <div class="form-card-header">
        <h3>{{ editingOffer ? 'Modifier l\\'offre' : 'Publier une nouvelle offre' }}</h3>
        <button class="form-close" (click)="closeForm()">&times;</button>
      </div>
      <p class="form-error" *ngIf="formError">
        <i class="fas fa-exclamation-circle"></i> {{ formError }}
      </p>
      <div class="form-grid">
        <div class="form-group">
          <label>Titre du poste *</label>
          <input type="text" [(ngModel)]="formData.title" placeholder="Ex: Développeur Full Stack">
        </div>
        <div class="form-group">
          <label>Type *</label>
          <select [(ngModel)]="formData.type">
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="Stage">Stage</option>
            <option value="Alternance">Alternance</option>
            <option value="Freelance">Freelance</option>
          </select>
        </div>
        <div class="form-group">
          <label>Entreprise *</label>
          <input type="text" [(ngModel)]="formData.company" placeholder="Nom de l'entreprise">
        </div>
        <div class="form-group">
          <label>Localisation *</label>
          <input type="text" [(ngModel)]="formData.location" placeholder="Ex: Tunis, Télétravail">
        </div>
        <div class="form-group full-width">
          <label>Description *</label>
          <textarea [(ngModel)]="formData.description" rows="4" placeholder="Décrivez le poste, les missions, le profil recherché..."></textarea>
        </div>
        <div class="form-group full-width">
          <label>Compétences requises * (séparées par des virgules)</label>
          <input type="text" [(ngModel)]="formData.skills" placeholder="Angular, Java, SQL, Docker...">
        </div>
      </div>
      <div class="form-actions">
        <button class="btn-secondary" (click)="closeForm()">Annuler</button>
        <button class="btn-primary" [disabled]="!canSubmit" (click)="submitForm()">
          <i class="fas" [ngClass]="editingOffer ? 'fa-save' : 'fa-paper-plane'"></i>
          {{ editingOffer ? 'Enregistrer les modifications' : 'Publier l\\'offre' }}
        </button>
      </div>
    </div>

    <!-- Success Toast -->
    <div class="form-success-banner" *ngIf="formSuccess">
      <i class="fas fa-check-circle"></i> {{ formSuccess }}
    </div>

    <!-- Offers List -->
    <div class="offers-grid" *ngIf="filteredOffers.length > 0">
      <div class="offer-card" *ngFor="let offer of filteredOffers" [class.rejected-card]="offer.status === 'rejected'">
        <!-- Status Ribbon -->
        <div class="offer-ribbon" [ngClass]="offer.status">
          <i class="fas" [ngClass]="{
            'fa-clock': offer.status === 'pending',
            'fa-check-circle': offer.status === 'approved',
            'fa-times-circle': offer.status === 'rejected'
          }"></i>
          {{ statusLabel(offer.status) }}
        </div>

        <div class="offer-header">
          <div class="offer-type" [ngClass]="offer.type.toLowerCase()">{{ offer.type }}</div>
          <span class="applicant-count" title="Candidatures reçues">
            <i class="fas fa-users"></i> {{ getApplicationCount(offer) }}
          </span>
        </div>

        <h3 class="offer-title">{{ offer.title }}</h3>
        <p class="offer-company"><i class="fas fa-building"></i> {{ offer.company }}</p>
        <p class="offer-location"><i class="fas fa-map-marker-alt"></i> {{ offer.location }}</p>
        <p class="offer-description">{{ offer.description }}</p>

        <div class="offer-skills">
          <span class="skill-tag" *ngFor="let skill of offer.skillsList">{{ skill }}</span>
        </div>

        <!-- Rejection Reason Alert -->
        <div class="rejection-alert" *ngIf="offer.status === 'rejected' && offer.moderationReason">
          <div class="rejection-header">
            <i class="fas fa-exclamation-triangle"></i> Motif de refus
          </div>
          <p>{{ offer.moderationReason }}</p>
          <button class="btn-fix" (click)="editOffer(offer)">
            <i class="fas fa-edit"></i> Corriger et resoumettre
          </button>
        </div>

        <div class="offer-footer">
          <span class="date"><i class="fas fa-clock"></i> {{ offerService.formatDate(offer.postedDate) }}</span>
        </div>

        <div class="offer-actions">
          <button class="btn-action edit" title="Modifier" (click)="editOffer(offer)">
            <i class="fas fa-edit"></i> Modifier
          </button>
          <button class="btn-action view" title="Voir candidatures" (click)="viewApplications(offer)"
                  [disabled]="getApplicationCount(offer) === 0">
            <i class="fas fa-eye"></i> Candidatures ({{ getApplicationCount(offer) }})
          </button>
          <button class="btn-action delete" title="Supprimer" (click)="confirmDelete(offer)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="filteredOffers.length === 0">
      <div class="empty-icon">
        <i class="fas fa-briefcase"></i>
      </div>
      <h3 *ngIf="activeTab === 'all'">Aucune offre publiée</h3>
      <h3 *ngIf="activeTab !== 'all'">Aucune offre {{ activeTab === 'pending' ? 'en attente' : activeTab === 'approved' ? 'approuvée' : 'rejetée' }}</h3>
      <p *ngIf="activeTab === 'all'">Commencez par créer votre première offre d'emploi.</p>
      <p *ngIf="activeTab !== 'all'">Changez de filtre ou créez une nouvelle offre.</p>
      <button class="btn-primary" (click)="openCreateForm()" *ngIf="activeTab === 'all'">
        <i class="fas fa-plus"></i> Créer une offre
      </button>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal-overlay" *ngIf="deleteTarget" (click)="cancelDelete()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-icon-wrap danger">
          <i class="fas fa-trash-alt"></i>
        </div>
        <h3>Supprimer cette offre ?</h3>
        <p>L'offre <strong>« {{ deleteTarget.title }} »</strong> sera supprimée définitivement. Cette action est irréversible.</p>
        <div class="modal-actions">
          <button class="btn-secondary" (click)="cancelDelete()">Annuler</button>
          <button class="btn-danger" (click)="executeDelete()">
            <i class="fas fa-trash"></i> Supprimer
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { font-size: 1.8rem; font-weight: 800; color: #2d3436; margin: 0; }
    .subtitle { color: #636e72; margin: 4px 0 0; font-size: 0.95rem; }

    /* Buttons */
    .btn-primary { background: linear-gradient(135deg, #6C5CE7, #a855f7); color: #fff; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.9rem; transition: all 0.2s; box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3); }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(108, 92, 231, 0.4); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .btn-secondary { background: #f5f6fa; color: #636e72; border: 1px solid #e8ecf1; padding: 10px 20px; border-radius: 12px; font-weight: 600; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
    .btn-secondary:hover { background: #e8ecf1; }
    .btn-danger { background: #e74c3c; color: #fff; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.9rem; transition: all 0.2s; }
    .btn-danger:hover { background: #c0392b; }

    /* Filter Tabs */
    .filter-tabs { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
    .tab { background: #f5f6fa; border: 1px solid #e8ecf1; color: #636e72; padding: 8px 18px; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
    .tab:hover { background: #e8ecf1; }
    .tab.active { background: #6C5CE7; color: #fff; border-color: #6C5CE7; }
    .tab.pending.active { background: #f39c12; border-color: #f39c12; }
    .tab.approved.active { background: #27ae60; border-color: #27ae60; }
    .tab.rejected.active { background: #e74c3c; border-color: #e74c3c; }
    .tab-count { background: rgba(255,255,255,0.25); padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; }

    /* Form Card */
    .form-card { background: #fff; border: 1px solid #e8ecf1; border-radius: 16px; padding: 28px; margin-bottom: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); animation: slideDown 0.3s ease; }
    .form-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .form-card-header h3 { margin: 0; font-size: 1.15rem; color: #2d3436; font-weight: 700; }
    .form-close { background: none; border: none; font-size: 1.5rem; color: #b2bec3; cursor: pointer; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .form-close:hover { background: #ffeaea; color: #e74c3c; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.full-width { grid-column: 1 / -1; }
    .form-group label { font-size: 0.85rem; font-weight: 600; color: #2d3436; }
    .form-group input, .form-group select, .form-group textarea { border: 1px solid #e8ecf1; border-radius: 10px; padding: 10px 14px; font-size: 0.9rem; outline: none; font-family: 'Inter', sans-serif; transition: border 0.2s; background: #fafbfc; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #6C5CE7; background: #fff; box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1); }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
    .form-error { margin: 0 0 16px; color: #c62828; font-size: 0.86rem; font-weight: 600; background: #fff5f5; padding: 10px 14px; border-radius: 10px; border: 1px solid #fee2e2; display: flex; align-items: center; gap: 8px; }
    .form-success-banner { margin-bottom: 20px; color: #166534; font-size: 0.9rem; font-weight: 600; background: #f0fdf4; padding: 12px 16px; border-radius: 12px; border: 1px solid #bbf7d0; display: flex; align-items: center; gap: 8px; animation: slideDown 0.3s ease; }

    /* Offers Grid */
    .offers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }

    .offer-card { background: #fff; border: 1px solid #e8ecf1; border-radius: 16px; padding: 24px; transition: all 0.25s; position: relative; overflow: hidden; }
    .offer-card:hover { box-shadow: 0 8px 30px rgba(108, 92, 231, 0.08); transform: translateY(-2px); }
    .offer-card.rejected-card { border-left: 4px solid #e74c3c; }

    /* Status Ribbon */
    .offer-ribbon { position: absolute; top: 0; right: 0; padding: 6px 14px 6px 18px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 0 16px 0 12px; display: flex; align-items: center; gap: 5px; }
    .offer-ribbon.pending { background: #fff7ed; color: #c2410c; }
    .offer-ribbon.approved { background: #f0fdf4; color: #166534; }
    .offer-ribbon.rejected { background: #fef2f2; color: #991b1b; }

    .offer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; margin-top: 8px; }
    .offer-type { font-size: 0.72rem; font-weight: 700; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.3px; }
    .offer-type.cdi { background: #e8f5e9; color: #2e7d32; }
    .offer-type.cdd { background: #e3f2fd; color: #1565c0; }
    .offer-type.stage { background: #fff3e0; color: #e65100; }
    .offer-type.alternance { background: #f3e5f5; color: #7b1fa2; }
    .offer-type.freelance { background: #fce4ec; color: #c62828; }

    .applicant-count { font-size: 0.82rem; color: #6C5CE7; font-weight: 600; display: flex; align-items: center; gap: 5px; background: #f0efff; padding: 4px 10px; border-radius: 8px; }

    .offer-title { font-size: 1.15rem; font-weight: 700; color: #2d3436; margin: 0 0 8px; }
    .offer-company, .offer-location { font-size: 0.85rem; color: #636e72; margin: 4px 0; display: flex; align-items: center; gap: 6px; }
    .offer-company i, .offer-location i { color: #6C5CE7; font-size: 0.8rem; width: 16px; }
    .offer-description { font-size: 0.85rem; color: #636e72; margin: 12px 0; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .offer-skills { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0; }
    .skill-tag { background: #f0efff; color: #6C5CE7; font-size: 0.73rem; font-weight: 600; padding: 4px 10px; border-radius: 6px; }

    /* Rejection Alert */
    .rejection-alert { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 14px; margin: 12px 0; }
    .rejection-header { font-size: 0.82rem; font-weight: 700; color: #991b1b; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
    .rejection-alert p { font-size: 0.83rem; color: #7f1d1d; margin: 0 0 10px; line-height: 1.5; }
    .btn-fix { background: #fff; border: 1px solid #fecaca; color: #dc2626; padding: 6px 14px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.2s; }
    .btn-fix:hover { background: #dc2626; color: #fff; border-color: #dc2626; }

    .offer-footer { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: #b2bec3; margin-top: 16px; padding-top: 12px; border-top: 1px solid #f5f6fa; }
    .offer-footer i { margin-right: 4px; }

    .offer-actions { display: flex; gap: 8px; margin-top: 12px; }
    .btn-action { padding: 7px 14px; border-radius: 8px; border: 1px solid #e8ecf1; background: #fff; color: #636e72; cursor: pointer; font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; gap: 5px; transition: all 0.2s; }
    .btn-action.edit:hover { background: #f0efff; color: #6C5CE7; border-color: #6C5CE7; }
    .btn-action.view:hover:not(:disabled) { background: #e8f5e9; color: #2e7d32; border-color: #27ae60; }
    .btn-action.view:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-action.delete:hover { background: #fff0f0; color: #e74c3c; border-color: #e74c3c; }

    /* Empty State */
    .empty-state { text-align: center; padding: 60px 20px; color: #636e72; }
    .empty-icon { width: 80px; height: 80px; margin: 0 auto 20px; background: #f0efff; border-radius: 20px; display: flex; align-items: center; justify-content: center; }
    .empty-icon i { font-size: 2rem; color: #6C5CE7; }
    .empty-state h3 { color: #2d3436; margin: 0 0 8px; font-size: 1.15rem; }
    .empty-state p { margin: 0 0 20px; }

    /* Delete Modal */
    .modal-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.45); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease; }
    .modal-box { background: #fff; border-radius: 20px; padding: 32px; width: 420px; max-width: 90vw; text-align: center; animation: scaleIn 0.25s ease; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
    .modal-icon-wrap { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 1.5rem; }
    .modal-icon-wrap.danger { background: #fef2f2; color: #dc2626; }
    .modal-box h3 { margin: 0 0 10px; font-size: 1.2rem; color: #2d3436; }
    .modal-box p { margin: 0 0 24px; color: #636e72; font-size: 0.92rem; line-height: 1.5; }
    .modal-actions { display: flex; gap: 12px; justify-content: center; }

    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

    @media (max-width: 500px) {
      .offers-grid { grid-template-columns: 1fr; }
      .form-grid { grid-template-columns: 1fr; }
      .filter-tabs { gap: 6px; }
      .tab { padding: 6px 12px; font-size: 0.8rem; }
    }
  `]
})
export class RecruiterOffersComponent implements OnInit {
  currentUser: User | null = null;
  showForm = false;
  editingOffer: Offer | null = null;
  allOffers: Offer[] = [];
  filteredOffers: Offer[] = [];
  activeTab: 'all' | OfferModerationStatus = 'all';
  formError = '';
  formSuccess = '';
  deleteTarget: Offer | null = null;

  formData: {
    title: string;
    type: OfferType;
    company: string;
    location: string;
    description: string;
    skills: string;
  } = { title: '', type: 'CDI', company: '', location: '', description: '', skills: '' };

  private authService = inject(AuthService);
  offerService = inject(OfferService);
  private appService = inject(ApplicationService);
  private router = inject(Router);

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.reloadOffers();
  }

  get canSubmit(): boolean {
    return !!(
      this.formData.title.trim() &&
      this.formData.company.trim() &&
      this.formData.location.trim() &&
      this.formData.description.trim() &&
      this.formData.skills.trim()
    );
  }

  setTab(tab: 'all' | OfferModerationStatus): void {
    this.activeTab = tab;
    this.applyFilter();
  }

  countByStatus(status: OfferModerationStatus): number {
    return this.allOffers.filter(o => o.status === status).length;
  }

  submitForm(): void {
    this.formError = '';
    this.formSuccess = '';

    if (!this.canSubmit) {
      this.formError = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    const skillsList = this.formData.skills.split(',').map(s => s.trim()).filter(s => s);

    if (this.editingOffer) {
      // Update existing offer
      this.offerService.updateOffer(this.editingOffer.id, {
        ...this.formData,
        skillsList
      });
      this.formSuccess = 'Offre modifiée avec succès. Elle est re-soumise pour modération.';
    } else {
      // Create new offer
      this.offerService.createOffer({
        ...this.formData,
        skillsList,
        status: 'pending',
        recruiterEmail: this.currentUser?.email || '',
        recruiterName: (this.currentUser?.firstName || '') + ' ' + (this.currentUser?.lastName || '')
      });
      this.formSuccess = 'Offre publiée avec succès ! Elle est en attente de modération par l\'administrateur.';
    }

    this.reloadOffers();
    this.closeForm();

    setTimeout(() => { this.formSuccess = ''; }, 5000);
  }

  openCreateForm(): void {
    this.editingOffer = null;
    this.formData = { title: '', type: 'CDI', company: '', location: '', description: '', skills: '' };
    this.showForm = true;
    this.formError = '';
    this.formSuccess = '';
  }

  editOffer(offer: Offer): void {
    this.editingOffer = offer;
    this.formData = {
      title: offer.title,
      type: offer.type,
      company: offer.company,
      location: offer.location,
      description: offer.description,
      skills: offer.skills
    };
    this.showForm = true;
    this.formError = '';
    this.formSuccess = '';
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeForm(): void {
    this.showForm = false;
    this.editingOffer = null;
    this.formData = { title: '', type: 'CDI', company: '', location: '', description: '', skills: '' };
    this.formError = '';
  }

  confirmDelete(offer: Offer): void {
    this.deleteTarget = offer;
  }

  cancelDelete(): void {
    this.deleteTarget = null;
  }

  executeDelete(): void {
    if (this.deleteTarget) {
      this.offerService.deleteOffer(this.deleteTarget.id);
      this.deleteTarget = null;
      this.reloadOffers();
      this.formSuccess = 'Offre supprimée avec succès.';
      setTimeout(() => { this.formSuccess = ''; }, 3000);
    }
  }

  viewApplications(offer: Offer): void {
    this.router.navigate(['/recruiter/applications']);
  }

  getApplicationCount(offer: Offer): number {
    const fromService = this.appService.getApplicationCountByOfferId(offer.id);
    // Also check by title/company for backward compatibility
    const fromLegacy = this.appService.getApplicationsByOffer(offer.title, offer.company).length;
    return Math.max(fromService, fromLegacy, offer.applicants || 0);
  }

  statusLabel(status: OfferModerationStatus): string {
    if (status === 'pending') return 'En attente';
    if (status === 'approved') return 'Approuvée';
    return 'Rejetée';
  }

  private reloadOffers(): void {
    if (!this.currentUser?.email) {
      this.allOffers = this.offerService.getOffers();
    } else {
      this.allOffers = this.offerService.getOffersByRecruiter(this.currentUser.email);
    }
    this.applyFilter();
  }

  private applyFilter(): void {
    this.filteredOffers = this.activeTab === 'all'
      ? [...this.allOffers]
      : this.allOffers.filter(o => o.status === this.activeTab);
  }
}
