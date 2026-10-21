import { Component, OnDestroy, inject, signal } from '@angular/core';
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
  private users = inject(Users);

  private subscriptions: Subscription = new Subscription();

  // Observable of the user data
  user = signal<User | undefined>(undefined);
  userError = signal<HttpErrorResponse | undefined>(undefined);
  isCurrentUser = signal(false);

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
            this.user.set(data);
            this.titleService.setTitle(data.displayName);
          },
          error: (err) => {
            this.userError.set(err);
          },
        });

        this.subscriptions.add(subscription);
      });

      this.users.getCurrentUser().then((currentUser) => {
        const subscription = currentUser.subscribe((user) => {
          this.isCurrentUser.set(user.handle === handle);
        });
        this.subscriptions.add(subscription);
      });
    });
  }
}
