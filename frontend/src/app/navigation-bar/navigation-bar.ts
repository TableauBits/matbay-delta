import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DeltaAuth } from '../services/delta-auth';

@Component({
  selector: 'app-navigation-bar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navigation-bar.html',
  styleUrl: './navigation-bar.scss',
})
export class NavigationBar {
  deltaAuth = inject(DeltaAuth);
  private readonly router = inject(Router);

  redirectToProfile(): void {
    this.deltaAuth.getUid().then((uid) => {
      this.router.navigate(['/users', uid]);
    });
  }
}
