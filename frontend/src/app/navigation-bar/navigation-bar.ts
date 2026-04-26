import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DeltaAuth } from '../services/delta-auth';
import { RedirectToUserProfile } from '../components/utils/redirect-to-user-profile/redirect-to-user-profile';
import { User } from '../../../../common/user';
import { Users } from '../services/users';

@Component({
  selector: 'app-navigation-bar',
  imports: [CommonModule, RouterLink, RedirectToUserProfile],
  templateUrl: './navigation-bar.html',
  styleUrl: './navigation-bar.scss',
})
export class NavigationBar implements OnInit {
  deltaAuth = inject(DeltaAuth);
  users = inject(Users);
  private readonly router = inject(Router);
  user: User | undefined;

  ngOnInit(): void {
    this.deltaAuth.getUid().then((uid) => {
      this.users.get(uid).subscribe({
        next: (user) => {
          this.user = user;
        },
        error: (error) => {
          console.error('Failed to get user data for navigation bar', error);
        },
      });
    });
  }

  redirectToProfile(): void {
    this.router.navigate(['/users', this.user?.handle]);
  }
}
