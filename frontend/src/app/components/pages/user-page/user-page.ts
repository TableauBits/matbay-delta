import { Component } from '@angular/core';
import { CurrentUserForm } from './current-user-form/current-user-form';

@Component({
  selector: 'app-user-page',
  imports: [CurrentUserForm],
  templateUrl: './user-page.html',
  styleUrl: './user-page.scss',
})
export class UserPage {

}
