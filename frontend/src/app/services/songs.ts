import { inject, Injectable } from '@angular/core';
import { HttpRequests } from './http-requests';
import { Song } from '../../../../common/song';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Songs {
  private httpRequests = inject(HttpRequests);

  // Cache of song data to avoid redundant requests
  private songs = new Map<number, ReplaySubject<Song>>();

  getSong(id: number): Observable<Song> {
    // Check if we already have the requested song
    const song = this.songs.get(id);
    if (song) return song.asObservable();
    
    // Else get data from the server
    const newSong = new ReplaySubject<Song>(1)
    this.songs.set(id, newSong);

    // Update the cache when the request is completed
    // Delete the entry in the map in case of an error
    this.httpRequests.authenticatedGetRequest<Song>(`song/get/${id}`).then(song => {
      newSong.next(song);
    }).catch(error => {
      console.log(`failed to get song ${id}`, error);
      newSong.error(error);
      this.songs.delete(id);
    })

    return newSong.asObservable();
  }

  // TODO : add a method to update the cache with an array of songs when requesting a constitution ?
  // addSongs(ids: number[]): void {}
}
