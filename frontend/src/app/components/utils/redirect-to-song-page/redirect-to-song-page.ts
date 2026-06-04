import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { Song } from '../../../../../../common/song';

@Component({
  selector: 'app-redirect-to-song-page',
  imports: [],
  templateUrl: './redirect-to-song-page.html',
  styleUrl: './redirect-to-song-page.scss',
})
export class RedirectToSongPage {
  song = input<Song | null>();

  private router = inject(Router);

  redirectToSongPage(id: number): void {
    this.router.navigate(["/songs", id]);
  }
}
