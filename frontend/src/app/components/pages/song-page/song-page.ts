import { Component, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { Song } from '../../../../../../common/song';
import { Songs } from '../../../services/songs';
import { Subscription } from 'rxjs';
import { Sources } from '../../../services/sources';
import { Artists } from '../../../services/artists';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-song-page',
  imports: [AsyncPipe],
  templateUrl: './song-page.html',
  styleUrl: './song-page.scss',
})
export class SongPage implements OnDestroy {
  // Service injections
  private activatedRoute = inject(ActivatedRoute);
  private titleService = inject(Title);
  private songs = inject(Songs);

  artists = inject(Artists);
  sources = inject(Sources);

  private subscriptions: Subscription = new Subscription();

  song: Song | undefined;
  error: HttpErrorResponse | undefined;

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  constructor() {
    // Get the song from the route
    this.activatedRoute.params.subscribe((params) => {
      const id = parseInt(params['id'], 10);
      const subscription = this.songs.get(id).subscribe({
        next: (data) => {
          this.song = data;
          if (this.song) this.titleService.setTitle(this.song.title);
        },
        error: (err) => {
          this.error = err;
        }
      });
      this.subscriptions.add(subscription);
    });
  }
}
