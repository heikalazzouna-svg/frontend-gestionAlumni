import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventService } from '../event.service';
import { Event } from '../event.model';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {
  event?: Event;
  isRegistered = false;
  currentUserId: number | null = null;
  registering = false;

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: EventService
  ) {}

  ngOnInit(): void {
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUserId = JSON.parse(user).id;
    }
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.service.getEvent(id).subscribe({
        next: (event) => {
          this.event = event;
          this.checkRegistration();
        },
        error: () => this.router.navigate(['/events'])
      });
    }
  }

  get typeLabel(): string {
    return this.typeLabels[this.event?.type as string] || (this.event?.type as string) || '';
  }

  get speakersList(): string[] {
    if (!this.event?.speakers) return [];
    return this.event.speakers.split(',').map(s => s.trim()).filter(s => s);
  }

  get companiesList(): string[] {
    if (!this.event?.companies) return [];
    return this.event.companies.split(',').map(s => s.trim()).filter(s => s);
  }

  get scheduleLines(): string[] {
    if (!this.event?.schedule) return [];
    return this.event.schedule.split('\n').map(s => s.trim()).filter(s => s);
  }

  get progressPercent(): number {
    if (!this.event || !this.event.seats) return 0;
    return Math.min(100, Math.round((this.event.registeredCount / this.event.seats) * 100));
  }

  private checkRegistration(): void {
    if (!this.event?.participants || !this.currentUserId) return;
    this.isRegistered = this.event.participants.some((p: any) => p.id === this.currentUserId);
  }

  register(): void {
    if (!this.event || !this.currentUserId || this.registering) return;
    this.registering = true;
    this.service.registerParticipant(this.event.id, this.currentUserId).subscribe({
      next: (updated) => {
        this.event = updated;
        this.isRegistered = true;
        this.registering = false;
      },
      error: (err) => {
        alert(err.error || 'Erreur lors de l\'inscription');
        this.registering = false;
      }
    });
  }

  unregister(): void {
    if (!this.event || !this.currentUserId || this.registering) return;
    this.registering = true;
    this.service.unregisterParticipant(this.event.id, this.currentUserId).subscribe({
      next: (updated) => {
        this.event = updated;
        this.isRegistered = false;
        this.registering = false;
      },
      error: () => this.registering = false
    });
  }

  shareEvent(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copi\u00e9 !');
    }
  }

  downloadCalendar(): void {
    if (!this.event) return;
    const start = (this.event.startDate || '').replace(/[-:]/g, '').replace('T', 'T');
    const end = (this.event.endDate || '').replace(/[-:]/g, '').replace('T', 'T') || start;
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      'DTSTART:' + start,
      'DTEND:' + end,
      'SUMMARY:' + this.event.title,
      'DESCRIPTION:' + (this.event.description || ''),
      'LOCATION:' + (this.event.location || ''),
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.event.title + '.ics';
    a.click();
    URL.revokeObjectURL(url);
  }
}
