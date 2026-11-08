import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  template: '<p>Redirection...</p>'
})
export class ChatComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    // Redirect to the new messaging page
    this.router.navigate(['../messaging', id], { relativeTo: this.route });
  }
}
