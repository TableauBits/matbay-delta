import { Component } from '@angular/core';
import { ConstitutionForm } from '../../constitution-form/constitution-form';

@Component({
  selector: 'app-create-constitution-page',
  imports: [ConstitutionForm],
  templateUrl: './create-constitution-page.html',
  styleUrl: './create-constitution-page.scss',
})
export class CreateConstitutionPage {}
