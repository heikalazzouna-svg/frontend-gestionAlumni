import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { NotificationService } from '../../shared/services/notification.service';
import { UserMenuComponent } from '../../shared/user-menu/user-menu.component';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-alumni-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, UserMenuComponent],
  templateUrl: './alumni-dashboard.component.html',
  styleUrls: ['./alumni-dashboard.component.css']
})
export class AlumniDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isSidebarCollapsed = false;

  private router = inject(Router);
  private authService = inject(AuthService);
  notifService = inject(NotificationService);

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || !this.authService.hasRole(['alumni'])) {
      this.router.navigate(['/login']);
      return;
    }
    this.notifService.startPolling();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  ngOnDestroy(): void {
    this.notifService.stopPolling();
  }
}
