import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../shared/models/user.model';
import { OfferService } from '../../shared/services/offer.service';
import { ApplicationService } from '../../shared/services/application.service';

@Component({
  selector: 'app-recruiter-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="welcome-section">
      <h1>Bienvenue, {{ currentUser?.firstName }} ! 🤝</h1>
      <p>Trouvez les meilleurs talents parmi les diplômés d'Enicarthage.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon offers">
          <i class="fas fa-briefcase"></i>
        </div>
        <div class="stat-info">
          <h3>{{ approvedCount }}</h3>
          <p>Offres actives</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pending">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-info">
          <h3>{{ pendingCount }}</h3>
          <p>En attente de modération</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon candidates">
          <i class="fas fa-user-tie"></i>
        </div>
        <div class="stat-info">
          <h3>{{ applicationCount }}</h3>
          <p>Candidatures reçues</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon total">
          <i class="fas fa-layer-group"></i>
        </div>
        <div class="stat-info">
          <h3>{{ totalOffers }}</h3>
          <p>Total offres</p>
        </div>
      </div>
    </div>

    <div class="action-sections">
      <div class="post-job-card">
        <div class="pjc-icon"><i class="fas fa-plus-circle"></i></div>
        <h3>Publier une nouvelle offre</h3>
        <p>Boostez votre équipe avec des talents qualifiés.</p>
        <a routerLink="/recruiter/offers" class="action-btn">Publier maintenant</a>
      </div>
      <div class="post-job-card view-card">
        <div class="pjc-icon apps"><i class="fas fa-inbox"></i></div>
        <h3>Consulter les candidatures</h3>
        <p>Gérez les candidatures reçues pour vos offres.</p>
        <a routerLink="/recruiter/applications" class="action-btn secondary">Voir les candidatures</a>
      </div>
    </div>
  `,
  styles: [`
    .welcome-section { margin-bottom: 32px; }
    .welcome-section h1 { font-size: 2rem; font-weight: 800; margin-bottom: 8px; }
    .welcome-section p { color: #A0AEC0; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
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
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem;
    }
    .stat-icon.offers { background: rgba(39, 174, 96, 0.12); color: #27ae60; }
    .stat-icon.pending { background: rgba(243, 156, 18, 0.12); color: #f39c12; }
    .stat-icon.candidates { background: rgba(74, 144, 226, 0.12); color: #4A90E2; }
    .stat-icon.total { background: rgba(139, 70, 232, 0.12); color: #8B46E8; }

    .stat-info h3 { font-size: 1.6rem; margin: 0; font-weight: 800; }
    .stat-info p { margin: 0; color: #718096; font-size: 0.88rem; }

    .action-sections {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .post-job-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 32px;
      border-radius: 24px;
      text-align: center;
      transition: all 0.25s;
    }
    .post-job-card:hover { border-color: rgba(139, 70, 232, 0.3); }

    .pjc-icon {
      width: 64px; height: 64px; margin: 0 auto 16px;
      background: rgba(139, 70, 232, 0.12); color: #8B46E8;
      border-radius: 18px; display: flex; align-items: center; justify-content: center;
      font-size: 1.6rem;
    }
    .pjc-icon.apps { background: rgba(74, 144, 226, 0.12); color: #4A90E2; }

    .post-job-card h3 { font-size: 1.1rem; margin: 0 0 8px; font-weight: 700; }
    .post-job-card p { color: #718096; font-size: 0.9rem; margin: 0 0 20px; }

    .action-btn {
      display: inline-block;
      background: #8B46E8; color: #fff; border: none;
      padding: 10px 24px; border-radius: 12px;
      font-weight: 700; cursor: pointer;
      text-decoration: none; font-size: 0.9rem;
      transition: all 0.2s;
    }
    .action-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(139, 70, 232, 0.3); }
    .action-btn.secondary { background: #4A90E2; }
    .action-btn.secondary:hover { box-shadow: 0 6px 20px rgba(74, 144, 226, 0.3); }

    @media (max-width: 768px) {
      .action-sections { grid-template-columns: 1fr; }
    }
  `]
})
export class RecruiterHomeComponent implements OnInit {
  currentUser: User | null = null;
  totalOffers = 0;
  approvedCount = 0;
  pendingCount = 0;
  applicationCount = 0;

  private authService = inject(AuthService);
  private offerService = inject(OfferService);
  private appService = inject(ApplicationService);

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadStats();
  }

  private loadStats(): void {
    const email = this.currentUser?.email || '';
    const offers = email ? this.offerService.getOffersByRecruiter(email) : this.offerService.getOffers();
    this.totalOffers = offers.length;
    this.approvedCount = offers.filter(o => o.status === 'approved').length;
    this.pendingCount = offers.filter(o => o.status === 'pending').length;
    this.applicationCount = this.appService.getApplications().length;
  }
}
