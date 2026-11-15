import { Component, effect, inject, input, signal } from '@angular/core';
import { Users } from '../../../../services/users';
import { DeltaAuth } from '../../../../services/delta-auth';

@Component({
  selector: 'app-showcase-button',
  templateUrl: './showcase-button.html',
})
export class ShowcaseButton {
  songId = input.required<number>();
  private users = inject(Users);
  private auth = inject(DeltaAuth);
  loading = signal(true);
  adding = signal(false);
  showcased = signal(false);
  error = signal('');
  private reload = signal(0);

  constructor() {
    effect((onCleanup) => {
      const songId = this.songId();
      this.reload();
      let active = true;
      onCleanup(() => {
        active = false;
      });
      this.loading.set(true);
      this.showcased.set(false);
      this.error.set('');
      this.auth
        .getUid()
        .then((uid) => this.users.getShowcase(uid))
        .then((entries) => {
          if (active) this.showcased.set(entries.some((entry) => entry.song === songId));
        })
        .catch(() => {
          if (active) this.error.set('Unable to check your showcase.');
        })
        .finally(() => {
          if (active) this.loading.set(false);
        });
    });
  }

  retry(): void {
    this.reload.update((value) => value + 1);
  }

  async add(): Promise<void> {
    if (this.loading() || this.adding() || this.showcased()) return;
    const songId = this.songId();
    this.adding.set(true);
    this.error.set('');
    try {
      await this.users.addSongShowcase(songId);
      if (this.songId() === songId) this.showcased.set(true);
    } catch {
      if (this.songId() === songId) this.error.set('Unable to showcase this song. Please try again.');
    } finally {
      this.adding.set(false);
    }
  }
}
