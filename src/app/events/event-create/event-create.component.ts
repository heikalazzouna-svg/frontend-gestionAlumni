import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EventService } from '../event.service';
import { Event, EventType } from '../event.model';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-create.component.html',
  styleUrls: ['./event-create.component.css']
})
export class EventCreateComponent implements OnInit {
  event: Partial<Event> = {
    title: '',
    description: '',
    type: '' as any,
    startDate: '',
    endDate: '',
    duration: '',
    location: '',
    format: 'présentiel',
    virtualLink: '',
    seats: 0,
    domain: '',
    speakers: '',
    schedule: '',
    prerequisites: '',
    targetAudience: '',
    companies: '',
    bannerUrl: ''
  };

  eventTypes: EventType[] = [
    'Forums entreprises',
    'Hackathons',
    'Conférences',
    'Ateliers',
    'Salons professionnels',
    'Événements networking',
    "Événements d'entreprise",
    'Portes ouvertes'
  ];

  formats = ['présentiel', 'distanciel', 'hybride'];
  userRole = '';
  canCreate = false;

  constructor(private service: EventService, public router: Router, public route: ActivatedRoute) {}

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  ngOnInit(): void {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const parsed = JSON.parse(user);
      this.userRole = (parsed.role || '').toLowerCase();
    }
    this.canCreate = this.userRole === 'admin' || this.userRole === 'recruiter';
    if (!this.canCreate) {
      this.goBack();
    }
  }

  onSubmit(): void {
    const payload: any = { ...this.event };
    // Map frontend type labels to backend enum
    const typeMap: Record<string, string> = {
      'Forums entreprises': 'FORUM',
      'Hackathons': 'HACKATHON',
      'Conférences': 'CONFERENCE',
      'Ateliers': 'WORKSHOP',
      'Salons professionnels': 'SALON',
      'Événements networking': 'NETWORKING',
      "Événements d'entreprise": 'ENTREPRISE',
      'Portes ouvertes': 'PORTES_OUVERTES'
    };
    payload.type = typeMap[this.event.type as string] || 'CONFERENCE';
    payload.createdByRole = this.userRole.toUpperCase();

    this.service.createEvent(payload).subscribe({
      next: () => this.goBack(),
      error: (err) => console.error('Error creating event:', err)
    });
  }
}
