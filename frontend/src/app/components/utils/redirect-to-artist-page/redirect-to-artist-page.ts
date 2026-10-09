import { Component, inject, input } from '@angular/core';
import { Artist } from '../../../../../../common/artist';
import { Router } from '@angular/router';

@Component({
  selector: 'app-redirect-to-artist-page',
  imports: [],
  templateUrl: './redirect-to-artist-page.html',
  styleUrl: './redirect-to-artist-page.scss',
})
export class RedirectToArtistPage {
  artist = input<Artist | null>();

  private router = inject(Router);

  redirectToPage(id: number): void {
    this.router.navigate(['/artists', id]);
  }
}
