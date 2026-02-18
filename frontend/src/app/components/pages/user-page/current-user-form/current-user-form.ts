import { Component, OnDestroy, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { User } from '../../../../../../../common/user';
import { Users } from '../../../../services/users';

@Component({
  selector: 'app-current-user-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './current-user-form.html',
  styleUrl: './current-user-form.scss',
})
export class CurrentUserForm implements OnDestroy {
  // Service injections
  private users = inject(Users);

  // Form group for user info
  form: FormGroup;

  // Observable of the current user data
  private currentUserObs: Promise<Observable<User> | undefined>;
  private subscriptions: Subscription = new Subscription();

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  constructor() {
    this.currentUserObs = this.users.getCurrentUser();

    this.form = new FormGroup({
      displayName: new FormControl(''),
      description: new FormControl(''),
      imageURL: new FormControl(''),
    });

    // Populate the form with the current user data when available
    this.currentUserObs.then((userObs) => {
      if (!userObs) return;

      // Subscribe to user observable to update form values
      const subscription = userObs.subscribe((user) => {
        this.form.setValue({
          displayName: user.displayName,
          description: user.description,
          imageURL: user.imageURL,
        });
      });

      this.subscriptions.add(subscription);
    });
  }

  onSubmit(): void {
    this.users.updateCurrentUserInfo(this.form.value);
  }
}
