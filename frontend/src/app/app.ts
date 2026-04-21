import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavigationBar } from './navigation-bar/navigation-bar';
import { DeltaAuth } from './services/delta-auth';
import { Version } from './services/version';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, NavigationBar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Service injections
  deltaAuth = inject(DeltaAuth);
  private router = inject(Router);
  version = inject(Version);

  redirectToProfile(): void {
    this.deltaAuth.getUid().then((uid) => {
      this.router.navigate(['/users', uid]);
    });
  }
}
