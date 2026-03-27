import { Component, inject } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Constitution } from '../../../../../../common/constitution';
import { Constitutions } from '../../../services/constitutions';
import { HttpRequests } from '../../../services/requests/http-requests';
import { Router } from '@angular/router';
import { User } from '../../../../../../common/user';
import { Users } from '../../../services/users';

@Component({
  selector: 'app-current-constitutions-page',
  imports: [AsyncPipe],
  templateUrl: './current-constitutions-page.html',
  styleUrl: './current-constitutions-page.scss',
})
export class CurrentConstitutionsPage {
  // Service injections
  private httpRequests = inject(HttpRequests);
  private router = inject(Router);
  constitutions = inject(Constitutions);
  users = inject(Users);

  // Observable of the current user data
  private currentUserObs: Promise<Observable<User> | undefined>;
  private subscriptions: Subscription = new Subscription();
  currentUser: User | undefined;

  currentConstitutions: number[] = [];

  constructor() {
    // Fetch the current constitutions IDs
    this.httpRequests.authenticatedGetRequest<number[]>('constitution/getCurrentIDs').then((ids) => {
      this.currentConstitutions = ids;
    });

    // Get the current user info
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
    return constitution.userConstitution.map((u) => u.user).includes(this.currentUser.id);
  }

  joinConstitution(constitutionID: number): void {
    this.constitutions.join(constitutionID);
    this.redirectToConstitutionPage(constitutionID);
  }

  redirectToConstitutionPage(constitutionID: number): void {
    this.router.navigate(['/constitutions', constitutionID]);
  }
}
