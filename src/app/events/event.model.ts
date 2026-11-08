export type EventType =
  | 'Forums entreprises'
  | 'Hackathons'
  | 'Conférences'
  | 'Ateliers'
  | 'Salons professionnels'
  | 'Événements networking'
  | 'Événements d\'entreprise'
  | 'Portes ouvertes';

export interface Event {
  id: number;
  title: string;
  description: string;
  type: EventType;
  startDate: string; // ISO format
  endDate?: string;
  duration: string;
  location: string;
  format: 'présentiel' | 'distanciel' | 'hybride';
  virtualLink?: string;
  seats: number;
  registeredCount: number;
  speakers?: string;
  schedule?: string;
  prerequisites?: string;
  targetAudience?: string;
  companies?: string;
  bannerUrl?: string;
  domain?: string;
  highlighted?: boolean;
  status?: string; // PENDING, APPROVED, REJECTED, CANCELLED
  createdByRole?: string; // ADMIN, RECRUITER
  createdAt?: string;
  participants?: any[];
}
