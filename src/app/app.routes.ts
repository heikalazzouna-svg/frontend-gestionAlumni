import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
    { path: '', component: HomepageComponent },
    { path: 'terms', loadComponent: () => import('./terms/terms.component').then(m => m.TermsComponent) },
    { path: 'join-us', loadComponent: () => import('./join-us/join-us.component').then(m => m.JoinUsComponent) },
    { path: 'sign-up', loadComponent: () => import('./signup/signup.component').then(m => m.SignUpComponent) },
    { path: 'check-email', loadComponent: () => import('./check-email/check-email.component').then(m => m.CheckEmailComponent) },
    { path: 'verify-email', loadComponent: () => import('./verify-email/verify-email.component').then(m => m.VerifyEmailComponent) },
    { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
    { path: 'profile', loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent) },
    { path: 'events', loadComponent: () => import('./events/events-list/events-list.component').then(m => m.EventsListComponent) },
    { path: 'events/create', loadComponent: () => import('./events/event-create/event-create.component').then(m => m.EventCreateComponent) },
    { path: 'events/:id', loadComponent: () => import('./events/event-detail/event-detail.component').then(m => m.EventDetailComponent) },
    { path: 'ai-simulator', loadComponent: () => import('./ai-simulator/ai-simulator.component').then(m => m.AiSimulatorComponent) },
    { path: 'ai-simulator/history', loadComponent: () => import('./ai-simulator/ai-dashboard.component').then(m => m.AiDashboardComponent) },
    
    // Student Dashboard Routes
    { 
      path: 'student', 
      loadComponent: () => import('./dashboards/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent),
      canActivate: [authGuard('student')],
      children: [
        { path: 'home', loadComponent: () => import('./dashboards/student-dashboard/student-home.component').then(m => m.StudentHomeComponent) },
        { path: 'offers', loadComponent: () => import('./dashboards/student-dashboard/student-offers.component').then(m => m.StudentOffersComponent) },
        { path: 'directory', loadComponent: () => import('./alumni-directory/alumni-directory.component').then(m => m.AlumniDirectoryComponent) },
        { path: 'ai-simulator', loadComponent: () => import('./ai-simulator/ai-simulator.component').then(m => m.AiSimulatorComponent) },
        { path: 'events', loadComponent: () => import('./events/events-list/events-list.component').then(m => m.EventsListComponent) },
        { path: 'events/create', loadComponent: () => import('./events/event-create/event-create.component').then(m => m.EventCreateComponent) },
        { path: 'events/:id', loadComponent: () => import('./events/event-detail/event-detail.component').then(m => m.EventDetailComponent) },
        { 
          path: 'mentorat', 
          children: [
            { path: 'matching', loadComponent: () => import('./mentorat/components/matching/alumni-matching.component').then(m => m.AlumniMatchingComponent) },
            { path: 'alumni/:id', loadComponent: () => import('./mentorat/components/matching/alumni-profile.component').then(m => m.AlumniProfileComponent) },
            { path: 'chat/:id', loadComponent: () => import('./mentorat/components/messaging/chat.component').then(m => m.ChatComponent) },
            { path: 'messaging', loadComponent: () => import('./mentorat/components/messaging/messaging.component').then(m => m.MessagingComponent) },
            { path: 'messaging/:userId', loadComponent: () => import('./mentorat/components/messaging/messaging.component').then(m => m.MessagingComponent) },
            { path: 'experience', loadComponent: () => import('./mentorat/components/experience/experience-sharing.component').then(m => m.ExperienceSharingComponent) },
            { path: 'tracking', loadComponent: () => import('./mentorat/components/mentorship/mentorship-tracking.component').then(m => m.MentorshipTrackingComponent) },
            { path: 'request/:alumniId', loadComponent: () => import('./mentorat/components/mentorship/mentorship-request.component').then(m => m.MentorshipRequestComponent) },
          ]
        },
        { path: '', redirectTo: 'home', pathMatch: 'full' }
      ]
    },

    // Admin Dashboard Routes
    {
      path: 'admin',
      loadComponent: () => import('./dashboards/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
      canActivate: [authGuard('admin')],
      children: [
        { path: 'home', loadComponent: () => import('./dashboards/admin-dashboard/admin-home.component').then(m => m.AdminHomeComponent) },
        { path: 'users', loadComponent: () => import('./dashboards/admin-dashboard/admin-users.component').then(m => m.AdminUserManagementComponent) },
        { path: 'offers', loadComponent: () => import('./dashboards/admin-dashboard/admin-offers.component').then(m => m.AdminOffersComponent) },
        { path: '', redirectTo: 'home', pathMatch: 'full' }
      ]
    },

    // Alumni Dashboard Routes
    {
      path: 'alumni',
      loadComponent: () => import('./dashboards/alumni-dashboard/alumni-dashboard.component').then(m => m.AlumniDashboardComponent),
      canActivate: [authGuard('alumni')],
      children: [
        { path: 'home', loadComponent: () => import('./dashboards/alumni-dashboard/alumni-home.component').then(m => m.AlumniHomeComponent) },
        { path: 'directory', loadComponent: () => import('./alumni-directory/alumni-directory.component').then(m => m.AlumniDirectoryComponent) },
        { path: 'ai-simulator', loadComponent: () => import('./ai-simulator/ai-simulator.component').then(m => m.AiSimulatorComponent) },
        { path: 'events', loadComponent: () => import('./events/events-list/events-list.component').then(m => m.EventsListComponent) },
        { path: 'events/create', loadComponent: () => import('./events/event-create/event-create.component').then(m => m.EventCreateComponent) },
        { path: 'events/:id', loadComponent: () => import('./events/event-detail/event-detail.component').then(m => m.EventDetailComponent) },
        { path: 'messaging', loadComponent: () => import('./mentorat/components/messaging/messaging.component').then(m => m.MessagingComponent) },
        { path: 'messaging/:userId', loadComponent: () => import('./mentorat/components/messaging/messaging.component').then(m => m.MessagingComponent) },
        { path: 'mentorat/experience', loadComponent: () => import('./mentorat/components/experience/experience-sharing.component').then(m => m.ExperienceSharingComponent) },
        { path: 'mentorat/tracking', loadComponent: () => import('./mentorat/components/mentorship/mentorship-tracking.component').then(m => m.MentorshipTrackingComponent) },
        { path: 'mentorat/dashboard', loadComponent: () => import('./mentorat/components/mentorship/mentor-dashboard.component').then(m => m.MentorDashboardComponent) },
        { path: 'mentorat/request/:alumniId', loadComponent: () => import('./mentorat/components/mentorship/mentorship-request.component').then(m => m.MentorshipRequestComponent) },
        { path: '', redirectTo: 'home', pathMatch: 'full' }
      ]
    },

    // Recruiter Dashboard Routes
    {
      path: 'recruiter',
      loadComponent: () => import('./dashboards/recruiter-dashboard/recruiter-dashboard.component').then(m => m.RecruiterDashboardComponent),
      canActivate: [authGuard('recruiter')],
      children: [
        { path: 'home', loadComponent: () => import('./dashboards/recruiter-dashboard/recruiter-home.component').then(m => m.RecruiterHomeComponent) },
        { path: 'offers', loadComponent: () => import('./dashboards/recruiter-dashboard/recruiter-offers.component').then(m => m.RecruiterOffersComponent) },
        { path: 'applications', loadComponent: () => import('./dashboards/recruiter-dashboard/recruiter-applications.component').then(m => m.RecruiterApplicationsComponent) },
        { path: 'search', loadComponent: () => import('./dashboards/recruiter-dashboard/recruiter-search.component').then(m => m.RecruiterSearchComponent) },
        { path: 'events', loadComponent: () => import('./events/events-list/events-list.component').then(m => m.EventsListComponent) },
        { path: 'events/create', loadComponent: () => import('./events/event-create/event-create.component').then(m => m.EventCreateComponent) },
        { path: 'events/:id', loadComponent: () => import('./events/event-detail/event-detail.component').then(m => m.EventDetailComponent) },
        { path: '', redirectTo: 'home', pathMatch: 'full' }
      ]
    },

    // Catch-all: redirect unknown routes to homepage
    { path: '**', redirectTo: '', pathMatch: 'full' }
];

