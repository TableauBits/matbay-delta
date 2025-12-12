import { Component, OnDestroy, inject } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AddSongForm } from './components/add-song-form/add-song-form';
import { ArtistContributionType } from '../../../common/artist';
import { Artists } from './services/artists';
import { CommonModule } from '@angular/common';
import { ConstitutionForm } from './components/constitution-form/constitution-form';
import { Constitutions } from './services/constitutions';
import { CurrentUserForm } from './components/current-user-form/current-user-form';
import { DeltaAuth } from './services/delta-auth';
import { Song } from '../../../common/song';
import { Songs } from './services/songs';
import { User } from '../../../common/user';
import { Users } from './services/users';
import { Constitution } from '../../../common/constitution';

@Component({
  selector: 'app-root',
  imports: [CommonModule, CurrentUserForm, ConstitutionForm, AddSongForm],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnDestroy {
  // Service injections
  constitutions = inject(Constitutions);
  deltaAuth = inject(DeltaAuth);
  songs = inject(Songs);
  users = inject(Users);
  artists = inject(Artists);

  // Observable of the current user data
  private currentUserObs: Promise<Observable<User> | undefined>;
  private subscriptions: Subscription = new Subscription();

  currentUser: User | undefined;

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  constructor() {
    this.currentUserObs = this.users.getCurrentUser();

    this.currentUserObs.then((userObs) => {
      if (!userObs) return;

      const subscription = userObs.subscribe((user) => {
        this.currentUser = user;
      });
      this.subscriptions.add(subscription);
    });
  }

  getSongArtists(song: Song | null): { artist: number; contribution: ArtistContributionType }[] {
    if (!song) return [];
    return song.songArtist;
  }

  getMaxNSongs(constitution: Constitution): number {
    return constitution.nSongs * constitution.userConstitution.length;
  }
}
