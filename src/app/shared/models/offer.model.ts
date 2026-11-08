export type OfferType = 'CDI' | 'CDD' | 'Stage' | 'Alternance' | 'Freelance';

export type OfferModerationStatus = 'pending' | 'approved' | 'rejected';

export interface Offer {
  id: number;
  title: string;
  type: OfferType;
  company: string;
  location: string;
  description: string;
  skills: string;
  skillsList: string[];
  applicants: number;
  postedDate: string;
  status: OfferModerationStatus;
  recruiterEmail: string;
  recruiterName?: string;
  moderationReason?: string;
}
