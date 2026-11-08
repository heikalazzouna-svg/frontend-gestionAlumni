import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MentorshipService } from '../../services/mentorship.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-mentorship-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mentorship-request.component.html',
  styleUrls: ['./mentorship-request.component.css']
})
export class MentorshipRequestComponent implements OnInit {
  alumniId!: number;
  alumni: any = null;
  isLoading = true;
  isSubmitting = false;
  submitted = false;

  request = {
    title: '',
    message: '',
    objectives: '',
    category: 'Carrière',
    duration: '3 mois',
    startDate: '',
    endDate: ''
  };

  categories = ['Carrière', 'Technique', 'Réseau', 'Académique', 'Projet', 'Autre'];
  durations = ['1 mois', '2 mois', '3 mois', '6 mois', '12 mois'];

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private mentorshipService = inject(MentorshipService);

  ngOnInit(): void {
    this.alumniId = Number(this.route.snapshot.paramMap.get('alumniId'));
    this.http.get<any>(`/api/alumni/directory/${this.alumniId}`).subscribe({
      next: (data) => {
        this.alumni = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });

    // Set default start date to today
    const today = new Date();
    this.request.startDate = today.toISOString().split('T')[0];
    // Default end date 3 months from now
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 3);
    this.request.endDate = endDate.toISOString().split('T')[0];
  }

  submitRequest(): void {
    if (!this.request.title || !this.request.message || !this.request.objectives) return;
    
    this.isSubmitting = true;
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const payload = {
      title: this.request.title,
      details: this.request.message,
      message: this.request.message,
      objectives: this.request.objectives,
      category: this.request.category,
      duration: this.request.duration,
      startDate: this.request.startDate,
      endDate: this.request.endDate,
      student: { id: currentUser.id },
      proposer: { id: this.alumniId }
    };

    this.mentorshipService.submitRequest(payload).subscribe({
      next: () => {
        this.submitted = true;
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
        alert('Erreur lors de l\'envoi de la demande.');
      }
    });
  }

  goBack(): void {
    window.history.back();
  }

  goToTracking(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const role = currentUser.role || 'student';
    this.router.navigate([`/${role}/mentorat/tracking`]);
  }
}
