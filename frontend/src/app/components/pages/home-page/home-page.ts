import { Component, inject, OnDestroy } from '@angular/core';
import { User } from '../../../../../../common/user';
import { Observable, Subscription } from 'rxjs';
import { Users } from '../../../services/users';
import { CurrentUserForm } from '../../current-user-form/current-user-form';
import { ConstitutionForm } from '../../constitution-form/constitution-form';
import { Constitutions } from '../../../services/constitutions';
import { Artists } from '../../../services/artists';
import { Songs } from '../../../services/songs';
import { Song } from '../../../../../../common/song';
import { Constitution } from '../../../../../../common/constitution';
import { ArtistContributionType } from '../../../../../../common/artist';
import { AsyncPipe } from '@angular/common';
import { AddSongForm } from '../../add-song-form/add-song-form';

@Component({
  selector: 'app-home-page',
  imports: [AsyncPipe, AddSongForm, CurrentUserForm, ConstitutionForm],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnDestroy {
  // Service injections
  artists = inject(Artists);
  constitutions = inject(Constitutions);
  songs = inject(Songs);
  users = inject(Users);

  // Observable of the current user data
  private currentUserObs: Promise<Observable<User> | undefined>;
  private subscriptions: Subscription = new Subscription();
  currentUser: User | undefined;

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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getSongArtists(song: Song | null): { artist: number; contribution: ArtistContributionType }[] {
    if (!song) return [];
    return song.songArtist;
  }

  getMaxNSongs(constitution: Constitution): number {
    return constitution.nSongs * constitution.userConstitution.length;
  }

  getUserSongCount(constitution: Constitution, uid: string | undefined): number {
    if (!uid) return 0;
    return constitution.songConstitution.filter((s) => s.user === uid).length;
  }
}
