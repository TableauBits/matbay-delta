import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpRequests } from '../../services/http-requests';

@Component({
  selector: 'app-constitution-form',
  imports: [ReactiveFormsModule],
  templateUrl: './constitution-form.html',
  styleUrl: './constitution-form.scss'
})
export class ConstitutionForm {
  form: FormGroup;

  // Service injections
  private httpRequests = inject(HttpRequests);

  constructor() {
    this.form = new FormGroup({
      name: new FormControl(''),
      description: new FormControl('')
    });
  }

  onSubmit() {
    // Send data
    this.httpRequests.authenticatedPostRequest('constitution/create', this.form.value).then((response) => {
      console.log("Constitution created:", response);
    }).catch((error) => {
      console.error("Failed to create constitution", error);
    });

    // Clean form
    this.form.reset();
  }
}
