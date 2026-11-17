import { Component, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CurrentUserForm } from './current-user-form/current-user-form';
import { AsyncPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { User, UserSongShowcase } from '../../../../../../common/user';
import { UserStats } from '../../../../../../common/stat';
import { Users } from '../../../services/users';
import { HttpRequests } from '../../../services/requests/http-requests';
import { Songs } from '../../../services/songs';
import { Artists } from '../../../services/artists';
import { Sources } from '../../../services/sources';
import { Song } from '../../../../../../common/song';
import { RedirectToSongPage } from '../../utils/redirect-to-song-page/redirect-to-song-page';

@Component({
  selector: 'app-user-page',
  imports: [AsyncPipe, CurrentUserForm, DatePipe, RedirectToSongPage],
  templateUrl: './user-page.html',
})
export class UserPage implements OnDestroy {
  // Service injections
  private activatedRoute = inject(ActivatedRoute);
  private httpRequests = inject(HttpRequests);
  private titleService = inject(Title);
  private users = inject(Users);

  songs = inject(Songs);
  artists = inject(Artists);
  sources = inject(Sources);

  private subscriptions: Subscription = new Subscription();
  private showcaseSubscription?: Subscription;

  // Observable of the user data
  user = signal<User | undefined>(undefined);
  userError = signal<HttpErrorResponse | undefined>(undefined);
  isCurrentUser = signal(false);
  stats = signal<UserStats | undefined>(undefined);
  showcase = signal<UserSongShowcase[] | undefined>(undefined);
  removingShowcase = signal<number | undefined>(undefined);

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.showcaseSubscription?.unsubscribe();
  }

  getThumbnailURL(song: Song): string | undefined {
    const source = song.songSource.at(0);
    return source ? this.sources.getImageURL(source) : undefined;
  }

  async removeFromShowcase(showcaseId: number): Promise<void> {
    this.removingShowcase.set(showcaseId);
    await this.users.removeSongFromShowcase(showcaseId);
    this.removingShowcase.set(undefined);
  }

  constructor() {
    // Get the user from the route
    this.activatedRoute.params.subscribe((params) => {
      const handle = params['handle'];
      this.users.getFromHandle(handle).then((obs) => {
        const subscription = obs.subscribe({
          next: (data) => {
            this.user.set(data);
            this.titleService.setTitle(data.displayName);

            this.showcaseSubscription?.unsubscribe();
            this.showcase.set(undefined);
            this.showcaseSubscription = this.users.getShowcase(data.id).subscribe({
              next: (showcase) => this.showcase.set(showcase),
              error: (err) => console.error(`failed to get showcase of user ${data.id}`, err),
            });
            this.httpRequests.authenticatedGetRequest<UserStats>(`stat/get/${data.id}`).then((stats) => {
              this.stats.set(stats);
            });
          },
          error: (err) => {
            this.userError.set(err);
          },
        });

        this.subscriptions.add(subscription);
      });

      this.users.getCurrentUser().then((currentUser) => {
        const subscription = currentUser.subscribe((user) => {
          this.isCurrentUser.set(user.handle === handle);
        });
        this.subscriptions.add(subscription);
      });
    });
  }
}
