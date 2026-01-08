import { Component, inject } from '@angular/core';
import { Constitutions } from '../../../services/constitutions';
import { Users } from '../../../services/users';
import { AsyncPipe } from '@angular/common';
import { Constitution } from '../../../../../../common/constitution';
import { DeltaAuth } from '../../../services/delta-auth';
import { Observable, Subscription } from 'rxjs';
import { User } from '../../../../../../common/user';

@Component({
  selector: 'app-current-constitutions-page',
  imports: [AsyncPipe],
  templateUrl: './current-constitutions-page.html',
  styleUrl: './current-constitutions-page.scss',
})
export class CurrentConstitutionsPage {
  // Service injections
  constitutions = inject(Constitutions);
  deltaAuth = inject(DeltaAuth);
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

  isParticipant(constitution: Constitution): boolean {
    if (!this.currentUser) return false;
    return constitution.userConstitution.map(u => u.user).includes(this.currentUser.id);
  }
}
