import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { CommonModule } from '@angular/common';
import { DeltaAuth } from '../services/delta-auth';
import { environment } from '../../environments/environment';
import { RedirectToUserProfile } from '../components/utils/redirect-to-user-profile/redirect-to-user-profile';
import { User } from '../../../../common/user';
import { Users } from '../services/users';

@Component({
  selector: 'app-navigation-bar',
  imports: [CommonModule, RouterLink, RouterLinkActive, RedirectToUserProfile],
  templateUrl: './navigation-bar.html',
})
export class NavigationBar implements OnInit {
  deltaAuth = inject(DeltaAuth);
  users = inject(Users);
  user = signal<User | undefined>(undefined);

  // Mirrors the route gating in app.routes.ts: the debug page only exists in dev.
  showDebug = environment.name === 'development';

  ngOnInit(): void {
    this.deltaAuth.getUid().then((uid) => {
      this.users.get(uid).subscribe({
        next: (user) => {
          this.user.set(user);
        },
        error: (error) => {
          console.error('Failed to get user data for navigation bar', error);
        },
      });
    });
  }
}
