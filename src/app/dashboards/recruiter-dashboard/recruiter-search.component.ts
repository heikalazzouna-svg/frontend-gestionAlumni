import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-recruiter-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Chercher des Talents</h1>
        <p class="subtitle">Explorez les profils des diplômés et étudiants d'Enicarthage</p>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="search-section">
      <div class="search-input-wrapper">
        <i class="fas fa-search"></i>
        <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="filterTalents()" placeholder="Rechercher par nom, compétence, formation...">
      </div>
      <div class="filters">
        <select [(ngModel)]="filterType" (ngModelChange)="filterTalents()">
          <option value="">Tous les profils</option>
          <option value="alumni">Alumni</option>
          <option value="etudiant">Étudiants</option>
        </select>
        <select [(ngModel)]="filterSkill" (ngModelChange)="filterTalents()">
          <option value="">Toutes compétences</option>
          <option *ngFor="let skill of allSkills" [value]="skill">{{ skill }}</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div class="loading-state" *ngIf="isLoading">
      <div class="loading-spinner"></div>
      <p>Chargement des profils...</p>
    </div>

    <!-- Results -->
    <div class="results-info" *ngIf="!isLoading">
      <span>{{ filteredTalents.length }} profils trouvés</span>
    </div>

    <div class="talents-grid" *ngIf="!isLoading">
      <div class="talent-card" *ngFor="let talent of filteredTalents">
        <div class="talent-avatar" [ngClass]="talent.type">
          <img *ngIf="talent.avatarUrl" [src]="talent.avatarUrl" [alt]="talent.firstName" class="talent-avatar-img" />
          <span *ngIf="!talent.avatarUrl">{{ talent.firstName.charAt(0) }}{{ talent.lastName.charAt(0) }}</span>
        </div>
        <div class="talent-info">
          <h3>{{ talent.firstName }} {{ talent.lastName }}</h3>
          <p class="talent-role">{{ talent.type === 'alumni' ? 'Alumni' : 'Étudiant' }}</p>
          <p class="talent-formation" *ngIf="talent.formation"><i class="fas fa-graduation-cap"></i> {{ talent.formation }}</p>
          <p class="talent-location" *ngIf="talent.location"><i class="fas fa-map-marker-alt"></i> {{ talent.location }}</p>
          <div class="talent-skills">
            <span class="skill-tag" *ngFor="let skill of talent.skills">{{ skill }}</span>
          </div>
        </div>
        <div class="talent-actions">
          <button class="btn-outline" (click)="openProfile(talent)"><i class="fas fa-user"></i> Profil</button>
          <button class="btn-primary-sm" (click)="openContact(talent)"><i class="fas fa-envelope"></i> Contacter</button>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="!isLoading && filteredTalents.length === 0">
      <i class="fas fa-search"></i>
      <h3>Aucun profil trouvé</h3>
      <p>Essayez de modifier vos critères de recherche.</p>
    </div>

    <!-- ==================== PROFILE MODAL ==================== -->
    <div class="modal-overlay" *ngIf="selectedProfile" (click)="closeProfile()">
      <div class="modal-content profile-modal" (click)="$event.stopPropagation()">
        <button class="modal-close" (click)="closeProfile()"><i class="fas fa-times"></i></button>

        <!-- Profile Header -->
        <div class="profile-header">
          <div class="profile-avatar-lg" [ngClass]="selectedProfile.type">
            <img *ngIf="selectedProfile.avatarUrl" [src]="selectedProfile.avatarUrl" [alt]="selectedProfile.firstName" class="talent-avatar-img" />
            <span *ngIf="!selectedProfile.avatarUrl">{{ selectedProfile.firstName.charAt(0) }}{{ selectedProfile.lastName.charAt(0) }}</span>
          </div>
          <div class="profile-header-info">
            <h2>{{ selectedProfile.firstName }} {{ selectedProfile.lastName }}</h2>
            <span class="profile-badge" [ngClass]="selectedProfile.type">{{ selectedProfile.type === 'alumni' ? 'Alumni' : 'Étudiant' }}</span>
            <p class="profile-headline" *ngIf="selectedProfile.headline">{{ selectedProfile.headline }}</p>
          </div>
        </div>

        <!-- Profile Body -->
        <div class="profile-body">
          <div class="profile-section">
            <h3><i class="fas fa-user-circle"></i> À propos</h3>
            <p class="profile-bio">{{ selectedProfile.bio }}</p>
          </div>

          <div class="profile-info-grid">
            <div class="info-item" *ngIf="selectedProfile.email">
              <i class="fas fa-envelope"></i>
              <div><span class="info-label">Email</span><span class="info-value">{{ selectedProfile.email }}</span></div>
            </div>
            <div class="info-item" *ngIf="selectedProfile.phone">
              <i class="fas fa-phone"></i>
              <div><span class="info-label">Téléphone</span><span class="info-value">{{ selectedProfile.phone }}</span></div>
            </div>
            <div class="info-item" *ngIf="selectedProfile.location">
              <i class="fas fa-map-marker-alt"></i>
              <div><span class="info-label">Localisation</span><span class="info-value">{{ selectedProfile.location }}</span></div>
            </div>
            <div class="info-item" *ngIf="selectedProfile.formation">
              <i class="fas fa-graduation-cap"></i>
              <div><span class="info-label">Formation</span><span class="info-value">{{ selectedProfile.formation }}</span></div>
            </div>
          </div>

          <div class="profile-section">
            <h3><i class="fas fa-code"></i> Compétences</h3>
            <div class="profile-skills">
              <span class="skill-chip" *ngFor="let skill of selectedProfile.skills">{{ skill }}</span>
            </div>
          </div>

          <div class="profile-section" *ngIf="selectedProfile.experiences?.length">
            <h3><i class="fas fa-briefcase"></i> Expérience</h3>
            <div class="experience-list">
              <div class="experience-item" *ngFor="let exp of selectedProfile.experiences">
                <div class="exp-dot"></div>
                <div class="exp-content">
                  <h4>{{ exp.title }}</h4>
                  <p class="exp-company">{{ exp.company }}</p>
                  <p class="exp-period">{{ exp.period }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="profile-section" *ngIf="selectedProfile.languages?.length">
            <h3><i class="fas fa-globe"></i> Langues</h3>
            <div class="languages-list">
              <span class="lang-chip" *ngFor="let lang of selectedProfile.languages">{{ lang }}</span>
            </div>
          </div>
        </div>

        <div class="profile-footer">
          <button class="btn-primary-md" (click)="closeProfile(); openContact(selectedProfile)">
            <i class="fas fa-envelope"></i> Contacter ce profil
          </button>
          <a *ngIf="selectedProfile.linkedin" [href]="selectedProfile.linkedin" target="_blank" rel="noopener" class="btn-linkedin">
            <i class="fab fa-linkedin"></i> Voir LinkedIn
          </a>
        </div>
      </div>
    </div>

    <!-- ==================== CONTACT MODAL ==================== -->
    <div class="modal-overlay" *ngIf="contactTarget" (click)="closeContact()">
      <div class="modal-content contact-modal" (click)="$event.stopPropagation()">
        <button class="modal-close" (click)="closeContact()"><i class="fas fa-times"></i></button>

        <div class="contact-header">
          <div class="contact-avatar" [ngClass]="contactTarget.type">
            <img *ngIf="contactTarget.avatarUrl" [src]="contactTarget.avatarUrl" [alt]="contactTarget.firstName" class="talent-avatar-img" />
            <span *ngIf="!contactTarget.avatarUrl">{{ contactTarget.firstName.charAt(0) }}{{ contactTarget.lastName.charAt(0) }}</span>
          </div>
          <div>
            <h2>Contacter {{ contactTarget.firstName }} {{ contactTarget.lastName }}</h2>
            <p class="contact-subtitle">Choisissez un moyen de communication</p>
          </div>
        </div>

        <div class="contact-options">
          <a [href]="getMailtoLink(contactTarget)" class="contact-option email-option">
            <div class="option-icon email"><i class="fas fa-envelope"></i></div>
            <div class="option-info">
              <h4>Envoyer un Email</h4>
              <p>{{ contactTarget.email }}</p>
            </div>
            <i class="fas fa-external-link-alt"></i>
          </a>

          <a *ngIf="contactTarget.phone" [href]="'tel:' + contactTarget.phone" class="contact-option phone-option">
            <div class="option-icon phone"><i class="fas fa-phone"></i></div>
            <div class="option-info">
              <h4>Appeler par téléphone</h4>
              <p>{{ contactTarget.phone }}</p>
            </div>
            <i class="fas fa-external-link-alt"></i>
          </a>

          <a *ngIf="contactTarget.linkedin" [href]="contactTarget.linkedin" target="_blank" rel="noopener" class="contact-option linkedin-option">
            <div class="option-icon linkedin"><i class="fab fa-linkedin-in"></i></div>
            <div class="option-info">
              <h4>LinkedIn</h4>
              <p>Voir le profil LinkedIn</p>
            </div>
            <i class="fas fa-external-link-alt"></i>
          </a>
        </div>

        <div class="quick-email-section">
          <h3><i class="fas fa-paper-plane"></i> Message rapide par email</h3>
          <div class="email-form">
            <div class="form-group">
              <label>Objet</label>
              <input type="text" [(ngModel)]="emailSubject" placeholder="Opportunité de collaboration">
            </div>
            <div class="form-group">
              <label>Message</label>
              <textarea [(ngModel)]="emailBody" rows="5" placeholder="Bonjour, je suis intéressé(e) par votre profil..."></textarea>
            </div>
            <button class="btn-send" (click)="sendEmail(contactTarget)">
              <i class="fas fa-paper-plane"></i> Envoyer l'email
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <div class="toast" *ngIf="showToast" [class.show]="showToast">
      <i class="fas fa-check-circle"></i> {{ toastMessage }}
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 28px; }
    .page-header h1 { font-size: 1.8rem; font-weight: 800; color: #2d3436; margin: 0; }
    .subtitle { color: #636e72; margin: 4px 0 0; font-size: 0.95rem; }

    .search-section { background: #fff; border: 1px solid #e8ecf1; border-radius: 16px; padding: 20px; margin-bottom: 20px; }
    .search-input-wrapper { display: flex; align-items: center; gap: 10px; background: #f5f6fa; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; }
    .search-input-wrapper i { color: #b2bec3; }
    .search-input-wrapper input { border: none; background: none; outline: none; width: 100%; font-size: 0.95rem; font-family: 'Inter', sans-serif; }
    .filters { display: flex; gap: 12px; }
    .filters select { border: 1px solid #e8ecf1; border-radius: 10px; padding: 10px 14px; font-size: 0.85rem; outline: none; font-family: 'Inter', sans-serif; background: #fff; cursor: pointer; min-width: 180px; }
    .filters select:focus { border-color: #6C5CE7; }

    .loading-state { text-align: center; padding: 60px 20px; color: #636e72; }
    .loading-spinner { width: 40px; height: 40px; border: 4px solid #e8ecf1; border-top-color: #6C5CE7; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .results-info { margin-bottom: 16px; font-size: 0.85rem; color: #636e72; font-weight: 600; }

    .talents-grid { display: grid; gap: 16px; }
    .talent-card { background: #fff; border: 1px solid #e8ecf1; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 20px; transition: box-shadow 0.2s; }
    .talent-card:hover { box-shadow: 0 4px 20px rgba(108, 92, 231, 0.08); }
    .talent-avatar { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; color: #fff; flex-shrink: 0; overflow: hidden; }
    .talent-avatar.alumni { background: linear-gradient(135deg, #6C5CE7, #a29bfe); }
    .talent-avatar.etudiant { background: linear-gradient(135deg, #00b894, #55efc4); }
    .talent-avatar-img { width: 100%; height: 100%; object-fit: cover; }
    .talent-info { flex: 1; }
    .talent-info h3 { font-size: 1.05rem; font-weight: 700; color: #2d3436; margin: 0 0 4px; }
    .talent-role { font-size: 0.8rem; color: #6C5CE7; font-weight: 600; margin: 0 0 6px; }
    .talent-formation, .talent-location { font-size: 0.82rem; color: #636e72; margin: 2px 0; display: flex; align-items: center; gap: 6px; }
    .talent-formation i, .talent-location i { color: #6C5CE7; font-size: 0.75rem; }
    .talent-skills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .skill-tag { background: #f0efff; color: #6C5CE7; font-size: 0.72rem; font-weight: 600; padding: 3px 8px; border-radius: 6px; }
    .talent-actions { display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }
    .btn-outline { background: #fff; color: #6C5CE7; border: 1px solid #6C5CE7; padding: 8px 16px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
    .btn-outline:hover { background: #f0efff; }
    .btn-primary-sm { background: #6C5CE7; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.2s; }
    .btn-primary-sm:hover { background: #5a4bd1; }

    .empty-state { text-align: center; padding: 60px 20px; color: #636e72; }
    .empty-state i { font-size: 3rem; color: #dfe6e9; margin-bottom: 16px; }
    .empty-state h3 { color: #2d3436; margin: 0 0 8px; }
    .empty-state p { margin: 0; }

    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.45); z-index: 1000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    .modal-content { background: #fff; border-radius: 20px; max-width: 640px; width: 92%; max-height: 85vh; overflow-y: auto; position: relative; animation: slideUp 0.3s ease; }
    .modal-close { position: absolute; top: 16px; right: 16px; width: 36px; height: 36px; border-radius: 50%; border: none; background: #f5f6fa; color: #636e72; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1rem; transition: all 0.2s; z-index: 10; }
    .modal-close:hover { background: #e8ecf1; color: #2d3436; }

    .profile-header { display: flex; align-items: center; gap: 20px; padding: 32px 32px 24px; border-bottom: 1px solid #f0f0f5; }
    .profile-avatar-lg { width: 80px; height: 80px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.6rem; color: #fff; flex-shrink: 0; overflow: hidden; }
    .profile-avatar-lg.alumni { background: linear-gradient(135deg, #6C5CE7, #a29bfe); }
    .profile-avatar-lg.etudiant { background: linear-gradient(135deg, #00b894, #55efc4); }
    .profile-header-info h2 { font-size: 1.4rem; font-weight: 800; color: #2d3436; margin: 0 0 6px; }
    .profile-badge { display: inline-block; font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 6px; text-transform: uppercase; }
    .profile-badge.alumni { background: #f0efff; color: #6C5CE7; }
    .profile-badge.etudiant { background: #e6fff8; color: #00b894; }
    .profile-headline { font-size: 0.9rem; color: #636e72; margin: 8px 0 0; }

    .profile-body { padding: 24px 32px; }
    .profile-section { margin-bottom: 24px; }
    .profile-section h3 { font-size: 0.95rem; font-weight: 700; color: #2d3436; margin: 0 0 12px; display: flex; align-items: center; gap: 8px; }
    .profile-section h3 i { color: #6C5CE7; font-size: 0.9rem; }
    .profile-bio { font-size: 0.88rem; color: #636e72; line-height: 1.6; margin: 0; }

    .profile-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
    .info-item { display: flex; align-items: flex-start; gap: 10px; padding: 12px; background: #f8f9fb; border-radius: 10px; }
    .info-item i { color: #6C5CE7; font-size: 0.85rem; margin-top: 2px; }
    .info-label { display: block; font-size: 0.72rem; color: #b2bec3; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { display: block; font-size: 0.85rem; color: #2d3436; font-weight: 500; margin-top: 2px; }

    .profile-skills { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-chip { background: linear-gradient(135deg, #f0efff, #e8e5ff); color: #6C5CE7; font-size: 0.8rem; font-weight: 600; padding: 6px 14px; border-radius: 8px; }

    .experience-list { position: relative; padding-left: 20px; }
    .experience-item { display: flex; gap: 12px; margin-bottom: 16px; position: relative; }
    .exp-dot { width: 10px; height: 10px; background: #6C5CE7; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
    .experience-item:not(:last-child)::after { content: ''; position: absolute; left: 4px; top: 18px; bottom: -8px; width: 2px; background: #e8ecf1; }
    .exp-content h4 { font-size: 0.9rem; font-weight: 700; color: #2d3436; margin: 0 0 2px; }
    .exp-company { font-size: 0.82rem; color: #6C5CE7; font-weight: 600; margin: 0 0 2px; }
    .exp-period { font-size: 0.78rem; color: #b2bec3; margin: 0; }

    .languages-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .lang-chip { background: #f5f6fa; color: #2d3436; font-size: 0.8rem; font-weight: 500; padding: 6px 14px; border-radius: 8px; border: 1px solid #e8ecf1; }

    .profile-footer { display: flex; gap: 12px; padding: 20px 32px; border-top: 1px solid #f0f0f5; }
    .btn-primary-md { background: #6C5CE7; color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; transition: background 0.2s; }
    .btn-primary-md:hover { background: #5a4bd1; }
    .btn-linkedin { background: #0A66C2; color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; text-decoration: none; transition: background 0.2s; }
    .btn-linkedin:hover { background: #004182; }

    .contact-header { display: flex; align-items: center; gap: 16px; padding: 28px 32px 20px; }
    .contact-avatar { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.95rem; color: #fff; flex-shrink: 0; overflow: hidden; }
    .contact-avatar.alumni { background: linear-gradient(135deg, #6C5CE7, #a29bfe); }
    .contact-avatar.etudiant { background: linear-gradient(135deg, #00b894, #55efc4); }
    .contact-header h2 { font-size: 1.15rem; font-weight: 800; color: #2d3436; margin: 0 0 2px; }
    .contact-subtitle { font-size: 0.85rem; color: #636e72; margin: 0; }

    .contact-options { padding: 0 32px 20px; display: flex; flex-direction: column; gap: 10px; }
    .contact-option { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 1px solid #e8ecf1; border-radius: 12px; text-decoration: none; color: #2d3436; transition: all 0.2s; cursor: pointer; }
    .contact-option:hover { border-color: #6C5CE7; background: #faf9ff; }
    .contact-option .fa-external-link-alt { color: #b2bec3; font-size: 0.75rem; margin-left: auto; }
    .option-icon { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1rem; color: #fff; flex-shrink: 0; }
    .option-icon.email { background: linear-gradient(135deg, #6C5CE7, #a29bfe); }
    .option-icon.phone { background: linear-gradient(135deg, #00b894, #55efc4); }
    .option-icon.linkedin { background: linear-gradient(135deg, #0A66C2, #378fe9); }
    .option-info h4 { font-size: 0.88rem; font-weight: 700; margin: 0 0 2px; }
    .option-info p { font-size: 0.78rem; color: #636e72; margin: 0; }

    .quick-email-section { padding: 0 32px 28px; }
    .quick-email-section h3 { font-size: 0.95rem; font-weight: 700; color: #2d3436; margin: 0 0 16px; display: flex; align-items: center; gap: 8px; }
    .quick-email-section h3 i { color: #6C5CE7; }
    .email-form { background: #f8f9fb; border-radius: 14px; padding: 20px; }
    .form-group { margin-bottom: 14px; }
    .form-group label { display: block; font-size: 0.82rem; font-weight: 600; color: #2d3436; margin-bottom: 6px; }
    .form-group input, .form-group textarea { width: 100%; border: 1px solid #e8ecf1; border-radius: 10px; padding: 10px 14px; font-size: 0.88rem; font-family: 'Inter', sans-serif; outline: none; transition: border 0.2s; box-sizing: border-box; resize: vertical; }
    .form-group input:focus, .form-group textarea:focus { border-color: #6C5CE7; }
    .btn-send { background: #6C5CE7; color: #fff; border: none; padding: 10px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; transition: background 0.2s; width: 100%; justify-content: center; }
    .btn-send:hover { background: #5a4bd1; }

    .toast { position: fixed; bottom: 30px; right: 30px; background: #00b894; color: #fff; padding: 14px 24px; border-radius: 12px; font-weight: 600; font-size: 0.88rem; display: flex; align-items: center; gap: 10px; z-index: 2000; animation: toastIn 0.3s ease; box-shadow: 0 8px 24px rgba(0,184,148,0.3); }
    @keyframes toastIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class RecruiterSearchComponent implements OnInit {
  currentUser: User | null = null;
  searchQuery = '';
  filterType = '';
  filterSkill = '';
  allSkills: string[] = [];
  isLoading = false;

  talents: any[] = [];
  filteredTalents: any[] = [];

  selectedProfile: any = null;
  contactTarget: any = null;
  emailSubject = '';
  emailBody = '';
  showToast = false;
  toastMessage = '';

  private authService = inject(AuthService);
  private http = inject(HttpClient);

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadTalentsFromApi();
  }

  loadTalentsFromApi() {
    this.isLoading = true;
    this.http.get<any[]>('/api/alumni/directory').subscribe({
      next: (alumni) => {
        this.talents = alumni.map(a => ({
          ...a,
          type: 'alumni',
          formation: a.speciality ? `${a.speciality} ${a.graduationYear || ''}` : (a.graduationYear ? `Promotion ${a.graduationYear}` : ''),
          location: a.sector || '',
          skills: a.skills || [],
          headline: a.currentJob ? `${a.currentJob}${a.currentCompany ? ' — ' + a.currentCompany : ''}` : '',
          bio: a.expertise || `Alumni diplômé(e) d'ENICarthage.`,
          avatarUrl: a.avatarUrl || null
        }));

        // Extract unique skills for the filter dropdown
        const skillSet = new Set<string>();
        this.talents.forEach(t => t.skills?.forEach((s: string) => skillSet.add(s)));
        this.allSkills = [...skillSet].sort();

        this.filteredTalents = [...this.talents];
        this.isLoading = false;
      },
      error: () => {
        this.talents = [];
        this.filteredTalents = [];
        this.isLoading = false;
      }
    });
  }

  filterTalents() {
    this.filteredTalents = this.talents.filter(t => {
      const matchesQuery = !this.searchQuery ||
        `${t.firstName} ${t.lastName} ${t.formation} ${(t.skills || []).join(' ')}`.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesType = !this.filterType || t.type === this.filterType;
      const matchesSkill = !this.filterSkill || (t.skills || []).includes(this.filterSkill);
      return matchesQuery && matchesType && matchesSkill;
    });
  }

  openProfile(talent: any) { this.selectedProfile = talent; }
  closeProfile() { this.selectedProfile = null; }
  openContact(talent: any) { this.contactTarget = talent; this.emailSubject = ''; this.emailBody = ''; }
  closeContact() { this.contactTarget = null; }

  getMailtoLink(talent: any): string {
    const subject = encodeURIComponent(this.emailSubject || 'Prise de contact via EduLink');
    const body = encodeURIComponent(this.emailBody || '');
    return `mailto:${talent.email}?subject=${subject}&body=${body}`;
  }

  sendEmail(talent: any) {
    const subject = encodeURIComponent(this.emailSubject || 'Prise de contact via EduLink');
    const body = encodeURIComponent(this.emailBody || '');
    window.open(`mailto:${talent.email}?subject=${subject}&body=${body}`, '_self');
    this.showToastMessage('Email prêt à envoyer via votre client de messagerie');
    this.closeContact();
  }

  showToastMessage(msg: string) {
    this.toastMessage = msg;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }
}
