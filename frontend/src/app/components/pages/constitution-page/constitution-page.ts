import { Component, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Constitutions } from '../../../services/constitutions';
import { Constitution } from '../../../../../../common/constitution';
import { AsyncPipe } from '@angular/common';
import { Users } from '../../../services/users';
import { Songs } from '../../../services/songs';
import { Artists } from '../../../services/artists';
import { Song } from '../../../../../../common/song';
import { ArtistContributionType } from '../../../../../../common/artist';
import { Observable, Subscription } from 'rxjs';
import { AddSongForm } from '../../add-song-form/add-song-form';
import { User } from '../../../../../../common/user';

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

  // routeConstitutionID = signal(-1);

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
      // this.routeConstitutionID.set(params['id']);
      // TODO : handle undefined constitution
      // TODO : convert the param id to number safely
      this.constitution = this.constitutions.get(Number(params['id']));
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
}
