import { Component, OnDestroy, inject } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CurrentUserForm } from './current-user-form/current-user-form';
import { HttpErrorResponse } from '@angular/common/http';
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
  users = inject(Users);

  private subscriptions: Subscription = new Subscription();

  // Observable of the user data
  private userObs: Observable<User> | undefined;
  private userHandle = '';
  user: User | undefined;
  userError: HttpErrorResponse | undefined;
  isCurrentUser = false;

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  constructor() {
    // Get the user from the route
    this.activatedRoute.params.subscribe((params) => {
      this.userHandle = params['handle'];
      this.users.getFromHandle(this.userHandle).then((obs) => {
        this.userObs = obs;

        const subscription = this.userObs.subscribe({
          next: (data) => {
            this.user = data;
          },
          error: (err) => {
            this.userError = err;
          },
        });

        this.subscriptions.add(subscription);
      });

      this.users.getCurrentUser().then((currentUser) => {
        currentUser.subscribe((user) => {
          this.isCurrentUser = user.handle === this.userHandle;
        });
      });
    });
  }
}
