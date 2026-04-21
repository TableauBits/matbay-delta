import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../../../../../common/user';

@Component({
  selector: 'app-redirect-to-user-profile',
  imports: [],
  templateUrl: './redirect-to-user-profile.html',
  styleUrl: './redirect-to-user-profile.scss',
})
export class RedirectToUserProfile {
  user = input<User | null>();
  imgWidth = input<number>(25);
  imgHeight = input<number>(25);
  showName = input<boolean>(true);

  private router = inject(Router);

  redirectToUserPage(id: string): void {
    this.router.navigate(['/users', id]);
  }
}
