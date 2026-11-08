import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatchingService } from '../../services/matching.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-alumni-matching',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './alumni-matching.component.html',
  styleUrls: ['./alumni-matching.component.css']
})
export class AlumniMatchingComponent implements OnInit {
  filters = {
    company: '',
    job: '',
    sector: '',
    speciality: '',
    skill: ''
  };
  alumniList: any[] = [];
  topMentors: any[] = [];
  isLoading = false;

  private matchingService = inject(MatchingService);

  ngOnInit(): void {
    this.loadTopMentors();
    this.search();
  }

  search(): void {
    this.isLoading = true;
    this.matchingService.searchAlumni(this.filters).subscribe({
      next: (data) => {
        this.alumniList = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  resetFilters(): void {
    this.filters = {
      company: '',
      job: '',
      sector: '',
      speciality: '',
      skill: ''
    };
    this.search();
  }

  private loadTopMentors(): void {
    this.matchingService.getTopMentors(6).subscribe({
      next: (data) => {
        this.topMentors = data;
      },
      error: () => {
        this.topMentors = [];
      }
    });
  }
}
