import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrls: ['../check-email/check-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  isLoading = true;
  isSuccess = false;
  errorMessage = '';

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const type = this.route.snapshot.queryParamMap.get('type');

    if (!token || !type) {
      this.isLoading = false;
      this.errorMessage = 'Lien de vérification invalide ou incomplet.';
      return;
    }

    let endpoint = '';
    if (type === 'student') endpoint = `/api/students/verify-account?token=${token}`;
    else if (type === 'alumni') endpoint = `/api/alumni/verify-account?token=${token}`;
    else if (type === 'recruiter') endpoint = `/api/recruiters/verify-account?token=${token}`;
    else {
      this.isLoading = false;
      this.errorMessage = 'Type d\'utilisateur inconnu.';
      return;
    }

    this.http.get(endpoint, { responseType: 'text' }).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
      },
      error: (err) => {
        this.isLoading = false;
        this.isSuccess = false;
        this.errorMessage = typeof err?.error === 'string' ? err.error : 'La vérification a échoué. Le lien est peut-être expiré ou déjà utilisé.';
      }
    });
  }
}
