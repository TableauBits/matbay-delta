import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Users } from '../../services/users';

import { User } from '../../../../../common/user';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-current-user-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './current-user-form.html',
  styleUrl: './current-user-form.scss'
})
export class CurrentUserForm {
  users = inject(Users);

  currentUser: Promise<Observable<User> | undefined>;
  userForm: FormGroup;

  constructor() {
    this.currentUser = this.users.getCurrentUser();

    this.userForm = new FormGroup({
    username: new FormControl(''),
    description: new FormControl(''),
    imageURL: new FormControl('')
  });

    // Populate the form with the current user data when available
    this.currentUser.then((userObs) => {
      if (!userObs) return;

      userObs.subscribe((user) => {
        this.userForm = new FormGroup({
          username: new FormControl(user.username),
          description: new FormControl(user.description),
          imageURL: new FormControl(user.imageURL)
        });
      });
    });
  }

  onSubmit() {
    this.users.updateCurrentUserInfo(this.userForm.value);
  }

}
