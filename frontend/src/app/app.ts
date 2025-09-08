import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeltaAuth } from './services/delta-auth';
import { Users } from './services/users';
import { CurrentUserForm } from './components/current-user-form/current-user-form';

import { User } from '../../../common/user'
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule, CurrentUserForm],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'MATBay Δ';
  deltaAuth = inject(DeltaAuth);
  users = inject(Users);

  currentUserObs: Promise<Observable<User> | undefined> = this.users.getCurrentUser();
  currentUser: User | undefined;

  constructor() {
    this.currentUserObs.then((userObs) => {
      if (!userObs) return;

      userObs.subscribe((user) => {
        this.currentUser = user;
      });
    });
  }
}
