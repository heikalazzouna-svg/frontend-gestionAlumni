import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MentorshipService } from '../../services/mentorship.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mentor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mentor-dashboard.component.html',
  styleUrls: ['./mentor-dashboard.component.css']
})
export class MentorDashboardComponent implements OnInit {
  requests: any[] = [];
  isLoading = true;
  activeFilter: 'all' | 'pending' | 'accepted' | 'completed' = 'all';
  successMessage = '';

  private mentorshipService = inject(MentorshipService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.id) {
      this.isLoading = false;
      return;
    }
    this.mentorshipService.getAlumniRequests(currentUser.id).subscribe({
      next: (data) => {
        this.requests = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  get filteredRequests(): any[] {
    if (this.activeFilter === 'all') return this.requests;
    return this.requests.filter(r => r.status?.toLowerCase() === this.activeFilter);
  }

  get pendingCount(): number {
    return this.requests.filter(r => r.status === 'PENDING').length;
  }

  get acceptedCount(): number {
    return this.requests.filter(r => r.status === 'ACCEPTED').length;
  }

  get completedCount(): number {
    return this.requests.filter(r => r.status === 'COMPLETED').length;
  }

  acceptRequest(req: any): void {
    this.mentorshipService.updateRequestStatus(req.id, 'ACCEPTED').subscribe(() => {
      req.status = 'ACCEPTED';
      this.showSuccess('Demande acceptée ! Le mentorat peut commencer.');
    });
  }

  rejectRequest(req: any): void {
    this.mentorshipService.updateRequestStatus(req.id, 'REJECTED').subscribe(() => {
      req.status = 'REJECTED';
      this.showSuccess('Demande refusée.');
    });
  }

  goToTracking(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.router.navigate([`/${currentUser.role || 'alumni'}/mentorat/tracking`]);
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
