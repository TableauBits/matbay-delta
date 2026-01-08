import { Injectable, inject } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { Artist } from '../../../../common/artist';
import { HttpRequests } from './http-requests';

@Injectable({
  providedIn: 'root',
})
export class Artists {
  private httpRequests = inject(HttpRequests);

  private artists = new Map<number, ReplaySubject<Artist>>();

  get(id: number): Observable<Artist> {
    // Check if we already have the requested artist
    const artist = this.artists.get(id);
    if (artist) return artist.asObservable();

    // Else get data from the server
    const newArtist = new ReplaySubject<Artist>(1);
    this.artists.set(id, newArtist);

    // Update the cache when the request is completed
    // Delete the entry in the map in case of an error
    this.httpRequests
      .authenticatedGetRequest<Artist>(`artist/get/${id}`)
      .then((song) => {
        newArtist.next(song);
      })
      .catch((error) => {
        console.log(`failed to get artist ${id}`, error);
        newArtist.error(error);
        this.artists.delete(id);
      });

    return newArtist.asObservable();
  }
}
