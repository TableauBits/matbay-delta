import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddArtistRequestBody, Artist, ArtistContribution } from '../../../../../../../common/artist';
import { AddSongRequestBody, Song } from '../../../../../../../common/song';
import { AutocompleteResult, AutocompleteTextbox } from '../../../autocomplete-textbox/autocomplete-textbox';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal, ViewChild } from '@angular/core';
import { AddSongConstitutionRequestBody } from '../../../../../../../common/constitution';
import { FormsModule } from '@angular/forms';
import { HttpRequests } from '../../../../services/requests/http-requests';
import { Artists } from '../../../../services/artists';
import { Songs } from '../../../../services/songs';
import { KNOWN_HOSTS } from '../../../../../../../common/source';
import { firstValueFrom } from 'rxjs';
import parseUrl from 'parse-url';
import { Languages } from '../../../../services/languages';

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
  private languagesService = inject(Languages);

  constitution = input.required<number>();

  @ViewChild('songAutocomplete') songAutocomplete!: AutocompleteTextbox<number>;
  @ViewChild('artistAutocomplete') artistAutocomplete!: AutocompleteTextbox<number>;
  @ViewChild('languageAutocomplete') languageAutocomplete!: AutocompleteTextbox<string>;

  songForm: FormGroup;
  selectedSong = signal<AutocompleteResult<number> | null>(null);
  pendingArtists = signal<PendingArtist[]>([]);
  nextArtistRole = signal<ArtistContribution>(ArtistContribution.MAIN);
  errorMessage = signal<string | null>(null);
  formLocked = signal(false);

  pendingLanguages = signal<string[]>([]);

  constructor() {
    this.songForm = this.formBuilder.group({
      sources: this.formBuilder.array([]),
    });
  }

  get sources(): FormArray<FormGroup> {
    return this.songForm.get('sources') as FormArray;
  }

  getLanguageName(code: string): string {
    return this.languagesService.getLanguageName(code);
  }

  getContributions(): string[] {
    return Object.values(ArtistContribution);
  }

  searchArtists(query: string): Promise<AutocompleteResult<number>[]> {
    return this.artistsService.search(query);
  }

  searchSongs(query: string): Promise<AutocompleteResult<number>[]> {
    return this.songsService.search(query);
  }

  searchLanguages(query: string): Promise<AutocompleteResult<string>[]> {
    const lowerQuery = query.toLowerCase();
    const results = this.languagesService
      .getLanguages()
      .filter((lang) => lang.name.toLowerCase().includes(lowerQuery))
      .map((lang) => ({ id: lang.code, name: lang.name }));
    return Promise.resolve(results);
  }

  onArtistSelected(result: AutocompleteResult<number> | null): void {
    if (!result) return;

    this.pendingArtists.update((artists) => [
      ...artists,
      {
        id: result.id ?? -1,
        name: result.name,
        isNew: result.id === null,
        role: this.nextArtistRole(),
      },
    ]);

    this.artistAutocomplete.reset();

    if (this.pendingArtists().filter((a) => a.role === ArtistContribution.MAIN).length === 0) {
      this.nextArtistRole.set(ArtistContribution.MAIN);
    }
  }

  removePendingArtist(index: number): void {
    this.pendingArtists.update((artists) => artists.filter((_, i) => i !== index));
  }

  removePendingLanguage(index: number): void {
    this.pendingLanguages.update((languages) => languages.filter((_, i) => i !== index));
  }

  async onSongSelected(result: AutocompleteResult<number> | null): Promise<void> {
    this.selectedSong.set(result);

    // A new song (or none selected): the user must provide the artists themselves
    if (!result || result.id === null) {
      this.formLocked.set(false);
      this.pendingArtists.set([]);
      this.nextArtistRole.set(ArtistContribution.MAIN);
      return;
    }

    // An existing song already knows its artists: fill them in and lock the artist autocomplete
    this.formLocked.set(true);
    await this.fillFormFromSong(result.id);
  }

  onLanguageSelected(result: AutocompleteResult<string> | null): void {
    if (!result || result.id === null) return;
    this.pendingLanguages.update((languages) => [...languages, result.id!]);

    this.languageAutocomplete.reset();
  }

  private async fillFormFromSong(songId: number): Promise<void> {
    const song = await firstValueFrom(this.songsService.get(songId));

    this.pendingArtists.set(
      await Promise.all(
        song.songArtist.map(async (sa): Promise<PendingArtist> => {
          const artist = await firstValueFrom(this.artistsService.get(sa.artist));
          return {
            id: sa.artist,
            name: artist.name,
            isNew: false,
            role: sa.contribution as ArtistContribution,
          };
        }),
      ),
    );

    this.pendingLanguages.set(song.songLanguage);
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
    return this.selectedSong() !== null && this.pendingArtists().length > 0;
  }

  async submitForm(): Promise<void> {
    const selectedSong = this.selectedSong();
    const pendingArtists = this.pendingArtists();
    const pendingLanguages = this.pendingLanguages();
    if (!selectedSong || pendingArtists.length === 0) return;

    this.errorMessage.set(null);

    try {
      let songID: number;

      if (selectedSong.id !== null) {
        songID = selectedSong.id;
      } else {
        const artistIds = await Promise.all(
          pendingArtists.map(async (artist) => {
            if (!artist.isNew) return artist.id;
            const created = await this.httpRequests.authenticatedPostRequest<AddArtistRequestBody, Artist>(
              'artist/add',
              { artist: { name: artist.name }, countries: [] },
            );
            return created.id;
          }),
        );

        const primaryArtistId = artistIds[0];
        const otherContributions: [number, ArtistContribution][] = artistIds
          .slice(1)
          .map((id, i) => [id, pendingArtists[i + 1].role]);

        const sources = (this.songForm.value.sources as FormSource[] | undefined)?.map((s) => s.url) ?? [];

        songID = (
          await this.httpRequests.authenticatedPostRequest<AddSongRequestBody, Song>('song/add', {
            song: {
              title: selectedSong.name,
              primaryArtist: primaryArtistId,
            },
            otherContributions,
            sources,
            languages: pendingLanguages,
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
        this.errorMessage.set(
          e.status === 409
            ? 'This song has already been added to the constitution.'
            : typeof e.error === 'string'
              ? e.error
              : e.message,
        );
      } else {
        this.errorMessage.set('An unexpected error occurred');
      }
    }
  }

  private resetForm(): void {
    this.selectedSong.set(null);
    this.pendingArtists.set([]);
    this.pendingLanguages.set([]);
    this.nextArtistRole.set(ArtistContribution.MAIN);
    this.errorMessage.set(null);
    this.formLocked.set(false);
    this.songForm.reset();
    this.sources.clear();
    this.songAutocomplete.reset();
    this.artistAutocomplete.reset();
    this.languageAutocomplete.reset();
  }
}
