import { Injectable, inject } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import {
  User,
  UserAddArtistShowcaseRequestBody,
  UserAddSongShowcaseRequestBody,
  UserIdResponse,
  UserShowcase,
  UserUpdateRequestBody,
} from '../../../../common/user';
import { DeltaAuth } from './delta-auth';
import { HttpRequests } from './requests/http-requests';
import { SnackbarService } from './snackbar';

@Injectable({
  providedIn: 'root',
})
export class Users {
  // Service injections
  private deltaAuth = inject(DeltaAuth);
  private httpRequests = inject(HttpRequests);
  private snackbar = inject(SnackbarService);

  // Cache of user data to avoid redundant requests
  private users = new Map<string, ReplaySubject<User>>();

  // Cache of showcases, by uid
  private showcases = new Map<string, ReplaySubject<UserShowcase>>();

  // Indices
  /// handle => uid
  private handleIndex = new Map<string, string>();

  get(uid: string): Observable<User> {
    // Check if we already have the requested user
    const user = this.users.get(uid);
    if (user) return user.asObservable();

    // Else get data from the server
    const newUser = new ReplaySubject<User>(1);
    this.users.set(uid, newUser);

    this.httpRequests
      .authenticatedGetRequest<User>(`user/get/${uid}`)
      .then((user) => {
        this.handleIndex.set(user.handle, user.id);
        newUser.next(user);
      })
      .catch((error) => {
        newUser.error(error);
      });

    return newUser.asObservable();
  }

  async getFromHandle(handle: string): Promise<Observable<User>> {
    let uid = this.handleIndex.get(handle);
    if (!uid) {
      uid = (await this.httpRequests.authenticatedGetRequest<UserIdResponse>(`user/uid-from-handle/${handle}`)).id;
    }

    return this.get(uid);
  }

  async getCurrentUser(): Promise<Observable<User>> {
    const uid = await this.deltaAuth.getUid();
    return this.get(uid);
  }

  async updateCurrentUserInfo(userInfo: UserUpdateRequestBody): Promise<void> {
    const uid = await this.deltaAuth.getUid();

    this.httpRequests
      .authenticatedPostRequest<UserUpdateRequestBody, User>(`user/update`, userInfo)
      .then((updatedUser) => {
        const userSubject = this.users.get(uid);
        if (userSubject) userSubject.next(updatedUser);
        this.snackbar.showSuccess('Informations mises à jour');
      })
      .catch((error) => {
        console.error('failed to update user info', error);
        this.snackbar.showError('Échec de la mise à jour des informations');
      });
  }

  getShowcase(uid: string): Observable<UserShowcase> {
    let showcase = this.showcases.get(uid);
    if (!showcase) {
      showcase = new ReplaySubject<UserShowcase>(1);
      this.showcases.set(uid, showcase);
      this.refreshShowcase(uid);
    }

    return showcase.asObservable();
  }

  async addSongToShowcase(songId: number): Promise<void> {
    const uid = await this.deltaAuth.getUid();

    try {
      await this.httpRequests.authenticatedPostRequest<UserAddSongShowcaseRequestBody>(`user/song-showcase`, {
        songs: [songId],
      });
      this.snackbar.showSuccess('Chanson ajoutée à la vitrine');
    } catch (error) {
      console.error(`failed to add song ${songId} to showcase`, error);
      this.snackbar.showError("Échec de l'ajout de la chanson à la vitrine");
    }

    await this.refreshShowcase(uid);
  }

  async removeSongFromShowcase(showcaseId: number): Promise<void> {
    const uid = await this.deltaAuth.getUid();

    try {
      await this.httpRequests.authenticatedDeleteRequest(`user/song-showcase/${showcaseId}`);
      this.snackbar.showSuccess('Chanson retirée de la vitrine');
    } catch (error) {
      console.error(`failed to remove showcase ${showcaseId}`, error);
      this.snackbar.showError('Échec du retrait de la chanson de la vitrine');
    }

    await this.refreshShowcase(uid);
  }

  async addArtistToShowcase(artistId: number): Promise<void> {
    const uid = await this.deltaAuth.getUid();

    try {
      await this.httpRequests.authenticatedPostRequest<UserAddArtistShowcaseRequestBody>(`user/artist-showcase`, {
        artists: [artistId],
      });
      this.snackbar.showSuccess('Artiste ajouté à la vitrine');
    } catch (error) {
      console.error(`failed to add artist ${artistId} to showcase`, error);
      this.snackbar.showError("Échec de l'ajout de l'artiste à la vitrine");
    }

    await this.refreshShowcase(uid);
  }

  async removeArtistFromShowcase(showcaseId: number): Promise<void> {
    const uid = await this.deltaAuth.getUid();

    try {
      await this.httpRequests.authenticatedDeleteRequest(`user/artist-showcase/${showcaseId}`);
      this.snackbar.showSuccess('Artiste retiré de la vitrine');
    } catch (error) {
      console.error(`failed to remove showcase ${showcaseId}`, error);
      this.snackbar.showError('Échec du retrait de la vitrine');
    }

    await this.refreshShowcase(uid);
  }

  private async refreshShowcase(uid: string): Promise<void> {
    let showcase = this.showcases.get(uid);
    if (!showcase) {
      showcase = new ReplaySubject<UserShowcase>(1);
      this.showcases.set(uid, showcase);
    }

    try {
      showcase.next(await this.httpRequests.authenticatedGetRequest<UserShowcase>(`user/get-showcase/${uid}`));
    } catch (error) {
      // Never error or evict the cached subject: subscribers would be cut off for good and
      // miss every later refresh. Keep the last known value; the next refresh will recover.
      console.error(`failed to get showcase of user ${uid}`, error);
      this.snackbar.showError('Échec du chargement de la vitrine');
    }
  }
}
