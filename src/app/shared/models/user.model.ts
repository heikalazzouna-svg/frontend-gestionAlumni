export type UserRole = 'student' | 'admin' | 'alumni' | 'recruiter';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  graduationYear?: number;
  speciality?: string;
  companyName?: string;
  sector?: string;
  location?: string;
  resumeUrl?: string;
  avatarUrl?: string;
  [key: string]: unknown;
}
