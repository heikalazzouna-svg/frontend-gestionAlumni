import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExperienceService } from '../../services/experience.service';

@Component({
  selector: 'app-experience-sharing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './experience-sharing.component.html',
  styleUrls: ['./experience-sharing.component.css']
})
export class ExperienceSharingComponent implements OnInit {
  activeTab = 'reviews';
  reviews: any[] = [];
  knowledgeItems: any[] = [];
  searchCompany = '';
  
  newReview = {
    companyName: '',
    rating: 5,
    culture: '',
    recruitmentProcess: '',
    interviewTips: '',
    missions: '',
    workAtmosphere: '',
    growthOpportunities: '',
    pros: '',
    cons: ''
  };

  private experienceService = inject(ExperienceService);

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.experienceService.getAllCompanyReviews().subscribe(data => this.reviews = data);
    this.experienceService.getAllKnowledgeBase().subscribe(data => this.knowledgeItems = data);
  }

  search(): void {
    if (this.searchCompany && this.searchCompany.trim() !== '') {
      this.experienceService.getCompanyReviews(this.searchCompany).subscribe(data => this.reviews = data);
      this.experienceService.getKnowledgeByCompany(this.searchCompany).subscribe(data => this.knowledgeItems = data);
    } else {
      this.loadAll();
    }
  }

  submitReview(): void {
    this.experienceService.postReview(this.newReview).subscribe(() => {
      this.search();
      this.newReview = {
        companyName: '', rating: 5, culture: '', recruitmentProcess: '',
        interviewTips: '', missions: '', workAtmosphere: '',
        growthOpportunities: '', pros: '', cons: ''
      };
    });
  }
}
