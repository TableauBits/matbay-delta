// schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Songs table
export const songs = sqliteTable('songs', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
});

// Artists table
export const artists = sqliteTable('artists', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
});

// Song contributions (many-to-many with role)
export const songContributions = sqliteTable('song_contributions', {
  songId: integer('song_id')
    .notNull()
    .references(() => songs.id, { onDelete: 'cascade' }),
  artistId: integer('artist_id')
    .notNull()
    .references(() => artists.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),

  // Composite PK simulation: you can handle conflicts manually if needed
});
