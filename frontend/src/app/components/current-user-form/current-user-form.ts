import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Users } from '../../services/users';

import { User } from '../../../../../common/user';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-current-user-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './current-user-form.html',
  styleUrl: './current-user-form.scss'
})
export class CurrentUserForm implements OnDestroy {
  // Service injections
  private users = inject(Users);

  // Form group for user info
  userForm: FormGroup;

  // Observable of the current user data
  private currentUserObs: Promise<Observable<User> | undefined>;
  private subscriptions: Subscription = new Subscription();

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  constructor() {
    this.currentUserObs = this.users.getCurrentUser();

    this.userForm = new FormGroup({
      username: new FormControl(''),
      description: new FormControl(''),
      imageURL: new FormControl('')
    });

    // Populate the form with the current user data when available
    this.currentUserObs.then((userObs) => {
      if (!userObs) return;

      const subscription = userObs.subscribe((user) => {
        // Update form values with user data
        this.userForm.setValue({
          username: user.username,
          description: user.description,
          imageURL: user.imageURL
        });
      });

      this.subscriptions.add(subscription);
    });
  }

  onSubmit() {
    this.users.updateCurrentUserInfo(this.userForm.value);
  }

}
