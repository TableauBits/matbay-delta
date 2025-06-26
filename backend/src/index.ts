// index.ts
import { db } from './db';
import { songs, artists, songContributions } from './schema';

await db.insert(songs).values({ id: 1, title: 'Song 1' });
await db.insert(artists).values({ id: 1, name: 'Artist 1' });
await db.insert(songContributions).values({
  songId: 1,
  artistId: 1,
  role: 'artist',
});

const result = await db.select().from(songContributions);
console.log(result);
