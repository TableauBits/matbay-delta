import { Component, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Artists } from '../../../services/artists';
import { AsyncPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Song } from '../../../../../../common/song';
import { Songs } from '../../../services/songs';
import { Sources } from '../../../services/sources';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { RedirectToArtistPage } from '../../utils/redirect-to-artist-page/redirect-to-artist-page';
import { Languages } from '../../../services/languages';
import { HttpRequests } from '../../../services/requests/http-requests';
import { SongConstitution } from '../../../../../../common/constitution';
import { RedirectToUserProfile } from '../../utils/redirect-to-user-profile/redirect-to-user-profile';
import { Users } from '../../../services/users';

@Component({
  selector: 'app-song-page',
  imports: [AsyncPipe, RedirectToArtistPage, RedirectToUserProfile],
  templateUrl: './song-page.html',
  styleUrl: './song-page.scss',
})
export class SongPage implements OnDestroy {
  // Service injections
  private activatedRoute = inject(ActivatedRoute);
  private titleService = inject(Title);
  private songs = inject(Songs);
  private httpRequests = inject(HttpRequests);

  artists = inject(Artists);
  users = inject(Users);
  sources = inject(Sources);
  languages = inject(Languages);

  private subscriptions: Subscription = new Subscription();

  song = signal<Song | undefined>(undefined);
  participations = signal<SongConstitution[]>([]);
  error = signal<HttpErrorResponse | undefined>(undefined);

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  constructor() {
    // Get the song from the route
    this.activatedRoute.params.subscribe((params) => {
      const id = parseInt(params['id'], 10);
      this.participations.set([]);
      this.httpRequests
        .authenticatedGetRequest<SongConstitution[]>(`song/participate/${id}`)
        .then((participations) => this.participations.set(participations))
        .catch((err) => console.error(`failed to get participations for song ${id}`, err));

      const subscription = this.songs.get(id).subscribe({
        next: (data) => {
          this.song.set(data);
          if (data) this.titleService.setTitle(data.title);
        },
        error: (err) => {
          this.error.set(err);
        },
      });
      this.subscriptions.add(subscription);
    });
  }
}
