import { Component, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Constitutions } from '../../../services/constitutions';
import { Constitution, SongConstitution, UserConstitution } from '../../../../../../common/constitution';
import { AsyncPipe } from '@angular/common';
import { Users } from '../../../services/users';
import { Songs } from '../../../services/songs';
import { Artists } from '../../../services/artists';
import { Song } from '../../../../../../common/song';
import { ArtistContributionType } from '../../../../../../common/artist';
import { Observable, Subscription } from 'rxjs';
import { AddSongForm } from '../../add-song-form/add-song-form';
import { User } from '../../../../../../common/user';

function sortByJoinDate(a: { joinDate: string }, b: { joinDate: string }): number {
  if (a.joinDate === b.joinDate) return 0;
  return a.joinDate < b.joinDate ? -1 : 1;
}

function sortByAddDate(a: { addDate: string }, b: { addDate: string }): number {
  if (a.addDate === b.addDate) return 0;
  return a.addDate < b.addDate ? -1 : 1;
}

@Component({
  selector: 'app-constitution-page',
  imports: [AsyncPipe, AddSongForm],
  templateUrl: './constitution-page.html',
  styleUrl: './constitution-page.scss',
})
export class ConstitutionPage implements OnDestroy {
  // Service injections
  artists = inject(Artists);
  private activatedRoute = inject(ActivatedRoute);
  constitutions = inject(Constitutions);
  users = inject(Users);
  songs = inject(Songs);

  constitution: Constitution | undefined;

  // Observable of the current user data
  private currentUserObs: Promise<Observable<User> | undefined>;
  private subscriptions: Subscription = new Subscription();
  currentUser: User | undefined;

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  constructor() {
    this.activatedRoute.params.subscribe((params) => {
      // TODO : handle undefined constitution
      const cstId = parseInt(params['id'], 10);
      this.constitution = this.constitutions.get(cstId);
    });

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

  getUserSongCount(constitution: Constitution, uid: string | undefined): number {
    if (!uid) return 0;
    return constitution.songConstitution.filter((s) => s.user === uid).length;
  }

  getUsers(): UserConstitution[] {
    if (!this.constitution) return [];

    // Sort users by join date
    const users = this.constitution.userConstitution;
    users.sort((a, b) => sortByJoinDate(a, b));

    return users;
  }

  getSongs(): SongConstitution[] {
    if (!this.constitution) return [];

    // Sort songs by add date
    const songs = this.constitution.songConstitution;
    songs.sort((a, b) => sortByAddDate(a, b));

    return songs;
  }
}
