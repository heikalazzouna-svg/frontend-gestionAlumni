import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiApiService } from './ai-api.service';
import { InterviewSession } from './ai-interview.service';

@Component({
  selector: 'app-ai-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-dashboard.component.html',
  styleUrls: ['./ai-dashboard.component.css']
})
export class AiDashboardComponent implements OnInit {

  history: InterviewSession[] = [];
  badges: Record<string, boolean> = {};

  private badgeMeta: Record<string, { icon: string; label: string }> = {
    firstSimulation: { icon: '\u{1F3AF}', label: '1ere simulation' },
    improving:       { icon: '\u{1F4C8}', label: 'En progression' },
    perseverant:     { icon: '\u{1F4AA}', label: 'Perseverant' },
    expert:          { icon: '\u{1F3C6}', label: 'Expert' },
    perfectScore:    { icon: '\u{2B50}', label: 'Score parfait' },
    communicator:    { icon: '\u{1F5E3}', label: 'Communicant' },
    speedRunner:     { icon: '\u{26A1}', label: 'Speed runner' },
    polyglot:        { icon: '\u{1F30D}', label: 'Polyglotte' },
  };

  private api = inject(AiApiService);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.history = this.api.getHistory();
    this.badges = this.api.computeBadges(this.history);
  }

  clear(): void {
    this.api.clearHistory();
    this.load();
  }

  get badgeKeys(): string[] {
    return Object.keys(this.badges || {});
  }

  get avgScore(): string {
    if (!this.history.length) return '—';
    const scores = this.history.map(s => s.overallScore).filter((s): s is number => s != null && !isNaN(s));
    if (!scores.length) return '—';
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length).toString();
  }

  get bestScore(): string {
    if (!this.history.length) return '—';
    const scores = this.history.map(s => s.overallScore).filter((s): s is number => s != null && !isNaN(s));
    if (!scores.length) return '—';
    return Math.max(...scores).toString();
  }

  get unlockedBadges(): number {
    return Object.values(this.badges).filter(Boolean).length;
  }

  get badgeProgress(): number {
    if (!this.badgeKeys.length) return 0;
    return Math.round((this.unlockedBadges / this.badgeKeys.length) * 100);
  }

  getBadgeIcon(key: string): string {
    return this.badgeMeta[key]?.icon ?? '🏅';
  }

  getBadgeLabel(key: string): string {
    return this.badgeMeta[key]?.label ?? key;
  }
}