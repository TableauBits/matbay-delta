import { Component, OnDestroy, inject } from '@angular/core';
import { Constitution, SongConstitution, UserConstitution } from '../../../../../../common/constitution';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AddSongForm } from '../../add-song-form/add-song-form';
import { ArtistContributionType } from '../../../../../../common/artist';
import { Artists } from '../../../services/artists';
import { AsyncPipe } from '@angular/common';
import { Constitutions } from '../../../services/constitutions';
import { HttpErrorResponse } from '@angular/common/http';
import { Song } from '../../../../../../common/song';
import { Songs } from '../../../services/songs';
import { User } from '../../../../../../common/user';
import { Users } from '../../../services/users';

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
  private activatedRoute = inject(ActivatedRoute);
  artists = inject(Artists);
  constitutions = inject(Constitutions);
  users = inject(Users);
  songs = inject(Songs);

  private subscriptions: Subscription = new Subscription();

  // Observable of the constitution data
  private constitutionObs: Observable<Constitution | undefined> | undefined;
  constitution: Constitution | undefined;
  constitutionError: HttpErrorResponse | undefined;

  // Observable of the current user data
  private currentUserObs: Promise<Observable<User> | undefined>;
  currentUser: User | undefined;

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  constructor() {
    // Get the constitution from the route
    this.activatedRoute.params.subscribe((params) => {
      const cstId = parseInt(params['id'], 10);

      this.constitutionObs = this.constitutions.get(cstId);
      const subscription = this.constitutionObs.subscribe({
        next: (data) => {
          this.constitution = data;
        },
        error: (err) => {
          this.constitutionError = err;
        },
      });
      this.subscriptions.add(subscription);
    });

    // Get the current user info
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
