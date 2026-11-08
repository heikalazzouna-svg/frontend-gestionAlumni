import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OfferService } from '../../shared/services/offer.service';
import { ApplicationService } from '../../shared/services/application.service';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-overview">
      <h1>Console d'Administration</h1>
      <p>Bienvenue dans votre centre de contrôle. Voici l'état actuel de la plateforme.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ totalOffers }}</div>
        <div class="stat-label">Total Offres</div>
        <div class="stat-trend neutral">Sur la plateforme</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ approvedOffers }}</div>
        <div class="stat-label">Offres Approuvées</div>
        <div class="stat-trend up">Actives</div>
      </div>
      <div class="stat-card highlight" *ngIf="pendingOffers > 0">
        <div class="stat-value">{{ pendingOffers }}</div>
        <div class="stat-label">Offres en attente</div>
        <a routerLink="/admin/offers" class="stat-action">Modérer maintenant</a>
      </div>
      <div class="stat-card" *ngIf="pendingOffers === 0">
        <div class="stat-value">0</div>
        <div class="stat-label">Offres en attente</div>
        <div class="stat-trend up">Tout est à jour ✓</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalApplications }}</div>
        <div class="stat-label">Candidatures</div>
        <div class="stat-trend neutral">Total reçues</div>
      </div>
    </div>

    <div class="admin-sections">
      <div class="system-health">
        <h3>État du Système</h3>
        <div class="health-item">
          <span>Base de données</span>
          <span class="status online">Opérationnel</span>
        </div>
        <div class="health-item">
          <span>Serveur API</span>
          <span class="status online">Opérationnel</span>
        </div>
        <div class="health-item">
          <span>Service Email</span>
          <span class="status warning">Latence élevée</span>
        </div>
      </div>

      <div class="quick-actions">
        <h3>Accès Rapide</h3>
        <a routerLink="/admin/offers" class="quick-link">
          <div class="ql-icon offers"><i class="fas fa-briefcase"></i></div>
          <div>
            <div class="ql-title">Modération Offres</div>
            <div class="ql-sub">{{ pendingOffers }} en attente</div>
          </div>
        </a>
        <a routerLink="/admin/users" class="quick-link">
          <div class="ql-icon users"><i class="fas fa-users"></i></div>
          <div>
            <div class="ql-title">Gestion Utilisateurs</div>
            <div class="ql-sub">Gérer les comptes</div>
          </div>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .admin-overview { margin-bottom: 32px; }
    .admin-overview h1 { font-size: 2rem; font-weight: 800; margin-bottom: 8px; }
    .admin-overview p { color: #A0AEC0; }

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
      transition: all 0.25s;
    }
    .stat-card:hover { transform: translateY(-3px); background: rgba(255, 255, 255, 0.05); }

    .stat-card.highlight {
      background: linear-gradient(135deg, rgba(255, 107, 45, 0.15), rgba(232, 82, 26, 0.15));
      border: 1px solid rgba(255, 107, 45, 0.3);
    }

    .stat-value { font-size: 2rem; font-weight: 800; margin-bottom: 4px; }
    .stat-label { color: #718096; font-size: 0.9rem; margin-bottom: 12px; }
    .stat-trend { font-size: 0.8rem; font-weight: 600; }
    .stat-trend.up { color: #48BB78; }
    .stat-trend.neutral { color: #A0AEC0; }
    .stat-action { color: #FF6B2D; font-weight: 700; cursor: pointer; text-decoration: underline; font-size: 0.85rem; }

    .admin-sections {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }

    .admin-sections h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 20px; color: #fff !important; }

    .system-health, .quick-actions {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 24px;
      padding: 24px;
    }

    .health-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    .status.online { color: #48BB78; font-weight: 600; }
    .status.warning { color: #ECC94B; font-weight: 600; }

    .quick-link {
      display: flex; align-items: center; gap: 14px;
      padding: 14px; border-radius: 14px;
      margin-bottom: 10px; text-decoration: none; color: inherit;
      border: 1px solid rgba(255, 255, 255, 0.04);
      transition: all 0.2s;
    }
    .quick-link:hover { background: rgba(255, 255, 255, 0.04); transform: translateX(4px); }
    .ql-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
    .ql-icon.offers { background: rgba(255, 107, 45, 0.12); color: #FF6B2D; }
    .ql-icon.users { background: rgba(74, 144, 226, 0.12); color: #4A90E2; }
    .ql-title { font-weight: 700; font-size: 0.92rem; }
    .ql-sub { font-size: 0.8rem; color: #718096; margin-top: 2px; }

    @media (max-width: 768px) {
      .admin-sections { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminHomeComponent implements OnInit {
  totalOffers = 0;
  approvedOffers = 0;
  pendingOffers = 0;
  totalApplications = 0;

  private offerService = inject(OfferService);
  private appService = inject(ApplicationService);

  ngOnInit(): void {
    const offers = this.offerService.getOffers();
    this.totalOffers = offers.length;
    this.approvedOffers = offers.filter(o => o.status === 'approved').length;
    this.pendingOffers = offers.filter(o => o.status === 'pending').length;
    this.totalApplications = this.appService.getApplications().length;
  }
}
