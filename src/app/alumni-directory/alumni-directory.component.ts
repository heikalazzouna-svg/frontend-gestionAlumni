import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlumniDirectoryService, AlumniEntry } from './alumni-directory.service';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-alumni-directory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alumni-directory.component.html',
  styleUrls: ['./alumni-directory.component.css']
})
export class AlumniDirectoryComponent implements OnInit {
  private directoryService = inject(AlumniDirectoryService);
  private router = inject(Router);
  private authService = inject(AuthService);

  alumni = signal<AlumniEntry[]>([]);
  loading = signal(true);

  searchQuery = signal('');
  sectorFilter = signal('');
  companyFilter = signal('');
  yearFilter = signal<number | null>(null);
  skillFilter = signal('');

  sectors = computed(() => {
    const set = new Set(this.alumni().map(a => a.sector).filter(Boolean));
    return [...set].sort();
  });

  companies = computed(() => {
    const set = new Set(this.alumni().map(a => a.currentCompany).filter(Boolean));
    return [...set].sort();
  });

  years = computed(() => {
    const set = new Set(this.alumni().map(a => a.graduationYear).filter(Boolean));
    return [...set].sort((a, b) => b - a);
  });

  filteredAlumni = computed(() => {
    let list = this.alumni();
    const q = this.searchQuery().toLowerCase().trim();
    const sector = this.sectorFilter();
    const company = this.companyFilter();
    const year = this.yearFilter();
    const skill = this.skillFilter().toLowerCase().trim();

    if (q) {
      list = list.filter(a =>
        (a.firstName + ' ' + a.lastName).toLowerCase().includes(q) ||
        (a.currentJob || '').toLowerCase().includes(q) ||
        (a.currentCompany || '').toLowerCase().includes(q)
      );
    }
    if (sector) list = list.filter(a => a.sector === sector);
    if (company) list = list.filter(a => a.currentCompany === company);
    if (year) list = list.filter(a => a.graduationYear === year);
    if (skill) list = list.filter(a => a.skills?.some(s => s.toLowerCase().includes(skill)));

    return list;
  });

  ngOnInit(): void {
    this.directoryService.getAll().subscribe(data => {
      this.alumni.set(data);
      this.loading.set(false);
    });
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.sectorFilter.set('');
    this.companyFilter.set('');
    this.yearFilter.set(null);
    this.skillFilter.set('');
  }

  getInitials(a: AlumniEntry): string {
    return ((a.firstName?.[0] || '') + (a.lastName?.[0] || '')).toUpperCase();
  }

  openChat(alumniId: number): void {
    const role = this.authService.getRole();
    if (role === 'alumni') {
      this.router.navigate(['/alumni/messaging', alumniId]);
    } else {
      this.router.navigate(['/student/mentorat/messaging', alumniId]);
    }
  }
}
