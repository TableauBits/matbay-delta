import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Artist, ArtistContributions, GetArtistIDByNameBody, Song } from '../../../../../common/song';
import { HttpRequests } from '../../services/http-requests';

type FormArtist = {
  name: string;
  role: ArtistContributions;
}

@Component({
  selector: 'app-add-song-form',
  imports: [ReactiveFormsModule],
  templateUrl: './add-song-form.html',
  styleUrl: './add-song-form.scss'
})
export class AddSongForm {

  // Service injections
  private httpRequests = inject(HttpRequests);
  private formBuilder = inject(FormBuilder);

  // Form
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

  getArtistIDsFromName(body: GetArtistIDByNameBody): Promise<number[]> {
    return this.httpRequests.authenticatedPostRequest<number[]>('artist/getArtistIDFromName', body);
  }

  async submitForm(): Promise<void> {
    console.log(this.songForm.value);

    // Get the ids of already registered artists
    const incompleteArtistIds = await Promise.all(
      (this.songForm.value.artists as FormArtist[])
      .map(async artist => (await this.getArtistIDsFromName({name: artist.name})).at(0))
    );

    // Create missing artists
    const artistIds = await Promise.all(incompleteArtistIds.map(async (id, index) => {
      if (id !== undefined) return id;
      // Create artist and get their id
      return (await this.httpRequests.authenticatedPostRequest<Artist>('artist/addArtist', {name: (this.songForm.value.artists as FormArtist[])[index].name})).id;
    }));
    artistIds.forEach((id, index) => {
      console.log(id, (this.songForm.value.artists as FormArtist[])[index])
    })

    // Add the song
    const song = await this.httpRequests.authenticatedPostRequest<Song>('song/AddSong', {
      title: this.songForm.value.title,
      primaryArtist: artistIds[0]
    });

    console.log(song);
    

    // TODO : link song to artists

    // Reset the form
    this.songForm.reset();
    // TODO : also need to reset the number of artists
  }
}
