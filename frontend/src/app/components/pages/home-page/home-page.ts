import { Component, inject, OnDestroy } from '@angular/core';
import { User } from '../../../../../../common/user';
import { Observable, Subscription } from 'rxjs';
import { Users } from '../../../services/users';
import { CurrentUserForm } from '../../current-user-form/current-user-form';
import { ConstitutionForm } from '../../constitution-form/constitution-form';

@Component({
  selector: 'app-home-page',
  imports: [CurrentUserForm, ConstitutionForm],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnDestroy {
  // Service injections
  users = inject(Users);

  // Observable of the current user data
  private currentUserObs: Promise<Observable<User> | undefined>;
  private subscriptions: Subscription = new Subscription();
  currentUser: User | undefined;

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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
