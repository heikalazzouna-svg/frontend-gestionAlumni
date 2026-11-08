import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../event.service';
import { Event, EventType } from '../event.model';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsListComponent implements OnInit {
  events: Event[] = [];
  filtered: Event[] = [];

  search = '';
  typeFilter = '';
  formatFilter = '';

  canCreate = false;

  typeLabels: Record<string, string> = {
    'FORUM': 'Forums entreprises',
    'HACKATHON': 'Hackathons',
    'CONFERENCE': 'Conf\u00e9rences',
    'WORKSHOP': 'Ateliers',
    'SALON': 'Salons professionnels',
    'NETWORKING': '\u00c9v\u00e9nements networking',
    'ENTREPRISE': '\u00c9v\u00e9nements d\'entreprise',
    'PORTES_OUVERTES': 'Portes ouvertes'
  };

  eventTypes: string[] = [
    'FORUM', 'HACKATHON', 'CONFERENCE', 'WORKSHOP',
    'SALON', 'NETWORKING', 'ENTREPRISE', 'PORTES_OUVERTES'
  ];

  constructor(
    private service: EventService,
    public router: Router,
    public route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  iconForType(type: string): string {
    const icons: Record<string, string> = {
      'HACKATHON': '\ud83c\udfc6', 'FORUM': '\ud83c\udfe2', 'CONFERENCE': '\ud83c\udfa4',
      'WORKSHOP': '\ud83d\udee0', 'ENTREPRISE': '\ud83c\udfe2', 'SALON': '\ud83c\udfaa',
      'NETWORKING': '\ud83e\udd1d', 'PORTES_OUVERTES': '\ud83d\ude80'
    };
    return icons[type] || '\ud83d\udcc5';
  }

  colorForType(type: string): string {
    const colors: Record<string, string> = {
      'HACKATHON': '#1A6EE8', 'FORUM': '#1252B5', 'CONFERENCE': '#27AE7A',
      'WORKSHOP': '#8B46E8', 'ENTREPRISE': '#D4A843', 'SALON': '#E8521A',
      'NETWORKING': '#C73A08', 'PORTES_OUVERTES': '#8B46E8'
    };
    return colors[type] || '#999';
  }

  labelForType(type: string): string {
    return this.typeLabels[type] || type;
  }

  progressPercent(e: Event): number {
    if (!e.seats) return 0;
    return Math.min(100, Math.round((e.registeredCount / e.seats) * 100));
  }

  featuredEvent(): Event | undefined {
    return this.events.find(e => e.highlighted) ?? (this.events.length > 0 ? this.events[0] : undefined);
  }

  get onlineCount(): number {
    return this.events.filter(e => e.format === 'distanciel').length;
  }

  get totalSeats(): number {
    return this.events.reduce((sum, e) => sum + (e.seats || 0), 0);
  }

  ngOnInit(): void {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const role = (JSON.parse(user).role || '').toLowerCase();
      this.canCreate = role === 'admin' || role === 'recruiter';
    }

    this.service.getEvents().subscribe(ev => {
      this.events = ev;
      this.applyFilters();
      this.cdr.markForCheck();
    });
  }

  applyFilters(): void {
    this.filtered = this.events.filter(e => {
      let ok = true;
      if (this.search) {
        ok = ok && e.title.toLowerCase().includes(this.search.toLowerCase());
      }
      if (this.typeFilter) {
        ok = ok && (e.type as string) === this.typeFilter;
      }
      if (this.formatFilter) {
        ok = ok && e.format === this.formatFilter;
      }
      return ok;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    this.cdr.markForCheck();
  }

  clearFilters(): void {
    this.search = '';
    this.typeFilter = '';
    this.formatFilter = '';
    this.applyFilters();
  }

  goToDetail(id: number): void {
    this.router.navigate([id], { relativeTo: this.route });
  }

  trackByEventId(_index: number, event: Event): number {
    return event.id;
  }
}
