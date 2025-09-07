import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Users } from '../../services/users';

@Component({
  selector: 'app-current-user-form',
  imports: [ReactiveFormsModule],
  templateUrl: './current-user-form.html',
  styleUrl: './current-user-form.scss'
})
export class CurrentUserForm {
  users = inject(Users);

  username = new FormControl();
  description = new FormControl();
  imageURL = new FormControl();

  updateCurrentUser() {
    console.log("Updating user infos...");
  }

}
