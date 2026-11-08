import { Component, ElementRef, ViewChild, inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../shared/services/auth.service';
import { User } from '../shared/models/user.model';

const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  user: any = {};
  userType = '';
  isEditing = false;
  editData: any = {};
  selectedFile: File | null = null;
  message = '';

  private router = inject(Router);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.user = navigation.extras.state['user'] || {};
      this.userType = navigation.extras.state['userType'] || 'student';
    } else if (isPlatformBrowser(this.platformId)) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.user = currentUser;
        this.userType = currentUser.role || 'student';
      }
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.editData = { ...this.user };
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.editData = {};
  }

  saveProfile() {
    const endpointMap: Record<string, string> = {
      alumni: `/api/alumni/${this.user['id']}/profile`,
      recruiter: `/api/recruiters/${this.user['id']}/profile`,
      student: `/api/students/${this.user['id']}/profile`
    };
    const endpoint = endpointMap[this.userType];
    if (!endpoint) return;

    this.http.put(endpoint, this.editData).subscribe({
      next: (updatedUser: any) => {
        this.user = { ...updatedUser };
        this.isEditing = false;
        this.message = 'Profile updated successfully!';
        this.authService.setCurrentUser({ ...this.user, role: this.userType } as User);
        setTimeout(() => this.message = '', 3000);
      },
      error: () => {
        this.message = 'Failed to update profile.';
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      this.message = 'Seuls les fichiers PDF et Word sont acceptés.';
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      this.message = 'Le fichier ne doit pas dépasser 5 Mo.';
      return;
    }

    this.selectedFile = file;
    this.uploadResume();
  }

  uploadResume() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    const endpointMap: Record<string, string> = {
      alumni: `/api/alumni/${this.user['id']}/upload-resume`,
      student: `/api/students/${this.user['id']}/upload-resume`
    };
    const endpoint = endpointMap[this.userType];
    if (!endpoint) return;

    this.http.post(endpoint, formData).subscribe({
      next: (updatedUser: any) => {
        this.user = { ...updatedUser };
        this.message = 'Resume uploaded successfully!';
        this.authService.setCurrentUser({ ...this.user, role: this.userType } as User);
        setTimeout(() => this.message = '', 3000);
      },
      error: () => {
        this.message = 'Failed to upload resume.';
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}