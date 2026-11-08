import { Injectable } from '@angular/core';
import { Offer, OfferModerationStatus } from '../models/offer.model';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private readonly storageKey = 'platform_offers_v2';

  getOffers(): Offer[] {
    return [...this.readStore()];
  }

  getApprovedOffers(): Offer[] {
    return this.readStore().filter(o => o.status === 'approved');
  }

  getOfferById(id: number): Offer | undefined {
    return this.readStore().find(o => o.id === id);
  }

  getOffersByRecruiter(recruiterEmail: string): Offer[] {
    return this.readStore().filter(offer => offer.recruiterEmail === recruiterEmail);
  }

  createOffer(offer: Omit<Offer, 'id' | 'postedDate' | 'applicants'>): Offer {
    const offers = this.readStore();
    const created: Offer = {
      ...offer,
      id: offers.length > 0 ? Math.max(...offers.map(o => o.id)) + 1 : 1,
      postedDate: new Date().toISOString(),
      applicants: 0
    };

    offers.unshift(created);
    this.writeStore(offers);
    return created;
  }

  updateOffer(id: number, data: Partial<Pick<Offer, 'title' | 'type' | 'company' | 'location' | 'description' | 'skills' | 'skillsList'>>): void {
    const offers = this.readStore();
    const offer = offers.find(o => o.id === id);
    if (!offer) return;

    Object.assign(offer, data);
    // Re-submit for moderation after edit
    offer.status = 'pending';
    offer.moderationReason = undefined;
    this.writeStore(offers);
  }

  updateOfferStatus(id: number, status: OfferModerationStatus, moderationReason?: string): void {
    const offers = this.readStore();
    const offer = offers.find(o => o.id === id);
    if (!offer) {
      return;
    }

    offer.status = status;
    offer.moderationReason = moderationReason;
    this.writeStore(offers);
  }

  deleteOffer(id: number): void {
    const offers = this.readStore().filter(o => o.id !== id);
    this.writeStore(offers);
  }

  formatDate(iso: string): string {
    if (!iso || !iso.includes('T')) return iso || '';
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  private readStore(): Offer[] {
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Offer[];
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // Fallback to seeded data if local storage is invalid.
      }
    }

    const seeded = this.seedData();
    this.writeStore(seeded);
    return seeded;
  }

  private writeStore(offers: Offer[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(offers));
  }

  private seedData(): Offer[] {
    const now = new Date();
    return [
      {
        id: 1,
        title: 'Développeur Full Stack Angular/Spring',
        type: 'CDI',
        company: 'TechCorp Tunisie',
        location: 'Tunis, Tunisie',
        description: 'Nous recherchons un développeur full stack pour contribuer à notre plateforme SaaS innovante. Vous travaillerez sur des projets complexes avec une stack moderne.',
        skills: 'Angular, Spring Boot, PostgreSQL, Docker',
        skillsList: ['Angular', 'Spring Boot', 'PostgreSQL', 'Docker'],
        applicants: 12,
        postedDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'approved',
        recruiterEmail: 'test@recruiter.com',
        recruiterName: 'Recruiter RH'
      },
      {
        id: 2,
        title: 'Stage PFE - Data Science & IA',
        type: 'Stage',
        company: 'DataLab',
        location: 'Sousse, Tunisie',
        description: 'Stage de fin d\'études en data science sur des cas d\'usage réels. Vous appliquerez des algorithmes ML/DL sur des datasets industriels.',
        skills: 'Python, TensorFlow, SQL, Pandas',
        skillsList: ['Python', 'TensorFlow', 'SQL', 'Pandas'],
        applicants: 8,
        postedDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        recruiterEmail: 'test@recruiter.com',
        recruiterName: 'Recruiter RH'
      },
      {
        id: 3,
        title: 'Ingénieur DevOps Cloud',
        type: 'CDD',
        company: 'CloudFirst',
        location: 'Télétravail',
        description: 'Mission de 12 mois pour mettre en place la CI/CD et l\'observabilité cloud sur nos environnements AWS.',
        skills: 'AWS, Kubernetes, Jenkins, Terraform',
        skillsList: ['AWS', 'Kubernetes', 'Jenkins', 'Terraform'],
        applicants: 5,
        postedDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'rejected',
        recruiterEmail: 'test@recruiter.com',
        recruiterName: 'Recruiter RH',
        moderationReason: 'Informations contractuelles insuffisantes. Veuillez préciser la durée exacte du CDD et la rémunération.'
      },
      {
        id: 4,
        title: 'Développeur Mobile React Native',
        type: 'CDI',
        company: 'AppFactory',
        location: 'Tunis, Tunisie',
        description: 'Rejoignez notre équipe mobile pour développer des applications cross-platform pour nos clients grands comptes.',
        skills: 'React Native, TypeScript, Redux, Firebase',
        skillsList: ['React Native', 'TypeScript', 'Redux', 'Firebase'],
        applicants: 3,
        postedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'approved',
        recruiterEmail: 'test@recruiter.com',
        recruiterName: 'Recruiter RH'
      },
      {
        id: 5,
        title: 'Stage Été - Cybersécurité',
        type: 'Stage',
        company: 'SecureNet',
        location: 'Sfax, Tunisie',
        description: 'Stage d\'été de 2 mois en cybersécurité. Audit de sécurité, tests de pénétration et mise en place de SIEM.',
        skills: 'Pentesting, SIEM, Linux, Wireshark',
        skillsList: ['Pentesting', 'SIEM', 'Linux', 'Wireshark'],
        applicants: 6,
        postedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'approved',
        recruiterEmail: 'test@recruiter.com',
        recruiterName: 'Recruiter RH'
      },
      {
        id: 6,
        title: 'Alternance UX/UI Designer',
        type: 'Alternance',
        company: 'DesignHub',
        location: 'Tunis, Tunisie',
        description: 'Alternance de 12 mois. Vous concevrez des interfaces utilisateur modernes et participerez aux recherches utilisateur.',
        skills: 'Figma, Adobe XD, HTML/CSS, User Research',
        skillsList: ['Figma', 'Adobe XD', 'HTML/CSS', 'User Research'],
        applicants: 4,
        postedDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'approved',
        recruiterEmail: 'test@recruiter.com',
        recruiterName: 'Recruiter RH'
      }
    ];
  }
}
