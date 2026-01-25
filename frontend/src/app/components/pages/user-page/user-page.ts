import { Component, inject } from '@angular/core';
import { CurrentUserForm } from './current-user-form/current-user-form';
import { Users } from '../../../services/users';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { User } from '../../../../../../common/user';
import { DeltaAuth } from '../../../services/delta-auth';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-user-page',
  imports: [CurrentUserForm],
  templateUrl: './user-page.html',
  styleUrl: './user-page.scss',
})
export class UserPage {
  // Service injections
  private activatedRoute = inject(ActivatedRoute);
  private deltaAuth = inject(DeltaAuth);
  users = inject(Users);

  private subscriptions: Subscription = new Subscription();

  // Observable of the user data
  private userObs: Observable<User> | undefined;
  private userId: string = '';
  user: User | undefined;
  userError: HttpErrorResponse | undefined;
  isCurrentUser: boolean = false;

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  constructor() {
    // Get the user from the route
    this.activatedRoute.params.subscribe((params) => {
      this.userId = params['id'];
      this.userObs = this.users.get(this.userId);

      const subscription = this.userObs.subscribe({
        next: (data) => {
          this.user = data
        },
        error: (err) => {
          this.userError = err;
        }
      });

      this.deltaAuth.getUid().then((uid) => {
        this.isCurrentUser = uid === this.userId;
      });

      this.subscriptions.add(subscription);
    });
  }
}
