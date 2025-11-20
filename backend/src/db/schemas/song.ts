import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { artists } from "./artist";
import { relations } from "drizzle-orm";
import { songArtist } from "./songArtist";
import { songConstitution } from "./songConstitution";
import { songAlbum } from "./songAlbum";

const songs = sqliteTable(
    "songs",
    {
        id: integer("id").primaryKey(),
        creationDate: text()
            .notNull()
            .$defaultFn(() => new Date().toISOString()),

        title: text().notNull(),
        /// This column is necessary to enforce that a song as at least one artist
        primaryArtist: integer()
            .notNull()
            .references(() => artists.id),
    },
    (t) => [unique().on(t.title, t.primaryArtist)],
);

const songsRelations = relations(songs, ({one, many}) => ({
    songAlbum: many(songAlbum),                 // One song can be in multiple albums
    songArtist: many(songArtist),               // One song can have multiple artists
    songConstitution: many(songConstitution),   // One song can be added to many constitutions
}));

export { songs, songsRelations };