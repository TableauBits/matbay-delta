import { Component, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CurrentUserForm } from './current-user-form/current-user-form';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { User } from '../../../../../../common/user';
import { UserStats } from '../../../../../../common/stat';
import { Users } from '../../../services/users';
import { HttpRequests } from '../../../services/requests/http-requests';

@Component({
  selector: 'app-user-page',
  imports: [CurrentUserForm, DatePipe],
  templateUrl: './user-page.html',
})
export class UserPage implements OnDestroy {
  // Service injections
  private activatedRoute = inject(ActivatedRoute);
  private httpRequests = inject(HttpRequests);
  private titleService = inject(Title);
  private users = inject(Users);

  private subscriptions: Subscription = new Subscription();

  // Observable of the user data
  user = signal<User | undefined>(undefined);
  userError = signal<HttpErrorResponse | undefined>(undefined);
  isCurrentUser = signal(false);
  stats = signal<UserStats | undefined>(undefined);

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
            this.httpRequests.authenticatedGetRequest<UserStats>(`stat/get/${data.id}`).then((stats) => {
              this.stats.set(stats);
            });
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
