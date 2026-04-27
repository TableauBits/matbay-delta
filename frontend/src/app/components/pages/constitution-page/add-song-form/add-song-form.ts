import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AddArtistRequestBody, Artist, ArtistContribution } from '../../../../../../../common/artist';
import { AddSongRequestBody, Song } from '../../../../../../../common/song';
import { AutocompleteResult, AutocompleteTextbox } from '../../../autocomplete-textbox/autocomplete-textbox';
import { Component, inject, input, ViewChild } from '@angular/core';
import { AddSongConstitutionRequestBody } from '../../../../../../../common/constitution';
import { HttpRequests } from '../../../../services/requests/http-requests';
import { Artists } from '../../../../services/artists';
import { Songs } from '../../../../services/songs';
import { KNOWN_HOSTS } from '../../../../../../../common/source';
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

  @ViewChild('artistAutocomplete') artistAutocomplete!: AutocompleteTextbox;

  songForm: FormGroup;
  selectedSong: AutocompleteResult | null = null;
  pendingArtists: PendingArtist[] = [];
  nextArtistRole: ArtistContribution = ArtistContribution.MAIN;

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

  onSongSelected(result: AutocompleteResult | null): void {
    if (!result) return;
    this.selectedSong = result;
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

    this.selectedSong = null;
    this.pendingArtists = [];
    this.nextArtistRole = ArtistContribution.MAIN;
    this.songForm.reset();
    this.sources.clear();
  }
}
