
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignUpComponent {

  isSignUpTab: boolean = true;
  userType: string = 'student';
  showPassword: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;

  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  student = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  };

  alumni = {
    firstName: '',
    lastName: '',
    graduationYear: null as number | null,
    email: '',
    password: '',
    speciality: ''
  };

  recruiter = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: '',
    sector: '',
    location: ''
  };

  selectUserType(type: string): void {
    this.userType = type;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  private validate(): boolean {
    let data: { email: string; password: string; firstName: string; lastName: string };
    if (this.userType === 'student') data = this.student;
    else if (this.userType === 'alumni') data = this.alumni;
    else data = this.recruiter;

    if (!data.firstName.trim() || !data.lastName.trim() || !data.email.trim() || !data.password) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return false;
    }
    if (!this.emailPattern.test(data.email.trim())) {
      this.errorMessage = 'Veuillez saisir une adresse email valide.';
      return false;
    }
    if (data.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      return false;
    }
    return true;
  }

  onSubmit(): void {
    this.errorMessage = '';
    if (!this.validate()) return;

    this.isLoading = true;

    let signupData: Record<string, unknown>;
    let endpoint: string;

    if (this.userType === 'student') {
      signupData = this.student;
      endpoint = '/api/students/signup';
    } else if (this.userType === 'alumni') {
      signupData = this.alumni;
      endpoint = '/api/alumni/signup';
    } else {
      signupData = this.recruiter;
      endpoint = '/api/recruiters/signup';
    }

    this.http.post(endpoint, signupData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/check-email']);
      },
      error: (err) => {
        this.isLoading = false;
        if (typeof err?.error === 'string' && err.error.trim().length > 0) {
          this.errorMessage = err.error;
        } else if (err?.error?.message) {
          this.errorMessage = err.error.message;
        } else if (err?.status === 0) {
          this.errorMessage = "Impossible de contacter le serveur. Vérifiez votre connexion.";
        } else {
          this.errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
        }
      }
    });
  }
}