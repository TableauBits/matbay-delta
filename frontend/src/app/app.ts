import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeltaAuth } from './services/delta-auth';
import { Users } from './services/users';
import { CurrentUserForm } from './components/current-user-form/current-user-form';

import { User } from '../../../common/user'
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule, CurrentUserForm],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnDestroy {
  // Service injections
  deltaAuth = inject(DeltaAuth);
  private users = inject(Users);

  // Observable of the current user data
  private currentUserObs: Promise<Observable<User> | undefined>;
  private subscriptions: Subscription = new Subscription();

  currentUser: User | undefined;

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  constructor() {
    this.currentUserObs = this.users.getCurrentUser();
    
    this.currentUserObs.then((userObs) => {
      if (!userObs) return;

      const subscription = userObs.subscribe((user) => {
        this.currentUser = user;
      });
      this.subscriptions.add(subscription);
    });
  }
}
