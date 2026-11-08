import { Injectable, inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ChatService } from '../../mentorat/services/chat.service';
import { ApplicationService } from './application.service';
import { AuthService } from './auth.service';

export interface NotificationCounts {
  messages: number;
  candidatures: number;
  offers: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private chatService = inject(ChatService);
  private appService = inject(ApplicationService);
  private authService = inject(AuthService);

  private intervalId: ReturnType<typeof setInterval> | null = null;

  counts: NotificationCounts = { messages: 0, candidatures: 0, offers: 0 };

  /** Start polling notifications every 5s */
  startPolling(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.refresh();
    if (!this.intervalId) {
      this.intervalId = setInterval(() => this.refresh(), 5000);
    }
  }

  stopPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  refresh(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    // --- Unread messages (via REST API) ---
    if (user.id) {
      this.chatService.getUnreadCount(user.id).subscribe(res => {
        this.counts.messages = res?.count ?? 0;
      });
    }

    // --- Pending candidatures for recruiter ---
    if (user.role === 'recruiter') {
      const pending = this.appService.getApplications().filter(a => a.status === 'pending');
      this.counts.candidatures = pending.length;
    }

    // --- Application status updates for student ---
    if (user.role === 'student') {
      const myApps = this.appService.getApplicationsByStudent(user.email);
      const seen = this.getSeenSet('notif_seen_status');
      this.counts.offers = myApps.filter(a =>
        a.status !== 'pending' && !seen.has(String(a.id))
      ).length;
    }
  }

  /** Mark all offer status notifications as seen for this user */
  markOffersSeen(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;
    const myApps = this.appService.getApplicationsByStudent(user.email);
    const ids = myApps.filter(a => a.status !== 'pending').map(a => String(a.id));
    this.saveSeenSet('notif_seen_status', ids);
    this.counts.offers = 0;
  }

  /** Mark candidatures as seen for recruiter */
  markCandidaturesSeen(): void {
    this.counts.candidatures = 0;
  }

  private getSeenSet(key: string): Set<string> {
    if (!isPlatformBrowser(this.platformId)) return new Set();
    const data = localStorage.getItem(key);
    return data ? new Set(JSON.parse(data)) : new Set();
  }

  private saveSeenSet(key: string, ids: string[]): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(key, JSON.stringify(ids));
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}
