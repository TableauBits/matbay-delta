import { Component, OnDestroy, inject } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ConstitutionForm } from '../../constitution-form/constitution-form';
import { User } from '../../../../../../common/user';
import { Users } from '../../../services/users';

@Component({
  selector: 'app-home-page',
  imports: [ConstitutionForm],
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
