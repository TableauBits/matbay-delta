import { Component, OnDestroy, inject } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ConstitutionForm } from './components/constitution-form/constitution-form';
import { Constitutions } from './services/constitutions';
import { CurrentUserForm } from './components/current-user-form/current-user-form';
import { DeltaAuth } from './services/delta-auth';
import { User } from '../../../common/user'
import { Users } from './services/users';
import { AddSongForm } from './components/add-song-form/add-song-form';

@Component({
  selector: 'app-root',
  imports: [CommonModule, CurrentUserForm, ConstitutionForm, AddSongForm],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnDestroy {
  // Service injections
  deltaAuth = inject(DeltaAuth);
  users = inject(Users);
  constitutions = inject(Constitutions);

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
