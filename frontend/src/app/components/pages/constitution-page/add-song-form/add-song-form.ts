import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddArtistRequestBody, Artist, ArtistContribution } from '../../../../../../../common/artist';
import { AddSongRequestBody, Song } from '../../../../../../../common/song';
import { AutocompleteResult, AutocompleteTextbox } from '../../../autocomplete-textbox/autocomplete-textbox';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, ViewChild } from '@angular/core';
import { AddSongConstitutionRequestBody } from '../../../../../../../common/constitution';
import { FormsModule } from '@angular/forms';
import { HttpRequests } from '../../../../services/requests/http-requests';
import { Artists } from '../../../../services/artists';
import { Songs } from '../../../../services/songs';
import { KNOWN_HOSTS } from '../../../../../../../common/source';
import { firstValueFrom } from 'rxjs';
import parseUrl from 'parse-url';

interface PendingArtist {
  id: number;
  name: string;
  isNew: boolean;
  role: ArtistContribution;
}

interface FormSource {
  url: string;
}

@Component({
  selector: 'app-add-song-form',
  imports: [FormsModule, ReactiveFormsModule, AutocompleteTextbox],
  templateUrl: './add-song-form.html',
  styleUrl: './add-song-form.scss',
})
export class AddSongForm {
  private httpRequests = inject(HttpRequests);
  private formBuilder = inject(FormBuilder);
  private artistsService = inject(Artists);
  private songsService = inject(Songs);

  constitution = input.required<number>();

  @ViewChild('songAutocomplete') songAutocomplete!: AutocompleteTextbox;
  @ViewChild('artistAutocomplete') artistAutocomplete!: AutocompleteTextbox;

  songForm: FormGroup;
  selectedSong: AutocompleteResult | null = null;
  pendingArtists: PendingArtist[] = [];
  nextArtistRole: ArtistContribution = ArtistContribution.MAIN;
  errorMessage: string | null = null;
  artistsLocked = false;

  constructor() {
    this.songForm = this.formBuilder.group({
      sources: this.formBuilder.array([]),
    });
  }

  get sources(): FormArray<FormGroup> {
    return this.songForm.get('sources') as FormArray;
  }

  getContributions(): string[] {
    return Object.values(ArtistContribution);
  }

  searchArtists(query: string): Promise<AutocompleteResult[]> {
    return this.artistsService.search(query);
  }

  searchSongs(query: string): Promise<AutocompleteResult[]> {
    return this.songsService.search(query);
  }

  onArtistSelected(result: AutocompleteResult | null): void {
    if (!result) return;

    this.pendingArtists.push({
      id: result.id,
      name: result.name,
      isNew: result.id === -1,
      role: this.nextArtistRole,
    });

    this.artistAutocomplete.reset();

    if (this.pendingArtists.filter((a) => a.role === ArtistContribution.MAIN).length === 0) {
      this.nextArtistRole = ArtistContribution.MAIN;
    }
  }

  removePendingArtist(index: number): void {
    this.pendingArtists.splice(index, 1);
  }

  async onSongSelected(result: AutocompleteResult | null): Promise<void> {
    this.selectedSong = result;

    // A new song (or none selected): the user must provide the artists themselves
    if (!result || result.id === -1) {
      this.artistsLocked = false;
      this.pendingArtists = [];
      this.nextArtistRole = ArtistContribution.MAIN;
      return;
    }

    // An existing song already knows its artists: fill them in and lock the artist autocomplete
    this.artistsLocked = true;
    await this.fillArtistsFromSong(result.id);
  }

  private async fillArtistsFromSong(songId: number): Promise<void> {
    const song = await firstValueFrom(this.songsService.get(songId));
    const entries: PendingArtist[] = await Promise.all(
      song.songArtist.map(async (sa): Promise<PendingArtist> => {
        const artist = await firstValueFrom(this.artistsService.get(sa.artist));
        return {
          id: sa.artist,
          name: artist.name,
          isNew: false,
          role: sa.contribution as ArtistContribution,
        };
      }),
    );
    this.pendingArtists = entries;
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

  async isSourceValid(control: AbstractControl): Promise<null | string> {
    const source = parseUrl(control.value, true);
    return KNOWN_HOSTS.has(source.host) ? null : 'Unknown source host';
  }

  get canSubmit(): boolean {
    return this.selectedSong !== null && this.pendingArtists.length > 0;
  }

  async submitForm(): Promise<void> {
    if (!this.selectedSong || this.pendingArtists.length === 0) return;

    this.errorMessage = null;

    try {
      let songID: number;

      if (this.selectedSong.id !== -1) {
        songID = this.selectedSong.id;
      } else {
        const artistIds = await Promise.all(
          this.pendingArtists.map(async (artist) => {
            if (!artist.isNew) return artist.id;
            const created = await this.httpRequests.authenticatedPostRequest<AddArtistRequestBody, Artist>(
              'artist/add',
              { name: artist.name },
            );
            return created.id;
          }),
        );

        const primaryArtistId = artistIds[0];
        const otherContributions: [number, ArtistContribution][] = artistIds
          .slice(1)
          .map((id, i) => [id, this.pendingArtists[i + 1].role]);

        const sources = (this.songForm.value.sources as FormSource[] | undefined)?.map((s) => s.url) ?? [];

        songID = (
          await this.httpRequests.authenticatedPostRequest<AddSongRequestBody, Song>('song/add', {
            song: {
              title: this.selectedSong!.name,
              primaryArtist: primaryArtistId,
            },
            otherContributions,
            sources,
          })
        ).id;
      }

      await this.httpRequests.authenticatedPostRequest<AddSongConstitutionRequestBody>('constitution/addSong', {
        song: songID,
        constitution: this.constitution(),
      });

      this.resetForm();
    } catch (e) {
      if (e instanceof HttpErrorResponse) {
        this.errorMessage =
          e.status === 409
            ? 'This song has already been added to the constitution.'
            : typeof e.error === 'string'
              ? e.error
              : e.message;
      } else {
        this.errorMessage = 'An unexpected error occurred';
      }
    }
  }

  private resetForm(): void {
    this.selectedSong = null;
    this.pendingArtists = [];
    this.nextArtistRole = ArtistContribution.MAIN;
    this.errorMessage = null;
    this.artistsLocked = false;
    this.songForm.reset();
    this.sources.clear();
    this.songAutocomplete.reset();
    this.artistAutocomplete.reset();
  }
}
