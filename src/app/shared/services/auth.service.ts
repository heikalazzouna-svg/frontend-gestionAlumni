import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getCurrentUser(): User | null {
    if (!this.isBrowser) return null;
    const json = localStorage.getItem('currentUser');
    if (!json) return null;
    try {
      return JSON.parse(json) as User;
    } catch {
      return null;
    }
  }

  setCurrentUser(user: User): void {
    if (!this.isBrowser) return;
    // Strip sensitive fields before storing
    const { ...safeUser } = user;
    delete (safeUser as any)['password'];
    delete (safeUser as any)['motDePasse'];
    localStorage.setItem('currentUser', JSON.stringify(safeUser));
  }

  getRole(): UserRole | null {
    return this.getCurrentUser()?.role ?? null;
  }

  hasRole(roles: UserRole[]): boolean {
    const role = this.getRole();
    return role !== null && roles.includes(role);
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  logout(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem('currentUser');
  }
}
