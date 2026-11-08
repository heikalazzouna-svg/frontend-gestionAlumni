import { Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-homepage',
  imports: [RouterLink, CommonModule],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent {
  isScrolled = false;
  mobileMenuOpen = false;

  private router = inject(Router);

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  navigateToSignUp(): void {
    this.router.navigate(['/sign-up']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToJoinUs() {
    this.router.navigate(['/sign-up']);
  }

  navigateToTerms() {
    this.router.navigate(['/terms']);
  }
}
