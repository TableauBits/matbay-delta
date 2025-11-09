import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArtistContributions } from '../../../../../common/song';

@Component({
  selector: 'app-add-song-form',
  imports: [ReactiveFormsModule],
  templateUrl: './add-song-form.html',
  styleUrl: './add-song-form.scss'
})
export class AddSongForm {
  // https://angular.dev/guide/forms/reactive-forms#grouping-form-controls
  // https://angular.dev/guide/forms/reactive-forms#creating-dynamic-forms

  private formBuilder = inject(FormBuilder);
  songForm: FormGroup;

  constructor() {
    this.songForm = this.formBuilder.group({
      title: new FormControl(),
      artists: this.formBuilder.array([this.createArtistFormGroup(ArtistContributions.MAIN)])
    });
  }

  get artists(): FormArray<FormGroup> {
    return this.songForm.get('artists') as FormArray;
  }

  createArtistFormGroup(contribution?: ArtistContributions): FormGroup {
    return this.formBuilder.group({
      name: [undefined, Validators.required],
      role: [contribution, Validators.required]
    });
  }

  addArtist() {
    this.artists.push(this.createArtistFormGroup());
  }

  removeArtist(index: number): void {
    this.artists.removeAt(index);
  }

  getContributions(): string[] {
    return Object.values(ArtistContributions);
  }

  submitForm(): void {
    console.log(this.songForm.value);

    // TODO : Get the ids of already registered artists
    this.songForm.value.artists.map(artist => )

    // Add the song
    // TODO : get song infos
    // TODO : get the artist infos of unknown artists ?

    // Reset the form
    this.songForm.reset();
    // TODO : also need to reset the number of artists
  }
}
