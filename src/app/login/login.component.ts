import { Component, NgZone, inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  login = {
    email: '',
    password: '',
    role: 'student'
  };
  errorMessage = '';
  isLoading = false;

  private http = inject(HttpClient);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);
  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  onLogin(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const email = this.login.email.trim();
    const password = this.login.password;

    if (!email || !password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }
    if (!this.emailPattern.test(email)) {
      this.errorMessage = 'Veuillez saisir une adresse email valide.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const endpointMap: { [key: string]: string } = {
      'student': '/api/students/login',
      'admin': '/api/admin/login',
      'alumni': '/api/alumni/login',
      'recruiter': '/api/recruiters/login'
    };

    const dashboardMap: { [key: string]: string } = {
      'student': '/student/home',
      'admin': '/admin/home',
      'alumni': '/alumni/home',
      'recruiter': '/recruiter/home'
    };

    const endpoint = endpointMap[this.login.role] || '/api/students/login';
    const payload = { email, password };

    this.http.post<any>(endpoint, payload).subscribe({
      next: (user) => {
        const currentUser = { ...user, role: this.login.role };
        this.authService.setCurrentUser(currentUser);

        const target = dashboardMap[this.login.role] || '/profile';

        this.ngZone.run(() => {
          this.isLoading = false;
          this.router.navigateByUrl(target);
        });
      },
      error: (err) => {
        this.isLoading = false;
        if (err?.status === 400 || err?.status === 401) {
          this.errorMessage = typeof err?.error === 'string' && err?.error.trim() !== '' ? err.error : (err?.error?.message || 'Email ou mot de passe incorrect.');
        } else if (err?.status === 0) {
          this.errorMessage = "Impossible de contacter le serveur. Vérifiez que le backend est lancé.";
        } else {
          this.errorMessage = typeof err?.error === 'string' && err?.error.trim() !== '' ? err.error : (err?.error?.message || err?.error?.userMessage || 'Erreur interne du serveur.');
        }
      }
    });
  }
}
