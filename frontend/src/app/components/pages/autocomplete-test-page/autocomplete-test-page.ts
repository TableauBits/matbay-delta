import { Component, inject } from '@angular/core';
import { AutocompleteResult, AutocompleteTextbox } from '../../autocomplete-textbox/autocomplete-textbox';
import { Artists } from '../../../services/artists';
import { Songs } from '../../../services/songs';

@Component({
  selector: 'app-autocomplete-test-page',
  imports: [AutocompleteTextbox],
  templateUrl: './autocomplete-test-page.html',
  styleUrl: './autocomplete-test-page.scss',
})
export class AutocompleteTestPage {
  private artists = inject(Artists);
  private songs = inject(Songs);

  selectedSong: AutocompleteResult | null = null;
  selectedArtist: AutocompleteResult | null = null;

  searchSongs(query: string): Promise<AutocompleteResult[]> {
    return this.songs.search(query);
  }

  searchArtists(query: string): Promise<AutocompleteResult[]> {
    return this.artists.search(query);
  }

  onSongSelected(result: AutocompleteResult | null): void {
    this.selectedSong = result;
  }

  onArtistSelected(result: AutocompleteResult | null): void {
    this.selectedArtist = result;
  }
}
