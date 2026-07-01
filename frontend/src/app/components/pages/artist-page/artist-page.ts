import { Component, inject, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Artists } from '../../../services/artists';
import { Artist } from '../../../../../../common/artist';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-artist-page',
  imports: [],
  templateUrl: './artist-page.html',
  styleUrl: './artist-page.scss',
})
export class ArtistPage implements OnDestroy {
  // Service injections
  private activatedRoute = inject(ActivatedRoute);
  private titleService = inject(Title);
  private artists = inject(Artists);

  private subscriptions: Subscription = new Subscription();

  artist: Artist | undefined;
  error: HttpErrorResponse | undefined;

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  constructor() {
    this.activatedRoute.params.subscribe((params) => {
      const id = parseInt(params['id'], 10);
      const subscription = this.artists.get(id).subscribe({
        next: (data) => {
          this.artist = data;
          if (this.artist) this.titleService.setTitle(this.artist.name);
        },
        error: (err) => {
          this.error = err;
        },
      });

      this.subscriptions.add(subscription);
    })
  }
}
