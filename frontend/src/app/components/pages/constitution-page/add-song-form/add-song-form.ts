import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddArtistRequestBody, Artist, ArtistContribution } from '../../../../../../../common/artist';
import { AddSongRequestBody, Song } from '../../../../../../../common/song';
import { Component, inject, input } from '@angular/core';
import { AddSongConstitutionRequestBody } from '../../../../../../../common/constitution';
import { HttpRequests } from '../../../../services/http-requests';
import { KNOWN_HOSTS } from '../../../../../../../common/source';
import parseUrl from 'parse-url';

interface FormArtist {
  name: string;
  role: ArtistContribution;
}

interface FormSource {
  url: string;
}

@Component({
  selector: 'app-add-song-form',
  imports: [ReactiveFormsModule],
  templateUrl: './add-song-form.html',
  styleUrl: './add-song-form.scss',
})
export class AddSongForm {
  // Service injections
  private httpRequests = inject(HttpRequests);
  private formBuilder = inject(FormBuilder);

  constitution = input.required<number>();

  // Form
  songForm: FormGroup;

  constructor() {
    this.songForm = this.formBuilder.group({
      title: [undefined, Validators.required], // TODO : max number of chars ?
      sources: this.formBuilder.array([]),
      artists: this.formBuilder.array([this.createArtistFormGroup(ArtistContribution.MAIN)]),
    });
  }

  get artists(): FormArray<FormGroup> {
    return this.songForm.get('artists') as FormArray;
  }

  get sources(): FormArray<FormGroup> {
    return this.songForm.get('sources') as FormArray;
  }

  createArtistFormGroup(contribution?: ArtistContribution): FormGroup {
    return this.formBuilder.group({
      name: [undefined, Validators.required],
      role: [contribution, Validators.required],
    });
  }

  createSourceFormGroup(): FormGroup {
    return this.formBuilder.group({
      url: [undefined, Validators.required, this.isSourceValid],
    });
  }

  addSource(): void {
    this.sources.push(this.createSourceFormGroup());
  }

  removeSource(index: number): void {
    this.sources.removeAt(index);
  }

  addArtist(): void {
    this.artists.push(this.createArtistFormGroup());
  }

  removeArtist(index: number): void {
    this.artists.removeAt(index);
  }

  getContributions(): string[] {
    return Object.values(ArtistContribution);
  }

  async isSourceValid(control: AbstractControl): Promise<null | string> {
    const source = parseUrl(control.value, true);

    return KNOWN_HOSTS.has(source.host) ? null : 'Unknown source host';
  }

  async submitForm(): Promise<void> {
    // Get the ids of already registered artists
    const incompleteArtistIds = await Promise.all(
      (this.songForm.value.artists as FormArtist[]).map(async (artist) =>
        (await this.httpRequests.authenticatedGetRequest<number[]>(`artist/search/${artist.name}`)).at(0),
      ),
    );

    // Create missing artists and get their ids
    const artistIds = await Promise.all(
      incompleteArtistIds.map(async (id, index) => {
        if (id !== undefined) return id;
        return (
          await this.httpRequests.authenticatedPostRequest<AddArtistRequestBody, Artist>('artist/add', {
            name: (this.songForm.value.artists as FormArtist[])[index].name,
          })
        ).id;
      }),
    );

    // Check if the song already exists in db
    const songsQuery = await this.httpRequests.authenticatedGetRequest<number[]>(
      `song/search/${artistIds[0]}/${this.songForm.value.title}`,
    );
    let songID = songsQuery.at(0); // Currently only use the first result, since only return an exact match with the song name and the primary artist id

    // If no id, create the song with additionnal infos (other contributing artists and sources) and get the id
    if (!songID) {
      songID = (
        await this.httpRequests.authenticatedPostRequest<AddSongRequestBody, Song>('song/add', {
          song: {
            title: this.songForm.value.title,
            primaryArtist: artistIds[0],
          },
          otherContributions: artistIds
            .slice(1)
            .map((val, index) => [val, (this.songForm.value.artists as FormArtist[])[index + 1].role]),
          sources: (this.songForm.value.sources as FormSource[]).map((source) => source.url),
        })
      ).id;
    }

    // Add the song to the constitution
    this.httpRequests.authenticatedPostRequest<AddSongConstitutionRequestBody>('constitution/addSong', {
      song: songID,
      constitution: this.constitution(),
    });

    // Reset the form and clear artists and sources
    this.songForm.reset();
    this.artists.clear();
    this.sources.clear();
    this.addArtist();
  }
}
