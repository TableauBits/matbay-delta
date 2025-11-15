import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

  form: FormGroup<{
    name: FormControl<string>,
    description: FormControl<string>
  }>;

  constructor() {
    this.form = new FormGroup({
      name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      description: new FormControl('', { nonNullable: true, validators: [Validators.required] })
    });
  }

  onSubmit(): void {
    // Send data
    this.form.valid
    this.constitutions.create(this.form.value.name ?? "", this.form.value.description ?? "");

    // Clean form
    this.form.reset();
  }
}
