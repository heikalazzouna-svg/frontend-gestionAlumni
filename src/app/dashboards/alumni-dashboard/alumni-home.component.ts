import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-alumni-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="welcome-section">
      <h1>Heureux de vous revoir, {{ currentUser?.firstName }} ! 🎓</h1>
      <p>Votre expertise est précieuse pour la communauté Enicarthage.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-user-graduate"></i></div>
        <div class="stat-info">
          <h3>3</h3>
          <p>Étudiants mentorés</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon message"><i class="fas fa-envelope"></i></div>
        <div class="stat-info">
          <h3>5</h3>
          <p>Nouveaux messages</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon events"><i class="fas fa-calendar-check"></i></div>
        <div class="stat-info">
          <h3>2</h3>
          <p>Événements inscrits</p>
        </div>
      </div>
    </div>

    <div class="action-sections">
      <div class="mentor-section">
        <h3>Votre Impact</h3>
        <div class="impact-card">
          <p>Vous avez aidé 12 étudiants à trouver un stage cette année !</p>
          <button class="action-btn">Voir mes témoignages</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome-section { margin-bottom: 32px; }
    .welcome-section h1 { font-size: 2rem; font-weight: 800; margin-bottom: 8px; }
    .welcome-section p { color: #A0AEC0; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 40px; }
    .stat-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px; padding: 24px; display: flex; align-items: center; gap: 20px; }
    .stat-icon { width: 56px; height: 56px; background: rgba(39, 174, 122, 0.1); color: #27AE7A; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
    .stat-icon.message { background: rgba(74, 144, 226, 0.1); color: #4A90E2; }
    .stat-icon.events { background: rgba(139, 70, 232, 0.1); color: #8B46E8; }
    .stat-info h3 { font-size: 1.5rem; margin: 0; font-weight: 700; }
    .stat-info p { margin: 0; color: #718096; font-size: 0.9rem; }
    .action-btn { background: #27AE7A; color: #fff; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; margin-top: 15px; }
  `]
})
export class AlumniHomeComponent implements OnInit {
  currentUser: User | null = null;

  private authService = inject(AuthService);

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }
}
