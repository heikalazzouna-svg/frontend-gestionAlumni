import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Offer, OfferModerationStatus } from '../../shared/models/offer.model';
import { OfferService } from '../../shared/services/offer.service';

@Component({
  selector: 'app-admin-offers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Modération Offres</h1>
        <p>Validez les offres publiées par les recruteurs avant diffusion.</p>
      </div>
      <div class="stats">
        <span class="chip pending">En attente: {{ countByStatus('pending') }}</span>
        <span class="chip approved">Approuvées: {{ countByStatus('approved') }}</span>
        <span class="chip rejected">Rejetées: {{ countByStatus('rejected') }}</span>
      </div>
    </div>

    <div class="toolbar">
      <input
        type="text"
        [(ngModel)]="search"
        placeholder="Rechercher par titre, entreprise ou recruteur"
      >
      <select [(ngModel)]="activeFilter">
        <option value="all">Toutes</option>
        <option value="pending">En attente</option>
        <option value="approved">Approuvées</option>
        <option value="rejected">Rejetées</option>
      </select>
    </div>

    <div class="offers" *ngIf="filteredOffers.length > 0; else emptyState">
      <article class="offer-card" *ngFor="let offer of filteredOffers">
        <header>
          <div class="title-wrap">
            <h3>{{ offer.title }}</h3>
            <p>{{ offer.company }} · {{ offer.location }}</p>
          </div>
          <span class="status" [ngClass]="offer.status">
            {{ statusLabel(offer.status) }}
          </span>
        </header>

        <div class="meta">
          <span class="badge">{{ offer.type }}</span>
          <span>Recruteur: {{ offer.recruiterEmail }}</span>
          <span>Soumise: {{ offer.postedDate }}</span>
        </div>

        <p class="description">{{ offer.description }}</p>

        <div class="reason" *ngIf="offer.moderationReason">
          Motif: {{ offer.moderationReason }}
        </div>

        <div class="actions">
          <button class="btn approve" (click)="approveOffer(offer)" [disabled]="offer.status === 'approved'">
            Approuver
          </button>
          <button class="btn reject" (click)="rejectOffer(offer)" [disabled]="offer.status === 'rejected'">
            Rejeter
          </button>
          <button class="btn ghost" (click)="removeOffer(offer)">
            Supprimer
          </button>
        </div>
      </article>
    </div>

    <ng-template #emptyState>
      <div class="empty">
        <h3>Aucune offre trouvée</h3>
        <p>Changez le filtre ou ajoutez des offres à modérer.</p>
      </div>
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 800;
      color: #1f2937;
    }

    .page-header p {
      margin: 6px 0 0;
      color: #6b7280;
    }

    .stats {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .chip {
      border-radius: 999px;
      padding: 6px 12px;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .chip.pending { background: #fff7ed; color: #c2410c; }
    .chip.approved { background: #ecfdf3; color: #166534; }
    .chip.rejected { background: #fef2f2; color: #991b1b; }

    .toolbar {
      display: grid;
      grid-template-columns: 1fr 220px;
      gap: 12px;
      margin-bottom: 18px;
    }

    .toolbar input,
    .toolbar select {
      border: 1px solid #d1d5db;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 0.92rem;
      outline: none;
      background: #fff;
    }

    .toolbar input:focus,
    .toolbar select:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
    }

    .offers {
      display: grid;
      gap: 14px;
    }

    .offer-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      padding: 16px;
    }

    .offer-card header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: flex-start;
    }

    .title-wrap h3 {
      margin: 0;
      font-size: 1.08rem;
      color: #111827;
    }

    .title-wrap p {
      margin: 4px 0 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .status {
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 0.75rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .status.pending { background: #fff7ed; color: #c2410c; }
    .status.approved { background: #ecfdf3; color: #166534; }
    .status.rejected { background: #fef2f2; color: #991b1b; }

    .meta {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin: 10px 0;
      color: #6b7280;
      font-size: 0.82rem;
    }

    .badge {
      background: #eff6ff;
      color: #1d4ed8;
      padding: 3px 8px;
      border-radius: 999px;
      font-weight: 700;
    }

    .description {
      margin: 0;
      color: #374151;
      line-height: 1.5;
      font-size: 0.9rem;
    }

    .reason {
      margin-top: 10px;
      border-left: 3px solid #ef4444;
      padding: 8px 10px;
      border-radius: 6px;
      background: #fef2f2;
      color: #7f1d1d;
      font-size: 0.84rem;
    }

    .actions {
      margin-top: 14px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .btn {
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 0.84rem;
      font-weight: 700;
      cursor: pointer;
    }

    .btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .btn.approve { background: #16a34a; color: #fff; }
    .btn.reject { background: #dc2626; color: #fff; }
    .btn.ghost {
      background: #fff;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .empty {
      text-align: center;
      border: 1px dashed #d1d5db;
      border-radius: 14px;
      padding: 36px 20px;
      color: #6b7280;
      background: #fff;
    }

    .empty h3 {
      margin: 0 0 8px;
      color: #111827;
    }

    @media (max-width: 780px) {
      .toolbar {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminOffersComponent implements OnInit {
  search = '';
  activeFilter: 'all' | OfferModerationStatus = 'all';
  offers: Offer[] = [];

  private offerService = inject(OfferService);

  ngOnInit(): void {
    this.reloadOffers();
  }

  get filteredOffers(): Offer[] {
    const query = this.search.trim().toLowerCase();

    return this.offers.filter(offer => {
      const matchesFilter = this.activeFilter === 'all' || offer.status === this.activeFilter;
      const matchesSearch = !query ||
        offer.title.toLowerCase().includes(query) ||
        offer.company.toLowerCase().includes(query) ||
        offer.recruiterEmail.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }

  countByStatus(status: OfferModerationStatus): number {
    return this.offers.filter(o => o.status === status).length;
  }

  statusLabel(status: OfferModerationStatus): string {
    if (status === 'pending') return 'En attente';
    if (status === 'approved') return 'Approuvée';
    return 'Rejetée';
  }

  approveOffer(offer: Offer): void {
    this.offerService.updateOfferStatus(offer.id, 'approved');
    this.reloadOffers();
  }

  rejectOffer(offer: Offer): void {
    const reason = offer.moderationReason || 'Contenu incomplet ou non conforme a la charte de publication.';
    this.offerService.updateOfferStatus(offer.id, 'rejected', reason);
    this.reloadOffers();
  }

  removeOffer(offer: Offer): void {
    this.offerService.deleteOffer(offer.id);
    this.reloadOffers();
  }

  private reloadOffers(): void {
    this.offers = this.offerService.getOffers();
  }
}
