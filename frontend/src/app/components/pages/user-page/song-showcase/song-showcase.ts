import { Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Song } from '../../../../../../../common/song';
import { Users } from '../../../../services/users';
import { Songs } from '../../../../services/songs';
import { Artists } from '../../../../services/artists';
import { Sources } from '../../../../services/sources';

interface ShowcaseItem {
  id: number;
  song: Song;
  artistName: string;
}

@Component({
  selector: 'app-song-showcase',
  imports: [RouterLink],
  templateUrl: './song-showcase.html',
})
export class SongShowcase {
  uid = input.required<string>();
  editable = input(false);

  private users = inject(Users);
  private songs = inject(Songs);
  private artists = inject(Artists);
  sources = inject(Sources);

  items = signal<ShowcaseItem[]>([]);
  loading = signal(true);
  error = signal('');
  removing = signal<Set<number>>(new Set());
  private reload = signal(0);

  constructor() {
    effect((onCleanup) => {
      const uid = this.uid();
      this.reload();
      let active = true;
      onCleanup(() => {
        active = false;
      });
      this.items.set([]);
      this.loading.set(true);
      this.error.set('');
      this.removing.set(new Set());

      this.users
        .getShowcase(uid)
        .then((entries) =>
          Promise.all(
            entries.map(async (entry) => {
              const song = await firstValueFrom(this.songs.get(entry.song));
              const artist = await firstValueFrom(this.artists.get(song.primaryArtist));
              return { id: entry.id, song, artistName: artist.name };
            }),
          ),
        )
        .then((items) => {
          if (active) this.items.set(items);
        })
        .catch(() => {
          if (active) this.error.set('Unable to load this showcase.');
        })
        .finally(() => {
          if (active) this.loading.set(false);
        });
    });
  }

  retry(): void {
    this.reload.update((value) => value + 1);
  }

  async remove(id: number): Promise<void> {
    if (!this.editable() || this.removing().has(id)) return;
    const uid = this.uid();
    this.removing.update((ids) => new Set([...ids, id]));
    this.error.set('');
    try {
      await this.users.deleteSongShowcase(id);
      if (this.uid() === uid) this.items.update((items) => items.filter((item) => item.id !== id));
    } catch {
      if (this.uid() === uid) this.error.set('Unable to remove this song. Please try again.');
    } finally {
      if (this.uid() === uid)
        this.removing.update((ids) => {
          const next = new Set(ids);
          next.delete(id);
          return next;
        });
    }
  }
}
