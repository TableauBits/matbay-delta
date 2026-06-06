import { Component, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CurrentUserForm } from './current-user-form/current-user-form';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { User } from '../../../../../../common/user';
import { Users } from '../../../services/users';

@Component({
  selector: 'app-user-page',
  imports: [CurrentUserForm],
  templateUrl: './user-page.html',
  styleUrl: './user-page.scss',
})
export class UserPage implements OnDestroy {
  // Service injections
  private activatedRoute = inject(ActivatedRoute);
  private titleService = inject(Title);
  users = inject(Users);

  private subscriptions: Subscription = new Subscription();

  // Observable of the user data
  user: User | undefined;
  userError: HttpErrorResponse | undefined;
  isCurrentUser = false;

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  constructor() {
    // Get the user from the route
    this.activatedRoute.params.subscribe((params) => {
      const handle = params['handle'];
      this.users.getFromHandle(handle).then((obs) => {
        const subscription = obs.subscribe({
          next: (data) => {
            this.user = data;
            this.titleService.setTitle(this.user.displayName);
          },
          error: (err) => {
            this.userError = err;
          },
        });

        this.subscriptions.add(subscription);
      });

      this.users.getCurrentUser().then((currentUser) => {
        currentUser.subscribe((user) => {
          this.isCurrentUser = user.handle === handle;
        });
      });
    });
  }
}
