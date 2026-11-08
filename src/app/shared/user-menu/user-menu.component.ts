import { Component, Input, Output, EventEmitter, ElementRef, HostListener, inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.css']
})
export class UserMenuComponent implements OnInit {
  @Input() user: User | null = null;
  @Input() notificationCount = 0;

  @Output() avatarChanged = new EventEmitter<File>();
  @Output() menuItemClicked = new EventEmitter<string>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isMenuOpen = false;
  avatarPreview: string | null = null;
  isUploading = false;

  private elementRef = inject(ElementRef);
  private router = inject(Router);
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  ngOnInit(): void {
    // On init, load the avatar from the persisted user data
    if (this.user?.avatarUrl) {
      this.avatarPreview = this.user.avatarUrl;
    }
  }

  get userInitials(): string {
    if (!this.user) return '?';
    const f = this.user.firstName?.charAt(0)?.toUpperCase() || '';
    const l = this.user.lastName?.charAt(0)?.toUpperCase() || '';
    return f + l;
  }

  get displayAvatar(): string | null {
    return this.avatarPreview || this.user?.avatarUrl || null;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isMenuOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeMenu();
  }

  triggerFileUpload(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.error('Only image files are allowed');
        input.value = '';
        return;
      }

      // Validate file size (max 5 MB)
      if (file.size > 5 * 1024 * 1024) {
        console.error('File size must be under 5 MB');
        input.value = '';
        return;
      }

      // Preview the image immediately for instant feedback
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      // Upload to backend to persist the avatar
      this.uploadAvatarToBackend(file);

      // Emit the file for any parent that wants to know
      this.avatarChanged.emit(file);

      // Reset input so the same file can be re-selected
      input.value = '';
    }
  }

  private uploadAvatarToBackend(file: File): void {
    if (!this.user?.id) {
      console.error('Cannot upload avatar: no user ID');
      return;
    }

    this.isUploading = true;
    const formData = new FormData();
    formData.append('file', file);

    this.http.post<{ avatarUrl: string }>(`/api/users/${this.user.id}/avatar`, formData)
      .subscribe({
        next: (response) => {
          this.isUploading = false;
          // Update the preview to use the server URL (persisted)
          this.avatarPreview = response.avatarUrl;

          // Update the user object and persist to localStorage
          if (this.user) {
            this.user.avatarUrl = response.avatarUrl;
            this.authService.setCurrentUser(this.user);
          }
        },
        error: (err) => {
          this.isUploading = false;
          console.error('Failed to upload avatar:', err);
          // Keep the preview (local) even if upload fails
        }
      });
  }

  onMenuItemClick(item: string): void {
    this.menuItemClicked.emit(item);
    this.closeMenu();
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
    this.router.navigate(['/login']);
  }
}
