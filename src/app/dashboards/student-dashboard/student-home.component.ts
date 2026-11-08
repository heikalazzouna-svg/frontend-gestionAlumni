import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../shared/models/user.model';
import { OfferService } from '../../shared/services/offer.service';
import { ApplicationService } from '../../shared/services/application.service';

@Component({
  selector: 'app-student-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="welcome-section">
      <h1>Bienvenue, {{ currentUser?.firstName }} ! 👋</h1>
      <p>Voici un aperçu de votre activité et des opportunités récentes.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-briefcase"></i></div>
        <div class="stat-info">
          <h3>{{ availableOffers }}</h3>
          <p>Offres Disponibles</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon sent"><i class="fas fa-paper-plane"></i></div>
        <div class="stat-info">
          <h3>{{ myApplications }}</h3>
          <p>Mes Candidatures</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon events"><i class="fas fa-calendar-alt"></i></div>
        <div class="stat-info">
          <h3>{{ pendingApplications }}</h3>
          <p>En Attente</p>
        </div>
      </div>
    </div>

    <div class="recent-sections">
      <div class="offers-preview">
        <div class="section-header">
          <h2>Offres Récentes</h2>
          <a routerLink="/student/offers" class="view-all">Voir tout</a>
        </div>
        <div class="preview-list">
          <div class="preview-item" *ngFor="let offer of recentOffers">
            <div class="company-logo">{{ offer.company.charAt(0) }}</div>
            <div class="item-details">
              <h4>{{ offer.title }}</h4>
              <p>{{ offer.company }} • {{ offer.location }}</p>
            </div>
            <span class="offer-type-badge">{{ offer.type }}</span>
          </div>
          <div class="preview-empty" *ngIf="recentOffers.length === 0">
            <p>Aucune offre disponible pour le moment.</p>
          </div>
        </div>
      </div>

      <div class="mentorship-preview">
        <div class="section-header">
          <h2>Mentorat & Conseils</h2>
        </div>
        <div class="mentorship-card">
          <p>Besoin de conseils pour votre carrière ?</p>
          <a routerLink="/student/mentorat/matching" class="cta-btn">Contacter un mentor</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome-section { margin-bottom: 32px; }
    .welcome-section h1 { font-size: 2rem; margin-bottom: 8px; font-weight: 800; }
    .welcome-section p { color: #A0AEC0; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      transition: all 0.25s;
    }
    .stat-card:hover { transform: translateY(-3px); background: rgba(255, 255, 255, 0.05); }

    .stat-icon {
      width: 56px; height: 56px;
      background: rgba(74, 144, 226, 0.1); color: #4A90E2;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem;
    }
    .stat-icon.sent { background: rgba(139, 70, 232, 0.1); color: #8B46E8; }
    .stat-icon.events { background: rgba(236, 201, 75, 0.1); color: #ECC94B; }

    .stat-info h3 { font-size: 1.5rem; margin: 0; font-weight: 700; }
    .stat-info p { margin: 0; color: #718096; font-size: 0.9rem; }

    .recent-sections {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 32px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .section-header h2 { font-size: 1.25rem; font-weight: 700; color: #fff !important; margin: 0; }
    .view-all { background: transparent; border: none; color: #4A90E2; cursor: pointer; font-weight: 600; text-decoration: none; }

    .preview-list { display: flex; flex-direction: column; gap: 12px; }
    .preview-item {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04);
      padding: 16px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.2s;
    }
    .preview-item:hover { background: rgba(255, 255, 255, 0.05); transform: translateX(5px); }
    .company-logo {
      width: 48px; height: 48px;
      background: linear-gradient(135deg, #2D3748, #1A202C);
      color: #fff; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 1.2rem; flex-shrink: 0;
    }
    .item-details { flex: 1; }
    .item-details h4 { margin: 0 0 4px 0; font-weight: 600; }
    .item-details p { margin: 0; color: #718096; font-size: 0.85rem; }
    .offer-type-badge {
      background: rgba(74, 144, 226, 0.1); color: #4A90E2;
      padding: 4px 10px; border-radius: 8px;
      font-size: 0.72rem; font-weight: 700; flex-shrink: 0;
    }
    .preview-empty { color: #718096; text-align: center; padding: 20px; }

    .mentorship-card {
      background: linear-gradient(135deg, rgba(139, 70, 232, 0.2), rgba(74, 144, 226, 0.2));
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 32px; border-radius: 24px; text-align: center;
    }
    .mentorship-card p { margin-bottom: 20px; font-weight: 500; }
    .cta-btn {
      display: inline-block;
      background: #fff; color: #000; border: none;
      padding: 10px 20px; border-radius: 12px;
      font-weight: 700; cursor: pointer; text-decoration: none;
      transition: all 0.2s;
    }
    .cta-btn:hover { transform: scale(1.05); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }

    @media (max-width: 1000px) {
      .recent-sections { grid-template-columns: 1fr; }
    }
  `]
})
export class StudentHomeComponent implements OnInit {
  currentUser: User | null = null;
  availableOffers = 0;
  myApplications = 0;
  pendingApplications = 0;
  recentOffers: any[] = [];

  private authService = inject(AuthService);
  private offerService = inject(OfferService);
  private appService = inject(ApplicationService);

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    // Real offer count (only approved)
    const approved = this.offerService.getApprovedOffers();
    this.availableOffers = approved.length;
    this.recentOffers = approved.slice(0, 3);

    // Real application stats
    if (this.currentUser?.email) {
      const apps = this.appService.getApplicationsByStudent(this.currentUser.email);
      this.myApplications = apps.length;
      this.pendingApplications = apps.filter(a => a.status === 'pending').length;
    }
  }
}
