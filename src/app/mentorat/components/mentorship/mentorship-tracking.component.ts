import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MentorshipService } from '../../services/mentorship.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mentorship-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mentorship-tracking.component.html',
  styleUrls: ['./mentorship-tracking.component.css']
})
export class MentorshipTrackingComponent implements OnInit {
  requests: any[] = [];
  selectedRequest: any = null;
  sessions: any[] = [];
  goals: any[] = [];
  evaluations: any[] = [];
  isLoading = true;
  activeTab: 'info' | 'sessions' | 'goals' | 'evaluation' = 'info';

  showSessionForm = false;
  showGoalForm = false;
  showEvalForm = false;

  newSession = {
    topic: '',
    summary: '',
    nextSteps: '',
    sessionDate: '',
    duration: 60
  };

  newGoal = {
    description: ''
  };

  newEvaluation = {
    rating: 5,
    comment: '',
    evaluatorRole: 'MENTEE'
  };

  successMessage = '';

  private mentorshipService = inject(MentorshipService);

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.id) {
      this.isLoading = false;
      return;
    }

    const role = currentUser.role || '';
    if (role === 'alumni') {
      this.mentorshipService.getAlumniRequests(currentUser.id).subscribe({
        next: (data) => {
          this.requests = data;
          this.isLoading = false;
          if (data.length > 0) this.selectRequest(data[0]);
        },
        error: () => this.isLoading = false
      });
    } else {
      this.mentorshipService.getStudentRequests(currentUser.id).subscribe({
        next: (data) => {
          this.requests = data;
          this.isLoading = false;
          if (data.length > 0) this.selectRequest(data[0]);
        },
        error: () => this.isLoading = false
      });
    }
  }

  selectRequest(req: any): void {
    this.selectedRequest = req;
    this.activeTab = 'info';
    this.loadRequestData();
  }

  loadRequestData(): void {
    if (!this.selectedRequest) return;
    const id = this.selectedRequest.id;
    this.mentorshipService.getSessions(id).subscribe(data => this.sessions = data);
    this.mentorshipService.getGoals(id).subscribe(data => this.goals = data);
    this.mentorshipService.getEvaluations(id).subscribe(data => this.evaluations = data);
  }

  // ── Stats ─────────────────────────────────────────

  get totalSessions(): number {
    return this.sessions.length;
  }

  get completedGoals(): number {
    return this.goals.filter(g => g.status === 'COMPLETED').length;
  }

  get goalProgress(): number {
    if (this.goals.length === 0) return 0;
    return Math.round((this.completedGoals / this.goals.length) * 100);
  }

  get daysRemaining(): number {
    if (!this.selectedRequest?.endDate) return 0;
    const end = new Date(this.selectedRequest.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  get durationProgress(): number {
    if (!this.selectedRequest?.startDate || !this.selectedRequest?.endDate) return 0;
    const start = new Date(this.selectedRequest.startDate).getTime();
    const end = new Date(this.selectedRequest.endDate).getTime();
    const now = new Date().getTime();
    if (now >= end) return 100;
    if (now <= start) return 0;
    return Math.round(((now - start) / (end - start)) * 100);
  }

  get averageRating(): number {
    if (this.evaluations.length === 0) return 0;
    const sum = this.evaluations.reduce((a, e) => a + e.rating, 0);
    return Math.round((sum / this.evaluations.length) * 10) / 10;
  }

  getStars(rating: number): number[] {
    return Array.from({length: 5}, (_, i) => i < rating ? 1 : 0);
  }

  // ── Sessions ──────────────────────────────────────

  addSession(): void {
    if (!this.newSession.topic) return;
    const session = {
      ...this.newSession,
      mentorshipRequest: { id: this.selectedRequest.id }
    };
    this.mentorshipService.addSession(session).subscribe(() => {
      this.loadRequestData();
      this.newSession = { topic: '', summary: '', nextSteps: '', sessionDate: '', duration: 60 };
      this.showSessionForm = false;
      this.showSuccess('Session ajoutée avec succès !');
    });
  }

  // ── Goals ─────────────────────────────────────────

  addGoal(): void {
    if (!this.newGoal.description) return;
    const goal = {
      description: this.newGoal.description,
      status: 'NOT_STARTED',
      mentorshipRequest: { id: this.selectedRequest.id }
    };
    this.mentorshipService.createGoal(goal).subscribe(() => {
      this.loadRequestData();
      this.newGoal = { description: '' };
      this.showGoalForm = false;
      this.showSuccess('Objectif ajouté !');
    });
  }

  cycleGoalStatus(goal: any): void {
    const statusFlow: Record<string, string> = {
      'NOT_STARTED': 'IN_PROGRESS',
      'IN_PROGRESS': 'COMPLETED',
      'COMPLETED': 'NOT_STARTED'
    };
    const newStatus = statusFlow[goal.status] || 'NOT_STARTED';
    this.mentorshipService.updateGoalStatus(goal.id, newStatus).subscribe(() => {
      goal.status = newStatus;
    });
  }

  getGoalStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'NOT_STARTED': 'À faire',
      'IN_PROGRESS': 'En cours',
      'COMPLETED': 'Terminé'
    };
    return labels[status] || status;
  }

  // ── Evaluations ───────────────────────────────────

  submitEvaluation(): void {
    if (!this.newEvaluation.comment) return;
    const evaluation = {
      ...this.newEvaluation,
      mentorshipRequest: { id: this.selectedRequest.id }
    };
    this.mentorshipService.submitEvaluation(evaluation).subscribe(() => {
      this.loadRequestData();
      this.newEvaluation = { rating: 5, comment: '', evaluatorRole: 'MENTEE' };
      this.showEvalForm = false;
      this.showSuccess('Évaluation envoyée !');
    });
  }

  setRating(rating: number): void {
    this.newEvaluation.rating = rating;
  }

  // ── Actions ───────────────────────────────────────

  cancelRequest(): void {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce mentorat ?')) return;
    this.mentorshipService.cancelRequest(this.selectedRequest.id).subscribe(() => {
      this.selectedRequest.status = 'CANCELLED';
      this.showSuccess('Mentorat annulé.');
    });
  }

  completeRequest(): void {
    if (!confirm('Marquer ce mentorat comme terminé ?')) return;
    this.mentorshipService.completeRequest(this.selectedRequest.id).subscribe(() => {
      this.selectedRequest.status = 'COMPLETED';
      this.showSuccess('Mentorat terminé avec succès !');
    });
  }

  acceptRequest(): void {
    this.mentorshipService.updateRequestStatus(this.selectedRequest.id, 'ACCEPTED').subscribe(() => {
      this.selectedRequest.status = 'ACCEPTED';
      this.showSuccess('Demande acceptée !');
    });
  }

  rejectRequest(): void {
    this.mentorshipService.updateRequestStatus(this.selectedRequest.id, 'REJECTED').subscribe(() => {
      this.selectedRequest.status = 'REJECTED';
      this.showSuccess('Demande refusée.');
    });
  }

  isAlumni(): boolean {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.role === 'alumni';
  }

  getMentorName(): string {
    const req = this.selectedRequest;
    if (!req) return '';
    if (this.isAlumni()) {
      return req.student ? `${req.student.firstName} ${req.student.lastName}` : 'Étudiant';
    }
    return req.proposer ? `${req.proposer.firstName} ${req.proposer.lastName}` : 'Mentor';
  }

  getPartnerLabel(): string {
    return this.isAlumni() ? 'Étudiant' : 'Mentor';
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
