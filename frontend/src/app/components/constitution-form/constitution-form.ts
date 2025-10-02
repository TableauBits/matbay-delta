import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Constitutions } from '../../services/constitutions';

@Component({
  selector: 'app-constitution-form',
  imports: [ReactiveFormsModule],
  templateUrl: './constitution-form.html',
  styleUrl: './constitution-form.scss'
})
export class ConstitutionForm {
  // Service injections
  private constitutions = inject(Constitutions);

  form: FormGroup;

  constructor() {
    this.form = new FormGroup({
      name: new FormControl(''),
      description: new FormControl('')
    });
  }

  onSubmit(): void {
    // Send data
    this.constitutions.create(this.form.value);

    // Clean form
    this.form.reset();
  }
}
