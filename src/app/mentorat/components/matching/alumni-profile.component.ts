import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatchingService } from '../../services/matching.service';
import { MentorshipService } from '../../services/mentorship.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-alumni-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './alumni-profile.component.html',
  styleUrls: ['./alumni-profile.component.css']
})
export class AlumniProfileComponent implements OnInit {
  alumni: any;
  isLoading = true;
  showMentorshipForm = false;
  mentorshipRequest = {
    title: 'Demande de mentorat',
    details: '',
    objectives: '',
    duration: '3 mois'
  };
  requestSent = false;

  private route = inject(ActivatedRoute);
  private matchingService = inject(MatchingService);
  private mentorshipService = inject(MentorshipService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.matchingService.getAlumniProfile(id).subscribe({
      next: (data) => {
        this.alumni = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  submitMentorshipRequest(): void {
    const currentUser = this.authService.getCurrentUser();
    const request = {
      ...this.mentorshipRequest,
      proposer: { id: this.alumni.id },
      student: currentUser
    };
    
    this.mentorshipService.submitRequest(request).subscribe({
      next: () => {
        this.requestSent = true;
        this.showMentorshipForm = false;
      },
      error: () => {}
    });
  }
}
