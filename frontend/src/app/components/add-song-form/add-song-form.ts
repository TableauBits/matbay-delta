import { Component, inject, input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddSongRequestBody, Song } from '../../../../../common/song';
import { AddArtistRequestBody, Artist, ArtistContribution } from '../../../../../common/artist';
import { HttpRequests } from '../../services/http-requests';
import { AddSongConstitutionRequestBody } from '../../../../../common/constitution';

type FormArtist = {
  name: string;
  role: ArtistContribution;
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

  constitution = input.required<number>()

  // Form
  songForm: FormGroup;

  constructor() {
    this.songForm = this.formBuilder.group({
      title: [undefined, Validators.required],  // TODO : max number of chars ?
      url: [undefined, Validators.required],  // TODO : Validate url ?
      artists: this.formBuilder.array([this.createArtistFormGroup(ArtistContribution.MAIN)])
    });
  }

  get artists(): FormArray<FormGroup> {
    return this.songForm.get('artists') as FormArray;
  }

  createArtistFormGroup(contribution?: ArtistContribution): FormGroup {
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
    return Object.values(ArtistContribution);
  }

  async submitForm(): Promise<void> {
    // Get the ids of already registered artists
    const incompleteArtistIds = await Promise.all(
      (this.songForm.value.artists as FormArtist[])
        .map(async artist => (
          await this.httpRequests.authenticatedGetRequest<number[]>(`artist/search/${artist.name}`)
        ).at(0))
    );

    // Create missing artists
    const artistIds = await Promise.all(incompleteArtistIds.map(async (id, index) => {
      if (id !== undefined) return id;
      // Create artist and get their id
      return (await this.httpRequests.authenticatedPostRequest<AddArtistRequestBody, Artist>('artist/add', { name: (this.songForm.value.artists as FormArtist[])[index].name })).id;
    }));
    artistIds.forEach((id, index) => {
      console.log(id, (this.songForm.value.artists as FormArtist[])[index])
    })

    // Add the song
    // Check if the song already exists in db
    const songsQuery = await this.httpRequests.authenticatedGetRequest<number[]>(`song/search/${artistIds[0]}/${this.songForm.value.title}`)

    let songID = songsQuery.at(0);
    if (!songID) {
      songID = (await this.httpRequests.authenticatedPostRequest<AddSongRequestBody, Song>('song/add', {
        song: {
          title: this.songForm.value.title,
          primaryArtist: artistIds[0]
        },
        otherContributions: artistIds.filter((_, index) => index !== 0).map((val, index) => [val, (this.songForm.value.artists as FormArtist[])[index].role])
      })).id;
    }

    // TODO : link song to constitution
    this.httpRequests.authenticatedPostRequest<AddSongConstitutionRequestBody>('constitution/addSong', {
      song: songID,
      constitution: this.constitution(),
    });

    // Reset the form
    this.songForm.reset();
    // TODO : also need to reset the number of artists
  }
}
