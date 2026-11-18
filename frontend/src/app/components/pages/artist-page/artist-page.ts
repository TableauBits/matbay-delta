import { Component, inject, OnDestroy, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Artists } from '../../../services/artists';
import { Artist } from '../../../../../../common/artist';
import { HttpErrorResponse } from '@angular/common/http';
import { SongArtist } from '../../../../../../common/song';
import { Songs } from '../../../services/songs';
import { RedirectToSongPage } from '../../utils/redirect-to-song-page/redirect-to-song-page';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-artist-page',
  imports: [AsyncPipe, RedirectToSongPage],
  templateUrl: './artist-page.html',
})
export class ArtistPage implements OnDestroy {
  // Service injections
  private activatedRoute = inject(ActivatedRoute);
  private titleService = inject(Title);
  private artists = inject(Artists);
  songs = inject(Songs);

  private subscriptions: Subscription = new Subscription();

  artist = signal<Artist | undefined>(undefined);
  songArtists = signal<SongArtist[] | undefined>(undefined);
  error = signal<HttpErrorResponse | undefined>(undefined);

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  constructor() {
    this.activatedRoute.params.subscribe((params) => {
      const id = parseInt(params['id'], 10);
      const subscription = this.artists.get(id).subscribe({
        next: (data) => {
          this.artist.set(data);
          if (data) this.titleService.setTitle(data.name);

          this.artists
            .getSongsByArtist(id)
            .then((s) => {
              this.songArtists.set(s);
            })
            .catch((err) => {
              this.error.set(err);
            });
        },
        error: (err) => {
          this.error.set(err);
        },
      });

      this.subscriptions.add(subscription);
    });
  }
}
